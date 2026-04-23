import { NextRequest, NextResponse } from "next/server";

type NewsApiArticle = {
  source?: { id?: string | null; name?: string };
  author?: string | null;
  title?: string;
  description?: string | null;
  url?: string;
  urlToImage?: string | null;
  publishedAt?: string;
  content?: string | null;
};

function guessDomain(inputRaw: string): string {
  const input = inputRaw.trim().toLowerCase();
  if (!input) return "";

  const withoutProtocol = input.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0] ?? "";
  const withoutWww = withoutPath.replace(/^www\./, "");

  if (withoutWww.includes(".")) return withoutWww;
  return `${withoutWww}.com`;
}

function getLogoDevPublishableToken(): string | null {
  const direct =
    process.env.LOGO_DEV_PUBLISHABLE_KEY ??
    process.env.LOGO_DEV_PUBLISHABLE_TOKEN ??
    process.env.LOGO_DEV_TOKEN;
  if (direct) return direct;

  const legacy = process.env.LOGO_API_KEY ?? "";
  if (legacy && !legacy.startsWith("sk_")) return legacy;
  return null;
}

function logoFallbackDataUrl(seed: string): string {
  const letter = (seed.trim()[0] ?? "?").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a8d46f" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#7fb843" stop-opacity="0.10"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="95" height="95" rx="18" fill="url(#g)" stroke="rgba(255,255,255,0.10)"/>
  <text x="48" y="56" text-anchor="middle" font-size="40" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="rgba(255,255,255,0.75)">${letter}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function verifyLogoExists(url: string): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      // Logos change rarely; keep load low.
      next: { revalidate: 60 * 60 * 24 },
    });
    // Some image CDNs may return 405 for HEAD; treat as "unknown", not hard-fail.
    if (res.status === 405) return true;
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing NEWS_API_KEY" }, { status: 500 });
  }

  const logoPublishable = getLogoDevPublishableToken();

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ error: "Missing 'q' query param" }, { status: 400 });
  }

  const domainGuess = guessDomain(q);
  const logoExternalUrl = logoPublishable
    ? `https://img.logo.dev/${encodeURIComponent(domainGuess)}?token=${encodeURIComponent(
        logoPublishable,
      )}`
    : null;

  const newsUrl = new URL("https://newsapi.org/v2/everything");
  // Prefer matches in the title to reduce unrelated results.
  newsUrl.searchParams.set("qInTitle", q);
  newsUrl.searchParams.set("sortBy", "publishedAt");
  // Ask for more and we’ll post-filter + sort + take latest 5.
  newsUrl.searchParams.set("pageSize", "30");
  newsUrl.searchParams.set("language", "es");

  const [newsRes, logoVerified] = await Promise.all([
    fetch(newsUrl.toString(), {
      headers: { "X-Api-Key": apiKey },
      // Keep it fresh for a prototype while still avoiding hammering
      next: { revalidate: 60 },
    }),
    logoExternalUrl ? verifyLogoExists(logoExternalUrl) : Promise.resolve(false),
  ]);

  const newsText = await newsRes.text();
  if (!newsRes.ok) {
    return NextResponse.json(
      { error: "NewsAPI request failed", status: newsRes.status, details: newsText },
      { status: 502 },
    );
  }

  let newsData: { articles?: NewsApiArticle[] } = {};
  try {
    newsData = JSON.parse(newsText) as { articles?: NewsApiArticle[] };
  } catch {
    return NextResponse.json({ error: "Invalid NewsAPI response" }, { status: 502 });
  }

  const logoUrl =
    logoVerified && logoPublishable
      ? `/api/logo?domain=${encodeURIComponent(domainGuess)}`
      : logoFallbackDataUrl(domainGuess);

  const articles = (newsData.articles ?? [])
    .filter((a) => a?.title && a?.url)
    .map((a) => ({
      title: a.title as string,
      url: a.url as string,
      source: a.source?.name ?? null,
      description: a.description ?? null,
      imageUrl: a.urlToImage ?? null,
      publishedAt: a.publishedAt ?? null,
      author: a.author ?? null,
    }))
    .sort((a, b) => {
      const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return tb - ta;
    })
    .slice(0, 5);

  return NextResponse.json({
    query: q,
    domainGuess,
    logoUrl,
    logoVerified,
    articles,
  });
}

