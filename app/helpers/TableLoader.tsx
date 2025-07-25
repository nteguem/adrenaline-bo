import React from "react";
import Skeleton from "@mui/material/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from "@mui/material";

interface Column {
  id: string;
  minWidth: number;
  label: string;
}

// Define the props interface for TableLoader
interface TableLoaderProps {
  columns: Column[];
  rowsPerPage: number;
}

const TableLoader: React.FC<TableLoaderProps> = ({ columns, rowsPerPage }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell
              key={column.id}
              align="center"
              style={{ minWidth: column.minWidth }}
            >
              <Skeleton
                sx={{ bgcolor: "gray" }}
                width="60%"
                animation="pulse"
              />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from(new Array(rowsPerPage)).map((_, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={column.id} align="center">
                <Skeleton
                  sx={{ bgcolor: "gray" }}
                  height={60}
                  variant="text"
                  animation="pulse"
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableLoader;
