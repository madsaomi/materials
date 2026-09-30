"""Run with python verify.py. No web server or external packages beyond the app needed."""
import json
import os
import posixpath
import runpy
import tempfile
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from unittest.mock import patch
import frontmatter
import markdown
import app as site


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
        self.ids = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and 'href' in attrs:
            self.hrefs.append(attrs['href'])
        if 'id' in attrs:
            self.ids.append(attrs['id'])


def regressions():
    rendered, toc = site.parse_markdown('[Next](../other.md#section)', 'folder/note')
    parsed = Links()
    parsed.feed(rendered)
    assert parsed.hrefs == ['/doc/other#section'], rendered
    rendered, toc = site.parse_markdown('# Title\n\n```python\n# Not a heading\n```\n\n## Same\n\n## Same', 'note')
    assert [h['id'] for h in toc] == ['same', 'same-1']
    assert site.category_for_slug('knowledge/languages/japanese/units/a') == 'languages / japanese'
    # The highest mtime stays unchanged: additions, edits, renames and deletions must still invalidate.
    with tempfile.TemporaryDirectory() as directory:
        first, second = Path(directory) / 'first.md', Path(directory) / 'second.md'
        first.write_text('# Future\nBody', encoding='utf-8-sig')
        os.utime(first, (2100000000, 2100000000))
        with patch.object(site, 'KNOWLEDGE_DIR', directory), patch.object(site, '_docs_cache', None), patch.object(site, '_cache_signature', None), patch.object(site, '_file_cache', {}):
            assert len(site.get_all_docs()) == 1
            assert site.get_all_docs()[0]['title'] == 'Future'
            assert '# Future' not in site.get_all_docs()[0]['html']
            second.write_text('# Added\nBody', encoding='utf-8')
            assert len(site.get_all_docs()) == 2
            second.write_text('# Changed\nUpdated body', encoding='utf-8')
            assert any(d['title'] == 'Changed' for d in site.get_all_docs())
            second.rename(Path(directory) / 'renamed.md')
            assert {d['slug'] for d in site.get_all_docs()} == {'first', 'renamed'}
            (Path(directory) / 'renamed.md').unlink()
            assert len(site.get_all_docs()) == 1

    with tempfile.TemporaryDirectory() as directory:
        folder = Path(directory) / 'programming'
        folder.mkdir()
        (folder / 'body.md').write_text('# Neutral\n\nHidden **needle** 日本語 &lt;unsafe&gt;\n\n```python\nprint(123)\n```', encoding='utf-8')
        (Path(directory) / 'title.md').write_text('# Needle\nOther text', encoding='utf-8')
        with patch.object(site, 'KNOWLEDGE_DIR', directory), patch.object(site, '_docs_cache', None), patch.object(site, '_cache_signature', None), patch.object(site, '_file_cache', {}), site.app.test_client() as client:
            data = client.get('/api/search?q=needle').json
            assert data['total'] == 2 and data['results'][0]['slug'] == 'title'
            data = client.get('/api/search', query_string={'q': '日本語 needle', 'domain': 'programming'}).json
            assert data['total'] == 1 and '<unsafe>' in data['results'][0]['snippet']
            assert client.get('/api/search?q=print').json['total'] == 1
            assert client.get('/api/search?q=needle&domain=other').json['total'] == 1
            assert client.get('/api/search?q=absent').json['total'] == 0
            assert client.get('/api/search?domain=invalid').status_code == 400
            (folder / 'body.md').write_text('# Neutral\nReplacement content', encoding='utf-8')
            assert client.get('/api/search?q=needle').json['total'] == 1


    with tempfile.TemporaryDirectory() as directory:
        folder = Path(directory) / 'topic'
        folder.mkdir()
        (folder / 'main.md').write_text('# Main\n[Other](other.md#part) [External](https://example.com/doc/fake)\n```\n[Code](ghost.md)\n```', encoding='utf-8')
        (folder / 'other.md').write_text('# Other\n## Part\nA **plain** excerpt', encoding='utf-8')
        (folder / 'back.md').write_text('# Back\n[Main](main.md)', encoding='utf-8')
        (folder / 'copy.md').write_text('# Main\nDuplicate', encoding='utf-8')
        with patch.object(site, 'KNOWLEDGE_DIR', directory), patch.object(site, '_docs_cache', None), patch.object(site, '_cache_signature', None), patch.object(site, '_file_cache', {}), site.app.test_client() as client:
            docs = site.get_all_docs()
            current = next(d for d in docs if d['slug'] == 'topic/main')
            assert current['links'] == {'topic/other'}
            related = site.related_notes(current, docs)
            assert [item['doc']['slug'] for item in related] == ['topic/other', 'topic/back']
            response = client.get('/api/preview/topic/other')
            assert response.status_code == 200 and 'A plain excerpt' in response.json['excerpt']
            assert 'html' not in response.json
            assert client.get('/api/preview/missing').status_code == 404
            assert 'related-notes' in client.get('/doc/topic/main').get_data(as_text=True)
            (folder / 'other.md').write_text('# Updated\nNew excerpt', encoding='utf-8')
            assert client.get('/api/preview/topic/other').json['title'] == 'Updated'
            (folder / 'other.md').unlink()
            assert client.get('/api/preview/topic/other').status_code == 404


