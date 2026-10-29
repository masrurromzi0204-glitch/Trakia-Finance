// Auto-Inject Tailwind CSS & Reset Default Vite Styles (Untuk VS Code / Localhost)
export const injectGlobalStyles = () => {
  // Pastikan Tailwind CDN termuat otomatis jika belum dikonfigurasi di index.html
  if (!document.getElementById('trakia-tailwind-cdn')) {
    const script = document.createElement('script');
    script.id = 'trakia-tailwind-cdn';
    script.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(script);
  }

  // Bersihkan CSS bawaan Vite (#root & body) yang membuat layar hitam dan rata tengah
  if (!document.getElementById('trakia-vite-reset')) {
    const style = document.createElement('style');
    style.id = 'trakia-vite-reset';
    style.innerHTML = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #F1F5F9 !important;
        color: #0F172A !important;
        display: block !important;
        min-height: 100vh !important;
      }
      #root {
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
        text-align: left !important;
        width: 100% !important;
      }
    `;
    document.head.appendChild(style);
  }
};

