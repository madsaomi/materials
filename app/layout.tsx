import type { ReactNode } from "react";
import Script from "next/script";
export const metadata = {
  title: "Chishiki · Библиотека",
  description: "Личная библиотека заметок. Языки, идеи и знания в одном месте.",
  icons: { icon: "/favicon.svg" },
};
const preferences = `try { const v=localStorage.getItem('catalogView'); document.documentElement.dataset.catalogView=['list','cards','table'].includes(v)?v:'list'; const t=localStorage.getItem('theme'); document.documentElement.classList.toggle('dark',t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)); document.documentElement.dataset.font=localStorage.getItem('docFont')||'sans'; }catch(_) {}`;
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#e9ece9" />
        <script dangerouslySetInnerHTML={{ __html: preferences }} />
        <link rel="stylesheet" href="/static/css/style.css" />
        <link rel="stylesheet" href="/static/css/highlight.css" />
      </head>
      <body className="reading-shell quiet-library">
        {children}
        <Script src="/static/js/site.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
