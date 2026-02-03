import React from 'react';

export default function AppHeader() {
  return (
    <header className="app-header">
      <span role="img" aria-label="heart" style={{ color: '#e25555', fontSize: 28, verticalAlign: 'middle' }}>
        🖤
      </span>
      <span style={{ fontWeight: 700, fontSize: 26, marginLeft: 10, color: '#234', verticalAlign: 'middle' }}>
        bloggie
      </span>
    </header>
  );
}
