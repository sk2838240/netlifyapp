import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { HomePageSection, HomePageSectionInput } from '../../types';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const sectionTypes = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'about', label: 'About Section' },
  { value: 'features', label: 'Features Section' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'faq', label: 'FAQ Section' },
  { value: 'custom', label: 'Custom Section' },
];

const emptySection: HomePageSectionInput = {
  type: 'hero',
  title: '',
  subtitle: '',
  content: '',
  image: '',
  background_color: '#ffffff',
  text_color: '#1f2937',
  button_text: '',
  button_url: '',
  button_color: '#2563eb',
  visible: true,
};

export default function HomePageEditor() {
  const { addToast } = useToast();
  const [sections, setSections] = useState<HomePageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HomePageSection | null>(null);
  const [form, setForm] = useState<HomePageSectionInput>(emptySection);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/homepage')
      .then((r) => r.json())
      .then((res) => setSections(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      addToast('Title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/homepage/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        setSections((prev) => prev.map((s) => (s.id === editing.id ? data.data : s)));
        addToast('Section updated', 'success');
      } else {
        const res = await fetch('/api/homepage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
          body: JSON.stringify({ ...form, order: sections.length }),
        });
        const data = await res.json();
        setSections((prev) => [...prev, data.data]);
        addToast('Section created', 'success');
      }
      setCreating(false); setEditing(null); setForm(emptySection);
    } catch { addToast('Failed to save', 'error'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    try {
      await fetch(`/api/homepage/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
      });
      setSections((prev) => prev.filter((s) => s.id !== id));
      addToast('Section deleted', 'success');
    } catch { addToast('Failed to delete', 'error'); }
  };

  const toggleVisibility = async (section: HomePageSection) => {
    try {
      const res = await fetch(`/api/homepage/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
        body: JSON.stringify({ ...section, visible: !section.visible }),
      });
      const data = await res.json();
      setSections((prev) => prev.map((s) => (s.id === section.id ? data.data : s)));
    } catch { addToast('Failed to update', 'error'); }
  };

  const startEdit = (section: HomePageSection) => {
    setEditing(section);
    setForm({
      type: section.type,
      title: section.title,
      subtitle: section.subtitle || '',
      content: section.content,
      image: section.image || '',
      background_color: section.background_color || '#ffffff',
      text_color: section.text_color || '#1f2937',
      button_text: section.button_text || '',
      button_url: section.button_url || '',
      button_color: section.button_color || '#2563eb',
      visible: section.visible,
    });
    setCreating(false);
  };

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Homepage Editor"
        actionLabel="Add Section"
        onAction={() => { setCreating(true); setEditing(null); setForm(emptySection); }}
      />

      <p className="text-sm text-gray-500 mb-6">
        Customize your homepage by adding and editing sections. Header and footer stay consistent across all pages.
      </p>

      {(creating || editing) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Section' : 'New Section'}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
                <select
                  value={form.type}
                  onChange={(e) => update('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {sectionTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Section title"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={form.subtitle || ''}
                onChange={(e) => update('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Optional subtitle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
              <textarea
                value={form.content}
                onChange={(e) => update('content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
                placeholder="<p>Section content...</p>"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={form.image || ''}
                onChange={(e) => update('image', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="https://..."
              />
              {form.image && <img src={form.image} alt="Preview" className="mt-2 max-h-32 rounded-lg object-cover" />}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                <div className="flex gap-2">
                  <input type="color" value={form.background_color || '#ffffff'} onChange={(e) => update('background_color', e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                  <input type="text" value={form.background_color || ''} onChange={(e) => update('background_color', e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <div className="flex gap-2">
                  <input type="color" value={form.text_color || '#1f2937'} onChange={(e) => update('text_color', e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                  <input type="text" value={form.text_color || ''} onChange={(e) => update('text_color', e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input type="text" value={form.button_text || ''} onChange={(e) => update('button_text', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Click Here" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
                <input type="text" value={form.button_url || ''} onChange={(e) => update('button_url', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="/contact" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="w-4 h-4" />}
                {editing ? 'Update' : 'Create'}
              </button>
              <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {loading ? <LoadingSpinner /> : sections.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
            <p className="text-gray-500 mb-4">No sections yet. Add your first section to customize the homepage.</p>
          </div>
        ) : (
          sections.sort((a, b) => a.order - b.order).map((section) => (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
              <GripVertical className="w-5 h-5 text-gray-300 mt-1 cursor-grab flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded uppercase">
                    {section.type}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-900">{section.title}</h4>
                  {!section.visible && <span className="text-xs text-gray-400">(Hidden)</span>}
                </div>
                {section.subtitle && <p className="text-xs text-gray-500">{section.subtitle}</p>}
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{section.content?.replace(/<[^>]*>/g, '').substring(0, 120)}...</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => toggleVisibility(section)} className="p-2 text-gray-400 hover:text-blue-600" title={section.visible ? 'Hide' : 'Show'}>
                  {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => startEdit(section)} className="p-2 text-gray-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(section.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
