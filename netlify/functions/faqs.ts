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

const FAQSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
  category: z.string().max(100).optional(),
  order: z.number().int().min(0).optional(),
  page_id: z.string().optional(),
});

const UpdateFAQSchema = FAQSchema.partial();

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
  const pathParts = url.pathname.replace('/api/faqs', '').replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  const pageIdFilter = url.searchParams.get('page_id');

  try {
    // GET /api/faqs
    if (req.method === 'GET') {
      let items = await getData('faqs');
      
      if (pageIdFilter) {
        items = items.filter((i: any) => i.page_id === pageIdFilter);
      }

      // Sort by order
      items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      return new Response(JSON.stringify({ data: items }), { headers });
    }

    // Verify authentication for write operations
    const user = verifyAuth(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    // POST /api/faqs
    if (req.method === 'POST') {
      const body = await req.json();
      const validation = FAQSchema.safeParse(body);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const items = await getData('faqs');

      const newItem = {
        id: generateId(),
        ...data,
        order: data.order ?? items.length,
        created_at: new Date().toISOString(),
      };

      items.push(newItem);
      await setData('faqs', items);

      return new Response(JSON.stringify({ data: newItem }), { status: 201, headers });
    }

    // PUT /api/faqs/:id
    if (req.method === 'PUT' && pathParts.length === 1) {
      const id = pathParts[0];
      const body = await req.json();
      const validation = UpdateFAQSchema.safeParse(body);

      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const items = await getData('faqs');
      const index = items.findIndex((i: any) => i.id === id);

      if (index === -1) {
        return new Response(JSON.stringify({ message: 'FAQ not found' }), { status: 404, headers });
      }

      items[index] = { ...items[index], ...data };
      await setData('faqs', items);

      return new Response(JSON.stringify({ data: items[index] }), { headers });
    }

    // DELETE /api/faqs/:id
    if (req.method === 'DELETE' && pathParts.length === 1) {
      const id = pathParts[0];
      const items = await getData('faqs');
      const item = items.find((i: any) => i.id === id);

      if (!item) {
        return new Response(JSON.stringify({ message: 'FAQ not found' }), { status: 404, headers });
      }

      const filtered = items.filter((i: any) => i.id !== id);
      await setData('faqs', filtered);

      return new Response(JSON.stringify({ success: true, message: 'FAQ deleted' }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    console.error('FAQs error:', e);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers });
  }
};
