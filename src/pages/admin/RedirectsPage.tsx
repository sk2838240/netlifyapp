import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, ArrowRight, ExternalLink, ToggleLeft, ToggleRight, BarChart3 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  type: number;
  active: boolean;
  hits: number;
  created_at: string;
}

export default function RedirectsPage() {
  const { addToast } = useToast();
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Redirect | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ from_path: '', to_path: '', type: 301, active: true });

  useEffect(() => { fetchRedirects(); }, []);

  const fetchRedirects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/redirects');
      const data = await res.json();
      setRedirects(data.data || []);
    } catch { addToast('Failed to load redirects', 'error'); }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.from_path.trim() || !form.to_path.trim()) {
      addToast('From and To paths are required', 'error');
      return;
    }

    // Normalize paths
    const fromPath = form.from_path.startsWith('/') ? form.from_path : `/${form.from_path}`;
    const toPath = form.to_path.startsWith('/') || form.to_path.startsWith('http') ? form.to_path : `/${form.to_path}`;

    try {
      if (editing) {
        await fetch(`/api/redirects/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
          body: JSON.stringify({ from_path: fromPath, to_path: toPath, type: form.type, active: form.active }),
        });
        addToast('Redirect updated', 'success');
      } else {
        const res = await fetch('/api/redirects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
          body: JSON.stringify({ from_path: fromPath, to_path: toPath, type: form.type, active: form.active }),
        });
        if (!res.ok) {
          const err = await res.json();
          addToast(err.message || 'Failed to create redirect', 'error');
          return;
        }
        addToast('Redirect created', 'success');
      }
      setCreating(false); setEditing(null);
      setForm({ from_path: '', to_path: '', type: 301, active: true });
      fetchRedirects();
    } catch { addToast('Failed to save redirect', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this redirect?')) return;
    try {
      await fetch(`/api/redirects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
      });
      addToast('Redirect deleted', 'success');
      fetchRedirects();
    } catch { addToast('Failed to delete', 'error'); }
  };

  const toggleActive = async (redirect: Redirect) => {
    try {
      await fetch(`/api/redirects/${redirect.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
        body: JSON.stringify({ active: !redirect.active }),
      });
      fetchRedirects();
    } catch { addToast('Failed to update', 'error'); }
  };

  const startEdit = (redirect: Redirect) => {
    setEditing(redirect);
    setForm({
      from_path: redirect.from_path,
      to_path: redirect.to_path,
      type: redirect.type,
      active: redirect.active,
    });
    setCreating(true);
  };

  const testRedirect = (fromPath: string) => {
    window.open(fromPath, '_blank');
  };

  return (
    <div>
      <PageHeader
        title="Redirect Manager"
        actionLabel="Add Redirect"
        onAction={() => { setCreating(true); setEditing(null); setForm({ from_path: '', to_path: '', type: 301, active: true }); }}
      />

      <p className="text-sm text-gray-500 mb-6">
        Manage URL redirects for your site. Create 301 (permanent) or 302 (temporary) redirects to guide visitors and search engines to the right pages.
      </p>

      {/* Create/Edit Form */}
      {creating && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Redirect' : 'New Redirect'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Path</label>
              <input
                type="text"
                value={form.from_path}
                onChange={(e) => setForm((p) => ({ ...p, from_path: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-mono"
                placeholder="/old-page"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Path / URL</label>
              <input
                type="text"
                value={form.to_path}
                onChange={(e) => setForm((p) => ({ ...p, to_path: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-mono"
                placeholder="/new-page or https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value={301}>301 - Permanent</option>
                <option value={302}>302 - Temporary</option>
                <option value={307}>307 - Temporary (Strict)</option>
                <option value={308}>308 - Permanent (Strict)</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <Save className="w-4 h-4" /> {editing ? 'Update' : 'Create'}
              </button>
              <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">
                Cancel
              </button>
            </div>
          </div>

          {/* Preview */}
          {form.from_path && form.to_path && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
              <code className="text-blue-600">{form.from_path}</code>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <code className="text-green-600">{form.to_path}</code>
              <span className="px-2 py-0.5 bg-gray-200 rounded text-xs font-mono">{form.type}</span>
            </div>
          )}
        </div>
      )}

      {/* Redirects List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Redirects ({redirects.length})</h3>
          <span className="text-xs text-gray-500">{redirects.filter((r) => r.active).length} active</span>
        </div>

        {loading ? <LoadingSpinner /> : redirects.length === 0 ? (
          <div className="text-center py-16">
            <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No redirects configured</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {redirects.map((redirect) => (
              <div key={redirect.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 ${!redirect.active ? 'opacity-50' : ''}`}>
                <button onClick={() => toggleActive(redirect)} className="flex-shrink-0" title={redirect.active ? 'Deactivate' : 'Activate'}>
                  {redirect.active ? (
                    <ToggleRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-sm">
                    <code className="text-blue-600 truncate">{redirect.from_path}</code>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <code className="text-green-600 truncate">{redirect.to_path}</code>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded font-mono">{redirect.type}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" /> {redirect.hits || 0} hits
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(redirect.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => testRedirect(redirect.from_path)} className="p-2 text-gray-400 hover:text-green-600" title="Test">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button onClick={() => startEdit(redirect)} className="p-2 text-gray-400 hover:text-blue-600" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(redirect.id)} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-100">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> For server-side redirects to work on Netlify, you need to add them to your{' '}
          <code className="bg-yellow-100 px-1 rounded">netlify.toml</code> file or use Netlify's redirect rules.
          This manager stores redirects in the database for reference and client-side handling.
        </p>
      </div>
    </div>
  );
}
