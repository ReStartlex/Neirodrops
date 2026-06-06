import Link from "next/link";
import { SITE } from "@/lib/site";
import { AuthButton } from "./AuthButton";

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
          <Link className="hide-sm" href="/help">
            Как купить
          </Link>
        </nav>
        <span className="header-spacer" />
        <AuthButton />
      </div>
    </header>
  );
}
