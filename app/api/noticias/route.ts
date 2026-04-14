export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const empresa = searchParams.get("empresa");

  const res = await fetch(
    `https://newsapi.org/v2/everything?q=${empresa}&apiKey=${process.env.NEWS_API_KEY}`
  );

  const data = await res.json();

  return Response.json(data.articles.slice(0, 5));
}