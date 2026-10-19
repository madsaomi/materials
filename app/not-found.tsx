import { Shell } from "../components/shell";
export default function NotFound() {
  return (
    <Shell>
      <section className="empty-state glass">
        <h1>Заметка не найдена</h1>
        <p>Проверьте адрес или найдите материал в библиотеке.</p>
        <a className="pill-button" href="/">
          Открыть библиотеку
        </a>
      </section>
    </Shell>
  );
}
