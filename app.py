import os
import re
import html as html_mod
import math
import threading
from html.parser import HTMLParser
from urllib.parse import quote as urlquote, unquote, urlsplit
import markdown
import frontmatter
from pygments import highlight
from pygments.lexers import get_lexer_by_name, guess_lexer
from pygments.formatters import HtmlFormatter
from flask import Flask, render_template, abort, url_for, jsonify, send_from_directory, request

app = Flask(__name__)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
KNOWLEDGE_DIR = os.path.join(BASE_DIR, 'knowledge')
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

class SearchText(HTMLParser):
    """Keep inline words intact, but separate paragraphs and table cells."""
    def __init__(self):
        super().__init__()
        self.parts = []
        self.hidden = 0
        self.links = set()

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            target = urlsplit(dict(attrs).get('href', ''))
            if not target.scheme and not target.netloc and target.path.startswith('/doc/'):
                self.links.add(unquote(target.path[5:]))
        if tag in ('script', 'style'):
            self.hidden += 1
        if tag in ('p', 'div', 'br', 'li', 'td', 'th', 'pre', 'h1', 'h2', 'h3', 'h4'):
            self.parts.append(' ')

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.hidden = max(0, self.hidden - 1)
        self.handle_starttag(tag if tag not in ('script', 'style') else '', [])

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)

def search_text(rendered):
    parser = SearchText()
    parser.feed(rendered)
    return re.sub(r'\s+', ' ', ''.join(parser.parts)).strip()

