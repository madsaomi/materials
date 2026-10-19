"""Shared physical-folder vocabulary for Obsidian and the Flask catalog."""
import re

LEVELS = {
    'a1': ('A1 · Начальный', 'Первые уроки и базовые навыки'),
    'a2': ('A2 · Базовый', 'Повседневные ситуации и развитие основ'),
    'b1': ('B1 · Средний', 'Самостоятельное применение изученного'),
    'b2': ('B2 · Выше среднего', 'Материалы с авторской пометкой B2'),
    'c1': ('C1 · Продвинутый', 'Материалы с авторской пометкой C1'),
    'c2': ('C2 · Свободное владение', 'Материалы с авторской пометкой C2'),
    'foundation': ('Основы', 'Вводные уроки и фундаментальные понятия'),
    'practice': ('Практика', 'Упражнения, применение и развитие навыков'),
    'advanced': ('Углубление', 'Продолжение курса и специальные темы'),
    'reference': ('Справочник', 'Общие материалы, планы и материалы нескольких уровней'),
}
NAMES = {
    'languages': 'Языки', 'english': 'Английский', 'chinese': 'Китайский',
    'japanese': 'Японский', 'korean': 'Корейский', 'programming': 'Программирование',
    'python': 'Python', 'go': 'Go', 'rust': 'Rust', 'javascript': 'JavaScript',
    'philosophy': 'Философия', 'eastern': 'Восточная философия', 'western': 'Западная философия',
    'practices': 'Практики', 'meditation': 'Медитация', 'yoga': 'Йога',
    'productivity': 'Продуктивность', 'journaling': 'Дневник', 'psychology': 'Психология',
    'books': 'Книги', 'tools': 'Инструменты', 'mnemonics': 'Мнемотехника',
    'overview': 'Обзор библиотеки', 'study-plans': 'Планы обучения', 'comparison': 'Сравнение языков',
    'core': 'Общие основы', 'grammar': 'Грамматика', 'vocabulary': 'Словарь',
    'exams': 'Экзамены', 'practice': 'Практика', 'reading': 'Чтение', 'writing': 'Письмо',
    'projects': 'Проекты', 'snippets': 'Примеры кода', 'algorithms': 'Алгоритмы',
    'patterns': 'Паттерны', 'foundations': 'Основы памяти', 'core-techniques': 'Техники памяти',
    'practical-domains': 'Прикладные задачи', 'languages-integration': 'Память и языки',
    'units': 'Уроки', 'guides': 'Руководства', 'genre': 'Жанры', 'notes': 'Конспекты',
    'read': 'Списки чтения', 'wishlist': 'Хочу прочитать',
}


def logical_path(path):
    return path.removeprefix('knowledge/')


def subject_for_path(path):
    parts = logical_path(path).split('/')
    if len(parts) == 1:
        return 'overview'
    if parts[0] in ('languages', 'programming', 'philosophy', 'practices') and len(parts) > 2:
        # A file directly under a domain/level is a general domain reference.
        return '/'.join(parts[:1] if parts[1] in LEVELS else parts[:2])
    return parts[0]


def folder_label(path):
    name = path.rsplit('/', 1)[-1]
    if not name:
        return 'Библиотека'
    if name in LEVELS:
        return LEVELS[name][0]
    unit = re.fullmatch(r'unit-(\d+)', name)
    if unit:
        return f'Урок {int(unit[1]):02d}'
    return NAMES.get(name, name.replace('-', ' ').capitalize())


def level_for_path(path):
    return next((part for part in logical_path(path).split('/')[:-1] if part in LEVELS), '')


def note_order(doc):
    path = logical_path(doc['slug'])
    unit = re.search(r'/unit-(\d+)/', path)
    name = path.rsplit('/', 1)[-1]
    order = {'_contents': 0, 'overview': 1, 'dialogue': 2, 'core': 3, 'syntax': 3, 'usage': 4,
             'words': 5, 'exercises': 6, 'practice': 6, 'reading': 7, 'test': 8}
    return (int(unit[1]) if unit else 0, order.get(name, 20), doc['title'].casefold(), doc['slug'])


def build_folder_tree(docs):
    nodes = {'': {'path': '', 'label': 'Библиотека', 'children': set(), 'files': [], 'notes': set(), 'contents': []}}
    variants = {}
    for doc in docs:
        key = logical_path(doc['slug'])
        variants.setdefault(key, []).append(doc)
    for key, copies in variants.items():
        copies.sort(key=lambda doc: (doc['slug'].startswith('knowledge/'), doc['slug']))
        representative = copies[0]
        parts = key.split('/')[:-1]
        parent = ''
        for part in parts:
            path = f'{parent}/{part}'.strip('/')
            nodes.setdefault(path, {'path': path, 'label': folder_label(path), 'children': set(), 'files': [], 'notes': set(), 'contents': []})
            nodes[parent]['children'].add(path)
            parent = path
        is_contents = key.rsplit('/', 1)[-1] == '_contents'
        if is_contents:
            nodes[parent]['contents'] = copies
        else:
            nodes[parent]['files'].append({'doc': representative, 'variants': copies[1:]})
            for depth in range(len(parts) + 1):
                nodes['/'.join(parts[:depth])]['notes'].add(key)
    level_order = {name: index for index, name in enumerate(LEVELS)}
    for node in nodes.values():
        node['children'] = sorted(node['children'], key=lambda path: (99 if path.rsplit('/', 1)[-1] == 'reference' else level_order.get(path.rsplit('/', 1)[-1], 20), folder_label(path).casefold()))
        node['files'].sort(key=lambda item: note_order(item['doc']))
        node['count'] = len(node['notes'])
    return nodes
