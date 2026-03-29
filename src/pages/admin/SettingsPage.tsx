import { useState, useEffect } from 'react';
import { Save, Globe, Image, Code, Share2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { SiteSettings } from '../../types';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const defaultSettings: SiteSettings = {
  site_name: '',
  site_tagline: '',
  logo_url: '',
  favicon_url: '',
  footer_text: '',
  social_links: {},
  analytics_id: '',
  custom_css: '',
  custom_head: '',
  custom_footer: '',
};

export default function SettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => { if (res.data) setSettings(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateSocial = (platform: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
        body: JSON.stringify(settings),
      });
      addToast('Settings saved successfully', 'success');
    } catch { addToast('Failed to save settings', 'error'); }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'branding', label: 'Branding', icon: Image },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'advanced', label: 'Advanced', icon: Code },
  ];

  return (
    <div>
      <PageHeader title="Site Settings" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tab nav */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => update('site_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="My Website"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settings.site_tagline}
                    onChange={(e) => update('site_tagline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="A short description of your site"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
                  <input
                    type="text"
                    value={settings.footer_text}
                    onChange={(e) => update('footer_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="© 2026 All Rights Reserved"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    value={settings.analytics_id || ''}
                    onChange={(e) => update('analytics_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="text"
                    value={settings.logo_url}
                    onChange={(e) => update('logo_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                  {settings.logo_url && (
                    <img src={settings.logo_url} alt="Logo" className="mt-2 h-12 object-contain" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                  <input
                    type="text"
                    value={settings.favicon_url}
                    onChange={(e) => update('favicon_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="https://example.com/favicon.ico"
                  />
                  {settings.favicon_url && (
                    <img src={settings.favicon_url} alt="Favicon" className="mt-2 h-8 w-8 object-contain" />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-4">
                {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'github'].map((platform) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{platform} URL</label>
                    <div className="flex items-center gap-3">
                      <i className={`fab fa-${platform} text-lg text-gray-400 w-6`} />
                      <input
                        type="text"
                        value={(settings.social_links as any)[platform] || ''}
                        onChange={(e) => updateSocial(platform, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder={`https://${platform}.com/yourprofile`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS</label>
                  <textarea
                    value={settings.custom_css || ''}
                    onChange={(e) => update('custom_css', e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs"
                    placeholder=".custom-class { color: red; }"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Head HTML</label>
                  <textarea
                    value={settings.custom_head || ''}
                    onChange={(e) => update('custom_head', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs"
                    placeholder="<script>...</script>"
                  />
                  <p className="text-xs text-gray-500 mt-1">Added to &lt;head&gt; on all pages</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Footer HTML</label>
                  <textarea
                    value={settings.custom_footer || ''}
                    onChange={(e) => update('custom_footer', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs"
                    placeholder="<script>...</script>"
                  />
                  <p className="text-xs text-gray-500 mt-1">Added before &lt;/body&gt; on all pages</p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
