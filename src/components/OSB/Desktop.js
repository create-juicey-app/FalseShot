import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "./Theme";
import { BackgroundPattern, PatternProvider } from "./BackgroundPattern";
import Taskbar from "./Taskbar";
import { useWindowManager } from "./contexts/WindowManagerContext";
import WindowManager from "./WindowManager";
import IconGrid from "./IconGrid";
import { Box, useMediaQuery } from "@mui/material";
import dynamic from "next/dynamic";
import { BackgroundProvider, Background } from './Background';

const TurnDeviceOverlay = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999,
    }}
  >
    <img 
      src="/turndevice.png" 
      alt="Please rotate your device"
      style={{
        maxWidth: '100%',
        height: 'auto',
        scale: 2,
      }}
    />
  </Box>
);

const Desktop = () => {
  const { currentTheme, currentPattern, isDarkMode, themes } =
    useContext(ThemeContext);
  const { openWindow } = useWindowManager();
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isMobile = useMediaQuery('(max-width:768px)');

  const handleLaunchApp = async (app) => {
    const AppComponent = dynamic(() => import(`@/apps/${app.filename}`), {
      loading: () => <div>Loading...</div>,
    });

    openWindow({
      id: `${app.id}-${Date.now()}`,
      title: app.label,
      content: <AppComponent {...app.componentProps} />,
      size: {
        width: app.windowProps.width,
        height: app.windowProps.height,
      },
    });
  };

  if (!themes || !themes[currentTheme]) return null;

  const activeTheme = themes[currentTheme];

  return (
    <BackgroundProvider>
      {isMobile && isPortrait && <TurnDeviceOverlay />}
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          overflow: "visible", // Change from "hidden" to "visible"
          position: "relative",
          backgroundColor: isDarkMode
            ? "#121212"
            : activeTheme.colors.background,
          backgroundSize: currentPattern === "grid" ? "40px 40px" : "20px 20px",
          transition: "background-color 0.3s ease",
        }}
      >
        <Background />
        <WindowManager />
        <IconGrid onLaunchApp={handleLaunchApp} />
        <Taskbar />
      </Box>
    </BackgroundProvider>
  );
};

export default Desktop;
