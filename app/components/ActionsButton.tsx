"use client";
import { Button } from "@mui/material";
import React from "react";
import { deleteEvent } from "./apiFetcher";
import { useCookies } from "../context/userContext";
import { useRouter } from "next/navigation";

type Props = {
  tableType: string;
  pageType: string;
  status: string | number;
  // setAction: React.Dispatch<React.SetStateAction<boolean>>;
  setAction: () => void;
  collapseState: boolean;
  eventId: string;
};

export default function ActionsButton({
  tableType,
  pageType,
  status,
  setAction,
  eventId,
}: Props) {
  const cookie = useCookies();
  const deleteAction = (eventId: string) => {
    const token = cookie.cookie;
    deleteEvent(eventId, token, "/api/events");
  };
  const router = useRouter();

  const handleClick = () => {
    // Navigate to /tirage/history/{id}
    if (tableType !== "tirage")
      router.push(`/dashboard/tirage/historique/${eventId}`);
  };
  
  return pageType === "standard" ? (
    <Button
      style={{
        backgroundColor: tableType === "history" ? "lightgrey" : "",
        textTransform: "none",
      }}
      variant="contained"
      color={tableType === "tirage" ? "primary" : "secondary"}
      onClick={handleClick}
    >
      {tableType === "tirage" ? "Effectuer" : "Voir détails"}
    </Button>
  ) : pageType === "tour" ? (
    <div className="flex gap-1 justify-end">
      <Button
        style={{
          backgroundColor: "rgba(128, 128, 128, 0.3)",
          textTransform: "none",
        }}
        onClick={() => setAction()}
        variant="contained"
        color="secondary"
      >
        {status === "à venir" ? "Modifier" : "Détails"}
      </Button>
      <Button
        style={{
          backgroundColor:
            status !== "terminé" ? "red" : "rgba(128, 128, 128, 0.3)",
          textTransform: "none",
          minWidth: "fit-content",
        }}
        disabled={status === "terminé" ? true : false}
        variant="contained"
        color="secondary"
        onClick={() => deleteAction(eventId)}
      >
        x
      </Button>
    </div>
  ) : pageType === "date" ? (
    <div className="flex gap-1 justify-end">
      <Button
        style={{
          backgroundColor: "rgba(128, 128, 128, 0.3)",
          textTransform: "none",
        }}
        variant="contained"
        color="secondary"
      >
        {status === "à venir" ? "Modifier" : "Voir détails"}
      </Button>
    </div>
  ) : pageType === "tirage_s" ? (
    <div className="flex gap-1 justify-end">
      <Button
        style={{
          backgroundColor: "#0081E6",
          textTransform: "none",
        }}
        onClick={() => setAction()}
        variant="contained"
        color="secondary"
      >
        {status === "à venir" ? "Modifier" : "Créer Tirage"}
      </Button>
    </div>
  ) : (
    ""
  );
}
