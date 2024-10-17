import { createTheme } from "@mui/material";

export const createCustomTheme = (mode, primaryColor) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
      background: {
        default: mode === "dark" ? "#1a0033" : "#f0f0f0",
        paper: mode === "dark" ? "#2a0052" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#ffffff" : "#000000",
        secondary: mode === "dark" ? "#b088ff" : "#555555",
      },
    },
    typography: {
      fontFamily: "Terminus, monospace",
      fontSize: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: 'Terminus';
            font-style: normal;
            font-display: swap;
            font-weight: 400;
            src: url('/terminus.ttf') format('truetype');
          }
        `,
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 0,
            border: `1px solid ${primaryColor}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            
          },
          
        },
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
    },
    shape: {
      borderRadius: 0,
    },
  });