export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const BASE = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:8008';
  const resp = await fetch(`${BASE}/api/history`);
  const text = await resp.text();
  if (!resp.ok) return Response.json({ error: 'Failed to fetch history', status: resp.status, bodyPreview: text.slice(0,500) }, { status: resp.status });
  try { const data = JSON.parse(text); return Response.json(data); } catch { return Response.json({ error: 'Invalid JSON', bodyPreview: text.slice(0,500) }, { status: 502 }); }
}
