"""Refresh existing _contents.md pages after adding or reorganizing notes."""
import re
import sys
from pathlib import Path
import posixpath
import frontmatter

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from catalog import folder_label, note_order, LEVELS

MATERIALS = {'overview': 'Обзор урока', 'dialogue': 'Диалог', 'core': 'Грамматика',
             'usage': 'Применение грамматики', 'words': 'Словарь', 'exercises': 'Упражнения',
             'reading': 'Чтение', 'test': 'Проверка знаний'}


def main():
    knowledge = ROOT / 'knowledge'
    notes = []
    for path in sorted(knowledge.rglob('*.md')):
        if path.name == '_contents.md' or any(part.startswith('.') for part in path.relative_to(knowledge).parts):
            continue
        post = frontmatter.loads(path.read_text(encoding='utf-8-sig'))
        title = post.metadata.get('title') or next(iter(re.findall(r'^#\s+(.+)', post.content, re.M)), path.stem)
        notes.append({'slug': path.relative_to(knowledge).as_posix()[:-3], 'title': title})
    count = 0
    for path in knowledge.rglob('_contents.md'):
        # Authored study handbooks are maintained as lessons, not generated lists.
        if frontmatter.loads(path.read_text(encoding='utf-8')).metadata.get('editorial') == 'manual':
            continue
        folder = path.parent.relative_to(knowledge).as_posix()
        label = ' / '.join(folder_label(part) for part in folder.removeprefix('knowledge/').split('/'))
        edition = 'Дополнительное хранилище' if folder.startswith('knowledge/') else 'Основная библиотека'
        route = ('Сначала объяснение и разобранный код, затем самостоятельная практика; '
                 'готовое решение открывайте после своей попытки.' if folder.removeprefix('knowledge/').startswith('programming')
                 else 'Выберите урок или материал. Внутри урока рекомендуемый порядок: обзор → диалог → грамматика → словарь → упражнения → чтение → проверка знаний.')
        lines = [f'# Содержание: {label} — {edition}', '', route, '']
        if folder.rsplit('/', 1)[-1] in ('a1', 'a2', 'b1', 'b2', 'c1', 'c2'):
            lines.extend(['Уровень отражает организацию текущих материалов и авторские пометки; это не подтверждение полного покрытия CEFR или эквивалентности экзаменам HSK, JLPT и TOPIK.', ''])
        groups = {}
        for note in notes:
            if not note['slug'].startswith(folder + '/'):
                continue
            relative = posixpath.relpath(note['slug'], folder)
            parts = relative.split('/')
            if parts[0] in ('a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'foundation', 'practice', 'advanced', 'reference'):
                group = '/'.join(parts[:2]) if len(parts) > 2 else parts[0]
            else:
                group = parts[0] if len(parts) > 1 else ''
            groups.setdefault(group, []).append(note)
        level_order = {level: index for index, level in enumerate(LEVELS)}
        for group, entries in sorted(groups.items(), key=lambda item: (level_order.get(item[0].split('/')[0], 20), item[0])):
            lines.extend(['', '## ' + (' / '.join(folder_label(part) for part in group.split('/')) if group else 'Материалы'), ''])
            for note in sorted(entries, key=note_order):
                relative = posixpath.relpath(note['slug'] + '.md', folder)
                name = MATERIALS.get(Path(relative).stem, note['title']) if re.search(r'/unit-\d+/', '/' + relative) else note['title']
                lines.append(f'- [{name.replace("[", "").replace("]", "")}]({relative})')
        path.write_text('\n'.join(lines) + '\n', encoding='utf-8', newline='\n')
        count += 1
    print(f'Contents refreshed: {count}')


if __name__ == '__main__':
    main()
