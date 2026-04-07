import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Edit3, Trash2, Eye, FileText, BarChart3,
  FolderOpen, Tag, HelpCircle, Home, ArrowRight, Calendar, User, Database, Loader2,
  CheckSquare, Square, Layers, BookOpen, Newspaper
} from 'lucide-react';
import { api } from '../../lib/api';
import { useContent } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();
  const { items, loading, fetchAll, remove } = useContent();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, pages: 0, blogs: 0, press: 0 });
  const [seeding, setSeeding] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    try {
      await api.getContent(activeTab === 'all' ? undefined : activeTab, 1, 50, query || undefined);
      fetchAll(activeTab === 'all' ? undefined : activeTab);
    } catch (error) {
      console.error('Search error:', error);
    }
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
      prev.forEach(id => { if (items.some(item => item.id === id)) newSet.add(id); });
      return newSet;
    });
  }, [items]);

  const toggleSelectAll = () => {
    setSelectedItems(selectedItems.size === items.length ? new Set() : new Set(items.map(item => item.id)));
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedItems.size === 0) return;
    const msgs = { publish: `Publish ${selectedItems.size} item(s)?`, unpublish: `Unpublish ${selectedItems.size} item(s)?`, delete: `Delete ${selectedItems.size} item(s)? This cannot be undone.` };
    if (!confirm(msgs[action])) return;
    setBulkActionLoading(true);
    try {
      const result = await api.bulkUpdateContent(Array.from(selectedItems), action);
      addToast(result.message, 'success');
      setSelectedItems(new Set());
      fetchAll(activeTab === 'all' ? undefined : activeTab);
    } catch { addToast('Bulk action failed', 'error'); }
    setBulkActionLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content?')) return;
    const success = await remove(id);
    success ? addToast('Content deleted', 'success') : addToast('Failed to delete', 'error');
  };

  const handleSeedDemo = async () => {
    if (!confirm('Add demo data?')) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      data.success ? (addToast('Demo data seeded!', 'success'), fetchAll(activeTab === 'all' ? undefined : activeTab)) : addToast(data.message || 'Failed', 'error');
    } catch { addToast('Failed to seed', 'error'); }
    setSeeding(false);
  };

  const filteredItems = items.filter(
    (item) => item.title.toLowerCase().includes(search.toLowerCase()) || item.slug.toLowerCase().includes(search.toLowerCase())
  );

  const displayName = user?.name || user?.email?.split('@')[0] || 'Admin';

  return (
    <div>
      {/* ===== Strapi-style Page Header ===== */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#32324d] leading-tight">
          Hello {displayName} 👋
        </h1>
        <p className="text-sm text-[#666687] mt-1">
          Welcome to your administration panel
        </p>
      </div>

      {/* Seed Demo Banner */}
      {items.length === 0 && !loading && (
        <div className="mb-6 bg-white rounded-[4px] border border-[#dcdce4] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_1px_4px_rgba(33,33,52,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#eaeaef] rounded-[4px] flex items-center justify-center">
              <Database className="w-5 h-5 text-[#666687]" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#32324d]">Load demo content</p>
              <p className="text-xs text-[#a5a5ba]">Populate with sample blog posts, categories, tags, FAQs</p>
            </div>
          </div>
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-[#4945ff] hover:bg-[#3d3adb] text-white text-[13px] font-semibold rounded-[4px] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {seeding ? 'Seeding...' : 'Seed Demo Data'}
          </button>
        </div>
      )}

      {/* ===== Stats Widgets (Strapi card style) ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Content', value: stats.total, icon: Layers, color: '#4945ff' },
          { label: 'Published', value: stats.published, icon: Eye, color: '#328048' },
          { label: 'Drafts', value: stats.draft, icon: Edit3, color: '#d9822f' },
          { label: 'Blog Posts', value: stats.blogs, icon: BookOpen, color: '#7b79ff' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-[4px] border border-[#dcdce4] p-5 shadow-[0_1px_4px_rgba(33,33,52,0.1)]"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-5 h-5" style={{ color: stat.color }} strokeWidth={1.8} />
              </div>
              <p className="text-[28px] font-bold text-[#32324d] leading-none mb-1">{stat.value}</p>
              <p className="text-xs text-[#666687] font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/admin/categories', label: 'Categories', desc: 'Organize content', icon: FolderOpen },
          { to: '/admin/tags', label: 'Tags', desc: 'Label content', icon: Tag },
          { to: '/admin/faqs', label: 'FAQs', desc: 'Help center', icon: HelpCircle },
          { to: '/admin/homepage', label: 'Homepage', desc: 'Edit sections', icon: Home },
        ].map((link, i) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 p-4 bg-white rounded-[4px] border border-[#dcdce4] shadow-[0_1px_4px_rgba(33,33,52,0.1)] hover:shadow-[0_1px_4px_rgba(33,33,52,0.16)] hover:border-[#c0c0cf] transition-all group"
            >
              <div className="w-8 h-8 rounded-[4px] bg-[#f0f0ff] flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[#4945ff]" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#32324d]">{link.label}</p>
                <p className="text-[11px] text-[#a5a5ba]">{link.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#c0c0cf] group-hover:text-[#4945ff] transition-colors flex-shrink-0" strokeWidth={1.8} />
            </Link>
          );
        })}
      </div>

      {/* ===== Content Manager Section ===== */}
      <div className="bg-white rounded-[4px] border border-[#dcdce4] shadow-[0_1px_4px_rgba(33,33,52,0.1)] overflow-hidden">
        {/* Header bar */}
        <div className="px-5 py-4 border-b border-[#eaeaef] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[#32324d]">Recent Content</h2>
            <span className="text-[11px] font-medium text-[#a5a5ba] bg-[#eaeaef] px-2 py-0.5 rounded-[4px]">{filteredItems.length}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-0.5 bg-[#f6f6f9] rounded-[4px] p-0.5">
              {tabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 py-1.5 text-[12px] font-semibold rounded-[3px] transition-all ${
                    activeTab === tab.value
                      ? 'bg-white text-[#32324d] shadow-[0_1px_4px_rgba(33,33,52,0.1)]'
                      : 'text-[#666687] hover:text-[#32324d]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/admin/content/new')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4945ff] hover:bg-[#3d3adb] text-white text-[12px] font-semibold rounded-[4px] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Create
            </button>
          </div>
        </div>

        {/* Bulk toolbar */}
        {items.length > 0 && selectedItems.size > 0 && (
          <div className="px-5 py-2.5 bg-[#f0f0ff] border-b border-[#dcdce4] flex items-center gap-3">
            <span className="text-xs font-semibold text-[#4945ff]">{selectedItems.size} selected</span>
            <div className="flex items-center gap-1.5 ml-auto">
              <button onClick={() => handleBulkAction('publish')} disabled={bulkActionLoading} className="px-2.5 py-1 text-[11px] font-semibold text-[#328048] bg-[#eafbe7] rounded-[4px] hover:bg-[#c6f0c2] transition-colors disabled:opacity-50">Publish</button>
              <button onClick={() => handleBulkAction('unpublish')} disabled={bulkActionLoading} className="px-2.5 py-1 text-[11px] font-semibold text-[#d9822f] bg-[#fdf4dc] rounded-[4px] hover:bg-[#fae7b9] transition-colors disabled:opacity-50">Unpublish</button>
              <button onClick={() => handleBulkAction('delete')} disabled={bulkActionLoading} className="px-2.5 py-1 text-[11px] font-semibold text-[#d02b20] bg-[#fcecea] rounded-[4px] hover:bg-[#f5c0b8] transition-colors disabled:opacity-50">Delete</button>
            </div>
          </div>
        )}

        {/* Select all bar */}
        {items.length > 0 && (
          <div className="px-5 py-2 border-b border-[#eaeaef] flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs text-[#666687] hover:text-[#32324d] transition-colors font-medium"
            >
              {selectedItems.size === items.length ? (
                <CheckSquare className="w-4 h-4 text-[#4945ff]" strokeWidth={1.8} />
              ) : (
                <Square className="w-4 h-4" strokeWidth={1.8} />
              )}
              Select all
            </button>
            <div className="flex-1" />
            <span className="text-[11px] text-[#a5a5ba] font-medium uppercase tracking-wider">Title</span>
          </div>
        )}

        {/* Content list */}
        {loading ? (
          <div className="p-12"><LoadingSpinner /></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 bg-[#f6f6f9] rounded-[4px] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-[#c0c0cf]" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-[#32324d] mb-1">No content yet</p>
            <p className="text-xs text-[#a5a5ba] mb-5">Create your first piece of content to get started</p>
            <button
              onClick={() => navigate('/admin/content/new')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4945ff] hover:bg-[#3d3adb] text-white text-[13px] font-semibold rounded-[4px] transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Create content
            </button>
          </div>
        ) : (
          <div>
            {filteredItems.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center px-5 py-3.5 border-b border-[#eaeaef] last:border-b-0 hover:bg-[#f6f6f9] transition-colors group"
              >
                {/* Checkbox */}
                <button onClick={() => toggleSelectItem(item.id)} className="flex-shrink-0 mr-3">
                  {selectedItems.has(item.id) ? (
                    <CheckSquare className="w-4 h-4 text-[#4945ff]" strokeWidth={1.8} />
                  ) : (
                    <Square className="w-4 h-4 text-[#c0c0cf] group-hover:text-[#a5a5ba]" strokeWidth={1.8} />
                  )}
                </button>

                {/* Content info */}
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className="text-[13px] font-semibold text-[#32324d] truncate">{item.title}</h4>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wide ${
                      item.status === 'published' ? 'bg-[#eafbe7] text-[#328048]'
                      : item.status === 'scheduled' ? 'bg-[#fdf4dc] text-[#d9822f]'
                      : 'bg-[#eaeaef] text-[#666687]'
                    }`}>{item.status}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wide ${
                      item.type === 'blog' ? 'bg-[#f0f0ff] text-[#4945ff]'
                      : item.type === 'press' ? 'bg-[#fdf4dc] text-[#ae7127]'
                      : 'bg-[#eaeaef] text-[#666687]'
                    }`}>{item.type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#a5a5ba]">
                    <span className="font-mono">/{item.slug}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.updated_at).toLocaleDateString()}</span>
                    {item.author && <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.author}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/${item.type === 'page' ? 'page/' : item.type === 'blog' ? 'blog/' : 'press/'}${item.slug}`} target="_blank" className="p-2 text-[#a5a5ba] hover:text-[#328048] hover:bg-[#eafbe7] rounded-[4px] transition-all" title="View">
                    <Eye className="w-4 h-4" strokeWidth={1.8} />
                  </Link>
                  <Link to={`/admin/content/${item.id}`} className="p-2 text-[#a5a5ba] hover:text-[#4945ff] hover:bg-[#f0f0ff] rounded-[4px] transition-all" title="Edit">
                    <Edit3 className="w-4 h-4" strokeWidth={1.8} />
                  </Link>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-[#a5a5ba] hover:text-[#d02b20] hover:bg-[#fcecea] rounded-[4px] transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" strokeWidth={1.8} />
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
