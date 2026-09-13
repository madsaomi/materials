#!/usr/bin/env python3
"""
📦 Knowledge Vault → Anki Exporter
===================================
Экспортирует словарные таблицы из Markdown-файлов хранилища
в готовые колоды Anki (.apkg / .txt для импорта).

Использование:
  python export_to_anki.py                           # Экспорт всех языков
  python export_to_anki.py --lang japanese            # Только японский
  python export_to_anki.py --lang korean --unit 5     # Корейский, юнит 5
  python export_to_anki.py --format apkg              # Формат .apkg (нужна библиотека genanki)
  python export_to_anki.py --format tsv               # Формат .tsv для ручного импорта

Форматы вывода:
  tsv   — Tab-separated файл для импорта в Anki (по умолчанию)
  apkg  — Готовая колода Anki (требуется: pip install genanki)
"""

import argparse
import csv
import hashlib
import os
import re
import sys
from pathlib import Path
from datetime import datetime

# Корень хранилища — относительно расположения скрипта
VAULT_ROOT = Path(__file__).resolve().parent.parent

LANGUAGES = {
    "english":  {"name": "English",  "flag": "🇬🇧"},
    "japanese": {"name": "Japanese", "flag": "🇯🇵"},
    "chinese":  {"name": "Chinese",  "flag": "🇨🇳"},
    "korean":   {"name": "Korean",   "flag": "🇰🇷"},
}


def parse_md_table(filepath: Path) -> list[dict]:
    """Парсит Markdown-таблицу и возвращает список словарей {header: value}."""
    text = filepath.read_text(encoding="utf-8")
    lines = text.splitlines()

    rows = []
    header = None
    for line in lines:
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.split("|")[1:-1]]
        if not cells:
            continue

        # Пропускаем строку-разделитель (|---|---|)
        if all(re.match(r"^[-:]+$", c) for c in cells):
            continue

        if header is None:
            header = cells
        else:
            row = {}
            for i, h in enumerate(header):
                row[h] = cells[i] if i < len(cells) else ""
            rows.append(row)

    return rows


def find_vocab_files(lang: str, unit: int | None = None) -> list[Path]:
    """Находит все файлы словарей для указанного языка."""
    lang_dir = VAULT_ROOT / "languages" / lang

    files = []
    # Основные словари
    vocab_dir = lang_dir / "vocabulary"
    if vocab_dir.exists():
        files.extend(sorted(vocab_dir.glob("*.md")))

    # Словари по юнитам
    units_dir = lang_dir / "units"
    if units_dir.exists():
        for unit_dir in sorted(units_dir.iterdir()):
            if not unit_dir.is_dir():
                continue
            if unit is not None:
                unit_num = re.search(r"(\d+)", unit_dir.name)
                if unit_num and int(unit_num.group(1)) != unit:
                    continue
            unit_vocab = unit_dir / "vocabulary"
            if unit_vocab.exists():
                files.extend(sorted(unit_vocab.glob("*.md")))

    return files


def guess_card_fields(row: dict, lang: str) -> tuple[str, str, str]:
    """
    Угадывает front/back/reading из строки таблицы.
    Возвращает (front, back, extra).
    """
    keys_lower = {k.lower(): k for k in row}

    # Front: слово на целевом языке
    front_candidates = ["word", "слово", "단어", "単語", "词", "漢字", "kanji",
                        "expression", "idiom", "成语", "관용구", "慣用句",
                        "term", "phrase", "slang"]
    front = ""
    for fc in front_candidates:
        for kl, korig in keys_lower.items():
            if fc in kl:
                front = row[korig]
                break
        if front:
            break

    # Back: перевод / значение
    back_candidates = ["meaning", "значение", "translation", "перевод",
                       "definition", "english", "русский", "뜻", "意味", "释义"]
    back = ""
    for bc in back_candidates:
        for kl, korig in keys_lower.items():
            if bc in kl:
                back = row[korig]
                break
        if back:
            break

    # Extra: чтение / произношение
    extra_candidates = ["reading", "чтение", "pronunciation", "произношение",
                        "pinyin", "пиньинь", "romaji", "ромадзи", "romanization",
                        "발음", "読み方", "拼音", "furigana"]
    extra = ""
    for ec in extra_candidates:
        for kl, korig in keys_lower.items():
            if ec in kl:
                extra = row[korig]
                break
        if extra:
            break

    # Если не нашли — используем первые 2-3 колонки
    if not front and not back:
        values = list(row.values())
        if len(values) >= 2:
            front = values[0]
            back = values[1]
        if len(values) >= 3 and not extra:
            extra = values[2]

    return front, back, extra


def stable_id(text: str) -> int:
    """Генерирует стабильный числовой ID из текста для Anki."""
    h = hashlib.md5(text.encode("utf-8")).hexdigest()
    return int(h[:10], 16)


