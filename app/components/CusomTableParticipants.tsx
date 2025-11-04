/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Collapse, Typography, Chip } from "@mui/material";
import ActionsButton from "./ActionsButton";
import TirageButton from "./TirageButton";
import StatusDesign from "./StatusDesign";
import TicketDisplay from "./TicketDisplay";
import styles from "@/app/ui/dashboard/customTable/customTable.module.css";
import SubTableContent from "./SubTableContent";
import TableLoader from "@/app/helpers/TableLoader";

interface GeneralColumn {
  id: "nom" | "prenom" | "email" | "phone" | "dateNaissance" | "placement";
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any) => string;
}

interface HistoryColumn {
  id: "nom" | "prenom" | "email" | "phone" | "dateNaissance" | "placement";
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any) => string;
}

const columns: readonly GeneralColumn[] = [
  { id: "nom", label: "NOM", minWidth: 120 },
  { id: "prenom", label: "PRÉNOM", minWidth: 120 },
  { id: "email", label: "EMAIL", minWidth: 200 },
  { id: "phone", label: "TÉLÉPHONE", minWidth: 130 },
  { id: "dateNaissance", label: "DATE DE NAISSANCE", minWidth: 150 },
  // { id: "ticketUrl", label: "PHOTO DU BILLET", minWidth: 140 },
  { id: "placement", label: "INFORMATION DE PLACEMENT", minWidth: 200 },
];

const historyColumns: readonly HistoryColumn[] = [
  { id: "nom", label: "NOM", minWidth: 120 },
  { id: "prenom", label: "PRÉNOM", minWidth: 120 },
  { id: "email", label: "EMAIL", minWidth: 200 },
  { id: "phone", label: "TÉLÉPHONE", minWidth: 130 },
  { id: "dateNaissance", label: "DATE DE NAISSANCE", minWidth: 150 },
  // { id: "ticketUrl", label: "PHOTO DU BILLET", minWidth: 140 },
  { id: "placement", label: "INFORMATION DE PLACEMENT", minWidth: 200 },
];

interface Placement {
  categorie?: string;
  bloc?: string;
  rang?: string;
  couloir?: string;
  RANGÉE?: string;
  SIÈGE?: string;
  SECTION?: string;
  siege?: string;
  [key: string]: any; // Permettre n'importe quelle propriété
}

interface Data {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  phone: string | undefined;
  dateNaissance: string;
  // ticketUrl: string;
  placement: Placement;
  textInfo: string;
}

interface HistoryData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  phone: string | undefined;
  dateNaissance: string;
  // ticketUrl: string;
  placement: Placement;
  textInfo: string;
}

// Fonction pour formater la date de naissance
const formatDateNaissance = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return "N/A";
  }
};

// Fonction pour formater les informations de placement
const formatPlacement = (placement: any): React.ReactNode => {
  // Vérification simple et directe
  if (!placement) {
    return <Typography variant="body2" style={{ color: '#888' }}>Aucune information</Typography>;
  }

  // Test direct avec vos données d'exemple
  if (placement.rang && placement.siege) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <Chip
          label={`RANG: ${placement.rang}`}
          size="small"
          variant="outlined"
          style={{ 
            color: 'white', 
            borderColor: '#4a5565',
            fontSize: '10px',
            height: '20px'
          }}
        />
        <Chip
          label={`SIÈGE: ${placement.siege}`}
          size="small"
          variant="outlined"
          style={{ 
            color: 'white', 
            borderColor: '#4a5565',
            fontSize: '10px',
            height: '20px'
          }}
        />
      </div>
    );
  }

  // Fallback pour tous les autres types de placement
  const entries = Object.entries(placement).filter(([key, value]) => {
    const isValid = value !== undefined && value !== "" && value !== null;
    return isValid;
  });
  
  if (entries.length === 0) {
    return <Typography variant="body2" style={{ color: '#888' }}>Vraiment aucune information</Typography>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
      {entries.map(([key, value], index) => (
        <Chip
          key={index}
          label={`${key.toUpperCase()}: ${String(value)}`}
          size="small"
          variant="outlined"
          style={{ 
            color: 'white', 
            borderColor: '#4a5565',
            fontSize: '10px',
            height: '20px',
            maxWidth: '180px'
          }}
        />
      ))}
    </div>
  );
};

