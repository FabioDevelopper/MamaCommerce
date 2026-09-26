import Link from 'next/link';
import { Box, CreditCard, Users, ShoppingCart, Package, Truck, ArrowRight, ArrowDown } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>
      {/* HEADER PUBLIC */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--green)', borderRadius: 8, display: 'grid', placeItems: 'center', fontWeight: 700, color: '#fff', fontSize: 16 }}>
            SV
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--ink)' }}>Sokho Viandes</div>
        </div>
        <Link href="/login" className="btn btn-primary" style={{ padding: '0 24px', minHeight: 44, borderRadius: 6, fontWeight: 600 }}>
          Se connecter
        </Link>
      </header>

      <main style={{ flex: 1 }}>
        {/* 1. HERO SECTION */}
        <section style={{ padding: '100px 24px', textAlign: 'center', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--ink)', marginBottom: 24, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Gérez votre activité. Suivez vos ventes. Gardez le contrôle de votre stock.
            </h1>
            <p style={{ fontSize: 20, color: 'var(--ink-2)', marginBottom: 48, lineHeight: 1.5, fontWeight: 400 }}>
              Sokho Viandes vous permet de centraliser la gestion de votre activité de viande entre le Sénégal et le Togo : arrivages, stocks, clients, commandes, ventes, paiements et crédits.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" className="btn btn-primary" style={{ minHeight: 56, padding: '0 32px', fontSize: 18, borderRadius: 6 }}>
                Se connecter
              </Link>
              <a href="#fonctionnalites" className="btn btn-secondary" style={{ minHeight: 56, padding: '0 32px', fontSize: 18, borderRadius: 6 }}>
                Découvrir la solution <ArrowDown size={18} style={{ marginLeft: 8 }} />
              </a>
            </div>
          </div>
        </section>

        {/* 2. TOUT VOTRE COMMERCE AU MÊME ENDROIT */}
        <section id="fonctionnalites" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Tout votre commerce au même endroit</h2>
              <p style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 700, margin: '0 auto' }}>
                L'application remplace la gestion dispersée entre cahiers, calculatrice et conversations.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {[
                { icon: Box, title: 'Produits', text: 'Gérez vos produits, prix, unités et disponibilités.' },
                { icon: Package, title: 'Stock', text: 'Suivez les entrées, sorties et ajustements de stock.' },
                { icon: Users, title: 'Clients', text: 'Retrouvez vos clients, leurs commandes et leur historique.' },
                { icon: ShoppingCart, title: 'Ventes', text: 'Suivez les ventes réalisées, les montants encaissés et les crédits.' },
                { icon: CreditCard, title: 'Paiements', text: 'Enregistrez les paiements et suivez les montants restant à régler.' },
                { icon: Truck, title: 'Arrivages', text: 'Suivez les marchandises envoyées du Sénégal vers le Togo et leurs coûts.' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--surface)', padding: 32, border: '1px solid var(--line)', borderRadius: 8 }}>
                  <item.icon size={32} color="var(--green)" style={{ marginBottom: 20 }} />
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>{item.title}</h3>
                  <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. DE L'ARRIVAGE À LA VENTE */}
        <section style={{ padding: '80px 24px', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink)', marginBottom: 48 }}>De l'arrivage à la vente</h2>
            
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
              {[
                { step: '1', title: 'Arrivage', text: 'Enregistrez les marchandises reçues du Sénégal.' },
                { step: '2', title: 'Stock', text: 'Visualisez les quantités disponibles.' },
                { step: '3', title: 'Commande', text: 'Enregistrez les demandes des clients.' },
                { step: '4', title: 'Vente', text: 'Suivez les ventes réellement réalisées.' },
                { step: '5', title: 'Paiement', text: 'Suivez les paiements et les crédits restants.' },
              ].map((item, i) => (
                <div key={i} style={{ flex: '1 1 180px', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--bg)', border: '2px solid var(--green)', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 700, color: 'var(--green)', margin: '0 auto 16px' }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. POURQUOI SOKHO VIANDES ? */}
        <section style={{ padding: '80px 24px', background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink)', marginBottom: 48, textAlign: 'center' }}>Une gestion simple, claire et adaptée au commerce</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 40 }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Une meilleure visibilité</h3>
                <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5 }}>Retrouvez rapidement les informations importantes de votre activité.</p>
              </div>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Un suivi précis</h3>
                <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5 }}>Suivez les stocks, ventes, paiements et crédits.</p>
              </div>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Moins de calculs manuels</h3>
                <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5 }}>Les montants et soldes sont calculés automatiquement par l'application.</p>
              </div>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Une gestion centralisée</h3>
                <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5 }}>Produits, clients, fournisseurs, arrivages et dépenses sont réunis au même endroit.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. GÉRER LES CRÉDITS */}
        <section style={{ padding: '80px 24px', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink)', marginBottom: 24 }}>Gardez le contrôle sur les crédits clients</h2>
            <p style={{ fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              Suivez les montants payés, les soldes restants et l'historique des paiements pour chaque client.
            </p>
          </div>
        </section>

        {/* 6. APPEL À L'ACTION */}
        <section style={{ padding: '80px 24px', background: 'var(--bg)', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Prêt à mieux gérer votre activité ?</h2>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 32 }}>
            Centralisez vos produits, stocks, ventes, clients et paiements avec Sokho Viandes.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ minHeight: 56, padding: '0 32px', fontSize: 18, borderRadius: 6 }}>
            Accéder à mon espace <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </Link>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', paddingTop: 64, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
          
          {/* Colonne 1 */}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 18, marginBottom: 16 }}>Sokho Viandes</div>
            <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14, marginBottom: 12 }}>La gestion simple et claire de votre activité de viande.</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              Gestion des produits, stocks, ventes, clients, paiements et crédits.
            </p>
          </div>

          {/* Colonne 2 */}
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 16, marginBottom: 16 }}>Navigation</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li><Link href="/" style={{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: 14 }}>Accueil</Link></li>
              <li><Link href="/#fonctionnalites" style={{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: 14 }}>Fonctionnalités</Link></li>
              <li><Link href="/login" style={{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: 14 }}>Ventes</Link></li>
              <li><Link href="/" style={{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: 14 }}>À propos</Link></li>
              <li><Link href="/login" style={{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: 14 }}>Se connecter</Link></li>
            </ul>
          </div>

          {/* Colonne 3 */}
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 16, marginBottom: 16 }}>Gestion</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--ink-2)', fontSize: 14 }}>
              <li>Produits</li>
              <li>Stock</li>
              <li>Clients</li>
              <li>Commandes</li>
              <li>Ventes</li>
              <li>Paiements</li>
              <li>Arrivages</li>
              <li>Rapports</li>
            </ul>
          </div>

          {/* Colonne 4 */}
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 16, marginBottom: 16 }}>Votre espace</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.5 }}>
              Accédez à votre espace de gestion pour suivre votre activité.
            </p>
            <Link href="/login" className="btn btn-secondary" style={{ width: '100%', minHeight: 44, borderRadius: 6, fontWeight: 600, fontSize: 14 }}>
              Se connecter
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', borderTop: '1px solid var(--line)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--ink-2)', fontSize: 13 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
            <div>© {new Date().getFullYear()} Sokho Viandes. Tous droits réservés.</div>
            <div>Application de gestion commerciale</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, color: 'var(--muted)', fontSize: 12 }}>
            <div>
              Conception & développement — <strong>Cocou Fabrice Kpogo</strong> (Développeur Full-Stack)
            </div>
            <div>
              <a href="https://my-portfolio-fabiodel.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
