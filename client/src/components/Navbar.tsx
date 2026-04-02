import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';

const navLinkKeys = [
  { key: 'dashboard', path: '/dashboard' },
  { key: 'inventory', path: '/inventory' },
  { key: 'rentals', path: '/rentals' },
  { key: 'customers', path: '/customers' },
  { key: 'reports', path: '/reports' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('faryal_lang', next);
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <nav
      className="app-navbar"
      style={{ direction: isRtl ? 'rtl' : 'ltr', position: 'relative' }}
      aria-label="Application navigation"
    >
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        aria-label="Go to home page"
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: 'clamp(0.75rem, 2vw, 1rem)',
          color: 'white',
          letterSpacing: '0.1em',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          minHeight: '44px',
        }}
      >
        FARYAL AL HOSARY
      </button>

      {/* Desktop Nav links */}
      <div
        className="navbar-links"
        role="navigation"
      >
        {navLinkKeys.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)',
                fontSize: '0.8rem',
                letterSpacing: isRtl ? '0' : '0.08em',
                textTransform: isRtl ? 'none' : 'uppercase',
                color: isActive ? '#c9a96e' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(201,169,110,0.08)' : 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                borderRadius: '2px',
                transition: 'color 0.2s, background 0.2s',
                borderBottom: isActive ? '2px solid #c9a96e' : '2px solid transparent',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
              }}
            >
              {t(`nav.${link.key}`)}
            </button>
          );
        })}
      </div>

      {/* Right: lang toggle + avatar + hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {/* EN / ع toggle */}
        <button
          onClick={toggleLang}
          title={isRtl ? 'Switch to English' : 'التبديل للعربي'}
          aria-label={isRtl ? 'Switch to English' : 'Switch to Arabic'}
          style={{
            fontFamily: isRtl ? 'var(--font-sans)' : 'var(--font-arabic)',
            fontSize: isRtl ? '0.75rem' : '1rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.75)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            padding: '0.3rem 0.75rem',
            borderRadius: '2px',
            letterSpacing: isRtl ? '0.08em' : '0',
            transition: 'background 0.2s, color 0.2s',
            lineHeight: 1.5,
            minHeight: '44px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(201,169,110,0.15)';
            e.currentTarget.style.color = '#c9a96e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
          }}
        >
          {t('common.langToggle')}
        </button>

        {/* Avatar */}
        <div
          role="img"
          aria-label="User avatar: FA"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a96e 0%, #a07840 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>
            FA
          </span>
        </div>

        {/* Hamburger (mobile only, via CSS display:none on desktop) */}
        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            display: 'none', // hidden on desktop via CSS
            minHeight: '44px',
            minWidth: '44px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {mobileOpen ? <X size={22} color="white" /> : <Menu size={22} color="white" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            background: '#0d1310',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '0.75rem var(--section-px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            zIndex: 99,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
          role="navigation"
          aria-label="Mobile navigation menu"
        >
          {navLinkKeys.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)',
                  fontSize: '0.95rem',
                  letterSpacing: isRtl ? '0' : '0.06em',
                  textTransform: isRtl ? 'none' : 'uppercase',
                  color: isActive ? '#c9a96e' : 'rgba(255,255,255,0.75)',
                  background: isActive ? 'rgba(201,169,110,0.08)' : 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  padding: '0.875rem 0',
                  textAlign: isRtl ? 'right' : 'left',
                  width: '100%',
                  minHeight: '44px',
                  transition: 'color 0.2s',
                }}
              >
                {t(`nav.${link.key}`)}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}