'use client';

/**
 * Intercepta window.fetch a nivel de módulo (antes de que cualquier
 * componente corra useEffect) para agregar el header
 * `ngrok-skip-browser-warning` a todos los requests.
 *
 * Sin esto, ngrok (free tier) detecta que el request viene de un
 * navegador y devuelve su página HTML de advertencia, lo que rompe
 * todas las llamadas a /api/*.
 */

if (typeof window !== 'undefined') {
  const w = window as Window & { __fetchIntercepted?: boolean };
  if (!w.__fetchIntercepted) {
    const original = window.fetch.bind(window);
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const headers = new Headers(init?.headers);
      headers.set('ngrok-skip-browser-warning', 'true');
      return original(input, { ...init, headers });
    };
    w.__fetchIntercepted = true;
  }
}

export default function FetchInterceptor() {
  return null;
}
