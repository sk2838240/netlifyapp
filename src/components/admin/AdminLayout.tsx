import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  HelpCircle,
  Home,
  Image,
  Palette,
  Navigation,
  Settings,
  Calendar,
  ArrowRightLeft,
  Map,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  ExternalLink,
  PanelLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* Strapi-inspired nav: icon-only sidebar on desktop, grouped sections */

const pluginLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/content/new', icon: FileText, label: 'Content' },
  { to: '/admin/media', icon: Image, label: 'Media Library' },
];

const generalLinks = [
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/tags', icon: Tags, label: 'Tags' },
  { to: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
  { to: '/admin/homepage', icon: Home, label: 'Homepage' },
  { to: '/admin/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/admin/redirects', icon: ArrowRightLeft, label: 'Redirects' },
  { to: '/admin/sitemap', icon: Map, label: 'Sitemap' },
  { to: '/admin/styles', icon: Palette, label: 'Styles' },
  { to: '/admin/navigation', icon: Navigation, label: 'Navigation' },
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

  /* Strapi-style NavLink item */
  const SideNavItem = ({ item, showLabel = false, onClick }: { item: typeof pluginLinks[0]; showLabel?: boolean; onClick?: () => void }) => (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `strapi-nav-link group relative flex items-center gap-3 rounded-[4px] transition-all duration-150 ${
          showLabel ? 'px-3 py-2.5' : 'p-2.5 justify-center'
        } ${
          isActive
            ? 'bg-[#dcdce4] text-[#32324d]'
            : 'text-[#666687] hover:bg-[#eaeaef] hover:text-[#32324d]'
        }`
      }
    >
      <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
      {showLabel && <span className="text-[13px] font-medium">{item.label}</span>}
      {!showLabel && (
        <div className="pointer-events-none absolute left-full ml-2 px-2.5 py-1.5 bg-[#32324d] text-white text-xs font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-[100] shadow-lg">
          {item.label}
        </div>
      )}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-[#f6f6f9]">
      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#dcdce4] px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-[4px] hover:bg-[#eaeaef] text-[#666687] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] bg-[#4945ff] rounded-[6px] flex items-center justify-center">
            <LayoutDashboard className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
          </div>
          <span className="text-sm font-bold text-[#32324d]">CMS</span>
        </div>
        <div className="w-8" />
      </div>

      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-[#32324d]/40 z-[60]"
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
              <div className="h-14 px-4 flex items-center justify-between border-b border-[#eaeaef]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#4945ff] rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#32324d]">CMS Admin</span>
                    <p className="text-[10px] text-[#a5a5ba] font-medium">Workspace</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-[4px] hover:bg-[#eaeaef] text-[#666687]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile nav */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a5a5ba]">Plugins</p>
                {pluginLinks.map(item => (
                  <SideNavItem key={item.to} item={item} showLabel onClick={() => setMobileMenuOpen(false)} />
                ))}
                <div className="my-3 border-t border-[#eaeaef]" />
                <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a5a5ba]">General</p>
                {generalLinks.map(item => (
                  <SideNavItem key={item.to} item={item} showLabel onClick={() => setMobileMenuOpen(false)} />
                ))}
              </nav>

              {/* Mobile user */}
              <div className="p-3 border-t border-[#eaeaef]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[#d02b20] hover:bg-red-50 rounded-[4px] transition-colors text-[13px] font-medium"
                >
                  <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== DESKTOP SIDEBAR (Strapi icon-only style) ===== */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-[#dcdce4] z-30 transition-all duration-200 ${
        expanded ? 'w-[240px]' : 'w-[60px]'
      }`}>
        {/* Brand */}
        <div className="h-14 flex items-center justify-center border-b border-[#eaeaef] px-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-[26px] h-[26px] bg-[#4945ff] rounded-[6px] flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
            </div>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold text-[#32324d] whitespace-nowrap"
              >
                CMS Admin
              </motion.span>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 strapi-scrollbar">
          {pluginLinks.map(item => (
            <SideNavItem key={item.to} item={item} showLabel={expanded} />
          ))}
          <div className="my-2 mx-1 border-t border-[#eaeaef]" />
          {generalLinks.map(item => (
            <SideNavItem key={item.to} item={item} showLabel={expanded} />
          ))}
        </nav>

        {/* Bottom: User + Collapse */}
        <div className="border-t border-[#eaeaef]">
          {/* Expand/Collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 p-3 text-[#666687] hover:bg-[#eaeaef] transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <PanelLeft className={`w-[18px] h-[18px] transition-transform ${expanded ? '' : 'rotate-180'}`} strokeWidth={1.8} />
            {expanded && <span className="text-xs font-medium">Collapse</span>}
          </button>

          {/* User menu */}
          <div className="relative border-t border-[#eaeaef]">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center justify-center gap-2.5 p-3 hover:bg-[#eaeaef] transition-colors"
            >
              <div className="w-[26px] h-[26px] bg-[#eaeaef] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-semibold text-[#666687]">{getInitials()}</span>
              </div>
              {expanded && (
                <span className="text-xs font-medium text-[#32324d] truncate flex-1 text-left">{user?.name || 'Admin'}</span>
              )}
            </button>

            {/* User dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full left-2 right-2 mb-1 bg-white border border-[#dcdce4] rounded-[4px] shadow-lg overflow-hidden z-50"
                >
                  <div className="px-3 py-2.5 border-b border-[#eaeaef]">
                    <p className="text-xs font-semibold text-[#32324d]">{user?.name || 'Admin'}</p>
                    <p className="text-[10px] text-[#a5a5ba] mt-0.5">{user?.email}</p>
                  </div>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[#666687] hover:bg-[#eaeaef] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View site
                  </a>
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#d02b20] hover:bg-red-50 transition-colors"
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

      {/* ===== MAIN CONTENT ===== */}
      <div className={`min-h-screen transition-all duration-200 ${expanded ? 'lg:ml-[240px]' : 'lg:ml-[60px]'}`}>
        <main className="p-4 lg:p-8 mt-14 lg:mt-0 pb-24 lg:pb-8">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#dcdce4] px-1 py-1 z-30">
        <div className="flex items-center justify-around">
          {[
            { to: '/admin', icon: LayoutDashboard, label: 'Home' },
            { to: '/admin/content/new', icon: FileText, label: 'Content' },
            { to: '/admin/media', icon: Image, label: 'Media' },
            { to: '/admin/settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-[4px] transition-colors ${
                  isActive ? 'text-[#4945ff]' : 'text-[#a5a5ba]'
                }`
              }
            >
              <item.icon className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
