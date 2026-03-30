import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { faqConfig } from '../config';

export default function FAQ() {
  const navigate = useNavigate();
  const { subtitle, titleRegular, titleItalic, faqs } = faqConfig;

  return (
    <section style={{ backgroundColor: 'var(--color-bg)', padding: '7rem 4rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

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
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: '#888', lineHeight: 1.7, maxWidth: '500px', margin: '1.5rem auto 0' }}>
            Everything you need to know about our luxury bridal rental service.
          </p>
        </div>

        {/* Accordion */}
        <Accordion.Root type="single" collapsible style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {faqs.map((faq, index) => (
            <Accordion.Item
              key={index}
              value={`item-${index}`}
              style={{ borderBottom: '1px solid #ddd' }}
            >
              <Accordion.Header>
                <Accordion.Trigger
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.75rem 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '1rem',
                  }}
                  className="faq-trigger"
                  onMouseEnter={(e) => {
                    const q = e.currentTarget.querySelector('.faq-question') as HTMLElement;
                    if (q) q.style.color = '#c9a96e';
                  }}
                  onMouseLeave={(e) => {
                    const q = e.currentTarget.querySelector('.faq-question') as HTMLElement;
                    if (q) q.style.color = 'var(--color-dark)';
                  }}
                >
                  <span
                    className="faq-question"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: 'var(--color-dark)',
                      lineHeight: 1.4,
                      transition: 'color 0.2s',
                    }}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    color="#c9a96e"
                    style={{
                      flexShrink: 0,
                      transition: 'transform 0.3s ease',
                    }}
                    className="faq-chevron"
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content
                style={{
                  overflow: 'hidden',
                }}
              >
                <div style={{ paddingBottom: '1.75rem' }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9rem',
                      color: '#666',
                      lineHeight: 1.8,
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: '#888', marginBottom: '1.5rem' }}>
            Still have questions? We'd love to help.
          </p>
          <button
            onClick={() => navigate('/customers')}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: 'var(--color-dark)',
              color: 'white',
              border: 'none',
              padding: '1rem 2.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1a2a24';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-dark)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Contact Us
          </button>
        </div>
      </div>

      <style>{`
        .faq-trigger[data-state='open'] .faq-chevron {
          transform: rotate(180deg);
        }
      `}</style>
    </section>
  );
}
