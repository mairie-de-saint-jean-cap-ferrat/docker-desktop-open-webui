import React, { useState, useEffect, useCallback } from 'react';
import WebpageFrame from './WebpageFrame';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Grid,
} from '@mui/material';

// Initialize Docker Desktop client
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

// Updated Interface for the structure of stored API keys & config
interface AppConfig {
  OPENROUTER_API_KEY: string;
  OPENAI_API_KEY: string;
  AZURE_TTS_KEY: string;
  AZURE_TTS_REGION: string;
  BRAVE_SEARCH_API_KEY: string;
  GOOGLE_SEARCH_API_KEY: string;
  GOOGLE_SEARCH_ENGINE_ID: string;
  SERPER_API_KEY: string;
  SERPAPI_API_KEY: string;
  SEARCHAPI_API_KEY: string;
}

// Updated Default state for the configuration
const defaultConfig: AppConfig = {
  OPENROUTER_API_KEY: '',
  OPENAI_API_KEY: '',
  AZURE_TTS_KEY: '',
  AZURE_TTS_REGION: '',
  BRAVE_SEARCH_API_KEY: '',
  GOOGLE_SEARCH_API_KEY: '',
  GOOGLE_SEARCH_ENGINE_ID: '',
  SERPER_API_KEY: '',
  SERPAPI_API_KEY: '',
  SEARCHAPI_API_KEY: '',
};

// Key for storing the entire configuration object
const APP_CONFIG_STORAGE_KEY = 'appConfig';

// Helper to create labels from key names
const formatLabel = (key: string): string => {
  return key
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b(API|TTS|STT|ID|KEY|RAG)\b/g, match => match.toUpperCase()) // Ensure acronyms are uppercase
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
};

