import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const store = getStore('cms-data');
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production-min-32-chars';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

const RedirectSchema = z.object({
  from_path: z.string().min(1).max(500),
  to_path: z.string().min(1).max(500),
  type: z.number().int().min(300).max(399),
  active: z.boolean().optional(),
});

const UpdateRedirectSchema = RedirectSchema.partial();

function verifyAuth(req: Request): any {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.replace('/api/redirects', '').replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  try {
    // GET /api/redirects
    if (req.method === 'GET') {
      const items = await getData('redirects');
      return new Response(JSON.stringify({ data: items }), { headers });
    }

    // Verify authentication for write operations
    const user = verifyAuth(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    // POST /api/redirects
    if (req.method === 'POST') {
      const body = await req.json();
      const validation = RedirectSchema.safeParse(body);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const items = await getData('redirects');

      // Check for duplicate from_path
      const existing = items.find((i: any) => i.from_path === data.from_path);
      if (existing) {
        return new Response(JSON.stringify({ message: 'From path already exists' }), { status: 409, headers });
      }

      const newItem = {
        id: generateId(),
        ...data,
        active: data.active ?? true,
        hits: 0,
        created_at: new Date().toISOString(),
      };

      items.push(newItem);
      await setData('redirects', items);

      return new Response(JSON.stringify({ data: newItem }), { status: 201, headers });
    }

    // PUT /api/redirects/:id
    if (req.method === 'PUT' && pathParts.length === 1) {
      const id = pathParts[0];
      const body = await req.json();
      const validation = UpdateRedirectSchema.safeParse(body);

      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const items = await getData('redirects');
      const index = items.findIndex((i: any) => i.id === id);

      if (index === -1) {
        return new Response(JSON.stringify({ message: 'Redirect not found' }), { status: 404, headers });
      }

      // Check for duplicate from_path if being updated
      if (data.from_path && data.from_path !== items[index].from_path) {
        const existing = items.find((i: any) => i.from_path === data.from_path && i.id !== id);
        if (existing) {
          return new Response(JSON.stringify({ message: 'From path already exists' }), { status: 409, headers });
        }
      }

      items[index] = { ...items[index], ...data };
      await setData('redirects', items);

      return new Response(JSON.stringify({ data: items[index] }), { headers });
    }

    // DELETE /api/redirects/:id
    if (req.method === 'DELETE' && pathParts.length === 1) {
      const id = pathParts[0];
      const items = await getData('redirects');
      const item = items.find((i: any) => i.id === id);

      if (!item) {
        return new Response(JSON.stringify({ message: 'Redirect not found' }), { status: 404, headers });
      }

      const filtered = items.filter((i: any) => i.id !== id);
      await setData('redirects', filtered);

      return new Response(JSON.stringify({ success: true, message: 'Redirect deleted' }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    console.error('Redirects error:', e);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers });
  }
};
