import { Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { footerConfig } from '../config';

export default function Footer() {
  const navigate = useNavigate();
  const { logoText, email, locationText, phone, navLinks, socialLinks } = footerConfig;

  return (
    <footer style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid #ddd' }}>
      {/* Large logo */}
      <div
        style={{
          borderBottom: '1px solid #ddd',
          padding: 'clamp(1.5rem, 3vw, 3rem) var(--section-px)',
          overflow: 'hidden',
        }}
      >
        <h2
          className="footer-logo-text"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: 'clamp(1.75rem, 7vw, 7rem)',
            color: 'var(--color-dark)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {logoText}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: '#c9a96e',
            marginTop: '0.5rem',
          }}
        >
          Luxury Bridal Rental
        </p>
      </div>

      {/* 3-column info */}
      <div className="footer-cols">
        {/* Column 1: Contact */}
        <div style={{ padding: 'clamp(1.5rem, 3vw, 3rem) var(--section-px)', borderRight: '1px solid #ddd' }}>
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-dark)',
              marginBottom: '1.5rem',
            }}
          >
            Contact
          </h3>
          <address style={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <MapPin size={16} color="#c9a96e" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: '#666',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                }}
              >
                {locationText}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={16} color="#c9a96e" style={{ flexShrink: 0 }} aria-hidden="true" />
              <a
                href={`mailto:${email}`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: '#666',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  wordBreak: 'break-all',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-dark)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; }}
              >
                {email}
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={16} color="#c9a96e" style={{ flexShrink: 0 }} aria-hidden="true" />
              <a
                href={`tel:${phone}`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: '#666',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-dark)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; }}
              >
                {phone}
              </a>
            </div>
          </address>
        </div>

        {/* Column 2: Navigation */}
        <div style={{ padding: 'clamp(1.5rem, 3vw, 3rem) var(--section-px)', borderRight: '1px solid #ddd' }}>
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-dark)',
              marginBottom: '1.5rem',
            }}
          >
            Navigation
          </h3>
          <nav aria-label="Footer navigation">
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0 }}>
              {navLinks.map((link) => (
                <li key={link}>
                  <button
                    onClick={() => navigate(`/${link.toLowerCase()}`)}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: '#666',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '0.25rem 0',
                      transition: 'color 0.2s',
                      width: 'fit-content',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-dark)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; }}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Column 3: Social */}
        <div style={{ padding: 'clamp(1.5rem, 3vw, 3rem) var(--section-px)' }}>
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-dark)',
              marginBottom: '1.5rem',
            }}
          >
            Follow Us
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0 }}>
            {socialLinks.map((social) => (
              <li key={social.platform}>
                <a
                  href={social.url}
                  aria-label={`Follow us on ${social.platform}`}
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: '#666',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    width: 'fit-content',
                    minHeight: '44px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-dark)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; }}
                >
                  {social.platform}
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '2rem' }}>
            <div style={{ width: '40px', height: '1px', background: '#c9a96e', marginBottom: '1rem' }} aria-hidden="true" />
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.85rem', color: '#aaa' }}>
              Where dreams become reality
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          padding: '1.5rem var(--section-px)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: '#aaa',
          }}
        >
          © {new Date().getFullYear()} FARYAL AL HOSARY. All rights reserved.
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: '#aaa',
          }}
        >
          Luxury Bridal Rental
        </span>
      </div>
    </footer>
  );
}