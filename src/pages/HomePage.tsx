import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap, Globe, ChevronDown, Star, Users, Award, TrendingUp, CheckCircle, Rocket, BarChart3 } from 'lucide-react';
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
    { icon: Zap, title: 'Lightning Fast', desc: 'Deploy globally in seconds with edge-optimized infrastructure. Sub-50ms response times worldwide.' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Bank-level security with automatic SSL, DDoS protection, and SOC 2 compliant infrastructure.' },
    { icon: Globe, title: 'Global CDN', desc: '300+ edge locations ensure your content loads fast regardless of where your users are.' },
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track performance with detailed analytics, visitor insights, and conversion metrics.' },
  ];

  const stats = [
    { value: '99.99%', label: 'Uptime SLA', icon: TrendingUp },
    { value: '<50ms', label: 'Global Latency', icon: Zap },
    { value: '50K+', label: 'Active Sites', icon: Globe },
    { value: '4.9/5', label: 'User Rating', icon: Star },
  ];

  const benefits = [
    'Automated builds and deployments',
    'Custom domains with HTTPS',
    'Team collaboration tools',
    'Form handling and functions',
    'Edge functions for serverless logic',
    'Instant rollbacks',
  ];

  return (
    <div>
      {/* CMS Sections from database */}
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
                    <Link to={section.button_url} className="btn-primary" style={{ background: section.button_color || 'var(--button-color)', color: 'var(--button-text-color)' }}>
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
          {/* Hero Section - Redesigned with stronger value prop */}
          <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Background patterns */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-200/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-200/10 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-blue-50/20 to-purple-50/20 blur-3xl" />
              {/* Grid pattern */}
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
              <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full mb-8 border border-blue-200/50 shadow-sm">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Now with AI-powered content suggestions</span>
                  </div>
                  
                  {/* Main heading */}
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 leading-[1.1]">
                    Build faster.
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Deploy smarter.</span>
                  </h1>
                  
                  {/* Subheading */}
                  <p className="text-xl sm:text-2xl mb-10 max-w-xl text-gray-600 leading-relaxed">
                    The modern platform for building, deploying, and scaling your web applications with confidence.
                  </p>
                  
                  {/* CTA buttons */}
                  <div className="flex flex-wrap gap-5 mb-12">
                    <Link to="/admin" className="btn-primary text-base px-8 py-4 shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30">
                      <Rocket className="w-5 h-5" />
                      Start Building Free
                    </Link>
                    <Link to="/blog" className="btn-secondary text-base px-8 py-4">
                      View Documentation
                    </Link>
                  </div>
                  
                  {/* Trust indicators */}
                  <div className="flex items-center gap-8 pt-8 border-t border-gray-200/60">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Free tier available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">No credit card</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Hero visual */}
                <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }} className="hidden lg:block">
                  <div className="relative">
                    {/* Main card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100/50 overflow-hidden">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <span className="text-xs text-gray-400 font-mono ml-2">deploy-preview-123</span>
                      </div>
                      
                      {/* Code-like content */}
                      <div className="space-y-4 font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-500">Installing dependencies...</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-500">Building application...</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-500">Optimizing assets...</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">→</span>
                          <span className="text-gray-900">Deployed to Edge Network</span>
                        </div>
                      </div>
                      
                      {/* Deploy stats */}
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">2.3s</div>
                            <div className="text-xs text-gray-500">Deploy time</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">14MB</div>
                            <div className="text-xs text-gray-500">Bundle size</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">100%</div>
                            <div className="text-xs text-gray-500">Uptime</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating badges */}
                    <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">Live</div>
                          <div className="text-xs text-gray-500">Production</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">Global</div>
                          <div className="text-xs text-gray-500">300+ edges</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Scroll indicator */}
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <ChevronDown className="w-6 h-6 text-gray-400" />
            </motion.div>
          </section>

          {/* Stats Section - Clean modern design */}
          <section className="py-20 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 mb-4">
                        <Icon className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="text-4xl font-extrabold text-gray-900 mb-2">{stat.value}</div>
                      <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Features Section - Grid with hover effects */}
          <section className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 rounded-full text-sm font-semibold text-blue-700 mb-4">Platform Features</span>
                <h2 className="mb-6 text-4xl font-bold text-gray-900">Everything you need to ship faster</h2>
                <p className="text-xl max-w-2xl mx-auto text-gray-600 leading-relaxed">
                  Built for developers who want to focus on code, not infrastructure.
                </p>
              </motion.div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <motion.div 
                      key={feat.title} 
                      initial={{ opacity: 0, y: 20 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      viewport={{ once: true }} 
                      transition={{ delay: i * 0.1 }}
                      className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900 text-center">{feat.title}</h3>
                      <p className="text-base leading-relaxed text-gray-600 text-center">{feat.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Benefits Section - Clean list */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 rounded-full text-sm font-semibold text-violet-700 mb-4">Why Choose Us</span>
                  <h2 className="mb-6 text-4xl font-bold text-gray-900">Ship with confidence</h2>
                  <p className="text-xl mb-8 text-gray-600 leading-relaxed">
                    Join thousands of developers who've switched to our platform for superior performance, reliability, and developer experience.
                  </p>
                  <div className="space-y-4">
                    {benefits.map((benefit, i) => (
                      <motion.div 
                        key={benefit} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-lg text-gray-700">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { bg: 'bg-gradient-to-br from-blue-600 to-blue-700', text: 'text-white', value: '50K+', label: 'Active Projects', icon: Globe },
                      { bg: 'bg-gray-50', text: 'text-gray-900', value: '24/7', label: 'Expert Support', icon: Award },
                      { bg: 'bg-gray-50', text: 'text-gray-900', value: '30s', label: 'Avg Deploy', icon: Zap },
                      { bg: 'bg-gradient-to-br from-violet-600 to-violet-700', text: 'text-white', value: '99%', label: 'Satisfaction', icon: Star },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div 
                          key={item.label} 
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className={`${item.bg} ${item.text} rounded-2xl p-8 text-center relative overflow-hidden`}
                        >
                          <div className="relative z-10">
                            <Icon className="w-6 h-6 mx-auto mb-3 opacity-50" />
                            <div className="text-4xl font-extrabold mb-1">{item.value}</div>
                            <div className="text-sm opacity-80">{item.label}</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-4xl font-bold text-white mb-6">Ready to ship your next project?</h2>
                <p className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto">
                  Start building today. No setup required, no credit card needed.
                </p>
                <div className="flex flex-wrap justify-center gap-5">
                  <Link to="/admin" className="btn-primary text-base px-10 py-4 bg-white text-gray-900 hover:bg-gray-100 shadow-xl">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/blog" className="btn-secondary text-base px-10 py-4 border-gray-600 text-white bg-transparent hover:bg-white/10">
                    Read the Blog
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 rounded-full text-sm font-semibold text-blue-700 mb-4">FAQ</span>
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </motion.div>
            
            <div className="space-y-4">
              {faqs.sort((a, b) => a.order - b.order).map((faq, i) => (
                <motion.div 
                  key={faq.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} 
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-lg text-gray-900 pr-4">{faq.question}</span>
                    <span 
                      className="text-2xl font-light transition-transform duration-200 flex-shrink-0 text-blue-600" 
                      style={{ transform: openFaq === faq.id ? 'rotate(45deg)' : 'rotate(0)' }}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === faq.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      className="px-6 pb-6"
                    >
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
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