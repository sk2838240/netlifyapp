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
  const pathParts = url.pathname.replace('/api/redirects', '').replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  try {
    // GET - list all redirects or check a path
    if (req.method === 'GET') {
      const redirects = await getData('redirects');
      return new Response(JSON.stringify({ data: redirects }), { headers });
    }

    if (!verifyAuth(req)) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    const body = await req.json();

    // POST - create redirect
    if (req.method === 'POST') {
      const { from_path, to_path, type, active } = body;

      if (!from_path || !to_path) {
        return new Response(JSON.stringify({ message: 'from_path and to_path required' }), { status: 400, headers });
      }

      const redirects = await getData('redirects');

      // Check for duplicate from_path
      if (redirects.some((r: any) => r.from_path === from_path)) {
        return new Response(JSON.stringify({ message: 'Redirect for this path already exists' }), { status: 409, headers });
      }

      const newRedirect = {
        id: generateId(),
        from_path,
        to_path,
        type: type || 301,
        active: active !== false,
        hits: 0,
        created_at: new Date().toISOString(),
      };

      redirects.push(newRedirect);
      await setData('redirects', redirects);

      return new Response(JSON.stringify({ data: newRedirect }), { status: 201, headers });
    }

    // PUT /api/redirects/:id
    if (req.method === 'PUT' && pathParts.length === 1) {
      const id = pathParts[0];
      const redirects = await getData('redirects');
      const index = redirects.findIndex((r: any) => r.id === id);
      if (index === -1) return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers });

      redirects[index] = { ...redirects[index], ...body };
      await setData('redirects', redirects);

      return new Response(JSON.stringify({ data: redirects[index] }), { headers });
    }

    // DELETE /api/redirects/:id
    if (req.method === 'DELETE' && pathParts.length === 1) {
      const id = pathParts[0];
      const redirects = await getData('redirects');
      await setData('redirects', redirects.filter((r: any) => r.id !== id));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500, headers });
  }
};
