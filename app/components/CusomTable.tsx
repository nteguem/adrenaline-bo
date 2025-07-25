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
import { Collapse } from "@mui/material";
import ActionsButton from "./ActionsButton";
import TirageButton from "./TirageButton";
import StatusDesign from "./StatusDesign";
import styles from "@/app/ui/dashboard/customTable/customTable.module.css";
import SubTableContent from "./SubTableContent";
import TirageDialog from "./CreateTirageDialog";

interface Column {
  id: "date" | "ville" | "participants" | "actions";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  formatDate?: (value: string) => string;
}

interface HistoryColumn {
  id: "date" | "ville" | "participants" | "gagnants" | "actions";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  formatDate?: (value: string) => string;
}

interface TourColumn {
  id:
    | "date"
    | "ville"
    | "salle"
    | "participants"
    | "statut"
    | "tirage"
    | "actions";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  formatDate?: (value: string) => string;
}
interface TirageColumn {
  id:
    | "date"
    | "ville"
    | "datetirage"
    | "participants"
    | "gagnants"
    | "statut"
    | "actions";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  formatDate?: (value: string) => string;
}

interface DateColumn {
  id:
    | "date"
    | "ville"
    | "salle"
    | "participants"
    | "statut"
    | "tirage"
    | "actions";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  formatDate?: (value: string) => string;
}
const tirageColumns: readonly TirageColumn[] = [
  {
    id: "date",
    label: "Date concert",
    minWidth: 100,
    formatDate: (value: string) => new Date(value).toLocaleDateString(),
  },
  { id: "ville", label: "Ville", minWidth: 100 },
  // { id: "datetirage", label: "Date tirage", minWidth: 100 },
  // {
  //   id: "gagnants",
  //   label: "Nb gagnants",
  //   minWidth: 170,
  //   align: "right",
  // },
  {
    id: "statut",
    label: "Statut",
    minWidth: 170,
    align: "right",
  },

  {
    id: "actions",
    label: "Actions",
    minWidth: 170,
    align: "right",
  },
];
const dateColumns: readonly DateColumn[] = [
  {
    id: "date",
    label: "Date",
    minWidth: 100,
    formatDate: (value: string) => new Date(value).toLocaleDateString(),
  },
  { id: "ville", label: "Ville", minWidth: 100 },
  { id: "salle", label: "Salle", minWidth: 100 },
  {
    id: "participants",
    label: "Participants",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "statut",
    label: "Statut",
    minWidth: 170,
    align: "right",
  },
  {
    id: "tirage",
    label: "Tirage",
    minWidth: 170,
    align: "right",
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 170,
    align: "right",
  },
];

const tourColumns: readonly TourColumn[] = [
  {
    id: "date",
    label: "Date",
    minWidth: 100,
    formatDate: (value: string) => new Date(value).toLocaleDateString(),
  },
  { id: "ville", label: "Ville", minWidth: 100 },
  { id: "salle", label: "Salle", minWidth: 100 },
  {
    id: "participants",
    label: "Participants",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "statut",
    label: "Statut",
    minWidth: 170,
    align: "right",
  },
  {
    id: "tirage",
    label: "Tirage",
    minWidth: 170,
    align: "right",
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 170,
    align: "right",
  },
];

const columns: readonly Column[] = [
  {
    id: "date",
    label: "Date",
    minWidth: 100,
    formatDate: (value: string) => new Date(value).toLocaleDateString(),
  },
  { id: "ville", label: "Ville", minWidth: 100 },
  {
    id: "participants",
    label: "Participants",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(2),
  },
];

const historyColumns: readonly HistoryColumn[] = [
  {
    id: "date",
    label: "Date",
    minWidth: 100,
    formatDate: (value: string) => new Date(value).toLocaleDateString(),
  },
  { id: "ville", label: "Ville", minWidth: 100 },
  {
    id: "participants",
    label: "Participants",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "gagnants",
    label: "Gagnants",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(0),
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(2),
  },
];

interface Data {
  id: string;
  date: string;
  ville: string;
  participants: number;
  actions: number;
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

type Props = {
  title: string;
  tableType: "tirage" | "history" | "tour" | "date" | "tirage_s";
  pageType: "standard" | "tour" | "date" | "tirage_s";
  rows: DateData[] | HistoryData[];
};

export default function CustomTable({
  title,
  tableType = "tirage",
  pageType,
  rows,
}: Props) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(30);
  const [open, setOpen] = React.useState(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const columnMap = {
    history: historyColumns,
    tour: tourColumns,
    tirage: columns,
    date: dateColumns,
    tirage_s: tirageColumns,
  };
  const rowMap = {
    history: rows,
    tour: rows,
    tirage: rows,
    date: rows,
    tirage_s: rows,
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const defaulColumns = columnMap[tableType];
  const defaultRows = rowMap[tableType];
  const [openRows, setOpenRows] = React.useState<boolean[]>(
    Array(defaultRows.length).fill(false)
  );
  const handleCollapseToggle = (index: number) => {
    const updatedOpenRows = [...openRows];
    updatedOpenRows[index] = !updatedOpenRows[index];
    setOpenRows(updatedOpenRows);
  };
  const handleToggle = (index: number) => {
    setOpenRows((prev) =>
      prev.map((isOpen, i) => (i === index ? !isOpen : isOpen))
    );
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
                {defaulColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align="center"
                    style={{
                      minWidth: column.minWidth,
                      color: "white",
                      backgroundColor: "rgba(128, 128, 128, 0.3)",
                      borderBottom: "2px solid #4a5565",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {defaultRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isLastRow = index === rowsPerPage - 1;
                  return (
                    <React.Fragment key={index}>
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        {defaulColumns.map((column) => {
                          const value = row[column.id as keyof typeof row];
                          const statusValue =
                            column.id === "statut" ? value : "";
                          return (
                            <TableCell
                              style={{
                                color: "white",
                                borderBottom: isLastRow
                                  ? "none"
                                  : "2px solid #4a5565",
                              }}
                              className={styles.textAlignStyle}
                              key={column.id}
                              align="center"
                            >
                              {column.id === "actions" &&
                              tableType !== "tirage_s" ? (
                                <ActionsButton
                                  tableType={tableType}
                                  pageType={pageType}
                                  status={value}
                                  collapseState={openRows[index]}
                                  setAction={() => handleCollapseToggle(index)}
                                  eventId={row.id}
                                />
                              ) : column.id === "tirage" ? (
                                <TirageButton status={value} rowId={row.id} />
                              ) : column.format && typeof value === "number" ? (
                                column.format(value)
                              ) : column.id === "statut" ? (
                                <StatusDesign value={value} />
                              ) : column.id === "actions" &&
                                tableType === "tirage_s" ? (
                                <TirageDialog id={row.id} statut={row.statut} />
                              ) : column.formatDate && column.id === "date" ? (
                                column.formatDate(value?.toString())
                              ) : (
                                value
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      {/* {tableType === "tirage_s" && (
                        <TableRow>
                          <TableCell colSpan={1000} sx={{ padding: "0" }}>
                            <Collapse
                              in={openRows[index]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <SubTableContent data={row} />
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )} */}
                      {tableType === "tour" && (
                        <TableRow>
                          <TableCell colSpan={1000} sx={{ padding: "0" }}>
                            <Collapse
                              in={openRows[index]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <SubTableContent
                                index={index}
                                onToggle={handleToggle}
                                data={row}
                              />
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          style={{ color: "white" }}
          rowsPerPageOptions={[3, 5, 10, 25, 100]}
          component="div"
          count={defaultRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          labelRowsPerPage="Nombre de ligne par page"
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
