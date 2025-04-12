import React from 'react';
import WebpageFrame from './WebpageFrame';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import LoadingView from './LoadingView';


// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [response, setResponse] = React.useState<string>();
  
  const ddClient = useDockerDesktopClient();

  const fetchAndDisplayResponse = async () => {
    const result = await ddClient.extension.vm?.service?.get('/');
    setResponse(JSON.stringify(result));
  };

  return (
    <>
      <WebpageFrame />
    </>
  );
}
