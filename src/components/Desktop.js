import React, { useState, useRef } from "react";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  CircularProgress,
} from "@mui/material";
import { createCustomTheme } from "../config/theme";
import DesktopIcons from "./DesktopIcons";
import WindowManager from "./WindowManager";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import SettingsDrawer from "./SettingsDrawer";
import { apps } from "../config/apps";

const Desktop = () => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState("dark");
  const [primaryColor, setPrimaryColor] = useState("#8855ff");

  const customTheme = createCustomTheme(themeMode, primaryColor);
  const windowManagerRef = useRef(null);

  const handleStartClick = (event) => {
    setAnchorEl(event.currentTarget);
    setIsStartMenuOpen(true);
  };

  const handleStartClose = () => {
    setAnchorEl(null);
    setIsStartMenuOpen(false);
  };

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
    handleStartClose();
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleThemeModeChange = () => {
    setThemeMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  const handlePrimaryColorChange = (event) => {
    setPrimaryColor(event.target.value);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "background.default",
          color: "text.primary",
          overflow: "hidden",
          position: "relative",
          backgroundImage: "radial-gradient(#ffffff11 1px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      >
        <DesktopIcons 
          apps={apps} 
          openWindow={(app) => windowManagerRef.current?.openWindow(app)} 
        />
        <WindowManager
          ref={windowManagerRef}
          apps={apps}
        />
        <Taskbar
          handleStartClick={handleStartClick}
          minimizeAllWindows={() => windowManagerRef.current?.minimizeAllWindows()}
          windows={windowManagerRef.current?.getWindows() || []}
          activeWindow={windowManagerRef.current?.getActiveWindow()}
          setActiveWindow={(id) => windowManagerRef.current?.setActiveWindow(id)}
        />
        <StartMenu
          anchorEl={anchorEl}
          isOpen={isStartMenuOpen}
          onClose={handleStartClose}
          apps={apps}
          openWindow={(app) => {
            windowManagerRef.current?.openWindow(app);
            handleStartClose();
          }}
          openSettings={handleSettingsOpen}
        />
        <SettingsDrawer
          isOpen={isSettingsOpen}
          onClose={handleSettingsClose}
          themeMode={themeMode}
          primaryColor={primaryColor}
          onThemeModeChange={handleThemeModeChange}
          onPrimaryColorChange={handlePrimaryColorChange}
        />
      </Box>
    </ThemeProvider>
  );
};

export default Desktop;