export function App() {
  const ddClient = useDockerDesktopClient();
  // State to hold the object of the entire configuration
  const [appConfigInput, setAppConfigInput] = useState<AppConfig>(defaultConfig);
  // State to track if the primary key (OpenRouter) was loaded
  const [primaryKeyLoaded, setPrimaryKeyLoaded] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Function to reload config from backend service
  const reloadConfigFromSettings = useCallback(async () => {
    try {
      // Use ddClient.extension.vm.service to call the backend GET endpoint
      const loadedConfig = await ddClient.extension.vm.service.get('/api/config');
      if (typeof loadedConfig === 'object' && loadedConfig !== null) {
        setAppConfigInput({ ...defaultConfig, ...(loadedConfig as Partial<AppConfig>) });
      } else {
        setAppConfigInput(defaultConfig);
      }
    } catch (err: unknown) {
      console.error("Error reloading config from backend:", err);
      // Avoid showing error snackbar on initial load if config simply doesn't exist yet
      // setSnackbarState({ open: true, message: 'Error reloading saved configuration from backend.', severity: 'error' });
      setAppConfigInput(defaultConfig);
    }
  }, [ddClient]);

  // Load saved configuration on component mount
  useEffect(() => {
    const loadAppConfig = async () => {
      setIsLoading(true);
      try {
        // Use the reload function directly
        await reloadConfigFromSettings();
        // Need to check the state *after* reload attempts to set primary key status
        // This requires awaiting the promise or checking state in a subsequent effect
        // Let's simplify and check after loading state settles

      } catch (err: unknown) { // Ensure 'err' is typed as unknown
         // Error handling is now within reloadConfigFromSettings
         console.error('Initial config load wrapper error (should be handled inside reload):', err);
      } finally {
        // Check primary key status AFTER the config state might have been updated
        // Need a slight delay or another effect, checking immediately might be too soon
        // Simplest: derive primaryKeyLoaded directly from state in render/effects below
        setInitialCheckDone(true);
        setIsLoading(false);
      }
    };
    loadAppConfig();
 // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ddClient]); // reloadConfigFromSettings has ddClient dependency

  // Update primary key status based on loaded config state
  useEffect(() => {
      if(initialCheckDone) { // Only run after initial load attempt
         setPrimaryKeyLoaded(!!appConfigInput.OPENROUTER_API_KEY);
      }
  }, [appConfigInput, initialCheckDone]);

  // Open modal if primary key is not set after initial check
  useEffect(() => {
    if (initialCheckDone && !primaryKeyLoaded) {
      setIsModalOpen(true);
    }
  }, [initialCheckDone, primaryKeyLoaded]);

  // Generic handler for input changes
  const handleConfigInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setAppConfigInput(prev => ({
      ...prev,
      [name as keyof AppConfig]: value,
    }));
  };

  // Function to save configuration and restart services from modal
  const handleSaveFromModal = useCallback(async () => {
    if (!appConfigInput.OPENROUTER_API_KEY) {
      setSnackbarState({
        open: true,
        message: 'OpenRouter API Key is required.',
        severity: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Save the configuration object via backend service
      await ddClient.extension.vm.service.post('/api/config', appConfigInput);
      setPrimaryKeyLoaded(!!appConfigInput.OPENROUTER_API_KEY);
      setSnackbarState({ open: true, message: 'Configuration saved. Restarting services...', severity: 'success' });

      // 2. Filter out empty values before passing to env
      const envVars = Object.entries(appConfigInput)
        .filter(([_key, value]) => value)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

      // 3. Trigger docker compose up with the new config
      await ddClient.docker.compose.up({
        composeFiles: ['docker-compose.yaml'],
        env: envVars,
      });

      setIsModalOpen(false);
      setSnackbarState({
        open: true,
        message: 'Open WebUI restarted successfully with the updated configuration.',
        severity: 'success',
      });

    } catch (err: unknown) { // Ensure 'err' is typed as unknown
      console.error('Error saving config or restarting services:', err);
      let errorMessage = 'Failed to save configuration or restart services.';
      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') { // Safer error message extraction
        errorMessage = `Error: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Error: ${err}`;
      }
      setSnackbarState({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [appConfigInput, ddClient]);

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  const handleModalClose = (
    event: object,
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if ((reason === 'backdropClick' || reason === 'escapeKeyDown') && !primaryKeyLoaded) {
      return;
    }
    // Reload config only if the key was loaded initially
    if (primaryKeyLoaded) {
        reloadConfigFromSettings();
    }
    setIsModalOpen(false);
  };

  // Specific handler for the Cancel button click
  const handleCancelClick = () => {
      // Reload config only if the key was loaded initially (user might have changed inputs)
      if (primaryKeyLoaded) {
          reloadConfigFromSettings();
      }
      setIsModalOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Button to re-open modal */}
      {initialCheckDone && (
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outlined"
          size="small"
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
        >
          Configure Services
        </Button>
      )}

      {/* Main Content Area - Iframe */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {/* Show loading overlay only during initial config check */}
        {isLoading && !initialCheckDone && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 20 }}>
            <CircularProgress />
            <Typography sx={{ ml: 1 }}>Checking configuration...</Typography>
          </Box>
        )}
        <WebpageFrame />
      </Box>

      {/* Configuration Modal */}
      <Dialog open={isModalOpen} onClose={handleModalClose} disableEscapeKeyDown={!primaryKeyLoaded} maxWidth="md">
        <DialogTitle>{primaryKeyLoaded ? 'Update Configuration' : 'Initial Configuration Required'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {primaryKeyLoaded
              ? 'Update API keys below. Services will restart upon saving.'
              : 'OpenRouter API Key is required. Fill in other API keys as needed.'}
          </DialogContentText>
          <Grid container spacing={2}>
            {Object.keys(appConfigInput).map((key) => (
              <Grid item xs={12} sm={6} key={key}>
                <Typography variant="caption" display="block" gutterBottom sx={{ mb: 0.5, fontWeight: 'medium' }}>
                  {formatLabel(key)}{key === 'OPENROUTER_API_KEY' ? ' *' : ''}
                </Typography>
                <TextField
                  margin="dense"
                  id={key}
                  name={key}
                  // Remove the label prop
                  // label={formatLabel(key)}
                  // Determine type based on key name convention
                  type={key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') ? 'password' : 'text'}
                  fullWidth
                  variant="outlined" // Changed variant for better visual structure without label
                  size="small" // Use small size for dense layout
                  value={appConfigInput[key as keyof AppConfig]}
                  onChange={handleConfigInputChange}
                  disabled={isLoading}
                  required={key === 'OPENROUTER_API_KEY'}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={handleCancelClick} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveFromModal}
            variant="contained"
            disabled={isLoading}
            sx={{ minWidth: 80 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Feedback */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarState.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
