# Sada rozšíření Docker Open WebUI

![Logo Yo AI Lab](yo-ai-lab.png)

[![Sestavení](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml/badge.svg?branch=main&event=release)](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml)

Rozšíření Docker Desktop, které nasazuje sadu nástrojů zaměřenou na [Open WebUI](https://docs.openwebui.com/), nakonfigurovanou pro akceleraci NVIDIA GPU (pokud je k dispozici) a různé doplňkové služby, vše přístupné prostřednictvím jednotného rozhraní.

![Snímek obrazovky rozšíření](screenshot.png)

## Hlavní vlastnosti

*   **Jednotné rozhraní**: Navigační lišta umožňuje snadné přepínání mezi webovými rozhraními různých zahrnutých služeb (Open WebUI, Jupyter, MinIO Console atd.) bez opuštění rozšíření.
*   **Předkonfigurované Open WebUI**: Webové rozhraní pro interakci s lokálními jazykovými modely (přes Ollama) nebo vzdálenými (API OpenAI, OpenRouter). Akcelerace NVIDIA GPU ve výchozím nastavení povolena (`ghcr.io/open-webui/open-webui:dev-cuda`).
*   **Integrovaná kontrola GPU**: Detekuje přítomnost nástrojů NVIDIA (`nvidia-smi`) a navede uživatele, pokud nejsou splněny předpoklady (pouze pro počáteční zobrazení, hlavní rozhraní zůstává přístupné).
*   **Sada služeb**: Zahrnuje několik užitečných služeb pro AI a vývoj.
*   **Rychlé přihlašovací údaje**: Tlačítko v navigační liště zobrazí výchozí přihlašovací údaje pro služby (Jupyter, MinIO) v modálním okně.

## Zahrnuté služby

Toto rozšíření nasazuje následující služby (přístupné přes `http://host.docker.internal:<PORT>` z Open WebUI nebo jiných kontejnerů ve stejné síti Docker):

*   **Open WebUI** (`:11500`): Hlavní rozhraní pro interakci s LLM.
*   **Ollama** (`:11434`): Spouštěč pro lokální jazykové modely. *Integrace: Automaticky nakonfigurováno (`OLLAMA_BASE_URL`)*.
*   **LibreTranslate** (`:11553`): Open-source server pro automatický překlad. *Integrace: Ve výchozím nastavení není integrováno s Open WebUI.*
*   **SearxNG** (`:11505`): Metavyhledávač respektující soukromí. *Integrace: Nakonfigurováno jako výchozí webový vyhledávač pro RAG (`SEARXNG_QUERY_URL`)*.
*   **Docling Serve** (`:11551`): Server OCR (Optické rozpoznávání znaků). *Integrace: Ve výchozím nastavení není integrováno s Open WebUI.*
*   **OpenAI Edge TTS** (`:11550`): Server Text-to-Speech využívající službu Microsoft Edge. *Integrace: Ve výchozím nastavení není integrováno s Open WebUI.*
*   **Jupyter Notebook** (`:11552`): Interaktivní vývojové prostředí. *Integrace: Žádná přímá. Přístupné přes svůj port.*
*   **MinIO** (`:11556` Konzole, `:11557` Koncový bod S3): Objektové úložiště kompatibilní s S3. *Integrace: Může být nakonfigurováno jako poskytovatel úložiště v Open WebUI (proměnné `STORAGE_PROVIDER`, `S3_*`).*
*   **Redis** (`:11558`): Databáze klíč-hodnota v paměti. *Integrace: Může být použito pro správu WebSocket (`WEBSOCKET_MANAGER`, `WEBSOCKET_REDIS_URL`) a cachování (ve výchozím nastavení není nakonfigurováno).*
*   **Apache Tika** (`:11560`): Sada nástrojů pro extrakci obsahu. *Integrace: Nakonfigurováno pro extrakci textu RAG (`TIKA_SERVER_URL`)*.
*   **MCP Tools** (Porty `11561` až `11570`): Sada nástrojů pro framework MCP (Multi-agent Conversation Protocol) zahrnující `filesystem`, `memory`, `time`, `fetch`, `everything`, `sequentialthinking`, `sqlite`, `redis`. *Integrace: Žádná. Nejsou přístupné přes navigační lištu.*
*   **Služba MCP_DOCKER** (Přes Extension SDK): Služba poskytovaná společností Docker Inc. poskytující přístup k různým nástrojům AI prostřednictvím serveru MCP nakonfigurovaného rozšířením "AI Tool Catalog". *Integrace: Komunikace zajišťována SDK rozšíření Docker Desktop.*

## Uživatelské rozhraní rozšíření

Hlavní rozhraní rozšíření se skládá z:

1.  **Horní navigační lišta**:
    *   Zobrazuje název "Services:".
    *   Obsahuje tlačítka pro každou službu s webovým rozhraním (Open WebUI, LibreTranslate, SearxNG, Docling Serve, Jupyter, MinIO Console). Tlačítko aktivní služby je zvýrazněno.
    *   Informační tlačítko (`i`) vpravo otevře modální okno zobrazující výchozí přihlašovací údaje pro Jupyter a MinIO.
2.  **Hlavní rámec (Iframe)**:
    *   Zobrazuje webové rozhraní služby vybrané pomocí navigační lišty.

## Konfigurace Open WebUI

Open WebUI je předkonfigurováno pomocí proměnných prostředí v `docker-compose.yaml` pro použití některých zahrnutých služeb:

*   **Ollama** (`OLLAMA_BASE_URL=http://host.docker.internal:11434`)
*   **SearxNG pro RAG** (`SEARXNG_QUERY_URL=http://host.docker.internal:11505`)
*   **Apache Tika pro RAG** (`TIKA_SERVER_URL=http://host.docker.internal:11560`)
*   **API OpenRouter (přes koncový bod OpenAI)**: Vyžaduje klíč API (`OPENROUTER_API_KEY`) v souboru `.env` v kořenovém adresáři projektu.

Konfiguraci můžete dále přizpůsobit úpravou proměnných prostředí v `docker-compose.yaml` a restartováním rozšíření. Pro všechny dostupné možnosti se podívejte do [dokumentace Open WebUI](https://docs.openwebui.com/).

## Předpoklady (Akcelerace NVIDIA GPU)

Před použitím rozšíření **musíte** **bezpodmínečně** provést následující kroky, abyste mohli využívat akceleraci GPU s kartami NVIDIA:

1.  **Nainstalovat ovladače NVIDIA**: Stáhněte a nainstalujte nejnovější ovladače NVIDIA pro váš operační systém a grafickou kartu z [oficiálních stránek NVIDIA](https://www.nvidia.com/Download/index.aspx).
2.  **Povolit podporu GPU v Docker Desktop**: Přejděte do `Settings` > `Resources` > `Advanced` a povolte možnost `Enable GPU acceleration` (nebo podobnou, přesný název se může lišit).
3.  **Restartovat Docker Desktop**: Po instalaci ovladačů a změně nastavení restartujte Docker Desktop.

Rozšíření automaticky zkontroluje, zda je nástroj `nvidia-smi` detekovatelný. Pokud ne, zobrazí pokyny, které vás provedou.

*(Poznámka: Standardní podpora GPU Docker Desktop pro NVIDIA není k dispozici v macOS.)*

## Jak to funguje

Rozšíření:

1.  Spustí služby definované v `docker-compose.yaml`.
2.  Zkontroluje přítomnost nástrojů NVIDIA ve vašem hostitelském systému pomocí malého binárního souboru.
3.  Pokud jsou nástroje detekovány (`nvidia-smi`), rozhraní Open WebUI (a další nakonfigurované služby) se zobrazí a bude moci používat GPU.
4.  Pokud nástroje nejsou detekovány nebo pokud OS není podporován (macOS), **nejprve** se zobrazí průvodce s pokyny k předpokladům před načtením hlavního rozhraní.

## Jak nainstalovat

- Nainstalujte a spusťte [Docker Desktop](https://www.docker.com/products/docker-desktop/) (nebo Docker Desktop, pokud je kompatibilní).
- Ujistěte se, že jsou splněny předpoklady pro GPU (viz výše), pokud chcete hardwarovou akceleraci.
- Spusťte příkaz:

  ```sh
  docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  # Příklad: docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest
  ```

## Jak odinstalovat

- Spusťte příkaz:

  ```sh
  docker extension uninstall ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  ```

## Jak sestavit obraz rozšíření

- Spusťte příkaz:

  ```sh
  docker build -t <your-extension-image-name>:<tag> .
  # Příklad: docker build -t mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest .
  ```

*(Příkazy `rdctl` lze také použít, pokud používáte Rancher Desktop)*

## Jak vydat verzi

```sh
gh release create vX.Y.Z --generate-notes
``` 