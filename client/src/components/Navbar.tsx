import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('faryal_lang', next);
  };

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
        direction: isRtl ? 'rtl' : 'ltr',
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
        {navLinkKeys.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
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

      {/* Right: lang toggle + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* EN / ع toggle */}
        <button
          onClick={toggleLang}
          title={isRtl ? 'Switch to English' : 'التبديل للعربي'}
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
      </div>
    </nav>
  );
}
