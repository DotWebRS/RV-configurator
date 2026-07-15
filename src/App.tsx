import { useEffect, useState } from 'react';

type MenuItem = {
  label: string;
  href: string;
  dropdown?: string[];
};

const menuItems: MenuItem[] = [
  {
    label: 'Products',
    href: '#products',
    dropdown: ['Luxury Fifth Wheels', 'Travel Trailers', 'Toy Haulers'],
  },
  {
    label: 'Inventory',
    href: '#inventory',
    dropdown: ['New Inventory', 'Pre-Owned', 'Find a Dealer'],
  },
  {
    label: 'Luxe Events',
    href: '#events',
    dropdown: ['Upcoming Events', 'Factory Tours', 'Owner Rallies'],
  },
  {
    label: 'Luxe Gear',
    href: '#gear',
    dropdown: ['Apparel', 'Accessories', 'Parts'],
  },
  { label: 'Info', href: '#info' },
  { label: 'Contact', href: '#contact' },
];

function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function Navbar() {
  return (
    <header className="site-header">
      <a
        className="brand"
        href="/"
        onClick={(event) => {
          event.preventDefault();
          navigateTo('/');
        }}
      >
        LUXE
      </a>

      <nav className="main-nav" aria-label="Primary navigation">
        {menuItems.map((item) => (
          <div className="nav-item" key={item.label}>
            <a className="nav-link" href={item.href}>
              {item.label}
              {item.dropdown && <span className="chevron" aria-hidden="true" />}
            </a>
            {item.dropdown && (
              <div className="dropdown" role="menu">
                {item.dropdown.map((dropdownItem) => (
                  <a href={item.href} key={dropdownItem} role="menuitem">
                    <span>{dropdownItem}</span>
                    <span className="dropdown-arrow" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="header-actions">
        <button className="build-nav-button" onClick={() => navigateTo('/build')}>
          Build Your Own Luxe
        </button>
        <button className="profile-button" aria-label="Open account">
          <span className="profile-icon" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

function HomePage() {
  return (
    <main>
      <section className="hero" id="home" aria-label="Luxury fifth wheels">
        
        <div className="hero-overlay">
          <h1 className="hero-title">
            LUXURY FIFTH WHEELS
          </h1>

          <p className="hero-subtitle">
            A True Four-Season RV <span>|</span> Factory Direct
          </p>

          <button
            className="hero-build-button"
            onClick={() => navigateTo('/build')}
          >
            Build Your Luxe
          </button>
        </div>
      </section>
    </main>
  );
}

function BuildPage() {
  return (
    <main className="blank-page">
      <div className="blank-page-inner" />
    </main>
  );
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <>
      <Navbar />
      {path === '/build' ? <BuildPage /> : <HomePage />}
    </>
  );
}
