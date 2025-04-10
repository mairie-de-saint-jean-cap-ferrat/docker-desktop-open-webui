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

// Contenu des scripts (simples chaînes avec \n et apostrophes échappées)
const linuxScript = '#!/bin/bash\n' +
  '# ATTENTION : Vérifiez et adaptez ce script avant exécution !\n' +
  '# Ce script est un EXEMPLE pour les systèmes basés sur Debian/Ubuntu.\n' +
  '# L\'\'exécution de commandes avec sudo peut modifier votre système.\n\n' +
  '# 1. Identifier le pilote recommandé (peut nécessiter l\'\'installation de ubuntu-drivers-common)\n' +
  '# sudo ubuntu-drivers devices\n\n' +
  '# 2. Installer le pilote recommandé (remplacer <version> par celle recommandée)\n' +
  '# sudo apt update\n' +
  '# sudo apt install nvidia-driver-<version>\n\n' +
  '# 3. Redémarrer le système\n' +
  '# sudo reboot\n\n' +
  'echo "Après le redémarrage, vérifiez l\'\'installation avec \'nvidia-smi\'"\n' +
  'echo "et redémarrez Docker Desktop."\n';

const windowsScript = '# ATTENTION : L\'\'installation des pilotes NVIDIA sous Windows se fait généralement via un exécutable.\n' +
  '# Ce script PowerShell est un EXEMPLE pour TÉLÉCHARGER l\'\'installeur.\n' +
  '# L\'\'exécution de l\'\'installeur téléchargé nécessite des droits administrateur et une confirmation manuelle.\n\n' +
  '$ProgressPreference = \'SilentlyContinue\' # Pour masquer la barre de progression\n\n' +
  '# URL Générique (pointe vers la page de téléchargement, pas un fichier direct)\n' +
  '$downloadPage = "https://www.nvidia.com/Download/index.aspx"\n\n' +
  '# Chemin où sauvegarder (Adaptez si nécessaire)\n' +
  '$outputPath = "$HOME\\Downloads\\nvidia_driver_installer.exe" # NOTE: Ce n\'\'est PAS le vrai nom\n\n' +
  'Write-Host "Ce script NE TÉLÉCHARGERA PAS automatiquement le bon pilote."\n' +
  'Write-Host "Veuillez visiter le site NVIDIA pour obtenir le bon installeur pour votre matériel :"\n' +
  'Write-Host $downloadPage\n' +
  'Write-Host "--- EXEMPLE pour télécharger un fichier (si vous aviez l\'\'URL directe) ---\"\n' +
  'Write-Host "# Invoke-WebRequest -Uri <URL_DIRECTE_DU_PILOTE> -OutFile $outputPath"\n' +
  'Write-Host "# Write-Host \"Installeur (exemple) serait téléchargé ici : $outputPath\""\n' +
  'Write-Host "# Exécutez ensuite l\'\'installeur téléchargé manuellement."\n\n' +
  '# Ouvre la page de téléchargement dans le navigateur par défaut\n' +
  'Start-Process $downloadPage\n\n' +
  'Write-Host "Après installation manuelle et redémarrage, vérifiez avec \'nvidia-smi\'"\n' +
  'Write-Host "(Peut se trouver dans C:\\Program Files\\NVIDIA Corporation\\NVSMI\\)"\n' +
  'Write-Host "et redémarrez Docker Desktop."\n';

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

  let title = 'Prérequis pour l\'accélération GPU';
  let content;
  let showScriptButtons = false;

  switch (status) {
    case 'NVIDIA_TOOLS_NOT_FOUND':
      title = 'Pilotes NVIDIA manquants';
      showScriptButtons = platform === 'linux' || platform === 'win32';
      content = (
        <>
          <Typography paragraph>
            L\'extension n\'a pas détecté les outils NVIDIA (`nvidia-smi`) nécessaires pour utiliser l\'accélération GPU.
          </Typography>
          <Typography paragraph>
            Veuillez suivre ces étapes :
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Téléchargez et installez les derniers pilotes NVIDIA pour votre carte graphique :"
                secondary={<Link href="https://www.nvidia.com/Download/index.aspx" target="_blank" rel="noopener noreferrer">Site de téléchargement NVIDIA</Link>}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Assurez-vous que le support GPU est activé dans Docker Desktop :"
                secondary="Paramètres > Resources > Advanced > Enable GPU acceleration (si disponible)"
              />
            </ListItem>
             <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Redémarrez Docker Desktop après l'installation des pilotes."
              />
            </ListItem>
          </List>
        </>
      );
      break;
    case 'UNSUPPORTED_OS':
      title = 'Système d\'exploitation non supporté';
      content = (
        <Typography paragraph>
          L\'accélération GPU via Docker Desktop n\'est actuellement pas prise en charge de manière standard sur macOS avec les GPU NVIDIA.
          L\'extension fonctionnera sans accélération matérielle spécifique.
        </Typography>
      );
      break;
    case 'ERROR':
       title = 'Erreur lors de la vérification';
      content = (
        <Typography paragraph color="error">
          Une erreur s\'est produite lors de la vérification des prérequis GPU. Veuillez consulter les logs de l\'extension pour plus de détails.
        </Typography>
      );
      break;
    default:
      title = 'Statut inconnu';
      content = (
        <Typography paragraph>
          Impossible de déterminer le statut des prérequis GPU ({status}).
        </Typography>
      );
  }

  const scriptContent = openModal === 'linux' ? linuxScript : windowsScript;

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', width: '100%' }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          {title}
        </Typography>
        {content}

        {showScriptButtons && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
             <Typography variant="body2" gutterBottom>
               Exemples de scripts pour l'installation (à vérifier et adapter) :
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              {platform === 'linux' && (
                <Button variant="outlined" onClick={() => handleOpenModal('linux')}>
                  Voir script Linux (Exemple)
                </Button>
              )}
              {platform === 'win32' && (
                <Button variant="outlined" onClick={() => handleOpenModal('windows')}>
                  Voir aide Windows
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
          Exemple de script pour {openModal === 'linux' ? 'Linux (Debian/Ubuntu)' : 'Windows (PowerShell)'}
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
            <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>Attention !</AlertTitle>
                L'exécution de scripts, surtout avec des privilèges élevés (sudo/admin), peut modifier en profondeur votre système. 
                <strong>Vérifiez, comprenez et adaptez ce script à votre configuration spécifique avant toute exécution.</strong> 
                Ce script est fourni à titre indicatif et sans garantie.
            </Alert>
          <Box sx={{ position: 'relative', bgcolor: 'grey.100', p: 1, borderRadius: 1, maxHeight: '400px', overflowY: 'auto' }}>
            <IconButton
              size="small"
              onClick={() => handleCopyToClipboard(scriptContent)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
              title="Copier le script"
            >
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                <code>{scriptContent}</code>
            </pre>
          </Box>
           {copied && <Typography sx={{ color: 'success.main', textAlign: 'right', mt: 1 }}>Copié !</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 