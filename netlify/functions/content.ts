import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const store = getStore('cms-data');
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production-min-32-chars';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Input validation schemas
const ContentSchema = z.object({
  type: z.enum(['blog', 'press', 'page']),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  body: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  image: z.string().url().optional().nullable(),
  metadata: z.object({
    description: z.string().max(300).optional(),
    keywords: z.array(z.string()).optional(),
    external_url: z.string().url().optional(),
    seo: z.object({
      meta_title: z.string().max(60).optional(),
      meta_description: z.string().max(160).optional(),
      meta_keywords: z.array(z.string()).optional(),
      og_title: z.string().max(60).optional(),
      og_description: z.string().max(160).optional(),
      og_image: z.string().url().optional(),
      canonical_url: z.string().url().optional(),
      robots: z.string().optional(),
      schema: z.string().optional(),
      h1: z.string().max(100).optional(),
    }).optional(),
  }).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'scheduled']).optional(),
  author: z.string().max(100).optional(),
  featured: z.boolean().optional(),
  scheduled_at: z.string().datetime().optional().nullable(),
});

const UpdateContentSchema = ContentSchema.partial();

// Verify JWT token
function verifyAuth(req: Request): any {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

// Helper functions
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

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default async (req: Request, context: Context) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.replace('/api/content', '').replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  const typeFilter = url.searchParams.get('type');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const statusFilter = url.searchParams.get('status');

  try {
    // GET /api/content or /api/content/:slug or /api/content/id/:id
    if (req.method === 'GET') {
      let items = await getData('content');

      // Apply filters
      if (typeFilter) {
        items = items.filter((i: any) => i.type === typeFilter);
      }
      if (statusFilter) {
        items = items.filter((i: any) => i.status === statusFilter);
      }

      // Sort by updated_at descending
      items.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      // Handle single item by slug or id
      if (pathParts.length > 0) {
        if (pathParts[0] === 'id' && pathParts[1]) {
          const item = items.find((i: any) => i.id === pathParts[1]);
          if (!item) {
            return new Response(
              JSON.stringify({ message: 'Content not found' }),
              { status: 404, headers }
            );
          }
          return new Response(JSON.stringify({ data: item }), { headers });
        }

        const slug = pathParts[0];
        const item = items.find((i: any) => i.slug === slug);
        if (!item) {
          return new Response(
            JSON.stringify({ message: 'Content not found' }),
            { status: 404, headers }
          );
        }
        return new Response(JSON.stringify({ data: item }), { headers });
      }

      // Paginate results
      const total = items.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedItems = items.slice(start, start + limit);

      return new Response(
        JSON.stringify({
          data: paginatedItems,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        }),
        { headers }
      );
    }

    // Verify authentication for write operations
    const user = verifyAuth(req);
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers }
      );
    }

    // POST /api/content
    if (req.method === 'POST') {
      const body = await req.json();
      
      // Validate input
      const validation = ContentSchema.safeParse(body);
      if (!validation.success) {
        return new Response(
          JSON.stringify({ 
            message: 'Validation error', 
            errors: validation.error.errors 
          }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const items = await getData('content');

      // Check for duplicate slug
      const existingSlug = items.find((i: any) => i.slug === data.slug);
      if (existingSlug) {
        return new Response(
          JSON.stringify({ message: 'Slug already exists' }),
          { status: 409, headers }
        );
      }

      const newItem = {
        id: generateId(),
        ...data,
        slug: data.slug || generateSlug(data.title),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      items.push(newItem);
      await setData('content', items);

      return new Response(
        JSON.stringify({ data: newItem }),
        { status: 201, headers }
      );
    }

    // PUT /api/content/:id
    if (req.method === 'PUT' && pathParts.length === 1) {
      const id = pathParts[0];
      const body = await req.json();

      // Validate input
      const validation = UpdateContentSchema.safeParse(body);
      if (!validation.success) {
        return new Response(
          JSON.stringify({ 
            message: 'Validation error', 
            errors: validation.error.errors 
          }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const items = await getData('content');
      const index = items.findIndex((i: any) => i.id === id);

      if (index === -1) {
        return new Response(
          JSON.stringify({ message: 'Content not found' }),
          { status: 404, headers }
        );
      }

      // Check for duplicate slug if slug is being updated
      if (data.slug && data.slug !== items[index].slug) {
        const existingSlug = items.find((i: any) => i.slug === data.slug && i.id !== id);
        if (existingSlug) {
          return new Response(
            JSON.stringify({ message: 'Slug already exists' }),
            { status: 409, headers }
          );
        }
      }

      items[index] = {
        ...items[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      await setData('content', items);

      return new Response(
        JSON.stringify({ data: items[index] }),
        { headers }
      );
    }

    // DELETE /api/content/:id
    if (req.method === 'DELETE' && pathParts.length === 1) {
      const id = pathParts[0];
      const items = await getData('content');
      const item = items.find((i: any) => i.id === id);

      if (!item) {
        return new Response(
          JSON.stringify({ message: 'Content not found' }),
          { status: 404, headers }
        );
      }

      const filtered = items.filter((i: any) => i.id !== id);
      await setData('content', filtered);

      return new Response(
        JSON.stringify({ success: true, message: 'Content deleted' }),
        { headers }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers }
    );
  } catch (e: any) {
    console.error('Content error:', e);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers }
    );
  }
};
