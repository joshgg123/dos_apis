"use client";
import { useState, useEffect } from "react";

export default function SearchBar({ onSelect }: any) {
  const [query, setQuery] = useState("");
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setEmpresas([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(`/api/empresas?q=${query}`)
        .then(res => res.json())
        .then(data => setEmpresas(data || []))
        .catch(() => setEmpresas([]));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setEmpresas([]);
  };

  return (
    <div className="relative w-full">
      
      {/* INPUT + CLEAR */}
      <div className="relative">
        <input
          className="w-full p-4 pr-10 rounded-xl bg-zinc-900 border border-zinc-700 outline-none focus:ring-2 ring-blue-500 placeholder:text-zinc-400"
          placeholder="Buscar empresa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* CLEAR BUTTON */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* DROPDOWN */}
      {empresas.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          
          {empresas.map((e: any) => (
            <div
              key={e.domain}
              onClick={() => {
                onSelect(e);
                setQuery(e.name);
                setEmpresas([]); // 🔥 esto cierra el dropdown
              }}
              className="flex items-center gap-3 p-3 hover:bg-white/10 transition cursor-pointer"
            >
              <img
                src={e.logo}
                className="w-8 h-8 object-contain"
                onError={(ev) =>
                  (ev.currentTarget.style.display = "none")
                }
              />

              <div className="flex flex-col">
                <span className="font-medium text-white">
                  {e.name}
                </span>
                <span className="text-xs text-zinc-400">
                  {e.domain}
                </span>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}