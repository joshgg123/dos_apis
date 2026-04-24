export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    // si no hay query, devolvemos vacío
    if (!q) {
      return Response.json([]);
    }

    const res = await fetch(`https://api.logo.dev/search?q=${q}`, {
      headers: {
        Authorization: `Bearer ${process.env.LOGO_API_KEY}`
      }
    });

    // si la API falla
    if (!res.ok) {
      console.error("Error en Logo.dev:", res.status);
      return Response.json([], { status: 200 }); // no rompas el frontend
    }

    type LogoDevSearchItem = {
      name?: string;
      domain?: string;
      logo_url?: string;
    };

    const data = (await res.json()) as unknown;
    const items = Array.isArray(data) ? (data as LogoDevSearchItem[]) : [];

    const empresas = items
      .filter((e) => Boolean(e?.name) && Boolean(e?.domain))
      .map((e) => ({
        name: e.name as string,
        domain: e.domain as string,
        logo: e.logo_url ?? null,
      }));

    return Response.json(empresas);

  } catch (error) {
    console.error("ERROR API EMPRESAS:", error);

    // nunca devuelvas undefined → siempre algo válido
    return Response.json([], { status: 200 });
  }
}