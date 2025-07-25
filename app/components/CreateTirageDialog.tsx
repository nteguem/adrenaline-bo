import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { createTirageByEvent } from "./apiFetcher";
import { useCookies } from "../context/userContext";

type Props = { id: string; statut: string | number };

export default function TirageDialog({ id, statut }: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<number>(6);
  const [isError, setIsError] = React.useState(false);
  const [successMessage, setSuccesMessage] = React.useState("");

  const [load, setLoad] = React.useState(false);

  const cookie = useCookies();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value); // Convert string to number
    if (!isNaN(newValue)) {
      // Check if conversion was successful
      setValue(newValue); // Set the new value
    }
  };

  const token = cookie.cookie;
  const createTirage = async () => {
    setIsError(false);
    setLoad(true);
    setSuccesMessage("");
    const response = await createTirageByEvent(
      id,
      "/api/tirage",
      token,
      value
    ).catch((err) => {
      setIsError(true);
    });
    if (response?.data?.code == 201) setSuccesMessage(response?.data?.message);
    setLoad(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        disabled={statut === "passé" || statut === "à venir"}
        variant="outlined"
        onClick={handleClickOpen}
      >
        Créer Tirage
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            component: "form",
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries((formData as any).entries());
              const email = formJson.email;
              createTirage();
            },
          },
        }}
      >
        <DialogTitle>Créer un tirage</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Entrez le nombre de gagnants souhaité pour le tirage
          </DialogContentText>
          <TextField
            disabled={statut === "passé" || statut === "à venir"}
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="N° gagnant"
            type="number"
            variant="standard"
            value={value}
            onChange={handleChange}
          />
          {isError && (
            <p className="text-danger">
              Aucun participant trouvé pour cet événement
            </p>
          )}

          {successMessage && (
            <DialogContentText className="text-success">
              {successMessage}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fermer</Button>
          <Button
            disabled={statut === "passé" || statut === "à venir"}
            type="submit"
            loading={load}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
