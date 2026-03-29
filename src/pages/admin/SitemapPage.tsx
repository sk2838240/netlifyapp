import { useState, useEffect } from 'react';
import { Globe, Download, RefreshCw, Copy, Check, ExternalLink, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Content } from '../../types';
import PageHeader from '../../components/admin/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SitemapPage() {
  const { addToast } = useToast();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitemapXml, setSitemapXml] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setContent(data.data || []);
      generateSitemap(data.data || []);
    } catch { addToast('Failed to load content', 'error'); }
    setLoading(false);
  };

  const generateSitemap = (items: Content[]) => {
    setGenerating(true);
    const published = items.filter((c) => c.status === 'published');
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Homepage
    xml += `  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Static pages
    xml += `  <url>\n    <loc>${siteUrl}/blog</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${siteUrl}/press</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;

    // Content pages
    for (const item of published) {
      let path = '';
      switch (item.type) {
        case 'blog': path = `/blog/${item.slug}`; break;
        case 'press': path = `/press/${item.slug}`; break;
        case 'page': path = `/${item.slug}`; break;
        default: path = `/${item.slug}`;
      }

      const lastmod = (item.updated_at || item.created_at || new Date().toISOString()).split('T')[0];
      const priority = item.featured ? '0.9' : item.type === 'page' ? '0.7' : '0.6';
      const changefreq = item.type === 'blog' ? 'monthly' : 'weekly';

      xml += `  <url>\n    <loc>${siteUrl}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n`;

      if (item.image) {
        xml += `    <image:image>\n      <image:loc>${item.image}</image:loc>\n      <image:title>${escapeXml(item.title)}</image:title>\n    </image:image>\n`;
      }

      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    setSitemapXml(xml);
    setGenerating(false);
  };

  const escapeXml = (str: string) =>
    (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const copySitemap = () => {
    navigator.clipboard.writeText(sitemapXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Sitemap copied to clipboard', 'success');
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Sitemap downloaded', 'success');
  };

  const publishedCount = content.filter((c) => c.status === 'published').length;
  const blogCount = content.filter((c) => c.type === 'blog' && c.status === 'published').length;
  const pageCount = content.filter((c) => c.type === 'page' && c.status === 'published').length;
  const pressCount = content.filter((c) => c.type === 'press' && c.status === 'published').length;

  const totalUrls = 3 + publishedCount; // homepage + blog page + press page + content

  return (
    <div>
      <PageHeader title="Sitemap Generator" />

      <p className="text-sm text-gray-500 mb-6">
        Automatically generate an XML sitemap from all your published content. The sitemap includes proper metadata, image references, and priority settings for search engines.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total URLs', value: totalUrls, color: 'bg-blue-50 text-blue-600' },
          { label: 'Blog Posts', value: blogCount, color: 'bg-purple-50 text-purple-600' },
          { label: 'Pages', value: pageCount, color: 'bg-green-50 text-green-600' },
          { label: 'Press', value: pressCount, color: 'bg-orange-50 text-orange-600' },
          { label: 'Static Pages', value: 3, color: 'bg-gray-50 text-gray-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => generateSitemap(content)}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} /> Regenerate
        </button>
        <button
          onClick={copySitemap}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:text-gray-900"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} Copy XML
        </button>
        <button
          onClick={downloadSitemap}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:text-gray-900"
        >
          <Download className="w-4 h-4" /> Download
        </button>
        <a
          href="/api/sitemap"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:text-gray-900"
        >
          <ExternalLink className="w-4 h-4" /> View Live
        </a>
      </div>

      {/* Sitemap Preview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Sitemap Preview</span>
          </div>
          <span className="text-xs text-gray-400">{sitemapXml.split('\n').length} lines</span>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <pre className="p-6 text-xs font-mono text-gray-600 overflow-x-auto max-h-[500px] overflow-y-auto bg-gray-50">
            {sitemapXml}
          </pre>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">How to use your sitemap</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Your live sitemap is available at: <code className="bg-blue-100 px-1 rounded text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/api/sitemap</code></li>
          <li>Submit this URL to Google Search Console</li>
          <li>Add to your robots.txt: <code className="bg-blue-100 px-1 rounded text-xs">Sitemap: {typeof window !== 'undefined' ? window.location.origin : ''}/api/sitemap</code></li>
          <li>The sitemap auto-updates whenever content is published</li>
        </ol>
      </div>
    </div>
  );
}
