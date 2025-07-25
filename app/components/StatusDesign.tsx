import React from "react";
import styles from "@/app/ui/dashboard/tour/tour.module.css";

type Props = { value: string | number };

export default function StatusDesign({ value }: Props) {
  return (
    <div
      className={
        value === "à venir"
          ? styles.avenirDesign
          : value === "passé"
          ? styles.programmed
          : value === "en cours"
          ? styles.notifie
          : styles.terminerDesign
      }
    >
      {value}
    </div>
  );
}
