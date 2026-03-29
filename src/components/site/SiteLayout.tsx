import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavItem, SiteSettings } from '../../types';
import { useSiteStyles } from '../../hooks/useSiteStyles';

export default function SiteLayout() {
  const location = useLocation();
  const { styles } = useSiteStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm"
        style={{ background: 'var(--header-bg)', color: 'var(--header-text)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.site_name} className="h-10 w-auto" />
              ) : (
                <span className="text-xl font-bold">{settings.site_name}</span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.sort((a, b) => a.order - b.order).map((item) => (
                <Link
                  key={item.id}
                  to={item.url}
                  target={item.target}
                  className={`text-sm font-medium transition-colors hover:opacity-80`}
                  style={{
                    color: location.pathname === item.url ? 'var(--primary-color)' : 'inherit',
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/admin"
                className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-colors"
                style={{ background: 'var(--primary-color)' }}
              >
                Admin
              </Link>
            </nav>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
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
              className="md:hidden border-t"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
            >
              <nav className="flex flex-col px-4 py-4 gap-3">
                {navItems.sort((a, b) => a.order - b.order).map((item) => (
                  <Link
                    key={item.id}
                    to={item.url}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium py-2"
                    style={{ color: location.pathname === item.url ? 'var(--primary-color)' : 'inherit' }}
                  >
                    {item.label}
                  </Link>
                ))}
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
      <footer
        className="border-t"
        style={{ background: 'var(--footer-bg)', color: 'var(--footer-text)', borderColor: 'rgba(0,0,0,0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {settings.logo_url && (
                <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-auto" />
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
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--footer-text)' }}
                  >
                    <i className={`fab fa-${platform} text-xl`} />
                  </a>
                ) : null
              )}
            </div>
            <p className="text-sm">{settings.footer_text}</p>
          </div>
        </div>
      </footer>

      {settings.custom_footer && (
        <div dangerouslySetInnerHTML={{ __html: settings.custom_footer }} />
      )}
    </div>
  );
}
