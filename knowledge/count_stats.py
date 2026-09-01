import os

root = 'C:/Users/~/Desktop/materials/knowledge'
total_lines = 0
total_files = 0

for r, ds, fs in os.walk(root):
    for f in fs:
        if f.endswith('.md'):
            total_files += 1
            fp = os.path.join(r, f)
            with open(fp, encoding='utf-8', errors='ignore') as file:
                total_lines += sum(1 for _ in file)

print(f"Total files: {total_files}")
print(f"Total lines: {total_lines}")
