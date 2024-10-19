import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IconButton, Box, Typography, Fab } from "@mui/material";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";

const BootSequence = ({ children }) => {
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
    { message: "TWM Labs", delay: 100 },
    { message: "v1.24.10.5", delay: 100 },
    { message: "TWMBIOS(C)X021 TWM ENTERPRISE, INC.", delay: 80 },
    { message: "XIDON 2290-B ACPI BIOS Revision 1043", delay: 200 },
    { message: "CPU: YTEC(R) Y-4430M CPU @1.650GHz", delay: 60 },
    { message: "Checking LPRAM...", delay: 1200 },
    { message: "2048KB OK", delay: 80 },
    { message: "Detecting SCSI Devices.....", delay: 100 },
    { message: "SCSI1: Directional Input Device #140F604", delay: 300 },
    { message: "SCSI2: Network Port #1B01C20", delay: 400 },
    { message: "SCSI4: Remote Presence #200A490", delay: 200 },
    { message: "Auto-detecting Mass Storage...", delay: 1200 },
    { message: "512MB MTD500100593-3B1", delay: 100 },
    { message: "Scanning sounds.....", delay: 700 },
    { message: "Scan complete. Found 112 sounds.", delay: 200 },
    { message: "All sounds loaded.", delay: 100 },
    { message: "Loading system textures:", delay: 400 },
    { message: "All system textures loaded.", delay: 100 },
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
          440 + currentIndex * -1,
          audioContextRef.current.currentTime
        );
        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.00001,
          audioContextRef.current.currentTime + 0.08
        );

        timeoutId = setTimeout(() => {
          currentIndex++;
          displayNextMessage();
        }, messages[currentIndex].delay);
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
        {children}
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src="/Splash.png"
            alt="TWM Labs Splash"
            layout="fill"
            objectFit="contain"
            priority
          />
        </Box>
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
        color: "#8a2be2", // Purple color
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
          <Typography key={index} sx={{ mb: 0.5 }}>
            {message}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default BootSequence;