def main():
    with patch.dict(os.environ, {'PORT': '8765'}):
        production = runpy.run_path('gunicorn.conf.py')
    assert production['bind'] == '0.0.0.0:8765'
    assert production['workers'] == 1
    from unittest.mock import Mock
    with patch.object(site, 'get_all_docs', return_value=[{}]) as load:
        production['post_worker_init'](Mock())
        load.assert_called_once_with()
    with patch.object(site, 'get_all_docs', side_effect=AssertionError('Health must not scan')):
        with site.app.test_client() as client:
            health = client.get('/healthz')
            assert health.status_code == 200 and health.json == {'status': 'ok'}
            assert health.headers['Cache-Control'] == 'no-store'
    regressions()
    docs = site.get_all_docs()
    expected = len(list(Path(site.KNOWLEDGE_DIR).rglob('*.md')))
    assert len(docs) == expected
    slugs = {d['slug'] for d in docs}
    duplicate_titles = sum(count > 1 for count in Counter(d['title'] for d in docs).values())
    leftover, broken_rendered, source_broken, duplicate_ids = [], [], [], []
    for doc in docs:
        parsed = Links()
        parsed.feed(doc['html'])
        if len(parsed.ids) != len(set(parsed.ids)):
            duplicate_ids.append(doc['slug'])
        for href in parsed.hrefs:
            target = unquote(urlsplit(href).path)
            if target.endswith('.md') and not urlsplit(href).scheme:
                leftover.append([doc['slug'], href])
            if target.startswith('/doc/') and target[5:] not in slugs:
                broken_rendered.append([doc['slug'], href])
        path = Path(site.KNOWLEDGE_DIR) / doc['relativePath']
        content = frontmatter.loads(path.read_text(encoding='utf-8')).content
        # Markdown renders fenced code as escaped text, so code samples cannot become audit links.
        raw = Links()
        raw.feed(markdown.markdown(content, extensions=['fenced_code', 'tables']))
        for href in raw.hrefs:
            parts = urlsplit(href)
            target = unquote(parts.path)
            if parts.scheme or parts.netloc or not target.endswith('.md'):
                continue
            resolved = posixpath.normpath(posixpath.join(posixpath.dirname(doc['slug']), target))[:-3]
            if resolved not in slugs:
                source_broken.append([doc['slug'], href, resolved])
    with site.app.test_client() as client:
        assert client.get('/').status_code == 200
        response = client.get('/api/search.json')
        assert response.status_code == 200 and len(response.json) == expected
        assert client.get('/doc/does-not-exist').status_code == 404
        assert client.get('/?category=does-not-exist').status_code == 404
        for category in site.build_categories(docs):
            assert client.get('/', query_string={'category': category}).status_code == 200
        assert client.get('/?page=2&sort=recent').status_code == 200
        assert client.get('/?page=not-a-number').status_code == 200
        for doc in docs[::max(1, len(docs)//12)]:
            response = client.get('/doc/' + doc['slug'])
            assert response.status_code == 200
        for asset in ['/static/css/style.css', '/static/js/site.js', '/favicon.svg']:
            assert client.get(asset).status_code == 200
        homepage = client.get('/').get_data(as_text=True)
        assert 'fonts.googleapis.com' not in homepage
    report = {'documents': len(docs), 'duplicate_title_groups': duplicate_titles,
              'leftover_md_links': leftover, 'broken_rendered_links': broken_rendered,
              'broken_source_links': source_broken, 'duplicate_heading_id_docs': duplicate_ids}
    report_path = Path(tempfile.gettempdir()) / 'chishiki-audit.json'
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({key: len(value) if isinstance(value, list) else value for key, value in report.items()}))
    print('Detailed audit: ' + str(report_path))
    assert not leftover, 'Local .md links were not rewritten'
    assert not duplicate_ids, 'Duplicate HTML heading ids'
    assert not broken_rendered, 'Rendered document links point to missing notes'
    assert not source_broken, 'Relative Markdown links point to missing notes'
    # Duplicate titles are preserved across the two user-owned vaults and identified by path.
    print('PASS: routes, categories, pagination, assets, Markdown links and cache regressions')


if __name__ == '__main__':
    main()
