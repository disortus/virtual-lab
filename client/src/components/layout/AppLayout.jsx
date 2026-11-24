import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';

export function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link visually-hidden">
        Перейти к основному содержанию
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
