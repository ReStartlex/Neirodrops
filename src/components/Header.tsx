import Link from "next/link";
import { SITE } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/">
          <span className="dot" />
          {SITE.brand}
        </Link>
        <nav className="nav">
          <Link href="/catalog">Каталог</Link>
          <Link href="/search">Поиск</Link>
          <Link href="/help">Как купить</Link>
        </nav>
        <span className="header-spacer" />
        <a
          className="btn btn-ghost"
          href={SITE.botUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Войти
        </a>
      </div>
    </header>
  );
}
