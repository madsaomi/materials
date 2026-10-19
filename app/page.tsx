import { notFound } from "next/navigation";
import { Shell, Icon } from "../components/shell";
import { getDocs } from "../lib/knowledge";
import { treeFor, folderUrl, docUrl, label } from "../lib/catalog";
export const dynamic = "force-dynamic";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const string = (k: string) =>
    typeof params[k] === "string" ? (params[k] as string) : "";
  const folder = string("folder") || string("category").replaceAll(" / ", "/");
  const tree = treeFor(getDocs());
  const node = tree.get(folder);
  if (!node) notFound();
  const sort = string("sort") === "recent" ? "recent" : "title";
  const entries = [...node.files];
  if (sort === "recent")
    entries.sort(
      (a, b) =>
        b.doc.modified - a.doc.modified || a.doc.slug.localeCompare(b.doc.slug),
    );
  const pages = Math.max(1, Math.ceil(entries.length / 24));
  const page = Math.max(1, Math.min(pages, parseInt(string("page")) || 1));
  const visible = entries.slice((page - 1) * 24, page * 24);
  const parts = folder ? folder.split("/") : [];
  const crumbs = ["", ...parts.map((_, i) => parts.slice(0, i + 1).join("/"))];
  return (
    <Shell location={node.label}>
      <nav className="folder-breadcrumbs" aria-label="Путь по библиотеке">
        {crumbs.map((p, i) => (
          <span key={p}>
            {i > 0 && " / "}
            {i === crumbs.length - 1 ? (
              <span aria-current="page">{label(p)}</span>
            ) : (
              <a href={folderUrl(p)}>{label(p)}</a>
            )}
          </span>
        ))}
      </nav>
      <header className="catalog-heading">
        <div>
          <h1>{node.label}</h1>
          <p>
            {folder
              ? "Откройте папку, чтобы перейти к её содержанию."
              : "Выберите раздел, затем уровень и материалы."}
          </p>
          <small className="folder-total">Материалов: {node.count}</small>
        </div>
        {!folder && (
          <button className="pill-button" id="random-note">
            Случайная заметка
          </button>
        )}
      </header>
      {node.contents.length > 0 && (
        <div className="folder-contents-links">
          {node.contents.map((doc, i) => (
            <a
              key={doc.slug}
              className={i ? "text-button" : "pill-button"}
              href={docUrl(doc.slug)}
            >
              <Icon name="note" size={16} />
              {i
                ? "Содержание дополнительного хранилища"
                : "Содержание раздела"}
            </a>
          ))}
        </div>
      )}
      {node.children.length > 0 && (
        <section className="folder-section" aria-labelledby="folders-title">
          <h2 id="folders-title">
            {folder ? "Уровни и разделы" : "Разделы библиотеки"}
          </h2>
          <div className="folder-grid">
            {node.children.map((p) => {
              const child = tree.get(p)!;
              return (
                <a
                  key={p}
                  className="folder-card glass"
                  href={folderUrl(p)}
                  data-folder={p}
                >
                  <span className="folder-icon" aria-hidden="true">
                    <Icon name="folder" size={24} />
                  </span>
                  <div>
                    <h3>{child.label}</h3>
                    <p>Материалов: {child.count}</p>
                  </div>
                  <span aria-hidden="true">→</span>
                </a>
              );
            })}
          </div>
        </section>
      )}
      {!folder && (
        <section
          id="recent-reading"
          className="recent-reading"
          aria-labelledby="recent-title"
          hidden
        >
          <div className="collections-heading">
            <h2 id="recent-title">Продолжить чтение</h2>
            <button className="text-button" id="clear-history">
              Очистить историю
            </button>
          </div>
          <div id="recent-cards" className="recent-cards" />
        </section>
      )}
      {entries.length > 0 && (
        <section className="notes-section" aria-labelledby="notes-title">
          <div className="section-toolbar">
            <h2 id="notes-title">Материалы папки</h2>
            <div className="catalog-actions">
              <form method="get" className="sort-control">
                <input type="hidden" name="folder" value={folder} />
                <label htmlFor="sort">Порядок:</label>
                <select id="sort" name="sort" defaultValue={sort}>
                  <option value="title">По порядку изучения</option>
                  <option value="recent">По изменению файла</option>
                </select>
                <button type="submit" className="text-button">
                  Применить
                </button>
              </form>
              <div
                className="catalog-view-switch"
                role="group"
                aria-label="Вид материалов"
                hidden
              >
                {[
                  ["list", "Список"],
                  ["cards", "Карточки"],
                  ["table", "Таблица"],
                ].map(([v, t]) => (
                  <button
                    key={v}
                    type="button"
                    data-catalog-view={v}
                    aria-pressed={v === "list"}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="library-list glass">
            {visible.map(({ doc, variants }) => (
              <div key={doc.slug} className="material-entry">
                <a
                  className="library-row"
                  title={doc.relativePath}
                  href={docUrl(doc.slug)}
                >
                  <div className="row-main">
                    <h3>{doc.title}</h3>
                    <p>{doc.excerpt}</p>
                  </div>
                  <div className="row-meta">
                    <span>{doc.readingTime} мин чтения</span>
                  </div>
                </a>
                {variants.length > 0 && (
                  <div className="material-variants">
                    {variants.map((d) => (
                      <a key={d.slug} href={docUrl(d.slug)}>
                        Другая версия · {d.collection}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div
            className="catalog-table-wrap glass"
            tabIndex={0}
            role="region"
            aria-label="Материалы, доступна горизонтальная прокрутка"
          >
            <table className="catalog-table">
              <thead>
                <tr>
                  <th scope="col">Материал</th>
                  <th scope="col">Хранилище</th>
                  <th scope="col">Чтение</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ doc, variants }) => (
                  <tr key={doc.slug}>
                    <td>
                      <a href={docUrl(doc.slug)}>{doc.title}</a>
                      {variants.map((d) => (
                        <a
                          key={d.slug}
                          className="material-variant"
                          href={docUrl(d.slug)}
                        >
                          Другая версия
                        </a>
                      ))}
                    </td>
                    <td>{doc.collection}</td>
                    <td>{doc.readingTime} мин</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <nav className="pagination" aria-label="Страницы материалов">
              {page > 1 ? (
                <a
                  className="pill-button"
                  href={
                    "/?" +
                    new URLSearchParams({
                      folder,
                      sort,
                      page: String(page - 1),
                    })
                  }
                >
                  ← Назад
                </a>
              ) : (
                <span />
              )}
              <span>
                {page} / {pages}
              </span>
              {page < pages ? (
                <a
                  className="pill-button"
                  href={
                    "/?" +
                    new URLSearchParams({
                      folder,
                      sort,
                      page: String(page + 1),
                    })
                  }
                >
                  Далее →
                </a>
              ) : (
                <span />
              )}
            </nav>
          )}
        </section>
      )}
      {!entries.length && !node.children.length && (
        <section className="empty-state glass">
          <h2>В этой папке пока нет материалов</h2>
        </section>
      )}
    </Shell>
  );
}
