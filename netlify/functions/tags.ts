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
  const pathParts = url.pathname.replace('/api/tags', '').replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  try {
    if (req.method === 'GET') {
      const items = await getData('tags');
      return new Response(JSON.stringify({ data: items }), { headers });
    }

    if (!verifyAuth(req)) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    const body = await req.json();

    if (req.method === 'POST') {
      const items = await getData('tags');
      const newItem = { id: generateId(), ...body, created_at: new Date().toISOString() };
      items.push(newItem);
      await setData('tags', items);
      return new Response(JSON.stringify({ data: newItem }), { status: 201, headers });
    }

    if (req.method === 'PUT' && pathParts.length === 1) {
      const id = pathParts[0];
      const items = await getData('tags');
      const index = items.findIndex((i: any) => i.id === id);
      if (index === -1) return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers });
      items[index] = { ...items[index], ...body };
      await setData('tags', items);
      return new Response(JSON.stringify({ data: items[index] }), { headers });
    }

    if (req.method === 'DELETE' && pathParts.length === 1) {
      const id = pathParts[0];
      const items = await getData('tags');
      await setData('tags', items.filter((i: any) => i.id !== id));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500, headers });
  }
};
