import React, { useContext } from "react";
import { ThemeContext } from "./Theme";
import { BackgroundPattern, PatternProvider } from "./BackgroundPattern";
import Taskbar from "./Taskbar";
import { useWindowManager } from "./contexts/WindowManagerContext";
import WindowManager from "./WindowManager";
import IconGrid from "./iconGrid";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";

const Desktop = () => {
  const { currentTheme, currentPattern, isDarkMode, themes } =
    useContext(ThemeContext);
  const { openWindow } = useWindowManager();

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
    <PatternProvider>
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
        <BackgroundPattern />
        <WindowManager />
        <IconGrid onLaunchApp={handleLaunchApp} />
        <Taskbar />
      </Box>
    </PatternProvider>
  );
};

export default Desktop;
