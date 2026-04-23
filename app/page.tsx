"use client";
import { useMemo, useRef, useState, KeyboardEvent } from "react";

const SUGGESTIONS = ["Apple", "Tesla", "Nvidia", "Mercado Libre", "OpenAI"];

const STEPS = [
  {
    num: "01",
    title: "Ingresás la empresa",
    desc: "Cualquier empresa pública o de interés. Solo el nombre.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a8d46f"
        strokeWidth={1.5}
        opacity={0.55}
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Buscamos en tiempo real",
    desc: "Consultamos logo.dev y NewsAPI simultáneamente.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a8d46f"
        strokeWidth={1.5}
        opacity={0.55}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v9l4 4" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Ves las noticias",
    desc: "Logo verificado + artículos recientes de todo el mundo.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a8d46f"
        strokeWidth={1.5}
        opacity={0.55}
      >
        <path d="M4 6h16M4 12h10M4 18h7" />
      </svg>
    ),
  },
];

const TICKER_COMPANIES = [
  "Apple",
  "Tesla",
  "Nvidia",
  "Amazon",
  "Meta",
  "Google",
  "Microsoft",
  "Netflix",
  "Spotify",
  "Mercado Libre",
  "OpenAI",
  "Samsung",
  "TSMC",
  "Airbnb",
  "Uber",
  "Shopify",
  "Palantir",
  "Adobe",
  "Salesforce",
  "Intel",
];

type CompanySuggestion = { name: string; domain: string };
type CompaniesResponse = { query: string; strategy: string; companies: CompanySuggestion[] };

type SearchArticle = {
  title: string;
  url: string;
  source: string | null;
  description: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  author: string | null;
};

