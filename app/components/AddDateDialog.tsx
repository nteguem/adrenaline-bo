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
  InputLabel,
  MenuItem,
  Select,
  Box,
  IconButton,
  Typography,
  Grid,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

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

interface AddDateDialogProps {
  addDate?: (newDate: DateRow) => void; // Pour le mode ajout
  editEvent?: (eventData: DateRow) => void; // Pour le mode édition
  mode?: "add" | "edit";
  eventData?: DateRow | null; // Données pour l'édition
  open?: boolean; // Pour contrôler l'ouverture depuis l'extérieur
  onClose?: () => void; // Pour contrôler la fermeture depuis l'extérieur
  triggerButton?: React.ReactNode; // Pour personnaliser le bouton déclencheur
}

// Générer les options d'heures (00:00 à 23:30 par tranches de 30min)
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  return times;
};

export default function AddDateDialog({ 
  addDate, 
  editEvent,
  mode = "add", 
  eventData = null,
  open: controlledOpen,
  onClose: controlledOnClose,
  triggerButton 
}: AddDateDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onClose = isControlled ? controlledOnClose : () => setInternalOpen(false);

  // États pour les dates et heures de début
  const [startDate, setStartDate] = React.useState<dayjs.Dayjs | null>(dayjs());
  const [startTime, setStartTime] = React.useState("20:00");
  
  // États pour les dates et heures de fin
  const [endDate, setEndDate] = React.useState<dayjs.Dayjs | null>(dayjs());
  const [endTime, setEndTime] = React.useState("22:00");
  
  const [ville, setVille] = React.useState("");
  const [salle, setSalle] = React.useState("");
  const [participants, setParticipants] = React.useState<number | "">("");
  const [statut, setStatut] = React.useState("");
  const [tirage, setTirage] = React.useState("");
  
  const [placementFields, setPlacementFields] = React.useState<string[]>([""]);

  const timeOptions = generateTimeOptions();

  // Fonction pour extraire la date et l'heure d'un ISO string
  const extractDateAndTime = (isoString: string) => {
    if (!isoString) return { date: dayjs(), time: "20:00" };
    
    const dateObj = dayjs(isoString);
    const time = dateObj.format("HH:mm");
    
    return { date: dateObj, time };
  };

  // Pré-remplir le formulaire quand on est en mode édition
  React.useEffect(() => {
    if (mode === "edit" && eventData) {
      const { date: startDateObj, time: startTimeStr } = extractDateAndTime(eventData.date);
      const { date: endDateObj, time: endTimeStr } = extractDateAndTime(eventData.endDate);
          console.log("DEBUG - eventData:", eventData.date, eventData.endDate);

      setStartDate(startDateObj);
      setStartTime(startTimeStr);
      setEndDate(endDateObj);
      setEndTime(endTimeStr);
      setVille(eventData.ville || "");
      setSalle(eventData.salle || "");
      setParticipants(eventData.participants || "");
      setStatut(eventData.statut || "");
      setTirage(eventData.tirage || "");
      setPlacementFields(eventData.placement && eventData.placement.length > 0 ? eventData.placement : [""]);
    } else {
      // Reset pour le mode ajout
      resetForm();
    }
  }, [mode, eventData, open]);

  const resetForm = () => {
    setStartDate(dayjs());
    setStartTime("20:00");
    setEndDate(dayjs());
    setEndTime("22:00");
    setVille("");
    setSalle("");
    setParticipants("");
    setStatut("");
    setTirage("");
    setPlacementFields([""]);
  };

  const handleClickOpen = () => {
    if (!isControlled) {
      setInternalOpen(true);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    if (!isControlled) {
      setInternalOpen(false);
    }
    // Reset des champs placement lors de la fermeture en mode ajout
    if (mode === "add") {
      resetForm();
    }
  };

  const addPlacementField = () => {
    setPlacementFields([...placementFields, ""]);
  };

  const removePlacementField = (index: number) => {
    if (index > 0) {
      const newFields = placementFields.filter((_, i) => i !== index);
      setPlacementFields(newFields);
    }
  };

  const updatePlacementField = (index: number, value: string) => {
    const newFields = [...placementFields];
    newFields[index] = value;
    setPlacementFields(newFields);
  };

  // Calculer la durée de l'événement
  const calculateDuration = () => {
    if (!startDate || !endDate) return "";
    
    const start = startDate.hour(parseInt(startTime.split(':')[0])).minute(parseInt(startTime.split(':')[1]));
    const end = endDate.hour(parseInt(endTime.split(':')[0])).minute(parseInt(endTime.split(':')[1]));
    
    const diffInMinutes = end.diff(start, 'minute');
    const days = Math.floor(diffInMinutes / (24 * 60));
    const hours = Math.floor((diffInMinutes % (24 * 60)) / 60);
    const minutes = diffInMinutes % 60;
    
    let duration = "";
    if (days > 0) duration += `${days} jour${days > 1 ? 's' : ''} `;
    if (hours > 0) duration += `${hours}h `;
    if (minutes > 0) duration += `${minutes}min`;
    
    return duration.trim();
  };

  return (
    <React.Fragment>
      {triggerButton ? (
        <div onClick={handleClickOpen}>
          {triggerButton}
        </div>
      ) : (
        <Button
          sx={{
            backgroundColor: mode === "edit" ? "#ff9800" : "#0081E6",
            color: "white",
            textTransform: "none",
            height: "min-content",
            padding: "0.6em 2.0em",
          }}
          onClick={handleClickOpen}
        >
          {mode === "edit" ? "Modifier l'événement" : "+ Ajouter une date"}
        </Button>
      )}
      
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
              
              const filteredPlacement = placementFields.filter(field => field.trim() !== "");
              
              // Construire les dates complètes avec ISO pour compatibilité
              const startDateTime = startDate ? 
                startDate.hour(parseInt(startTime.split(':')[0])).minute(parseInt(startTime.split(':')[1])).toISOString() : "";
              const endDateTime = endDate ? 
                endDate.hour(parseInt(endTime.split(':')[0])).minute(parseInt(endTime.split(':')[1])).toISOString() : "";
              
              const eventToSubmit: DateRow = {
                id: mode === "edit" ? (eventData?.id || "") : "",
                date: startDateTime,
                endDate: endDateTime,
                ville,
                salle,
                participants: typeof participants === "number" ? participants : 0,
                statut,
                tirage,
                placement: filteredPlacement,
                actions: "",
              };

              // Appeler la bonne fonction selon le mode
              if (mode === "edit" && editEvent) {
                editEvent(eventToSubmit);
              } else if (mode === "add" && addDate) {
                addDate(eventToSubmit);
              }
              
              handleClose();
            },
          },
        }}
      >
        <DialogTitle>
          {mode === "edit" ? "Modifier l'événement" : "Ajouter une nouvelle date"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <DialogContentText>
            {mode === "edit" 
              ? "Modifiez les informations de l'événement ci-dessous."
              : "Remplissez les informations pour ajouter une nouvelle date d'événement."
            }
          </DialogContentText>
          
          {/* Section Date et Heure de DÉBUT */}
          <Box sx={{ border: "2px solid #4caf50", borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#4caf50", display: "flex", alignItems: "center" }}>
              🟢 Début de l'événement
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                  <DatePicker
                    label="Date de début"
                    value={startDate}
                    onChange={(newDate) => setStartDate(newDate)}
                    format="DD/MM/YYYY"
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Heure de début</InputLabel>
                  <Select
                    value={startTime}
                    label="Heure de début"
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {timeOptions.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Section Date et Heure de FIN */}
          <Box sx={{ border: "2px solid #f44336", borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#f44336", display: "flex", alignItems: "center" }}>
              🔴 Fin de l'événement
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                  <DatePicker
                    label="Date de fin"
                    value={endDate}
                    onChange={(newDate) => setEndDate(newDate)}
                    format="DD/MM/YYYY"
                    sx={{ width: "100%" }}
                    minDate={startDate}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Heure de fin</InputLabel>
                  <Select
                    value={endTime}
                    label="Heure de fin"
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    {timeOptions.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Aperçu de la durée */}
          <Box sx={{ p: 2, backgroundColor: "#e3f2fd", borderRadius: 1, border: "1px solid #2196f3" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              📅 Récapitulatif de l'événement
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Début :</strong> {startDate?.format("dddd DD MMMM YYYY")} à {startTime}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Fin :</strong> {endDate?.format("dddd DD MMMM YYYY")} à {endTime}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Durée :</strong> {calculateDuration() || "Calculez automatiquement"}
            </Typography>
          </Box>
          
          {/* Section Lieu */}
          <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#0081E6" }}>
              🏛️ Lieu
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  required
                  label="Ville"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  required
                  label="Salle"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={salle}
                  onChange={(e) => setSalle(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Section Catégorie de placement */}
          <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#0081E6" }}>
              🎫 Catégories de placement
            </Typography>
            
            {placementFields.map((field, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TextField
                  label={`Placement ${index + 1}`}
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={field}
                  onChange={(e) => updatePlacementField(index, e.target.value)}
                  placeholder="Ex: Catégorie 1, Bloc A, Rangée 1-10..."
                />
                
                {index > 0 && (
                  <IconButton
                    onClick={() => removePlacementField(index)}
                    color="error"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
                
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
          <Button onClick={handleClose}>Annuler</Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ 
              backgroundColor: mode === "edit" ? "#ff9800" : "#0081E6",
              "&:hover": {
                backgroundColor: mode === "edit" ? "#e68900" : "#0066cc"
              }
            }}
          >
            {mode === "edit" ? "Mettre à jour" : "Ajouter l'événement"}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}