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
        paper: mode === "dark" ? "#000000" : "#ffffff",
      },
      text: {
        fontFamily: ["Pixel"].join(","),
        primary: mode === "dark" ? primaryColor : "#000000",
        secondary: mode === "dark" ? primaryColor : "#555555",
      },
    },
    typography: {
      fontFamily: "Pixel",
      fontSize: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: 'Pixel';
            font-style: normal;
            font-display: swap;
            font-weight: 400;
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
