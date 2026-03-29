import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const store = getStore('cms-data');
const ADMIN_EMAIL = 'admin@cms.local';
const ADMIN_PASSWORD = 'admin123';
const JWT_SECRET = 'cms-secret-key-change-in-production';

function generateToken(payload: any): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  return Buffer.from(data).toString('base64');
}

function verifyToken(token: string): any {
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
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
    const body = req.method !== 'GET' ? await req.json().catch(() => ({})) : {};
    const { action, email, password, token } = body;

    if (req.method === 'POST') {
      if (action === 'login') {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          const t = generateToken({ id: '1', email, name: 'Admin', role: 'admin' });
          return new Response(JSON.stringify({ token: t, user: { id: '1', email, name: 'Admin', role: 'admin' } }), { headers });
        }
        return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401, headers });
      }

      if (action === 'verify') {
        const user = verifyToken(token);
        if (user) return new Response(JSON.stringify({ valid: true, user }), { headers });
        return new Response(JSON.stringify({ valid: false }), { status: 401, headers });
      }
    }

    return new Response(JSON.stringify({ message: 'Invalid request' }), { status: 400, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500, headers });
  }
};
