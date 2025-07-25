import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";

type Props = { status: string | number | unknown; rowId: string };

export default function TirageButton({ status, rowId }: Props) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to /tirage/history/{id}
    router.push(`/dashboard/tirage/historique/${rowId}`);
  };
  return (
    <Button
      variant="contained"
      sx={{
        textTransform: "none",
        backgroundColor: status === "terminé" ? "rgba(128, 128, 128, 0.3)" : "",
      }}
      onClick={handleClick}
    >
      {status === "à venir" ? "Configurer" : "Voir gagnants"}
    </Button>
  );
}
