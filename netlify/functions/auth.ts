import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Environment variables with fallbacks for development
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cms.local';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
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

// Generate JWT token
function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Verify JWT token
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export default async (req: Request, context: Context) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const body = req.method !== 'GET' ? await req.json().catch(() => ({})) : {};
    const { action, email, password, token } = body;

    // Login action
    if (req.method === 'POST' && action === 'login') {
      // Validate input
      if (!email || !password) {
        return new Response(
          JSON.stringify({ message: 'Email and password are required' }),
          { status: 400, headers }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ message: 'Invalid email format' }),
          { status: 400, headers }
        );
      }

      // Check credentials
      if (email !== ADMIN_EMAIL) {
        return new Response(
          JSON.stringify({ message: 'Invalid credentials' }),
          { status: 401, headers }
        );
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, ADMIN_PASSWORD_HASH);
      if (!isValidPassword) {
        return new Response(
          JSON.stringify({ message: 'Invalid credentials' }),
          { status: 401, headers }
        );
      }

      // Generate token
      const user = { id: '1', email, name: 'Admin', role: 'admin' };
      const t = generateToken(user);

      return new Response(
        JSON.stringify({ token: t, user }),
        { status: 200, headers }
      );
    }

    // Verify token action
    if (req.method === 'POST' && action === 'verify') {
      if (!token) {
        return new Response(
          JSON.stringify({ valid: false, message: 'Token is required' }),
          { status: 400, headers }
        );
      }

      const user = verifyToken(token);
      if (user) {
        return new Response(
          JSON.stringify({ valid: true, user }),
          { status: 200, headers }
        );
      }

      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid or expired token' }),
        { status: 401, headers }
      );
    }

    // Invalid request
    return new Response(
      JSON.stringify({ message: 'Invalid request' }),
      { status: 400, headers }
    );
  } catch (e: any) {
    console.error('Auth error:', e);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers }
    );
  }
};
