import { useState } from 'react';
import { Link } from 'react-router-dom';
import { featuredProjectsConfig } from '../config';

interface ProjectImageProps {
  src: string;
  alt: string;
  title: string;
}

function ProjectImage({ src, alt, title }: ProjectImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        aria-label={title}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '300px',
          background: 'linear-gradient(135deg, #1a2520 0%, #0d1310 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ width: '40px', height: '1px', background: '#c9a96e' }} />
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', color: '#c9a96e' }}>
          {title}
        </span>
        <div style={{ width: '40px', height: '1px', background: '#c9a96e' }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease', minHeight: '300px' }}
    />
  );
}

export default function FeaturedProjects() {
  const { subtitle, titleRegular, titleItalic, projects } = featuredProjectsConfig;

  return (
    <section style={{ backgroundColor: '#0d1310', padding: 'var(--section-py) var(--section-px)' }}>
      <div className="section-inner">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: '1rem' }}>
            {subtitle}
          </span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'white', lineHeight: 1.1 }}>
            {titleRegular}{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>
              {titleItalic}
            </span>
          </h2>
        </div>

        {/* Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={project.id}
                className="featured-project-row"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Image side */}
                <div
                  style={{
                    order: isEven ? 1 : 2,
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: '280px',
                  }}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1)';
                  }}
                >
                  <ProjectImage src={project.image} alt={`${project.title} gown`} title={project.title} />
                </div>

                {/* Text side */}
                <div
                  className="featured-text-pad"
                  style={{
                    order: isEven ? 2 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: 'clamp(2rem, 4vw, 4rem) clamp(1.5rem, 5vw, 5rem)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: '#c9a96e',
                      marginBottom: '1.5rem',
                      display: 'block',
                    }}
                  >
                    {project.category}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 700,
                      fontSize: 'clamp(1.25rem, 2.5vw, 2.2rem)',
                      color: 'white',
                      lineHeight: 1.2,
                      marginBottom: '1.5rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {project.title}
                  </h3>
                  <div style={{ width: '40px', height: '1px', background: '#c9a96e', marginBottom: '1.5rem' }} aria-hidden="true" />
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: 1.8,
                      marginBottom: '2.5rem',
                      maxWidth: '380px',
                    }}
                  >
                    {project.description}
                  </p>
                  <Link
                    to="/inventory"
                    aria-label={`View details for ${project.title}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'white',
                      textDecoration: 'none',
                      paddingBottom: '4px',
                      borderBottom: '1px solid rgba(201,169,110,0.5)',
                      width: 'fit-content',
                      transition: 'color 0.2s, border-color 0.2s',
                      minHeight: '44px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#c9a96e';
                      e.currentTarget.style.borderBottomColor = '#c9a96e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderBottomColor = 'rgba(201,169,110,0.5)';
                    }}
                  >
                    View Details
                    <span aria-hidden="true" style={{ fontSize: '1rem' }}>→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}