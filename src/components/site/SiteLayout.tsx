import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavItem, SiteSettings } from '../../types';
import { useSiteStyles } from '../../hooks/useSiteStyles';

export default function SiteLayout() {
  const location = useLocation();
  const { styles } = useSiteStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: '1', label: 'Home', url: '/', order: 0 },
    { id: '2', label: 'Blog', url: '/blog', order: 1 },
    { id: '3', label: 'Press', url: '/press', order: 2 },
  ]);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'My Website',
    site_tagline: '',
    logo_url: '',
    favicon_url: '',
    footer_text: `© ${new Date().getFullYear()} All Rights Reserved.`,
    social_links: {},
  });

  useEffect(() => {
    fetch('/api/navigation')
      .then((r) => r.json())
      .then((res) => { if (res.data?.length) setNavItems(res.data); })
      .catch(() => {});
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => { if (res.data) setSettings(res.data); })
      .catch(() => {});
  }, []);

  // Scroll listener for header background change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (settings.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }
    if (settings.site_name) {
      document.title = settings.site_name;
    }
    if (settings.custom_head) {
      const div = document.createElement('div');
      div.innerHTML = settings.custom_head;
      document.head.appendChild(div);
    }
  }, [settings]);

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50' 
            : isHomePage 
              ? 'bg-transparent' 
              : 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.site_name} className="h-10 w-auto" />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/20">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-lg font-bold transition-colors duration-300 ${
                    !scrolled && isHomePage ? 'text-white' : 'text-gray-900'
                  }`}>{settings.site_name}</span>
                </div>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.sort((a, b) => a.order - b.order).map((item) => (
                <Link
                  key={item.id}
                  to={item.url}
                  target={item.target}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === item.url 
                      ? (!scrolled && isHomePage ? 'text-white bg-white/15' : 'text-blue-600 bg-blue-50')
                      : (!scrolled && isHomePage ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/admin"
                className="ml-2 text-sm font-semibold px-5 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Admin
              </Link>
            </nav>

            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className={`md:hidden p-2 rounded-lg transition-colors ${
                !scrolled && isHomePage ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 shadow-lg"
            >
              <nav className="flex flex-col px-4 py-4 gap-1">
                {navItems.sort((a, b) => a.order - b.order).map((item) => (
                  <Link
                    key={item.id}
                    to={item.url}
                    onClick={() => setMobileOpen(false)}
                    className={`text-base font-medium px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.url ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 text-center text-sm font-semibold px-4 py-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Admin Panel
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0f1c] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-auto" />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-bold">{settings.site_name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {Object.entries(settings.social_links || {}).map(([platform, url]) =>
                url ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <i className={`fab fa-${platform} text-xl`} />
                  </a>
                ) : null
              )}
            </div>
            <p className="text-sm text-slate-500">{settings.footer_text}</p>
          </div>
        </div>
      </footer>

      {settings.custom_footer && (
        <div dangerouslySetInnerHTML={{ __html: settings.custom_footer }} />
      )}
    </div>
  );
}