type SearchResponse = {
  query: string;
  domainGuess: string;
  logoUrl: string;
  logoVerified?: boolean;
  articles: SearchArticle[];
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function LandingPage() {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [companyItems, setCompanyItems] = useState<CompanySuggestion[]>([]);
  const [companyLoading, setCompanyLoading] = useState<boolean>(false);
  const companiesAbortRef = useRef<AbortController | null>(null);
  const companiesTimerRef = useRef<number | null>(null);

  const canSearch = useMemo(() => query.trim().length > 0, [query]);
  const autocompleteItems = useMemo(() => companyItems.slice(0, 8), [companyItems]);

  const runSearch = async (qRaw: string): Promise<void> => {
    const q = qRaw.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const text = await res.text();
      if (!res.ok) {
        setResult(null);
        setError(
          `No pudimos buscar noticias ahora (${res.status}).${
            text ? ` Detalle: ${text}` : ""
          }`,
        );
        return;
      }

      const data = JSON.parse(text) as SearchResponse;
      setResult(data);
      setQuery(data.query);
      setShowAutocomplete(false);
    } catch (e) {
      setResult(null);
      setError(
        e instanceof Error
          ? `Error de red: ${e.message}`
          : "Error de red inesperado",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") runSearch(query);
  };

  const fillAndSearch = (name: string): void => {
    setQuery(name);
    void runSearch(name);
  };

  const scheduleCompaniesFetch = (qRaw: string): void => {
    const q = qRaw.trim();
    if (companiesTimerRef.current) window.clearTimeout(companiesTimerRef.current);
    if (!q) {
      companiesAbortRef.current?.abort();
      companiesAbortRef.current = null;
      setCompanyItems([]);
      setCompanyLoading(false);
      return;
    }

    companiesTimerRef.current = window.setTimeout(async () => {
      companiesAbortRef.current?.abort();
      const ctrl = new AbortController();
      companiesAbortRef.current = ctrl;
      setCompanyLoading(true);
      try {
        const res = await fetch(`/api/companies?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const text = await res.text();
        if (!res.ok) {
          setCompanyItems([]);
          return;
        }
        const data = JSON.parse(text) as CompaniesResponse;
        setCompanyItems(Array.isArray(data.companies) ? data.companies : []);
      } catch {
        // ignore aborts / network
      } finally {
        setCompanyLoading(false);
      }
    }, 220);
  };

  return (
    <div className="min-h-screen bg-[#080b06] text-[#e8edd8] font-sans flex flex-col overflow-x-hidden relative">
      {/* AMBIENT ORBS */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute w-[600px] h-[600px] -top-48 -left-24 rounded-full bg-[radial-gradient(circle,rgba(122,180,60,0.09)_0%,transparent_65%)]" />
        <div className="absolute w-[500px] h-[500px] -top-36 -right-20 rounded-full bg-[radial-gradient(circle,rgba(60,120,40,0.06)_0%,transparent_65%)]" />
        <div className="absolute w-[400px] h-[400px] bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,212,111,0.05)_0%,transparent_65%)]" />
      </div>

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/[0.05]">
        <span className="font-serif text-xl tracking-tight text-white">
          News<span className="text-[#a8d46f]">Scope</span>
        </span>
        <ul className="hidden md:flex gap-10 list-none text-[11px] uppercase tracking-widest text-white/30">
          <li>
            <a
              href="#"
              className="hover:text-white/75 transition-colors duration-200"
            >
              Inicio
            </a>
          </li>
          <li>
            <a
              href="#"
              className="hover:text-white/75 transition-colors duration-200"
            >
              Acerca
            </a>
          </li>
          <li>
            <a
              href="#"
              className="hover:text-white/75 transition-colors duration-200"
            >
              API
            </a>
          </li>
        </ul>
        <span className="text-[10px] bg-[#a8d46f]/[0.08] text-[#a8d46f] border border-[#a8d46f]/20 px-3 py-1 rounded-full tracking-wider">
          Beta
        </span>
      </nav>

      {/* HERO */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#a8d46f] animate-[fadeUp_0.7s_ease_forwards_0.05s]">
          Inteligencia de mercado · Tiempo real
        </p>

        <div className="mt-5 mb-6 animate-[fadeUp_0.7s_ease_forwards_0.15s]">
          <h1 className="font-serif text-[clamp(3.2rem,7.5vw,6.8rem)] leading-[0.95] tracking-tight text-white max-w-[13ch]">
            Seguí cada empresa.
            <br />
            <em className="text-[#a8d46f] not-italic">Al instante.</em>
          </h1>
        </div>

        <p className="text-[15px] text-white/50 max-w-[40ch] leading-relaxed font-light mb-10 animate-[fadeUp_0.7s_ease_forwards_0.25s]">
          Ingresá el nombre de cualquier empresa y obtenemos las últimas
          noticias del mundo con logo verificado y fuente original.
        </p>

        {/* SEARCH */}
        <div className="w-full max-w-[600px] animate-[fadeUp_0.7s_ease_forwards_0.35s]">
          <div className="flex items-center gap-2.5 bg-[#111607] border border-white/[0.09] rounded-2xl px-5 py-1.5 focus-within:border-[#a8d46f]/35 focus-within:shadow-[0_0_0_4px_rgba(168,212,111,0.06)] transition-all duration-200">
            <svg
              className="w-[17px] h-[17px] text-white/20 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                setShowAutocomplete(true);
                scheduleCompaniesFetch(v);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setShowAutocomplete(true);
                scheduleCompaniesFetch(query);
              }}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 120)}
              placeholder="Ej: Apple, Tesla, Mercado Libre…"
              className="flex-1 bg-transparent outline-none text-[14px] text-white/90 placeholder:text-white/20 font-light py-3"
            />
            <button
              onClick={() => void runSearch(query)}
              disabled={!canSearch || loading}
              className="shrink-0 bg-gradient-to-br from-[#a8d46f] to-[#7fb843] text-[#0a0e07] text-[13px] font-medium px-5 py-2.5 rounded-xl hover:opacity-85 active:scale-95 transition-all duration-150 tracking-wide whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? "Buscando…" : "Buscar →"}
            </button>
          </div>

          {showAutocomplete && (companyLoading || autocompleteItems.length > 0) ? (
            <div className="mt-2 bg-[#0c1009] border border-white/[0.08] rounded-2xl overflow-hidden text-left">
              {companyLoading ? (
                <div className="px-4 py-3 text-[12px] text-white/35">
                  Buscando empresas…
                </div>
              ) : null}
              {autocompleteItems.map((c) => (
                <button
                  key={c.domain}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => fillAndSearch(c.name)}
                  className="w-full px-4 py-2.5 text-[13px] text-white/70 hover:bg-white/[0.03] hover:text-white transition-colors duration-150 flex items-center justify-between"
                >
                  <span className="min-w-0">
                    <span className="truncate block">{c.name}</span>
                    <span className="truncate block text-[11px] text-white/30">
                      {c.domain}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {/* PILLS */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[11px] text-white/25">Probá con:</span>
            {SUGGESTIONS.map((name) => (
              <button
                key={name}
                onClick={() => fillAndSearch(name)}
                disabled={loading}
                className="bg-white/[0.03] border border-white/[0.08] rounded-full px-3.5 py-1 text-[11px] text-white/40 hover:border-[#a8d46f]/40 hover:text-[#a8d46f] hover:bg-[#a8d46f]/5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-px h-8 bg-white/[0.07] my-10" />

        {/* STEPS */}
        <div className="w-full max-w-[780px] grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.06] animate-[fadeUp_0.7s_ease_forwards_0.5s]">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-[#0c1009] px-6 py-7 flex flex-col gap-2">
              <div className="mb-1">{step.icon}</div>
              <span className="text-[9px] uppercase tracking-[0.18em] text-[#a8d46f]/60">
                Paso {step.num}
              </span>
              <p className="text-[13px] font-medium text-white/85">
                {step.title}
              </p>
              <p className="text-[12px] text-white/30 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* RESULTS */}
        <section className="w-full max-w-[980px] mt-12">
          {error ? (
            <div className="mt-2 bg-[#111607] border border-red-500/20 rounded-2xl px-6 py-5 text-left">
              <p className="text-[11px] uppercase tracking-[0.2em] text-red-300/70 mb-2">
                Error
              </p>
              <p className="text-[13px] text-white/60 leading-relaxed break-words">
                {error}
              </p>
              <p className="text-[12px] text-white/35 mt-3">
                Tip: probá buscar por dominio (ej:{" "}
                <span className="text-white/60">nike.com</span>) si el nombre no
                encuentra logo.
              </p>
            </div>
          ) : null}

          {result ? (
            <div className="mt-2 bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] grid place-items-center overflow-hidden">
                    <img
                      src={result.logoUrl}
                      alt={`Logo de ${result.domainGuess}`}
                      className="w-9 h-9 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#a8d46f]/70">
                      Resultados
                    </p>
                    <h2 className="text-[18px] text-white/85 font-medium leading-tight">
                      {result.query}
                    </h2>
                    <p className="text-[12px] text-white/35">
                      Logo:{" "}
                      <span className="text-white/55">
                        {result.domainGuess}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-white/20">
                  <span className="border border-white/[0.08] rounded-md px-2 py-0.5 text-[10px] text-white/35 tracking-wide">
                    logo.dev
                  </span>
                  <span className="border border-white/[0.08] rounded-md px-2 py-0.5 text-[10px] text-white/35 tracking-wide">
                    NewsAPI
                  </span>
                </div>
              </div>

              <div className="p-6">
                {result.articles.length === 0 ? (
                  <p className="text-[13px] text-white/45 text-left">
                    No encontramos artículos recientes para esta búsqueda.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.articles.map((a) => {
                      const when = formatDate(a.publishedAt);
                      return (
                        <a
                          key={a.url}
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group bg-[#0c1009] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-[#a8d46f]/35 transition-colors duration-200 text-left"
                        >
                          <div className="flex gap-4 p-4">
                            <div className="w-[92px] h-[72px] rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden shrink-0">
                              {a.imageUrl ? (
                                <img
                                  src={a.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-200"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full grid place-items-center text-white/15 text-[11px] tracking-wide">
                                  Sin imagen
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                                {a.source ?? "Fuente"}
                                {when ? (
                                  <>
                                    <span className="mx-2 text-white/15">
                                      ·
                                    </span>
                                    {when}
                                  </>
                                ) : null}
                              </p>
                              <p className="mt-1 text-[13px] text-white/85 font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors duration-200">
                                {a.title}
                              </p>
                              {a.description ? (
                                <p className="mt-1 text-[12px] text-white/35 leading-relaxed line-clamp-2">
                                  {a.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </main>

      {/* TICKER */}
      <div className="relative z-10 border-y border-white/[0.05] bg-white/[0.015] py-2.5 overflow-hidden">
        <div className="flex gap-12 animate-[ticker_28s_linear_infinite] whitespace-nowrap w-max">
          {[...TICKER_COMPANIES, ...TICKER_COMPANIES].map((company, i) => (
            <span
              key={i}
              className="text-[11px] text-white/20 tracking-widest flex items-center gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-[#a8d46f]/40 shrink-0 inline-block" />
              {company}
            </span>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 flex flex-col md:flex-row items-center justify-between px-10 py-5 border-t border-white/[0.05] gap-3">
        <span className="text-[11px] text-white/20">
          © 2026 NewsScope — Prototipo
        </span>
        <div className="flex items-center gap-2 text-[11px] text-white/20">
          <span>Impulsado por</span>
          <span className="border border-white/[0.08] rounded-md px-2 py-0.5 text-[10px] text-white/35 tracking-wide">
            logo.dev
          </span>
          <span className="border border-white/[0.08] rounded-md px-2 py-0.5 text-[10px] text-white/35 tracking-wide">
            NewsAPI
          </span>
        </div>
      </footer>
    </div>
  );
}
