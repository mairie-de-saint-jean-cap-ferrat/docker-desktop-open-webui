# Open WebUI Docker Extension Suite

![Yo AI Lab Logo](yo-ai-lab.png)

[![Build](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml/badge.svg?branch=main&event=release)](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml)

A Docker Desktop extension that deploys a suite of tools centered around [Open WebUI](https://docs.openwebui.com/), configured for NVIDIA GPU acceleration (if available) and various complementary services, all accessible via a unified interface.

![Extension Screenshot](screenshot.png)

## Main Features

*   **Unified Interface**: A navigation bar allows easy switching between the web interfaces of the different included services (Open WebUI, Jupyter, MinIO Console, etc.) without leaving the extension.
*   **Pre-configured Open WebUI**: Web interface to interact with local language models (via Ollama) or remote ones (OpenAI API, OpenRouter). NVIDIA GPU acceleration enabled by default (`ghcr.io/open-webui/open-webui:dev-cuda`).
*   **Integrated GPU Check**: Detects the presence of NVIDIA tools (`nvidia-smi`) and guides the user if prerequisites are not met (only for the initial display, the main interface remains accessible).
*   **Suite of Services**: Includes several useful services for AI and development.
*   **Quick Credentials**: A button in the navigation bar displays the default credentials for services (Jupyter, MinIO) in a modal window.

## Included Services

This extension deploys the following services (accessible via `http://host.docker.internal:<PORT>` from Open WebUI or other containers on the same Docker network):

*   **Open WebUI** (`:11500`): The main interface for interacting with LLMs.
*   **Ollama** (`:11434`): Runner for local language models. *Integration: Automatically configured (`OLLAMA_BASE_URL`)*.
*   **LibreTranslate** (`:11553`): Open-source automatic translation server. *Integration: Not integrated by default with Open WebUI.*
*   **SearxNG** (`:11505`): Privacy-respecting metasearch engine. *Integration: Configured as the default web search engine for RAG (`SEARXNG_QUERY_URL`)*.
*   **Docling Serve** (`:11551`): OCR (Optical Character Recognition) server. *Integration: Not integrated by default with Open WebUI.*
*   **OpenAI Edge TTS** (`:11550`): Text-to-Speech server using Microsoft's Edge service. *Integration: Not integrated by default with Open WebUI.*
*   **Jupyter Notebook** (`:11552`): Interactive development environment. *Integration: None direct. Accessible via its port.*
*   **MinIO** (`:11556` Console, `:11557` S3 Endpoint): S3-compatible object storage. *Integration: Can be configured as a storage provider in Open WebUI (variables `STORAGE_PROVIDER`, `S3_*`).*
*   **Redis** (`:11558`): In-memory key-value database. *Integration: Can be used for WebSocket management (`WEBSOCKET_MANAGER`, `WEBSOCKET_REDIS_URL`) and caching (not configured by default).*
*   **Apache Tika** (`:11560`): Content extraction toolkit. *Integration: Configured for RAG text extraction (`TIKA_SERVER_URL`)*.
*   **MCP Tools** (Ports `11561` to `11570`): Set of tools for the MCP (Multi-agent Conversation Protocol) framework including `filesystem`, `memory`, `time`, `fetch`, `everything`, `sequentialthinking`, `sqlite`, `redis`. *Integration: None. Not accessible via the navigation bar.*
*   **MCP_DOCKER Service** (Via Extension SDK): Service provided by Docker Inc. granting access to various AI tools via the MCP server configured by the "AI Tool Catalog" extension. *Integration: Communication handled by the Docker Desktop extension SDK.*

## Extension User Interface

The main interface of the extension consists of:

1.  **Top Navigation Bar**:
    *   Displays the name "Services:".
    *   Contains buttons for each service with a web interface (Open WebUI, LibreTranslate, SearxNG, Docling Serve, Jupyter, MinIO Console). The active service's button is highlighted.
    *   An information button (`i`) on the right opens a modal window displaying default credentials for Jupyter and MinIO.
2.  **Main Frame (Iframe)**:
    *   Displays the web interface of the service selected via the navigation bar.

## Open WebUI Configuration

Open WebUI is pre-configured via environment variables in `docker-compose.yaml` to use some of the included services:

*   **Ollama** (`OLLAMA_BASE_URL=http://host.docker.internal:11434`)
*   **SearxNG for RAG** (`SEARXNG_QUERY_URL=http://host.docker.internal:11505`)
*   **Apache Tika for RAG** (`TIKA_SERVER_URL=http://host.docker.internal:11560`)
*   **OpenRouter API (via OpenAI endpoint)**: Requires an API key (`OPENROUTER_API_KEY`) in a `.env` file at the project root.

You can further customize the configuration by modifying the environment variables in `docker-compose.yaml` and restarting the extension. Consult the [Open WebUI documentation](https://docs.openwebui.com/) for all available options.

## Prerequisites (NVIDIA GPU Acceleration)

To benefit from GPU acceleration with NVIDIA cards, you **must** perform the following steps **before** using the extension:

1.  **Install NVIDIA drivers**: Download and install the latest NVIDIA drivers for your operating system and graphics card from the [official NVIDIA website](https://www.nvidia.com/Download/index.aspx).
2.  **Enable GPU support in Docker Desktop**: Go to `Settings` > `Resources` > `Advanced` and enable the `Enable GPU acceleration` option (or similar, the exact name may vary).
3.  **Restart Docker Desktop**: After installing the drivers and changing the settings, restart Docker Desktop.

The extension will automatically check if the `nvidia-smi` tool is detectable. If not, it will display instructions to guide you.

*(Note: Standard Docker Desktop GPU support for NVIDIA is not available on macOS.)*

## How it Works

The extension will:

1.  Start the services defined in `docker-compose.yaml`.
2.  Check for the presence of NVIDIA tools on your host system via a small binary.
3.  If the tools are detected (`nvidia-smi`), the Open WebUI interface (and other configured services) will be displayed and can use the GPU.
4.  If the tools are not detected or if the OS is not supported (macOS), a guide will be displayed **initially** with prerequisite instructions before loading the main interface.

## How to Install

- Install and launch [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Desktop, if compatible).
- Ensure GPU prerequisites (see above) are met if you want hardware acceleration.
- Run the command:

  ```sh
  docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  # Example: docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest
  ```

## How to Uninstall

- Run the command:

  ```sh
  docker extension uninstall ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  ```

## How to Build the Extension Image

- Run the command:

  ```sh
  docker build -t <your-extension-image-name>:<tag> .
  # Example: docker build -t mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest .
  ```

*(The `rdctl` commands can also be used if you are using Rancher Desktop)*

## How to Release

```sh
gh release create vX.Y.Z --generate-notes
```
