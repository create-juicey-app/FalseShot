import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Desktop from "../components/Desktop";
import { createCustomTheme } from "../config/theme";
import BootSequence from "../components/BootSequence";

const Home = () => {
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("themeMode") || "dark";
    }
    return "dark";
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("primaryColor") || "#8855ff";
    }
    return "#8855ff";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem("primaryColor", primaryColor);
  }, [primaryColor]);

  const customTheme = createCustomTheme(themeMode, primaryColor);

  const handleThemeModeChange = () => {
    setThemeMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  const handlePrimaryColorChange = (event) => {
    setPrimaryColor(event.target.value);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <BootSequence>
        <Desktop
          themeMode={themeMode}
          primaryColor={primaryColor}
          onThemeModeChange={handleThemeModeChange}
          onPrimaryColorChange={handlePrimaryColorChange}
        />
      </BootSequence>
    </ThemeProvider>
  );
};

export default Home;
