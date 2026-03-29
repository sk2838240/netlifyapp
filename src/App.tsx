import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import SiteLayout from './components/site/SiteLayout';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Site Pages
import HomePage from './pages/HomePage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import PressListPage from './pages/PressListPage';
import PressDetailPage from './pages/PressDetailPage';
import StaticPage from './pages/StaticPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContentEditor from './pages/admin/ContentEditor';
import CategoriesPage from './pages/admin/CategoriesPage';
import TagsPage from './pages/admin/TagsPage';
import FAQPage from './pages/admin/FAQPage';
import HomePageEditor from './pages/admin/HomePageEditor';
import StyleCustomizer from './pages/admin/StyleCustomizer';
import NavigationEditor from './pages/admin/NavigationEditor';
import SettingsPage from './pages/admin/SettingsPage';
import MediaLibraryPage from './pages/admin/MediaLibraryPage';
import SchedulePage from './pages/admin/SchedulePage';
import RedirectsPage from './pages/admin/RedirectsPage';
import SitemapPage from './pages/admin/SitemapPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public Site */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/press" element={<PressListPage />} />
            <Route path="/press/:slug" element={<PressDetailPage />} />
            <Route path="/page/:slug" element={<StaticPage />} />
            <Route path=":slug" element={<StaticPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="content/new" element={<ContentEditor />} />
            <Route path="content/:id" element={<ContentEditor />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="tags" element={<TagsPage />} />
            <Route path="faqs" element={<FAQPage />} />
            <Route path="homepage" element={<HomePageEditor />} />
            <Route path="media" element={<MediaLibraryPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="redirects" element={<RedirectsPage />} />
            <Route path="sitemap" element={<SitemapPage />} />
            <Route path="styles" element={<StyleCustomizer />} />
            <Route path="navigation" element={<NavigationEditor />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
