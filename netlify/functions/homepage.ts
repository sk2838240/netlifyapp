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

const SectionSchema = z.object({
  type: z.enum(['hero', 'about', 'features', 'testimonials', 'cta', 'faq', 'custom']),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  content: z.string().min(1),
  image: z.string().url().optional(),
  background_color: z.string().optional(),
  text_color: z.string().optional(),
  button_text: z.string().max(50).optional(),
  button_url: z.string().optional(),
  button_color: z.string().optional(),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
});

const UpdateSectionSchema = SectionSchema.partial();

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
  const pathParts = url.pathname.replace('/api/homepage', '').replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  try {
    // GET /api/homepage
    if (req.method === 'GET') {
      const items = await getData('homepage_sections');
      // Sort by order
      items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      return new Response(JSON.stringify({ data: items }), { headers });
    }

    // Verify authentication for write operations
    const user = verifyAuth(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    // POST /api/homepage
    if (req.method === 'POST') {
      const body = await req.json();
      const validation = SectionSchema.safeParse(body);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const items = await getData('homepage_sections');

      const newItem = {
        id: generateId(),
        ...data,
        order: data.order ?? items.length,
        visible: data.visible ?? true,
      };

      items.push(newItem);
      await setData('homepage_sections', items);

      return new Response(JSON.stringify({ data: newItem }), { status: 201, headers });
    }

    // PUT /api/homepage/reorder
    if (req.method === 'PUT' && pathParts[0] === 'reorder') {
      const body = await req.json();
      const { orderedIds } = body;

      if (!Array.isArray(orderedIds)) {
        return new Response(JSON.stringify({ message: 'orderedIds must be an array' }), { status: 400, headers });
      }

      const items = await getData('homepage_sections');
      
      // Reorder items
      const reorderedItems = orderedIds.map((id: string, index: number) => {
        const item = items.find((i: any) => i.id === id);
        if (!item) return null;
        return { ...item, order: index };
      }).filter(Boolean);

      await setData('homepage_sections', reorderedItems);

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // PUT /api/homepage/:id
    if (req.method === 'PUT' && pathParts.length === 1) {
      const id = pathParts[0];
      const body = await req.json();
      const validation = UpdateSectionSchema.safeParse(body);

      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const items = await getData('homepage_sections');
      const index = items.findIndex((i: any) => i.id === id);

      if (index === -1) {
        return new Response(JSON.stringify({ message: 'Section not found' }), { status: 404, headers });
      }

      items[index] = { ...items[index], ...data };
      await setData('homepage_sections', items);

      return new Response(JSON.stringify({ data: items[index] }), { headers });
    }

    // DELETE /api/homepage/:id
    if (req.method === 'DELETE' && pathParts.length === 1) {
      const id = pathParts[0];
      const items = await getData('homepage_sections');
      const item = items.find((i: any) => i.id === id);

      if (!item) {
        return new Response(JSON.stringify({ message: 'Section not found' }), { status: 404, headers });
      }

      const filtered = items.filter((i: any) => i.id !== id);
      await setData('homepage_sections', filtered);

      return new Response(JSON.stringify({ success: true, message: 'Section deleted' }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    console.error('Homepage error:', e);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers });
  }
};
