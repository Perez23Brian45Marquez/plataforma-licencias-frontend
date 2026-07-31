import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path || (path !== '/solicitudes' && location.pathname.startsWith(path));

  return (
    <header className="upds-navbar">
      <div className="upds-navbar-inner">
        <Link to="/solicitudes" className="upds-brand">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          <span>UPDS - Sistema de Licencias Académicas</span>
        </Link>

        <nav className="upds-nav-tabs">
          <Link
            to="/solicitudes"
            className={`upds-nav-tab ${isActive('/solicitudes') ? 'active' : ''}`}
          >
            Solicitudes
          </Link>

          {user.role === 'administrador' && (
            <>
              <Link
                to="/tipos-licencia"
                className={`upds-nav-tab ${isActive('/tipos-licencia') ? 'active' : ''}`}
              >
                Tipos de Licencia
              </Link>
              <Link
                to="/usuarios"
                className={`upds-nav-tab ${isActive('/usuarios') ? 'active' : ''}`}
              >
                Usuarios
              </Link>
            </>
          )}
        </nav>

        <div className="upds-user-section">
          <div className="upds-user-badge">
            <span>{user.name}</span>
            <span className="upds-user-role">({user.role})</span>
          </div>
          <button onClick={logout} className="upds-btn upds-btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', padding: '6px 12px', fontSize: '0.85rem' }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
