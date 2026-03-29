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
      const items = await getData('navigation');
      const defaults = items.length > 0 ? items : [
        { id: '1', label: 'Home', url: '/', order: 0, target: '_self' },
        { id: '2', label: 'Blog', url: '/blog', order: 1, target: '_self' },
        { id: '3', label: 'Press', url: '/press', order: 2, target: '_self' },
      ];
      return new Response(JSON.stringify({ data: defaults }), { headers });
    }

    if (!verifyAuth(req)) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    if (req.method === 'PUT') {
      const { items } = await req.json();
      await setData('navigation', items);
      return new Response(JSON.stringify({ data: items }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500, headers });
  }
};
