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
  Image as ImageIcon,
} from '@mui/icons-material';

interface TicketDisplayProps {
  ticketUrl: string;
}

const TicketDisplay: React.FC<TicketDisplayProps> = ({ ticketUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Vérifier si l'URL est valide
  const isValidUrl = ticketUrl && ticketUrl.trim() !== '';
  
  // Déterminer le type de fichier
  const getFileType = (url: string): 'image' | 'document' => {
    if (!url) return 'document';
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowercaseUrl = url.toLowerCase();
    
    return imageExtensions.some(ext => lowercaseUrl.includes(ext)) ? 'image' : 'document';
  };

  const fileType = isValidUrl ? getFileType(ticketUrl) : 'none';

  const handleClick = () => {
    if (isValidUrl) {
      setIsModalOpen(true);
    }
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

    if (fileType === 'image') {
      return (
        <Box
          onClick={handleClick}
          sx={{
            width: 60,
            height: 40,
            borderRadius: 1,
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1px solid #ddd',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s',
            },
          }}
        >
          <img
            src={ticketUrl}
            alt="Ticket thumbnail"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              // Si l'image ne charge pas, afficher l'icône document
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f5f5f5;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
              `;
            }}
          />
        </Box>
      );
    }

    // Pour les documents
    return (
      <Box
        onClick={handleClick}
        sx={{
          width: 60,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          cursor: 'pointer',
          border: '1px solid #ddd',
          '&:hover': {
            backgroundColor: '#e0e0e0',
            transform: 'scale(1.05)',
            transition: 'all 0.2s',
          },
        }}
      >
        <DocumentIcon sx={{ color: '#666', fontSize: 24 }} />
      </Box>
    );
  };

  // Rendu de la modale
  const renderModal = () => {
    if (!isValidUrl) return null;

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
            {fileType === 'image' ? 'Aperçu du ticket' : 'Document ticket'}
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
          {fileType === 'image' ? (
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
                  // Si l'image ne charge pas en grand format non plus
                  setIsModalOpen(false);
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '70vh',
                padding: 1,
              }}
            >
              <iframe
                src={ticketUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                }}
                title="Document ticket"
                onError={() => {
                  console.error('Erreur lors du chargement du document');
                }}
              />
            </Box>
          )}
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