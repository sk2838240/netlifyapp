import { useState, useEffect } from 'react';
import { SiteStyle } from '../types';
import { defaultStyles, generateCSSVariables } from '../lib/styles';

export function useSiteStyles() {
  const [styles, setStyles] = useState<SiteStyle>(defaultStyles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/styles')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setStyles({ ...defaultStyles, ...res.data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const css = generateCSSVariables(styles);
    let styleEl = document.getElementById('dynamic-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }, [styles]);

  return { styles, setStyles, loading };
}
