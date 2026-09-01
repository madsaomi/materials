# 知 · Chishiki Knowledge Base

A minimalist, modern, Japanese Wabi-Sabi aesthetic knowledge base built with Astro, reading markdown files directly from the parent `knowledge/` directory.

## 🌿 Design & Philosophy
- **Aesthetic**: Wabi-Sabi simplicity featuring warm washi paper backgrounds (`#f7f5f0`), charcoal typography (`#2b2b2b`), generous whitespace, and subtle ink borders.
- **Features**: Recursive file tree navigation, instant client-side fuzzy search, mobile responsive drawer, and clean markdown rendering.

---

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:4321`.

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview the production build:
   ```bash
   npm run preview
   ```

---

## ☁️ Deployment Instructions

### Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Configure project settings:
   - **Root Directory**: `site`
   - **Framework Preset**: Astro
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Vercel will automatically build and serve your static Japanese minimalist site.

### Deploying to Railway

1. Install the Railway CLI or connect your GitHub repository in the Railway dashboard.
2. Set the root directory / working directory to `site/`.
3. Railway will detect Node.js and use the following build & start commands:
   - **Build Command**: `npm run build`
   - **Start Command**: `npx serve dist` (or output static files via static hosting / Node server).
   *(Alternatively, use Railway Static Hosting pointed to the `site/dist` directory).*

---

## 🧞 Commands Reference

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build static production site to `site/dist/` |
| `npm run preview` | Preview production build locally |
