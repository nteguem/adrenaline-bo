import React, { useEffect } from "react";
import styles from "@/app/ui/dashboard/subTableContent/subcontent.module.css";
import { Button, TextField, Typography } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { updateEvent } from "./apiFetcher";
import { useCookies } from "../context/userContext";

interface HistoryData {
  id: string;
  date: string;
  endDate: string;
  ville: string;
  salle: string;
  participants: number;
  gagnants: number;
  actions: number;
}
interface TourData {
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
interface DateData {
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

interface TirageData {
  id: string;
  date: string;
  endDate: string;
  ville: string;
  salle: string;
  datetirage: string;
  participants: number;
  gagnants: string;
  statut: string;
  actions: string;
}
interface UpdateEvent {
  eventDate: string;
  city: string;
  venue: string;
  endDate: string;
}

type Props = {
  data: HistoryData | TourData | TirageData | DateData;
  onToggle: (index: number) => void;
  index: number;
};

export default function SubTableContent({ data, onToggle, index }: Props) {
  // const [isAutomatic, setIsAutomatic] = React.useState(true);
  const [date, setDate] = React.useState<dayjs.Dayjs | null>(dayjs());
  const [ville, setVille] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [endDate, setEndDate] = React.useState<dayjs.Dayjs | null>(dayjs());
  const cookie = useCookies();
  // const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, checked } = event.target;
  //   if (name == "automatic") {
  //     setIsAutomatic(checked);
  //   } else {
  //     setIsAutomatic(!checked);
  //   }
  // };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVille(event.target.value);
  };
  const handleChangeVenue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVenue(event.target.value);
  };
  const handleSubmit = () => {
    const token = cookie.cookie;
    // Create an object with the data to submit
    const submissionData: UpdateEvent = {
      eventDate: date ? date.toISOString() : "", // Convert Day.js to ISO string
      city: ville,
      venue: venue,
      endDate: endDate ? endDate.toISOString() : "",
      // Add other fields as necessary
    };
    const response = updateEvent(data.id, token, "/api/events", submissionData);
  };
  useEffect(() => {
    setDate(dayjs(data.date));
    setVille(data.ville);
    setVenue(data.salle);
    setEndDate(dayjs(data.endDate));
  }, []);
  return (
    <div className={styles.container}>
      <Typography sx={{ color: "white" }}>
        Configuration date - {data.ville}({data.date})
      </Typography>
      <div className={styles.primaryContainer}>
        <div className={styles.subContainer}>
          <Typography sx={{ color: "white" }}>Date evenement</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date début"
              value={date}
              onChange={(newval) => setDate(newval)}
            />
          </LocalizationProvider>
          <Typography sx={{ color: "white" }}>Ville: </Typography>
          <TextField
            size="small"
            id="outlined-basic"
            // label="Outlined"
            variant="outlined"
            value={ville}
            onChange={handleChange}
          />
        </div>
        <div className={styles.subContainer}>
          <Typography sx={{ color: "white" }}>Date de fin</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date fin"
              value={dayjs(endDate)}
              onChange={(newval) => setEndDate(newval)}
            />
          </LocalizationProvider>
          <Typography sx={{ color: "white" }}>Salle:</Typography>
          <TextField
            size="small"
            id="outlined-basic"
            // label="Outlined"
            variant="outlined"
            value={venue}
            onChange={handleChangeVenue}
          />
        </div>
      </div>
      <div className={styles.primarySubConytainer}>
        {/* <div className={styles.subContainer}>
          <Typography sx={{ color: "white" }}>Type de tirage: </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  name="automatic"
                  checked={isAutomatic}
                  onChange={handleCheckboxChange}
                />
              }
              sx={{ color: "white" }}
              label="Automatique (à la date programmée)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="manual"
                  checked={!isAutomatic}
                  onChange={handleCheckboxChange}
                />
              }
              sx={{ color: "white" }}
              label="Manuel (déclenchement par administrateur)"
            />
            <FormControlLabel
              control={<Checkbox />}
              sx={{ color: "white" }}
              label="Notifier automatiquement les gagnants par email"
            />
          </FormGroup> 
        </div>*/}
        <div className={styles.buttonArrange}>
          <Button
            sx={{
              backgroundColor: "#0081E6",
              color: "white",
              textTransform: "none",
              padding: "0.6em 2.0em",
            }}
            onClick={handleSubmit}
          >
            Enregistrer
          </Button>
          <Button
            sx={{
              backgroundColor: "#141414",
              color: "white",
              textTransform: "none",
              padding: "0.6em 2.0em",
            }}
            onClick={() => onToggle(index)}
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
