import { useState } from 'react';

const portfolioImages = [
  { src: '/portfolio/gown-1.svg', alt: 'Gown 1', label: 'Vera Wang' },
  { src: '/portfolio/gown-2.svg', alt: 'Gown 2', label: 'Elie Saab' },
  { src: '/portfolio/gown-3.svg', alt: 'Gown 3', label: 'Zuhair Murad' },
  { src: '/portfolio/gown-4.svg', alt: 'Gown 4', label: 'Oscar de la Renta' },
  { src: '/portfolio/gown-5.svg', alt: 'Gown 5', label: 'Monique Lhuillier' },
];

function PortfolioImage({ src, alt, label, style }: { src: string; alt: string; label: string; style?: React.CSSProperties }) {
  const [errored, setErrored] = useState(false);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '2px', ...style }}>
      {errored ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a2420 0%, #2a3a35 50%, #1a2420 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <div style={{ width: '30px', height: '1px', background: '#c9a96e' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.8rem', color: '#c9a96e', letterSpacing: '0.1em' }}>
            {label}
          </span>
          <div style={{ width: '30px', height: '1px', background: '#c9a96e' }} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setErrored(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
      )}
    </div>
  );
}

export default function IntroGrid() {
  return (
    <section style={{ backgroundColor: 'var(--color-bg)', padding: '7rem 4rem', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>

        {/* Left: Text content */}
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
            The Collection
          </span>

          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-dark)', lineHeight: 1.05, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            LUXURY BRIDAL
          </h2>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-dark)', lineHeight: 1.05, marginBottom: '2rem', letterSpacing: '-0.01em' }}>
            & Occasion Wear
          </h2>

          <div style={{ width: '60px', height: '2px', background: '#c9a96e', marginBottom: '2rem' }} />

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: '#555', lineHeight: 1.8, maxWidth: '420px', marginBottom: '2.5rem' }}>
            Curating the finest bridal and occasion wear from the world's most coveted designers.
            Each piece tells a story of craftsmanship, elegance, and timeless beauty.
          </p>

          <div style={{ display: 'flex', gap: '3rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '2rem', color: 'var(--color-dark)' }}>500+</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Designer Gowns</div>
            </div>
            <div style={{ width: '1px', background: '#ddd' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '2rem', color: 'var(--color-dark)' }}>50+</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Global Designers</div>
            </div>
          </div>

          <div style={{ marginTop: '3rem' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.1rem', color: '#888' }}>
              Premium Collection — 2024
            </p>
          </div>
        </div>

        {/* Right: Masonry image grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto auto', gap: '12px', height: '580px' }}>
          {/* Tall left image */}
          <PortfolioImage
            src={portfolioImages[0].src}
            alt={portfolioImages[0].alt}
            label={portfolioImages[0].label}
            style={{ gridRow: '1 / 3', height: '100%' }}
          />

          {/* Top right */}
          <PortfolioImage
            src={portfolioImages[1].src}
            alt={portfolioImages[1].alt}
            label={portfolioImages[1].label}
            style={{ height: '200px' }}
          />

          {/* Mid right */}
          <PortfolioImage
            src={portfolioImages[2].src}
            alt={portfolioImages[2].alt}
            label={portfolioImages[2].label}
            style={{ height: '160px' }}
          />

          {/* Bottom left */}
          <PortfolioImage
            src={portfolioImages[3].src}
            alt={portfolioImages[3].alt}
            label={portfolioImages[3].label}
            style={{ height: '160px' }}
          />

          {/* Bottom right */}
          <PortfolioImage
            src={portfolioImages[4].src}
            alt={portfolioImages[4].alt}
            label={portfolioImages[4].label}
            style={{ height: '160px' }}
          />
        </div>
      </div>
    </section>
  );
}
