import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, GripVertical } from 'lucide-react';
import { useFAQs } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { FAQ, FAQInput } from '../../types';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function FAQPage() {
  const { faqs, loading, fetch, create, update, remove } = useFAQs();
  const { addToast } = useToast();
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQInput>({ question: '', answer: '', category: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      addToast('Question and answer are required', 'error');
      return;
    }
    try {
      if (editing) {
        await update(editing.id, { ...form, order: editing.order });
        addToast('FAQ updated', 'success');
      } else {
        await create({ ...form, order: faqs.length });
        addToast('FAQ created', 'success');
      }
      setCreating(false); setEditing(null); setForm({ question: '', answer: '', category: '' });
    } catch { addToast('Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try { await remove(id); addToast('FAQ deleted', 'success'); }
    catch { addToast('Failed to delete', 'error'); }
  };

  const startEdit = (faq: FAQ) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category || '' });
    setCreating(false);
  };

  return (
    <div>
      <PageHeader
        title="FAQs"
        actionLabel="New FAQ"
        onAction={() => { setCreating(true); setEditing(null); setForm({ question: '', answer: '', category: '' }); }}
      />

      {(creating || editing) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit FAQ' : 'New FAQ'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input
                type="text"
                value={form.question}
                onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter question..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
              <textarea
                value={form.answer}
                onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter answer..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
              <input
                type="text"
                value={form.category || ''}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g. General, Pricing"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <Save className="w-4 h-4" /> {editing ? 'Update' : 'Create'}
              </button>
              <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? <LoadingSpinner /> : faqs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No FAQs yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {faqs.sort((a: FAQ, b: FAQ) => a.order - b.order).map((faq: FAQ) => (
              <div key={faq.id} className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50">
                <GripVertical className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">{faq.question}</h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
                  {faq.category && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-gray-100 rounded">{faq.category}</span>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(faq)} className="p-2 text-gray-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(faq.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
