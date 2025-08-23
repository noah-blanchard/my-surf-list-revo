// app/api/ksf-records/[steam64]/route.ts
import { steam64ToSteam2, isSteam64 } from "@/utils/steam";

// Force exécution Node (pas Edge) + pas de cache
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ---------------------------------- Types --------------------------------- */

// Structure brute telle qu'on l'attend dans la page KSF (valeurs parfois string)
type KsfRawRecord = {
  mapName: string;
  isLinear?: boolean;
  tier?: number | string;
  cp_count?: number | string;
  b_count?: number | string;
  time?: number | string;
  wrDiff?: number | string;
  count?: number | string;
  date?: number | string;   // epoch (s ou ms)
  points?: number | string;
  rank?: string | number;
};

// Après normalisation: numérisation + date ISO optionnelle
export type KsfRecord = {
  mapName: string;
  isLinear?: boolean;
  tier?: number;
  cp_count?: number;
  b_count?: number;
  time?: number;
  wrDiff?: number;
  count?: number;
  date?: number;
  points?: number;
  rank?: string;
  date_iso_utc?: string;
};

type ApiSuccess = {
  ok: true;
  source: string;
  count: number;
  records: KsfRecord[];
};
type ApiError = { ok: false; error: string };

/* ------------------------------- Type guards ------------------------------ */

function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function isBool(v: unknown): v is boolean {
  return typeof v === "boolean";
}
function isStringOrNumber(v: unknown): v is string | number {
  return isString(v) || isNumber(v);
}

// Garde souple: on exige mapName string ; le reste est optionnel/typé large
function isKsfRawRecord(v: unknown): v is KsfRawRecord {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (!isString(r.mapName)) return false;

  // Champs facultatifs si présents → contrôles de type
  if ("isLinear" in r && !isBool(r.isLinear)) return false;
  const numericLikeKeys = [
    "tier",
    "cp_count",
    "b_count",
    "time",
    "wrDiff",
    "count",
    "date",
    "points",
  ] as const;
  for (const k of numericLikeKeys) {
    if (k in r && !isStringOrNumber(r[k])) return false;
  }
  if ("rank" in r && !(isString(r.rank) || isNumber(r.rank))) return false;

  return true;
}

/* ----------------------------- Parsing helpers ---------------------------- */

function findUnescapedQuoteLeft(s: string, idx: number): number | null {
  for (let i = idx; i >= 0; i--) {
    if (s[i] === '"') {
      let j = i - 1,
        bs = 0;
      while (j >= 0 && s[j] === "\\") {
        bs++;
        j--;
      }
      if (bs % 2 === 0) return i;
    }
  }
  return null;
}
function findUnescapedQuoteRight(s: string, start: number): number | null {
  for (let i = start + 1; i < s.length; i++) {
    if (s[i] === '"') {
      let j = i - 1,
        bs = 0;
      while (j >= 0 && s[j] === "\\") {
        bs++;
        j--;
      }
      if (bs % 2 === 0) return i;
    }
  }
  return null;
}
function extractBalancedArray(str: string, startIdx: number): string | null {
  if (str[startIdx] !== "[") return null;
  let i = startIdx,
    depth = 0,
    inStr = false,
    esc = false;
  const start = i;
  while (i < str.length) {
    const ch = str[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else {
      if (ch === '"') inStr = true;
      else if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) return str.slice(start, i + 1);
      }
    }
    i++;
  }
  return null;
}

