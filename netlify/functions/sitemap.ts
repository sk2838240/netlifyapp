import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const store = getStore('cms-data');

async function getData(key: string): Promise<any[]> {
  const data = await store.get(key, { type: 'json' });
  return data || [];
}

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const siteUrl = url.origin;
    const content = await getData('content');
    const settings = await store.get('site_settings', { type: 'json' }) as any;
    const siteName = settings?.site_name || 'Website';

    const published = content.filter((c: any) => c.status === 'published');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Add homepage
    const homepage = await getData('homepage_sections');
    const lastmod = new Date().toISOString().split('T')[0];
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}/</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Add static pages
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}/blog</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}/press</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;

    // Add published content
    for (const item of published) {
      let path = '';
      switch (item.type) {
        case 'blog': path = `/blog/${item.slug}`; break;
        case 'press': path = `/press/${item.slug}`; break;
        case 'page': path = `/${item.slug}`; break;
        default: path = `/${item.slug}`;
      }

      const itemLastmod = (item.updated_at || item.created_at || new Date().toISOString()).split('T')[0];
      const priority = item.type === 'page' ? '0.7' : item.featured ? '0.9' : '0.6';
      const changefreq = item.type === 'blog' ? 'monthly' : 'weekly';

      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}${path}</loc>\n`;
      xml += `    <lastmod>${itemLastmod}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;

      if (item.image) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${item.image}</image:loc>\n`;
        xml += `      <image:title>${escapeXml(item.title)}</image:title>\n`;
        xml += `    </image:image>\n`;
      }

      // News sitemap for blog posts
      if (item.type === 'blog') {
        const pubDate = (item.created_at || new Date().toISOString()).split('T')[0];
        xml += `    <news:news>\n`;
        xml += `      <news:publication>\n`;
        xml += `        <news:name>${escapeXml(siteName)}</news:name>\n`;
        xml += `        <news:language>en</news:language>\n`;
        xml += `      </news:publication>\n`;
        xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
        xml += `      <news:title>${escapeXml(item.title)}</news:title>\n`;
        xml += `    </news:news>\n`;
      }

      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e: any) {
    return new Response(`<?xml version="1.0"?><error>${e.message}</error>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
};

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
