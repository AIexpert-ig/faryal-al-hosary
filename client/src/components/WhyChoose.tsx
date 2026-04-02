import { useEffect, useRef, useState } from 'react';
import { whyChooseMeConfig } from '../config';

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);

  return count;
}

interface StatBlockProps {
  value: number;
  suffix: string;
  label: string;
  started: boolean;
}

function StatBlock({ value, suffix, label, started }: StatBlockProps) {
  const count = useCountUp(value, 1800, started);
  return (
    <div style={{ textAlign: 'center', padding: 'clamp(1.25rem, 3vw, 2rem) 1rem' }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'var(--color-dark)', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {count}{suffix}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
        {label}
      </div>
    </div>
  );
}

function FeatureImage({ src, alt, title }: { src: string; alt: string; title: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div style={{ width: '100%', height: '280px', background: 'linear-gradient(135deg, #e8e0d4 0%, #d4c9b8 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <div style={{ width: '30px', height: '1px', background: '#c9a96e' }} />
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: '#888', fontSize: '0.9rem' }}>{title}</span>
        <div style={{ width: '30px', height: '1px', background: '#c9a96e' }} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    />
  );
}

function ShowcaseImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a2420 0%, #0d1310 100%)', position: 'absolute', inset: 0 }} />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

export default function WhyChoose() {
  const { subtitle, titleRegular, titleItalic, stats, features, showcaseImage, showcaseTitle, showcaseSubtitle } = whyChooseMeConfig;
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--section-py) var(--section-px)' }}>
      <div className="section-inner">

        {/* Header */}
        <div style={{ marginBottom: '4rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: '1rem' }}>
            {subtitle}
          </span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'var(--color-dark)', lineHeight: 1.1 }}>
            {titleRegular}{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>
              {titleItalic}
            </span>
          </h2>
        </div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="why-stats-grid"
          aria-label="Key statistics"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{ borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }}
            >
              <StatBlock
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                started={statsStarted}
              />
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="why-features-grid">
          {features.map((feature) => (
            <div
              key={feature.title}
              style={{
                background: 'white',
                overflow: 'hidden',
                boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <FeatureImage src={feature.image} alt={feature.title} title={feature.title} />
              </div>
              <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-dark)', marginBottom: '0.75rem' }}>
                  {feature.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#666', lineHeight: 1.8 }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Wide showcase image */}
        <div
          className="why-showcase"
          style={{ position: 'relative', height: 'clamp(240px, 30vw, 400px)', overflow: 'hidden' }}
        >
          <ShowcaseImage src={showcaseImage} alt={`${showcaseTitle} showcase`} />
          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(13,19,16,0.8) 0%, rgba(13,19,16,0.3) 100%)', zIndex: 2 }} aria-hidden="true" />
          {/* Text */}
          <div
            className="why-showcase-text"
            style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 4vw, 4rem)' }}
          >
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: '1rem' }}>
              {showcaseSubtitle}
            </p>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(1.5rem, 4vw, 3.5rem)', color: 'white', lineHeight: 1.2 }}>
              {showcaseTitle}
            </h3>
            <div style={{ width: '60px', height: '1px', background: '#c9a96e', marginTop: '1.5rem' }} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}