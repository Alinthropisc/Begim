import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Вызываем ready() немедленно — до монтирования React.
// Telegram убирает чёрный экран только после этого вызова.
window.Telegram?.WebApp?.ready();
window.Telegram?.WebApp?.expand();

// Глобальный перехват JS-ошибок для диагностики внутри Telegram
window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
  if (root && !root.innerHTML) {
    root.innerHTML = `<div style="padding:20px;background:#FBF5EC;font-family:sans-serif">
      <div style="background:#8B2635;color:#FBF5EC;padding:12px;border-radius:8px;margin-bottom:12px"><b>JS Error</b></div>
      <pre style="font-size:11px;white-space:pre-wrap;word-break:break-all">${e.message}\n${e.filename}:${e.lineno}</pre>
    </div>`;
  }
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{ padding: 20, background: '#FBF5EC', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <div style={{ background: '#8B2635', color: '#FBF5EC', padding: 16, borderRadius: 12, marginBottom: 16 }}>
            <b>React Error</b>
          </div>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 8, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {err.message}{'\n\n'}{err.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
