"use client";
import React, { useState } from "react";
import styles from "@/app/ui/dashboard/dashboard.module.css";
import BoxSummary from "../components/BoxSummary";
import CustomTable from "../components/CusomTable";
import StatisticChart from "../components/StatisticChart";
import useSWR from "swr";
import {
  fetcherCustom,
  fetcherParticipantsByEvent,
} from "../components/apiFetcher";
import { useCookies } from "../context/userContext";
import { useEffect } from "react";
import { currentDayComparator } from "../helpers/statusHelper";
// import { getSession } from "../lib/lib";

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
interface HistoryData {
  id: string;
  date: string;
  endDate: string;
  ville: string;
  salle: string;
  participants: number;
  statut: string;
  gagnants: number;
  actions: number;
}

export default function Page() {
  // const session = await getSession();
  const [totalNumberDates, setTotalNumberDates] = useState(0);
  const [totalEventsToCome, setTotalEventsToCome] = useState(0);
  const [totalEventParticipants, setTotalEventParticipants] = useState(0);
  const [totalParticipantEvent, setTotalParticipantEvent] = useState([]);
  const [dates, setDates] = useState<DateRow[]>([]);
  const [datesPassed, setDatesPassed] = useState<HistoryData[]>([]);
  const cookie = useCookies();
  const token = cookie.cookie;
  const { data, error } = useSWR(
    token ? `/api/events` : null,
    (url) => fetcherCustom(url, token),
    { revalidateOnFocus: true }
  );
  useEffect(() => {
    const fetchData = async () => {
      if (data) {
        if (data.data?.events) setTotalNumberDates(data.data?.events.length);
        data.data.events.map(async (item: any) => {
          if (currentDayComparator(item.eventDate) === "à venir") {
            setTotalEventsToCome(totalEventsToCome + 1);
          }
          if (currentDayComparator(item.eventDate) === "en cours") {
            const uniqueDates: DateRow[] = [
              {
                id: item.id,
                date: item.eventDate,
                endDate: item.endDate,
                ville: item.city,
                salle: item.venue,
                participants: 0,
                statut: "en cours",
                tirage: "",
                actions: "",
              },
            ];
            setDates(uniqueDates);
          }
          if (currentDayComparator(item.eventDate) === "passé") {
            const uniqueDatesPassed: HistoryData = {
              id: item.id,
              date: item.eventDate,
              endDate: item.endDate,
              ville: item.city,
              salle: item.venue,
              participants: 0,
              statut: "passé",
              gagnants: 0,
              actions: 0,
            };
            const exists = datesPassed.some(
              (date) => date.id === uniqueDatesPassed.id
            );
            if (!exists) {
              setDatesPassed((prevDates) => [...prevDates, uniqueDatesPassed]);
              const response = await fetcherParticipantsByEvent(
                item.id,
                "/api/participants_bo/event",
                token
              );
              if (response?.success === true) {
                const participantCount = response.data.participants.length;
                setDatesPassed((prevDates) =>
                  prevDates.map((date) =>
                    date.id === uniqueDatesPassed.id
                      ? { ...date, participants: participantCount }
                      : date
                  )
                );
              }
              setDatesPassed((prevDates) =>
                [...prevDates].sort(
                  (a: HistoryData, b: HistoryData) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
              );
              const responseWiners = await fetcherParticipantsByEvent(
                item.id,
                "/api/vainqueurs/event",
                token
              );
              if (responseWiners?.success === true) {
                const winnersCount = responseWiners.data.vainqueurs.length;
                setDatesPassed((prevDates) =>
                  prevDates.map((date) =>
                    date.id === uniqueDatesPassed.id
                      ? { ...date, gagnants: winnersCount }
                      : date
                  )
                );
              }
            }
          }
        });
      }
      const responseAllParticipants = await fetcherCustom(
        "/api/participants_bo",
        token
      );
      if (responseAllParticipants?.success === true) {
        setTotalEventParticipants(responseAllParticipants?.pagination?.total);
      }
      const responseAllParticipantsEvent = await fetcherCustom(
        "/api/events/event_participants",
        token
      );
      if (responseAllParticipantsEvent?.success === true) {
        setTotalParticipantEvent(responseAllParticipantsEvent?.data?.events);
      }
    };
    fetchData();
  }, [data]);

  return (
    <div className={styles.container}>
      {/* <Suspense fallback={<p>Loading home1 ...</p>}>
        <div>Hello</div>
      </Suspense>
      <Suspense fallback={<p>Loading home2 ...</p>}>
        <div>Hello2</div>
      </Suspense> */}
      <div className={styles.subContainer}>
        <h1 className={styles.header}>Tableau de bord - Adrénaline Tour</h1>
        <div className={styles.summaryContainer}>
          <div className={styles.boxSummaryItem}>
            <BoxSummary
              title="Total des dates"
              data={totalNumberDates.toString()}
            />
          </div>
          <div className={styles.boxSummaryItem}>
            <BoxSummary
              title="Dates à venir"
              data={totalEventsToCome.toString()}
            />
          </div>
          <div className={styles.boxSummaryItem}>
            <BoxSummary
              title="Participants totaux"
              data={totalEventParticipants.toString()}
            />
          </div>
        </div>
        <div className={styles.secondSummaryContainer}>
          <div className={styles.tableItem}>
            <CustomTable
              title="Prochain tirages à effectuer"
              tableType="tirage_s"
              pageType="tirage_s"
              rows={dates}
            />
          </div>
          <div className={styles.chartItem}>
            <h1 className="font-bold">Statistiques</h1>
            <div className={styles.chartInner}>
              <StatisticChart data={totalParticipantEvent} />
            </div>
            <span>Evolution des participants</span>
          </div>
        </div>
        <div className={styles.thirdSummaryContainer}>
          <div className={styles.tableItem}>
            <CustomTable
              title="Dernières dates (historique)"
              tableType="history"
              pageType="standard"
              rows={datesPassed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
