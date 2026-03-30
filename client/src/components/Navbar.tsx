import { useNavigate, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Inventory', path: '/inventory' },
  { label: 'Rentals', path: '/rentals' },
  { label: 'Customers', path: '/customers' },
  { label: 'Reports', path: '/reports' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      style={{
        backgroundColor: '#0d1310',
        padding: '0 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: '1rem',
          color: 'white',
          letterSpacing: '0.15em',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        FARYAL AL HOSARY
      </button>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: isActive ? '#c9a96e' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(201,169,110,0.08)' : 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                borderRadius: '2px',
                transition: 'color 0.2s, background 0.2s',
                borderBottom: isActive ? '2px solid #c9a96e' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
              }}
            >
              {link.label}
            </button>
          );
        })}
      </div>

      {/* User avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a96e 0%, #a07840 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>
            FA
          </span>
        </div>
      </div>
    </nav>
  );
}
