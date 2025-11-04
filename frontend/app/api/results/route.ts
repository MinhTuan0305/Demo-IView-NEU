export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const resp = await fetch('http://localhost:5000/api/results');
  const text = await resp.text();
  if (!resp.ok) {
    return Response.json({ error: 'Failed to fetch results', status: resp.status, bodyPreview: text.slice(0, 500) }, { status: resp.status });
  }
  try {
    const data = JSON.parse(text);
    return Response.json(data);
  } catch {
    return Response.json({ error: 'Invalid JSON from backend', bodyPreview: text.slice(0, 500) }, { status: 502 });
  }
}
