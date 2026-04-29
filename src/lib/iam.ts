// Hanzo IAM client — first-party SSO via id.osagebrothers.com.
// Login is delegated to the portal; session is a cookie scoped to .osagebrothers.com,
// so this code only needs login/logout redirects + a /me probe.

const IAM_URL = (
  (import.meta.env.VITE_IAM_URL as string | undefined)?.trim() ||
  'https://id.osagebrothers.com'
).replace(/\/$/, '');

const COMMERCE_URL = (
  (import.meta.env.VITE_HANZO_COMMERCE_URL as string | undefined)?.trim() ||
  'https://commerce.hanzo.ai'
).replace(/\/$/, '');

const TENANT = (import.meta.env.VITE_HANZO_TENANT as string | undefined)?.trim() || 'osage';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export function loginUrl(returnPath: string = window.location.pathname): string {
  const ret = `${window.location.origin}${returnPath}`;
  return `${IAM_URL}/login?return_url=${encodeURIComponent(ret)}&tenant=${TENANT}`;
}

export function signupUrl(returnPath: string = window.location.pathname): string {
  const ret = `${window.location.origin}${returnPath}`;
  return `${IAM_URL}/signup?return_url=${encodeURIComponent(ret)}&tenant=${TENANT}`;
}

export function logoutUrl(returnPath: string = '/'): string {
  const ret = `${window.location.origin}${returnPath}`;
  return `${IAM_URL}/logout?return_url=${encodeURIComponent(ret)}&tenant=${TENANT}`;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const res = await fetch(`${COMMERCE_URL}/v1/me`, {
    credentials: 'include',
    headers: { 'X-Hanzo-Tenant': TENANT },
  });
  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) throw new Error(`/v1/me failed (${res.status})`);
  return (await res.json()) as User;
}

export const IAM = { url: IAM_URL, tenant: TENANT };
