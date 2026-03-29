import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const store = getStore('cms-data');

function verifyAuth(req: Request): boolean {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  try {
    const data = JSON.parse(Buffer.from(auth.slice(7), 'base64').toString('utf-8'));
    return data.exp > Date.now();
  } catch { return false; }
}

async function getData(key: string): Promise<any[]> {
  const data = await store.get(key, { type: 'json' });
  return data || [];
}

async function setData(key: string, data: any[]) {
  await store.set(key, JSON.stringify(data));
}

// Check and publish scheduled content
async function processScheduledContent() {
  const content = await getData('content');
  const now = new Date().toISOString();
  let changed = false;

  for (let i = 0; i < content.length; i++) {
    if (
      content[i].status === 'scheduled' &&
      content[i].scheduled_at &&
      content[i].scheduled_at <= now
    ) {
      content[i].status = 'published';
      content[i].updated_at = now;
      changed = true;
    }
  }

  if (changed) {
    await setData('content', content);
  }

  return content.filter((c: any) => c.status === 'scheduled');
}

export default async (req: Request, context: Context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  try {
    // GET - list scheduled content + process any that are due
    if (req.method === 'GET') {
      const scheduled = await processScheduledContent();
      return new Response(JSON.stringify({ data: scheduled, processed: true }), { headers });
    }

    if (!verifyAuth(req)) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
    }

    // POST - schedule content
    if (req.method === 'POST') {
      const body = await req.json();
      const { content_id, scheduled_at } = body;

      if (!content_id || !scheduled_at) {
        return new Response(JSON.stringify({ message: 'content_id and scheduled_at required' }), { status: 400, headers });
      }

      const content = await getData('content');
      const index = content.findIndex((c: any) => c.id === content_id);
      if (index === -1) return new Response(JSON.stringify({ message: 'Content not found' }), { status: 404, headers });

      content[index] = {
        ...content[index],
        status: 'scheduled',
        scheduled_at,
        updated_at: new Date().toISOString(),
      };
      await setData('content', content);

      return new Response(JSON.stringify({ data: content[index] }), { headers });
    }

    // PUT - reschedule
    if (req.method === 'PUT') {
      const body = await req.json();
      const { content_id, scheduled_at } = body;

      const content = await getData('content');
      const index = content.findIndex((c: any) => c.id === content_id);
      if (index === -1) return new Response(JSON.stringify({ message: 'Content not found' }), { status: 404, headers });

      content[index] = { ...content[index], scheduled_at, updated_at: new Date().toISOString() };
      await setData('content', content);

      return new Response(JSON.stringify({ data: content[index] }), { headers });
    }

    // DELETE - unschedule (back to draft)
    if (req.method === 'DELETE') {
      const body = await req.json();
      const { content_id } = body;

      const content = await getData('content');
      const index = content.findIndex((c: any) => c.id === content_id);
      if (index === -1) return new Response(JSON.stringify({ message: 'Content not found' }), { status: 404, headers });

      content[index] = {
        ...content[index],
        status: 'draft',
        scheduled_at: null,
        updated_at: new Date().toISOString(),
      };
      await setData('content', content);

      return new Response(JSON.stringify({ data: content[index] }), { headers });
    }

    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500, headers });
  }
};
