import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Edit3, Trash2, Eye, FileText, BarChart3,
  FolderOpen, Tag, HelpCircle, Home
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

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: 'Total Content', value: stats.total, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Published', value: stats.published, icon: Eye, color: 'bg-green-50 text-green-600' },
    { label: 'Drafts', value: stats.draft, icon: Edit3, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Blog Posts', value: stats.blogs, icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
  ];

  const quickLinks = [
    { to: '/admin/categories', label: 'Manage Categories', icon: FolderOpen },
    { to: '/admin/tags', label: 'Manage Tags', icon: Tag },
    { to: '/admin/faqs', label: 'Manage FAQs', icon: HelpCircle },
    { to: '/admin/homepage', label: 'Edit Homepage', icon: Home },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        searchValue={search}
        onSearchChange={setSearch}
        actionLabel="New Content"
        onAction={() => navigate('/admin/content/new')}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <Icon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Content List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Content</h3>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No content found. Create your first piece!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'scheduled'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {item.type}
                    </span>
                    {item.featured && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    /{item.slug} · Updated {new Date(item.updated_at).toLocaleDateString()}
                    {item.categories?.length > 0 && ` · ${item.categories.join(', ')}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Link
                    to={`/${item.type === 'page' ? 'page/' : item.type === 'blog' ? 'blog/' : 'press/'}${item.slug}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/admin/content/${item.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
