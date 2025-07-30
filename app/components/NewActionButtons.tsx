import React, { useState } from 'react';
import { 
  Button, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress 
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import AddDateDialog from './AddDateDialog'; // Utiliser le bon nom
import { deleteEvent, updateEvent, fetcherCustom } from '@/app/components/apiFetcher';
import { useCookies } from '@/app/context/userContext';

interface DateRow {
  id: string;
  date: string;
  endDate: string;
  ville: string;
  salle: string;
  participants: number;
  statut: string;
  tirage: string;
  placement: string[];
  actions: string;
}

interface NewActionButtonsProps {
  eventData: DateRow;
  onEventUpdated: () => void; // Callback pour actualiser les données
  onToggleDetails?: () => void; // Pour afficher/masquer les détails
  tableType?: string;
  pageType?: string;
}

export default function NewActionButtons({ 
  eventData, 
  onEventUpdated, 
  onToggleDetails,
  tableType,
  pageType 
}: NewActionButtonsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const cookie = useCookies();
  const token = cookie.cookie;

  // Gestion de la modification
  const handleEdit = async (updatedEventData: DateRow) => {
    setIsUpdating(true);
    
    try {
      // Préparer les données pour l'API (format attendu par updateEvent)
      const updateData = {
        eventDate: updatedEventData.date,
        endDate: updatedEventData.endDate,
        city: updatedEventData.ville,
        venue: updatedEventData.salle,
        placement: updatedEventData.placement
      };

      const response = await updateEvent(
        eventData.id,
        token,
        "/api/events",
        updateData
      );

      if (response) {
        console.log("Événement mis à jour avec succès");
        onEventUpdated(); // Actualiser les données de la page
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      // Ici vous pouvez ajouter une notification d'erreur
    } finally {
      setIsUpdating(false);
    }
  };

  // Gestion de la suppression
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await deleteEvent(eventData.id, token, "/api/events");
      
      if (response) {
        console.log("Événement supprimé avec succès");
        onEventUpdated(); // Actualiser les données de la page
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      // Ici vous pouvez ajouter une notification d'erreur
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* Bouton Modifier */}
      <Tooltip title="Modifier l'événement">
        <IconButton
          onClick={() => setEditDialogOpen(true)}
          sx={{ 
            color: '#ff9800',
            '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.1)' }
          }}
          size="small"
        >
          <EditIcon />
        </IconButton>
      </Tooltip>

      {/* Bouton Supprimer */}
      <Tooltip title="Supprimer l'événement">
        <IconButton
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ 
            color: '#f44336',
            '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
          }}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>

      {/* Bouton Voir les détails (optionnel) */}
      {onToggleDetails && (
        <Tooltip title="Voir les détails">
          <IconButton
            onClick={onToggleDetails}
            sx={{ 
              color: '#2196f3',
              '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
            }}
            size="small"
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Dialog de modification */}
      <AddDateDialog
        mode="edit"
        eventData={eventData}
        editEvent={handleEdit}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        triggerButton={<></>} // Passer un élément vide pour masquer le bouton par défaut
      />

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#f44336', fontWeight: 'bold' }}>
          ⚠️ Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cet événement ?
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
            <strong>Événement à supprimer :</strong><br />
            📅 <strong>Date :</strong> {new Date(eventData.date).toLocaleDateString()}<br />
            🏙️ <strong>Ville :</strong> {eventData.ville}<br />
            🏛️ <strong>Salle :</strong> {eventData.salle}
          </Box>
          <DialogContentText sx={{ mt: 2, color: '#f44336', fontWeight: 'bold' }}>
            ⚠️ Cette action est irréversible !
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Overlay de chargement pour la modification */}
      {isUpdating && (
        <Box 
          sx={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            flexDirection: 'column'
          }}
        >
          <CircularProgress size={50} sx={{ color: '#ff9800', mb: 2 }} />
          <span style={{ color: 'white', fontSize: '18px' }}>
            Mise à jour en cours...
          </span>
        </Box>
      )}
    </Box>
  );
}