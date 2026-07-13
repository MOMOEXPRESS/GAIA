# Gaia API — multi-stage build for minimal image size (Vol 6 §12.2).
# Build context: repository root.
FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY services/api/package.json services/api/
RUN npm install --workspaces --include-workspace-root
COPY tsconfig.base.json ./
COPY packages/shared-types packages/shared-types
COPY services/api services/api
RUN npm run typecheck --workspace @gaia/api

FROM node:20-alpine AS runtime
# Run as non-root (Vol 6 §9 Security by Design).
RUN addgroup -S gaia && adduser -S gaia -G gaia
WORKDIR /repo
COPY --from=build /repo /repo
USER gaia
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npx", "--workspace", "@gaia/api", "tsx", "services/api/src/index.ts"]
