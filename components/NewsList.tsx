export default function NewsList({ noticias }: any) {
  return (
    <div>
      {noticias.map((n: any, i: number) => (
        <div key={i}>
          <a href={n.url} target="_blank">
            {n.title}
          </a>
        </div>
      ))}
    </div>
  );
}