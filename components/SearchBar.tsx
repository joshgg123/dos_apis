"use client";
import { useState, useEffect } from "react";

export default function SearchBar({ onSelect }: any) {
  const [query, setQuery] = useState("");
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    if (!query) return;

    const timeout = setTimeout(() => {
      fetch(`/api/empresas?q=${query}`)
        .then(res => res.json())
        .then(setEmpresas);
    }, 300); // debounce simple

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div>
      <input
        placeholder="Buscar empresa..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {empresas.map((e: any) => (
        <div key={e.domain} onClick={() => onSelect(e)}>
          <img src={e.logo} />
          {e.name}
        </div>
      ))}
    </div>
  );
}