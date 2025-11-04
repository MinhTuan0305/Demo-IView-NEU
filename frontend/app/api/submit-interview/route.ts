export async function POST(request: Request) {
  const body = await request.text();
  const resp = await fetch('http://localhost:5000/submit_interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!resp.ok) {
    const msg = await resp.text();
    return Response.json({ error: msg || 'Failed to submit' }, { status: resp.status });
    }
  const data = await resp.json();
  return Response.json(data);
}
