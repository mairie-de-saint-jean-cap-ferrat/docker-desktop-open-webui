import React, { useState, useEffect, useCallback } from 'react';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import WebpageFrame from './WebpageFrame';
import InstallView from './InstallView';
import LoadingView from './LoadingView';
import ToastNotification from './ToastNotification';
import { PrerequisitesGuide } from './PrerequisitesGuide';
import { Box, Typography } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ddClient = createDockerDesktopClient();

export function App() {
  const [gpuStatus, setGpuStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>('');
  const [checked, setChecked] = useState(false);

  const showSuccessToast = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showErrorToast = useCallback((message: string) => {
    toast.error(message);
  }, []);

  useEffect(() => {
    const checkPrerequisites = async () => {
      setError(null);
      setGpuStatus(null);
      let currentPlatform = '';
      try {
        if (!ddClient.extension?.host) {
          throw new Error("Docker Desktop extension host API not available.");
        }

        currentPlatform = ddClient.host.platform;
        setPlatform(currentPlatform);

        const isWindows = currentPlatform === 'win32';
        const command = isWindows ? 'installer.exe' : 'installer';
        
        console.log(`Executing initial check: ${command}`);
        const result = await ddClient.extension.host.cli.exec(command, []);
        console.log('Initial check result:', result);
        
        const status = result.stdout.trim();
        console.log(`Initial GPU Status: ${status}`);
        setGpuStatus(status);

        if (result.stderr) {
          console.warn(`Prerequisite check stderr: ${result.stderr}`);
        }
      } catch (err: any) {
        console.error('Error checking prerequisites on load:', err);
        const errorMessage = `Failed initial prerequisite check (${err.code || 'unknown'}): ${err.stderr || err.stdout || err.message || JSON.stringify(err)}`;
        setError(errorMessage);
        setGpuStatus('ERROR');
      } finally {
        setChecked(true);
      }
    };

    checkPrerequisites();
  }, []);

  let content;
  if (!checked) {
    content = <LoadingView />;
  } else if (error) {
    content = (
       <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">Erreur lors de la vérification initiale</Typography>
        <Typography sx={{ mt: 1, color: 'error.main', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {error}
        </Typography>
         <Typography sx={{ mt: 2 }}>
            Veuillez vérifier les logs de l'extension et essayer de rafraîchir.
        </Typography>
      </Box>
    );
  } else if (gpuStatus === 'OK') {
    content = <WebpageFrame />;
  } else {
    content = <InstallView 
                status={gpuStatus} 
                platform={platform} 
                showSuccessToast={showSuccessToast} 
                showErrorToast={showErrorToast} 
              />;
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" 
      />
      {content}
    </>
  );
}
