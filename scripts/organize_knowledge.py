"""One-time, reversible folder migration. Run --check before --apply."""
import argparse
import json
import os
import posixpath
import re
import sys
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import frontmatter
from catalog import LEVELS, folder_label, subject_for_path


def heading_slug(text):
    text = re.sub(r'[^\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af-]', '', text.lower())
    return re.sub(r'-+', '-', re.sub(r'[\s_]+', '-', text)).strip('-') or 'section'


def destination(rel, posts):
    mirrored = rel.startswith('knowledge/')
    local = rel.removeprefix('knowledge/')
    parts = local.split('/')
    subject = subject_for_path(local)
    prefix = subject.split('/') if subject != 'overview' else []
    tail = parts[len(prefix):]
    unit = re.search(r'(?:^|/)unit-(\d+)(?:/|$)', local)
    level = 'reference'
    if parts[0] == 'languages' and unit:
        overview = re.sub(r'(unit-\d+)/.*', r'\1/overview.md', rel)
        counterpart = overview.removeprefix('knowledge/') if mirrored else 'knowledge/' + overview
        metadata = posts.get(overview) or posts.get(counterpart)
        level = str(metadata.metadata.get('level', '')).lower() if metadata else ''
        if level not in LEVELS:
            level = 'a1' if int(unit[1]) <= 5 else 'a2' if int(unit[1]) <= 10 else 'b1'
        tail = [part for part in tail if part != 'units']
    elif unit:
        level = 'foundation' if int(unit[1]) == 1 else 'practice' if int(unit[1]) == 2 else 'advanced'
    elif parts[0] == 'languages':
        heading = next(iter(re.findall(r'^#\s+(.+)', posts[rel].content, re.M)), '')
        found = set(re.findall(r'\b(A1|A2|B1|B2|C1|C2)\b', heading))
        if len(found) == 1:
            level = found.pop().lower()
    elif parts[0] == 'mnemonics':
        if any(part in ('beyond-catalog.md', 'verbatim-mastery.md') for part in parts):
            level = 'advanced'
        elif any(part in ('foundations', 'core-techniques') for part in parts):
            level = 'foundation'
        elif any(part in ('practical-domains', 'languages-integration') for part in parts):
            level = 'practice'
    elif parts[0] == 'programming' and 'projects' in parts:
        level = 'practice'
    elif parts[0] == 'books':
        level = 'practice' if 'notes' in parts else 'foundation' if 'read' in parts or 'genre' in parts else 'reference'
    elif parts[0] == 'tools':
        level = 'foundation' if parts[-1] == 'setup.md' else 'practice' if 'guides' in parts else 'advanced'
    if parts[0] == 'philosophy' and 'units' in parts:
        level = 'advanced'
    return ('knowledge/' if mirrored else '') + '/'.join([subject, level] + tail)


