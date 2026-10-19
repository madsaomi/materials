import type { ReactNode } from "react";
import { getDocs } from "../lib/knowledge";
import { treeFor, folderUrl } from "../lib/catalog";
export function Icon({
  name = "menu",
  size = 20,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
      </>
    ),
    folder: (
      <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    ),
    note: (
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8m-8 4h5" />
    ),
    focus: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5" />,
    link: (
      <path d="m10 13 4-4m-6 6-2 2a3.5 3.5 0 0 1-5-5l5-5a3.5 3.5 0 0 1 5 0m2 2 2-2a3.5 3.5 0 0 1 5 5l-5 5a3.5 3.5 0 0 1-5 0" />
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.note}
    </svg>
  );
}
export function Shell({
  children,
  location = "Библиотека",
  hasToc = false,
}: {
  children: ReactNode;
  location?: string;
  hasToc?: boolean;
}) {
  const tree = treeFor(getDocs());
  return (
    <>
      <a href="#main" className="skip-link">
        Перейти к содержимому
      </a>
      <div id="reading-progress" aria-hidden="true" />
      <button className="sidebar-overlay" aria-label="Закрыть разделы" hidden />
      <aside
        className="sidebar glass liquid-surface"
        id="sidebar"
        aria-label="Разделы библиотеки"
      >
        <button
          id="sidebar-close"
          className="icon-button drawer-close"
          aria-label="Закрыть разделы"
        >
          <Icon name="close" />
        </button>
        <a className="brand" href="/">
          <span className="brand-mark">知</span>
          <span>
            Chishiki<small>Личная библиотека</small>
          </span>
        </a>
        <button className="search-trigger" data-search>
          <Icon name="search" />
          <span>Поиск заметок</span>
          <kbd>Ctrl K</kbd>
        </button>
        <nav className="sidebar-nav">
          <a className="nav-item" href="/">
            Библиотека
          </a>
          <p className="nav-caption">КОЛЛЕКЦИИ</p>
          {tree.get("")!.children.map((p) => {
            const node = tree.get(p)!;
            return (
              <a className="nav-item" key={p} href={folderUrl(p)}>
                <span className="nav-symbol">
                  <Icon name="folder" size={16} />
                </span>
                <span>{node.label}</span>
                <span className="nav-count">{node.count}</span>
              </a>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <span>
            <i className="status-dot" /> Место для ваших мыслей
          </span>
          <button
            className="icon-button"
            data-theme
            aria-label="Переключить тему"
          >
            <Icon name="sun" />
          </button>
        </div>
      </aside>
      <div className="workspace" id="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              id="menu-toggle"
              aria-label="Открыть разделы"
              aria-controls="sidebar"
              aria-expanded="false"
            >
              <Icon />
            </button>
            <a className="quiet-brand" href="/">
              Chishiki<span> / библиотека</span>
            </a>
            <span className="topbar-divider">/</span>
            <span className="topbar-location">{location}</span>
          </div>
          <div className="topbar-actions">
            {hasToc && (
              <button
                className="pill-button"
                id="contents-toggle"
                aria-haspopup="dialog"
                aria-controls="contents-dialog"
              >
                <Icon name="note" size={16} /> Содержание
              </button>
            )}
            <button className="icon-button" data-search aria-label="Поиск">
              <Icon name="search" />
              <span className="search-button-label">Поиск заметок</span>
              <kbd>Ctrl K</kbd>
            </button>
            <button
              className="icon-button"
              data-theme
              aria-label="Переключить тему"
            >
              <Icon name="sun" />
            </button>
            <span className="avatar" aria-hidden="true">
              知
            </span>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </div>
      <dialog
        id="search-dialog"
        className="search-dialog glass"
        aria-labelledby="search-title"
      >
        <div className="search-dialog-header">
          <Icon name="search" />
          <label className="sr-only" id="search-title" htmlFor="search-input">
            Поиск по библиотеке
          </label>
          <input
            id="search-input"
            maxLength={200}
            type="search"
            placeholder="Название или слова из текста…"
            autoComplete="off"
          />
          <button
            className="icon-button"
            id="search-close"
            aria-label="Закрыть поиск"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="search-domains" aria-label="Область поиска">
          {[
            ["all", "Всё"],
            ["languages", "Языки"],
            ["mnemonics", "Память"],
            ["programming", "Код"],
            ["other", "Другое"],
          ].map(([domain, title]) => (
            <button
              key={domain}
              data-domain={domain}
              className={domain === "all" ? "selected" : ""}
              aria-pressed={domain === "all"}
            >
              {title}
            </button>
          ))}
        </div>
        <p id="search-status" role="status" className="search-status">
          Загрузка заметок…
        </p>
        <div id="search-results" className="search-results" />
        <div className="search-dialog-footer">
          <span>↑ ↓ выбрать &nbsp; ↵ открыть</span>
          <span>Esc — закрыть</span>
        </div>
      </dialog>
      <button id="zen-exit" className="glass pill-button" hidden>
        <Icon name="close" /> Выйти из режима чтения <kbd>Esc</kbd>
      </button>
      <div id="toast" role="status" className="glass" hidden />
    </>
  );
}
