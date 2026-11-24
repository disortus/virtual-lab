import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <strong className="mono">VIRTUAL SCIENCE LAB</strong> — Don&apos;t just learn science. Discover it. · ITFest 2026 Beta
        </div>
        <div className="site-footer__links">
          <Link to="/labs">Каталог лабораторий</Link>
          <Link to="/labs/physics">Физические эксперименты</Link>
          <Link to="/reports">Отчёты</Link>
        </div>
      </div>
    </footer>
  );
}
