import os
import shutil
import sys

PROVENANCE = "<!-- session034-chinese-reference: provenance retained (unfinished warnings preserved) -->"

roots = [
  os.path.join(os.getcwd(), 'knowledge/languages/chinese/reference/vocabulary'),
  os.path.join(os.getcwd(), 'knowledge/knowledge/languages/chinese/reference/vocabulary'),
]

backup_root = os.path.expanduser(r'~/.codex/visualizations/2026/10/19/session034-chinese-reference/')

def walk(dirpath):
    results = []
    try:
        for dp, _, fns in os.walk(dirpath):
            for fn in fns:
                if fn.endswith('.md'):
                    results.append(os.path.join(dp, fn))
    except Exception:
        pass
    return results

def backup_file(src):
    rel = os.path.relpath(src, os.getcwd())
    dest = os.path.join(backup_root, rel.replace(os.sep, '__').replace('/', '__'))
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copy2(src, dest)

def ensure_prov(txt):
    if 'session034-chinese-reference' in txt:
        return txt, False
    lines = txt.splitlines(True)  # keep endings
    # if starts with #
    if lines and lines[0].startswith('#'):
        # find insert point after heading + blanks
        idx = 1
        while idx < len(lines) and lines[idx].strip() == '':
            idx += 1
        # insert
        lines.insert(idx, PROVENANCE + '\n')
        return ''.join(lines), True
    else:
        return PROVENANCE + '\n\n' + txt, True

def main():
    os.makedirs(backup_root, exist_ok=True)
    files = []
    for r in roots:
        files.extend(walk(r))
    # filter unfinished
    unfinished_files = []
    total_unfin = 0
    for f in files:
        try:
            with open(f, encoding='utf-8') as fh:
                t = fh.read()
            c = t.count('не проверено') + t.count('не заполнено')
            if c > 0:
                unfinished_files.append((f, c, t))
                total_unfin += c
        except Exception:
            pass
    print(f'Unfinished entries: {total_unfin} across {len(unfinished_files)} files (both vaults)')
    for f, c, _ in unfinished_files:
        print(f'  {c}\t{os.path.relpath(f, os.getcwd())}')
    if len(sys.argv) > 1 and sys.argv[1] == '--apply':
        print(f'\n[APPLY] Backing up to {backup_root}')
        modified = 0
        for f, c, t in unfinished_files:
            backup_file(f)
            newt, changed = ensure_prov(t)
            if changed:
                with open(f, 'w', encoding='utf-8') as fh:
                    fh.write(newt)
                modified += 1
                print(f'  Modified: {os.path.relpath(f, os.getcwd())}')
            else:
                print(f'  Backed up (no header change): {os.path.relpath(f, os.getcwd())}')
        print(f'\n[APPLY] Backed up {len(unfinished_files)} files, modified {modified} files. Unfinished warnings preserved.')
    else:
        print('\n[CHECK] No changes made. Run with --apply to backup and process.')

if __name__ == '__main__':
    main()
