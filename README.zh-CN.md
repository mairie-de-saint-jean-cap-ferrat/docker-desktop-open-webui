# Open WebUI Docker 扩展套件

![Yo AI Lab 徽标](yo-ai-lab.png)

[![构建](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml/badge.svg?branch=main&event=release)](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml)

一个 Docker Desktop 扩展，部署了一套以 [Open WebUI](https://docs.openwebui.com/) 为中心的工具，配置了 NVIDIA GPU 加速（如果可用）和各种补充服务，所有这些都通过统一的界面访问。

![扩展截图](screenshot.png)

## 主要特点

*   **统一界面**：导航栏允许在不同的包含服务（Open WebUI、Jupyter、MinIO 控制台等）的 Web 界面之间轻松切换，而无需离开扩展。
*   **预配置的 Open WebUI**：用于与本地语言模型（通过 Ollama）或远程语言模型（OpenAI API、OpenRouter）交互的 Web 界面。默认启用 NVIDIA GPU 加速 (`ghcr.io/open-webui/open-webui:dev-cuda`)。
*   **集成的 GPU 检查**：检测 NVIDIA 工具 (`nvidia-smi`) 的存在，并在不满足先决条件时引导用户（仅用于初始显示，主界面仍可访问）。
*   **服务套件**：包括几个用于 AI 和开发的有用服务。
*   **快速凭据**：导航栏中的按钮在模态窗口中显示服务的默认凭据（Jupyter、MinIO）。

## 包含的服务

此扩展部署以下服务（可通过 `http://host.docker.internal:<PORT>` 从 Open WebUI 或同一 Docker 网络上的其他容器访问）：

*   **Open WebUI** (`:11500`)：与 LLM 交互的主要界面。
*   **Ollama** (`:11434`)：本地语言模型的运行器。*集成：自动配置 (`OLLAMA_BASE_URL`)*。
*   **LibreTranslate** (`:11553`)：开源自动翻译服务器。*集成：默认情况下未与 Open WebUI 集成。*
*   **SearxNG** (`:11505`)：尊重隐私的元搜索引擎。*集成：配置为 RAG 的默认 Web 搜索引擎 (`SEARXNG_QUERY_URL`)*。
*   **Docling Serve** (`:11551`)：OCR（光学字符识别）服务器。*集成：默认情况下未与 Open WebUI 集成。*
*   **OpenAI Edge TTS** (`:11550`)：使用 Microsoft Edge 服务的文本转语音服务器。*集成：默认情况下未与 Open WebUI 集成。*
*   **Jupyter Notebook** (`:11552`)：交互式开发环境。*集成：无直接集成。可通过其端口访问。*
*   **MinIO** (`:11556` 控制台, `:11557` S3 端点)：兼容 S3 的对象存储。*集成：可在 Open WebUI 中配置为存储提供程序（变量 `STORAGE_PROVIDER`, `S3_*`）。*
*   **Redis** (`:11558`)：内存键值数据库。*集成：可用于 WebSocket 管理 (`WEBSOCKET_MANAGER`, `WEBSOCKET_REDIS_URL`) 和缓存（默认未配置）。*
*   **Apache Tika** (`:11560`)：内容提取工具包。*集成：配置用于 RAG 文本提取 (`TIKA_SERVER_URL`)*。
*   **MCP 工具** (端口 `11561` 到 `11570`)：用于 MCP（多代理对话协议）框架的一组工具，包括 `filesystem`, `memory`, `time`, `fetch`, `everything`, `sequentialthinking`, `sqlite`, `redis`。*集成：无。无法通过导航栏访问。*
*   **MCP_DOCKER 服务** (通过 Extension SDK)：由 Docker Inc. 提供的服务，通过"AI Tool Catalog"扩展配置的 MCP 服务器授予对各种 AI 工具的访问权限。*集成：通信由 Docker Desktop 扩展 SDK 处理。*

## 扩展用户界面

扩展的主要界面包括：

1.  **顶部导航栏**：
    *   显示名称 "Services:"。
    *   包含每个具有 Web 界面（Open WebUI、LibreTranslate、SearxNG、Docling Serve、Jupyter、MinIO 控制台）的服务的按钮。活动服务的按钮会突出显示。
    *   右侧的信息按钮 (`i`) 打开一个模态窗口，显示 Jupyter 和 MinIO 的默认凭据。
2.  **主框架 (Iframe)**：
    *   显示通过导航栏选择的服务的 Web 界面。

## Open WebUI 配置

Open WebUI 通过 `docker-compose.yaml` 中的环境变量预先配置，以使用某些包含的服务：

*   **Ollama** (`OLLAMA_BASE_URL=http://host.docker.internal:11434`)
*   **用于 RAG 的 SearxNG** (`SEARXNG_QUERY_URL=http://host.docker.internal:11505`)
*   **用于 RAG 的 Apache Tika** (`TIKA_SERVER_URL=http://host.docker.internal:11560`)
*   **OpenRouter API（通过 OpenAI 端点）**：需要在项目根目录的 `.env` 文件中提供 API 密钥 (`OPENROUTER_API_KEY`)。

您可以通过修改 `docker-compose.yaml` 中的环境变量并重新启动扩展来进一步自定义配置。有关所有可用选项，请查阅 [Open WebUI 文档](https://docs.openwebui.com/)。

## 先决条件（NVIDIA GPU 加速）

要使用 NVIDIA 显卡进行 GPU 加速，您**必须**在使用扩展**之前**执行以下步骤：

1.  **安装 NVIDIA 驱动程序**：从 [NVIDIA 官方网站](https://www.nvidia.com/Download/index.aspx) 下载并为您的操作系统和显卡安装最新的 NVIDIA 驱动程序。
2.  **在 Docker Desktop 中启用 GPU 支持**：转到 `Settings` > `Resources` > `Advanced` 并启用 `Enable GPU acceleration` 选项（或类似选项，确切名称可能有所不同）。
3.  **重新启动 Docker Desktop**：安装驱动程序并更改设置后，重新启动 Docker Desktop。

扩展将自动检查 `nvidia-smi` 工具是否可检测。如果不可检测，它将显示说明以指导您。

*（注意：NVIDIA 的标准 Docker Desktop GPU 支持在 macOS 上不可用。）*

## 工作原理

扩展将：

1.  启动 `docker-compose.yaml` 中定义的服务。
2.  通过一个小型二进制文件检查主机系统上是否存在 NVIDIA 工具。
3.  如果检测到工具 (`nvidia-smi`)，将显示 Open WebUI 界面（以及其他配置的服务）并可以使用 GPU。
4.  如果未检测到工具或操作系统不受支持 (macOS)，则在加载主界面之前**最初**会显示带有先决条件说明的指南。

## 如何安装

- 安装并启动 [Docker Desktop](https://www.docker.com/products/docker-desktop/)（或 Docker Desktop，如果兼容）。
- 如果需要硬件加速，请确保满足 GPU 先决条件（见上文）。
- 运行命令：

  ```sh
  docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  # 示例：docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest
  ```

## 如何卸载

- 运行命令：

  ```sh
  docker extension uninstall ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  ```

## 如何构建扩展镜像

- 运行命令：

  ```sh
  docker build -t <your-extension-image-name>:<tag> .
  # 示例：docker build -t mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest .
  ```

*（如果您使用的是 Rancher Desktop，也可以使用 `rdctl` 命令）*

## 如何发布

```sh
gh release create vX.Y.Z --generate-notes
``` 