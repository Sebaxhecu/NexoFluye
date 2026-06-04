import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />

        {/* Viewport optimizado para móvil */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* PWA general */}
        <meta name="theme-color" content="#1E3A8A" />
        <meta name="description" content="Gestiona las finanzas de tu negocio con claridad" />
        <link rel="manifest" href="/manifest.json" />

        {/* iOS Safari PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NexoFluye" />
        <link rel="apple-touch-icon" href="/assets/icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/icon.png" />

        {/* Android Chrome PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="NexoFluye" />

        {/* Previene resaltado azul al tocar en móvil */}
        <style>{`
          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
          }
          html, body {
            height: 100%;
            overflow: hidden;
            background-color: #1E3A8A;
          }
          #root {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          /* Oculta scrollbar pero permite scroll */
          ::-webkit-scrollbar { display: none; }
          * { scrollbar-width: none; }
        `}</style>

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
