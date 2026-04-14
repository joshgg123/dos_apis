export default function NewsList({ noticias }: any) {
  return (
    <div className="grid gap-6">
      {noticias.map((n: any, i: number) => (
        <a
          key={i}
          href={n.url}
          target="_blank"
          className="group block bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-2xl"
        >
          <div className="flex flex-col md:flex-row">
            
            {/* IMAGE */}
            {n.urlToImage && (
              <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                <img
                  src={n.urlToImage}
                  alt={n.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* CONTENT */}
            <div className="p-4 flex flex-col justify-between flex-1">
              
              {/* TITLE */}
              <h2 className="font-semibold text-lg group-hover:text-blue-400 transition">
                {n.title}
              </h2>

              {/* DESCRIPTION */}
              <p className="text-sm text-zinc-400 mt-2 line-clamp-3">
                {n.description || "Sin descripción disponible"}
              </p>

              {/* FOOTER */}
              <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
                <span>{n.source?.name || "Fuente desconocida"}</span>
                <span>
                  {n.publishedAt
                    ? new Date(n.publishedAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>

          </div>
        </a>
      ))}
    </div>
  );
}