import Link from "next/link";
import { api, safe } from "@/lib/api";
import { SearchBar } from "@/components/SearchBar";
import { GroupCard } from "@/components/Cards";
import { SITE } from "@/lib/site";

export default async function HomePage() {
  const [stats, groups] = await Promise.all([
    safe(api.stats(), {
      products_in_stock: 0,
      groups_count: 0,
      categories_count: 0,
      updated_at: null,
    }),
    safe(api.groups(), []),
  ]);

  const popular = groups.slice(0, 12);

  return (
    <>
      {/* hero */}
      <section className="hero">
        <div className="container">
          <p className="eyebrow">{SITE.tagline}</p>
          <h1>
            Подарочные карты и подписки —{" "}
            <span className="hero-accent">мгновенно</span>
          </h1>
          <p className="lede">
            Apple, Steam, Google Play, Spotify, PlayStation и сотни других.
            Оплатил — получил код за секунды. Честные цены и поддержка каждый
            день.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary btn-lg" href="/catalog">
              Открыть каталог
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/help">
              Как это работает
            </Link>
          </div>
          <div style={{ marginTop: 28 }}>
            <SearchBar />
          </div>

          {stats.products_in_stock > 0 && (
            <div className="stats">
              <div className="stat">
                <div className="num">{stats.products_in_stock}</div>
                <div className="lbl">товаров в наличии</div>
              </div>
              <div className="stat">
                <div className="num">{stats.groups_count}</div>
                <div className="lbl">брендов</div>
              </div>
              <div className="stat">
                <div className="num">24/7</div>
                <div className="lbl">выдача и поддержка</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* popular brands */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Каталог</p>
              <h2>Популярные бренды</h2>
            </div>
            <Link className="btn btn-ghost" href="/catalog">
              Весь каталог →
            </Link>
          </div>
          {popular.length > 0 ? (
            <div className="grid grid-groups">
              {popular.map((g) => (
                <GroupCard key={g.group_slug} group={g} />
              ))}
            </div>
          ) : (
            <div className="notice">
              Каталог обновляется — загляни через минуту или открой{" "}
              <a href={SITE.botUrl}>Telegram-бот</a>.
            </div>
          )}
        </div>
      </section>

      {/* benefits */}
      <section className="band">
        <div className="container section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Почему {SITE.brand}</p>
              <h2>Удобно и спокойно</h2>
            </div>
          </div>
          <div className="feature-grid">
            <div className="feature">
              <div className="ico">⚡</div>
              <h3>Мгновенная выдача</h3>
              <p>
                Код приходит автоматически сразу после оплаты — без ожидания
                оператора.
              </p>
            </div>
            <div className="feature">
              <div className="ico">🪙</div>
              <h3>Честные цены</h3>
              <p>
                Цена считается по актуальному курсу и видна до копейки. Никаких
                скрытых наценок.
              </p>
            </div>
            <div className="feature">
              <div className="ico">🛟</div>
              <h3>Поддержка рядом</h3>
              <p>
                Что-то не активировалось — поможем и решим. Отвечаем быстро,
                каждый день.
              </p>
            </div>
            <div className="feature">
              <div className="ico">🎁</div>
              <h3>Кэшбэк с друзей</h3>
              <p>
                Реферальная программа: получай процент с покупок приглашённых
                на свой баланс.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Как это работает</p>
              <h2>Три шага до кода</h2>
            </div>
          </div>
          <div className="feature-grid">
            <div className="feature">
              <div className="ico">1</div>
              <h3>Выбираешь товар</h3>
              <p>Находишь нужный бренд, регион и номинал в каталоге.</p>
            </div>
            <div className="feature">
              <div className="ico">2</div>
              <h3>Оплачиваешь</h3>
              <p>Удобным способом — оплата занимает меньше минуты.</p>
            </div>
            <div className="feature">
              <div className="ico">3</div>
              <h3>Получаешь код</h3>
              <p>Код приходит сразу и сохраняется в истории заказов.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
