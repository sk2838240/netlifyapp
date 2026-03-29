import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save } from 'lucide-react';
import { useTags } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { Tag } from '../../types';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function TagsPage() {
  const { tags, loading, fetch, create, update, remove } = useTags();
  const { addToast } = useToast();
  const [editing, setEditing] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await create({ name: name.trim(), slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') });
      addToast('Tag created', 'success');
      setName(''); setCreating(false);
    } catch { addToast('Failed to create', 'error'); }
  };

  const handleUpdate = async () => {
    if (!editing || !name.trim()) return;
    try {
      await update(editing.id, { name: name.trim(), slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') });
      addToast('Tag updated', 'success');
      setEditing(null); setName('');
    } catch { addToast('Failed to update', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    try { await remove(id); addToast('Tag deleted', 'success'); }
    catch { addToast('Failed to delete', 'error'); }
  };

  return (
    <div>
      <PageHeader title="Tags" actionLabel="New Tag" onAction={() => { setCreating(true); setEditing(null); setName(''); }} />

      {(creating || editing) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Tag' : 'New Tag'}</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (editing ? handleUpdate() : handleCreate())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Tag name"
            />
            <button onClick={editing ? handleUpdate : handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Save className="w-4 h-4" /> {editing ? 'Update' : 'Create'}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null); setName(''); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? <LoadingSpinner /> : tags.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No tags yet.</div>
        ) : (
          <div className="flex flex-wrap gap-2 p-6">
            {tags.map((tag: Tag) => (
              <div key={tag.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg group">
                <span className="text-sm font-medium text-gray-700">{tag.name}</span>
                <button onClick={() => { setEditing(tag); setName(tag.name); setCreating(false); }} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit3 className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(tag.id)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
