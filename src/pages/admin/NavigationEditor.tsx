import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, GripVertical, Edit3 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { NavItem } from '../../types';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function NavigationEditor() {
  const { addToast } = useToast();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [form, setForm] = useState({ label: '', url: '', target: '_self' as '_self' | '_blank' });

  useEffect(() => {
    fetch('/api/navigation')
      .then((r) => r.json())
      .then((res) => setItems(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await fetch('/api/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
        body: JSON.stringify({ items }),
      });
      addToast('Navigation saved', 'success');
    } catch { addToast('Failed to save', 'error'); }
    setSaving(false);
  };

  const addItem = () => {
    if (!form.label.trim() || !form.url.trim()) {
      addToast('Label and URL are required', 'error');
      return;
    }
    const newItem: NavItem = {
      id: Date.now().toString(),
      label: form.label.trim(),
      url: form.url.trim(),
      order: items.length,
      target: form.target,
    };
    setItems((prev) => [...prev, newItem]);
    setForm({ label: '', url: '', target: '_self' });
    setEditing(null);
  };

  const updateItem = () => {
    if (!editing || !form.label.trim() || !form.url.trim()) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === editing.id
          ? { ...item, label: form.label.trim(), url: form.url.trim(), target: form.target }
          : item
      )
    );
    setEditing(null);
    setForm({ label: '', url: '', target: '_self' });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id).map((item, i) => ({ ...item, order: i })));
  };

  const startEdit = (item: NavItem) => {
    setEditing(item);
    setForm({ label: item.label, url: item.url, target: item.target || '_self' });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems.map((item, i) => ({ ...item, order: i })));
  };

  return (
    <div>
      <PageHeader title="Navigation Menu" />

      <p className="text-sm text-gray-500 mb-6">
        Manage the navigation links that appear in your website's header.
      </p>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              placeholder="Menu label"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              placeholder="/page or https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
            <select
              value={form.target}
              onChange={(e) => setForm((p) => ({ ...p, target: e.target.value as '_self' | '_blank' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="_self">Same Tab</option>
              <option value="_blank">New Tab</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={editing ? updateItem : addItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> {editing ? 'Update' : 'Add'}
            </button>
            {editing && (
              <button
                onClick={() => { setEditing(null); setForm({ label: '', url: '', target: '_self' }); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Menu Items</h3>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="w-4 h-4" />}
            Save Menu
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No menu items yet. Add your first link above.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.sort((a, b) => a.order - b.order).map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveItem(i, 'up')} className="text-gray-300 hover:text-gray-600 text-xs">▲</button>
                  <button onClick={() => moveItem(i, 'down')} className="text-gray-300 hover:text-gray-600 text-xs">▼</button>
                </div>
                <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                  <p className="text-xs text-gray-500">
                    {item.url} {item.target === '_blank' && '(new tab)'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(item)} className="p-2 text-gray-400 hover:text-blue-600">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-600">
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
