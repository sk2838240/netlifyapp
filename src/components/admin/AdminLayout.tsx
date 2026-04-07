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
  Bell,
  Search,
  User,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navSections = [
  {
    title: 'Main',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/admin/content/new', icon: FileText, label: 'New Content' },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
      { to: '/admin/tags', icon: Tags, label: 'Tags' },
      { to: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
      { to: '/admin/homepage', icon: Home, label: 'Homepage' },
      { to: '/admin/media', icon: Image, label: 'Media Library' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { to: '/admin/schedule', icon: Calendar, label: 'Schedule' },
      { to: '/admin/redirects', icon: ArrowRightLeft, label: 'Redirects' },
      { to: '/admin/sitemap', icon: Map, label: 'Sitemap' },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { to: '/admin/styles', icon: Palette, label: 'Styles' },
      { to: '/admin/navigation', icon: Navigation, label: 'Navigation' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Get current page title from nav items
  const getCurrentPageTitle = () => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)) {
          return item.label;
        }
      }
    }
    return 'Dashboard';
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {navSections.map((section) => (
        <div key={section.title} className="mb-6">
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            {section.title}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 mx-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/20">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">CMS Admin</span>
          </div>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-[#0f1629] z-50 shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                      <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="font-bold text-white text-sm">CMS Admin</h1>
                      <p className="text-[10px] text-blue-400/70 font-medium tracking-wider uppercase">Workspace</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <nav className="flex-1 py-4 overflow-y-auto admin-scroll">
                <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
              </nav>
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always Expanded */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-[#0f1629] z-30 shadow-2xl">
        {/* Brand */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-wide">CMS Admin</h1>
              <p className="text-[10px] text-blue-400/70 font-medium tracking-wider uppercase">Workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 overflow-y-auto admin-scroll">
          <SidebarContent />
        </nav>

        {/* User section at bottom */}
        <div className="p-4 border-t border-white/5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors text-xs mb-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-[260px] min-h-screen">
        {/* Top Header */}
        <header className="hidden lg:block sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="flex items-center justify-between px-8 h-16">
            <div className="flex items-center gap-6 flex-1">
              <h2 className="text-lg font-semibold text-gray-800">{getCurrentPageTitle()}</h2>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100/80 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>

              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200/60">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden xl:block">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name || 'Admin'}</p>
                  <p className="text-[11px] text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 mt-14 lg:mt-0 pb-24 lg:pb-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 px-2 py-1.5 z-30">
        <div className="flex items-center justify-around">
          {[
            { to: '/admin', icon: LayoutDashboard, label: 'Home' },
            { to: '/admin/content/new', icon: FileText, label: 'Create' },
            { to: '/admin/media', icon: Image, label: 'Media' },
            { to: '/admin/settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
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
