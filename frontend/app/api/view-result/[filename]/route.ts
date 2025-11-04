export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function fetchText(url: string) {
  const r = await fetch(url);
  const t = await r.text();
  return { ok: r.ok, status: r.status, text: t };
}

function slug(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase();
}

export async function GET(_: Request, ctx: { params: Promise<{ filename: string }> | { filename: string } }) {
  // Next 16: params can be a Promise; unwrap if needed
  const p: any = (typeof (ctx as any).params?.then === 'function') ? await (ctx as any).params : (ctx as any).params;
  const name = p.filename as string;
  // 1) direct (query-string variant to avoid encoding issues)
  let res = await fetchText(`http://localhost:5000/api/view_result?hint=${encodeURIComponent(name)}`);
  if (!res.ok) {
    // 2) resolve
    const rr = await fetch(`http://localhost:5000/api/resolve_result_file?hint=${encodeURIComponent(name)}`);
    if (rr.ok) {
      const j = await rr.json();
      const match = j?.match as string | undefined;
      if (match) {
        res = await fetchText(`http://localhost:5000/api/view_result?hint=${encodeURIComponent(match)}`);
        if (res.ok) {
          try { const data = JSON.parse(res.text); return Response.json({ __resolved: match, data }); } catch { return Response.json({ error: 'Invalid JSON from backend', bodyPreview: res.text.slice(0,500), __resolved: match }, { status: 502 }); }
        }
      }
    }
    // 3) last resort: list results and pick best slug match
    const list = await fetchText('http://localhost:5000/api/results');
    if (list.ok) {
      try {
        const arr = JSON.parse(list.text) as Array<{ filename: string }>;
        const sName = slug(name);
        let best: string | undefined;
        for (const it of arr) {
          const sFile = slug(it.filename);
          if (sFile === sName || sFile.endsWith(sName) || sName.endsWith(sFile)) {
            best = it.filename; break;
          }
        }
        if (best) {
          const r2 = await fetchText(`http://localhost:5000/api/view_result?hint=${encodeURIComponent(best)}`);
          if (r2.ok) {
            const data = JSON.parse(r2.text);
            return Response.json({ __resolved: best, data });
          }
        }
      } catch {}
    }
  } else {
    try { const data = JSON.parse(res.text); return Response.json(data); } catch { return Response.json({ error: 'Invalid JSON from backend', bodyPreview: res.text.slice(0,500) }, { status: 502 }); }
  }

  return Response.json({ error: 'Failed to fetch result', status: res.status, bodyPreview: res.text.slice(0,500) }, { status: res.status });
}
