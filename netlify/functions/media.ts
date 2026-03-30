import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const store = getStore('cms-data');
const mediaStore = getStore('cms-media');
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production-min-32-chars';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

const MediaUpdateSchema = z.object({
  alt_text: z.string().max(500).optional(),
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

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.replace('/api/media', '').replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  try {
    // GET /api/media - list all media
    if (req.method === 'GET' && pathParts.length === 0) {
      const media = await getData('media');
      return new Response(JSON.stringify({ data: media }), { headers });
    }

    // GET /api/media/:id - get single media item
    if (req.method === 'GET' && pathParts.length === 1) {
      const media = await getData('media');
      const item = media.find((m: any) => m.id === pathParts[0]);
      if (!item) {
        return new Response(JSON.stringify({ message: 'Media not found' }), { status: 404, headers });
      }
      return new Response(JSON.stringify({ data: item }), { headers });
    }

    // Verify authentication for write operations
    const user = verifyAuth(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    // POST /api/media/upload - upload file
    if (req.method === 'POST' && pathParts[0] === 'upload') {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const altText = formData.get('alt_text') as string || '';
        
        if (!file) {
          return new Response(JSON.stringify({ message: 'No file provided' }), { status: 400, headers });
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          return new Response(JSON.stringify({ message: 'File size exceeds 10MB limit' }), { status: 400, headers });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf', 'video/mp4', 'audio/mpeg'];
        if (!allowedTypes.includes(file.type)) {
          return new Response(JSON.stringify({ message: 'File type not allowed' }), { status: 400, headers });
        }

        const buffer = await file.arrayBuffer();
        const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
        const filename = `${Date.now()}-${generateSlug(file.name.replace(/\.[^.]+$/, ''))}.${ext}`;
        const id = generateId();

        // Store the file in media blob store
        await mediaStore.set(filename, buffer as ArrayBuffer);

        const mediaItem = {
          id,
          filename,
          original_name: file.name,
          url: `/api/media/file/${filename}`,
          alt_text: altText,
          mime_type: file.type,
          size: buffer.byteLength,
          created_at: new Date().toISOString(),
        };

        const media = await getData('media');
        media.push(mediaItem);
        await setData('media', media);

        return new Response(JSON.stringify({ data: mediaItem }), { status: 201, headers });
      }

      // JSON body with base64 data
      const body = await req.json();
      const { data: base64Data, filename, mime_type, alt_text } = body;

      if (!base64Data || !filename) {
        return new Response(JSON.stringify({ message: 'Data and filename required' }), { status: 400, headers });
      }

      // Validate file size (max 10MB)
      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.byteLength > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({ message: 'File size exceeds 10MB limit' }), { status: 400, headers });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf', 'video/mp4', 'audio/mpeg'];
      if (mime_type && !allowedTypes.includes(mime_type)) {
        return new Response(JSON.stringify({ message: 'File type not allowed' }), { status: 400, headers });
      }

      const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
      const storageName = `${Date.now()}-${generateSlug(filename.replace(/\.[^.]+$/, ''))}.${ext}`;
      const id = generateId();

      await mediaStore.set(storageName, buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer);

      const mediaItem = {
        id,
        filename: storageName,
        original_name: filename,
        url: `/api/media/file/${storageName}`,
        alt_text: alt_text || '',
        mime_type: mime_type || 'application/octet-stream',
        size: buffer.byteLength,
        created_at: new Date().toISOString(),
      };

      const media = await getData('media');
      media.push(mediaItem);
      await setData('media', media);

      return new Response(JSON.stringify({ data: mediaItem }), { status: 201, headers });
    }

    // DELETE /api/media/:id
    if (req.method === 'DELETE' && pathParts.length === 1) {
      const id = pathParts[0];
      const media = await getData('media');
      const item = media.find((m: any) => m.id === id);

      if (!item) {
        return new Response(JSON.stringify({ message: 'Media not found' }), { status: 404, headers });
      }

      // Delete from blob store
      try { await mediaStore.delete(item.filename); } catch {}

      const filtered = media.filter((m: any) => m.id !== id);
      await setData('media', filtered);

      return new Response(JSON.stringify({ success: true, message: 'Media deleted' }), { headers });
    }

    // PUT /api/media/:id - update metadata
    if (req.method === 'PUT' && pathParts.length === 1) {
      const id = pathParts[0];
      const body = await req.json();
      const validation = MediaUpdateSchema.safeParse(body);

      if (!validation.success) {
        return new Response(
          JSON.stringify({ message: 'Validation error', errors: validation.error.errors }),
          { status: 400, headers }
        );
      }

      const data = validation.data;
      const media = await getData('media');
      const index = media.findIndex((m: any) => m.id === id);

      if (index === -1) {
        return new Response(JSON.stringify({ message: 'Media not found' }), { status: 404, headers });
      }

      media[index] = { ...media[index], ...data };
      await setData('media', media);

      return new Response(JSON.stringify({ data: media[index] }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    console.error('Media error:', e);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers });
  }
};
