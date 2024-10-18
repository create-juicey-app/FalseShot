import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Desktop from "../components/Desktop";
import {
  IconButton,
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  Fab,
} from "@mui/material";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4CAF50",
    },
    secondary: {
      main: "#FFC107",
    },
    background: {
      default: "#000000",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B0BEC5",
    },
  },
  typography: {
    fontFamily: "'Pixel', monospace",
  },
});

const BootSequence = () => {
  const [bootCompleted, setBootCompleted] = useState(false);
  const [bootStarted, setBootStarted] = useState(false);
  const [bootMessages, setBootMessages] = useState([]);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const audioContextRef = useRef(null);
  const bootAudioRef = useRef(null);

  useEffect(() => {
    const hasBooted = localStorage.getItem("twmWebOSBooted") === "true";
    if (hasBooted) {
      setBootCompleted(true);
      setShowDesktop(true);
    }
  }, []);

  const generateBootMessages = () => [
    {
      message: "Initializing The World Machine BETA TESTING BUILD 66813...",
      delay: 1000,
    },
    { message: "Loading core modules...", delay: 1200 },
    { message: "Establishing secure connection...", delay: 1500 },
    { message: "Syncing services...", delay: 1300 },
    { message: "Reloading closet", delay: 1000 },
    { message: "Loading user preferences...", delay: 400 },
    { message: "Initializing virtual workspace...", delay: 1000 },
    { message: "Connecting to servers...", delay: 4000 },
    { message: "Preparing applications...", delay: 1000 },
    { message: "Finalizing startup sequence...", delay: 7000 },
  ];

  const startBoot = () => {
    setBootStarted(true);
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
  };

  const resetBoot = () => {
    localStorage.removeItem("twmWebOSBooted");
    window.location.reload();
  };

  useEffect(() => {
    if (!bootStarted || bootCompleted) return;

    let timeoutId;
    const messages = generateBootMessages();
    let currentIndex = 0;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      440,
      audioContextRef.current.currentTime
    );
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    oscillator.start();

    const displayNextMessage = () => {
      if (currentIndex < messages.length) {
        setBootMessages((prev) => [...prev, messages[currentIndex].message]);

        oscillator.frequency.setValueAtTime(
          440 + currentIndex * -10,
          audioContextRef.current.currentTime
        );
        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.00001,
          audioContextRef.current.currentTime + 0.1
        );

        timeoutId = setTimeout(() => {
          currentIndex++;
          displayNextMessage();
        }, messages[currentIndex].delay + Math.random() * 500);
      } else {
        oscillator.stop();
        setShowFullScreenImage(true);
        bootAudioRef.current = new Audio("/boot.wav");
        bootAudioRef.current.play();
        const imageDuration = 5000 + Math.random() * 3000;
        timeoutId = setTimeout(() => {
          setShowFullScreenImage(false);
          setShowDesktop(true);
          localStorage.setItem("twmWebOSBooted", "true");
        }, imageDuration);
      }
    };

    displayNextMessage();

    return () => {
      clearTimeout(timeoutId);
      oscillator.stop();
      if (bootAudioRef.current) {
        bootAudioRef.current.pause();
        bootAudioRef.current.currentTime = 0;
      }
    };
  }, [bootStarted, bootCompleted]);

  if (showDesktop) {
    return (
      <Box>
        <Desktop />
        <Fab
          sx={{
            position: "fixed",
            bottom: "4rem",
            right: "1rem",
          }}
          variant="contained"
          color="secondary"
          size="small"
          onClick={resetBoot}
        >
          <PowerSettingsNewRoundedIcon />
        </Fab>
      </Box>
    );
  }

  if (showFullScreenImage) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "background.default",
        }}
      >
        <Image
          src="/twm-labs-splash.jpg"
          alt="TWM Labs Splash"
          layout="fill"
          objectFit="cover"
        />
      </Box>
    );
  }

  if (!bootStarted && !bootCompleted) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#000000",
        }}
      >
        <IconButton
          variant="contained"
          color="primary"
          size="large"
          onClick={startBoot}
          sx={{
            scale: "5",
          }}
        >
          <PowerSettingsNewRoundedIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#000000",
        color: "text.primary",
        fontFamily: "'Pixel', monospace",
        fontSize: "1rem",
        lineHeight: "1.2",
        letterSpacing: "0.1em",
        padding: 0,
        margin: 0,
      }}
    >
      <Box sx={{ position: "absolute", top: "1rem", right: "1rem" }}>
        <img src="/TWM.png" alt="TWM Labs" width={300} height={150} />
      </Box>
      <Box sx={{ flexGrow: 1, overflow: "auto", padding: "1rem" }}>
        {bootMessages.map((message, index) => (
          <Typography key={index} sx={{ mb: 1 }}>
            {message}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

const Home = () => {
  return (
    <ThemeProvider theme={theme}>
      <BootSequence />
    </ThemeProvider>
  );
};

export default Home;
