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

const StylesSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  heading_font: z.string().max(100),
  body_font: z.string().max(100),
  heading_size_h1: z.string().max(20),
  heading_size_h2: z.string().max(20),
  heading_size_h3: z.string().max(20),
  paragraph_size: z.string().max(20),
  paragraph_line_height: z.string().max(20),
  faq_heading_size: z.string().max(20),
  faq_content_size: z.string().max(20),
  link_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  link_hover_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  button_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  button_text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  border_radius: z.string().max(20),
  card_shadow: z.string().max(100),
  header_background: z.string().max(100),
  header_text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  footer_background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  footer_text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
});

const UpdateStylesSchema = StylesSchema.partial();

function verifyAuth(req: Request): any {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

async function getData(key: string): Promise<any> {
  const data = await store.get(key, { type: 'json' });
  return data || {};
}

async function setData(key: string, data: any) {
  await store.set(key, JSON.stringify(data));
}

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    // GET /api/styles
    if (req.method === 'GET') {
      const styles = await getData('styles');
      return new Response(JSON.stringify({ data: styles }), { headers });
    }

    // Verify authentication for write operations
    const user = verifyAuth(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    // PUT /api/styles
    if (req.method === 'PUT') {
      const body = await req.json();
      const validation = UpdateStylesSchema.safeParse(body);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const currentStyles = await getData('styles');
      const updatedStyles = { ...currentStyles, ...data };
      
      await setData('styles', updatedStyles);

      return new Response(JSON.stringify({ data: updatedStyles }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    console.error('Styles error:', e);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers });
  }
};
