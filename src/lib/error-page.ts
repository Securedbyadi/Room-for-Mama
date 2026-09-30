export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn’t load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: light dark; --page: #f6eee3; --paper: #fbf6ee; --ink: #34402a; --muted: #5b6450; --line: #e2d6c3; --button: #34402a; --button-text: #f6eee3; }
      @media (prefers-color-scheme: dark) { :root { --page: #1f2619; --paper: #283122; --ink: #f6eee3; --muted: #c4c9b5; --line: #7f8a70; --button: #f5d06f; --button-text: #1f2619; } }
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: var(--page); color: var(--ink); display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: var(--muted); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: var(--button); color: var(--button-text); }
      .secondary { background: var(--paper); color: var(--ink); border-color: var(--line); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn’t load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
