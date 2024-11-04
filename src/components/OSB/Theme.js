import React, { useState, useContext, createContext, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import {
  Water,
  Forest,
  WbSunny,
  LocalFireDepartment,
  Spa,
  Cloud,
  AcUnit,
  Landscape,
} from "@mui/icons-material";

export const ThemeContext = createContext({
  currentTheme: "ocean",
  setCurrentTheme: () => {},
  isDarkMode: true,
  setIsDarkMode: () => {},
  taskbarSettings: {
    transparent: true,
    width: 80,
    height: 48,
  },
  setTaskbarSettings: () => {},
  animationSpeed: "normal",
  setAnimationSpeed: () => {},
  themes: {},
  getCurrentTheme: () => {},
});

// Reduced, more focused color palette with carefully selected base colors
export const baseThemes = {
  ocean: {
    name: "Ocean",
    icon: <Water />,
    colors: {
      primary: "#2196f3",
      secondary: "#1976d2",
      background: "#f5f5f5",
      taskbar: "#2196f3",
      windowHeader: "#1976d2",
    },
  },
  forest: {
    name: "Forest",
    icon: <Forest />,
    colors: {
      primary: "#2e7d32",
      secondary: "#1b5e20",
      background: "#f5f5f5",
      taskbar: "#43a047",
      windowHeader: "#2e7d32",
    },
  },
  sunset: {
    name: "Sunset",
    icon: <WbSunny />,
    colors: {
      primary: "#ff9800",
      secondary: "#f57c00",
      background: "#f5f5f5",
      taskbar: "#ffa726",
      windowHeader: "#ff9800",
    },
  },
  ruby: {
    name: "Ruby",
    icon: <LocalFireDepartment />,
    colors: {
      primary: "#f44336",
      secondary: "#d32f2f",
      background: "#f5f5f5",
      taskbar: "#ef5350",
      windowHeader: "#f44336",
    },
  },
  lavender: {
    name: "Lavender",
    icon: <Spa />,
    colors: {
      primary: "#9c27b0",
      secondary: "#7b1fa2",
      background: "#f5f5f5",
      taskbar: "#ab47bc",
      windowHeader: "#9c27b0",
    },
  },
  sky: {
    name: "Sky",
    icon: <Cloud />,
    colors: {
      primary: "#03a9f4",
      secondary: "#0288d1",
      background: "#f5f5f5",
      taskbar: "#29b6f6",
      windowHeader: "#03a9f4",
    },
  },
  arctic: {
    name: "Arctic",
    icon: <AcUnit />,
    colors: {
      primary: "#00bcd4",
      secondary: "#0097a7",
      background: "#f5f5f5",
      taskbar: "#26c6da",
      windowHeader: "#00bcd4",
    },
  },
  meadow: {
    name: "Meadow",
    icon: <Landscape />,
    colors: {
      primary: "#4caf50",
      secondary: "#388e3c",
      background: "#f5f5f5",
      taskbar: "#66bb6a",
      windowHeader: "#4caf50",
    },
  },
};

// Enhanced dark mode color adjustments
function createDarkTheme(theme) {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      background: "#121212",
      taskbar: "#1e1e1e",
      windowHeader: "#1e1e1e",
    },
  };
}

export const ThemeProviderCustom = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("ocean");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [taskbarSettings, setTaskbarSettings] = useState({
    transparent: true,
    width: 80,
    height: 48,
  });
  const [animationSpeed, setAnimationSpeed] = useState("normal");

  const muiTheme = useMemo(() => {
    const activeTheme = baseThemes[currentTheme];
    const themeColors = isDarkMode ? createDarkTheme(activeTheme) : activeTheme;

    return createTheme({
      palette: {
        mode: isDarkMode ? "dark" : "light",
        primary: {
          main: themeColors.colors.primary,
        },
        secondary: {
          main: themeColors.colors.secondary,
        },
        background: {
          default: isDarkMode ? "#121212" : themeColors.colors.background,
          paper: isDarkMode ? "#1e1e1e" : "#ffffff",
        },
        text: {
          primary: isDarkMode ? "#ffffff" : "#000000",
          secondary: isDarkMode ? "#b0b0b0" : "#666666",
        },
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: isDarkMode
                ? "#1e1e1e"
                : themeColors.colors.primary,
            },
          },
        },
      },
    });
  }, [currentTheme, isDarkMode]);

  const contextValue = useMemo(
    () => ({
      currentTheme,
      setCurrentTheme,
      isDarkMode,
      setIsDarkMode,
      taskbarSettings,
      setTaskbarSettings,
      animationSpeed,
      setAnimationSpeed,
      themes: baseThemes,
      getCurrentTheme: () => {
        const theme = baseThemes[currentTheme];
        return isDarkMode ? createDarkTheme(theme) : theme;
      },
    }),
    [currentTheme, isDarkMode, taskbarSettings, animationSpeed]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
