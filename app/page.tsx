"use client";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import NewsList from "@/components/NewsList";

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<any>(null);

  const handleSelect = async (empresa: any) => {
    setEmpresaSeleccionada(empresa);

    const res = await fetch(`/api/noticias?empresa=${empresa.name}`);
    const data = await res.json();
    setNoticias(data);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white flex flex-col items-center px-4 py-10">
      
      {/* BACKGROUND BLUR EFFECT */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute w-72 h-72 bg-blue-600/20 blur-3xl rounded-full top-10 left-10" />
        <div className="absolute w-72 h-72 bg-purple-600/20 blur-3xl rounded-full bottom-10 right-10" />
      </div>

      {/* TITLE */}
      <h1 className="text-5xl font-bold mb-2 tracking-tight text-center">
        Company News Finder
      </h1>

      <p className="text-zinc-400 mb-10 text-center">
        Buscá empresas y descubrí sus últimas noticias en tiempo real
      </p>

      {/* SEARCH CONTAINER */}
      <div className="w-full relative z-50 max-w-xl mb-10 backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl shadow-xl">
        <SearchBar onSelect={handleSelect} />
      </div>

      {/* EMPRESA SELECCIONADA */}
      {empresaSeleccionada && (
        <div className="flex items-center gap-3 mb-8 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg animate-fade-in">
          <img
            src={empresaSeleccionada.logo}
            className="w-10 h-10 object-contain"
          />
          <span className="text-lg font-medium">
            {empresaSeleccionada.name}
          </span>
        </div>
      )}

      {/* NEWS */}
      <div className="w-full max-w-2xl">
        {noticias.length > 0 ? (
          <div className="grid gap-5 animate-fade-in">
            <NewsList noticias={noticias} />
          </div>
        ) : (
          <p className="text-zinc-500 text-sm text-center">
            Seleccioná una empresa para ver noticias
          </p>
        )}
      </div>

    </main>
  );
}