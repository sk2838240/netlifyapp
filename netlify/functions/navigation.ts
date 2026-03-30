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

const NavItemSchema = z.object({
  label: z.string().min(1).max(100),
  url: z.string().min(1).max(500),
  order: z.number().int().min(0),
  parent_id: z.string().optional(),
  target: z.enum(['_self', '_blank']).optional(),
});

const NavigationSchema = z.object({
  items: z.array(NavItemSchema),
});

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

  try {
    // GET /api/navigation
    if (req.method === 'GET') {
      const items = await getData('navigation');
      // Sort by order
      items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      return new Response(JSON.stringify({ data: items }), { headers });
    }

    // Verify authentication for write operations
    const user = verifyAuth(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    // PUT /api/navigation
    if (req.method === 'PUT') {
      const body = await req.json();
      const validation = NavigationSchema.safeParse(body);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const { items } = validation.data;
      
      // Add IDs to items that don't have them
      const itemsWithIds = items.map((item: any) => ({
        id: item.id || generateId(),
        ...item,
      }));

      await setData('navigation', itemsWithIds);

      return new Response(JSON.stringify({ data: itemsWithIds }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    console.error('Navigation error:', e);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers });
  }
};
