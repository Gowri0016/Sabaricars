import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // Disable browser's automatic scroll restoration so we control it
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      return () => {
        window.history.scrollRestoration = prev;
      };
    }
  }, []);

  useEffect(() => {
    // Scroll to top when path changes. Timeout ensures layout is applied first.
    const id = setTimeout(() => {
      // Scroll both documentElement and window to be safe across browsers
      if (document?.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document?.body) {
        document.body.scrollTop = 0;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  return null;
}
