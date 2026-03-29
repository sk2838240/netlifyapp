import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const store = getStore('cms-data');
const mediaStore = getStore('cms-media');

// Serve actual media files
export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const filename = url.pathname.replace('/api/media/file/', '');

  if (!filename) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const data = await mediaStore.get(filename, { type: 'arrayBuffer' });
    if (!data) return new Response('Not found', { status: 404 });

    // Determine content type from extension
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
      pdf: 'application/pdf', mp4: 'video/mp4', mp3: 'audio/mpeg',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
