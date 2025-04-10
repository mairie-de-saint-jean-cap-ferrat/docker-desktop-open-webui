import React, { useState } from 'react';
import {
  Box,
  Typography,
  Link,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Alert,
  AlertTitle,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';

type PrerequisitesGuideProps = {
  status: string | null;
  platform: string;
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
};

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// Contenu des scripts mis à jour selon la documentation Ollama
const linuxScript = `#!/bin/bash
# ATTENTION : Vérifiez et adaptez ce script avant exécution !
# Ce script suit les instructions de la documentation Ollama pour Debian/Ubuntu.
# L'exécution de commandes avec sudo peut modifier votre système.

# 1. Configurer le dépôt NVIDIA Container Toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
| sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
&& curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list \
| sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
| sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list \
&& sudo apt-get update

# 2. Installer les paquets NVIDIA Container Toolkit
sudo apt-get install -y nvidia-container-toolkit

# 3. Configurer Docker pour utiliser le runtime NVIDIA
#    Attention : Cette étape modifie la configuration Docker globale.
sudo nvidia-ctk runtime configure --runtime=docker

# 4. Redémarrer le service Docker
sudo systemctl restart docker

echo "Le NVIDIA Container Toolkit devrait être installé et configuré."
echo "Vérifiez la configuration Docker et redémarrez Docker Desktop si nécessaire."
echo "Après cela, l'accélération GPU devrait être disponible pour les conteneurs Ollama."
`;

// Pour Windows, le processus principal reste le téléchargement manuel des pilotes.
// Le NVIDIA Container Toolkit n'est pas directement applicable de la même manière que sur Linux.
// On guide l'utilisateur vers l'installation des pilotes et la configuration Docker Desktop.
const windowsGuide = `
L'accélération GPU NVIDIA sous Windows via Docker Desktop repose principalement sur :
1.  **Installation des pilotes NVIDIA:**
    - Téléchargez et installez les derniers pilotes NVIDIA pour votre carte graphique depuis le site officiel.
    - Lien : https://www.nvidia.com/Download/index.aspx
    - Redémarrez votre machine après l'installation des pilotes.

2.  **Activation du support GPU dans Docker Desktop:**
    - Allez dans Paramètres > Resources > Advanced.
    - Assurez-vous que l'option "Enable GPU acceleration" (ou similaire) est cochée, si disponible pour votre version de Docker Desktop et WSL.

3.  **Redémarrage de Docker Desktop:**
    - Redémarrez Docker Desktop après avoir installé les pilotes et vérifié les paramètres.

L'outil 'nvidia-smi.exe' (généralement dans C:\Program Files\NVIDIA Corporation\NVSMI\) permet de vérifier que les pilotes sont bien installés et détectent votre GPU.

Cette extension tentera d'utiliser l'accélération GPU si elle est correctement configurée sur votre système et dans Docker Desktop.
`;

export const PrerequisitesGuide: React.FC<PrerequisitesGuideProps> = ({ status, platform, showSuccessToast, showErrorToast }) => {
  const [openModal, setOpenModal] = useState<'linux' | 'windows' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOpenModal = (type: 'linux' | 'windows') => setOpenModal(type);
  const handleCloseModal = () => setOpenModal(null);

  const handleCopyToClipboard = (script: string) => {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      showSuccessToast('Script copié dans le presse-papier !');
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy script: ', err);
      showErrorToast('Erreur lors de la copie du script.');
    });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  let title = 'Prérequis pour l\'accélération GPU (Optionnel)';
  let content;
  let showGuidanceButtons = false;

  switch (status) {
    case 'NVIDIA_TOOLS_NOT_FOUND':
      title = 'Accélération GPU NVIDIA non détectée';
      showGuidanceButtons = platform === 'linux' || platform === 'win32';
      content = (
        <>
           <Alert severity="info" sx={{ mb: 2 }}>
               <AlertTitle>Information</AlertTitle>
               L'accélération GPU avec les cartes NVIDIA est **optionnelle** mais recommandée pour de meilleures performances. L'extension fonctionnera en mode CPU si les prérequis GPU ne sont pas satisfaits.
            </Alert>
          <Typography paragraph>
            L'extension n'a pas détecté les outils NVIDIA (`nvidia-smi` ou configuration Docker adéquate) pour utiliser l'accélération GPU.
          </Typography>
          <Typography paragraph>
            Pour activer l'accélération GPU (si vous avez une carte NVIDIA compatible) :
          </Typography>
          <List dense>
             {platform === 'linux' && (
                 <ListItem>
                    <ListItemIcon>
                        <InfoIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Installez le NVIDIA Container Toolkit :"
                        secondary="Suivez les instructions fournies dans le guide Linux ci-dessous."
                     />
                 </ListItem>
             )}
            {platform === 'win32' && (
                <ListItem>
                    <ListItemIcon>
                        <InfoIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Installez les pilotes NVIDIA et configurez Docker Desktop :"
                        secondary="Suivez les instructions fournies dans le guide Windows ci-dessous."
                    />
                </ListItem>
            )}
             <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Redémarrez Docker Desktop après avoir effectué les configurations nécessaires."
              />
            </ListItem>
          </List>
        </>
      );
      break;
    case 'UNSUPPORTED_OS':
      title = 'Accélération GPU non supportée sur cet OS';
      content = (
        <>
         <Alert severity="info" sx={{ mb: 2 }}>
           <AlertTitle>Information</AlertTitle>
            L'extension fonctionnera en utilisant le CPU.
         </Alert>
          <Typography paragraph>
            L'accélération GPU NVIDIA via Docker Desktop n'est actuellement pas prise en charge de manière standard sur macOS.
          </Typography>
        </>
      );
      break;
    case 'ERROR':
       title = 'Erreur lors de la vérification GPU';
       content = (
         <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Attention</AlertTitle>
            Une erreur s'est produite lors de la vérification des prérequis GPU. L'extension tentera de fonctionner en mode CPU.
            Consultez les logs pour plus de détails.
          </Alert>
           <Typography paragraph color="error">
             Détails de l'erreur lors de la vérification : {status}
           </Typography>
        </>
       );
       break;
    default:
      title = 'Vérification des prérequis GPU';
       content = (
         <Typography paragraph>
           Statut de la vérification GPU : {status || 'Non déterminé'}. L'extension va démarrer. Si l'accélération GPU est attendue mais non détectée ('OK' non retourné), vérifiez les guides.
         </Typography>
       );
       showGuidanceButtons = false;
       break;
  }

  const scriptContent = openModal === 'linux' ? linuxScript : windowsGuide;
  const isWindowsModal = openModal === 'windows';

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', width: '100%' }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          {title}
        </Typography>
        {content}

        {showGuidanceButtons && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
             <Typography variant="body2" gutterBottom>
               Guides pour activer l'accélération GPU NVIDIA (Optionnel) :
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              {platform === 'linux' && (
                <Button variant="outlined" onClick={() => handleOpenModal('linux')}>
                  Voir Guide Linux (NVIDIA Toolkit)
                </Button>
              )}
              {platform === 'win32' && (
                <Button variant="outlined" onClick={() => handleOpenModal('windows')}>
                  Voir Guide Windows (Pilotes & Docker)
                </Button>
              )}
            </Stack>
          </Box>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button 
                variant="contained" 
                startIcon={<RefreshIcon />} 
                onClick={handleRefresh}
            >
                Rafraîchir la vérification
            </Button>
        </Box>

        <Typography sx={{ mt: 3, fontSize: '0.9em', textAlign: 'center', color: 'text.secondary' }}>
           Une fois les prérequis satisfaits (si applicable), veuillez redémarrer Docker Desktop puis rafraîchir cette page.
        </Typography>
      </Paper>

      <Dialog open={openModal !== null} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {isWindowsModal ? 'Guide pour Windows (Pilotes NVIDIA & Docker Desktop)' : 'Guide d\'installation pour Linux (NVIDIA Container Toolkit)'}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
            <Alert severity={isWindowsModal ? "info" : "warning"} sx={{ mb: 2 }}>
                <AlertTitle>{isWindowsModal ? "Instructions" : "Attention !"}</AlertTitle>
                 {isWindowsModal
                    ? "Suivez ces étapes pour configurer l'accélération GPU sous Windows."
                    : "L'exécution de scripts, surtout avec sudo, peut modifier votre système. Vérifiez, comprenez et adaptez ce script si nécessaire."
                }
            </Alert>
          <Box sx={{ position: 'relative', bgcolor: 'grey.100', p: 1, borderRadius: 1, maxHeight: '400px', overflowY: 'auto' }}>
            {!isWindowsModal && (
                 <IconButton
                     size="small"
                     onClick={() => handleCopyToClipboard(scriptContent)}
                     sx={{ position: 'absolute', top: 8, right: 8 }}
                     title="Copier le script"
                 >
                     <ContentCopyIcon fontSize="inherit" />
                 </IconButton>
             )}
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                <code>{scriptContent}</code>
            </pre>
          </Box>
           {!isWindowsModal && copied && <Typography sx={{ color: 'success.main', textAlign: 'right', mt: 1 }}>Copié !</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 