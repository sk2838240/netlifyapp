import { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Pause, Trash2, Edit3, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Content } from '../../types';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SchedulePage() {
  const { addToast } = useToast();
  const [scheduled, setScheduled] = useState<Content[]>([]);
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedContent, setSelectedContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds to check for auto-published items
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scheduleRes, contentRes] = await Promise.all([
        fetch('/api/schedule').then((r) => r.json()),
        fetch('/api/content').then((r) => r.json()),
      ]);
      setScheduled(scheduleRes.data || []);
      setAllContent(contentRes.data || []);
    } catch { addToast('Failed to load data', 'error'); }
    setLoading(false);
  };

  const handleSchedule = async () => {
    if (!selectedContent || !scheduleDate || !scheduleTime) {
      addToast('Please select content and set date/time', 'error');
      return;
    }

    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    if (new Date(scheduledAt) <= new Date()) {
      addToast('Schedule time must be in the future', 'error');
      return;
    }

    try {
      await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
        body: JSON.stringify({ content_id: selectedContent, scheduled_at: scheduledAt }),
      });
      addToast('Content scheduled successfully', 'success');
      setShowScheduler(false);
      setSelectedContent('');
      setScheduleDate('');
      setScheduleTime('');
      loadData();
    } catch { addToast('Failed to schedule content', 'error'); }
  };

  const handleUnschedule = async (contentId: string) => {
    if (!confirm('Unschedule this content? It will be moved back to drafts.')) return;
    try {
      await fetch('/api/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
        body: JSON.stringify({ content_id: contentId }),
      });
      addToast('Content unscheduled', 'success');
      loadData();
    } catch { addToast('Failed to unschedule', 'error'); }
  };

  const handlePublishNow = async (item: Content) => {
    try {
      await fetch(`/api/content/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
        body: JSON.stringify({ status: 'published', scheduled_at: null }),
      });
      addToast('Published immediately', 'success');
      loadData();
    } catch { addToast('Failed to publish', 'error'); }
  };

  // Draft content that can be scheduled
  const draftContent = allContent.filter((c) => c.status === 'draft');

  // Get min datetime for scheduling (now + 1 min)
  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div>
      <PageHeader
        title="Content Scheduler"
        actionLabel="Schedule Content"
        onAction={() => setShowScheduler(true)}
      />

      <p className="text-sm text-gray-500 mb-6">
        Schedule content to be automatically published at a specific date and time. Scheduled content is checked and published automatically.
      </p>

      {/* Schedule New */}
      {showScheduler && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Schedule New Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Content</label>
              <select
                value={selectedContent}
                onChange={(e) => setSelectedContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Choose draft content...</option>
                {draftContent.map((c) => (
                  <option key={c.id} value={c.id}>{c.title} ({c.type})</option>
                ))}
              </select>
              {draftContent.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">No draft content available</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSchedule} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Calendar className="w-4 h-4 inline mr-1" /> Schedule
            </button>
            <button onClick={() => setShowScheduler(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Content List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Scheduled Content ({scheduled.length})</h3>
        </div>

        {loading ? <LoadingSpinner /> : scheduled.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No scheduled content</p>
            <p className="text-xs text-gray-400 mt-1">Schedule drafts to auto-publish later</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {scheduled.sort((a, b) => (a.scheduled_at || '').localeCompare(b.scheduled_at || '')).map((item) => {
              const scheduledDate = item.scheduled_at ? new Date(item.scheduled_at) : null;
              const isPast = scheduledDate && scheduledDate <= new Date();

              return (
                <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{item.type}</span>
                      {isPast && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 animate-pulse">
                          Due for publish
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {scheduledDate ? scheduledDate.toLocaleString() : 'No date set'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handlePublishNow(item)}
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="Publish Now"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <Link to={`/admin/content/${item.id}`} className="p-2 text-gray-400 hover:text-blue-600" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleUnschedule(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Unschedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Auto-publish:</strong> Scheduled content is automatically checked and published when the scheduled time arrives.
          The scheduler runs each time you visit this page or when content is accessed on the live site.
        </p>
      </div>
    </div>
  );
}
