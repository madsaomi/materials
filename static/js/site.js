/* Local, dependency-free library interactions. */
(() => {
  'use strict';
  const root = document.documentElement;
  const storage = {
    get(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };
  document.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', () => {
    root.classList.toggle('dark');
    storage.set('theme', root.classList.contains('dark') ? 'dark' : 'light');
  }));
  const sidebar = document.querySelector('#sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const menu = document.querySelector('#menu-toggle');
  const drawerMode = () => document.body.classList.contains('reading-shell') || matchMedia('(max-width: 720px)').matches;
  sidebar.inert = drawerMode();
  function setMenu(open) {
    sidebar.inert = !open && drawerMode();
    sidebar.classList.toggle('open', open);
    overlay.hidden = !open;
    menu.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) sidebar.querySelector('a').focus();
  }
  document.querySelector('#sidebar-close')?.addEventListener('click', () => { setMenu(false); menu.focus(); });
  menu.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  overlay.addEventListener('click', () => { setMenu(false); menu.focus(); });
  sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  matchMedia('(min-width: 721px)').addEventListener('change', () => { setMenu(false); });

  const contents = document.querySelector('#contents-dialog');
  if (contents) {
    document.querySelector('.mobile-toc')?.setAttribute('hidden', '');
    document.querySelector('#contents-toggle').addEventListener('click', () => { setMenu(false); contents.showModal(); });
    document.querySelector('#contents-close').addEventListener('click', () => contents.close());
    contents.addEventListener('click', event => {
      const link = event.target.closest('a[data-target]');
      if (link) {
        contents.close();
        const heading = document.getElementById(link.dataset.target);
        if (heading) { heading.tabIndex = -1; heading.focus({preventScroll: true}); }
      } else if (event.target === contents) {
        const rect = contents.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) contents.close();
      }
    });
  }
  const toast = document.querySelector('#toast');
  let toastTimer;
  function notify(message) {
    toast.textContent = message; toast.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); notify('Скопировано'); }
    catch (_) { notify('Не удалось скопировать. Выделите текст вручную.'); }
  }
  const dialog = document.querySelector('#search-dialog');
  const input = document.querySelector('#search-input');
  const results = document.querySelector('#search-results');
  const status = document.querySelector('#search-status');
  let index = null, indexPromise = null, domain = 'all', active = 0;
  async function loadIndex() {
    if (index) return index;
    if (!indexPromise) indexPromise = fetch('/api/search.json').then(response => {
      if (!response.ok) throw new Error('Search request failed');
      return response.json();
    }).then(data => { index = data; return data; }).catch(error => { indexPromise = null; throw error; });
    return indexPromise;
  }
  let searchTimer, searchController, searchVersion = 0;
  function highlighted(element, text, words) {
    if (!words.length) { element.textContent = text; return; }
    const escaped = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(escaped.join('|'), 'giu');
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      element.append(document.createTextNode(text.slice(cursor, match.index)));
      const mark = document.createElement('mark'); mark.textContent = match[0]; element.append(mark);
      cursor = match.index + match[0].length;
    }
    element.append(document.createTextNode(text.slice(cursor)));
  }
  function markActive(scroll = false) {
    const links = [...results.querySelectorAll('a')];
    links.forEach((link, i) => link.classList.toggle('active', i === active));
    if (scroll && links[active]) links[active].scrollIntoView({block: 'nearest'});
  }
  async function renderResults() {
    clearTimeout(searchTimer);
    searchController?.abort();
    const version = ++searchVersion;
    searchController = new AbortController();
    results.replaceChildren(); active = 0; status.textContent = 'Поиск по всей библиотеке…';
    const query = input.value.trim().slice(0, 200);
    try {
      const response = await fetch('/api/search?' + new URLSearchParams({q: query, domain}), {signal: searchController.signal});
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      if (version !== searchVersion || !dialog.open) return;
      const words = query.split(/\s+/).filter(Boolean);
      status.textContent = data.total ? `Найдено: ${data.total}${data.total > 40 ? '. Показаны первые 40 — уточните запрос.' : ''}` : 'Ничего не найдено. Попробуйте другое слово или раздел.';
      data.results.forEach(doc => {
        const link = document.createElement('a'); link.className = 'search-result';
        link.href = '/doc/' + doc.slug.split('/').map(encodeURIComponent).join('/');
        const title = document.createElement('span'); highlighted(title, doc.title, words);
        const detail = document.createElement('small'); detail.textContent = `${doc.categoryLabel} · ${doc.slug}`;
        const snippet = document.createElement('p'); snippet.className = 'search-snippet'; highlighted(snippet, doc.snippet, words);
        link.append(title, detail, snippet); results.append(link);
      });
      markActive();
    } catch (error) {
      if (error.name !== 'AbortError' && version === searchVersion) status.textContent = 'Не удалось выполнить поиск. Измените запрос или откройте поиск ещё раз.';
    }
  }
  function openSearch() {
    if (contents?.open) contents.close();
    if (sidebar.classList.contains('open')) setMenu(false);
    if (!dialog.open) dialog.showModal();
    input.focus(); renderResults();
  }
  dialog.addEventListener('close', () => { clearTimeout(searchTimer); searchController?.abort(); searchVersion++; });
  document.querySelectorAll('[data-search]').forEach(button => button.addEventListener('click', openSearch));
  document.querySelector('#search-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  input.addEventListener('input', () => { clearTimeout(searchTimer); searchController?.abort(); searchVersion++; results.replaceChildren(); status.textContent = 'Поиск…'; searchTimer = setTimeout(renderResults, 180); });
  document.querySelectorAll('[data-domain]').forEach(button => button.addEventListener('click', () => {
    domain = button.dataset.domain;
    document.querySelectorAll('[data-domain]').forEach(item => {
      item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', String(item === button));
    });
    renderResults(); input.focus();
  }));
  input.addEventListener('keydown', event => {
    const links = results.querySelectorAll('a');
    if (!links.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); active = (active + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length; markActive(true);
    } else if (event.key === 'Enter') { event.preventDefault(); links[active].click(); }
  });
  document.querySelector('#random-note')?.addEventListener('click', async event => {
    const button = event.currentTarget; button.disabled = true;
    try {
      const data = await loadIndex();
      if (data.length) location.href = '/doc/' + data[Math.floor(Math.random() * data.length)].slug.split('/').map(encodeURIComponent).join('/');
      else notify('В библиотеке пока нет заметок.');
    } catch (_) { notify('Не удалось загрузить заметки. Попробуйте ещё раз.'); }
    finally { button.disabled = false; }
  });
  document.querySelector('#sort')?.addEventListener('change', event => event.target.form.requestSubmit());
  document.querySelector('.sort-control button')?.setAttribute('hidden', '');

  const catalogSwitch = document.querySelector('.catalog-view-switch');
  function setCatalogView(value) {
    const view = ['list', 'cards', 'table'].includes(value) ? value : 'list';
    root.dataset.catalogView = view;
    catalogSwitch?.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.catalogView === view)));
  }
  setCatalogView(storage.get('catalogView', 'list'));
  if (catalogSwitch) {
    catalogSwitch.hidden = false;
    catalogSwitch.addEventListener('click', event => {
      const button = event.target.closest('button[data-catalog-view]');
      if (!button) return;
      setCatalogView(button.dataset.catalogView);
      storage.set('catalogView', root.dataset.catalogView);
    });
  }
  addEventListener('storage', event => { if (event.key === 'catalogView') setCatalogView(event.newValue); });

  const tabs = document.querySelector('.collection-tabs');
  const selectedTab = tabs?.querySelector('[aria-current="page"]');
  if (tabs && selectedTab) tabs.scrollLeft = Math.max(0, selectedTab.offsetLeft - tabs.offsetLeft - 20);

  const zenToggle = document.querySelector('#zen-toggle');
  const zenExit = document.querySelector('#zen-exit');
  function setZen(enabled) {
    if (!zenToggle) return;
    document.body.classList.toggle('zen-mode', enabled); zenExit.hidden = !enabled;
    zenToggle.setAttribute('aria-pressed', String(enabled));
    if (enabled) zenExit.focus(); else zenToggle.focus();
  }
  zenToggle?.addEventListener('click', () => setZen(!document.body.classList.contains('zen-mode')));
  zenExit.addEventListener('click', () => setZen(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open) {
      event.preventDefault(); dialog.close(); return;
    }
    const typing = event.target.matches('input, textarea, select, [contenteditable="true"]');
    if ((event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !typing)) { event.preventDefault(); openSearch(); }
    if (event.key === 'Escape' && !dialog.open) {
      if (sidebar.classList.contains('open')) { setMenu(false); menu.focus(); }
      if (document.body.classList.contains('zen-mode')) setZen(false);
    }
    if (event.key === 'Tab' && sidebar.classList.contains('open') && !dialog.open) {
      const focusable = [...sidebar.querySelectorAll('a, button')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  const fontButton = document.querySelector('#font-toggle');
  function updateFont() { fontButton?.setAttribute('aria-pressed', String(root.dataset.font === 'serif')); }
  updateFont();
  fontButton?.addEventListener('click', () => {
    root.dataset.font = root.dataset.font === 'serif' ? 'sans' : 'serif'; storage.set('docFont', root.dataset.font); updateFont();
  });
  document.querySelector('#copy-link')?.addEventListener('click', () => copy(location.href.split('#')[0]));
  document.querySelectorAll('.prose table').forEach(table => {
    const wrapper = document.createElement('div'); wrapper.className = 'table-scroll';
    wrapper.tabIndex = 0; wrapper.setAttribute('role', 'region'); wrapper.setAttribute('aria-label', 'Таблица — прокрутка по горизонтали');
    table.before(wrapper); wrapper.append(table);
  });
  document.querySelectorAll('.highlight').forEach(block => {
    const button = document.createElement('button'); button.className = 'copy-code'; button.textContent = 'Копировать';
    button.addEventListener('click', () => copy(block.querySelector('pre').textContent)); block.append(button);
  });
  document.querySelectorAll('.prose h1[id], .prose h2[id], .prose h3[id]').forEach(heading => {
    const link = document.createElement('a'); link.href = '#' + heading.id; link.className = 'heading-anchor'; link.textContent = '#'; link.setAttribute('aria-label', 'Ссылка на раздел'); heading.append(link);
  });
  const tocLinks = document.querySelectorAll('.toc-link');
  if ('IntersectionObserver' in window && tocLinks.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) tocLinks.forEach(link => link.classList.toggle('active', link.dataset.target === entry.target.id)); });
    }, {rootMargin: '0px 0px -65% 0px'});
    tocLinks.forEach(link => { const heading = document.getElementById(link.dataset.target); if (heading) observer.observe(heading); });
  }
  // Preview only links to other local notes; the original link keeps its normal action.
  const noteLinks = [...document.querySelectorAll('.prose a[href]')].filter(link => {
    const url = new URL(link.href);
    return url.origin === location.origin && url.pathname.startsWith('/doc/') && url.pathname !== location.pathname;
  });
  if (noteLinks.length) {
    const preview = document.createElement('aside'); preview.id = 'note-preview'; preview.className = 'note-preview glass';
    preview.hidden = true; preview.setAttribute('aria-label', 'Предпросмотр заметки');
    const top = document.createElement('div'); top.className = 'preview-top';
    const label = document.createElement('small'); label.textContent = 'ПРЕДПРОСМОТР';
    const close = document.createElement('button'); close.type = 'button'; close.className = 'icon-button'; close.textContent = '×'; close.setAttribute('aria-label', 'Закрыть предпросмотр');
    top.append(label, close);
    const title = document.createElement('h3'), excerpt = document.createElement('p'), meta = document.createElement('small'), open = document.createElement('a');
    const content = document.createElement('div'); content.setAttribute('aria-live', 'polite'); content.append(title, excerpt, meta);
    open.className = 'pill-button'; open.textContent = 'Открыть заметку ↗'; preview.append(top, content, open); document.body.append(preview);
    const cache = new Map(); let current = null, trigger = null, timer, version = 0, openedY = 0, openedWidth = 0, openedHeight = 0;
    function hide(restoreFocus = false) {
      clearTimeout(timer); version++; preview.hidden = true;
      trigger?.setAttribute('aria-expanded', 'false');
      if (restoreFocus) trigger?.focus();
      current = null;
    }
    function position(link) {
      const rect = link.getBoundingClientRect(), box = preview.getBoundingClientRect();
      const left = Math.max(12, Math.min(rect.left, innerWidth - box.width - 12));
      const below = rect.bottom + 10;
      const y = below + box.height < innerHeight - 12 ? below : Math.max(12, rect.top - box.height - 10);
      preview.style.left = left + 'px'; preview.style.top = y + 'px';
    }
    async function show(link, button, focus = false) {
      clearTimeout(timer); trigger?.setAttribute('aria-expanded', 'false');
      trigger = button; current = link; openedY = scrollY; openedWidth = innerWidth; openedHeight = innerHeight; const request = ++version;
      button.setAttribute('aria-expanded', 'true'); preview.hidden = false;
      title.textContent = 'Загрузка…'; excerpt.textContent = ''; meta.textContent = ''; open.href = link.href; position(link);
      if (focus) close.focus({preventScroll: true});
      const path = new URL(link.href).pathname;
      try {
        if (!cache.has(path)) {
          if (cache.size >= 60) cache.delete(cache.keys().next().value);
          cache.set(path, fetch('/api/preview/' + path.slice(5)).then(response => { if (!response.ok) throw new Error('Preview unavailable'); return response.json(); }).catch(error => { cache.delete(path); throw error; }));
        }
        const doc = await cache.get(path);
        if (request !== version) return;
        title.textContent = doc.title; excerpt.textContent = doc.excerpt || 'В этой заметке пока нет текста.'; meta.textContent = `${doc.category} · ${doc.readingTime} мин чтения`;
      } catch (_) {
        if (request !== version) return;
        title.textContent = 'Предпросмотр недоступен'; excerpt.textContent = 'Попробуйте открыть заметку по ссылке.';
      }
      position(link);
    }
    function scheduleHide() { clearTimeout(timer); timer = setTimeout(() => { if (!preview.contains(document.activeElement) && document.activeElement !== trigger) hide(); }, 220); }
    noteLinks.forEach(link => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'preview-trigger'; button.textContent = '◉';
      button.setAttribute('aria-label', 'Предпросмотр: ' + link.textContent.trim()); button.setAttribute('aria-controls', preview.id); button.setAttribute('aria-expanded', 'false'); link.after(button);
      button.addEventListener('click', () => { if (current === link && !preview.hidden) hide(); else show(link, button, true); });
      link.addEventListener('pointerleave', scheduleHide);
      button.addEventListener('pointerenter', () => clearTimeout(timer)); button.addEventListener('pointerleave', scheduleHide);
      link.addEventListener('click', () => hide());
    });
    preview.addEventListener('pointerenter', () => clearTimeout(timer)); preview.addEventListener('pointerleave', scheduleHide);
    preview.addEventListener('focusout', () => setTimeout(() => { if (!preview.contains(document.activeElement) && document.activeElement !== trigger) hide(); }, 0));
    close.addEventListener('click', () => hide(true));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !preview.hidden) { event.preventDefault(); hide(true); } });
    document.addEventListener('click', event => { if (!preview.hidden && !preview.contains(event.target) && event.target !== trigger) hide(); });
    addEventListener('scroll', () => { if (Math.abs(scrollY - openedY) > 4) hide(); }, {passive: true});
    addEventListener('resize', () => { if (innerWidth !== openedWidth || innerHeight !== openedHeight) hide(); });
  }

  const historyKey = 'chishikiReadingHistory';
  function readingHistory() {
    try {
      const items = JSON.parse(storage.get(historyKey, '[]'));
      return Array.isArray(items) ? items.filter(item => item && typeof item.slug === 'string' && typeof item.title === 'string' && Number.isFinite(item.ratio) && item.ratio >= 0 && item.ratio <= 1).slice(0, 20) : [];
    } catch (_) { return []; }
  }
  const recentSection = document.querySelector('#recent-reading');
  let historyRender = 0;
  async function renderHistory() {
    if (!recentSection) return;
    const version = ++historyRender;
    const history = readingHistory();
    recentSection.hidden = true;
    if (!history.length) return;
    try {
      const docs = new Map((await loadIndex()).map(doc => [doc.slug, doc]));
      if (version !== historyRender) return;
      const cards = document.querySelector('#recent-cards'); cards.replaceChildren();
      history.filter(item => docs.has(item.slug)).slice(0, 3).forEach(item => {
        const doc = docs.get(item.slug);
        const link = document.createElement('a'); link.className = 'recent-card glass';
        link.href = '/doc/' + item.slug.split('/').map(encodeURIComponent).join('/') + '?resume=1';
        const label = document.createElement('small'); label.textContent = doc.categoryLabel;
        const title = document.createElement('h3'); title.textContent = doc.title;
        const path = document.createElement('small'); path.className = 'recent-path'; path.textContent = item.slug;
        const progress = document.createElement('progress'); progress.max = 100; progress.value = Math.round(item.ratio * 100); progress.setAttribute('aria-label', 'Прочитано');
        const action = document.createElement('span'); action.textContent = item.ratio >= .98 ? 'Прочитано · открыть снова ↗' : `Продолжить · ${Math.round(item.ratio * 100)}% →`;
        link.append(label, title, path, progress, action); cards.append(link);
      });
      recentSection.hidden = !cards.children.length;
    } catch (_) { /* The library remains usable if metadata is unavailable. */ }
  }
  document.querySelector('#clear-history')?.addEventListener('click', () => { storage.set(historyKey, '[]'); renderHistory(); });
  addEventListener('storage', event => { if (event.key === historyKey) renderHistory(); });
  renderHistory();

  const article = document.querySelector('.document[data-doc-slug]');
  if (article) {
    const prose = article.querySelector('.prose');
    const progress = document.querySelector('#reading-progress');
    const banner = document.querySelector('#resume-banner');
    const slug = article.dataset.docSlug;
    const saved = readingHistory().find(item => item.slug === slug);
    let record = saved || {slug, title: article.dataset.docTitle, ratio: 0};
    let moved = false, saveTimer;
    function save() {
      record.title = article.dataset.docTitle; record.updatedAt = Date.now();
      storage.set(historyKey, JSON.stringify([record, ...readingHistory().filter(item => item.slug !== slug)].slice(0, 20)));
    }
    function range() { return Math.max(1, prose.getBoundingClientRect().bottom + scrollY - innerHeight); }
    function update() {
      const ratio = Math.max(0, Math.min(1, scrollY / range()));
      progress.style.width = ratio * 100 + '%';
      if (!moved) return;
      record = {slug, title: article.dataset.docTitle, ratio};
      // Heading-relative position survives font and viewport changes.
      const heading = [...prose.querySelectorAll('h1[id], h2[id], h3[id]')].reverse().find(node => node.getBoundingClientRect().top <= 100);
      if (heading) {
        record.anchor = heading.id;
        record.offset = (scrollY - (heading.getBoundingClientRect().top + scrollY)) / innerHeight;
      }
      clearTimeout(saveTimer); saveTimer = setTimeout(save, 350);
    }
    function resume() {
      banner.hidden = true;
      let top = saved.ratio * range();
      const heading = typeof saved.anchor === 'string' ? document.getElementById(saved.anchor) : null;
      if (heading && prose.contains(heading) && Number.isFinite(saved.offset)) top = heading.getBoundingClientRect().top + scrollY + saved.offset * innerHeight;
      moved = true;
      window.scrollTo({top: Math.max(0, Math.min(top, root.scrollHeight - innerHeight)), behavior: 'instant'});
      update();
    }
    if (saved && saved.ratio > .02 && !location.hash) {
      document.querySelector('#resume-label').textContent = `Вы остановились на ${Math.round(saved.ratio * 100)}%`;
      banner.hidden = false;
      document.querySelector('#resume-reading').addEventListener('click', resume);
      document.querySelector('#restart-reading').addEventListener('click', () => { banner.hidden = true; moved = true; window.scrollTo({top: 0, behavior: 'instant'}); update(); save(); });
      if (new URLSearchParams(location.search).get('resume') === '1') {
        const restore = () => requestAnimationFrame(resume);
        if (document.readyState === 'complete') restore(); else addEventListener('load', restore, {once: true});
      }
    }
    save(); update();
    addEventListener('scroll', () => { moved = true; update(); }, {passive: true});
    addEventListener('resize', () => { if (!moved) update(); });
    addEventListener('pagehide', () => { clearTimeout(saveTimer); if (moved) save(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && moved) save(); });
  }
})();
