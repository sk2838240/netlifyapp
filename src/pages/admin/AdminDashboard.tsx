import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Edit3, Trash2, Eye, FileText, BarChart3,
  FolderOpen, Tag, HelpCircle, Home, ArrowRight, Calendar, User, Database, Loader2
} from 'lucide-react';
import { useContent } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { Content, ContentType } from '../../types';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pages', value: 'page' },
  { label: 'Blog', value: 'blog' },
  { label: 'Press', value: 'press' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { items, loading, fetchAll, remove } = useContent();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, pages: 0, blogs: 0, press: 0 });
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchAll(activeTab === 'all' ? undefined : activeTab);
  }, [activeTab, fetchAll]);

  useEffect(() => {
    setStats({
      total: items.length,
      published: items.filter((i) => i.status === 'published').length,
      draft: items.filter((i) => i.status === 'draft').length,
      pages: items.filter((i) => i.type === 'page').length,
      blogs: items.filter((i) => i.type === 'blog').length,
      press: items.filter((i) => i.type === 'press').length,
    });
  }, [items]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    const success = await remove(id);
    if (success) addToast('Content deleted', 'success');
    else addToast('Failed to delete', 'error');
  };

  const handleSeedDemo = async () => {
    if (!confirm('This will add demo data (categories, tags, blog posts, homepage sections, FAQs). Continue?')) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Demo data seeded successfully!', 'success');
        fetchAll(activeTab === 'all' ? undefined : activeTab);
      } else {
        addToast(data.message || 'Failed to seed data', 'error');
      }
    } catch {
      addToast('Failed to seed demo data', 'error');
    }
    setSeeding(false);
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: 'Total Content', value: stats.total, icon: FileText, color: 'bg-blue-50 text-blue-600', border: 'border-l-4 border-l-blue-500' },
    { label: 'Published', value: stats.published, icon: Eye, color: 'bg-green-50 text-green-600', border: 'border-l-4 border-l-green-500' },
    { label: 'Drafts', value: stats.draft, icon: Edit3, color: 'bg-amber-50 text-amber-600', border: 'border-l-4 border-l-amber-500' },
    { label: 'Blog Posts', value: stats.blogs, icon: BarChart3, color: 'bg-purple-50 text-purple-600', border: 'border-l-4 border-l-purple-500' },
  ];

  const quickLinks = [
    { to: '/admin/categories', label: 'Categories', desc: 'Organize content', icon: FolderOpen, color: 'text-blue-600 bg-blue-50' },
    { to: '/admin/tags', label: 'Tags', desc: 'Label content', icon: Tag, color: 'text-green-600 bg-green-50' },
    { to: '/admin/faqs', label: 'FAQs', desc: 'Help center', icon: HelpCircle, color: 'text-amber-600 bg-amber-50' },
    { to: '/admin/homepage', label: 'Homepage', desc: 'Edit sections', icon: Home, color: 'text-purple-600 bg-purple-50' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return 'badge badge-green';
      case 'scheduled': return 'badge badge-orange';
      default: return 'badge badge-yellow';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'blog': return 'badge badge-blue';
      case 'press': return 'badge badge-purple';
      default: return 'badge badge-gray';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
        <PageHeader
          title="Dashboard"
          subtitle="Manage your content and settings"
          searchValue={search}
          onSearchChange={setSearch}
          actionLabel="New Content"
          onAction={() => navigate('/admin/content/new')}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      {items.length === 0 && !loading && (
        <div className="mb-6 admin-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Load demo content</p>
              <p className="text-xs text-gray-500">Populate your site with sample blog posts, categories, tags, FAQs, and homepage sections</p>
            </div>
          </div>
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 whitespace-nowrap"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {seeding ? 'Seeding...' : 'Seed Demo Data'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`admin-card p-5 ${stat.border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <motion.div key={link.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Link to={link.to} className="admin-card p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all group block">
                <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-500">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Content List */}
      <div className="admin-card">
        <div className="admin-card-header flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Content</h3>
          <span className="text-xs text-gray-400">{filteredItems.length} items</span>
        </div>

        {loading ? (
          <div className="p-8"><LoadingSpinner /></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No content yet</p>
            <p className="text-sm text-gray-400 mb-4">Create your first piece of content to get started</p>
            <button onClick={() => navigate('/admin/content/new')} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Create Content
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900 truncate max-w-md">{item.title}</h4>
                    <span className={getStatusBadge(item.status)}>{item.status}</span>
                    <span className={getTypeBadge(item.type)}>{item.type}</span>
                    {item.featured && <span className="badge badge-purple">Featured</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-mono">/{item.slug}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.updated_at).toLocaleDateString()}</span>
                    {item.author && <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.author}</span>}
                    {item.categories?.length > 0 && <span className="text-gray-300">|</span>}
                    {item.categories?.slice(0, 2).map(c => <span key={c} className="badge badge-gray">{c}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/${item.type === 'page' ? 'page/' : item.type === 'blog' ? 'blog/' : 'press/'}${item.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="View">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link to={`/admin/content/${item.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
