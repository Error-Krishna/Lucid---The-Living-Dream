import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.js';
import { useUniverseStore } from './stores/useUniverseStore.js';
import './styles/index.css';

if (typeof window !== 'undefined') {
  (window as any).__lucidStore = useUniverseStore;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
