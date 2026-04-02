import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { heroConfig } from '../config';

export default function Hero() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section
      ref={heroRef}
      className="hero-section"
      style={{
        backgroundColor: '#0d1310',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      {/* Navigation */}
      <nav
        className="hero-nav"
        style={{ position: 'relative', zIndex: 10 }}
        aria-label="Main navigation"
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'white',
            letterSpacing: '0.15em',
          }}
        >
          {heroConfig.brandName}
        </span>

        {/* Desktop links */}
        <div className="hero-nav-links" role="navigation">
          {heroConfig.navLinks.map((link) => (
            <button
              key={link}
              onClick={() => navigate(`/${link.toLowerCase()}`)}
              aria-label={`Go to ${link}`}
              style={{
                fontFamily: 'var(--font-body)',
                color: 'rgba(255,255,255,0.75)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
                padding: '0.5rem 0.75rem',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')
              }
            >
              {link}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`nav-hamburger${mobileMenuOpen ? ' open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          style={{ color: 'white' }}
        >
          {mobileMenuOpen ? (
            <X size={22} color="white" />
          ) : (
            <Menu size={22} color="white" />
          )}
        </button>

        {/* Mobile dropdown */}
        <div
          className={`hero-mobile-menu${mobileMenuOpen ? ' open' : ''}`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          {heroConfig.navLinks.map((link) => (
            <button
              key={link}
              onClick={() => {
                navigate(`/${link.toLowerCase()}`);
                setMobileMenuOpen(false);
              }}
              style={{
                fontFamily: 'var(--font-body)',
                color: 'rgba(255,255,255,0.8)',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                fontSize: '1rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
                padding: '0.875rem 0',
                textAlign: 'left',
                width: '100%',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')
              }
            >
              {link}
            </button>
          ))}
        </div>
      </nav>

      {/* Background ELEGANCE text */}
      <div
        className="hero-background-text"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: 'clamp(4rem, 18vw, 22rem)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.06)',
            letterSpacing: '0.05em',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {heroConfig.backgroundText}
        </span>
      </div>

      {/* Gold decorative line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '4rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 6,
        }}
      >
        <div
          style={{
            width: '2px',
            height: '120px',
            background:
              'linear-gradient(to bottom, transparent, #c9a96e, transparent)',
          }}
        />
      </div>

      {/* Center content: Hero image */}
      <div
        id="main-content"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 5,
          paddingBottom: '0',
        }}
      >
        <img
          src={heroConfig.heroImage}
          alt="Elegant bride in a luxurious gown"
          loading="eager"
          style={{
            maxHeight: '78vh',
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 60px rgba(201,169,110,0.2))',
          }}
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent) {
              const placeholder = document.createElement('div');
              placeholder.style.cssText =
                'width:240px;height:420px;border:1px solid rgba(201,169,110,0.3);display:flex;align-items:center;justify-content:center;';
              placeholder.innerHTML =
                '<span style="color:rgba(201,169,110,0.5);font-family:serif;font-style:italic;font-size:1.1rem;">Bride Silhouette</span>';
              parent.appendChild(placeholder);
            }
          }}
        />
      </div>

      {/* Bottom-right overlay text */}
      <div
        className="hero-overlay-text"
        style={{
          position: 'absolute',
          bottom: '4rem',
          right: '4rem',
          zIndex: 10,
          textAlign: 'right',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.25rem, 3vw, 2.5rem)',
            color: 'white',
            lineHeight: 1.3,
          }}
        >
          {heroConfig.overlayText}
        </p>
        <div
          style={{
            width: '60px',
            height: '1px',
            background: '#c9a96e',
            marginLeft: 'auto',
            marginTop: '1rem',
          }}
        />
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '40px',
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
          }}
        />
      </div>
    </section>
  );
}