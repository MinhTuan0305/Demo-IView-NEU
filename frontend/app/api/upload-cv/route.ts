// Next.js API route to proxy requests to Flask backend
// Avoids CORS, captures Flask redirect, and provides useful error info

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const inForm = await request.formData();
    const outForm = new FormData();
    for (const [k, v] of inForm.entries()) outForm.append(k, v as any);

    const resp = await fetch('http://localhost:5000/api/upload_cv', {
      method: 'POST',
      body: outForm,
    });

    const text = await resp.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!resp.ok) {
      return Response.json({ error: 'Upload failed', status: resp.status, bodyPreview: text.slice(0, 500), json }, { status: resp.status });
    }

    return Response.json(json);
  } catch (err) {
    return Response.json({ error: 'Proxy error', message: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

