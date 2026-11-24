import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LabLogoMark, MenuIcon } from '../ui/Icons.jsx';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-brand" onClick={closeMenu}>
          <LabLogoMark className="site-brand__mark" />
          <span>Virtual Science Lab</span>
          <span className="site-brand__tag">BETA</span>
        </Link>

        <button
          type="button"
          className="header-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <MenuIcon />
        </button>

        <nav
          id="primary-nav"
          aria-label="Основная навигация"
          className={`site-nav ${menuOpen ? 'is-open' : ''}`}
        >
          <ul className="site-nav__list">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}
                onClick={closeMenu}
              >
                Главная
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/labs"
                end
                className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}
                onClick={closeMenu}
              >
                Лаборатории
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/labs/physics"
                className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}
                onClick={closeMenu}
              >
                Physics Lab
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/reports"
                className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}
                onClick={closeMenu}
              >
                Научные отчёты
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
