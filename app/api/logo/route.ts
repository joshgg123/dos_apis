import { NextRequest, NextResponse } from "next/server";

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

export function GET(req: NextRequest) {
  const token = getLogoDevPublishableToken();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Missing logo.dev publishable token. Set LOGO_DEV_TOKEN (publishable) or LOGO_DEV_PUBLISHABLE_KEY. If you only have LOGO_API_KEY, it must NOT start with 'sk_'.",
      },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const domainParam = searchParams.get("domain") ?? "";
  const nameParam = searchParams.get("name") ?? "";
  const domain = guessDomain(domainParam || nameParam);

  if (!domain) {
    return NextResponse.json(
      { error: "Missing 'domain' (or 'name') query param" },
      { status: 400 },
    );
  }

  const url = `https://img.logo.dev/${encodeURIComponent(domain)}?token=${encodeURIComponent(
    token,
  )}`;

  return NextResponse.redirect(url, { status: 307 });
}