// Retourne les tableaux "data":[ ... ] trouvés, typés en KsfRawRecord[] après filtrage
function extractArraysFromHtml(html: string): KsfRawRecord[][] {
  const arrays: KsfRawRecord[][] = [];

  // A) "data":[ ... ] non échappé
  {
    const re = /"data"\s*:\s*\[/g;
    for (let m = re.exec(html); m; m = re.exec(html)) {
      const arrText = extractBalancedArray(html, m.index + m[0].lastIndexOf("["));
      if (!arrText) continue;
      try {
        const parsed = JSON.parse(arrText) as unknown;
        if (Array.isArray(parsed)) {
          const items = parsed.filter(isKsfRawRecord);
          if (items.length) arrays.push(items);
        }
      } catch {
        /* ignore */
      }
    }
  }

  // B) \\"data\\":[ ... ] dans une string JS (Next.js)
  {
    const reEsc = /\\"data\\":\s*\[/g;
    for (let m = reEsc.exec(html); m; m = reEsc.exec(html)) {
      const leftQ = findUnescapedQuoteLeft(html, m.index);
      if (leftQ == null) continue;
      const rightQ = findUnescapedQuoteRight(html, leftQ);
      if (rightQ == null) continue;

      const jsLiteral = html.slice(leftQ, rightQ + 1); // " ... "
      let inner: string;
      try {
        inner = JSON.parse(jsLiteral) as string; // dés-échappe la string
      } catch {
        continue;
      }

      const m2 = /"data"\s*:\s*\[/.exec(inner);
      if (!m2) continue;

      const arrText = extractBalancedArray(
        inner,
        m2.index + m2[0].lastIndexOf("[")
      );
      if (!arrText) continue;

      try {
        const parsed = JSON.parse(arrText) as unknown;
        if (Array.isArray(parsed)) {
          const items = parsed.filter(isKsfRawRecord);
          if (items.length) arrays.push(items);
        }
      } catch {
        /* ignore */
      }
    }
  }

  return arrays;
}

/* ----------------------------- Normalization ------------------------------ */

function toInt(v: string | number | undefined): number | undefined {
  if (v === undefined) return undefined;
  if (isNumber(v)) return v;
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? undefined : n;
}
function toFloat(v: string | number | undefined): number | undefined {
  if (v === undefined) return undefined;
  if (isNumber(v)) return v;
  const n = Number.parseFloat(v);
  return Number.isNaN(n) ? undefined : n;
}

function normalize(rec: KsfRawRecord): KsfRecord {
  const tier = toInt(rec.tier);
  const cp_count = toInt(rec.cp_count);
  const b_count = toInt(rec.b_count);
  const time = toFloat(rec.time);
  const wrDiff = toFloat(rec.wrDiff);
  const count = toInt(rec.count);
  const points = toFloat(rec.points);
  const dateNum = rec.date !== undefined ? Number(rec.date) : undefined;
  const date =
    dateNum !== undefined && !Number.isNaN(dateNum)
      ? dateNum > 1e12
        ? Math.round(dateNum / 1000)
        : dateNum
      : undefined;

  const out: KsfRecord = {
    mapName: rec.mapName,
    isLinear: rec.isLinear,
    tier,
    cp_count,
    b_count,
    time,
    wrDiff,
    count,
    date,
    points,
    rank: rec.rank != null ? String(rec.rank) : undefined,
  };

  if (date !== undefined) {
    out.date_iso_utc = new Date(date * 1000).toISOString();
  }

  return out;
}

/* --------------------------------- Fetch ---------------------------------- */

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; KSF-Parser/1.0)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return res.text();
}

/* --------------------------------- Route ---------------------------------- */

export async function GET(
  req: Request,
  ctx: { params: Promise<{ steam64: string }> }
): Promise<Response> {
  try {
    const { steam64 } = await ctx.params;
    if (!isSteam64(steam64)) {
      const body: ApiError = { ok: false, error: "Invalid steam64" };
      return new Response(JSON.stringify(body), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Query params optionnels : ?game=css&mode=0
    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game") ?? "css";
    const mode = searchParams.get("mode") ?? "0";

    // IMPORTANT : KSF attend STEAM_0:... (universe 0)
    const steam2 = steam64ToSteam2(steam64, 0);
    const ksfUrl = `https://ksf.surf/players/${encodeURIComponent(
      steam2
    )}/records?game=${encodeURIComponent(game)}&mode=${encodeURIComponent(mode)}`;

    const html = await fetchHtml(ksfUrl);
    const arrays = extractArraysFromHtml(html); // KsfRawRecord[][]
    const merged: KsfRawRecord[] = arrays.flat();

    const normalized = merged.map(normalize).sort((a, b) => {
      const an = a.mapName;
      const bn = b.mapName;
      if (an < bn) return -1;
      if (an > bn) return 1;
      const ad = a.date ?? 0;
      const bd = b.date ?? 0;
      return ad - bd;
    });

    const body: ApiSuccess = {
      ok: true,
      source: ksfUrl,
      count: normalized.length,
      records: normalized,
    };
    return new Response(JSON.stringify(body), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Unknown error";
    const body: ApiError = { ok: false, error: msg };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
