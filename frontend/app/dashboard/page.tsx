'use client';

import {
  useEffect,
  useState,
  useCallback,
  type FormEvent,
} from 'react';
import {
  api,
  getAuthToken,
  removeAuthToken,
} from '../../lib/api';
import {
  LayoutDashboard,
  Box,
  Users,
  Truck,
  ClipboardList,
  CreditCard,
  Receipt,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  Search,
  Download,
  Edit2,
  Trash2,
} from 'lucide-react';

/* ─────────────────────────── HELPERS ─────────────────────────── */
const money = (n: number | string | null | undefined) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)) + ' FCFA';
const num = (v: unknown) => Number(v) || 0;
const dateStr = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const todayISO = () => new Date().toISOString().slice(0, 10);

type Section =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'customers'
  | 'suppliers'
  | 'shipments'
  | 'payments'
  | 'expenses'
  | 'reports'
  | 'settings';

/* ─────────────────────────── BADGE ─────────────────────────── */
function Badge({ label, type = 'gray' }: { label: string; type?: string }) {
  const cls: Record<string, string> = {
    green: 'badge badge-green',
    red: 'badge badge-red',
    amber: 'badge badge-amber',
    blue: 'badge badge-blue',
    gray: 'badge badge-gray',
  };
  return <span className={cls[type] || cls.gray}>{label}</span>;
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; type: string }> = {
    CONFIRMED: { label: 'Confirmée', type: 'blue' },
    DELIVERED: { label: 'Livrée', type: 'green' },
    CANCELLED: { label: 'Annulée', type: 'red' },
    PLANNED: { label: 'Planifié', type: 'gray' },
    IN_TRANSIT: { label: 'En transit', type: 'amber' },
    RECEIVED: { label: 'Reçu', type: 'green' },
  };
  const m = map[status] || { label: status, type: 'gray' };
  return <Badge label={m.label} type={m.type} />;
}

/* ─────────────────────────── MODAL ─────────────────────────── */
function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: wide ? 760 : 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 style={{ fontSize: 18 }}>{title}</h2>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────── LOADING ─────────────────────────── */
function Loading({ text = 'Chargement…' }: { text?: string }) {
  return (
    <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <div className="spinner" />
        {text}
      </div>
    </div>
  );
}

/* ─────────────────────────── EMPTY ─────────────────────────── */
function Empty({ text = 'Aucune donnée' }: { text?: string }) {
  return (
    <div className="empty-state">
      <Package size={48} />
      <p>{text}</p>
    </div>
  );
}

