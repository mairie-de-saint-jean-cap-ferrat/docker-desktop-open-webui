import React from 'react';
import { PrerequisitesGuide } from './PrerequisitesGuide';
// Supprimer le CSS s'il n'est plus utile
// import './InstallView.css';

// Définir les props attendues depuis App.tsx
type InstallViewProps = {
    status: string | null;
    platform: string;
    showSuccessToast: (message: string) => void;
    showErrorToast: (message: string) => void;
}

export default function InstallView({ 
    status, 
    platform, 
    showSuccessToast, 
    showErrorToast 
}: InstallViewProps) {
    // Remplacer l'ancien contenu par l'affichage du guide
    // Passer les props nécessaires à PrerequisitesGuide
    return (
        <PrerequisitesGuide 
            status={status} 
            platform={platform} 
            showSuccessToast={showSuccessToast} 
            showErrorToast={showErrorToast} 
        />
    );
    /* Ancien contenu:
    return <div className="install-wrapper">
        <h2>Ollama needs to be installed</h2>
        <button onClick={install}>Install</button>
    </div>;
    */
}
