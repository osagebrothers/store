FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_BASE_PATH=/
ARG VITE_HANZO_COMMERCE_URL=https://commerce.hanzo.ai
ARG VITE_HANZO_TENANT=osage
ARG VITE_IAM_URL=https://id.osagebrothers.com
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_HANZO_COMMERCE_URL=$VITE_HANZO_COMMERCE_URL
ENV VITE_HANZO_TENANT=$VITE_HANZO_TENANT
ENV VITE_IAM_URL=$VITE_IAM_URL

RUN pnpm build

# Static-served behind hanzoai/ingress + hanzoai/static plugin in production.
# This stage is a lightweight fallback only.
FROM node:20-alpine AS runner
RUN npm install -g serve@14
COPY --from=builder /app/dist /app/dist
EXPOSE 8080
CMD ["serve", "-s", "/app/dist", "-l", "8080"]
