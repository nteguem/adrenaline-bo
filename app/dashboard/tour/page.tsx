"use client";
import React, { useEffect, useState } from "react";
import styles from "@/app/ui/dashboard/tour/tour.module.css";
import Image from "next/image";
import { Button } from "@mui/material";
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
  placement: string[]; // Ajout du champ placement
  actions: string;
}

interface Column {
  id: string;
  minWidth: number;
  label: string;
}

export default function Page() {
  const [dates, setDates] = useState<DateRow[]>([]);
  const [actifDate, setActifDate] = useState<string>("");
  // const [participantsSize, setParticipantSize] = useState<number>(0);
  const [nextEvent, setNextEvent] = useState<DateRow | null>();
  const [loading, setLoading] = useState(true);
  const cookie = useCookies();

  const token = cookie.cookie;
  
  const addDate = (newDate: DateRow) => {
    // Ajout de logs pour débugger
    console.log("Date à envoyer:", newDate);
    console.log("Placement data:", newDate.placement);
    
    const response = createEvent("/api/events", token, newDate);
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
    // console.log(passedDate);
    const date = new Date(passedDate);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear(); // Get full year

    // Format to dd.mm.yyyy
    const returnDate = `${day}.${month}.${year}`;
    // console.log("formatted date:", returnDate);
    return returnDate;
  };

  // const { data, error } = useSWR(["/api/events", token], fetcher);
  const { data, error } = useSWR(
    token ? `/api/events` : null,
    (url) => fetcherCustom(url, token),
    { revalidateOnFocus: true }
  );

  const getNextElementById = (data: DateRow[], id: string): DateRow | null => {
    const index = data.findIndex((event) => event.id === id); // Find index of the element with the given id
    if (index !== -1 && index + 1 < data.length) {
      return data[index + 1]; // Return the next element if it exists
    }
    return null; // Return null if the next element does not exist
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
            placement?: string[]; // Optionnel car peut ne pas exister dans les données existantes
            actions: string;
          }) => ({
            id: event.id,
            date: event.eventDate, // Adjust based on actual event structure
            endDate: event.endDate, // Adjust based on actual event structure
            ville: event.city, // Adjust based on actual event structure
            salle: event.venue, // Adjust based on actual event structure
            statut: currentDayComparator(event.eventDate), // Adjust based on actual event structure
            participants: 0,
            placement: event.placement || [], // Utiliser le placement de l'API ou tableau vide par défaut
          })
        )
        .filter(
          (event: {
            id: string;
            date: string;
            endDate: string;
            ville: string;
            salle: string;
            status: string;
          }) => {
            currentDateCalculator(event.date, event.id);
            if (eventSet.has(event.id)) {
              return false; // Skip duplicate
            } else {
              eventSet.add(event.id);
              return true; // Keep unique event
            }
          }
        )
        .sort(
          (a: DateRow, b: DateRow) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      setDates(uniqueDates);
      setLoading(false);
    }
  }, [data, error]);
  
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
                  : event.participants, // Update if the date matches
            };
          })
        );
        // setParticipantSize(response.data?.participants.length);
      };
      customFetcherParticipants();
      setNextEvent(getNextElementById(dates, actifDate));
    }
  }, [actifDate]);

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>Adrénaline Tour - Configuration</h1>
        </div>
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
            <AddDateDialog addDate={addDate} />
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
              rows={dates}
            />
          )}
        </div>
      </div>
    </div>
  );
}