/* ─────────────────────────── PAGE TITLE ─────────────────────────── */
function PageTitle({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
      }}
    >
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>{title}</h1>
        {sub && <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 14 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─────────────────────────── NAV ─────────────────────────── */
const NAV_ITEMS: Array<[Section, string, React.ComponentType<{ size: number }>]> = [
  ['dashboard', 'Tableau de bord', LayoutDashboard],
  ['orders', 'Commandes', ClipboardList],
  ['products', 'Produits & stock', Box],
  ['customers', 'Clients & crédits', Users],
  ['suppliers', 'Fournisseurs', Truck],
  ['shipments', 'Arrivages', Package],
  ['payments', 'Paiements', CreditCard],
  ['expenses', 'Dépenses', Receipt],
  ['reports', 'Rapports', BarChart2],
  ['settings', 'Paramètres', Settings],
];

function Nav({
  section,
  setSection,
}: {
  section: Section;
  setSection: (s: Section) => void;
}) {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {NAV_ITEMS.map(([id, label, Icon]) => (
        <button
          key={id}
          className={`nav-item ${section === id ? 'active' : ''}`}
          onClick={() => setSection(id)}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </nav>
  );
}

/* ─────────────────────────── LOGIN ─────────────────────────── */
function LoginPage({ onLogin }: { onLogin: (user: unknown, token: string) => void }) {
  const [email, setEmail] = useState('admin@sokho-viandes.tg');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const d = await api<{ token: string; user: unknown }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('sokho_token', d.token);
      onLogin(d.user, d.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f1f5f9 60%, #eff6ff 100%)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ width: '100%', maxWidth: 440, padding: '36px 40px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: 'var(--green)',
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              fontSize: 22,
              fontWeight: 900,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            SV
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Sokho Viandes</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Gestion commerciale — Lomé, Togo</div>
          </div>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Connexion</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          Accédez aux ventes, stocks, crédits et finances.
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label" htmlFor="login-password">Mot de passe</label>
          <input
            id="login-password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Connexion…</> : 'Se connecter'}
        </button>

        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          Compte administrateur : admin@sokho-viandes.tg
        </p>
      </form>
    </main>
  );
}

/* ──────────────────────── DASHBOARD ──────────────────────── */
function Dashboard({ go }: { go: (s: Section) => void }) {
  const [d, setD] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/dashboard')
      .then(setD)
      .catch((e: Error) => setErr(e.message));
  }, []);

  if (err) return <div className="alert alert-error">{err}</div>;
  if (!d) return <Loading />;

  const m = (d.metrics as Record<string, number>) || {};
  const alerts = (d.alerts as Record<string, unknown>) || {};
  const charts = (d.charts as Record<string, unknown[]>) || {};
  const recent = (d.recentActivity as Record<string, unknown[]>) || {};
  const recentOrders = (recent.orders as unknown[]) || [];
  const lowStockItems = (alerts.lowStockItems as unknown[]) || [];
  const last7 = (charts.last7Days as Array<Record<string, unknown>>) || [];

  const statsCards = [
    { label: 'CA total', value: money(m.turnover), icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4' },
    { label: "Ventes aujourd'hui", value: money(m.salesToday), icon: TrendingUp, color: '#2563eb', bg: '#eff6ff', sub: `${m.ordersTodayCount ?? 0} commandes` },
    { label: 'Crédits en cours', value: money(m.activeCreditTotal), icon: CreditCard, color: '#d97706', bg: '#fffbeb', sub: `${money(m.overdueCreditTotal)} en retard` },
    { label: 'Encaissements', value: money(m.paymentsReceivedTotal), icon: CreditCard, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Valeur du stock', value: money(m.totalStockValue), icon: Box, color: '#0891b2', bg: '#ecfeff', sub: `${m.totalStockKg ?? 0} kg` },
    { label: 'Dépenses totales', value: money(m.expensesTotal), icon: TrendingDown, color: '#dc2626', bg: '#fef2f2' },
    { label: 'Marge brute estimée', value: money(m.estimatedGrossProfit), icon: BarChart2, color: '#15803d', bg: '#f0fdf4' },
    { label: 'Bénéfice net estimé', value: money(m.estimatedNetProfit), icon: BarChart2, color: '#15803d', bg: '#f0fdf4' },
  ];

  return (
    <>
      <PageTitle
        title="Tableau de bord"
        sub="Vue opérationnelle de Sokho Viandes"
        action={
          <button className="btn btn-primary" onClick={() => go('orders')}>
            <Plus size={16} /> Nouvelle commande
          </button>
        }
      />

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {statsCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="stat-label">{s.label}</span>
                <div className="stat-icon" style={{ background: s.bg }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
              {s.sub && <div className="stat-sub">{s.sub}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>
        {/* Commandes récentes */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Commandes récentes</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => go('orders')}>Tout voir</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {recentOrders.length === 0 ? (
              <Empty text="Aucune commande" />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Crédit</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 8).map((o: unknown) => {
                    const order = o as Record<string, unknown>;
                    const customer = order.customer as Record<string, unknown> | null;
                    return (
                      <tr key={String(order.id)}>
                        <td style={{ fontWeight: 600, color: 'var(--green-dark)', fontSize: 13 }}>{String(order.number)}</td>
                        <td style={{ color: 'var(--ink-2)' }}>{customer?.name ?? 'Comptant'}</td>
                        <td className="metric" style={{ fontWeight: 600 }}>{money(num(order.total))}</td>
                        <td className="metric" style={{ color: num(order.creditTotal) > 0 ? 'var(--red)' : 'var(--muted)' }}>
                          {num(order.creditTotal) > 0 ? money(num(order.creditTotal)) : '—'}
                        </td>
                        <td>{statusBadge(String(order.status))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Alertes stock */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} style={{ color: 'var(--red)' }} />
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Alertes stock</h2>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lowStockItems.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <CheckCircle size={18} style={{ color: 'var(--green)' }} />
                Aucune rupture
              </div>
            ) : (
              lowStockItems.map((p: unknown) => {
                const prod = p as Record<string, unknown>;
                return (
                  <div
                    key={String(prod.id)}
                    style={{ background: 'var(--red-50)', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{String(prod.name)}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Seuil: {num(prod.reorderLevel)} {String(prod.unit)}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--red)', fontSize: 13 }}>{num(prod.currentStock).toFixed(1)} {String(prod.unit)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Graphique 7 derniers jours */}
      {last7.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Ventes — 7 derniers jours</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
            {last7.map((day) => {
              const maxSales = Math.max(...last7.map((d) => num(d.sales)), 1);
              const pct = (num(day.sales) / maxSales) * 100;
              return (
                <div key={String(day.date)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    title={money(num(day.sales))}
                    style={{
                      width: '100%',
                      height: `${Math.max(pct, 4)}%`,
                      background: pct > 0 ? 'var(--green)' : 'var(--line)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height .3s ease',
                      cursor: 'default',
                    }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>{String(day.label)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

/* ──────────────────────── PRODUITS ──────────────────────── */
interface Product {
  productId?: string;
  id?: string;
  sku: string;
  name: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  reorderLevel: number;
  currentStock?: number;
  stockValue?: number;
  isLowStock?: boolean;
  active?: boolean;
  description?: string;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showAdj, setShowAdj] = useState(false);
  const [adjProduct, setAdjProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ sku: '', name: '', unit: 'kg', purchasePrice: '', salePrice: '', reorderLevel: '10', description: '' });
  const [adjForm, setAdjForm] = useState({ quantity: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api<Product[]>('/products')
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  async function saveProduct() {
    setSaving(true);
    setFormErr('');
    try {
      await api('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          purchasePrice: num(form.purchasePrice),
          salePrice: num(form.salePrice),
          reorderLevel: num(form.reorderLevel),
        }),
      });
      setShowNew(false);
      setForm({ sku: '', name: '', unit: 'kg', purchasePrice: '', salePrice: '', reorderLevel: '10', description: '' });
      load();
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  async function saveAdj() {
    if (!adjProduct) return;
    setSaving(true);
    setFormErr('');
    const pid = adjProduct.productId || adjProduct.id;
    try {
      await api('/products/adjust-stock', {
        method: 'POST',
        body: JSON.stringify({ productId: pid, quantity: num(adjForm.quantity), note: adjForm.note }),
      });
      setShowAdj(false);
      setAdjForm({ quantity: '', note: '' });
      load();
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageTitle
        title="Produits & stock"
        sub="Gestion des articles, tarifs et niveaux de stock"
        action={
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={16} /> Nouveau produit
          </button>
        }
      />

      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Search size={17} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        <input
          className="input"
          style={{ border: 'none', boxShadow: 'none', padding: 0, height: 32 }}
          placeholder="Rechercher par nom ou SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <Loading /> : filtered.length === 0 ? <Empty text="Aucun produit" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Produit</th>
                  <th>Unité</th>
                  <th>Prix achat</th>
                  <th>Prix vente</th>
                  <th>Stock actuel</th>
                  <th>Valeur stock</th>
                  <th>Alerte</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.sku}>
                    <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted)' }}>{p.sku}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.unit}</td>
                    <td className="metric">{money(p.purchasePrice)}</td>
                    <td className="metric" style={{ fontWeight: 600, color: 'var(--green-dark)' }}>{money(p.salePrice)}</td>
                    <td className="metric" style={{ fontWeight: 600, color: p.isLowStock ? 'var(--red)' : 'var(--ink)' }}>
                      {(p.currentStock ?? 0).toFixed(2)} {p.unit}
                    </td>
                    <td className="metric">{money(p.stockValue)}</td>
                    <td>{p.isLowStock ? <Badge label="Stock bas" type="red" /> : <Badge label="OK" type="green" />}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => { setAdjProduct(p); setFormErr(''); setAdjForm({ quantity: '', note: '' }); setShowAdj(true); }}
                      >
                        Ajuster
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && (
        <Modal title="Nouveau produit" onClose={() => setShowNew(false)}>
          {formErr && <div className="alert alert-error" style={{ marginBottom: 14 }}>{formErr}</div>}
          <div className="form-grid">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="ex: POULET-001" />
              </div>
              <div className="form-group">
                <label className="form-label">Unité</label>
                <select className="input select-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option value="kg">kg</option>
                  <option value="pièce">pièce</option>
                  <option value="carton">carton</option>
                  <option value="sac">sac</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nom du produit *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Poulet entier congelé" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Prix achat (FCFA)</label>
                <input className="input" type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Prix vente (FCFA)</label>
                <input className="input" type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Seuil d'alerte (réapprovisionnement)</label>
              <input className="input" type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={saveProduct} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Créer le produit'}
            </button>
          </div>
        </Modal>
      )}

      {showAdj && adjProduct && (
        <Modal title={`Ajustement de stock — ${adjProduct.name}`} onClose={() => setShowAdj(false)}>
          {formErr && <div className="alert alert-error" style={{ marginBottom: 14 }}>{formErr}</div>}
          <div style={{ background: 'var(--line-2)', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Stock actuel</div>
            <div style={{ fontWeight: 700, fontSize: 20, fontVariantNumeric: 'tabular-nums' }}>
              {(adjProduct.currentStock ?? 0).toFixed(2)} {adjProduct.unit}
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Quantité (+ pour entrée, - pour sortie) *</label>
              <input
                className="input"
                type="number"
                step="0.1"
                value={adjForm.quantity}
                onChange={(e) => setAdjForm({ ...adjForm, quantity: e.target.value })}
                placeholder="ex: +50 ou -10"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Motif de l'ajustement *</label>
              <input
                className="input"
                value={adjForm.note}
                onChange={(e) => setAdjForm({ ...adjForm, note: e.target.value })}
                placeholder="ex: Inventaire physique du 19/09/2026"
              />
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowAdj(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={saveAdj} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Confirmer l\'ajustement'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ──────────────────────── CLIENTS ──────────────────────── */
interface Customer {
  id: string;
  code: string;
  name: string;
  businessName?: string;
  phone?: string;
  city?: string;
  creditLimit: number;
  totalCredit?: number;
  totalPurchases?: number;
  overdueAmount?: number;
  hasOverdueCredit?: boolean;
}

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', businessName: '', phone: '', whatsapp: '', city: 'Lomé', creditLimit: '0' });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api<Customer[]>('/customers').then(setCustomers).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  async function saveCustomer() {
    setSaving(true);
    setFormErr('');
    try {
      await api('/customers', {
        method: 'POST',
        body: JSON.stringify({ ...form, creditLimit: num(form.creditLimit) }),
      });
      setShowNew(false);
      setForm({ code: '', name: '', businessName: '', phone: '', whatsapp: '', city: 'Lomé', creditLimit: '0' });
      load();
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageTitle
        title="Clients & crédits"
        sub="Suivi des clients, achats cumulés et créances"
        action={<button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={16} /> Nouveau client</button>}
      />

      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Search size={17} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        <input className="input" style={{ border: 'none', boxShadow: 'none', padding: 0, height: 32 }} placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <Loading /> : filtered.length === 0 ? <Empty text="Aucun client" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom / Entreprise</th>
                  <th>Téléphone</th>
                  <th>Ville</th>
                  <th>Total achats</th>
                  <th>Crédit actuel</th>
                  <th>Plafond</th>
                  <th>Statut crédit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted)' }}>{c.code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      {c.businessName && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.businessName}</div>}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{c.phone || '—'}</td>
                    <td>{c.city || 'Lomé'}</td>
                    <td className="metric">{money(c.totalPurchases)}</td>
                    <td className="metric" style={{ fontWeight: 600, color: num(c.totalCredit) > 0 ? 'var(--red)' : 'var(--muted)' }}>
                      {num(c.totalCredit) > 0 ? money(c.totalCredit) : '—'}
                    </td>
                    <td className="metric">{c.creditLimit > 0 ? money(c.creditLimit) : '—'}</td>
                    <td>
                      {c.hasOverdueCredit ? (
                        <Badge label="En retard" type="red" />
                      ) : num(c.totalCredit) > 0 ? (
                        <Badge label="Crédit actif" type="amber" />
                      ) : (
                        <Badge label="À jour" type="green" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && (
        <Modal title="Nouveau client" onClose={() => setShowNew(false)}>
          {formErr && <div className="alert alert-error" style={{ marginBottom: 14 }}>{formErr}</div>}
          <div className="form-grid">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Code client *</label>
                <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ex: CLI-001" />
              </div>
              <div className="form-group">
                <label className="form-label">Ville</label>
                <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Kofi Mensah" />
            </div>
            <div className="form-group">
              <label className="form-label">Nom de l'entreprise</label>
              <input className="input" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp</label>
                <input className="input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Plafond de crédit (FCFA)</label>
              <input className="input" type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={saveCustomer} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Créer le client'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ──────────────────────── FOURNISSEURS ──────────────────────── */
interface Supplier {
  id: string;
  code: string;
  name: string;
  company?: string;
  phone?: string;
  country?: string;
}

function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', company: '', phone: '', whatsapp: '', country: 'Sénégal' });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api<Supplier[]>('/suppliers').then(setSuppliers).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    setFormErr('');
    try {
      await api('/suppliers', { method: 'POST', body: JSON.stringify(form) });
      setShowNew(false);
      setForm({ code: '', name: '', company: '', phone: '', whatsapp: '', country: 'Sénégal' });
      load();
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageTitle
        title="Fournisseurs"
        sub="Vos fournisseurs de viandes au Sénégal et ailleurs"
        action={<button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={16} /> Nouveau fournisseur</button>}
      />

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <Loading /> : suppliers.length === 0 ? <Empty text="Aucun fournisseur" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom / Entreprise</th>
                  <th>Téléphone</th>
                  <th>Pays</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted)' }}>{s.code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      {s.company && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.company}</div>}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{s.phone || '—'}</td>
                    <td>{s.country || 'Sénégal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && (
        <Modal title="Nouveau fournisseur" onClose={() => setShowNew(false)}>
          {formErr && <div className="alert alert-error" style={{ marginBottom: 14 }}>{formErr}</div>}
          <div className="form-grid">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Code *</label>
                <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ex: FOUR-001" />
              </div>
              <div className="form-group">
                <label className="form-label">Pays</label>
                <input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Entreprise</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp</label>
                <input className="input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Créer'}</button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ──────────────────────── ARRIVAGES ──────────────────────── */
interface Shipment {
  id: string;
  reference: string;
  status: string;
  origin: string;
  destination: string;
  supplier?: { name: string };
  items?: Array<{ product: { name: string; unit: string }; quantity: number; unitCost: number; totalCost: number }>;
  transportCost: number;
  createdAt: string;
  arrivalDate?: string;
}

function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [detail, setDetail] = useState<Shipment | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const [form, setForm] = useState({
    reference: `ARR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    supplierId: '',
    status: 'PLANNED',
    transportCost: '0',
    notes: '',
  });
  const [items, setItems] = useState<Array<{ productId: string; quantity: string; unitCost: string }>>([]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api<Shipment[]>('/shipments'), api<Supplier[]>('/suppliers'), api<Product[]>('/products')])
      .then(([sh, sup, pr]) => { setShipments(sh); setSuppliers(sup); setProducts(pr); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function addItem() {
    setItems([...items, { productId: products[0]?.productId || products[0]?.id || '', quantity: '1', unitCost: '0' }]);
  }
  function removeItem(idx: number) { setItems(items.filter((_, i) => i !== idx)); }

  async function saveShipment() {
    setSaving(true);
    setFormErr('');
    try {
      await api('/shipments', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          transportCost: num(form.transportCost),
          items: items.map((i) => ({ productId: i.productId, quantity: num(i.quantity), unitCost: num(i.unitCost) })),
        }),
      });
      setShowNew(false);
      load();
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api(`/shipments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      load();
      setDetail(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    }
  }

  return (
    <>
      <PageTitle
        title="Arrivages Sénégal → Togo"
        sub="Réception des marchandises et mise à jour du stock"
        action={<button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={16} /> Nouvel arrivage</button>}
      />

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <Loading /> : shipments.length === 0 ? <Empty text="Aucun arrivage" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Fournisseur</th>
                  <th>Trajet</th>
                  <th>Statut</th>
                  <th>Frais transport</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{s.reference}</td>
                    <td>{s.supplier?.name || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{s.origin} → {s.destination}</td>
                    <td>{statusBadge(s.status)}</td>
                    <td className="metric">{money(s.transportCost)}</td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{dateStr(s.createdAt)}</td>
                    <td>
                      <button className="btn btn-secondary btn-xs" onClick={() => setDetail(s)}>Détail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal nouveau arrivage */}
      {showNew && (
        <Modal title="Nouvel arrivage" onClose={() => setShowNew(false)} wide>
          {formErr && <div className="alert alert-error" style={{ marginBottom: 14 }}>{formErr}</div>}
          <div className="form-grid">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Référence *</label>
                <input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="input select-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="PLANNED">Planifié</option>
                  <option value="IN_TRANSIT">En transit</option>
                  <option value="RECEIVED">Reçu (stock immédiat)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Fournisseur *</label>
              <select className="input select-input" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">— Sélectionner —</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Frais de transport (FCFA)</label>
              <input className="input" type="number" value={form.transportCost} onChange={(e) => setForm({ ...form, transportCost: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            {/* Items */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label">Produits réceptionnés *</label>
                <button className="btn btn-secondary btn-xs" onClick={addItem} type="button"><Plus size={13} /> Ajouter</button>
              </div>
              {items.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Ajoutez au moins un produit.</p>}
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <select
                    className="input select-input"
                    value={it.productId}
                    onChange={(e) => { const a = [...items]; a[idx].productId = e.target.value; setItems(a); }}
                  >
                    {products.map((p) => <option key={p.productId || p.id} value={p.productId || p.id}>{p.name}</option>)}
                  </select>
                  <input className="input" type="number" step="0.1" placeholder="Qté" value={it.quantity} onChange={(e) => { const a = [...items]; a[idx].quantity = e.target.value; setItems(a); }} />
                  <input className="input" type="number" placeholder="Coût/u" value={it.unitCost} onChange={(e) => { const a = [...items]; a[idx].unitCost = e.target.value; setItems(a); }} />
                  <button className="btn btn-danger btn-icon btn-xs" onClick={() => removeItem(idx)} type="button"><X size={13} /></button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={saveShipment} disabled={saving}>{saving ? 'Enregistrement…' : 'Créer l\'arrivage'}</button>
          </div>
        </Modal>
      )}

      {/* Modal détail + changement de statut */}
      {detail && (
        <Modal title={`Arrivage ${detail.reference}`} onClose={() => setDetail(null)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div><span style={{ fontSize: 12, color: 'var(--muted)' }}>Fournisseur</span><div style={{ fontWeight: 600 }}>{detail.supplier?.name || '—'}</div></div>
            <div><span style={{ fontSize: 12, color: 'var(--muted)' }}>Statut</span><div style={{ marginTop: 2 }}>{statusBadge(detail.status)}</div></div>
            <div><span style={{ fontSize: 12, color: 'var(--muted)' }}>Origine → Destination</span><div style={{ fontWeight: 600 }}>{detail.origin} → {detail.destination}</div></div>
            <div><span style={{ fontSize: 12, color: 'var(--muted)' }}>Frais transport</span><div style={{ fontWeight: 600 }}>{money(detail.transportCost)}</div></div>
          </div>

          {detail.items && detail.items.length > 0 && (
            <>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Produits</div>
              <table className="data-table" style={{ marginBottom: 16 }}>
                <thead><tr><th>Produit</th><th>Quantité</th><th>Coût/u</th><th>Total</th></tr></thead>
                <tbody>
                  {detail.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product.name}</td>
                      <td>{item.quantity} {item.product.unit}</td>
                      <td className="metric">{money(item.unitCost)}</td>
                      <td className="metric">{money(item.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {detail.status !== 'RECEIVED' && detail.status !== 'CANCELLED' && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {detail.status === 'PLANNED' && (
                <button className="btn btn-warning" onClick={() => updateStatus(detail.id, 'IN_TRANSIT')}>
                  → Marquer En transit
                </button>
              )}
              {(detail.status === 'PLANNED' || detail.status === 'IN_TRANSIT') && (
                <button className="btn btn-primary" onClick={() => updateStatus(detail.id, 'RECEIVED')}>
                  <CheckCircle size={15} /> Marquer Reçu (+ stock)
                </button>
              )}
              <button className="btn btn-danger" onClick={() => updateStatus(detail.id, 'CANCELLED')}>
                Annuler
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

/* ──────────────────────── COMMANDES ──────────────────────── */
interface OrderItem {
  productId: string;
  quantity: string;
  unitPrice: string;
}

function Orders() {
  const [tab, setTab] = useState<'new' | 'list'>('list');
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api<Record<string, unknown>[]>('/orders'), api<Product[]>('/products'), api<Customer[]>('/customers')])
      .then(([o, p, c]) => { setOrders(o); setProducts(p); setCustomers(c); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const subtotal = items.reduce((s, i) => s + num(i.quantity) * num(i.unitPrice), 0);
  const totalAfterDiscount = Math.max(0, subtotal - num(discount));
  const credit = Math.max(0, totalAfterDiscount - num(paidAmount));

  function addItem() {
    const p = products[0];
    if (!p) return;
    setItems([...items, { productId: p.productId || p.id || '', quantity: '1', unitPrice: String(p.salePrice) }]);
  }

  async function submit() {
    setSaving(true);
    setFormErr('');
    setSuccessMsg('');
    try {
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId: customerId || null,
          items: items.map((i) => ({ productId: i.productId, quantity: num(i.quantity), unitPrice: num(i.unitPrice) })),
          paidAmount: num(paidAmount),
          paymentMethod: payMethod,
          discount: num(discount),
          notes,
        }),
      });
      setSuccessMsg('Commande enregistrée avec succès !');
      setItems([]);
      setCustomerId('');
      setPaidAmount('');
      setDiscount('0');
      setNotes('');
      load();
      setTimeout(() => { setTab('list'); setSuccessMsg(''); }, 1800);
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  async function cancelOrder(id: string) {
    if (!confirm('Annuler cette commande ? Le stock sera réintégré.')) return;
    try {
      await api(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason: 'Annulation manuelle' }) });
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Commandes</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Gestion des ventes et des règlements</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${tab === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('list')}><ClipboardList size={15} /> Liste</button>
          <button className={`btn ${tab === 'new' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('new')}><Plus size={15} /> Nouvelle</button>
        </div>
      </div>

      {tab === 'list' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? <Loading /> : orders.length === 0 ? <Empty text="Aucune commande" /> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N° commande</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payé</th>
                    <th>Crédit</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const customer = o.customer as Record<string, unknown> | null;
                    return (
                      <tr key={String(o.id)}>
                        <td style={{ fontWeight: 600, color: 'var(--green-dark)', fontSize: 13 }}>{String(o.number)}</td>
                        <td>{customer?.name ?? 'Comptant'}</td>
                        <td style={{ fontSize: 13, color: 'var(--muted)' }}>{dateStr(o.orderDate as string)}</td>
                        <td className="metric" style={{ fontWeight: 600 }}>{money(num(o.total))}</td>
                        <td className="metric" style={{ color: 'var(--green)' }}>{money(num(o.paidTotal))}</td>
                        <td className="metric" style={{ color: num(o.creditTotal) > 0 ? 'var(--red)' : 'var(--muted)' }}>
                          {num(o.creditTotal) > 0 ? money(num(o.creditTotal)) : '—'}
                        </td>
                        <td>{statusBadge(String(o.status))}</td>
                        <td>
                          {String(o.status) === 'CONFIRMED' && (
                            <button className="btn btn-danger btn-xs" onClick={() => cancelOrder(String(o.id))}>Annuler</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'new' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {formErr && <div className="alert alert-error">{formErr}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>1. Client</h2>
              <select className="input select-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Vente comptant (sans client)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.businessName ? ` — ${c.businessName}` : ''}</option>
                ))}
              </select>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>2. Produits vendus</h2>
                <button className="btn btn-secondary btn-sm" onClick={addItem} disabled={products.length === 0}><Plus size={15} /> Ajouter</button>
              </div>
              {items.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>Cliquez sur Ajouter pour saisir les produits vendus.</p>}
              {items.map((it, idx) => {
                const productId = it.productId;
                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                    <select
                      className="input select-input"
                      value={productId}
                      onChange={(e) => {
                        const p = products.find((x) => (x.productId || x.id) === e.target.value);
                        const a = [...items];
                        a[idx] = { productId: e.target.value, quantity: it.quantity, unitPrice: String(p?.salePrice ?? 0) };
                        setItems(a);
                      }}
                    >
                      {products.map((p) => (
                        <option key={p.productId || p.id} value={p.productId || p.id}>{p.name} ({p.unit})</option>
                      ))}
                    </select>
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Qté"
                      value={it.quantity}
                      onChange={(e) => { const a = [...items]; a[idx].quantity = e.target.value; setItems(a); }}
                    />
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="Prix/u"
                      value={it.unitPrice}
                      onChange={(e) => { const a = [...items]; a[idx].unitPrice = e.target.value; setItems(a); }}
                    />
                    <span className="metric" style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>
                      {money(num(it.quantity) * num(it.unitPrice))}
                    </span>
                    <button className="btn btn-danger btn-icon btn-xs" onClick={() => setItems(items.filter((_, i) => i !== idx))}><X size={13} /></button>
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>3. Notes</h2>
              <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Remarques sur la commande…" />
            </div>
          </div>

          {/* Panneau règlement */}
          <div className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>4. Règlement</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--muted)' }}>Sous-total</span>
                <span className="metric" style={{ fontWeight: 600 }}>{money(subtotal)}</span>
              </div>
              <div className="form-group">
                <label className="form-label">Remise (FCFA)</label>
                <input className="input" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                <span style={{ fontWeight: 700 }}>Total à payer</span>
                <span className="metric" style={{ fontWeight: 800, fontSize: 16 }}>{money(totalAfterDiscount)}</span>
              </div>
              <div className="form-group">
                <label className="form-label">Montant reçu (FCFA)</label>
                <input className="input" type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Mode de paiement</label>
                <select className="input select-input" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option value="CASH">Espèces</option>
                  <option value="TMONEY">TMoney</option>
                  <option value="MOOV_MONEY">Moov Money</option>
                  <option value="BANK_TRANSFER">Virement bancaire</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
              <div style={{ background: credit > 0 ? 'var(--red-50)' : 'var(--green-50)', border: `1px solid ${credit > 0 ? '#fecaca' : 'var(--green-100)'}`, borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>Crédit créé</span>
                <span className="metric" style={{ fontWeight: 700, color: credit > 0 ? 'var(--red)' : 'var(--green-dark)' }}>
                  {money(credit)}
                </span>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={submit}
                disabled={saving || items.length === 0}
              >
                {saving ? 'Enregistrement…' : 'Valider la commande'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ──────────────────────── PAIEMENTS ──────────────────────── */
function Payments() {
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ orderId: '', customerId: '', amount: '', method: 'CASH', note: '' });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api<Record<string, unknown>[]>('/payments'), api<Record<string, unknown>[]>('/orders'), api<Customer[]>('/customers')])
      .then(([p, o, c]) => { setPayments(p); setOrders(o.filter((x) => num(x.creditTotal) > 0 && x.status !== 'CANCELLED')); setCustomers(c); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    setFormErr('');
    try {
      await api('/payments', {
        method: 'POST',
        body: JSON.stringify({
          orderId: form.orderId || null,
          customerId: form.customerId || null,
          amount: num(form.amount),
          method: form.method,
          note: form.note,
        }),
      });
      setShowNew(false);
      setForm({ orderId: '', customerId: '', amount: '', method: 'CASH', note: '' });
      load();
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  const methodLabel: Record<string, string> = {
    CASH: 'Espèces', TMONEY: 'TMoney', MOOV_MONEY: 'Moov Money', BANK_TRANSFER: 'Virement', OTHER: 'Autre',
  };

  return (
    <>
      <PageTitle
        title="Paiements & encaissements"
        sub="Enregistrement des règlements clients"
        action={<button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={16} /> Nouveau paiement</button>}
      />

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <Loading /> : payments.length === 0 ? <Empty text="Aucun paiement" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Référence</th><th>Client</th><th>Commande</th><th>Montant</th><th>Mode</th><th>Date</th></tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const customer = p.customer as Record<string, unknown> | null;
                  const order = p.order as Record<string, unknown> | null;
                  return (
                    <tr key={String(p.id)}>
                      <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted)' }}>{String(p.reference)}</td>
                      <td>{customer?.name ?? '—'}</td>
                      <td style={{ fontSize: 13 }}>{order?.number ?? '—'}</td>
                      <td className="metric" style={{ fontWeight: 700, color: 'var(--green-dark)' }}>{money(num(p.amount))}</td>
                      <td><Badge label={methodLabel[String(p.method)] || String(p.method)} type="blue" /></td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{dateStr(p.receivedAt as string)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && (
        <Modal title="Nouveau paiement" onClose={() => setShowNew(false)}>
          {formErr && <div className="alert alert-error" style={{ marginBottom: 14 }}>{formErr}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Commande avec crédit (optionnel)</label>
              <select className="input select-input" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}>
                <option value="">— Règlement global client —</option>
                {orders.map((o) => {
                  const cust = o.customer as Record<string, unknown> | null;
                  return <option key={String(o.id)} value={String(o.id)}>{String(o.number)} — Crédit: {money(num(o.creditTotal))} ({cust?.name ?? 'Comptant'})</option>;
                })}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Client (pour imputation FIFO)</label>
              <select className="input select-input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                <option value="">— Sans client spécifique —</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Montant reçu (FCFA) *</label>
              <input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Mode de paiement</label>
              <select className="input select-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="CASH">Espèces</option>
                <option value="TMONEY">TMoney</option>
                <option value="MOOV_MONEY">Moov Money</option>
                <option value="BANK_TRANSFER">Virement bancaire</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Note</label>
              <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer le paiement'}</button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ──────────────────────── DÉPENSES ──────────────────────── */
function Expenses() {
  const [expenses, setExpenses] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ category: 'AUTRE', amount: '', description: '', expenseDate: todayISO() });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api<Record<string, unknown>[]>('/expenses').then(setExpenses).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    setFormErr('');
    try {
      await api('/expenses', { method: 'POST', body: JSON.stringify({ ...form, amount: num(form.amount) }) });
      setShowNew(false);
      setForm({ category: 'AUTRE', amount: '', description: '', expenseDate: todayISO() });
      load();
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  const catLabel: Record<string, string> = {
    ACHAT: 'Achat', TRANSPORT: 'Transport', LIVRAISON: 'Livraison',
    CARBURANT: 'Carburant', COMMUNICATION: 'Communication', MANUTENTION: 'Manutention', AUTRE: 'Autre',
  };

  const total = expenses.reduce((s, e) => s + num(e.amount), 0);

  return (
    <>
      <PageTitle
        title="Dépenses"
        sub="Charges d'exploitation : transport, carburant, personnel…"
        action={<button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={16} /> Nouvelle dépense</button>}
      />

      {expenses.length > 0 && (
        <div className="stat-card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="stat-label">Total des dépenses enregistrées</div>
            <div className="stat-value">{money(total)}</div>
          </div>
          <TrendingDown size={36} style={{ color: 'var(--red)', opacity: .3 }} />
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <Loading /> : expenses.length === 0 ? <Empty text="Aucune dépense enregistrée" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Référence</th><th>Catégorie</th><th>Description</th><th>Montant</th><th>Date</th><th>Arrivage</th></tr>
              </thead>
              <tbody>
                {expenses.map((e) => {
                  const shipment = e.shipment as Record<string, unknown> | null;
                  return (
                    <tr key={String(e.id)}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{String(e.reference)}</td>
                      <td><Badge label={catLabel[String(e.category)] || String(e.category)} type="amber" /></td>
                      <td style={{ maxWidth: 240 }} className="truncate">{String(e.description || '—')}</td>
                      <td className="metric" style={{ fontWeight: 700, color: 'var(--red)' }}>{money(num(e.amount))}</td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{dateStr(e.expenseDate as string)}</td>
                      <td style={{ fontSize: 13 }}>{shipment?.reference ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && (
        <Modal title="Nouvelle dépense" onClose={() => setShowNew(false)}>
          {formErr && <div className="alert alert-error" style={{ marginBottom: 14 }}>{formErr}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Catégorie *</label>
              <select className="input select-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {Object.entries(catLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Montant (FCFA) *</label>
              <input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="input" type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ──────────────────────── RAPPORTS ──────────────────────── */
function Reports() {
  const [period, setPeriod] = useState('month');
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api(`/reports`, { params: { period } })
      .then(setReport)
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { load(); }, [load]);

  async function exportCsv() {
    setExporting(true);
    try {
      const csv = await api<string>(`/reports/export/csv`, { params: { period } });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sokho-viandes-rapport-${period}-${todayISO()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors de l\'export CSV');
    } finally {
      setExporting(false);
    }
  }

  const periodLabels: Record<string, string> = {
    today: "Aujourd'hui", week: '7 derniers jours', month: 'Ce mois', quarter: 'Ce trimestre', year: 'Cette année',
  };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Rapports financiers</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Synthèse des ventes, encaissements, crédits et dépenses</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="input select-input" style={{ width: 200 }} value={period} onChange={(e) => setPeriod(e.target.value)}>
            {Object.entries(periodLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={exportCsv} disabled={exporting}>
            <Download size={15} /> {exporting ? 'Export…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {loading ? <Loading /> : !report ? <div className="alert alert-error">Erreur de chargement</div> : (() => {
        const s = (report.summary as Record<string, number>) || {};
        const byCategory = (report.expensesByCategory as Record<string, number>) || {};
        const byMethod = (report.paymentsByMethod as Record<string, number>) || {};
        const topProducts = (report.topProducts as Array<Record<string, unknown>>) || [];

        const kpis = [
          { label: "Chiffre d'affaires", value: money(s.totalSales), color: 'var(--green)', sub: `${s.ordersCount} commandes` },
          { label: 'Encaissements', value: money(s.totalCashReceived), color: 'var(--blue)', sub: `${s.paymentsCount} paiements` },
          { label: 'Nouveaux crédits', value: money(s.totalNewCredit), color: 'var(--amber)' },
          { label: 'Dépenses', value: money(s.totalExpenses), color: 'var(--red)', sub: `${s.expensesCount} dépenses` },
          { label: 'Coût marchandises (COGS)', value: money(s.totalCogs), color: 'var(--muted)' },
          { label: 'Marge brute estimée', value: money(s.estimatedGrossProfit), color: 'var(--green)', sub: `${s.grossMarginPercent}% de marge` },
          { label: 'Bénéfice net estimé', value: money(s.estimatedNetProfit), color: s.estimatedNetProfit >= 0 ? 'var(--green)' : 'var(--red)' },
        ];

        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
              {kpis.map((k) => (
                <div key={k.label} className="stat-card">
                  <div className="stat-label">{k.label}</div>
                  <div className="stat-value" style={{ fontSize: 20, color: k.color }}>{k.value}</div>
                  {k.sub && <div className="stat-sub">{k.sub}</div>}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              {/* Dépenses par catégorie */}
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Dépenses par catégorie</h2>
                {Object.keys(byCategory).length === 0 ? <Empty text="Aucune dépense" /> : (
                  Object.entries(byCategory).map(([cat, amt]) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line-2)' }}>
                      <span style={{ fontSize: 14 }}>{cat}</span>
                      <span className="metric" style={{ fontWeight: 600, color: 'var(--red)' }}>{money(amt)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Paiements par mode */}
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Encaissements par mode</h2>
                {Object.keys(byMethod).length === 0 ? <Empty text="Aucun paiement" /> : (
                  Object.entries(byMethod).map(([method, amt]) => (
                    <div key={method} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line-2)' }}>
                      <span style={{ fontSize: 14 }}>{method}</span>
                      <span className="metric" style={{ fontWeight: 600, color: 'var(--blue)' }}>{money(amt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top produits */}
            {topProducts.length > 0 && (
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Ventes par produit</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Produit</th><th>Quantité vendue</th><th>CA</th><th>Coût achat</th><th>Marge estimée</th><th>% Marge</th></tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{String(p.name)}</td>
                          <td className="metric">{num(p.quantity).toFixed(2)} {String(p.unit)}</td>
                          <td className="metric">{money(num(p.revenue))}</td>
                          <td className="metric">{money(num(p.cost))}</td>
                          <td className="metric" style={{ color: num(p.margin) >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{money(num(p.margin))}</td>
                          <td><Badge label={`${num(p.marginPercent)}%`} type={num(p.marginPercent) >= 15 ? 'green' : num(p.marginPercent) >= 5 ? 'amber' : 'red'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        );
      })()}
    </>
  );
}

/* ──────────────────────── PARAMÈTRES ──────────────────────── */
function SettingsPage({ user }: { user: Record<string, unknown> | null }) {
  return (
    <>
      <PageTitle title="Paramètres" sub="Configuration du compte et de l'application" />
      <div className="card" style={{ padding: 24, maxWidth: 560 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Compte connecté</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            ['Nom', user?.name],
            ['Email', user?.email],
            ['Rôle', user?.role],
            ['Téléphone', user?.phone || '—'],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{String(value ?? '—')}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: 24, maxWidth: 560, marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>À propos de l'application</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          <strong>Sokho Viandes</strong> — Système de gestion commerciale<br />
          Sénégal → Togo (Lomé) · Version 1.0
        </p>
      </div>
    </>
  );
}

/* ──────────────────────── APP ROOT ──────────────────────── */
export default function App() {
  const [logged, setLogged] = useState(!!getAuthToken());
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!logged) return;
    api('/auth/me')
      .then((u) => setUser(u as Record<string, unknown>))
      .catch(() => { removeAuthToken(); setLogged(false); });
  }, [logged]);

  if (!logged) {
    return (
      <LoginPage
        onLogin={(u, _token) => { setUser(u as Record<string, unknown>); setLogged(true); }}
      />
    );
  }

  const roleLabel: Record<string, string> = { ADMIN: 'Administrateur', MANAGER: 'Responsable', STAFF: 'Agent' };

  function navigate(s: Section) {
    setSection(s);
    setSidebarOpen(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* HEADER */}
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
          height: 60,
          background: 'rgba(255,255,255,.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 14,
        }}
      >
        {/* Mobile hamburger */}
        <button
          className="btn btn-secondary btn-icon"
          style={{ display: 'flex' }}
          onClick={() => setSidebarOpen(true)}
          aria-label="Menu"
        >
          <Menu size={18} />
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div
            style={{
              width: 36, height: 36,
              background: 'var(--green)',
              borderRadius: 10,
              display: 'grid', placeItems: 'center',
              fontWeight: 900, fontSize: 14, color: '#fff',
              flexShrink: 0,
            }}
          >
            SV
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Sokho Viandes</div>
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>Lomé, Togo</div>
          </div>
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{String(user?.name || 'Utilisateur')}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{roleLabel[String(user?.role)] || String(user?.role || '')}</div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { removeAuthToken(); setLogged(false); setUser(null); }}
          >
            <LogOut size={15} /> Sortir
          </button>
        </div>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgb(15 23 42 / .5)' }}
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: 280,
              background: 'var(--surface)',
              padding: '20px 16px',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Sokho Viandes</div>
              <button className="btn btn-secondary btn-icon" onClick={() => setSidebarOpen(false)}><X size={16} /></button>
            </div>
            <Nav section={section} setSection={navigate} />
          </aside>
        </div>
      )}

      {/* LAYOUT */}
      <div style={{ display: 'flex', paddingTop: 60 }}>
        {/* DESKTOP SIDEBAR */}
        <aside
          style={{
            width: 240,
            position: 'fixed',
            top: 60, bottom: 0, left: 0,
            background: 'var(--surface)',
            borderRight: '1px solid var(--line)',
            padding: '16px 12px',
            overflowY: 'auto',
          }}
        >
          <Nav section={section} setSection={navigate} />
        </aside>

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            marginLeft: 240,
            padding: '28px 28px 60px',
            minWidth: 0,
          }}
        >
          {section === 'dashboard' && <Dashboard go={navigate} />}
          {section === 'orders' && <Orders />}
          {section === 'products' && <Products />}
          {section === 'customers' && <Customers />}
          {section === 'suppliers' && <Suppliers />}
          {section === 'shipments' && <Shipments />}
          {section === 'payments' && <Payments />}
          {section === 'expenses' && <Expenses />}
          {section === 'reports' && <Reports />}
          {section === 'settings' && <SettingsPage user={user} />}
        </main>
      </div>
    </div>
  );
}
