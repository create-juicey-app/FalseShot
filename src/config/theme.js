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
        fontFamily: ["Pixel", "Arial", "sans-serif"].join(","),
        primary: mode === "dark" ? primaryColor : "#000000",
        secondary: mode === "dark" ? primaryColor : "#555555",
      },
    },
    typography: {
      fontFamily: ["Pixel", "Arial", "sans-serif"].join(","),
      fontSize: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: 'Pixel';
            src: url('/fonts/pixel.TTF') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          
          body, html {
            font-family: 'Pixel', Arial, sans-serif !important;
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
      MuiSlider: {
        styleOverrides: {
          thumb: {
            backgroundImage: `url('/knob.png')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            width: 24,
            height: 24,
            backgroundColor: "transparent",
            border: "none",
            boxShadow: "none",
            "&::before": {
              display: "none",
            },
            filter:
              "invert(40%) sepia(100%) saturate(7500%) hue-rotate(265deg) brightness(100%) contrast(100%)",
          },
          rail: {
            backgroundColor: "transparent",
            border: `2px solid ${primaryColor}`,
            borderRadius: 0,
          },
          track: {
            backgroundColor: primaryColor,
            borderRadius: 0,
          },
        },
      },
    },
    shape: {
      borderRadius: 0,
    },
  });
