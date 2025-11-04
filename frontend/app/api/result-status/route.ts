export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const log = searchParams.get('log') || '';
  const resp = await fetch(`http://localhost:5000/api/result_status?log=${encodeURIComponent(log)}`);
  const text = await resp.text();
  if (!resp.ok) return Response.json({ error: 'Failed to fetch status', status: resp.status, bodyPreview: text.slice(0,500) }, { status: resp.status });
  try { const data = JSON.parse(text); return Response.json(data); } catch { return Response.json({ error: 'Invalid JSON', bodyPreview: text.slice(0,500) }, { status: 502 }); }
}
