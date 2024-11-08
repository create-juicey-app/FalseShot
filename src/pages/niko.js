import React from "react";
import dynamic from "next/dynamic";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "@/apps/Nyko";

const NikoPage = () => {
  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#ff9800", // Orange
      },
      secondary: {
        main: "#ff5722", // Deep Orange
      },
      background: {
        default: "#121212",
        paper: "#1e1e1e",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            padding: 0,
          },
          "#__next": {
            margin: 0,
            padding: 0,
            width: "100%",
          },
        },
      },
    },
  });

  const pageStyle = {
    margin: 0,
    padding: 0,
    width: "100vw",
    minWidth: "100vw",
    maxWidth: "100vw",
    position: "relative",
    overflow: "hidden",
    "& .MuiCircularProgress-root": {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  };

  return (
    <div style={{ ...pageStyle, overflow: "hidden" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App style={{ margin: 0, padding: 0, width: "100%" }} />
      </ThemeProvider>
    </div>
  );
};

export default NikoPage;
