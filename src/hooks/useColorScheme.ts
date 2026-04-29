import { useEffect, useState, useSyncExternalStore } from 'react';

export type ColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'osage-color-scheme';

type Listener = () => void;
const listeners = new Set<Listener>();
let userOverride: ColorScheme | null = null;

if (typeof window !== 'undefined') {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    userOverride = stored;
  }
}

function notify() {
  for (const l of listeners) l();
}

function getSnapshot(): ColorScheme {
  if (userOverride) return userOverride;
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getServerSnapshot(): ColorScheme {
  return 'dark';
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);

  let mql: MediaQueryList | null = null;
  let mqlHandler: ((e: MediaQueryListEvent) => void) | null = null;
  if (typeof window !== 'undefined' && !userOverride) {
    mql = window.matchMedia('(prefers-color-scheme: dark)');
    mqlHandler = () => listener();
    mql.addEventListener('change', mqlHandler);
  }

  return () => {
    listeners.delete(listener);
    if (mql && mqlHandler) mql.removeEventListener('change', mqlHandler);
  };
}

export function setColorScheme(next: ColorScheme | 'system'): void {
  if (typeof window === 'undefined') return;
  if (next === 'system') {
    userOverride = null;
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    userOverride = next;
    window.localStorage.setItem(STORAGE_KEY, next);
  }
  notify();
}

export function toggleColorScheme(): void {
  const current = getSnapshot();
  setColorScheme(current === 'dark' ? 'light' : 'dark');
}

export function useColorScheme(): ColorScheme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useColorSchemeReady(): boolean {
  const [ready, setReady] = useState(typeof window !== 'undefined');
  useEffect(() => setReady(true), []);
  return ready;
}
