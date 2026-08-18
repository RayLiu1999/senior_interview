# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build

ARG PNPM_VERSION=10.16.0
ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# Install dependencies before copying the source so dependency layers remain cacheable.
COPY web/package.json web/pnpm-lock.yaml ./web/
RUN pnpm --dir web install --frozen-lockfile

# The generator reads the Markdown and quiz sources from the repository.
COPY . .
RUN pnpm --dir web build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    NITRO_HOST=0.0.0.0 \
    PORT=3000 \
    NITRO_PORT=3000 \
    INTERVIEW_PROGRESS_STORE=/app/.data/progress.json

WORKDIR /app

RUN addgroup --system --gid 1001 nuxt \
  && adduser --system --uid 1001 --ingroup nuxt nuxt \
  && mkdir -p /app/.data \
  && chown -R nuxt:nuxt /app/.data

COPY --from=build --chown=nuxt:nuxt /app/web/.output ./.output

USER nuxt

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", ".output/server/index.mjs"]
