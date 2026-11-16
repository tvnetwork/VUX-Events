import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Auto-recover from stale dynamic imports when a new deployment updates chunk hashes
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const lastReload = sessionStorage.getItem('vux_chunk_reload');
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem('vux_chunk_reload', now.toString());
    window.location.reload();
  }
});

window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('dynamically imported module') ||
     event.message.includes('Expected a JavaScript-or-Wasm module script'))
  ) {
    const lastReload = sessionStorage.getItem('vux_chunk_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('vux_chunk_reload', now.toString());
      window.location.reload();
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