def slugify(text):
    # GitHub-style heading anchors: lowercase, drop punctuation
    # (dots, colons, emoji, dashes), spaces -> hyphens. Matches
    # Obsidian/GitHub so existing [#links] keep working.
    text = text.lower()
    text = re.sub(r'[^\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text or 'section'

def parse_markdown(content, slug=''):
    # Custom markdown parser that handles code blocks with Pygments and extracts ToC
    lines = content.split('\n')
    toc = []
    clean_lines = []
    h1_found = False
    in_code_block = False
    used_heading_ids = {}

    for line in lines:
        stripped = line.strip()
        # Track fenced code blocks so code comments are never mistaken for headings
        if stripped.startswith(('```', '~~~')):
            in_code_block = not in_code_block
            clean_lines.append(line)
            continue

        if not in_code_block:
            match = re.match(r'^(#{1,3})\s+(.+)$', line)
            if match:
                level = len(match.group(1))
                text = match.group(2).strip()
                if level == 1 and not h1_found:
                    h1_found = True
                    continue # skip first h1 (rendered as page header)
                elif 1 <= level <= 3:
                    base_id = slugify(text)
                    if base_id in used_heading_ids:
                        used_heading_ids[base_id] += 1
                        hid = f"{base_id}-{used_heading_ids[base_id]}"
                    else:
                        used_heading_ids[base_id] = 0
                        hid = base_id
                    toc.append({'level': level, 'text': text, 'id': hid})
                    clean_lines.append(f'<h{level} id="{hid}">{text}</h{level}>')
                    continue
        clean_lines.append(line)

    body_content = '\n'.join(clean_lines)

    # Use python-markdown for HTML conversion
    md = markdown.Markdown(extensions=['fenced_code', 'tables', 'toc', 'attr_list'])
    html = md.convert(body_content)

    formatter = HtmlFormatter(style='monokai', cssclass='highlight')

    # Find <pre><code class="language-xyz">...</code></pre> or similar
    def replace_code_block(m):
        lang = m.group(1) or ''
        code_text = m.group(2)
        code_text = html_mod.unescape(code_text)
        try:
            lexer = get_lexer_by_name(lang) if lang else guess_lexer(code_text)
        except Exception:
            try:
                lexer = guess_lexer(code_text)
            except Exception:
                from pygments.lexers.special import TextLexer
                lexer = TextLexer()
        highlighted = highlight(code_text, lexer, formatter)
        return highlighted

    html = re.sub(r'<pre><code(?:\s+class="language-([^"]+)")?>(.*?)<\/code><\/pre>', replace_code_block, html, flags=re.DOTALL)

    # Rewrite relative ".md" links to site routes so in-site navigation works.
    if slug:
        srcdir = '/'.join(slug.split('/')[:-1])

        def rewrite_link(m):
            quote, href = m.group(1), m.group(2)
            if href.startswith(('http://', 'https://', 'mailto:', '#', '/')):
                return m.group(0)
            if '#' in href:
                path, anchor = href.split('#', 1)
                anchor = '#' + anchor
            else:
                path, anchor = href, ''
            if not path.endswith('.md'):
                return m.group(0)
            target = os.path.normpath(os.path.join(srcdir, path)).replace(os.sep, '/')
            if target.endswith('.md'):
                target = target[:-3]
            target = urlquote(unquote(target), safe='/')
            return 'href=%s/doc/%s%s%s' % (quote, target, anchor, quote)

        html = re.sub(r'href=(["\'])([^"\']+)\1', rewrite_link, html)

    return html, toc

_docs_cache = None
_cache_signature = None
_file_cache = {}
_cache_lock = threading.RLock()


def _knowledge_snapshot():
    snapshot = []
    for root, dirs, files in os.walk(KNOWLEDGE_DIR):
        dirs[:] = sorted(d for d in dirs if not d.startswith('.'))
        for f in sorted(files):
            if f.endswith('.md'):
                try:
                    path = os.path.join(root, f)
                    stat = os.stat(path)
                    snapshot.append((path, stat.st_mtime_ns, stat.st_size))
                except OSError:
                    pass
    return tuple(snapshot)


def category_for_slug(slug):
    parts = slug.split('/')
    if parts[0] == 'knowledge':
        parts = parts[1:]
    if len(parts) < 2:
        return 'overview'
    if parts[0] in ('languages', 'mnemonics') and len(parts) > 2:
        return f'{parts[0]} / {parts[1]}'
    return parts[0]


LABELS = {
    'overview': 'Обзор библиотеки', 'languages': 'Языки',
    'chinese': 'Китайский', 'english': 'Английский', 'japanese': 'Японский',
    'korean': 'Корейский', 'comparison': 'Сравнение языков', 'study-plans': 'Учебные планы',
    'mnemonics': 'Память и мнемотехника', 'core-techniques': 'Техники запоминания',
    'foundations': 'Основы памяти', 'languages-integration': 'Запоминание языков',
    'practical-domains': 'Практика памяти', 'books': 'Книги', 'philosophy': 'Философия',
    'practices': 'Практики', 'programming': 'Программирование',
    'psychology': 'Психология', 'tools': 'Инструменты', 'meditation': 'Медитация',
    'mnemonics / psychology': 'Психология памяти',
}


@app.template_filter('category_label')
def category_label(category):
    return LABELS.get(category, LABELS.get(category.split(' / ')[-1], category.replace('-', ' ').capitalize()))


@app.template_filter('category_symbol')
def category_symbol(category):
    return {'japanese': '日', 'chinese': '中', 'korean': '한', 'english': 'Aa',
            'programming': '</>', 'philosophy': 'φ', 'books': '文',
            'mnemonics': '記'}.get(category.split(' / ')[-1], '記' if category.startswith('mnemonics') else '知')


def get_all_docs():
    with _cache_lock:
        return _load_docs()


def _load_docs():
    global _docs_cache, _cache_signature, _file_cache
    snapshot = _knowledge_snapshot()
    if _docs_cache is not None and snapshot == _cache_signature:
        return _docs_cache
    docs = []
    next_file_cache = {}
    for file_path, mtime, size in snapshot:
        file = os.path.basename(file_path)
        cached = _file_cache.get(file_path)
        if cached and cached[0] == (mtime, size):
            docs.append(cached[1])
            next_file_cache[file_path] = cached
            continue
        rel_path = os.path.relpath(file_path, KNOWLEDGE_DIR)
        slug = rel_path[:-3].replace('\\', '/')

        try:
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                post = frontmatter.load(f)
                data = post.metadata
                content = post.content
        except Exception:
            with open(file_path, 'r', encoding='utf-8-sig', errors='ignore') as f:
                content = f.read()
                data = {}

        title = data.get('title')
        if not title:
            h1_match = re.search(r'^#\s+(.+)$', content, re.M)
            if h1_match:
                title = h1_match.group(1).strip()
            else:
                title = os.path.splitext(file)[0].replace('-', ' ').title()

        category = category_for_slug(slug)

        html, toc = parse_markdown(content, slug)

        # Reading time
        plain_text = re.sub(r'[#*`_\[\]()>-]', '', content)
        words = len(plain_text.split())
        reading_time = max(1, round(words / 200))

        parser = SearchText()
        parser.feed(html)
        searchable = re.sub(r'\s+', ' ', ''.join(parser.parts)).strip()
        docs.append({
            'slug': slug,
            'title': title,
            'category': category,
            'relativePath': rel_path.replace('\\', '/'),
            'data': data,
            'toc': toc,
            'html': html,
            'readingTime': reading_time,
            'modified': mtime,
            'collection': 'Дополнительное хранилище' if slug.startswith('knowledge/') else 'Основная библиотека',
            'excerpt': searchable[:180],
            'searchText': searchable,
            'searchFolded': searchable.casefold(),
            'links': parser.links,
        })
        next_file_cache[file_path] = ((mtime, size), docs[-1])
    _docs_cache = docs
    _file_cache = next_file_cache
    _cache_signature = snapshot
    return docs

def build_categories(docs):
    categories = {}
    for doc in docs:
        cat = doc['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(doc)
    return dict(sorted(categories.items(), key=lambda item: category_label(item[0]).casefold()))

def related_notes(current, docs):
    """Prefer explicit connections, then nearby notes; suppress mirrored copies."""
    candidates = []
    for doc in docs:
        if doc['slug'] == current['slug'] or doc['title'].casefold() == current['title'].casefold():
            continue
        outgoing = doc['slug'] in current['links']
        incoming = current['slug'] in doc['links']
        same_folder = doc['slug'].rsplit('/', 1)[0] == current['slug'].rsplit('/', 1)[0]
        same_category = doc['category'] == current['category']
        if not (outgoing or incoming or same_category):
            continue
        reason = 'Ссылка из этой заметки' if outgoing else 'Ссылается на эту заметку' if incoming else 'Рядом в разделе' if same_folder else 'Из этой коллекции'
        score = 100 * outgoing + 80 * incoming + 20 * same_folder + 5 * same_category + (doc['collection'] == current['collection'])
        candidates.append((score, doc, reason))
    candidates.sort(key=lambda item: (-item[0], item[1]['title'].casefold(), item[1]['slug']))
    chosen, titles = [], set()
    for _, doc, reason in candidates:
        title = doc['title'].casefold()
        if title not in titles:
            chosen.append({'doc': doc, 'reason': reason})
            titles.add(title)
        if len(chosen) == 4:
            break
    return chosen


@app.route('/')
def index():
    docs = get_all_docs()
    categories = build_categories(docs)
    selected = request.args.get('category', '')
    if selected and selected not in categories:
        abort(404)
    sort = request.args.get('sort', 'title')
    if sort not in ('title', 'recent'):
        sort = 'title'
    filtered = categories.get(selected, docs)
    ordered = sorted(filtered, key=(lambda d: (-d['modified'], d['slug'])) if sort == 'recent'
                     else (lambda d: (d['title'].casefold(), d['slug'])))
    page = max(1, request.args.get('page', 1, type=int))
    pages = max(1, math.ceil(len(ordered) / 24))
    page = min(page, pages)
    return render_template('index.html', docs=docs, categories=categories,
                           selected_category=selected, sort=sort, page=page, pages=pages,
                           visible_docs=ordered[(page-1)*24:page*24], filtered_count=len(ordered))

@app.route('/doc/<path:slug>')
def doc_detail(slug):
    docs = get_all_docs()
    current_doc = next((d for d in docs if d['slug'] == slug), None)
    if not current_doc:
        abort(404)

    slug_set = {d['slug']: d for d in docs}
    path_segments = slug.split('/')
    breadcrumbs = []
    for i in range(len(path_segments)):
        partial_slug = '/'.join(path_segments[:i+1])
        segment = path_segments[i]
        title = LABELS.get(segment, segment.replace('-', ' ').title())

        url = None
        exact_doc = slug_set.get(partial_slug)
        index_doc = slug_set.get(f"{partial_slug}/index")
        if index_doc and index_doc['slug'] == slug and i < len(path_segments) - 1:
            continue

        if exact_doc:
            url = f"/doc/{exact_doc['slug']}"
            title = exact_doc['title']
        elif index_doc:
            url = f"/doc/{index_doc['slug']}"
            title = index_doc['title']

        breadcrumbs.append({
            'title': title,
            'url': url,  # None => rendered as plain text, never a 404 link
            'isLast': i == len(path_segments) - 1
        })

    categories = build_categories(docs)
    cat_docs = sorted((d for d in categories.get(current_doc['category'], [])
                       if d['collection'] == current_doc['collection']), key=lambda d: d['slug'])
    prev_doc = None
    next_doc = None
    for idx, d in enumerate(cat_docs):
        if d['slug'] == current_doc['slug']:
            if idx > 0:
                prev_doc = cat_docs[idx - 1]
            if idx < len(cat_docs) - 1:
                next_doc = cat_docs[idx + 1]
            break

    return render_template(
        'doc.html',
        current_doc=current_doc,
        breadcrumbs=breadcrumbs,
        docs=docs,
        categories=categories,
        prev_doc=prev_doc,
        next_doc=next_doc,
        related=related_notes(current_doc, docs)
    )

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(PUBLIC_DIR, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/favicon.svg')
def favicon_svg():
    return send_from_directory(PUBLIC_DIR, 'favicon.svg', mimetype='image/svg+xml')

@app.route('/api/search.json')
def search_json():
    docs = get_all_docs()
    return jsonify([
        {'title': d['title'], 'slug': d['slug'], 'category': d['category'],
         'categoryLabel': category_label(d['category']), 'collection': d['collection']}
        for d in docs
    ])

@app.route('/api/preview/<path:slug>')
def note_preview(slug):
    doc = next((doc for doc in get_all_docs() if doc['slug'] == slug), None)
    if doc is None:
        return jsonify(error='not_found'), 404
    return jsonify(title=doc['title'], category=category_label(doc['category']),
                   excerpt=doc['searchText'][:360], readingTime=doc['readingTime'])

@app.route('/api/search')
def full_text_search():
    query = request.args.get('q', '')[:200].strip()
    words = list(dict.fromkeys(query.casefold().split()))
    domain = request.args.get('domain', 'all')
    if domain not in ('all', 'languages', 'mnemonics', 'programming', 'other'):
        abort(400)
    matches = []
    for doc in get_all_docs():
        category = doc['category'].split(' / ')[0]
        if domain != 'all' and not (category not in ('languages', 'mnemonics', 'programming') if domain == 'other' else category == domain):
            continue
        title = doc['title'].casefold()
        metadata = f"{title} {doc['slug']} {doc['category']} {category_label(doc['category'])}".casefold()
        if not all(word in metadata or word in doc['searchFolded'] for word in words):
            continue
        score = (100 if query and query.casefold() == title else 0) + sum(10 if word in title else 2 if word in metadata else 0 for word in words)
        matches.append((score, doc))
    matches.sort(key=lambda item: (-item[0], item[1]['title'].casefold(), item[1]['slug']))
    found = []
    for _, doc in matches[:40]:
        body = doc['searchText']
        match = re.search('|'.join(re.escape(word) for word in words), body, re.IGNORECASE) if words else None
        start = max(0, match.start() - 65) if match else 0
        snippet = ('…' if start else '') + body[start:start + 230] + ('…' if len(body) > start + 230 else '')
        found.append({'title': doc['title'], 'slug': doc['slug'], 'categoryLabel': category_label(doc['category']), 'snippet': snippet})
    return jsonify(total=len(matches), results=found)


@app.get('/healthz')
def healthz():
    # Gunicorn warms the library before accepting requests. No repeated scan here.
    return jsonify(status='ok'), 200, {'Cache-Control': 'no-store'}


@app.errorhandler(404)
def page_not_found(e):
    docs = get_all_docs()
    categories = build_categories(docs)
    return render_template('404.html', docs=docs, categories=categories), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
