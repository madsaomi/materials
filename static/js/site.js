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
  function setMenu(open) {
    sidebar.classList.toggle('open', open);
    overlay.hidden = !open;
    menu.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) sidebar.querySelector('a').focus();
  }
  menu.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  overlay.addEventListener('click', () => { setMenu(false); menu.focus(); });
  sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  matchMedia('(min-width: 721px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

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
  function inDomain(doc) {
    const category = doc.category.split(' / ')[0];
    return domain === 'all' || (domain === 'other' ? !['languages', 'mnemonics', 'programming'].includes(category) : category === domain);
  }
  function markActive(scroll = false) {
    const links = [...results.querySelectorAll('a')];
    links.forEach((link, i) => link.classList.toggle('active', i === active));
    if (scroll && links[active]) links[active].scrollIntoView({block: 'nearest'});
  }
  function renderResults() {
    if (!index) return;
    const words = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const found = index.filter(doc => inDomain(doc) && words.every(word => `${doc.title} ${doc.slug} ${doc.category} ${doc.categoryLabel}`.toLocaleLowerCase().includes(word)));
    results.replaceChildren(); active = 0;
    status.textContent = found.length ? `${words.length ? 'Найдено' : 'Заметок'}: ${found.length}${found.length > 40 ? '. Показаны первые 40 — уточните запрос.' : ''}` : 'Ничего не найдено. Попробуйте другое слово или раздел.';
    found.slice(0, 40).forEach(doc => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = '/doc/' + doc.slug.split('/').map(encodeURIComponent).join('/');
      const title = document.createElement('span'); title.textContent = doc.title;
      const detail = document.createElement('small'); detail.textContent = `${doc.categoryLabel} · ${doc.slug}`;
      link.append(title, detail); results.append(link);
    });
    markActive();
  }
  async function openSearch() {
    if (sidebar.classList.contains('open')) setMenu(false);
    if (!dialog.open) dialog.showModal();
    input.focus(); status.textContent = 'Загрузка заметок…';
    try { await loadIndex(); renderResults(); }
    catch (_) { status.textContent = 'Не удалось загрузить поиск. Закройте и откройте его ещё раз.'; }
  }
  document.querySelectorAll('[data-search]').forEach(button => button.addEventListener('click', openSearch));
  document.querySelector('#search-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  input.addEventListener('input', renderResults);
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

  const viewSwitch = document.querySelector('.view-switch');
  if (viewSwitch) {
    const setView = (view, persist = false) => {
      root.dataset.view = view === 'list' ? 'list' : 'cards';
      viewSwitch.querySelectorAll('[data-view]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.view === root.dataset.view));
      });
      if (persist) storage.set('libraryView', root.dataset.view);
    };
    setView(storage.get('libraryView', 'cards'));
    viewSwitch.hidden = false;
    viewSwitch.addEventListener('click', event => {
      const button = event.target.closest('[data-view]');
      if (button) setView(button.dataset.view, true);
    });
  }

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
  if (document.querySelector('.document')) {
    const progress = document.querySelector('#reading-progress');
    const update = () => {
      const height = root.scrollHeight - innerHeight;
      progress.style.width = (height > 0 ? Math.min(100, scrollY / height * 100) : 100) + '%';
    };
    addEventListener('scroll', update, {passive: true}); addEventListener('resize', update); update();
  }
})();
