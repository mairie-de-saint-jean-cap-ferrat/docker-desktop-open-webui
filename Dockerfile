FROM golang:1.24-alpine AS builder
ENV CGO_ENABLED=0
# Pas besoin de curl ou unzip pour juste compiler le vérificateur GPU
RUN apk update && \
    apk add --no-cache curl unzip

WORKDIR /installer
COPY installer/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY installer/. .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    GOOS=linux go build -trimpath -ldflags="-s -w" -o bin/installer-linux
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    GOOS=darwin go build -trimpath -ldflags="-s -w" -o bin/installer-darwin
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    GOOS=windows go build -trimpath -ldflags="-s -w" -o bin/installer-windows.exe

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

FROM alpine
# Mettre à jour les labels si nécessaire, supprimer les références obsolètes
LABEL org.opencontainers.image.title="y0n1x's AI Lab (GPU Check)" \
    org.opencontainers.image.description="y0n1x's AI Lab for Docker Desktop with GPU prerequisite check" \
    org.opencontainers.image.vendor="y0n1x@maytech06.com" \
    com.docker.desktop.extension.api.version="0.3.4" \
    # com.docker.extension.screenshots="" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-rdx-open-webui/main/open-webui.svg" \
    # com.docker.extension.detailed-description="" \
    # com.docker.extension.publisher-url="" \
    # com.docker.extension.additional-urls="" \
    com.docker.extension.categories="AI"
    # com.docker.extension.changelog=""

COPY docker-compose.yaml .
COPY metadata.json .
COPY open-webui.svg .
COPY --from=client-builder /ui/build ui
# Copier seulement le binaire Go modifié
COPY --from=builder /installer/bin/installer-linux /linux/installer
COPY --from=builder /installer/bin/installer-darwin /darwin/installer
COPY --from=builder /installer/bin/installer-windows.exe /windows/installer.exe
# Supprimer la copie des fichiers SearXNG s'ils ne sont plus nécessaires
# COPY /searxng/limiter.toml /linux/searxng/limiter.toml
# COPY /searxng/settings.yml /linux/searxng/settings.yml
# COPY /searxng/uwsgi.ini /linux/searxng/uwsgi.ini
