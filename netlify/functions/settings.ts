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

const SettingsSchema = z.object({
  site_name: z.string().min(1).max(100),
  site_tagline: z.string().max(200).optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  favicon_url: z.string().url().optional().or(z.literal('')),
  footer_text: z.string().max(500).optional(),
  social_links: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
  }).optional(),
  analytics_id: z.string().max(50).optional(),
  custom_css: z.string().max(10000).optional(),
  custom_head: z.string().max(5000).optional(),
  custom_footer: z.string().max(5000).optional(),
});

const UpdateSettingsSchema = SettingsSchema.partial();

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
    // GET /api/settings
    if (req.method === 'GET') {
      const settings = await getData('settings');
      return new Response(JSON.stringify({ data: settings }), { headers });
    }

    // Verify authentication for write operations
    const user = verifyAuth(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    // PUT /api/settings
    if (req.method === 'PUT') {
      const body = await req.json();
      const validation = UpdateSettingsSchema.safeParse(body);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const currentSettings = await getData('settings');
      const updatedSettings = { ...currentSettings, ...data };
      
      await setData('settings', updatedSettings);

      return new Response(JSON.stringify({ data: updatedSettings }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    console.error('Settings error:', e);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers });
  }
};
