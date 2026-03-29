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

const defaultStyles = {
  primary_color: '#2563eb',
  secondary_color: '#7c3aed',
  accent_color: '#f59e0b',
  background_color: '#ffffff',
  text_color: '#1f2937',
  heading_font: 'Inter',
  body_font: 'Roboto',
  heading_size_h1: '3rem',
  heading_size_h2: '2.25rem',
  heading_size_h3: '1.5rem',
  paragraph_size: '1rem',
  paragraph_line_height: '1.75',
  faq_heading_size: '1.125rem',
  faq_content_size: '0.95rem',
  link_color: '#2563eb',
  link_hover_color: '#1d4ed8',
  button_color: '#2563eb',
  button_text_color: '#ffffff',
  border_radius: '0.5rem',
  card_shadow: '0 1px 3px rgba(0,0,0,0.1)',
  header_background: '#ffffff',
  header_text_color: '#1f2937',
  footer_background: '#f9fafb',
  footer_text_color: '#6b7280',
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
      const styles = await store.get('site_styles', { type: 'json' });
      return new Response(JSON.stringify({ data: styles || defaultStyles }), { headers });
    }

    if (!verifyAuth(req)) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      await store.set('site_styles', JSON.stringify(body));
      return new Response(JSON.stringify({ data: body }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500, headers });
  }
};
