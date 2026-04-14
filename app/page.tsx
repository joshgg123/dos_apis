"use client";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import NewsList from "@/components/NewsList";

export default function Home() {
  const [noticias, setNoticias] = useState([]);

  const handleSelect = async (empresa: any) => {
    const res = await fetch(`/api/noticias?empresa=${empresa.name}`);
    const data = await res.json();
    setNoticias(data);
  };

  return (
    <main>
      <h1>Buscador de Empresas</h1>

      <SearchBar onSelect={handleSelect} />

      <NewsList noticias={noticias} />
    </main>
  );
}