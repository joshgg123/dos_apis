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

    const data = await res.json();
    console.log("DATA API EMPRESAS:", data);
    // 👇 CLAVE: usar data.results
    const empresas = (data || []).map((e: any) => ({
      name: e.name,
      domain: e.domain,
      logo: e.logo_url
    }));

    return Response.json(empresas);

  } catch (error) {
    console.error("ERROR API EMPRESAS:", error);

    // nunca devuelvas undefined → siempre algo válido
    return Response.json([], { status: 200 });
  }
}