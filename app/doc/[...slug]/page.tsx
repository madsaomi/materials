import { notFound, permanentRedirect } from "next/navigation";
import { Shell, Icon } from "../../../components/shell";
import { getDocs, legacy, related } from "../../../lib/knowledge";
import { label, folderUrl, docUrl, order } from "../../../lib/catalog";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props) {
  const slug = (await params).slug.join("/");
  return {
    title:
      (getDocs().find((d) => d.slug === slug)?.title || "Заметка не найдена") +
      " · Chishiki",
  };
}
export default async function Document({ params, searchParams }: Props) {
  const slug = (await params).slug.join("/");
  const docs = getDocs();
  const doc = docs.find((d) => d.slug === slug);
  if (!doc) {
    if (legacy[slug]) {
      const query = new URLSearchParams();
      for (const [k, v] of Object.entries(await searchParams)) {
        if (Array.isArray(v)) v.forEach((x) => query.append(k, x));
        else if (v !== undefined) query.set(k, v);
      }
      permanentRedirect(docUrl(legacy[slug]) + (query.size ? "?" + query : ""));
    }
    notFound();
  }
  const siblings = docs
    .filter(
      (d) =>
        d.category === doc.category &&
        d.collection === doc.collection &&
        d.catalogLevel === doc.catalogLevel &&
        !d.isContents,
    )
    .sort(order);
  const at = siblings.findIndex((d) => d.slug === slug);
  const prev = at > 0 ? siblings[at - 1] : undefined,
    next = at >= 0 ? siblings[at + 1] : undefined;
  const parts = doc.catalogFolder ? doc.catalogFolder.split("/") : [];
  const suggestions = related(doc, docs);
  return (
    <Shell location={doc.categoryLabel} hasToc={doc.toc.length > 0}>
      <div
        className="document-layout"
        data-family={doc.category.split(" / ")[0]}
      >
        <article
          className="document glass"
          data-doc-slug={slug}
          data-doc-title={doc.title}
          data-doc-aliases={JSON.stringify(doc.legacySlugs)}
        >
          <nav
            className="breadcrumbs folder-breadcrumbs"
            aria-label="Путь к заметке"
          >
            <a href="/">Библиотека</a>
            {parts.map((_, i) => {
              const p = parts.slice(0, i + 1).join("/");
              return (
                <span key={p}>
                  {" "}
                  / <a href={folderUrl(p)}>{label(p)}</a>
                </span>
              );
            })}
          </nav>
          <header className="document-header">
            <h1>{doc.title}</h1>
            <div className="reader-byline">
              <div className="document-meta">
                <span>{doc.readingTime} мин чтения</span>
                {doc.data.level != null && (
                  <span>Уровень {String(doc.data.level)}</span>
                )}
                <span>{doc.collection}</span>
              </div>
              <div className="document-tools">
                <button
                  className="pill-button"
                  id="font-toggle"
                  aria-pressed="false"
                >
                  Aa <span>Шрифт</span>
                </button>
                <button className="pill-button" id="copy-link">
                  <Icon name="link" size={16} /> Ссылка
                </button>
                <button
                  className="pill-button"
                  id="zen-toggle"
                  aria-pressed="false"
                >
                  <Icon name="focus" size={16} /> Читать
                </button>
              </div>
            </div>
          </header>
          {doc.toc.length > 0 && (
            <details className="mobile-toc">
              <summary>
                Содержание <span>{doc.toc.length}</span>
              </summary>
              <nav aria-label="Содержание заметки">
                {doc.toc.map((h) => (
                  <a key={h.id} href={"#" + h.id}>
                    {h.text}
                  </a>
                ))}
              </nav>
            </details>
          )}
          <div className="resume-banner" id="resume-banner" hidden>
            <span id="resume-label" />
            <button className="pill-button" id="resume-reading">
              Продолжить →
            </button>
            <button className="text-button" id="restart-reading">
              С начала
            </button>
          </div>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
          <div className="document-end">
            <span>{doc.relativePath}</span>
            <a href="#main">Наверх ↑</a>
          </div>
          {suggestions.length > 0 && (
            <section className="related-notes" aria-labelledby="related-title">
              <div className="related-heading">
                <span className="eyebrow">ПРОДОЛЖИТЬ ТЕМУ</span>
                <h2 id="related-title">Связанные заметки</h2>
              </div>
              <div className="related-grid">
                {suggestions.map(({ doc: d, reason }) => (
                  <a
                    key={d.slug}
                    className="related-card"
                    href={docUrl(d.slug)}
                  >
                    <small>{reason}</small>
                    <h3>{d.title}</h3>
                    <p>{d.excerpt}</p>
                    <span>
                      {d.readingTime} мин · {d.categoryLabel} ↗
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}
          {(prev || next) && (
            <nav className="adjacent-notes" aria-label="Соседние заметки">
              {prev ? (
                <a href={docUrl(prev.slug)}>
                  <small>← Предыдущая</small>
                  <span>{prev.title}</span>
                </a>
              ) : (
                <span />
              )}
              {next ? (
                <a href={docUrl(next.slug)}>
                  <small>Следующая →</small>
                  <span>{next.title}</span>
                </a>
              ) : (
                <span />
              )}
            </nav>
          )}
        </article>
        {doc.toc.length > 0 && (
          <dialog
            id="contents-dialog"
            className="contents-dialog glass"
            aria-labelledby="contents-title"
          >
            <div className="contents-header">
              <div>
                <h2 id="contents-title">Содержание</h2>
                <small>Разделов: {doc.toc.length}</small>
              </div>
              <button
                id="contents-close"
                className="icon-button"
                aria-label="Закрыть содержание"
              >
                <Icon name="close" />
              </button>
            </div>
            <nav aria-label="Содержание">
              {doc.toc.map((h) => (
                <a
                  key={h.id}
                  className={"toc-link level-" + h.level}
                  href={"#" + h.id}
                  data-target={h.id}
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </dialog>
        )}
      </div>
    </Shell>
  );
}
