"use client";
import React, { useEffect, useState } from "react";
import styles from "@/app/ui/dashboard/tirage/tirage.module.css";
import { Button } from "@mui/material";
import CustomTable from "@/app/components/CusomTable";
import useSWR from "swr";
import { fetcherCustom } from "@/app/components/apiFetcher";
import { useCookies } from "@/app/context/userContext";
import { currentDayComparator, isDay } from "@/app/helpers/statusHelper";
import TableLoader from "@/app/helpers/TableLoader";
interface DateData {
  id: string;
  date: string;
  ville: string;
  salle: string;
  participants: number;
  statut: string;
  tirage: string;
  actions: string;
}
interface DateRow {
  id: string;
  date: string;
  endDate: string;
  ville: string;
  salle: string;
  participants: number;
  statut: string;
  tirage: string;
  actions: string;
}

function createDateData(
  id: string,
  date: string,
  ville: string,
  salle: string,
  participants: number,
  statut: string,
  tirage: string,
  actions: string
): DateData {
  return { id, date, ville, salle, participants, statut, tirage, actions };
}

export default function Page() {
  const [dates, setDates] = useState<DateRow[]>([]);
  const cookie = useCookies();

  const token = cookie.cookie;
  const [actifDate, setActifDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { data, error } = useSWR(
    token ? `/api/events` : null,
    (url) => fetcherCustom(url, token),
    { revalidateOnFocus: true }
  );
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
      setLoading(true);
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
            actions: string;
            _count?: { participants: number };
            totalParticipants?: number;
          }) => ({
            id: event.id,
            date: event.eventDate, // Adjust based on actual event structure
            endDate: event.endDate, // Adjust based on actual event structure
            ville: event.city, // Adjust based on actual event structure
            salle: event.venue, // Adjust based on actual event structure
            statut: currentDayComparator(event.eventDate), // Adjust based on actual event structure
            participants: event.totalParticipants || event._count?.participants || 0,
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
  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>
            Gestion des tirages au sort - Adrénaline Tour
          </h1>
        </div>
        <div className={styles.filter}>
          <div className={styles.filterLeft}>
            <h2>Filtrer par statut:</h2>
            <div className="flex gap-3">
              <Button
                sx={{
                  backgroundColor: "#0081E6",
                  color: "white",
                  textTransform: "none",
                  padding: "0.6em 2.0em",
                  borderRadius: "25px",
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
                  borderRadius: "25px",
                  border: "1px solid #4a5565",
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
                  borderRadius: "25px",
                  border: "1px solid #4a5565",
                }}
              >
                Paramètres
              </Button>
            </div>
          </div>
          {/* <InputComponent data={""} /> */}
        </div>
        <div className={styles.middleTabs}>
          <Button
            sx={{
              backgroundColor: "#0081E6",
              color: "white",
              textTransform: "none",
              padding: "0.6em 2.0em",
            }}
          >
            Prochains tirages
          </Button>
          <Button
            sx={{
              backgroundColor: "#141414",
              color: "white",
              textTransform: "none",
              padding: "0.6em 2.0em",
            }}
          >
            Historique
          </Button>
        </div>
        <div>
          {loading ? (
            <TableLoader
              columns={[
                { id: "date", minWidth: 100, label: "Date concert" },
                { id: "ville", minWidth: 100, label: "Ville" },
                { id: "statut", minWidth: 100, label: "Statut" },
                { id: "actions", minWidth: 100, label: "Actions" },
              ]}
              rowsPerPage={5}
            />
          ) : (
            <CustomTable
              title=""
              tableType="tirage_s"
              pageType="tirage_s"
              rows={dates}
            />
          )}
        </div>
      </div>
    </div>
  );
}
