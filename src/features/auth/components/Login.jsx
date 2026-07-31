import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/solicitudes');
    } catch (err) {
      setError(
        err.response?.data?.message || 'No se pudo iniciar sesión. Revisa tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--upds-bg)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--upds-navy)',
            color: '#fff',
            marginBottom: '12px',
            boxShadow: '0 4px 10px rgba(15, 76, 129, 0.25)'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--upds-navy)', margin: '0 0 4px' }}>
            UPDS Academic Portal
          </h1>
          <p style={{ color: 'var(--upds-text-muted)', fontSize: '0.95rem' }}>
            Sistema de Licencias Académicas
          </p>
        </div>

        <div className="upds-card upds-card-accent" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--upds-navy)', marginBottom: '20px', textAlign: 'center' }}>
            Iniciar Sesión
          </h2>

          {error && (
            <div className="upds-alert upds-alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="upds-form-group">
              <label className="upds-label">Correo Electrónico</label>
              <input
                type="email"
                className="upds-input"
                placeholder="ejemplo@upds.edu.bo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="upds-form-group">
              <label className="upds-label">Contraseña</label>
              <input
                type="password"
                className="upds-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="upds-btn upds-btn-primary"
              style={{ width: '100%', padding: '11px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar al Portal'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--upds-text-muted)', marginTop: '20px' }}>
          © {new Date().getFullYear()} Universidad Privada Domingo Savio
        </p>
      </div>
    </div>
  );
}