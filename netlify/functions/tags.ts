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

const TagSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
});

const UpdateTagSchema = TagSchema.partial();

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

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.replace('/api/tags', '').replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  try {
    // GET /api/tags
    if (req.method === 'GET') {
      const items = await getData('tags');
      return new Response(JSON.stringify({ data: items }), { headers });
    }

    // Verify authentication for write operations
    const user = verifyAuth(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    // POST /api/tags
    if (req.method === 'POST') {
      const body = await req.json();
      const validation = TagSchema.safeParse(body);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const items = await getData('tags');

      const existingSlug = items.find((i: any) => i.slug === data.slug);
      if (existingSlug) {
        return new Response(JSON.stringify({ message: 'Slug already exists' }), { status: 409, headers });
      }

      const newItem = {
        id: generateId(),
        ...data,
        slug: data.slug || generateSlug(data.name),
        created_at: new Date().toISOString(),
      };

      items.push(newItem);
      await setData('tags', items);

      return new Response(JSON.stringify({ data: newItem }), { status: 201, headers });
    }

    // PUT /api/tags/:id
    if (req.method === 'PUT' && pathParts.length === 1) {
      const id = pathParts[0];
      const body = await req.json();
      const validation = UpdateTagSchema.safeParse(body);

      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const items = await getData('tags');
      const index = items.findIndex((i: any) => i.id === id);

      if (index === -1) {
        return new Response(JSON.stringify({ message: 'Tag not found' }), { status: 404, headers });
      }

      if (data.slug && data.slug !== items[index].slug) {
        const existingSlug = items.find((i: any) => i.slug === data.slug && i.id !== id);
        if (existingSlug) {
          return new Response(JSON.stringify({ message: 'Slug already exists' }), { status: 409, headers });
        }
      }

      items[index] = { ...items[index], ...data };
      await setData('tags', items);

      return new Response(JSON.stringify({ data: items[index] }), { headers });
    }

    // DELETE /api/tags/:id
    if (req.method === 'DELETE' && pathParts.length === 1) {
      const id = pathParts[0];
      const items = await getData('tags');
      const item = items.find((i: any) => i.id === id);

      if (!item) {
        return new Response(JSON.stringify({ message: 'Tag not found' }), { status: 404, headers });
      }

      const filtered = items.filter((i: any) => i.id !== id);
      await setData('tags', filtered);

      return new Response(JSON.stringify({ success: true, message: 'Tag deleted' }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    console.error('Tags error:', e);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers });
  }
};
