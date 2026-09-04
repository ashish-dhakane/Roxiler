import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      transition: 'var(--transition)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{
          textDecoration: 'none',
          color: 'var(--text-main)',
          fontWeight: 700,
          fontSize: '0.9375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          letterSpacing: '-0.02em'
        }}>
          <span style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>★</span>
          <span>StoreRatings</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" style={navLinkStyle}>Dashboard</Link>
                  <Link to="/admin/users" style={navLinkStyle}>Users</Link>
                  <Link to="/admin/stores" style={navLinkStyle}>Stores</Link>
                </>
              )}

              {user.role === 'store_owner' && (
                <Link to="/owner/dashboard" style={navLinkStyle}>My Store</Link>
              )}

              {user.role === 'user' && (
                <Link to="/stores" style={navLinkStyle}>Browse Stores</Link>
              )}

              <Link to="/change-password" style={navLinkStyle}>Change Password</Link>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginLeft: '8px',
                paddingLeft: '16px',
                borderLeft: '1px solid var(--border)'
              }}>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="btn btn-secondary btn-sm"
                  aria-label="Toggle display theme"
                  style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user.role?.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-secondary btn-sm"
                aria-label="Toggle display theme"
                style={{ padding: '4px 8px', fontSize: '0.9rem' }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Create Account</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

const navLinkStyle = {
  textDecoration: 'none',
  color: 'var(--text-muted)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  transition: 'color 0.15s ease',
};