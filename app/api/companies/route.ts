import { NextRequest, NextResponse } from "next/server";

type LogoDevCompany = {
  name?: string;
  domain?: string;
};

function getLogoDevSecretKey(): string | null {
  const direct = process.env.LOGO_DEV_SECRET_KEY ?? process.env.LOGO_DEV_SECRET_TOKEN;
  if (direct) return direct;

  const legacy = process.env.LOGO_API_KEY ?? "";
  if (legacy.startsWith("sk_")) return legacy;
  return null;
}

export async function GET(req: NextRequest) {
  const secretKey = getLogoDevSecretKey();
  if (!secretKey) {
    return NextResponse.json(
      {
        error:
          "Missing LOGO_DEV_SECRET_KEY (or LOGO_DEV_SECRET_TOKEN). If you only have LOGO_API_KEY, it must start with 'sk_'.",
      },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ error: "Missing 'q' query param" }, { status: 400 });
  }

  const strategyParam = (searchParams.get("strategy") ?? "suggest").trim();
  // logo.dev currently accepts: suggest | match
  // We also accept legacy "typeahead" and map it to "suggest".
  const strategy =
    strategyParam === "match" ? "match" : strategyParam === "typeahead" ? "suggest" : "suggest";

  const url = new URL("https://api.logo.dev/search");
  url.searchParams.set("q", q);
  url.searchParams.set("strategy", strategy);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${secretKey}` },
    next: { revalidate: 60 * 10 },
  });

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json(
      { error: "logo.dev search failed", status: res.status, details: text },
      { status: 502 },
    );
  }

  let data: LogoDevCompany[] = [];
  try {
    data = JSON.parse(text) as LogoDevCompany[];
  } catch {
    return NextResponse.json({ error: "Invalid logo.dev response" }, { status: 502 });
  }

  const companies = (data ?? [])
    .filter((c) => c?.name && c?.domain)
    .slice(0, 10)
    .map((c) => ({ name: c.name as string, domain: c.domain as string }));

  return NextResponse.json({ query: q, strategy, companies });
}

