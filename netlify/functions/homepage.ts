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

async function getData(key: string): Promise<any[]> {
  const data = await store.get(key, { type: 'json' });
  return data || [];
}

async function setData(key: string, data: any[]) {
  await store.set(key, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export default async (req: Request, context: Context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  const url = new URL(req.url);
  const pathParts = url.pathname.replace('/api/homepage', '').replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  try {
    if (req.method === 'GET') {
      const sections = await getData('homepage_sections');
      return new Response(JSON.stringify({ data: sections }), { headers });
    }

    if (!verifyAuth(req)) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    const body = await req.json();

    if (req.method === 'POST') {
      const sections = await getData('homepage_sections');
      const newSection = {
        id: generateId(),
        ...body,
        order: body.order ?? sections.length,
        visible: body.visible ?? true,
      };
      sections.push(newSection);
      await setData('homepage_sections', sections);
      return new Response(JSON.stringify({ data: newSection }), { status: 201, headers });
    }

    if (req.method === 'PUT' && pathParts[0] === 'reorder') {
      await setData('homepage_sections', body.sections || []);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (req.method === 'PUT' && pathParts.length === 1) {
      const id = pathParts[0];
      const sections = await getData('homepage_sections');
      const index = sections.findIndex((s: any) => s.id === id);
      if (index === -1) return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers });
      sections[index] = { ...sections[index], ...body };
      await setData('homepage_sections', sections);
      return new Response(JSON.stringify({ data: sections[index] }), { headers });
    }

    if (req.method === 'DELETE' && pathParts.length === 1) {
      const id = pathParts[0];
      const sections = await getData('homepage_sections');
      await setData('homepage_sections', sections.filter((s: any) => s.id !== id));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500, headers });
  }
};
