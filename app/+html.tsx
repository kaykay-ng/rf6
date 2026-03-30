import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Expo Router's custom HTML shell — only rendered on web.
// Forces html/body to fill the full viewport so flex:1 propagates
// correctly through Expo Router's wrapper divs in all browsers (incl. Firefox).
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body { height: 100%; margin: 0; padding: 0; }
          body > div { height: 100%; display: flex; flex-direction: column; }
        ` }} />
      </head>
      <body style={{ height: '100%' }}>
        {children}
      </body>
    </html>
  );
}
