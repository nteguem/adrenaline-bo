"use client";
import React, { useEffect, useState } from "react";
import styles from "@/app/ui/dashboard/tour/tour.module.css";
import Image from "next/image";
import { Button, Chip, Box, CircularProgress, Typography } from "@mui/material";
import CustomTable from "@/app/components/CusomTable";
import AddDateDialog from "@/app/components/AddDateDialog";
import {
  fetcherCustom,
  createEvent,
  fetcherParticipantsByEvent,
} from "@/app/components/apiFetcher";
import useSWR from "swr";
import { useCookies } from "@/app/context/userContext";
import { isDay, currentDayComparator } from "@/app/helpers/statusHelper";
import TableLoader from "@/app/helpers/TableLoader";

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

interface Column {
  id: string;
  minWidth: number;
  label: string;
}

type EventFilter = "upcoming" | "past" | "all";

export default function Page() {
  const [dates, setDates] = useState<DateRow[]>([]);
  const [filteredDates, setFilteredDates] = useState<DateRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<EventFilter>("upcoming");
  const [actifDate, setActifDate] = useState<string>("");
  const [nextEvent, setNextEvent] = useState<DateRow | null>();
  const [loading, setLoading] = useState(true);
  const [addingEvent, setAddingEvent] = useState(false);
  const cookie = useCookies();

  const token = cookie.cookie;

  // Fonction pour déterminer le statut d'un événement
  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now >= start && now <= end) {
      return "en_cours";
    } else if (now < start) {
      return "a_venir";
    } else {
      return "passe";
    }
  };

  // Fonction pour classifier et trier les événements
  const classifyAndSortEvents = (events: DateRow[]) => {
    const now = new Date();
    const current: DateRow[] = [];
    const upcoming: DateRow[] = [];
    const past: DateRow[] = [];

    events.forEach(event => {
      const eventStatus = getEventStatus(event.date, event.endDate);
      
      if (eventStatus === "en_cours") {
        current.push({ ...event, statut: "En cours" });
      } else if (eventStatus === "a_venir") {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    // Trier les événements en cours par date de début (le plus proche en premier)
    current.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Trier les événements à venir par date croissante
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Trier les événements passés par date décroissante
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Mélanger "en cours" et "à venir" : en cours en premier, puis à venir
    const upcomingAndCurrent = [...current, ...upcoming];

    return { current, upcoming, past, upcomingAndCurrent };
  };

  // Fonction pour filtrer les événements selon le filtre actif
  const applyFilter = (events: DateRow[], filter: EventFilter) => {
    const { current, upcoming, past, upcomingAndCurrent } = classifyAndSortEvents(events);
    
    switch (filter) {
      case "upcoming":
        return upcomingAndCurrent; // En cours + à venir mélangés
      case "past":
        return past;
      case "all":
        return [...upcomingAndCurrent, ...past]; // Tout : (en cours + à venir) puis passés
      default:
        return events;
    }
  };

  // Compter les événements par catégorie
  const getEventCounts = (events: DateRow[]) => {
    const { current, upcoming, past } = classifyAndSortEvents(events);
    return {
      upcoming: current.length + upcoming.length, // En cours + à venir
      past: past.length,
      total: events.length
    };
  };

  // Fonction pour actualiser les données (à passer aux composants enfants)
  const refreshData = async () => {
    try {
      const updatedData = await fetcherCustom("/api/events", token);
      
      if (updatedData) {
        const eventSet = new Set();
        const uniqueDates: DateRow[] = updatedData.data.events
          .map(
            (event: {
              id: string;
              eventDate: string;
              endDate: string;
              city: string;
              venue: string;
              status: string;
              placement?: string[];
              actions: string;
            }) => ({
              id: event.id,
              date: event.eventDate,
              endDate: event.endDate,
              ville: event.city,
              salle: event.venue,
              statut: currentDayComparator(event.eventDate),
              participants: 0,
              placement: event.placement || [],
            })
          )
          .filter(
            (event: {
              id: string;
              date: string;
              endDate: string;
              ville: string;
              salle: string;
            }) => {
              currentDateCalculator(event.date, event.id);
              if (eventSet.has(event.id)) {
                return false;
              } else {
                eventSet.add(event.id);
                return true;
              }
            }
          );

        setDates(uniqueDates);
      }
    } catch (error) {
      console.error("Erreur lors de l'actualisation des données:", error);
    }
  };

  const addDate = async (newDate: DateRow) => {
    setAddingEvent(true);
    
    try {
      console.log("Date à envoyer:", newDate);
      console.log("Placement data:", newDate.placement);
      
      const response = await createEvent("/api/events", token, newDate);
      
      if (response.success) {
        await refreshData();
        mutate();
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement:", error);
    } finally {
      setAddingEvent(false);
    }
  };

  const columnLoad: Column[] = [
    { id: "date", minWidth: 10, label: "date" },
    { id: "ville", minWidth: 10, label: "Ville" },
    { id: "salle", minWidth: 10, label: "Salle" },
    { id: "participants", minWidth: 10, label: "Participants" },
    { id: "statut", minWidth: 10, label: "Statut" },
    { id: "action", minWidth: 10, label: "Action" },
  ];

  const customDateOnlyFormat = (passedDate: string) => {
    const date = new Date(passedDate);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    const returnDate = `${day}.${month}.${year}`;
    return returnDate;
  };

  // Utilisation de mutate pour recharger les données
  const { data, error, mutate } = useSWR(
    token ? `/api/events` : null,
    (url) => fetcherCustom(url, token),
    { revalidateOnFocus: true }
  );

  const getNextElementById = (data: DateRow[], id: string): DateRow | null => {
    const index = data.findIndex((event) => event.id === id);
    if (index !== -1 && index + 1 < data.length) {
      return data[index + 1];
    }
    return null;
  };
  
  const currentDateCalculator = (date: string, id: string) => {
    if (isDay(date)) {
      setActifDate(id);
    }
  };

  useEffect(() => {
    if (error) {
      console.error("Error loading participants", error);
      return;
    }
    if (data) {
      const eventSet = new Set();
      const uniqueDates: DateRow[] = data.data.events
        .map(
          (event: {
            id: string;
            eventDate: string;
            endDate: string;
            city: string;
            venue: string;
            status: string;
            placement?: string[];
            actions: string;
          }) => ({
            id: event.id,
            date: event.eventDate,
            endDate: event.endDate,
            ville: event.city,
            salle: event.venue,
            statut: currentDayComparator(event.eventDate),
            participants: 0,
            placement: event.placement || [],
          })
        )
        .filter(
          (event: {
            id: string;
            date: string;
            endDate: string;
            ville: string;
            salle: string;
          }) => {
            currentDateCalculator(event.date, event.id);
            if (eventSet.has(event.id)) {
              return false;
            } else {
              eventSet.add(event.id);
              return true;
            }
          }
        );

      setDates(uniqueDates);
      setLoading(false);
    }
  }, [data, error]);

  // Appliquer le filtre quand les dates ou le filtre actif changent
  useEffect(() => {
    const filtered = applyFilter(dates, activeFilter);
    setFilteredDates(filtered);
  }, [dates, activeFilter]);
  
  useEffect(() => {
    if (actifDate) {
      const customFetcherParticipants = async () => {
        const response = await fetcherParticipantsByEvent(
          actifDate,
          "/api/participants_bo/event",
          token
        );
        setDates((prevDates) =>
          prevDates.map((event) => {
            return {
              ...event,
              participants:
                event.id === actifDate
                  ? response.data?.participants.length
                  : event.participants,
            };
          })
        );
      };
      customFetcherParticipants();
      setNextEvent(getNextElementById(dates, actifDate));
    }
  }, [actifDate]);

  const eventCounts = getEventCounts(dates);

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>Adrénaline Tour - Configuration</h1>
        </div>
        
        {/* Loader overlay pendant l'ajout d'événement */}
        {addingEvent && (
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
            <CircularProgress size={50} sx={{ color: '#0081E6', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
              Ajout de l'événement en cours...
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc', textAlign: 'center', mt: 1 }}>
              Veuillez patienter
            </Typography>
          </Box>
        )}
        
        <div className={styles.resumeContainer}>
          <div>
            <Image
              className={styles.leftSideLogo}
              src="/images/mackk.png"
              width={100}
              height={100}
              alt="Picture of the author"
            />
          </div>
          <div className="flex-col">
            <h1 className="text-2xl">MATT POKORA - Adrénaline tour</h1>
            <p className={styles.resumeSmallText}>
              {dates.length > 0 &&
                `Dates: ${customDateOnlyFormat(
                  dates[0].date
                )} - ${customDateOnlyFormat(dates[dates.length - 1].date)}`}
            </p>
            <p className={styles.resumeSmallText}>
              Nombre de dates prévues: {dates.length > 0 ? dates.length : 0}
            </p>
            <p className={styles.resumeSmallText}>
              Salles:{" "}
              {dates.length > 0
                ? dates.map((event) => event.salle).join(", ")
                : ""}
            </p>
          </div>
          <div className={styles.resumeRightSide}>
            <span className={styles.resumeIsActif}>Actif</span>
          </div>
        </div>

        {/* Filtres d'événements */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <strong style={{ color: 'white' }}>Filtrer par :</strong>
          <Chip
            label={`À venir (${eventCounts.upcoming})`}
            onClick={() => setActiveFilter("upcoming")}
            variant={activeFilter === "upcoming" ? "filled" : "outlined"}
            sx={{ 
              backgroundColor: activeFilter === "upcoming" ? "#4caf50" : "transparent",
              color: activeFilter === "upcoming" ? "white" : "#fff",
              border: activeFilter === "upcoming" ? "1px solid #4caf50" : "1px solid #666",
              '&:hover': {
                backgroundColor: activeFilter === "upcoming" ? "#45a049" : "rgba(76, 175, 80, 0.1)"
              }
            }}
          />
          <Chip
            label={`Passés (${eventCounts.past})`}
            onClick={() => setActiveFilter("past")}
            variant={activeFilter === "past" ? "filled" : "outlined"}
            sx={{
              backgroundColor: activeFilter === "past" ? "#f44336" : "transparent",
              color: activeFilter === "past" ? "white" : "#fff",
              border: activeFilter === "past" ? "1px solid #f44336" : "1px solid #666",
              '&:hover': {
                backgroundColor: activeFilter === "past" ? "#d32f2f" : "rgba(244, 67, 54, 0.1)"
              }
            }}
          />
          <Chip
            label={`Tous (${eventCounts.total})`}
            onClick={() => setActiveFilter("all")}
            variant={activeFilter === "all" ? "filled" : "outlined"}
            sx={{
              backgroundColor: activeFilter === "all" ? "#2196f3" : "transparent",
              color: activeFilter === "all" ? "white" : "#fff",
              border: activeFilter === "all" ? "1px solid #2196f3" : "1px solid #666",
              '&:hover': {
                backgroundColor: activeFilter === "all" ? "#1976d2" : "rgba(33, 150, 243, 0.1)"
              }
            }}
          />
        </Box>

        <div className={styles.dateTab}>
          <div className={styles.dateTabLeft}>
            <Button
              sx={{
                backgroundColor: "#0081E6",
                color: "white",
                textTransform: "none",
                padding: "0.6em 2.0em",
              }}
            >
              Dates
            </Button>
            <Button
              sx={{
                backgroundColor: "#141414",
                color: "white",
                textTransform: "none",
                padding: "0.6em 2.0em",
              }}
            >
              Statistiques
            </Button>
            <Button
              sx={{
                backgroundColor: "#141414",
                color: "white",
                textTransform: "none",
                padding: "0.6em 2.0em",
              }}
            >
              Paramètres
            </Button>
          </div>
          <div>
            <AddDateDialog 
              mode="add" 
              addDate={addDate}
            />
          </div>
        </div>
        
        <div>
          {loading ? (
            <TableLoader columns={columnLoad} rowsPerPage={2} />
          ) : (
            <CustomTable
              title=""
              tableType="tour"
              pageType="tour"
              rows={filteredDates}
              onEventUpdated={refreshData}
            />
          )}
        </div>
      </div>
    </div>
  );
}