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
          padding: '3rem 4rem',
          overflow: 'hidden',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: 'clamp(2.5rem, 7vw, 7rem)',
            color: 'var(--color-dark)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {logoText}
        </h1>
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0',
          borderBottom: '1px solid #ddd',
        }}
      >
        {/* Column 1: Contact */}
        <div style={{ padding: '3rem 4rem', borderRight: '1px solid #ddd' }}>
          <h4
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
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <MapPin size={16} color="#c9a96e" style={{ flexShrink: 0, marginTop: '2px' }} />
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
              <Mail size={16} color="#c9a96e" style={{ flexShrink: 0 }} />
              <a
                href={`mailto:${email}`}
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
                {email}
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={16} color="#c9a96e" style={{ flexShrink: 0 }} />
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
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div style={{ padding: '3rem 4rem', borderRight: '1px solid #ddd' }}>
          <h4
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
          </h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => navigate(`/${link.toLowerCase()}`)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: '#666',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  transition: 'color 0.2s',
                  width: 'fit-content',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-dark)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; }}
              >
                {link}
              </button>
            ))}
          </nav>
        </div>

        {/* Column 3: Social */}
        <div style={{ padding: '3rem 4rem' }}>
          <h4
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
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.url}
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
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-dark)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; }}
              >
                {social.platform}
                <ExternalLink size={12} />
              </a>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{ width: '40px', height: '1px', background: '#c9a96e', marginBottom: '1rem' }} />
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.85rem', color: '#aaa' }}>
              Where dreams become reality
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          padding: '1.5rem 4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: '#aaa',
          }}
        >
          © 2024 FARYAL AL HOSARY. All rights reserved.
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
