import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const KNOWLEDGE_DIR = path.resolve(process.cwd(), 'knowledge');

let _cache = null;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uac00-\ud7af]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
      const relativePath = path.join(base, file).replace(/\\/g, '/');
      
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(filePath, relativePath));
      } else if (file.endsWith('.md')) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        const slug = relativePath.replace(/\.md$/, '');
        
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

        // Parse markdown, extract ToC, strip first H1
        const tokens = marked.lexer(content);
        const toc = [];
        let h1Found = false;
        let cleanContent = content;

        tokens.forEach(token => {
          if (token.type === 'heading') {
            if (token.depth === 1 && !h1Found) {
              h1Found = true;
              cleanContent = content.replace(/^#\s+.+$/m, '').trim();
            } else if (token.depth >= 2 && token.depth <= 3) {
              const id = slugify(token.text);
              toc.push({ level: token.depth, text: token.text, id });
            }
          }
        });

        const html = marked.parse(cleanContent);

        // Inject IDs into h2/h3 in generated HTML
        let htmlWithIds = html;
        toc.forEach(t => {
          const tag = `h${t.level}`;
          const escaped = t.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          htmlWithIds = htmlWithIds.replace(
            new RegExp(`<${tag}>([^<]*)<\\/${tag}>`),
            `<${tag} id="${t.id}">$1</${tag}>`
          );
        });

        // Reading time calculation
        const plainText = cleanContent.replace(/[#*`_\[\]()>-]/g, '');
        const words = plainText.trim().split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(words / 200));

        results.push({
          slug,
          title,
          category,
          relativePath,
          data,
          content: cleanContent,
          toc,
          html: htmlWithIds,
          readingTime
        });
      }
    });
    
    return results;
  }

  const result = walk(KNOWLEDGE_DIR);
  _cache = result;
  return result;
}

export function getDocBySlug(slug) {
  const docs = getAllDocs();
  return docs.find(d => d.slug === slug);
}
