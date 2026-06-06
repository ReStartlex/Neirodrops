// Поиск без JS: обычная GET-форма на /search. Работает и у роботов,
// и при отключённом JavaScript.
export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form className="searchbar" action="/search" method="get" role="search">
      <input
        type="search"
        name="q"
        placeholder="Найти: Apple, Steam, Spotify…"
        defaultValue={defaultValue}
        aria-label="Поиск товаров"
        minLength={2}
      />
      <button className="btn btn-primary" type="submit">
        Найти
      </button>
    </form>
  );
}
