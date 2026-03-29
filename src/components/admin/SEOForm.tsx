interface SEOFormProps {
  data: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
    og_title?: string;
    og_description?: string;
    og_image?: string;
    canonical_url?: string;
    robots?: string;
    schema?: string;
    h1?: string;
  };
  onChange: (data: any) => void;
}

export default function SEOForm({ data, onChange }: SEOFormProps) {
  const update = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        SEO Settings
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">H1 Heading</label>
        <input
          type="text"
          value={data.h1 || ''}
          onChange={(e) => update('h1', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          placeholder="Main page heading for SEO"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
        <input
          type="text"
          value={data.meta_title || ''}
          onChange={(e) => update('meta_title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          placeholder="Title shown in search results (50-60 chars)"
        />
        <p className="text-xs text-gray-500 mt-1">{(data.meta_title || '').length}/60 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
        <textarea
          value={data.meta_description || ''}
          onChange={(e) => update('meta_description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          placeholder="Description shown in search results (150-160 chars)"
        />
        <p className="text-xs text-gray-500 mt-1">{(data.meta_description || '').length}/160 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
        <input
          type="text"
          value={(data.meta_keywords || []).join(', ')}
          onChange={(e) => update('meta_keywords', e.target.value.split(',').map((k) => k.trim()).filter(Boolean))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
          <input
            type="text"
            value={data.og_title || ''}
            onChange={(e) => update('og_title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            placeholder="Open Graph title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
          <input
            type="text"
            value={data.og_image || ''}
            onChange={(e) => update('og_image', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
        <textarea
          value={data.og_description || ''}
          onChange={(e) => update('og_description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          placeholder="Description for social media sharing"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
          <input
            type="text"
            value={data.canonical_url || ''}
            onChange={(e) => update('canonical_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            placeholder="https://example.com/page"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Robots</label>
          <select
            value={data.robots || 'index, follow'}
            onChange={(e) => update('robots', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="index, follow">Index, Follow</option>
            <option value="noindex, follow">No Index, Follow</option>
            <option value="index, nofollow">Index, No Follow</option>
            <option value="noindex, nofollow">No Index, No Follow</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Schema (JSON-LD)</label>
        <textarea
          value={data.schema || ''}
          onChange={(e) => update('schema', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-mono text-xs"
          placeholder='{"@context": "https://schema.org", "@type": "Article", ...}'
        />
      </div>
    </div>
  );
}
