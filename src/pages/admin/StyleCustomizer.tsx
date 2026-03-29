import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { SiteStyle } from '../../types';
import { defaultStyles, generateCSSVariables } from '../../lib/styles';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const fontOptions = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Georgia', 'Times New Roman'];

const styleGroups = [
  {
    label: 'Colors',
    fields: [
      { key: 'primary_color', label: 'Primary Color', type: 'color' },
      { key: 'secondary_color', label: 'Secondary Color', type: 'color' },
      { key: 'accent_color', label: 'Accent Color', type: 'color' },
      { key: 'background_color', label: 'Background Color', type: 'color' },
      { key: 'text_color', label: 'Text Color', type: 'color' },
      { key: 'link_color', label: 'Link Color', type: 'color' },
      { key: 'link_hover_color', label: 'Link Hover Color', type: 'color' },
      { key: 'button_color', label: 'Button Color', type: 'color' },
      { key: 'button_text_color', label: 'Button Text Color', type: 'color' },
    ],
  },
  {
    label: 'Typography',
    fields: [
      { key: 'heading_font', label: 'Heading Font', type: 'font' },
      { key: 'body_font', label: 'Body Font', type: 'font' },
      { key: 'heading_size_h1', label: 'H1 Size', type: 'text' },
      { key: 'heading_size_h2', label: 'H2 Size', type: 'text' },
      { key: 'heading_size_h3', label: 'H3 Size', type: 'text' },
      { key: 'paragraph_size', label: 'Paragraph Size', type: 'text' },
      { key: 'paragraph_line_height', label: 'Paragraph Line Height', type: 'text' },
    ],
  },
  {
    label: 'FAQ Styles',
    fields: [
      { key: 'faq_heading_size', label: 'FAQ Heading Size', type: 'text' },
      { key: 'faq_content_size', label: 'FAQ Content Size', type: 'text' },
    ],
  },
  {
    label: 'Layout',
    fields: [
      { key: 'border_radius', label: 'Border Radius', type: 'text' },
      { key: 'card_shadow', label: 'Card Shadow', type: 'text' },
      { key: 'header_background', label: 'Header Background', type: 'color' },
      { key: 'header_text_color', label: 'Header Text Color', type: 'color' },
      { key: 'footer_background', label: 'Footer Background', type: 'color' },
      { key: 'footer_text_color', label: 'Footer Text Color', type: 'color' },
    ],
  },
];

export default function StyleCustomizer() {
  const { addToast } = useToast();
  const [styles, setStyles] = useState<SiteStyle>(defaultStyles);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);

  useEffect(() => {
    fetch('/api/styles')
      .then((r) => r.json())
      .then((res) => { if (res.data) setStyles({ ...defaultStyles, ...res.data }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const css = generateCSSVariables(styles);
    let el = document.getElementById('preview-styles');
    if (!el) {
      el = document.createElement('style');
      el.id = 'preview-styles';
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, [styles]);

  const update = (key: string, value: string) => {
    setStyles((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/styles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cms_auth_token')}` },
        body: JSON.stringify(styles),
      });
      addToast('Styles saved successfully', 'success');
    } catch { addToast('Failed to save styles', 'error'); }
    setSaving(false);
  };

  const handleReset = () => {
    if (confirm('Reset all styles to defaults?')) {
      setStyles(defaultStyles);
      addToast('Styles reset to defaults', 'info');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Style Customizer" />

      <p className="text-sm text-gray-500 mb-6">
        Customize the look and feel of your website. Changes apply globally to all pages while keeping the header and footer structure intact.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {styleGroups.map((group, i) => (
                <button
                  key={group.label}
                  onClick={() => setActiveGroup(i)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeGroup === i
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {styleGroups[activeGroup].fields.map((field) => (
                <div key={field.key} className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-48 flex-shrink-0">
                    {field.label}
                  </label>
                  {field.type === 'color' ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={(styles as any)[field.key] || '#000000'}
                        onChange={(e) => update(field.key, e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={(styles as any)[field.key] || ''}
                        onChange={(e) => update(field.key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  ) : field.type === 'font' ? (
                    <select
                      value={(styles as any)[field.key] || ''}
                      onChange={(e) => update(field.key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    >
                      {fontOptions.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={(styles as any)[field.key] || ''}
                      onChange={(e) => update(field.key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Styles'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset to Defaults
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <div className="sticky top-24">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Live Preview</h3>
            <div
              className="rounded-xl border border-gray-200 overflow-hidden"
              style={{ background: styles.background_color, color: styles.text_color }}
            >
              <div className="p-4" style={{ background: styles.header_background }}>
                <span className="font-bold text-sm" style={{ color: styles.header_text_color, fontFamily: styles.heading_font }}>
                  Header
                </span>
              </div>
              <div className="p-6">
                <h1 style={{ fontFamily: styles.heading_font, fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Heading Preview
                </h1>
                <h2 style={{ fontFamily: styles.heading_font, fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Subheading Preview
                </h2>
                <p style={{ fontFamily: styles.body_font, fontSize: styles.paragraph_size, lineHeight: styles.paragraph_line_height, marginBottom: '1rem', opacity: 0.8 }}>
                  This is how your paragraph text will look with the current style settings.
                </p>
                <a href="#" style={{ color: styles.link_color, fontSize: '0.875rem', display: 'block', marginBottom: '1rem' }}>
                  Link Preview
                </a>
                <button
                  style={{
                    background: styles.button_color,
                    color: styles.button_text_color,
                    padding: '0.5rem 1rem',
                    borderRadius: styles.border_radius,
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'block',
                    marginBottom: '1rem',
                  }}
                >
                  Button Preview
                </button>
                <div
                  className="p-4 mt-2"
                  style={{ background: '#f9fafb', borderRadius: styles.border_radius, boxShadow: styles.card_shadow }}
                >
                  <p style={{ fontFamily: styles.body_font, fontSize: styles.faq_heading_size, fontWeight: 600, marginBottom: '0.25rem' }}>
                    FAQ Question
                  </p>
                  <p style={{ fontFamily: styles.body_font, fontSize: styles.faq_content_size, opacity: 0.7 }}>
                    FAQ answer content preview
                  </p>
                </div>
              </div>
              <div className="p-3" style={{ background: styles.footer_background }}>
                <span className="text-xs" style={{ color: styles.footer_text_color }}>Footer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
