"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "@/app/ui/dashboard/tirage/tirage.module.css";
import { Button } from "@mui/material";
import CustomTableParticipants from "@/app/components/CusomTableParticipants";
import useSWR from "swr";
import {
  fetcherEventByID,
  fetcherParticipants,
} from "@/app/components/apiFetcher";
import { useCookies } from "@/app/context/userContext";
// ✅ ARCHITECTURE : Importer les hooks optimisés existants
import { useVainqueursBO, useParticipantsByEventBO } from "@/app/hooks/useOptimizedSWR";

interface ParticipantsData {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  dateNaissance: string; // ← AJOUTÉ
  ticketInfo: string;
  // ticketUrl: string;
  placement: any; // Changé de [string] à any
  gagnants: number;
  textInfo?: string;
}

interface VainqueursData {
  id?: string;
  nom_participant: string;
  prenom_participant: string;
  email: string;
  ticketInfo: string;
  // ticketUrl: string;
  rangs: number;
  participant: { // ← STRUCTURE IMBRIQUÉE DES VAINQUEURS
    phone: string;
    dateNaissance: string;
    placement: any;
    // ticketUrl: string;
    textInfo: string;
  };
}

export default function Page() {
  const [participants, setParticipants] = useState<ParticipantsData[]>([]);
  const [event, setEvent] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<
    "participants" | "all_participants"
  >("participants");
  const [tiragedateInfo, setTiragedateInfo] = useState<string>("");
  const cookie = useCookies();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}${searchParams}`;
  const params = useParams<{ tag: string; id: string }>();
  const token = cookie.cookie;
  // ✅ ARCHITECTURE : Utiliser les hooks optimisés existants
  const { data: winnersData, error: winnersError } = useVainqueursBO(params.id, token);
  const { data: participantsData, error: participantsError } = useParticipantsByEventBO(params.id, token);

  // ✅ ARCHITECTURE : Logique de sélection simplifiée selon l'onglet actif
  const data = activeTab === "participants" ? winnersData : participantsData;
  const error = activeTab === "participants" ? winnersError : participantsError;
  const isLoading = !data && !error;

  // ✅ ARCHITECTURE : Handlers simplifiés - les hooks optimisés gèrent le cache automatiquement
  const handleParticipantsClick = () => {
    setActiveTab("participants");
  };
  const handleAllParticipantsClick = () => {
    setActiveTab("all_participants");
  };
  const customdateFormat = (passedDate: string) => {
    const date = new Date(passedDate);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    const returnDate = `${day}/${month}/${year} à ${hours}:${minutes}`;

    return returnDate;
  };

  // ✅ ARCHITECTURE : Les hooks optimisés gèrent automatiquement le cache selon l'architecture

  useEffect(() => {
    // ✅ ARCHITECTURE : Logs simplifiés pour le debugging
    console.log('🔍 [ARCHITECTURE] useEffect triggered:', { activeTab, hasData: !!data, hasError: !!error });
    if (data) {
      const gotdata = data?.data;
      if (gotdata) {
        if (activeTab === "participants") {
          // ← TAB VAINQUEURS : Structure avec participant imbriqué
          console.log('🏆 [ARCHITECTURE] Processing winners:', gotdata.vainqueurs?.length || 0);
          const tirageDate = customdateFormat(data?.data?.tirage?.dateTirage);
          setTiragedateInfo(tirageDate);
          
          const mappedVainqueurs = data?.data?.vainqueurs.map(
            (vainqueur: VainqueursData) => ({
              id: vainqueur.id || `vainqueur-${Math.random()}`, // Générer un ID si manquant
              nom: vainqueur.nom_participant,
              prenom: vainqueur.prenom_participant,
              email: vainqueur.email,
              // ← ACCÈS AUX DONNÉES VIA participant.participant.*
              phone: vainqueur.participant?.phone || "N/A",
              dateNaissance: vainqueur.participant?.dateNaissance || "",
              placement: vainqueur.participant?.placement || {},
              // ticketUrl: vainqueur.participant?.ticketUrl || vainqueur.ticketUrl || "",
              textInfo: vainqueur.participant?.textInfo || vainqueur.ticketInfo || "",
              gagnants: 0,
            })
          );
          setParticipants(mappedVainqueurs);
          
        } else if (activeTab === "all_participants") {
          // ← TAB PARTICIPANTS : Structure normale
          console.log('👥 [ARCHITECTURE] Processing participants:', gotdata.participants?.length || 0);
          // Trier par date de création décroissante pour afficher les plus récents en premier
          const sorted = (data?.data?.participants || [])
            .slice()
            .sort((a: any, b: any) => {
              const ad = new Date(a?.createdAt || 0).getTime();
              const bd = new Date(b?.createdAt || 0).getTime();
              return bd - ad;
            });

          const mappedParticipants = sorted.map(
            (participant: ParticipantsData) => ({
              id: participant.id || `participant-${Math.random()}`, // Générer un ID si manquant
              nom: participant.nom,
              prenom: participant.prenom,
              email: participant.email,
              phone: participant.phone || "N/A",
              dateNaissance: participant.dateNaissance || "",
              placement: participant.placement || {},
              // ticketUrl: participant.ticketUrl || "",
              textInfo: participant.textInfo || "",
              gagnants: 0,
            })
          );
          console.log('✅ [ARCHITECTURE] Participants mapped:', mappedParticipants.length);
          setParticipants(mappedParticipants);
        }
      } else if (data?.data === undefined && data?.success === false) {
        console.log('❌ [ARCHITECTURE] No data or error in response');
        setParticipants([]);
      }
    } else {
      console.log('⚠️ [ARCHITECTURE] No data available');
    }
  }, [data, activeTab]);

  useEffect(() => {
    if (params.id && token)
      fetcherEventByID(params.id, "/api/events", token).then((res) => {
        setEvent(res.data?.event);
      });
  }, [params.id, token]);

  const exportToCSV = () => {
    let csvContent = `${
      activeTab == "participants"
        ? "Liste des gagnants"
        : "Liste des participants"
    } - ${event?.city} (${
      event?.eventDate ? new Date(event?.eventDate).toLocaleDateString() : ""
    })\n\n`;
    csvContent += "Nom,Prénom,Email,Téléphone,Date de naissance,N° Billet\n";

    participants.forEach((participant: ParticipantsData) => {
      csvContent += `"${participant.nom}","${participant.prenom}","${participant.email}","${participant.phone}","${participant.dateNaissance ? new Date(participant.dateNaissance).toLocaleDateString() : 'N/A'}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "documents_demandes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) return <div>Error loading participants</div>;

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div className="flex-col">
          <p className="text-secondary ">
            Tirages au sort {">"} Historique {">"} {event?.city} (
            {event?.eventDate
              ? new Date(event?.eventDate).toLocaleDateString()
              : ""}
            ){" "}
          </p>
          <h1 className={styles.headerText}>
            Résultats du tirage - {event?.city} (
            {event?.eventDate
              ? new Date(event?.eventDate).toLocaleDateString()
              : ""}
            )
          </h1>
        </div>
        <div className={styles.headerContainer}>
          <div className={styles.detailElements}>
            <div className="flex-1">
              <p className="text-secondary">Détail evenement</p>
              <p>
                {event?.eventDate
                  ? new Date(event?.eventDate).toLocaleDateString()
                  : ""}{" "}
                - {event?.city} - {event?.venue}
              </p>
            </div>
          <div className="flex-1">
  <p className="text-secondary">Participants</p>
  <p>{event?.totalParticipants || event?._count?.participants || (participants && participants.length) || 0} inscrits</p>
</div>
            <div className="flex-1">
              <p className="text-secondary">Tirage effectué le:</p>
              <p>{tiragedateInfo}</p>
            </div>
            <div className="flex-1">
              <Button
                sx={{
                  backgroundColor: "#0081E6",
                  color: "white",
                  textTransform: "none",
                  height: "min-content",
                  padding: "0.6em 2.0em",
                }}
                onClick={exportToCSV}
              >
                Exporter CSV
              </Button>
            </div>
          </div>
        </div>
        <div className={styles.middleTabs}>
          <Button
            sx={{
              backgroundColor:
                activeTab === "participants" ? "#0081E6" : "#141414",
              color: "white",
              textTransform: "none",
              padding: "0.6em 2.0em",
            }}
            onClick={handleParticipantsClick}
          >
            Liste des gagnants
          </Button>
          <Button
            sx={{
              backgroundColor:
                activeTab === "all_participants" ? "#0081E6" : "#141414",
              color: "white",
              textTransform: "none",
              padding: "0.6em 2.0em",
            }}
            onClick={handleAllParticipantsClick}
          >
            Participants
          </Button>
        </div>
        <div>
          <CustomTableParticipants
            title=""
            tableType="history"
            pageType="tour"
            rows={participants}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}