import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const store = getStore('cms-data');

function verifyAuth(req: Request): boolean {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  try {
    const data = JSON.parse(Buffer.from(auth.slice(7), 'base64').toString('utf-8'));
    return data.exp > Date.now();
  } catch { return false; }
}

const defaultSettings = {
  site_name: 'My Website',
  site_tagline: 'Welcome to my site',
  logo_url: '',
  favicon_url: '',
  footer_text: `© ${new Date().getFullYear()} All Rights Reserved.`,
  social_links: {},
  analytics_id: '',
  custom_css: '',
  custom_head: '',
  custom_footer: '',
};

export default async (req: Request, context: Context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  try {
    if (req.method === 'GET') {
      const settings = await store.get('site_settings', { type: 'json' });
      return new Response(JSON.stringify({ data: settings || defaultSettings }), { headers });
    }

    if (!verifyAuth(req)) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      await store.set('site_settings', JSON.stringify(body));
      return new Response(JSON.stringify({ data: body }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500, headers });
  }
};
