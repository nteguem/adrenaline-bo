import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Description as DocumentIcon,
  BrokenImage as NoLinkIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

interface TicketDisplayProps {
  ticketUrl: string;
}

const TicketDisplay: React.FC<TicketDisplayProps> = ({ ticketUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  
  // Vérifier si l'URL est valide
  const isValidUrl = !!ticketUrl && ticketUrl.trim() !== '';

  const handleClick = () => {
    if (!isValidUrl) return;
    // Si l'image a échoué, ouvrir directement dans un nouvel onglet (PDF/Autre)
    if (imageFailed) {
      window.open(ticketUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    // Sinon, afficher en modal
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Rendu de la miniature
  const renderThumbnail = () => {
    if (!isValidUrl) {
      return (
        <Box
          sx={{
            width: 60,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            cursor: 'default',
          }}
        >
          <NoLinkIcon sx={{ color: '#999', fontSize: 24 }} />
        </Box>
      );
    }

    // Essayer d'afficher l'image d'abord; fallback document si erreur
    return (
      <Box
        onClick={handleClick}
        sx={{
          width: 60,
          height: 40,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: isValidUrl ? 'pointer' : 'default',
          border: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s',
          },
          backgroundColor: imageFailed ? '#f5f5f5' : 'transparent',
          position: 'relative',
        }}
      >
        {!imageFailed ? (
          <img
            src={ticketUrl}
            alt="Ticket thumbnail"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <>
            <DocumentIcon sx={{ color: '#666', fontSize: 20 }} />
            <OpenInNewIcon 
              sx={{ 
                color: '#666', 
                fontSize: 12,
                position: 'absolute',
                top: 2,
                right: 2
              }} 
            />
          </>
        )}
      </Box>
    );
  };

  // Rendu de la modale (seulement si l'image a bien chargé)
  const renderModal = () => {
    if (!isValidUrl || imageFailed) return null;

    return (
      <Dialog
        open={isModalOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#141414',
            color: 'white',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#141414',
            color: 'white',
          }}
        >
          <Typography variant="h6">
            Aperçu du ticket
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent
          sx={{
            backgroundColor: '#141414',
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '70vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2,
            }}
          >
            <img
              src={ticketUrl}
              alt="Ticket complet"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
              onError={() => {
                setIsModalOpen(false);
                setImageFailed(true);
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      {renderThumbnail()}
      {renderModal()}
    </>
  );
};

export default TicketDisplay;