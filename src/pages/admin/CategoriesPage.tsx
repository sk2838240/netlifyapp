import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { useCategories } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { Category } from '../../types';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CategoriesPage() {
  const { categories, loading, fetch, create, update, remove } = useCategories();
  const { addToast } = useToast();
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await create({ name: name.trim(), slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), description });
      addToast('Category created', 'success');
      setName(''); setDescription(''); setCreating(false);
    } catch { addToast('Failed to create', 'error'); }
  };

  const handleUpdate = async () => {
    if (!editing || !name.trim()) return;
    try {
      await update(editing.id, { name: name.trim(), slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), description });
      addToast('Category updated', 'success');
      setEditing(null); setName(''); setDescription('');
    } catch { addToast('Failed to update', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await remove(id);
      addToast('Category deleted', 'success');
    } catch { addToast('Failed to delete', 'error'); }
  };

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setCreating(false);
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        actionLabel="New Category"
        onAction={() => { setCreating(true); setEditing(null); setName(''); setDescription(''); }}
      />

      {(creating || editing) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Category' : 'New Category'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={editing ? handleUpdate : handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <Save className="w-4 h-4" /> {editing ? 'Update' : 'Create'}
              </button>
              <button onClick={() => { setCreating(false); setEditing(null); setName(''); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:text-gray-900">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? <LoadingSpinner /> : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No categories yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat: Category) => (
              <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{cat.name}</h4>
                  <p className="text-xs text-gray-500">/{cat.slug} {cat.description && `· ${cat.description}`}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(cat)} className="p-2 text-gray-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
