import os
import re
import html as html_mod
import markdown
import frontmatter
from pygments import highlight
from pygments.lexers import get_lexer_by_name, guess_lexer
from pygments.formatters import HtmlFormatter
from flask import Flask, render_template, abort, url_for, jsonify, send_from_directory

app = Flask(__name__)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
KNOWLEDGE_DIR = os.path.join(BASE_DIR, 'knowledge')
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

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
            return 'href=%s/doc/%s%s' % (quote, target, anchor)

        html = re.sub(r'href=(["\'])([^"\']+)\1', rewrite_link, html)

    return html, toc

_docs_cache = None
_cache_mtime = 0.0


def _knowledge_mtime():
    latest = 0.0
    for root, dirs, files in os.walk(KNOWLEDGE_DIR):
        for f in files:
            if f.endswith('.md'):
                try:
                    m = os.path.getmtime(os.path.join(root, f))
                    if m > latest:
                        latest = m
                except OSError:
                    pass
    return latest


def get_all_docs():
    global _docs_cache, _cache_mtime
    current_mtime = _knowledge_mtime()
    if _docs_cache is not None and current_mtime <= _cache_mtime:
        return _docs_cache
    docs = []
    if not os.path.exists(KNOWLEDGE_DIR):
        return docs
    
    for root, dirs, files in os.walk(KNOWLEDGE_DIR):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, KNOWLEDGE_DIR)
                slug = rel_path[:-3].replace('\\', '/')
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        post = frontmatter.load(f)
                        data = post.metadata
                        content = post.content
                except Exception:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        data = {}

                title = data.get('title')
                if not title:
                    h1_match = re.search(r'^#\s+(.+)$', content, re.M)
                    if h1_match:
                        title = h1_match.group(1).strip()
                    else:
                        title = os.path.splitext(file)[0].replace('-', ' ').title()

                parts = slug.split('/')
                category = parts[0] if parts else 'General'
                if category == 'languages' and len(parts) > 1:
                    category = f"languages / {parts[1]}"
                elif category == 'mnemonics' and len(parts) > 1:
                    category = f"mnemonics / {parts[1]}"

                html, toc = parse_markdown(content, slug)

                # Reading time
                plain_text = re.sub(r'[#*`_\[\]()>-]', '', content)
                words = len(plain_text.split())
                reading_time = max(1, round(words / 200))

                docs.append({
                    'slug': slug,
                    'title': title,
                    'category': category,
                    'relativePath': rel_path.replace('\\', '/'),
                    'data': data,
                    'toc': toc,
                    'html': html,
                    'readingTime': reading_time
                })
    _docs_cache = docs
    _cache_mtime = _knowledge_mtime()
    return docs

def build_categories(docs):
    categories = {}
    for doc in docs:
        cat = doc['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(doc)
    return categories


@app.route('/')
def index():
    docs = get_all_docs()
    categories = build_categories(docs)
    return render_template('index.html', docs=docs, categories=categories)

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
        title = segment.replace('-', ' ').title()

        url = None
        exact_doc = slug_set.get(partial_slug)
        index_doc = slug_set.get(f"{partial_slug}/index")

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
    cat_docs = categories.get(current_doc['category'], [])
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
        next_doc=next_doc
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
        {'title': d['title'], 'slug': d['slug'], 'category': d['category']}
        for d in docs
    ])


@app.errorhandler(404)
def page_not_found(e):
    docs = get_all_docs()
    categories = build_categories(docs)
    return render_template('404.html', docs=docs, categories=categories), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
