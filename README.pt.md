# Suite de Extensões Docker Open WebUI

![Logotipo Yo AI Lab](yo-ai-lab.png)

[![Compilação](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml/badge.svg?branch=main&event=release)](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml)

Uma extensão Docker Desktop que implanta um conjunto de ferramentas centrado no [Open WebUI](https://docs.openwebui.com/), configurado para aceleração de GPU NVIDIA (se disponível) e vários serviços complementares, tudo acessível através de uma interface unificada.

![Captura de tela da extensão](screenshot.png)

## Funcionalidades Principais

*   **Interface Unificada**: Uma barra de navegação permite alternar facilmente entre as interfaces web dos diferentes serviços incluídos (Open WebUI, Jupyter, MinIO Console, etc.) sem sair da extensão.
*   **Open WebUI Pré-configurado**: Interface web para interagir com modelos de linguagem locais (via Ollama) ou remotos (API OpenAI, OpenRouter). Aceleração de GPU NVIDIA ativada por padrão (`ghcr.io/open-webui/open-webui:dev-cuda`).
*   **Verificação de GPU Integrada**: Detecta a presença de ferramentas NVIDIA (`nvidia-smi`) e orienta o utilizador se os pré-requisitos não forem cumpridos (apenas para a exibição inicial, a interface principal permanece acessível).
*   **Conjunto de Serviços**: Inclui vários serviços úteis para IA e desenvolvimento.
*   **Credenciais Rápidas**: Um botão na barra de navegação exibe as credenciais padrão dos serviços (Jupyter, MinIO) numa janela modal.

## Serviços Incluídos

Esta extensão implanta os seguintes serviços (acessíveis via `http://host.docker.internal:<PORT>` a partir do Open WebUI ou outros contentores na mesma rede Docker):

*   **Open WebUI** (`:11500`): A interface principal para interagir com LLMs.
*   **Ollama** (`:11434`): Runner para modelos de linguagem locais. *Integração: Configurado automaticamente (`OLLAMA_BASE_URL`)*.
*   **LibreTranslate** (`:11553`): Servidor de tradução automática de código aberto. *Integração: Não integrado por padrão com o Open WebUI.*
*   **SearxNG** (`:11505`): Metamotor de busca que respeita a privacidade. *Integração: Configurado como motor de busca web padrão para RAG (`SEARXNG_QUERY_URL`)*.
*   **Docling Serve** (`:11551`): Servidor OCR (Reconhecimento Ótico de Caracteres). *Integração: Não integrado por padrão com o Open WebUI.*
*   **OpenAI Edge TTS** (`:11550`): Servidor Text-to-Speech usando o serviço Edge da Microsoft. *Integração: Não integrado por padrão com o Open WebUI.*
*   **Jupyter Notebook** (`:11552`): Ambiente de desenvolvimento interativo. *Integração: Nenhuma direta. Acessível através da sua porta.*
*   **MinIO** (`:11556` Consola, `:11557` Endpoint S3): Armazenamento de objetos compatível com S3. *Integração: Pode ser configurado como fornecedor de armazenamento no Open WebUI (variáveis `STORAGE_PROVIDER`, `S3_*`).*
*   **Redis** (`:11558`): Base de dados chave-valor em memória. *Integração: Pode ser usado para gestão de WebSockets (`WEBSOCKET_MANAGER`, `WEBSOCKET_REDIS_URL`) e caching (não configurado por padrão).*
*   **Apache Tika** (`:11560`): Conjunto de ferramentas de extração de conteúdo. *Integração: Configurado para extração de texto RAG (`TIKA_SERVER_URL`)*.
*   **MCP Tools** (Portas `11561` a `11570`): Conjunto de ferramentas para o framework MCP (Multi-agent Conversation Protocol) incluindo `filesystem`, `memory`, `time`, `fetch`, `everything`, `sequentialthinking`, `sqlite`, `redis`. *Integração: Nenhuma. Não acessíveis através da barra de navegação.*
*   **Serviço MCP_DOCKER** (Via Extension SDK): Serviço fornecido pela Docker Inc. que concede acesso a várias ferramentas de IA através do servidor MCP configurado pela extensão "AI Tool Catalog". *Integração: Comunicação gerida pelo SDK da extensão Docker Desktop.*

## Interface do Utilizador da Extensão

A interface principal da extensão consiste em:

1.  **Barra de Navegação Superior**:
    *   Exibe o nome "Services:".
    *   Contém botões para cada serviço com uma interface web (Open WebUI, LibreTranslate, SearxNG, Docling Serve, Jupyter, MinIO Console). O botão do serviço ativo é destacado.
    *   Um botão de informação (`i`) à direita abre uma janela modal exibindo as credenciais padrão para Jupyter e MinIO.
2.  **Quadro Principal (Iframe)**:
    *   Exibe a interface web do serviço selecionado através da barra de navegação.

## Configuração do Open WebUI

O Open WebUI está pré-configurado através de variáveis de ambiente em `docker-compose.yaml` para usar alguns dos serviços incluídos:

*   **Ollama** (`OLLAMA_BASE_URL=http://host.docker.internal:11434`)
*   **SearxNG para RAG** (`SEARXNG_QUERY_URL=http://host.docker.internal:11505`)
*   **Apache Tika para RAG** (`TIKA_SERVER_URL=http://host.docker.internal:11560`)
*   **API OpenRouter (via endpoint OpenAI)**: Requer uma chave API (`OPENROUTER_API_KEY`) num ficheiro `.env` na raiz do projeto.

Pode personalizar ainda mais a configuração modificando as variáveis de ambiente em `docker-compose.yaml` e reiniciando a extensão. Consulte a [documentação do Open WebUI](https://docs.openwebui.com/) para todas as opções disponíveis.

## Pré-requisitos (Aceleração GPU NVIDIA)

Para beneficiar da aceleração GPU com placas NVIDIA, **deve** realizar os seguintes passos **antes** de usar a extensão:

1.  **Instalar os drivers NVIDIA**: Descarregue e instale os drivers NVIDIA mais recentes para o seu sistema operativo e placa gráfica a partir do [site oficial da NVIDIA](https://www.nvidia.com/Download/index.aspx).
2.  **Ativar o suporte GPU no Docker Desktop**: Vá a `Settings` > `Resources` > `Advanced` e ative a opção `Enable GPU acceleration` (ou similar, o nome exato pode variar).
3.  **Reiniciar o Docker Desktop**: Após instalar os drivers e alterar as configurações, reinicie o Docker Desktop.

A extensão verificará automaticamente se a ferramenta `nvidia-smi` é detetável. Caso contrário, exibirá instruções para o orientar.

*(Nota: O suporte padrão de GPU do Docker Desktop para NVIDIA não está disponível no macOS.)*

## Como Funciona

A extensão irá:

1.  Iniciar os serviços definidos em `docker-compose.yaml`.
2.  Verificar a presença de ferramentas NVIDIA no seu sistema anfitrião através de um pequeno binário.
3.  Se as ferramentas forem detetadas (`nvidia-smi`), a interface Open WebUI (e outros serviços configurados) será exibida e poderá usar a GPU.
4.  Se as ferramentas não forem detetadas ou se o SO não for suportado (macOS), um guia será exibido **inicialmente** com instruções de pré-requisitos antes de carregar a interface principal.

## Como Instalar

- Instale e inicie o [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Desktop, se compatível).
- Certifique-se de que os pré-requisitos de GPU (ver acima) são cumpridos se desejar aceleração de hardware.
- Execute o comando:

  ```sh
  docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  # Exemplo: docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest
  ```

## Como Desinstalar

- Execute o comando:

  ```sh
  docker extension uninstall ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  ```

## Como Construir a Imagem da Extensão

- Execute o comando:

  ```sh
  docker build -t <your-extension-image-name>:<tag> .
  # Exemplo: docker build -t mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest .
  ```

*(Os comandos `rdctl` também podem ser usados se estiver a usar o Rancher Desktop)*

## Como Lançar

```sh
gh release create vX.Y.Z --generate-notes
``` 