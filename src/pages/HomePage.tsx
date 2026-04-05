import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap, Globe, ChevronDown, Star, Users, Award, TrendingUp } from 'lucide-react';
import { useSiteStyles } from '../hooks/useSiteStyles';
import { HomePageSection, FAQ } from '../types';

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
        <div className="w-10 h-10 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed with serverless architecture and edge caching for instant load times.' },
    { icon: Shield, title: 'Secure by Default', desc: 'Enterprise-grade security with automatic SSL, DDoS protection, and secure authentication.' },
    { icon: Globe, title: 'Global CDN', desc: 'Deployed to 300+ edge locations worldwide for blazing fast delivery anywhere.' },
    { icon: Sparkles, title: 'AI-Powered', desc: 'Smart content suggestions and automated optimization powered by modern AI.' },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime', icon: TrendingUp },
    { value: '50ms', label: 'Avg Response', icon: Zap },
    { value: '10K+', label: 'Happy Users', icon: Users },
    { value: '4.9/5', label: 'Rating', icon: Star },
  ];

  return (
    <div>
      {/* Admin CMS sections */}
      {sections.filter((s) => s.visible).sort((a, b) => a.order - b.order).map((section, i) => (
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
                  <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--primary-color)' }}>
                    {section.subtitle}
                  </p>
                )}
                <h2 className="mb-6">{section.title}</h2>
                <div className="prose max-w-none" style={{ fontSize: 'var(--paragraph-size)', lineHeight: 'var(--paragraph-line-height)' }} dangerouslySetInnerHTML={{ __html: section.content }} />
                {section.button_text && section.button_url && (
                  <div className="mt-8">
                    <Link to={section.button_url} className="btn-primary inline-flex" style={{ background: section.button_color || 'var(--button-color)', color: 'var(--button-text-color)' }}>
                      {section.button_text}
                    </Link>
                  </div>
                )}
              </div>
              {section.image && (
                <div className="lg:w-1/2">
                  <img src={section.image} alt={section.title} className="rounded-2xl shadow-xl w-full" />
                </div>
              )}
            </div>
          </div>
        </motion.section>
      ))}

      {/* Default sections when no CMS data */}
      {sections.length === 0 && (
        <>
          {/* Hero Section */}
          <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-3xl" />
              <div className="absolute bottom-20 left-10 w-[400px] h-[400px] rounded-full bg-purple-200/20 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-100/30 to-purple-100/30 blur-3xl" />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full mb-6 border border-blue-200/50">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Modern CMS Platform</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-gray-900">
                    Build Something <span className="gradient-text">Amazing</span> Today
                  </h1>
                  <p className="text-lg sm:text-xl mb-8 max-w-lg text-gray-600 leading-relaxed">
                    A modern content management platform with blazing-fast performance, beautiful design, and powerful editing tools.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/blog" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-blue-500/25">
                      Explore Blog <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/admin" className="btn-outline text-base px-8 py-3.5 bg-white/80 backdrop-blur-sm">
                      Admin Panel
                    </Link>
                  </div>
                  <div className="flex items-center gap-6 mt-10 pt-6 border-t border-gray-200/50">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-${400 + i * 100} to-purple-${400 + i * 100} flex items-center justify-center text-white text-xs font-bold`}>
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">2,500+</span>
                      <span className="text-gray-500"> happy users</span>
                    </div>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
                  <div className="relative">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100/50">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                        <div className="h-4 bg-blue-100 rounded-full w-full" />
                        <div className="h-4 bg-gray-100 rounded-full w-5/6" />
                        <div className="h-4 bg-purple-100 rounded-full w-2/3" />
                        <div className="h-4 bg-gray-100 rounded-full w-full" />
                        <div className="h-4 bg-blue-50 rounded-full w-4/5" />
                      </div>
                      <div className="mt-6 flex gap-3">
                        <div className="h-10 bg-blue-600 rounded-lg w-28" />
                        <div className="h-10 bg-gray-100 rounded-lg w-28" />
                      </div>
                    </div>
                    <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">Deployed</div>
                          <div className="text-xs text-gray-500">2 seconds ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <ChevronDown className="w-6 h-6 text-gray-400" />
            </motion.div>
          </section>

          {/* Stats Section */}
          <section className="py-16 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-4">
                        <Icon className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
                      </div>
                      <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 rounded-full text-sm font-semibold text-blue-700 mb-4">Features</span>
                <h2 className="mb-4">Everything You Need to Succeed</h2>
                <p className="text-lg max-w-2xl mx-auto text-gray-600">
                  Powerful tools and features designed to help you create, manage, and deliver content at scale.
                </p>
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-gray-900">{feat.title}</h3>
                      <p className="text-sm leading-relaxed text-gray-600">{feat.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* About / CTA Section */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--primary-color)' }}>About Us</p>
                  <h2 className="mb-6">Crafting Digital Experiences That Matter</h2>
                  <p className="text-lg mb-6" style={{ opacity: 0.7, lineHeight: 1.8 }}>
                    We believe in the power of great content and seamless user experiences. Our platform combines cutting-edge technology with intuitive design to help you build websites that stand out.
                  </p>
                  <p className="text-lg mb-8" style={{ opacity: 0.7, lineHeight: 1.8 }}>
                    Whether you're a solo creator, a growing startup, or an established enterprise, our tools scale with your needs and help you deliver exceptional digital experiences.
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Award Winning</div>
                        <div className="text-sm text-gray-500">Design & UX</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Enterprise</div>
                        <div className="text-sm text-gray-500">Grade Security</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { bg: 'bg-blue-600', text: 'text-white', value: '500+', label: 'Projects' },
                      { bg: 'bg-gray-50', text: 'text-gray-900', value: '24/7', label: 'Support' },
                      { bg: 'bg-gray-50', text: 'text-gray-900', value: '30+', label: 'Countries' },
                      { bg: 'bg-purple-600', text: 'text-white', value: '99%', label: 'Satisfaction' },
                    ].map((item, i) => (
                      <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`${item.bg} ${item.text} rounded-2xl p-8 text-center`}>
                        <div className="text-3xl font-extrabold mb-1">{item.value}</div>
                        <div className="text-sm opacity-80">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1f2937 100%)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                <p className="text-sm font-semibold uppercase tracking-widest mb-4 text-blue-400">Testimonials</p>
                <h2 className="mb-4 text-white">Loved by Creators Worldwide</h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { quote: "This platform transformed how we manage our content. The speed and reliability are unmatched.", name: "Sarah Johnson", role: "CEO, TechStart", stars: 5 },
                  { quote: "The best CMS experience I've ever had. Clean interface, powerful features, and excellent support.", name: "Michael Chen", role: "Lead Developer", stars: 5 },
                  { quote: "We migrated from WordPress and couldn't be happier. Our site loads 10x faster now.", name: "Emily Davis", role: "Marketing Director", stars: 5 },
                ].map((t, i) => (
                  <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed">"{t.quote}"</p>
                    <div>
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-sm text-gray-400">{t.role}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="mb-6">Ready to Get Started?</h2>
                <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ opacity: 0.65 }}>
                  Join thousands of creators and teams who trust our platform to power their digital presence.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/admin" className="btn-primary text-base px-10 py-4">
                    Start Building Now <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/blog" className="btn-outline text-base px-10 py-4">
                    Read Our Blog
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <section className="py-24" style={{ background: '#f9fafb' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--primary-color)' }}>FAQ</p>
              <h2>Frequently Asked Questions</h2>
            </motion.div>
            <div className="space-y-4">
              {faqs.sort((a, b) => a.order - b.order).map((faq, i) => (
                <motion.div key={faq.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                    <span className="font-semibold pr-4" style={{ fontSize: 'var(--faq-heading-size)', color: 'var(--text-color)' }}>{faq.question}</span>
                    <span className="text-xl font-light transition-transform duration-200 flex-shrink-0" style={{ color: 'var(--primary-color)', transform: openFaq === faq.id ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                  </button>
                  {openFaq === faq.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-6 pb-6">
                      <p style={{ fontSize: 'var(--faq-content-size)', lineHeight: 'var(--paragraph-line-height)', color: 'var(--text-color)', opacity: 0.75 }}>{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
