import { Diamond, Sparkles, Users, Camera } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { servicesConfig } from '../config';

const iconMap: Record<string, LucideIcon> = {
  Diamond,
  Sparkles,
  Users,
  Camera,
};

export default function Services() {
  const navigate = useNavigate();
  const { subtitle, titleLine1, titleLine2Italic, services } = servicesConfig;

  return (
    <section style={{ backgroundColor: '#0d1310', padding: 'var(--section-py) var(--section-px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="services-grid section-inner">

        {/* Left column: text + CTA */}
        <div>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#c9a96e',
              display: 'block',
              marginBottom: '1.5rem',
            }}
          >
            {subtitle}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
              color: 'white',
              lineHeight: 1.05,
              marginBottom: '0.25rem',
              letterSpacing: '0.04em',
            }}
          >
            {titleLine1}
          </h2>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
              color: 'white',
              lineHeight: 1.05,
              marginBottom: '2.5rem',
            }}
          >
            {titleLine2Italic}
          </h2>

          <div style={{ width: '60px', height: '2px', background: '#c9a96e', marginBottom: '2rem' }} aria-hidden="true" />

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.9,
              maxWidth: '400px',
              marginBottom: '3rem',
            }}
          >
            From the first appointment to the final fitting, our team of luxury specialists
            ensures your rental experience is nothing short of extraordinary. We handle every
            detail so you can focus on what matters most — your special day.
          </p>

          <button
            onClick={() => navigate('/rentals')}
            aria-label="Book a consultation"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: '#c9a96e',
              color: '#0d1310',
              border: 'none',
              padding: '1rem 2.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background 0.2s, transform 0.2s',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d4b87d';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#c9a96e';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Book Consultation
          </button>
        </div>

        {/* Right column: 2x2 service cards */}
        <div className="services-cards-grid">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon];
            return (
              <div
                key={service.title}
                style={{
                  background: '#0d1310',
                  padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1.25rem, 2vw, 2rem)',
                  transition: 'background 0.3s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#111f1a'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#0d1310'; }}
              >
                <div style={{ marginBottom: '1.25rem' }} aria-hidden="true">
                  {IconComponent && (
                    <IconComponent
                      size={28}
                      color="#c9a96e"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'white',
                    marginBottom: '0.75rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  {service.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.7,
                  }}
                >
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}