def export_tsv(cards: list[dict], output_path: Path):
    """Экспортирует карточки в TSV-файл для импорта в Anki."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, delimiter="\t")
        # Заголовок (комментарий для Anki)
        f.write(f"# Exported from Knowledge Vault — {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
        f.write("# separator:tab\n")
        f.write("# columns:Front\tBack\tExtra\tTags\n")
        for card in cards:
            writer.writerow([
                card["front"],
                card["back"],
                card.get("extra", ""),
                card.get("tags", ""),
            ])
    print(f"  ✅ TSV: {output_path}  ({len(cards)} cards)")


def export_apkg(cards: list[dict], deck_name: str, output_path: Path):
    """Экспортирует карточки в .apkg (нужна библиотека genanki)."""
    try:
        import genanki
    except ImportError:
        print("  ⚠️  Для экспорта в .apkg установите: pip install genanki")
        print("  ℹ️  Экспортирую в TSV вместо .apkg...")
        tsv_path = output_path.with_suffix(".txt")
        export_tsv(cards, tsv_path)
        return

    model = genanki.Model(
        model_id=1607392319,
        name="Knowledge Vault Card",
        fields=[
            {"name": "Front"},
            {"name": "Back"},
            {"name": "Extra"},
        ],
        templates=[{
            "name": "Card 1",
            "qfmt": "<div class='front'>{{Front}}</div>",
            "afmt": """
                <div class='front'>{{Front}}</div>
                <hr>
                <div class='back'>{{Back}}</div>
                {{#Extra}}<div class='extra'>{{Extra}}</div>{{/Extra}}
            """,
        }],
        css="""
            .card { font-family: 'Noto Sans', 'Noto Sans JP', 'Noto Sans KR', sans-serif;
                    font-size: 22px; text-align: center; color: #e0e0e0;
                    background: #1a1a2e; padding: 20px; }
            .front { font-size: 32px; font-weight: bold; color: #e94560; margin: 16px 0; }
            .back  { font-size: 24px; color: #0f3460; }
            .extra { font-size: 18px; color: #888; margin-top: 12px; font-style: italic; }
        """,
    )

    deck = genanki.Deck(deck_id=stable_id(deck_name), name=deck_name)
    for card in cards:
        note = genanki.Note(
            model=model,
            fields=[card["front"], card["back"], card.get("extra", "")],
            tags=card.get("tags", "").split(),
        )
        deck.add_note(note)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    genanki.Package(deck).write_to_file(str(output_path))
    print(f"  ✅ APKG: {output_path}  ({len(cards)} cards)")


def process_language(lang: str, unit: int | None, fmt: str, output_dir: Path):
    """Обрабатывает один язык."""
    info = LANGUAGES[lang]
    print(f"\n{info['flag']}  {info['name']}")
    print("─" * 40)

    files = find_vocab_files(lang, unit)
    if not files:
        print("  ⚠️  Словарные файлы не найдены.")
        return

    all_cards = []

    for filepath in files:
        rows = parse_md_table(filepath)
        if not rows:
            continue

        rel = filepath.relative_to(VAULT_ROOT)
        # Формируем тег: language::source::file
        tag_parts = [lang]
        if "units" in str(rel):
            m = re.search(r"unit-(\d+)", str(rel))
            if m:
                tag_parts.append(f"unit-{m.group(1)}")
        tag_parts.append(filepath.stem)
        tag = "::".join(tag_parts)

        cards = []
        for row in rows:
            front, back, extra = guess_card_fields(row, lang)
            if not front or not back:
                continue
            # Фильтруем плейсхолдеры
            if re.match(r"^(word|語|詞|단어|词)\d+$", front, re.IGNORECASE):
                continue
            cards.append({
                "front": front.strip(),
                "back": back.strip(),
                "extra": extra.strip(),
                "tags": tag,
            })

        if cards:
            print(f"  📄 {rel}  →  {len(cards)} cards")
            all_cards.extend(cards)

    if not all_cards:
        print("  ⚠️  Нет валидных карточек для экспорта.")
        return

    print(f"\n  📊 Итого: {len(all_cards)} карточек")

    timestamp = datetime.now().strftime("%Y%m%d")
    if fmt == "apkg":
        out = output_dir / f"{lang}_vocab_{timestamp}.apkg"
        export_apkg(all_cards, f"Knowledge Vault :: {info['name']}", out)
    else:
        out = output_dir / f"{lang}_vocab_{timestamp}.txt"
        export_tsv(all_cards, out)


def main():
    parser = argparse.ArgumentParser(
        description="📦 Экспорт словарей Knowledge Vault → Anki",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--lang", "-l",
        choices=list(LANGUAGES.keys()),
        help="Экспортировать только указанный язык",
    )
    parser.add_argument(
        "--unit", "-u",
        type=int,
        help="Экспортировать только указанный юнит (1–15)",
    )
    parser.add_argument(
        "--format", "-f",
        choices=["tsv", "apkg"],
        default="tsv",
        dest="fmt",
        help="Формат вывода: tsv (по умолчанию) или apkg",
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=VAULT_ROOT / "exports",
        help="Директория для вывода (по умолчанию: <vault>/exports/)",
    )

    args = parser.parse_args()

    import sys
    sys.stdout.reconfigure(encoding="utf-8")

    print("╔══════════════════════════════════════════════╗")
    print("║   📦  Knowledge Vault → Anki Exporter       ║")
    print("╚══════════════════════════════════════════════╝")
    print(f"  Vault: {VAULT_ROOT}")
    print(f"  Output: {args.output}")
    print(f"  Format: {args.fmt}")

    langs = [args.lang] if args.lang else list(LANGUAGES.keys())

    for lang in langs:
        process_language(lang, args.unit, args.fmt, args.output)

    print("\n✨ Готово! Импортируйте файлы в Anki через File → Import.\n")


if __name__ == "__main__":
    main()
