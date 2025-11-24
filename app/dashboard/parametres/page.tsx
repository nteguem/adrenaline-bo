"use client";
import React, { useState } from "react";
import { Button, CircularProgress, Typography, Box, Alert } from "@mui/material";
import { fetcherCustom } from "@/app/components/apiFetcher";
import { useCookies } from "@/app/context/userContext";
import styles from "@/app/ui/dashboard/dashboard.module.css";

export default function Page() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const cookie = useCookies();
  const token = cookie.cookie;

  const exportEmailsWithConsent = async () => {
    setIsExporting(true);
    setExportMessage(null);
    
    try {
      const eventsResponse = await fetcherCustom("/api/events", token);
      
      if (!eventsResponse?.success || !eventsResponse?.data?.events) {
        throw new Error("Impossible de récupérer les événements");
      }

      const events = eventsResponse.data.events;
      let totalExported = 0;
      let filesCreated = 0;

      // Parcourir chaque événement et créer un fichier CSV par événement
      for (const event of events) {
        try {
          const allParticipants: Array<{ email: string; nom: string }> = [];
          let page = 1;
          let hasMore = true;
          const limit = 50000;

          while (hasMore) {
            const response = await fetcherCustom(
              `/api/participants_bo/event/${event.id}?page=${page}&limit=${limit}`,
              token
            );

            if (response?.data?.participants) {
              const participantsWithConsent = response.data.participants
                .filter((p: any) => p.accepteInfos === true)
                .map((p: any) => ({
                  email: p.email,
                  nom: p.nom || ''
                }));

              allParticipants.push(...participantsWithConsent);

              const total = response.data.pagination?.total || 0;
              const loaded = response.data.participants.length;
              hasMore = loaded === limit && allParticipants.length < total;
              page++;
            } else {
              hasMore = false;
            }
          }

          // Supprimer les doublons pour cet événement
          const uniqueParticipants = Array.from(
            new Map(allParticipants.map(p => [p.email.toLowerCase(), p])).values()
          );

          // Créer un fichier CSV uniquement s'il y a des participants avec consentement
          if (uniqueParticipants.length > 0) {
            // CSV avec seulement Nom et Email
            let csvContent = "Nom,Email\n";
            uniqueParticipants.forEach((participant) => {
              csvContent += `"${participant.nom}","${participant.email}"\n`;
            });

            // Télécharger le fichier pour cet événement
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            
            // Nom du fichier avec le nom de l'événement
            const eventName = event.city || event.id;
            const eventDate = event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '';
            const fileName = `emails_consentement_${eventName}_${eventDate}.csv`.replace(/[^a-zA-Z0-9_-]/g, '_');
            
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            totalExported += uniqueParticipants.length;
            filesCreated++;
            
            // Petit délai entre les téléchargements pour éviter les problèmes de navigateur
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Erreur pour l'événement ${event.id}:`, error);
        }
      }

      if (filesCreated === 0) {
        setExportMessage({
          type: 'error',
          text: 'Aucun participant n\'a accepté de recevoir des informations dans aucun événement.'
        });
      } else {
        setExportMessage({
          type: 'success',
          text: `${filesCreated} fichier(s) exporté(s) avec ${totalExported} email(s) au total.`
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      setExportMessage({
        type: 'error',
        text: error instanceof Error ? error.message : "Une erreur est survenue lors de l'export."
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <h1 className={styles.header}>Paramètres</h1>
        
        <Box sx={{ mt: 4, p: 3, backgroundColor: "#1a1a1a", borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
            Export des emails avec consentement
          </Typography>
          
          <Typography variant="body2" sx={{ color: "#aaa", mb: 3 }}>
            Exporter les emails des participants qui ont accepté de recevoir des informations. Un fichier CSV sera créé pour chaque événement avec le nom de l'événement dans le fichier.
          </Typography>

          {exportMessage && (
            <Alert 
              severity={exportMessage.type} 
              sx={{ mb: 2 }}
              onClose={() => setExportMessage(null)}
            >
              {exportMessage.text}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={exportEmailsWithConsent}
            disabled={isExporting}
            sx={{
              backgroundColor: "#0081E6",
              color: "white",
              textTransform: "none",
              padding: "0.8em 2.0em",
              "&:hover": {
                backgroundColor: "#0066b3",
              },
              "&:disabled": {
                backgroundColor: "#4a5565",
              },
            }}
          >
            {isExporting ? (
              <>
                <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                Export en cours...
              </>
            ) : (
              "Exporter les emails avec consentement"
            )}
          </Button>
        </Box>
      </div>
    </div>
  );
}
