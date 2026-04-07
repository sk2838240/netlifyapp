import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, FileText, Tag, HelpCircle, Home, Image, Palette, Settings,
  Calendar, ArrowRightLeft, Map, LogOut, Menu, X, PanelLeft, ExternalLink, Plus, FolderTree,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const pluginLinks = [
  { to: '/admin', icon: Layers, label: 'Dashboard', end: true },
  { to: '/admin/content/new', icon: FileText, label: 'Content' },
  { to: '/admin/media', icon: Image, label: 'Media Library' },
];

const generalLinks = [
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/tags', icon: Tag, label: 'Tags' },
  { to: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
  { to: '/admin/homepage', icon: Home, label: 'Homepage' },
  { to: '/admin/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/admin/redirects', icon: ArrowRightLeft, label: 'Redirects' },
  { to: '/admin/sitemap', icon: Map, label: 'Sitemap' },
  { to: '/admin/styles', icon: Palette, label: 'Styles' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getInitials = () => {
    const name = user?.name || user?.email || 'A';
    return name.charAt(0).toUpperCase();
  };

  const NavItem = ({ item, showLabel = false, onClick }: { item: typeof pluginLinks[0]; showLabel?: boolean; onClick?: () => void }) => (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `strapi-nav-item group flex items-center gap-3 rounded transition-colors duration-150 ${
          showLabel ? 'px-3 py-2.5' : 'p-2.5 justify-center'
        } ${
          isActive
            ? 'bg-primary-100 text-primary-600'
            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600'
        }`
      }
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {showLabel && <span className="text-sm font-medium">{item.label}</span>}
      {!showLabel && (
        <div className="pointer-events-none absolute left-full ml-2 px-2.5 py-1.5 bg-neutral-800 text-white text-xs font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
          {item.label}
        </div>
      )}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ===== MOBILE HEADER ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded hover:bg-neutral-100 text-neutral-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-neutral-800">CMS</span>
        </div>
        <div className="w-8" />
      </header>

      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-neutral-800/40 z-[60]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white z-[70] shadow-xl flex flex-col"
            >
              {/* Mobile brand */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-neutral-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-neutral-800">CMS Admin</span>
                    <p className="text-[10px] text-neutral-400 font-medium">Workspace</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile nav */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Plugins</p>
                {pluginLinks.map(item => (
                  <NavItem key={item.to} item={item} showLabel onClick={() => setMobileMenuOpen(false)} />
                ))}
                <div className="my-3 border-t border-neutral-200" />
                <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">General</p>
                {generalLinks.map(item => (
                  <NavItem key={item.to} item={item} showLabel onClick={() => setMobileMenuOpen(false)} />
                ))}
              </nav>

              {/* Mobile user */}
              <div className="p-3 border-t border-neutral-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-danger-600 hover:bg-danger-100 rounded transition-colors text-sm font-medium"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== DESKTOP SIDEBAR - Exactly matching Strapi ===== */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-neutral-200 z-30 transition-all duration-200 ${
        expanded ? 'w-60' : 'w-16'
      }`}>
        {/* Brand - Strapi exact style */}
        <div className="h-14 flex items-center justify-center border-b border-neutral-200 px-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-white" />
            </div>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-semibold text-neutral-800 whitespace-nowrap"
              >
                CMS Admin
              </motion.span>
            )}
          </div>
        </div>

        {/* Nav Items - Strapi exact spacing */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {pluginLinks.map(item => (
            <NavItem key={item.to} item={item} showLabel={expanded} />
          ))}
          <div className="my-2 mx-1 border-t border-neutral-200" />
          {generalLinks.map(item => (
            <NavItem key={item.to} item={item} showLabel={expanded} />
          ))}
        </nav>

        {/* Bottom: Collapse + User */}
        <div className="border-t border-neutral-200">
          {/* Expand/Collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 p-3 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <PanelLeft className={`w-5 h-5 transition-transform ${expanded ? '' : 'rotate-180'}`} />
            {expanded && <span className="text-xs font-medium">Collapse</span>}
          </button>

          {/* User menu */}
          <div className="relative border-t border-neutral-200">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center justify-center gap-2.5 p-3 hover:bg-neutral-100 transition-colors"
            >
              <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-neutral-600">{getInitials()}</span>
              </div>
              {expanded && (
                <span className="text-xs font-medium text-neutral-800 truncate flex-1 text-left">{user?.name || 'Admin'}</span>
              )}
            </button>

            {/* User dropdown - Strapi exact popup */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full left-2 right-2 mb-1 bg-white border border-neutral-200 rounded shadow-md overflow-hidden z-50"
                >
                  <div className="px-3 py-2.5 border-b border-neutral-200">
                    <p className="text-xs font-semibold text-neutral-800">{user?.name || 'Admin'}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{user?.email}</p>
                  </div>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View site
                  </a>
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger-600 hover:bg-danger-100 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className={`min-h-screen transition-all duration-200 ${expanded ? 'lg:ml-60' : 'lg:ml-16'}`}>
        <main className="p-4 lg:p-8 mt-14 lg:mt-0 pb-24 lg:pb-8">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-1 py-1 z-30">
        <div className="flex items-center justify-around">
          {[
            { to: '/admin', icon: Layers, label: 'Home' },
            { to: '/admin/content/new', icon: Plus, label: 'Create' },
            { to: '/admin/media', icon: Image, label: 'Media' },
            { to: '/admin/settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded transition-colors ${
                  isActive ? 'text-primary-600' : 'text-neutral-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}