function createData(participant: any): Data {
  return {
    id: participant.id,
    nom: participant.nom,
    prenom: participant.prenom,
    email: participant.email,
    phone: participant.phone && participant.phone.trim() !== "" ? participant.phone : "N/A",
    dateNaissance: participant.dateNaissance,
    // ticketUrl: participant.ticketUrl,
    placement: participant.placement, // Passage direct sans transformation
    textInfo: participant.textInfo
  };
}

function createHistoryData(participant: any): HistoryData {
  return {
    id: participant.id,
    nom: participant.nom,
    prenom: participant.prenom,
    email: participant.email,
    phone: participant.phone && participant.phone.trim() !== "" ? participant.phone : "N/A",
    dateNaissance: participant.dateNaissance,
    // ticketUrl: participant.ticketUrl,
    placement: participant.placement,
    textInfo: participant.textInfo
  };
}

type Props = {
  title: string;
  tableType: "general" | "history";
  pageType: "standard" | "tour";
  rows: any[]; // Garder le nom "rows" comme dans votre code original
  isLoading?: boolean;
};

export default function CustomTableParticipants({
  title,
  tableType = "general",
  pageType,
  rows = [], // Garder le nom "rows"
  isLoading = false,
}: Props) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const columnMap = {
    history: historyColumns,
    general: columns,
  };

  // Transformation des données des participants
  const transformedRows = React.useMemo(() => {
    if (tableType === "general") {
      return rows.map(participant => createData(participant));
    } else {
      return rows.map(participant => createHistoryData(participant));
    }
  }, [rows, tableType]);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  
  const defaultColumns = columnMap[tableType];
  const [openRows, setOpenRows] = React.useState<boolean[]>(
    Array(transformedRows.length).fill(false)
  );
  
  const handleCollapseToggle = (index: number) => {
    const updatedOpenRows = [...openRows];
    updatedOpenRows[index] = !updatedOpenRows[index];
    setOpenRows(updatedOpenRows);
  };

  return (
    <div className="flex flex-col justify-between gap-4">
      <h1 className="font-bold">{title}</h1>
      <Paper
        sx={{ width: "100%", overflow: "hidden", backgroundColor: "#141414" }}
      >
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {defaultColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align="center"
                    style={{
                      minWidth: column.minWidth,
                      color: "white",
                      backgroundColor: "rgba(128, 128, 128, 0.3)",
                      borderBottom: "2px solid #4a5565",
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            {isLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={defaultColumns.length} style={{ padding: 0 }}>
                    <TableLoader
                      columns={defaultColumns.map((c: any) => ({
                        id: c.id,
                        minWidth: c.minWidth || 100,
                        label: c.label,
                      }))}
                      rowsPerPage={rowsPerPage}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : transformedRows.length > 0 ? (
              <TableBody>
                {transformedRows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isLastRow = index === rowsPerPage - 1;
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow hover role="checkbox" tabIndex={-1}>
                          {defaultColumns.map((column) => {
                            const renderCellContent = (): React.ReactNode => {
                              const value = row[column.id as keyof typeof row];
                              
                              switch (column.id) {
                                // case "ticketUrl":
                                //   return <TicketDisplay ticketUrl={value as string} />;
                                
                                case "dateNaissance":
                                  return formatDateNaissance(value as string);
                                
                                case "placement":
                                  return formatPlacement(value as Placement);
                                
                                case "email":
                                  return (
                                    <div style={{ maxWidth: '180px', wordBreak: 'break-all' }}>
                                      {String(value || "N/A")}
                                    </div>
                                  );
                                
                                default:
                                  return String(value || "N/A");
                              }
                            };
                            
                            return (
                              <TableCell
                                style={{
                                  color: "white",
                                  borderBottom: isLastRow
                                    ? "none"
                                    : "2px solid #4a5565",
                                  fontSize: '11px',
                                  padding: '8px'
                                }}
                                className={styles.textAlignStyle}
                                key={column.id}
                                align="center"
                              >
                                {renderCellContent()}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={defaultColumns.length}>
                    <Typography component="span" variant="h6" color="warning">
                      Aucun participant trouvé pour cet événement
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          style={{ color: "white", textAlign: "center", alignSelf: "center" }}
          rowsPerPageOptions={[3, 5, 10, 25, 100]}
          component="div"
          labelRowsPerPage="Nombre de ligne par page"
          count={transformedRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}