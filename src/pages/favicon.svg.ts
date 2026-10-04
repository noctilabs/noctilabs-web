import type { APIRoute } from 'astro';
import { markSvg } from '../lib/mark';

export const GET: APIRoute = () =>
  new Response(markSvg('#0B0B0C', '#0047FF'), { headers: { 'Content-Type': 'image/svg+xml' } });
