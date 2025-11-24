"use client";
import React, { useState, useEffect } from "react";
import { Button, CircularProgress, Typography, Box, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { fetcherCustom } from "../../components/apiFetcher";
import { useCookies } from "../../context/userContext";
import styles from "@/app/ui/dashboard/dashboard.module.css";
import useSWR from "swr";

interface Event {
  id: string;
  city: string;
  venue: string;
  eventDate: string;
  endDate: string;
  totalParticipants?: number;
  _count?: { participants: number };
}

export default function Page() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const cookie = useCookies();
  const token = cookie.cookie;

  const { data, error } = useSWR(
    token ? `/api/events` : null,
    (url) => fetcherCustom(url, token),
    { revalidateOnFocus: true }
  );

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (data?.data?.events) {
      const sortedEvents = [...data.data.events].sort(
        (a: Event, b: Event) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );
      setEvents(sortedEvents);
    }
  }, [data]);

  const exportEmailsForEvent = async (event: Event) => {
    setIsExporting(event.id);
    setExportMessage(null);
    
    try {
      const allParticipants: Array<{ email: string; nom: string }> = [];
      let page = 1;
      let hasMore = true;
      const limit = 50000;

      // Récupérer tous les participants de cet événement (avec pagination)
      while (hasMore) {
        const response = await fetcherCustom(
          `/api/participants_bo/event/${event.id}?page=${page}&limit=${limit}`,
          token
        );

        if (response?.data?.participants) {
          // Filtrer uniquement les participants qui ont accepté de recevoir des infos
          const participantsWithConsent = response.data.participants
            .filter((p: any) => p.accepteInfos === true)
            .map((p: any) => ({
              email: p.email,
              nom: p.nom || ''
            }));

          allParticipants.push(...participantsWithConsent);

          // Vérifier s'il y a d'autres pages
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

      if (uniqueParticipants.length === 0) {
        setExportMessage({
          type: 'error',
          text: `Aucun participant n'a accepté de recevoir des informations pour ${event.city}.`
        });
        setIsExporting(null);
        return;
      }

      // Créer le fichier CSV avec seulement Nom et Email
      let csvContent = "Nom,Email\n";
      uniqueParticipants.forEach((participant) => {
        csvContent += `"${participant.nom}","${participant.email}"\n`;
      });

      // Télécharger le fichier
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

      setExportMessage({
        type: 'success',
        text: `${uniqueParticipants.length} email(s) exporté(s) pour ${event.city}.`
      });
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      setExportMessage({
        type: 'error',
        text: error instanceof Error ? error.message : "Une erreur est survenue lors de l'export."
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <h1 className={styles.header}>Export des emails avec consentement</h1>
        
        <Typography variant="body2" sx={{ color: "#aaa", mb: 3 }}>
          Sélectionnez une date pour exporter les emails des participants qui ont accepté de recevoir des informations.
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

        <TableContainer component={Paper} sx={{ backgroundColor: "#141414" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ville</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Salle</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Participants</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} sx={{ '&:hover': { backgroundColor: '#1a1a1a' } }}>
                  <TableCell sx={{ color: "white" }}>
                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString('fr-FR') : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: "white" }}>{event.city}</TableCell>
                  <TableCell sx={{ color: "white" }}>{event.venue}</TableCell>
                  <TableCell sx={{ color: "white" }}>
                    {event.totalParticipants || event._count?.participants || 0}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      onClick={() => exportEmailsForEvent(event)}
                      disabled={isExporting === event.id}
                      size="small"
                      sx={{
                        backgroundColor: "#0081E6",
                        color: "white",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#0066b3",
                        },
                        "&:disabled": {
                          backgroundColor: "#4a5565",
                        },
                      }}
                    >
                      {isExporting === event.id ? (
                        <>
                          <CircularProgress size={16} sx={{ color: "white", mr: 1 }} />
                          Export...
                        </>
                      ) : (
                        "Exporter"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

