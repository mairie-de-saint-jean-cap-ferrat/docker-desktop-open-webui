# Open WebUI Docker Extension Suite

![Yo AI Lab Logo](yo-ai-lab.png)

[![Build](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml/badge.svg?branch=main&event=release)](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml)

Extension Docker Desktop qui déploie une suite d'outils centrée autour de [Open WebUI](https://docs.openwebui.com/), configurée pour l'accélération GPU NVIDIA (si disponible) et divers services complémentaires, le tout accessible via une interface unifiée.

![Extension Screenshot](screenshot.png)

## Fonctionnalités Principales

*   **Interface Unifiée** : Une barre de navigation permet de basculer facilement entre les interfaces web des différents services inclus (Open WebUI, Jupyter, MinIO Console, etc.) sans quitter l'extension.
*   **Open WebUI Pré-configuré** : Interface web pour interagir avec les modèles de langage locaux (via Ollama) ou distants (API OpenAI, OpenRouter). Accélération GPU NVIDIA activée par défaut (`ghcr.io/open-webui/open-webui:dev-cuda`).
*   **Vérification GPU Intégrée** : Détecte la présence des outils NVIDIA (`nvidia-smi`) et guide l'utilisateur si les prérequis ne sont pas remplis (uniquement pour l'affichage initial, l'interface principale reste accessible).
*   **Suite de Services** : Inclut plusieurs services utiles pour l'IA et le développement.
*   **Informations d'Identification Rapides** : Un bouton dans la barre de navigation affiche les identifiants par défaut des services (Jupyter, MinIO) dans une fenêtre modale.

## Services Inclus

