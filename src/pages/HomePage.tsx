import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSiteStyles } from '../../hooks/useSiteStyles';
import { HomePageSection, FAQ } from '../../types';

export default function HomePage() {
  const { styles } = useSiteStyles();
  const [sections, setSections] = useState<HomePageSection[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/homepage').then((r) => r.json()).catch(() => ({ data: [] })),
      fetch('/api/faqs').then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([homeRes, faqRes]) => {
      setSections(homeRes.data || []);
      setFaqs(faqRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {sections
        .filter((s) => s.visible)
        .sort((a, b) => a.order - b.order)
        .map((section, i) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="py-20"
            style={{
              background: section.background_color || (i % 2 === 0 ? 'var(--bg-color)' : '#f9fafb'),
              color: section.text_color || 'var(--text-color)',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex flex-col ${section.image ? 'lg:flex-row' : ''} gap-12 items-center`}>
                <div className={`flex-1 ${section.image ? 'lg:w-1/2' : 'max-w-3xl mx-auto text-center'}`}>
                  {section.subtitle && (
                    <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--primary-color)' }}>
                      {section.subtitle}
                    </p>
                  )}
                  <h2 className="mb-6">{section.title}</h2>
                  <div
                    className="prose max-w-none"
                    style={{ fontSize: 'var(--paragraph-size)', lineHeight: 'var(--paragraph-line-height)' }}
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                  {section.button_text && section.button_url && (
                    <div className="mt-8">
                      <Link
                        to={section.button_url}
                        className="btn-primary inline-flex"
                        style={{
                          background: section.button_color || 'var(--button-color)',
                          color: 'var(--button-text-color)',
                        }}
                      >
                        {section.button_text}
                      </Link>
                    </div>
                  )}
                </div>
                {section.image && (
                  <div className="lg:w-1/2">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="rounded-xl shadow-lg w-full"
                      style={{ borderRadius: 'var(--border-radius)' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        ))}

      {/* Default sections if none configured */}
      {sections.length === 0 && (
        <>
          <section
            className="min-h-screen flex flex-col items-center justify-center text-center px-4"
            style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #f0f4f8 100%)' }}
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="mb-6">Welcome to Your Website</h1>
              <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                This is your homepage. Edit it from the admin panel to customize this content.
              </p>
              <Link to="/admin" className="btn-primary">
                Go to Admin Panel
              </Link>
            </motion.div>
          </section>
        </>
      )}

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <section className="py-20" style={{ background: '#f9fafb' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.sort((a, b) => a.order - b.order).map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                  style={{ borderRadius: 'var(--border-radius)' }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span
                      className="font-semibold pr-4"
                      style={{ fontSize: 'var(--faq-heading-size)', color: 'var(--text-color)' }}
                    >
                      {faq.question}
                    </span>
                    <span
                      className="text-xl font-light transition-transform"
                      style={{
                        color: 'var(--primary-color)',
                        transform: openFaq === faq.id ? 'rotate(45deg)' : 'rotate(0)',
                      }}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-5 pb-5"
                    >
                      <p
                        style={{ fontSize: 'var(--faq-content-size)', lineHeight: 'var(--paragraph-line-height)', color: 'var(--text-color)', opacity: 0.8 }}
                      >
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
