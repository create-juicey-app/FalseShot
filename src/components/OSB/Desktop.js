import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "./Theme";
import { BackgroundPattern, PatternProvider } from "./BackgroundPattern";
import Taskbar from "./Taskbar";
import { useWindowManager } from "./contexts/WindowManagerContext";
import WindowManager from "./WindowManager";
import IconGrid from "./IconGrid";
import { Box, useMediaQuery, Snackbar, Alert } from "@mui/material";
import Image from 'next/image';
import dynamic from "next/dynamic";
import { BackgroundProvider, Background } from './Background';
import { motion } from 'framer-motion';

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
    }}>
    <Image 
      src="/turndevice.png" 
      alt="Please rotate your device"
      layout="intrinsic"
      width={500}
      height={500}
      style={{
        maxWidth: '100%',
        height: 'auto',
        transform: 'scale(2)',
      }}
    />
    
  </Box>
);

const Desktop = () => {
  const { currentTheme, currentPattern, isDarkMode, themes, debugMode } =
    useContext(ThemeContext);
  const { openWindow, isScreenShaking } = useWindowManager();
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isMobile = useMediaQuery('(max-width:768px)');
  const [error, setError] = useState(null);

  // Modify error boundary effect to only catch errors
  useEffect(() => {
    if (debugMode) {
      const originalConsoleError = console.error;

      console.error = (...args) => {
        // Extract function name from error message if possible
        const errorMessage = args.join(' ');
        const functionMatch = errorMessage.match(/(?:Error in|at) `?([^`\n]+)`?/);
        const functionName = functionMatch ? functionMatch[1] : 'Unknown function';
        
        setError(`${functionName} just failed! Please check console for debugging`);
        originalConsoleError.apply(console, args);
      };

      return () => {
        console.error = originalConsoleError;
      };
    }
  }, [debugMode]);

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
      icon: app.icon, // Pass the icon to the window
    });
  };

  if (!themes || !themes[currentTheme]) return null;

  const activeTheme = themes[currentTheme];

  return (
    <BackgroundProvider>
      {isMobile && isPortrait && <TurnDeviceOverlay />}
      <motion.div
        animate={
          isScreenShaking
            ? {
                x: [20, 10, 60, -30, -15, 15, 0],
                y: [-30, 93, -10, 10, 15, -15, 0],
              }
            : {}
        }
        transition={isScreenShaking ? { duration: 0.6 } : {}}
        style={{ width: "100%", height: "100%" }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            overflow: "visible", // Change from "hidden" to "visible"
            position: "relative",
            backgroundColor: isDarkMode
              ? "#121212"
              : activeTheme.colors.background,
            // Remove the backgroundSize property here as it's handled by BackgroundPattern
            transition: "background-color 0.3s ease",
          }}
        >
          <Background />
          <WindowManager />
          <IconGrid onLaunchApp={handleLaunchApp} />
          <Taskbar />
        </Box>
      </motion.div>
      {debugMode && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{zIndex: 999999}}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
            
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </BackgroundProvider>
  );
};

export default Desktop;
