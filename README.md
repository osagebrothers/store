# Osage Brothers — Store

Production frontend for `osagebrothers.com`. Single-SKU MEGA hat. Black or white. $50.

- 3D R3F preview
- IAM SSO via `id.osagebrothers.com` (cookie scoped to `.osagebrothers.com`)
- Hosted checkout at `pay.osagebrothers.com` via Hanzo Commerce

## Local development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build       # → dist/
npm run preview     # local preview of the production bundle
```

## Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `VITE_BASE_PATH` | `/` for `osagebrothers.com` | Pass `/megahats/` for the legacy GitHub Pages build. |
| `VITE_IAM_URL` | `https://id.osagebrothers.com` | Hanzo IAM portal hostname. |
| `VITE_HANZO_COMMERCE_URL` | `https://commerce.hanzo.ai` | Commerce backend base URL. |
| `VITE_HANZO_TENANT` | `osage` | Tenant slug, sent as `X-Hanzo-Tenant` header. |

No other tenant context env is needed — the org slug is `osage` everywhere.

## Auth flow

The store does not run an OIDC client. Login is delegated:

1. User clicks **Sign In** → browser navigates to
   `https://id.osagebrothers.com/login?return_url=https://osagebrothers.com/...&tenant=osage`.
2. The `@hanzo/id` portal handles login/signup and sets a session cookie on
   `.osagebrothers.com`.
3. Browser returns to the store. `fetchCurrentUser()` reads the session via
   `GET https://commerce.hanzo.ai/v1/me` (cookie auto-attached, `credentials: 'include'`).
4. Sign-out → `https://id.osagebrothers.com/logout?return_url=https://osagebrothers.com/`.

For this to work the IAM portal **must** set the session cookie with
`Domain=.osagebrothers.com; Secure; HttpOnly; SameSite=Lax`.

## Checkout flow

1. Cart posts to `POST https://commerce.hanzo.ai/v1/checkout/sessions`
   with `X-Hanzo-Tenant: osage`. Server returns `{ checkoutUrl, sessionId }`.
2. Browser redirects to `checkoutUrl`, which is a `pay.osagebrothers.com/...`
   URL served by the embedded `@hanzoai/pay` UI in the commerce binary.
3. After payment, the `@hanzoai/pay` UI redirects back to
   `https://osagebrothers.com/cart?checkout=success` (or `=cancel`).

No payment-provider keys touch the frontend. Stripe (or whatever provider the
tenant configures) is selected and called from the commerce backend.

## Ops checklist

These are infrastructure prerequisites for a working deployment. The store
itself does not provision them.

### 1. Tenant registration in `@hanzo/iam`

Register the `osage` org in the Hanzo IAM control plane (`~/work/hanzo/iam`)
with branding pulled from `@hanzo/id` (`~/work/hanzo/id/lib/branding.ts` —
entries for `osagebrothers.com`, `id.osagebrothers.com`,
`pay.osagebrothers.com` already added).

KMS keys for the tenant must be scoped per-org per the standing rule:
secrets in KMS only, never plaintext.

### 2. Tenant registration in `@hanzo/commerce`

Register the `osage` tenant in the Commerce backend
(`~/work/hanzo/commerce`) with:

- Provider routing (Stripe account / Square / etc).
- `returnUrlAllowlist` containing `https://osagebrothers.com/cart` (success +
  cancel parameters).
- Branding (`pay.osagebrothers.com` hostname, served via embedded
  `@hanzoai/pay`).

### 3. DNS

The following A/CNAME records must point at the appropriate ingress:

- `osagebrothers.com` → store ingress (this app).
- `id.osagebrothers.com` → `@hanzo/id` deployment.
- `pay.osagebrothers.com` → `@hanzo/commerce` deployment (which embeds
  `@hanzoai/pay`).

### 4. NPM publish (Hanzo JS packages)

The `@hanzo/iam`, `@hanzo/id`, and `@hanzoai/pay` packages currently flag
`"private": true`. Publishing is a separate release engineering step,
not done by this app. Once published, deployments can pin versions.

This store does not import any of those as runtime npm dependencies — it
only consumes them as deployed services (`id.osagebrothers.com`,
`pay.osagebrothers.com`, `commerce.hanzo.ai`).

## Deployment

### Hanzo k8s (default)

`k8s/overlays/megastore-lol` is the historical overlay. A new
`k8s/overlays/osagebrothers` overlay should be created mirroring it, with
the host changed to `osagebrothers.com`. CI workflow:
`.github/workflows/deploy-k8s.yml`.

Required GitHub secrets:

- `HANZO_K8S_KUBECONFIG_B64`

GitHub vars:

- `HANZO_COMMERCE_URL` (e.g. `https://commerce.hanzo.ai`)
- `HANZO_TENANT` (`osage`)
- `IAM_URL` (`https://id.osagebrothers.com`)

### Hanzo PaaS (alternative)

`.github/workflows/deploy-paas.yml` builds, pushes to GHCR, and upserts the
container under org slug `osage` on `platform.hanzo.ai`.

Required GitHub secrets: `PAAS_EMAIL`, `PAAS_PASSWORD`.

## Stack

- React 18 + TypeScript + Vite
- Three.js / React Three Fiber
- Tailwind + Radix
- Tanstack Query