def rewrite(text, old, new, mapping):
    old_dir = posixpath.dirname(old)
    new_dir = posixpath.dirname(new)
    fence = None
    heading_counts = {}
    output = []

    def link(match):
        raw = match['target']
        target = raw.strip('<>')
        parsed = urlsplit(target)
        if parsed.scheme or parsed.netloc or target.startswith(('#', '/')):
            return match[0]
        resolved = posixpath.normpath(posixpath.join(old_dir, unquote(parsed.path)))
        if resolved in mapping:
            moved = mapping[resolved]
        elif (ROOT / 'knowledge' / resolved).is_file():
            moved = resolved  # Attachments stay in place.
        else:
            return match[0]
        replacement = posixpath.relpath(moved, new_dir)
        replacement = quote(replacement, safe='/._-') if '%' in parsed.path else replacement
        if parsed.query:
            replacement += '?' + parsed.query
        if parsed.fragment:
            replacement += '#' + parsed.fragment
        if raw.startswith('<'):
            replacement = '<' + replacement + '>'
        return match['prefix'] + replacement

    pattern = re.compile(r'(?P<prefix>\]\(|^\s*\[[^\]\n]+\]:\s*|href=["\'])(?P<target><[^>]+>|[^\s)"\'>]+)', re.M)
    first_h1 = False
    source_lines = text.splitlines()
    for index, line in enumerate(source_lines):
        boundary = re.match(r'^\s{0,3}(`{3,}|~{3,})(.*)$', line)
        if boundary:
            if fence is None:
                # Python-Markdown leaves an unmatched final fence as normal
                # text, so its links still need relocation.
                closing = re.compile(r'^\s{0,3}' + re.escape(boundary[1]) + r'\s*$')
                if any(closing.match(later) for later in source_lines[index + 1:]):
                    fence = boundary[1]
            elif boundary[1][0] == fence[0] and len(boundary[1]) >= len(fence) and not boundary[2].strip():
                fence = None
            output.append(line)
            continue
        if fence:
            output.append(line)
            continue
        changed = pattern.sub(link, line)
        heading = re.match(r'^(#{1,3})\s+(.+)$', line)
        if heading:
            if len(heading[1]) == 1 and not first_h1:
                first_h1 = True
            else:
                base = heading_slug(heading[2].strip())
                occurrence = heading_counts.get(base, 0)
                old_id = base + (f'-{occurrence}' if occurrence else '')
                heading_counts[base] = occurrence + 1
                if changed != line:
                    # Raw link text currently participates in app.py's slug; keep
                    # the historical fragment for existing links and bookmarks.
                    output.extend([f'<a id="{old_id}"></a>', ''])
        output.append(changed)
    return '\n'.join(output) + ('\n' if text.endswith('\n') else '')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--backup-dir', type=Path)
    args = parser.parse_args()
    knowledge = ROOT / 'knowledge'
    paths = sorted(path for path in knowledge.rglob('*.md') if not any(part.startswith('.') for part in path.relative_to(knowledge).parts))
    texts = {path.relative_to(knowledge).as_posix(): path.read_text(encoding='utf-8-sig') for path in paths}
    assert not (ROOT / 'legacy_paths.json').exists(), 'Migration already recorded; do not rerun.'
    posts = {rel: frontmatter.loads(text) for rel, text in texts.items()}
    mapping = {rel: destination(rel, posts) for rel in texts}
    assert len(set(mapping.values())) == len(mapping), 'Destination collision'
    for old, new in mapping.items():
        src, dst = (knowledge / old).resolve(), (knowledge / new).resolve()
        assert src.is_relative_to(knowledge.resolve()) and dst.is_relative_to(knowledge.resolve())
        assert not dst.exists(), f'Destination exists: {new}'
    rewritten = {mapping[old]: rewrite(text, old, mapping[old], mapping) for old, text in texts.items()}
    folders = set()
    for target in rewritten:
        parent = posixpath.dirname(target)
        subject = subject_for_path(target)
        vault = 'knowledge/' if target.startswith('knowledge/') else ''
        folders.add(vault + subject)
        folders.add(vault + subject + '/' + next(part for part in target.split('/') if part in LEVELS))
    folders.update(['languages', 'programming', 'philosophy', 'practices', 'knowledge/languages'])
    generated = {}
    for folder in sorted(folders):
        children = sorted(path for path in rewritten if path.startswith(folder + '/'))
        if not children:
            continue
        label = ' / '.join(folder_label(part) for part in folder.removeprefix('knowledge/').split('/'))
        edition = 'Дополнительное хранилище' if folder.startswith('knowledge/') else 'Основная библиотека'
        lines = [f'# Содержание: {label} — {edition}', '',
                 'Материалы раздела собраны по папкам. Откройте нужный урок или справочник.', '']
        if folder.rsplit('/', 1)[-1] in ('a1', 'a2', 'b1', 'b2', 'c1', 'c2'):
            lines.extend(['Уровень отражает организацию текущих материалов и авторские пометки; это не подтверждение полного покрытия CEFR или эквивалентности экзаменам HSK, JLPT и TOPIK.', ''])
        last_group = None
        for target in children:
            local = posixpath.relpath(target, folder)
            group = posixpath.dirname(local) or 'Материалы'
            if group != last_group:
                lines.extend(['', '## ' + ' / '.join(folder_label(part) for part in group.split('/')), ''])
                last_group = group
            old = next(key for key, value in mapping.items() if value == target)
            title = posts[old].metadata.get('title') or next(iter(re.findall(r'^#\s+(.+)', posts[old].content, re.M)), Path(target).stem)
            lines.append(f'- [{title.replace("[", "").replace("]", "")}]({local})')
        generated[folder + '/_contents.md'] = '\n'.join(lines) + '\n'
    manifest = {'version': 1, 'documents_before': len(texts), 'generated_contents': len(generated),
                'paths': {old[:-3]: new[:-3] for old, new in mapping.items()}}
    if args.apply:
        assert args.backup_dir, '--backup-dir is required with --apply'
        backup = args.backup_dir.resolve()
        assert not backup.is_relative_to(knowledge.resolve()), 'Backup must be outside knowledge'
        # Before-images live outside knowledge so they cannot enter the catalog.
        backup.mkdir(exist_ok=False)
        for old, text in texts.items():
            target = backup / old
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes((knowledge / old).read_bytes())
        for old, new in mapping.items():
            destination_path = knowledge / new
            destination_path.parent.mkdir(parents=True, exist_ok=True)
            (knowledge / old).rename(destination_path)
            destination_path.write_text(rewritten[new], encoding='utf-8', newline='\n')
        for rel, text in generated.items():
            target = knowledge / rel
            assert not target.exists()
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(text, encoding='utf-8', newline='\n')
        (ROOT / 'legacy_paths.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
        for folder in sorted((path for path in knowledge.rglob('*') if path.is_dir()), key=lambda path: len(path.parts), reverse=True):
            if any(part.startswith('.') for part in folder.relative_to(knowledge).parts):
                continue
            assert folder.resolve().is_relative_to(knowledge.resolve())
            if not any(folder.iterdir()):
                folder.rmdir()  # Empty directories only; never recursive deletion.
    print(json.dumps({'mode': 'apply' if args.apply else 'check', 'moved_notes': len(mapping), 'contents_pages': len(generated),
                      'levels': sorted({part for path in mapping.values() for part in path.split('/') if part in LEVELS})}))


if __name__ == '__main__':
    main()
