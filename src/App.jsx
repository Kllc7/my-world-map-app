import React from 'react';
import Map from './components/Map';
import './App.css';

const App = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="text-3xl font-bold text-center p-4">My Interactive World Map</h1>
      </header>
      <main className="app-main">
        <Map />
      </main>
    </div>
  );
};

export default App;