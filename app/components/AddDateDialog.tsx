import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface DateRow {
  id: string;
  date: string;
  endDate: string;
  ville: string;
  salle: string;
  participants: number;
  statut: string;
  tirage: string;
  placement: string[]; // Nouveau champ pour les placements
  actions: string;
}

interface AddDateDialogProps {
  addDate: (newDate: DateRow) => void;
}

export default function AddDateDialog({ addDate }: AddDateDialogProps) {
  const [open, setOpen] = React.useState(false);

  const [date, setDate] = React.useState<dayjs.Dayjs | null>(dayjs());
  const [endDate, setEndDate] = React.useState<dayjs.Dayjs | null>(dayjs());
  const [ville, setVille] = React.useState("");
  const [salle, setSalle] = React.useState("");
  const [participants, setParticipants] = React.useState<number | "">("");
  const [statut, setStatut] = React.useState("");
  const [tirage, setTirage] = React.useState("");
  
  // État pour gérer les champs de placement dynamiques
  const [placementFields, setPlacementFields] = React.useState<string[]>([""]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset des champs placement lors de la fermeture
    setPlacementFields([""]);
  };

  // Ajouter un nouveau champ de placement
  const addPlacementField = () => {
    setPlacementFields([...placementFields, ""]);
  };

  // Supprimer un champ de placement (sauf le premier)
  const removePlacementField = (index: number) => {
    if (index > 0) {
      const newFields = placementFields.filter((_, i) => i !== index);
      setPlacementFields(newFields);
    }
  };

  // Mettre à jour la valeur d'un champ de placement
  const updatePlacementField = (index: number, value: string) => {
    const newFields = [...placementFields];
    newFields[index] = value;
    setPlacementFields(newFields);
  };

  return (
    <React.Fragment>
      <Button
        sx={{
          backgroundColor: "#0081E6",
          color: "white",
          textTransform: "none",
          height: "min-content",
          padding: "0.6em 2.0em",
        }}
        onClick={handleClickOpen}
      >
        + Ajouter une date
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            component: "form",
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              
              // Filtrer les champs placement vides
              const filteredPlacement = placementFields.filter(field => field.trim() !== "");
              
              const newDate: DateRow = {
                id: "",
                date: date ? date.toISOString() : "",
                endDate: endDate ? endDate.toISOString() : "",
                ville,
                salle,
                participants:
                  typeof participants === "number" ? participants : 0,
                statut,
                tirage,
                placement: filteredPlacement, // Ajout du tableau de placement
                actions: "",
              };

              addDate(newDate);
              handleClose();
            },
          },
        }}
      >
        <DialogTitle>Add New date</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <DialogContentText>
            To add a new date, please enter the required information below.
          </DialogContentText>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date début"
              value={date}
              onChange={(newval) => setDate(newval)}
            />
          </LocalizationProvider>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date fin"
              value={endDate}
              onChange={(newval) => setEndDate(newval)}
            />
          </LocalizationProvider>
          
          <TextField
            required
            margin="dense"
            label="Ville"
            type="text"
            fullWidth
            variant="standard"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
          />
          
          <TextField
            required
            margin="dense"
            label="Salle"
            type="text"
            fullWidth
            variant="standard"
            value={salle}
            onChange={(e) => setSalle(e.target.value)}
          />

          {/* Section Catégorie de placement */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#0081E6" }}>
              Catégorie de placement
            </Typography>
            
            {placementFields.map((field, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TextField
                  label={`Placement ${index + 1}`}
                  type="text"
                  fullWidth
                  variant="standard"
                  value={field}
                  onChange={(e) => updatePlacementField(index, e.target.value)}
                  placeholder="Ex: Catégorie, Bloc, Rangée ..."
                />
                
                {/* Bouton supprimer (seulement pour les champs ajoutés) */}
                {index > 0 && (
                  <IconButton
                    onClick={() => removePlacementField(index)}
                    color="error"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
                
                {/* Bouton ajouter (seulement sur la dernière ligne) */}
                {index === placementFields.length - 1 && (
                  <IconButton
                    onClick={addPlacementField}
                    color="primary"
                    size="small"
                  >
                    <AddIcon />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}