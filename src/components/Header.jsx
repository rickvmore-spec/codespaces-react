import React from 'react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-top-bar">
        <div className="paramount-brand">
          <svg className="paramount-logo" viewBox="0 0 140 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22h20L12 2z" fill="#0064FF" />
            <text x="28" y="18" fontFamily="Oswald, sans-serif" fontWeight="700" fontSize="16" fill="white">PARAMOUNT+</text>
          </svg>
        </div>
        <nav className="header-nav">
          <span className="nav-item active">Race Planner</span>
          <span className="nav-item">My Races</span>
          <span className="nav-item">How It Works</span>
        </nav>
      </div>
      <div className="hero-banner">
        <div className="hero-content">
          <div className="race-flag">🏁</div>
          <h1 className="hero-title">
            <span className="hero-the">THE</span>
            <span className="hero-amazing">AMAZING RACE</span>
            <span className="hero-sub">PARTY PLANNER</span>
          </h1>
          <p className="hero-tagline">
            Turn any celebration into an unforgettable adventure race.
            <br />
            Fill in the blanks. We&apos;ll plan the race of a lifetime.
          </p>
        </div>
      </div>
    </header>
  );
}
