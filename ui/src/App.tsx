import React, { useState, useCallback } from 'react';
import WebpageFrame from './WebpageFrame';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Typography,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

// Define the services with their names and ports
const services = [
  { name: 'Open WebUI', port: 11500, hasUi: true },
  { name: 'LibreTranslate', port: 11553, hasUi: true },
  { name: 'SearxNG', port: 11505, hasUi: true },
  { name: 'Docling Serve', port: 11551, hasUi: true },
  { name: 'Jupyter Notebook', port: 11552, hasUi: true },
  { name: 'MinIO Console', port: 11556, hasUi: true },
  // { name: 'Apache Tika', port: 11560, hasUi: false }, // Tika usually runs as a server, no UI
];

// Filter services that have a UI
const uiServices = services.filter(service => service.hasUi);

// Define credentials
const credentials = {
  jupyter: { token: '123456' },
  minio: { user: 'minioadmin', password: 'minioadmin' },
  // Add default credentials for other services if known and applicable
  // openWebui: { note: 'Authentication disabled by default in this setup (WEBUI_AUTH=False). First user signup becomes admin if enabled.' },
  // libreTranslate: { note: 'No authentication by default.' },
  // searxng: { note: 'No authentication by default.' },
  // doclingServe: { note: 'No authentication by default.' },
};

export function App() {
  const client = useDockerDesktopClient();
  const [selectedPort, setSelectedPort] = useState<number>(uiServices[0]?.port || 11500);
  const [isCredentialsModalOpen, setCredentialsModalOpen] = useState(false); // State for modal visibility
  const [isToolbarVisible, setIsToolbarVisible] = useState(true); // State for toolbar visibility

  const currentUrl = `http://host.docker.internal:${selectedPort}`;

  const handleServiceChange = useCallback((port: number) => {
    setSelectedPort(port);
  }, []);

  const handleOpenCredentialsModal = useCallback(() => {
    setCredentialsModalOpen(true);
  }, []);

  const handleCloseCredentialsModal = useCallback(() => {
    setCredentialsModalOpen(false);
  }, []);

  const toggleToolbar = useCallback(() => {
    setIsToolbarVisible((prev) => !prev);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Logo to toggle toolbar */}
      <Box sx={{ position: 'absolute', top: 2, left: 2, zIndex: 1301, cursor: 'pointer' }}> {/* Ensure logo is above AppBar */}
         <img
            src="/yo-ai-lab.png" // Assuming the logo is in the public folder
            alt="Yo AI Lab Logo"
            height="32" // Adjust size as needed
            onClick={toggleToolbar}
          />
      </Box>

      {/* Service Button Bar - Conditionally Rendered */}
     {isToolbarVisible && (
        <AppBar position="static" color="default" sx={{ flexShrink: 0 }}>
          <Toolbar variant="dense">
             {/* Add some space to the left of Typography to account for the absolute positioned logo */}
             <Box sx={{ width: 40 }} />
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Services:
            </Typography>
            <ButtonGroup variant="outlined" size="small" aria-label="Service selection button group" sx={{ flexGrow: 1 }}>
              {uiServices.map((service) => (
                <Button
                  key={service.port}
                  variant={selectedPort === service.port ? 'contained' : 'outlined'}
                  onClick={() => handleServiceChange(service.port)}
                  sx={{ textTransform: 'none' }}
                >
                  {service.name}
                </Button>
              ))}
            </ButtonGroup>
            {/* Credentials Button */}
            <IconButton
              color="primary"
              aria-label="Show default credentials"
              onClick={handleOpenCredentialsModal}
              sx={{ ml: 1 }} // Add some margin
            >
              <InfoIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Main Content Area - Iframe */}
      <Box sx={{ flexGrow: 1, p: 1, display: 'flex', mt: isToolbarVisible ? 0 : '40px' }}> {/* Adjust margin-top when toolbar is hidden */}
        <WebpageFrame src={currentUrl} />
      </Box>

      {/* Credentials Modal */}
      <Dialog open={isCredentialsModalOpen} onClose={handleCloseCredentialsModal}>
        <DialogTitle>Default Service Credentials</DialogTitle>
        <DialogContent dividers>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Jupyter Notebook"
                secondary={`Token: ${credentials.jupyter.token}`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="MinIO Console"
                secondary={`User: ${credentials.minio.user} / Password: ${credentials.minio.password}`}
              />
            </ListItem>
             <ListItem>
              <ListItemText
                primary="Open WebUI / LibreTranslate / SearxNG / Docling Serve"
                secondary="No authentication configured by default."
              />
            </ListItem>
            {/* Add more list items if needed */}
          </List>
           <Typography variant="caption" display="block" gutterBottom sx={{mt: 2}}>
              Note: These are the defaults set in the docker-compose.yaml or standard defaults. Actual credentials might differ if configurations are changed.
            </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCredentialsModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
