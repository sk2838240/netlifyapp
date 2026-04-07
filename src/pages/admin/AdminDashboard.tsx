import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Edit3, Trash2, Eye, FileText, BarChart3,
  FolderOpen, Tag, HelpCircle, Home, ArrowRight, Calendar, User, Database, Loader2,
  CheckSquare, Square, TrendingUp, Activity, Layers, Sparkles
} from 'lucide-react';
import { api } from '../../lib/api';
import { useContent } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { Content, ContentType } from '../../types';
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
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, pages: 0, blogs: 0, press: 0 });
  const [seeding, setSeeding] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setPageLoading(true);
    try {
      const typeParam = activeTab === 'all' ? undefined : activeTab;
      const response = await api.getContent(typeParam, 1, 50, query || undefined);
      fetchAll(activeTab === 'all' ? undefined : activeTab);
    } catch (error) {
      console.error('Search error:', error);
    }
    setPageLoading(false);
  }, [activeTab, fetchAll]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        handleSearch(searchInput);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search, handleSearch]);

  useEffect(() => {
    fetchAll(activeTab === 'all' ? undefined : activeTab);
    setSearchInput('');
    setSearch('');
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
    setSelectedItems(prev => {
      const newSet = new Set<string>();
      prev.forEach(id => {
        if (items.some(item => item.id === id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [items]);

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedItems.size === 0) return;
    const confirmMessages = {
      publish: `Publish ${selectedItems.size} selected item(s)?`,
      unpublish: `Unpublish ${selectedItems.size} selected item(s)?`,
      delete: `Delete ${selectedItems.size} selected item(s)? This cannot be undone.`
    };
    if (!confirm(confirmMessages[action])) return;
    setBulkActionLoading(true);
    try {
      const result = await api.bulkUpdateContent(Array.from(selectedItems), action);
      addToast(result.message, 'success');
      setSelectedItems(new Set());
      fetchAll(activeTab === 'all' ? undefined : activeTab);
    } catch (error) {
      addToast('Bulk action failed', 'error');
    }
    setBulkActionLoading(false);
  };

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
    { label: 'Total Content', value: stats.total, icon: Layers, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', lightText: 'text-blue-600' },
    { label: 'Published', value: stats.published, icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', lightText: 'text-emerald-600' },
    { label: 'Drafts', value: stats.draft, icon: Edit3, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', lightText: 'text-amber-600' },
    { label: 'Blog Posts', value: stats.blogs, icon: Activity, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', lightText: 'text-violet-600' },
  ];

  const quickLinks = [
    { to: '/admin/categories', label: 'Categories', desc: 'Organize content', icon: FolderOpen, color: 'from-blue-500 to-blue-600' },
    { to: '/admin/tags', label: 'Tags', desc: 'Label content', icon: Tag, color: 'from-emerald-500 to-teal-600' },
    { to: '/admin/faqs', label: 'FAQs', desc: 'Help center', icon: HelpCircle, color: 'from-amber-500 to-orange-500' },
    { to: '/admin/homepage', label: 'Homepage', desc: 'Edit sections', icon: Home, color: 'from-violet-500 to-purple-600' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f1629] via-[#1a1f3a] to-[#0f1629] p-8 mb-8 border border-white/5"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[80px]" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Welcome back</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-slate-400 text-sm">Manage your content, media, and site settings from here.</p>
          </div>
          <button
            onClick={() => navigate('/admin/content/new')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Content
          </button>
        </div>
      </motion.div>

      {/* Seed Demo Banner */}
      {items.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/60"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Load demo content</p>
              <p className="text-xs text-gray-500">Populate your site with sample blog posts, categories, tags, FAQs, and homepage sections</p>
            </div>
          </div>
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 whitespace-nowrap"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {seeding ? 'Seeding...' : 'Seed Demo Data'}
          </button>
        </motion.div>
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
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`text-xs font-medium ${stat.lightText} ${stat.bg} px-2 py-1 rounded-md`}>
                  {stat.label === 'Total Content' && items.length > 0 ? '+' + items.length : ''}
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mb-0.5">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
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
              <Link to={link.to} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{link.label}</p>
                  <p className="text-[11px] text-gray-400">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Bulk Actions Toolbar */}
        {items.length > 0 && (
          <div className="border-b border-gray-100 px-5 py-3 flex flex-wrap items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium"
            >
              {selectedItems.size === items.length ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Select All
            </button>
            {selectedItems.size > 0 && (
              <>
                <span className="text-xs text-gray-400">
                  {selectedItems.size} selected
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleBulkAction('publish')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleBulkAction('unpublish')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    Unpublish
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 text-[11px] font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="px-5 py-3 flex items-center justify-between border-b border-gray-50">
          <h3 className="font-semibold text-gray-800 text-sm">Recent Content</h3>
          <span className="text-[11px] text-gray-400 font-medium">{filteredItems.length} items</span>
        </div>

        {loading ? (
          <div className="p-12"><LoadingSpinner /></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold mb-1">No content yet</p>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">Create your first piece of content to get started</p>
            <button onClick={() => navigate('/admin/content/new')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/30">
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
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors group"
              >
                <button
                  onClick={() => toggleSelectItem(item.id)}
                  className="flex-shrink-0 mr-3"
                >
                  {selectedItems.has(item.id) ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900 truncate max-w-md">{item.title}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      item.status === 'published' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : item.status === 'scheduled'
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>{item.status}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      item.type === 'blog' 
                        ? 'bg-blue-50 text-blue-700' 
                        : item.type === 'press'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>{item.type}</span>
                    {item.featured && <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-700">Featured</span>}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="font-mono">/{item.slug}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.updated_at).toLocaleDateString()}</span>
                    {item.author && <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.author}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/${item.type === 'page' ? 'page/' : item.type === 'blog' ? 'blog/' : 'press/'}${item.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="View">
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