Cette extension déploie les services suivants (accessibles via `http://host.docker.internal:<PORT>` depuis Open WebUI ou d'autres conteneurs du même réseau Docker) :

*   **Open WebUI** (`:11500`) : L'interface principale pour interagir avec les LLMs.
*   **Ollama** (`:11434`) : Runner pour les modèles de langage locaux. *Intégration : Automatiquement configuré (`OLLAMA_BASE_URL`)*.
*   **LibreTranslate** (`:11553`) : Serveur de traduction automatique open-source. *Intégration : Non intégrée par défaut à Open WebUI.*
*   **SearxNG** (`:11505`) : Méta-moteur de recherche respectueux de la vie privée. *Intégration : Configuré comme moteur de recherche web par défaut pour RAG (`SEARXNG_QUERY_URL`)*.
*   **Docling Serve** (`:11551`) : Serveur OCR (Reconnaissance Optique de Caractères). *Intégration : Non intégrée par défaut à Open WebUI.*
*   **OpenAI Edge TTS** (`:11550`) : Serveur Text-to-Speech utilisant le service Edge de Microsoft. *Intégration : Non intégrée par défaut à Open WebUI.*
*   **Jupyter Notebook** (`:11552`) : Environnement de développement interactif. *Intégration : Aucune directe. Accessible via son port.*
*   **MinIO** (`:11556` Console, `:11557` Endpoint S3) : Stockage objet compatible S3. *Intégration : Peut être configuré comme fournisseur de stockage dans Open WebUI (variables `STORAGE_PROVIDER`, `S3_*`).*
*   **Redis** (`:11558`) : Base de données clé-valeur en mémoire. *Intégration : Peut être utilisé pour la gestion des WebSockets (`WEBSOCKET_MANAGER`, `WEBSOCKET_REDIS_URL`) et la mise en cache (non configuré par défaut).*
*   **Apache Tika** (`:11560`) : Boîte à outils d'extraction de contenu. *Intégration : Configuré pour l'extraction de texte RAG (`TIKA_SERVER_URL`)*.
*   **MCP Tools** (Ports `11561` à `11570`) : Ensemble d'outils pour le framework MCP (Multi-agent Conversation Protocol) incluant `filesystem`, `memory`, `time`, `fetch`, `everything`, `sequentialthinking`, `sqlite`, `redis`. *Intégration : Aucune. Non accessibles via la barre de navigation.*
*   **MCP_DOCKER Service** (Via Extension SDK) : Service fourni par Docker Inc. donnant accès à divers outils IA via le serveur MCP configuré par l'extension "AI Tool Catalog". *Intégration : Communication gérée par le SDK de l'extension Docker Desktop.*

## Interface Utilisateur de l'Extension

L'interface principale de l'extension se compose de :

1.  **Barre de Navigation Supérieure** :
    *   Affiche le nom "Services:".
    *   Contient des boutons pour chaque service disposant d'une interface web (Open WebUI, LibreTranslate, SearxNG, Docling Serve, Jupyter, MinIO Console). Le bouton du service actif est mis en évidence.
    *   Un bouton d'information (`i`) à droite ouvre une fenêtre modale affichant les identifiants par défaut pour Jupyter et MinIO.
2.  **Cadre Principal (Iframe)** :
    *   Affiche l'interface web du service sélectionné via la barre de navigation.

## Configuration Open WebUI

Open WebUI est pré-configuré via des variables d'environnement dans `docker-compose.yaml` pour utiliser certains services inclus :

*   **Ollama** (`OLLAMA_BASE_URL=http://host.docker.internal:11434`)
*   **SearxNG pour RAG** (`SEARXNG_QUERY_URL=http://host.docker.internal:11505`)
*   **Apache Tika pour RAG** (`TIKA_SERVER_URL=http://host.docker.internal:11560`)
*   **API OpenRouter (via OpenAI endpoint)** : Nécessite une clé API (`OPENROUTER_API_KEY`) dans un fichier `.env` à la racine du projet.

Vous pouvez personnaliser davantage la configuration en modifiant les variables d'environnement dans `docker-compose.yaml` et en redémarrant l'extension. Consultez la [documentation Open WebUI](https://docs.openwebui.com/) pour toutes les options disponibles.

## Prérequis (Accélération GPU NVIDIA)

Pour bénéficier de l'accélération GPU avec les cartes NVIDIA, vous devez **impérativement** effectuer les étapes suivantes **avant** d'utiliser l'extension :

1.  **Installer les pilotes NVIDIA** : Téléchargez et installez les derniers pilotes NVIDIA pour votre système d'exploitation et votre carte graphique depuis le [site officiel NVIDIA](https://www.nvidia.com/Download/index.aspx).
2.  **Activer le support GPU dans Docker Desktop** : Allez dans `Settings` > `Resources` > `Advanced` et activez l'option `Enable GPU acceleration` (ou similaire, le nom exact peut varier).
3.  **Redémarrer Docker Desktop** : Après l'installation des pilotes et la modification des paramètres, redémarrez Docker Desktop.

L'extension vérifiera automatiquement si l'outil `nvidia-smi` est détectable. Si ce n'est pas le cas, elle affichera des instructions pour vous guider.

*(Note : Le support GPU standard de Docker Desktop pour NVIDIA n'est pas disponible sur macOS.)*

## Fonctionnement

L'extension va :

1.  Démarrer les services définis dans `docker-compose.yaml`.
2.  Vérifier la présence des outils NVIDIA sur votre système hôte via un petit binaire.
3.  Si les outils sont détectés (`nvidia-smi`), l'interface Open WebUI (et les autres services configurés) sera affichée et pourra utiliser le GPU.
4.  Si les outils ne sont pas détectés ou si l'OS n'est pas supporté (macOS), un guide s'affichera **initialement** avec les instructions des prérequis avant de charger l'interface principale.

## Comment installer

- Installez et lancez [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Desktop, si compatible).
- Assurez-vous que les prérequis GPU (voir ci-dessus) sont satisfaits si vous souhaitez l'accélération matérielle.
- Exécutez la commande :

  ```sh
  docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  # Exemple: docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest
  ```

## Comment désinstaller

- Exécutez la commande :

  ```sh
  docker extension uninstall ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  ```

## Comment construire l'image de l'extension

- Exécutez la commande :

  ```sh
  docker build -t <nom-de-votre-image-extension>:<tag> .
  # Exemple: docker build -t mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest .
  ```

*(Les commandes `rdctl` peuvent aussi être utilisées si vous utilisez Rancher Desktop)*

## Comment Release

```sh
gh release create vX.Y.Z --generate-notes
```
