import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const KNOWLEDGE_DIR = path.resolve(process.cwd(), 'knowledge');

let _cache = null;
let _cacheMtime = 0;

export function getAllDocs() {
  if (_cache) return _cache;
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    return [];
  }

  function walk(dir, base = '') {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      const relativePath = path.join(base, file);
      
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(filePath, relativePath));
      } else if (file.endsWith('.md')) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        // Generate slug (e.g., "languages/korean/core/index" -> "languages/korean/core/index")
        const slug = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');
        
        // Infer title from frontmatter, first H1, or filename
        let title = data.title;
        if (!title) {
          const h1Match = content.match(/^#\s+(.+)$/m);
          if (h1Match) {
            title = h1Match[1];
          } else {
            title = path.basename(file, '.md').replace(/-/g, ' ');
            title = title.charAt(0).toUpperCase() + title.slice(1);
          }
        }

        const parts = slug.split('/');
        let category = parts[0] || 'General';
        if (category === 'languages' && parts[1]) category = `languages / ${parts[1]}`;
        else if (category === 'mnemonics' && parts[1]) category = `mnemonics / ${parts[1]}`;

        function slugify(text) {
          return text
            .toLowerCase()
            .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }

        const toc = [];
        let html = marked.parse(content);
        html = html.replace(/<h([23])>(.*?)<\/h([23])>/g, (match, p1, p2) => {
          const plainText = p2.replace(/<[^>]*>/g, '');
          const id = slugify(plainText);
          toc.push({ level: parseInt(p1, 10), text: plainText, id });
          return `<h${p1} id="${id}">${p2}</h${p1}>`;
        });

        results.push({
          slug,
          title,
          category,
          relativePath,
          data,
          content,
          html,
          toc
        });
      }
    });
    
    return results;
  }

  const result = walk(KNOWLEDGE_DIR);
  _cache = result;
  _cacheMtime = Date.now();
  return result;
}

export function getDocBySlug(slug) {
  const docs = getAllDocs();
  return docs.find(d => d.slug === slug);
}
