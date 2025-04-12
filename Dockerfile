FROM golang:1.24-alpine AS builder
ENV CGO_ENABLED=0

RUN apk update && \
    apk add --no-cache curl unzip

WORKDIR /backend
COPY backend/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY backend/. .
RUN --mount=type=cache,target=/go/pkg/mod \
        --mount=type=cache,target=/root/.cache/go-build \
        go build -trimpath -ldflags="-s -w" -o bin/service

FROM --platform=$BUILDPLATFORM node:21.6-alpine3.18 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine:3.21.3
# Mettre à jour les labels si nécessaire, supprimer les références obsolètes
LABEL org.opencontainers.image.title="y0n1x's AI Lab - Open-WebUI" \
    org.opencontainers.image.description="y0n1x's AI Lab for Docker Desktop" \
    org.opencontainers.image.vendor="contact@maytech06.com" \
    com.docker.desktop.extension.api.version="0.3.4" \
    com.docker.extension.screenshots="" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/refs/heads/main/yo-ai-lab.png" \
    com.docker.extension.detailed-description="AI Lab with Open-WebUI, CUDA, Ollama, Tika, Redis, Minio, SearxNG, Docling-Serve, OpenAI Edge TTS, and more. An OpenRouter API key is required." \
    com.docker.extension.publisher-url="https://github.com/yonix06/" \
    com.docker.extension.additional-urls="https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/" \
    com.docker.extension.categories="AI" \
    com.docker.extension.changelog=""

COPY mcp-server /mcp-server
# COPY mcp-server/Dockerfile.mcp-server .
COPY docker-compose.yaml .
COPY Dockerfile.searxng .
COPY metadata.json .
COPY open-webui.svg .
COPY yo-ai-lab.png .
COPY yo-ai-lab.svg .
COPY --from=client-builder /ui/build ui
# Copier le binaire Go
COPY --from=builder /backend/bin/service /service

CMD ["/service", "-socket", "/run/guest-services/backend.sock"]
