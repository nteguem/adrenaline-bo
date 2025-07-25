"use client";
import {
  Box,
  createTheme,
  FormControl,
  outlinedInputClasses,
  TextField,
  Theme,
  ThemeProvider,
  useTheme,
} from "@mui/material";
import React from "react";

type Props = { data: string };

const customTheme = (outerTheme: Theme) =>
  createTheme({
    palette: {
      mode: outerTheme.palette.mode,
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: "#4a5565",
          },
          root: {
            [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: "#4a5565",
            },
            [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: "#4a5565",
            },
            [`& .MuiInputBase-input`]: {
              color: "white",
              padding: "13px 6px",
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: "white",
            "&.Mui-focused": {
              color: "white",
            },
          },
        },
      },
    },
  });
export default function InputComponent({}: Props) {
  const outerTheme = useTheme();
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
      <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
        <ThemeProvider theme={customTheme(outerTheme)}>
          <TextField
            sx={{ color: "white !important" }}
            label="Rechercher une date ou une ville ..."
          />
        </ThemeProvider>
      </FormControl>
    </Box>
  );
}
