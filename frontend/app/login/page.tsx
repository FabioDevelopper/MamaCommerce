'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken } from '../../lib/api';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@sokho-viandes.tg');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
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
      setAuthToken(d.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Identifiants incorrects ou compte inactif.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* HEADER MINIMAL */}
      <header style={{ padding: '24px 40px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 40, height: 40, background: 'var(--green)', borderRadius: 8, display: 'grid', placeItems: 'center', fontWeight: 900, color: '#fff' }}>SV</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--ink)' }}>Sokho Viandes</div>
        </Link>
      </header>

      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 24 }}>
        <form onSubmit={handleSubmit} className="card" style={{ width: '100%', maxWidth: 520, padding: 48, border: '2px solid var(--ink)' }}>
          <h1 style={{ fontSize: 32, marginBottom: 8, textAlign: 'center' }}>Connexion</h1>
          <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: 32 }}>Veuillez vous identifier pour accéder à votre espace de gestion.</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="login-email">Adresse Email</label>
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

          <div className="form-group" style={{ marginBottom: 32, position: 'relative' }}>
            <label className="form-label" htmlFor="login-password">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 60 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--ink)'
                }}
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', minHeight: 64, fontSize: 20 }} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  );
}
