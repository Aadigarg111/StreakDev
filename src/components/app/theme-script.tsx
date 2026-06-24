export function ThemeScript() {
  const code = `(() => {try {const stored = localStorage.getItem('theme'); const theme = stored === 'light' || stored === 'dark' ? stored : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', theme === 'dark'); document.documentElement.style.colorScheme = theme;} catch (_) {}})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
