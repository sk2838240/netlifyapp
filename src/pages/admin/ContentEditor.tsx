import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image, Calendar } from 'lucide-react';
import { useContent, useCategories, useTags } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { ContentInput, ContentType, ContentStatus, SEOData, MediaItem } from '../../types';
import SEOForm from '../../components/admin/SEOForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MediaLibrary from './MediaLibraryPage';

const emptyForm: ContentInput = {
  type: 'blog',
  title: '',
  slug: '',
  image: '',
  body: '',
  excerpt: '',
  metadata: { seo: {} },
  categories: [],
  tags: [],
  status: 'draft',
  author: '',
  featured: false,
};

export default function ContentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchBySlug, create, update } = useContent();
  const { categories, fetch: fetchCategories } = useCategories();
  const { tags, fetch: fetchTags } = useTags();
  const { addToast } = useToast();
  const [form, setForm] = useState<ContentInput>(emptyForm);
  const [seo, setSeo] = useState<SEOData>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [existingScheduledAt, setExistingScheduledAt] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/content/id/${id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data) {
            setForm({
              type: res.data.type,
              title: res.data.title,
              slug: res.data.slug,
              image: res.data.image || '',
              body: res.data.body,
              excerpt: res.data.excerpt || '',
              metadata: res.data.metadata || {},
              categories: res.data.categories || [],
              tags: res.data.tags || [],
              status: res.data.status,
              author: res.data.author || '',
              featured: res.data.featured || false,
            });
            setSeo(res.data.metadata?.seo || {});
            if (res.data.scheduled_at) {
              setExistingScheduledAt(res.data.scheduled_at);
              const d = new Date(res.data.scheduled_at);
              setScheduleDate(d.toISOString().split('T')[0]);
              setScheduleTime(d.toTimeString().slice(0, 5));
            }
          }
        })
        .catch(() => addToast('Failed to load content', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSlugFromTitle = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm((prev) => ({ ...prev, title, slug }));
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      addToast('Title and slug are required', 'error');
      return;
    }
    setSaving(true);
    const payload: any = {
      ...form,
      metadata: { ...form.metadata, seo },
    };

    // Handle scheduling
    if (form.status === 'scheduled' && scheduleDate && scheduleTime) {
      payload.scheduled_at = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    }

    try {
      if (id) {
        await update(id, payload);
        addToast('Content updated successfully', 'success');
      } else {
        await create(payload);
        addToast('Content created successfully', 'success');
      }
      navigate('/admin');
    } catch {
      addToast('Failed to save content', 'error');
    }
    setSaving(false);
  };

  const addCategoryTag = (type: 'categories' | 'tags', value: string) => {
    if (!value.trim()) return;
    setForm((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), value.trim()],
    }));
    if (type === 'categories') setNewCategory('');
    else setNewTag('');
  };

  const removeCategoryTag = (type: 'categories' | 'tags', value: string) => {
    setForm((prev) => ({
      ...prev,
      [type]: (prev[type] || []).filter((v) => v !== value),
    }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Edit Content' : 'Create New Content'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleSlugFromTitle(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
                  placeholder="custom-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Brief summary..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body (HTML)</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                  rows={16}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
                  placeholder="<p>Your content here...</p>"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.image || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="https://..."
                  />
                  <button
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Browse Media"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                </div>
                {form.image && (
                  <img src={form.image} alt="Preview" className="mt-2 max-h-40 rounded-lg object-cover" />
                )}
                {showMediaPicker && (
                  <div className="mt-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <MediaLibrary
                      selectable
                      onSelect={(item: MediaItem) => {
                        setForm((prev) => ({ ...prev, image: item.url }));
                        setShowMediaPicker(false);
                        addToast('Image selected', 'success');
                      }}
                    />
                    <button
                      onClick={() => setShowMediaPicker(false)}
                      className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Close media picker
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEO Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SEOForm data={seo} onChange={setSeo} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Type & Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Publish Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ContentType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="page">Page</option>
                  <option value="blog">Blog</option>
                  <option value="press">Press Release</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as ContentStatus }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {form.status === 'scheduled' && (
                <div className="bg-orange-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-orange-700 text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    Schedule Publication
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  {scheduleDate && scheduleTime && (
                    <p className="text-xs text-orange-600">
                      Will publish on {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={form.author || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Author name"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured || false}
                  onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {(form.categories || []).map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                >
                  {cat}
                  <button onClick={() => removeCategoryTag('categories', cat)} className="hover:text-red-600">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategoryTag('categories', newCategory)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                placeholder="Add category..."
              />
              <button onClick={() => addCategoryTag('categories', newCategory)} className="text-sm text-blue-600 font-medium">Add</button>
            </div>
            {categories.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Existing:</p>
                <div className="flex flex-wrap gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => addCategoryTag('categories', cat.name)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {(form.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                >
                  {tag}
                  <button onClick={() => removeCategoryTag('tags', tag)} className="hover:text-red-600">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategoryTag('tags', newTag)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                placeholder="Add tag..."
              />
              <button onClick={() => addCategoryTag('tags', newTag)} className="text-sm text-blue-600 font-medium">Add</button>
            </div>
            {tags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Existing:</p>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => addCategoryTag('tags', tag.name)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
