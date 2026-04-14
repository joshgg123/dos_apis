export async function searchCompanies(query: string) {
  const res = await fetch(`/api/empresas?q=${query}`);
  return res.json();
}