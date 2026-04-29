import { HatConfig } from '@/types/hat';

const COMMERCE_URL = (
  (import.meta.env.VITE_HANZO_COMMERCE_URL as string | undefined)?.trim() ||
  'https://commerce.hanzo.ai'
).replace(/\/$/, '');

const TENANT = (import.meta.env.VITE_HANZO_TENANT as string | undefined)?.trim() || 'osage';

export interface CheckoutCustomer {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
}

export interface CheckoutItem {
  id: string;
  quantity: number;
  unitPrice: number;
  hat: HatConfig;
}

export interface CheckoutSessionRequest {
  currency: string;
  customer: CheckoutCustomer;
  items: CheckoutItem[];
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}

export async function createCheckoutSession(
  request: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${COMMERCE_URL}/v1/checkout/sessions`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Hanzo-Tenant': TENANT,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || `Checkout session failed (${response.status})`);
  }

  return (await response.json()) as CheckoutSessionResponse;
}
