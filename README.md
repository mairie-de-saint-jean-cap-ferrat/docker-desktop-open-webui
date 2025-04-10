# Open WebUI Docker Extension (avec vérification GPU)

[![Build](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-rdx-open-webui/actions/workflows/build.yaml/badge.svg?branch=main&event=release)](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-rdx-open-webui/actions/workflows/build.yaml)

Extension Docker Desktop qui déploie [Open WebUI](https://docs.openwebui.com/) (configuré pour utiliser Ollama intégré et l'accélération GPU si disponible) et vérifie les prérequis pour l'accélération GPU NVIDIA.

## Prérequis (Accélération GPU NVIDIA)

Pour bénéficier de l'accélération GPU avec les cartes NVIDIA, vous devez **impérativement** effectuer les étapes suivantes **avant** d'utiliser l'extension :

1.  **Installer les pilotes NVIDIA** : Téléchargez et installez les derniers pilotes NVIDIA pour votre système d'exploitation et votre carte graphique depuis le [site officiel NVIDIA](https://www.nvidia.com/Download/index.aspx).
2.  **Activer le support GPU dans Docker Desktop** : Allez dans `Settings` > `Resources` > `Advanced` et activez l'option `Enable GPU acceleration` (ou similaire, le nom exact peut varier).
3.  **Redémarrer Docker Desktop** : Après l'installation des pilotes et la modification des paramètres, redémarrez Docker Desktop.

L'extension vérifiera automatiquement si l'outil `nvidia-smi` est détectable. Si ce n'est pas le cas, elle affichera des instructions pour vous guider.

*(Note : Le support GPU standard de Docker Desktop pour NVIDIA n'est pas disponible sur macOS.)*

## Fonctionnement

L'extension va :

1.  Démarrer les services définis dans `docker-compose.yaml` (Open WebUI avec Ollama intégré, configuré pour le GPU).
2.  Vérifier la présence des outils NVIDIA sur votre système hôte via un petit binaire.
3.  Si les outils sont détectés (`nvidia-smi`), l'interface Open WebUI sera affichée et pourra utiliser le GPU.
4.  Si les outils ne sont pas détectés ou si l'OS n'est pas supporté (macOS), un guide s'affichera avec les instructions des prérequis.

## Comment installer

- Installez et lancez [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Desktop, si compatible).
- Assurez-vous que les prérequis GPU (voir ci-dessus) sont satisfaits si vous souhaitez l'accélération matérielle.
- Exécutez la commande :

  ```sh
  docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-rdx-open-webui:<tag>
  # Exemple: docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-rdx-open-webui:latest
  ```

## Comment désinstaller

- Exécutez la commande :

  ```sh
  docker extension uninstall ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-rdx-open-webui:<tag>
  ```

## Comment construire l'image de l'extension

- Exécutez la commande :

  ```sh
  docker build -t <nom-de-votre-image-extension>:<tag> .
  # Exemple: docker build -t y0n1x/rd-open-webui-ext:latest .
  ```

*(Les commandes `rdctl` peuvent aussi être utilisées si vous utilisez Docker Desktop)*
