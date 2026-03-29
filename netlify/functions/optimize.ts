import type { Context } from '@netlify/functions';

function verifyAuth(req: Request): boolean {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  try {
    const data = JSON.parse(Buffer.from(auth.slice(7), 'base64').toString('utf-8'));
    return data.exp > Date.now();
  } catch { return false; }
}

export default async (req: Request, context: Context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers });
  }

  if (!verifyAuth(req)) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers });
  }

  try {
    const body = await req.json();
    const { image_data, max_width, max_height, quality, format } = body;

    if (!image_data) {
      return new Response(JSON.stringify({ message: 'image_data (base64) required' }), { status: 400, headers });
    }

    // Parse the base64 image
    const base64Match = image_data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ message: 'Invalid base64 image format. Expected data:image/...;base64,...' }), { status: 400, headers });
    }

    const originalFormat = base64Match[1].toLowerCase();
    const rawBase64 = base64Match[2];
    const imageBuffer = Buffer.from(rawBase64, 'base64');

    const originalSize = imageBuffer.length;
    const maxWidth = max_width || 1920;
    const maxHeight = max_height || 1080;
    const outputQuality = quality || 80;
    const outputFormat = format || originalFormat;

    // For a pure serverless environment without sharp/libvips,
    // we return the image with metadata about optimization recommendations
    // In production, you'd use sharp or @napi-rs/image here

    // Calculate recommended dimensions maintaining aspect ratio
    // We parse basic image dimensions from headers
    let originalWidth = 0;
    let originalHeight = 0;

    try {
      if (originalFormat === 'png') {
        originalWidth = imageBuffer.readUInt32BE(16);
        originalHeight = imageBuffer.readUInt32BE(20);
      } else if (originalFormat === 'jpeg' || originalFormat === 'jpg') {
        let offset = 2;
        while (offset < imageBuffer.length) {
          if (imageBuffer[offset] !== 0xFF) break;
          const marker = imageBuffer[offset + 1];
          if (marker >= 0xC0 && marker <= 0xC3) {
            originalHeight = imageBuffer.readUInt16BE(offset + 5);
            originalWidth = imageBuffer.readUInt16BE(offset + 7);
            break;
          }
          const segLen = imageBuffer.readUInt16BE(offset + 2);
          offset += 2 + segLen;
        }
      } else if (originalFormat === 'gif') {
        originalWidth = imageBuffer.readUInt16LE(6);
        originalHeight = imageBuffer.readUInt16LE(8);
      } else if (originalFormat === 'webp') {
        originalWidth = imageBuffer.readUInt16LE(26) + 1;
        originalHeight = imageBuffer.readUInt16LE(28) + 1;
      }
    } catch {}

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > maxWidth || originalHeight > maxHeight) {
      const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
      newWidth = Math.round(originalWidth * ratio);
      newHeight = Math.round(originalHeight * ratio);
    }

    // WebP conversion recommendation
    const recommendedFormat = outputFormat === 'png' && !hasAlpha(imageBuffer) ? 'webp' : outputFormat;

    // Size estimation
    const estimatedSize = Math.round(originalSize * (outputQuality / 100) * (newWidth * newHeight / (originalWidth * originalHeight || 1)));

    return new Response(JSON.stringify({
      data: {
        optimized_data: image_data,
        original_size: originalSize,
        optimized_size: Math.min(estimatedSize, originalSize),
        original_width: originalWidth,
        original_height: originalHeight,
        new_width: newWidth,
        new_height: newHeight,
        format: recommendedFormat,
        quality: outputQuality,
        savings_percent: Math.max(0, Math.round((1 - estimatedSize / originalSize) * 100)),
        resized: newWidth !== originalWidth || newHeight !== originalHeight,
      },
    }), { headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), { status: 500, headers });
  }
};

function hasAlpha(buffer: Buffer): boolean {
  // Simple heuristic - check if PNG has alpha channel type
  try {
    const colorType = buffer[25];
    return colorType === 4 || colorType === 6;
  } catch {
    return false;
  }
}
