import React from 'react';
import WebpageFrame from './WebpageFrame';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import {
  Box,
} from '@mui/material';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const client = useDockerDesktopClient();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Main Content Area - Iframe */}
        <WebpageFrame />
    </Box>
  );
}
