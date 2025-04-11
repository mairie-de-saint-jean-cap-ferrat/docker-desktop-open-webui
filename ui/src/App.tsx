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
      console.log('Starting prerequisite check...');
      setError(null);
      setGpuStatus(null);
      setChecked(false);
      let currentPlatform = '';
      try {
        if (!ddClient.extension?.host?.cli) {
          throw new Error("Docker Desktop extension host CLI API not available.");
        }

        console.log('Getting host platform...');
        currentPlatform = ddClient.host.platform;
        console.log(`Host platform: ${currentPlatform}`);
        setPlatform(currentPlatform);

        const isWindows = currentPlatform === 'win32';
        const command = isWindows ? 'installer.exe' : 'installer';
        
        console.log(`Executing check command: ${command}`);
        const result = await ddClient.extension.host.cli.exec(command, []);
        console.log('Check command finished.', 'Result:', result);
        
        const status = result.stdout.trim();
        console.log(`Initial GPU Status from stdout: "${status}"`);
        setGpuStatus(status);

        if (result.stderr) {
          console.warn(`Prerequisite check command stderr: ${result.stderr}`);
        }
        console.log('Prerequisite check successful.');
      } catch (err: any) {
        console.error('Error during prerequisite check:', err);
        const errorMessage = `Failed prerequisite check (${err?.code || 'unknown error'}): ${err?.stderr || err?.stdout || err?.message || JSON.stringify(err)}`;
        console.log(`Setting error state: "${errorMessage}"`);
        setError(errorMessage);
        console.log('Setting GPU status to ERROR');
        setGpuStatus('ERROR');
      } finally {
        console.log('Prerequisite check finished (finally block). Setting checked to true.');
        setChecked(true);
      }
    };

    checkPrerequisites();
  }, []);

  console.log(`Rendering App - checked: ${checked}, error: ${error}, gpuStatus: ${gpuStatus}`);

  let content;
  if (!checked) {
    console.log('Rendering LoadingView because checked is false.');
    content = <LoadingView />;
  } else if (error) {
    console.log('Rendering Error view.');
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
  } else {
    console.log('Rendering WebpageFrame because check is complete and no fatal error occurred.');
    content = <WebpageFrame />;
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
      {/* ToastNotification pourrait être intégré ici si nécessaire, mais il semble indépendant */}
      {/* <ToastNotification /> */}
      {content}
    </>
  );
}
