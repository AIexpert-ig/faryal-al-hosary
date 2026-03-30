import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { testimonialsConfig } from '../config';
import { Star } from 'lucide-react';

function TestimonialImage({ src, alt, name }: { src: string; alt: string; name: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    const initials = name.split(' ').map((n) => n[0]).join('');
    return (
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #c9a96e 0%, #a07840 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>
          {initials}
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  );
}

export default function Testimonials() {
  const { subtitle, titleRegular, titleItalic, testimonials } = testimonialsConfig;

  return (
    <section style={{ backgroundColor: 'white', padding: '7rem 4rem', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: '1rem' }}>
            {subtitle}
          </span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'var(--color-dark)', lineHeight: 1.1 }}>
            {titleRegular}{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>
              {titleItalic}
            </span>
          </h2>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
          style={{ paddingBottom: '3.5rem' }}
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.name}>
              <div
                style={{
                  background: 'var(--color-bg)',
                  padding: '2.5rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '280px',
                }}
              >
                {/* Stars */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="#c9a96e" color="#c9a96e" />
                  ))}
                </div>

                {/* Quote */}
                <div style={{ marginBottom: '2rem', flex: 1 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '2rem',
                      color: '#c9a96e',
                      lineHeight: 0.5,
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    "
                  </span>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9rem',
                      color: '#555',
                      lineHeight: 1.8,
                      fontStyle: 'normal',
                    }}
                  >
                    {testimonial.text}
                  </p>
                </div>

                {/* Bride info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e5e5' }}>
                  <TestimonialImage src={testimonial.image} alt={testimonial.name} name={testimonial.name} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-dark)' }}>
                      {testimonial.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888', letterSpacing: '0.05em' }}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
