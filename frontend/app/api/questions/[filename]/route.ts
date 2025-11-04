import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ filename: string }> | { filename: string } }) {
  const p = (ctx.params as any);
  const { filename } = typeof p.then === 'function' ? await (p as Promise<{ filename: string }>) : (p as { filename: string });
  try {
    const fetchJson = async (url: string) => {
      const r = await fetch(url);
      const t = await r.text();
      return { ok: r.ok, status: r.status, text: t };
    };

    // 1) Try resolve name first
    let resolved: string | undefined;
    const res1 = await fetch(`http://localhost:5000/api/resolve_questions_file?hint=${encodeURIComponent(filename)}`);
    if (res1.ok) {
      const j = await res1.json();
      if (j?.match) resolved = j.match as string;
    }
    const nameToTry = resolved || filename;

    // 2) Fetch with resolved name
    let result = await fetchJson(`http://localhost:5000/api/questions/${encodeURIComponent(nameToTry)}`);
    if (!result.ok) {
      // 3) Fallback: ask latest file and try it
      const res2 = await fetch(`http://localhost:5000/api/latest_questions_file`);
      if (res2.ok) {
        const j2 = await res2.json();
        const latest = j2?.match as string | undefined;
        if (latest) {
          result = await fetchJson(`http://localhost:5000/api/questions/${encodeURIComponent(latest)}`);
          if (result.ok) {
            try {
              const data = JSON.parse(result.text);
              return Response.json({ __resolved: latest, data });
            } catch {
              return Response.json({ error: 'Invalid JSON from backend', bodyPreview: result.text.slice(0, 500), __resolved: latest }, { status: 502 });
            }
          }
        }
      }
    } else {
      try {
        const data = JSON.parse(result.text);
        return Response.json(resolved ? { __resolved: nameToTry, data } : data);
      } catch {
        return Response.json({ error: 'Invalid JSON from backend', bodyPreview: result.text.slice(0, 500), __resolved: nameToTry }, { status: 502 });
      }
    }

    return Response.json({ error: 'Failed to fetch questions', status: result.status, bodyPreview: result.text.slice(0, 500) }, { status: result.status });
  } catch (err) {
    return Response.json({ error: 'Proxy error', message: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

