import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const w = window as any;
if (typeof w.render_game_to_text !== 'function') {
  w.__gl_game_state = w.__gl_game_state ?? { mode: 'boot' };
  w.render_game_to_text = () => {
    try {
      return JSON.stringify(w.__gl_game_state ?? { mode: 'boot' });
    } catch {
      return JSON.stringify({ mode: 'boot', error: 'stringify_failed' });
    }
  };
}

if (typeof w.advanceTime !== 'function') {
  w.advanceTime = (ms: number) =>
    new Promise<void>((resolve) => {
      const start = performance.now();
      const step = (now: number) => {
        if (now - start >= ms) return resolve();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
