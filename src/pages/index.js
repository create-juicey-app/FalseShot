import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { createCustomTheme } from "../config/theme";
import OSSelectionLanding from "../components/DualBoot";

const Home = () => {
  // Theme state for OSA
  const [themeModeA, setThemeModeA] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("themeModeA") || "dark";
    }
    return "dark";
  });

  const [primaryColorA, setPrimaryColorA] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("primaryColorA") || "#6442a5";
    }
    return "#6442a5";
  });

  // Theme state for OSB
  const [themeModeB, setThemeModeB] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("themeModeB") || "light";
    }
    return "light";
  });

  const [primaryColorB, setPrimaryColorB] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("primaryColorB") || "#2196f3";
    }
    return "#2196f3";
  });

  // Persist theme settings
  useEffect(() => {
    localStorage.setItem("themeModeA", themeModeA);
    localStorage.setItem("primaryColorA", primaryColorA);
    localStorage.setItem("themeModeB", themeModeB);
    localStorage.setItem("primaryColorB", primaryColorB);
  }, [themeModeA, primaryColorA, themeModeB, primaryColorB]);

  // Create themes
  const themeA = createCustomTheme(themeModeA, primaryColorA);
  const themeB = createCustomTheme(themeModeB, primaryColorB);

  // Theme handlers for OSA
  const handleThemeModeChangeA = () => {
    setThemeModeA((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  const handlePrimaryColorChangeA = (event) => {
    setPrimaryColorA(event.target.value);
  };

  // Theme handlers for OSB
  const handleThemeModeChangeB = () => {
    setThemeModeB((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  const handlePrimaryColorChangeB = (event) => {
    setPrimaryColorB(event.target.value);
  };

  return (
    <ThemeProvider theme={themeA}>
      <CssBaseline />
      <title>Falseshot V0.8</title>
      <h1>Falseshot V0.8</h1>
      <h3>403 ERROR</h3>
      
    </ThemeProvider>
  );
};

export default Home;
/