import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Box, Typography, useTheme } from "@mui/material";

const BootSequence = ({ children }) => {
  const theme = useTheme();
  const [bootMessages, setBootMessages] = useState([]);
  const [showDesktop, setShowDesktop] = useState(false);
  const audioContextRef = useRef(null);

  const generateBootMessages = () => [
    { message: "TWM Labs v1.24", delay: 50 },
    { message: "[    0.000000] Linux version 6.5.0-twm1", delay: 20 },
    {
      message:
        "[    0.000000] Command line: BOOT_IMAGE=/boot/twm-6.5.0 root=UUID=twm-01",
      delay: 20,
    },
    {
      message: "[    0.000000] x86/fpu: Supporting XSAVE feature 0x001",
      delay: 10,
    },
    {
      message:
        "[    0.000000] x86/fpu: xstate_offset[2]:  576, xstate_sizes[2]:  256",
      delay: 10,
    },
    { message: "[    0.000000] signal: max sigframe size: 1440", delay: 10 },
    { message: "[    0.000000] BIOS-provided physical RAM map:", delay: 10 },
    {
      message:
        "[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable",
      delay: 10,
    },
    {
      message:
        "[    0.000000] PM: Registered nosave memory: [mem 0x00000000-0x00000fff]",
      delay: 10,
    },
    { message: "[    0.000000] AGP: No AGP bridge found", delay: 10 },
    { message: "[    0.004000] Memory: 16384MB DDR4", delay: 10 },
    { message: "[    0.004000] ACPI: Core revision 20230331", delay: 10 },
    {
      message:
        "[    0.004321] thermal_sys: loading out-of-tree module taints kernel",
      delay: 10,
    },
    {
      message:
        "[    0.006000] systemd[1]: System time before build time, advancing clock.",
      delay: 10,
    },
    {
      message: "[    0.008000] systemd[1]: Detected architecture x86-64.",
      delay: 10,
    },
    {
      message: "[    0.009000] systemd[1]: Set hostname to <twm-labs>.",
      delay: 10,
    },
    {
      message:
        "[    0.010000] systemd[1]: Initializing machine ID from random generator.",
      delay: 10,
    },
    {
      message:
        "[    0.012000] systemd-sysv-generator[xyz]: SysV service '/etc/init.d/twm' lacks a native systemd unit file.",
      delay: 10,
    },
    {
      message: "[    0.014000] systemd[1]: Reached target Local File Systems.",
      delay: 10,
    },
    {
      message: "[    0.016000] systemd[1]: Starting Load Kernel Module drm...",
      delay: 10,
    },
    {
      message: "[    0.018000] systemd[1]: Starting Apply Kernel Variables...",
      delay: 10,
    },
    {
      message: "[    0.020000] TWM-Labs GPU driver v3.14.15 loaded",
      delay: 10,
    },
    {
      message: "[    0.022000] TWM-Labs Audio subsystem initialized",
      delay: 10,
    },
    {
      message: "[    0.024000] NET: Registered PF_INET6 protocol family",
      delay: 10,
    },
    {
      message: "[    0.026000] TWM-Labs Network Stack v2.0 initialized",
      delay: 10,
    },
    {
      message: "[    0.028000] Starting TWM Desktop Environment...",
      delay: 10,
    },
    { message: "[    0.030000] Loading user preferences...", delay: 10 },
    { message: "[    0.032000] Initializing window manager...", delay: 10 },
    { message: "[    0.034000] Starting system services...", delay: 10 },
    {
      message: "[    0.036000] TWM-Labs system initialization complete",
      delay: 10,
    },
    { message: "[    0.038000] Starting TWM session...", delay: 10 },
    { message: "Welcome to TWM Labs OS", delay: 50 },
  ];

  useEffect(() => {
    const hasBooted = localStorage.getItem("twmWebOSBooted") === "true";
    if (hasBooted) {
      setShowDesktop(true);
    } else {
      startBoot();
    }
  }, []);

  const startBoot = () => {
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Play a quick boot sound
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(
      880,
      audioContextRef.current.currentTime
    );
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.00001,
      audioContextRef.current.currentTime + 0.1
    );
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.1);

    let timeoutId;
    const messages = generateBootMessages();
    let currentIndex = 0;

    const displayNextMessage = () => {
      if (currentIndex < messages.length) {
        setBootMessages((prev) => [...prev, messages[currentIndex].message]);
        timeoutId = setTimeout(() => {
          currentIndex++;
          displayNextMessage();
        }, messages[currentIndex].delay);
      } else {
        setTimeout(() => {
          setShowDesktop(true);
          localStorage.setItem("twmWebOSBooted", "true");
        }, 100);
      }
    };

    displayNextMessage();

    return () => {
      clearTimeout(timeoutId);
    };
  };

  if (showDesktop) {
    return (
      <Box sx={{ bgcolor: theme.palette.background.default }}>{children}</Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        color: theme.palette.primary.main,
        fontFamily: "'Consolas', monospace",
        padding: 0,
        margin: 0,
      }}
    >
      <Box sx={{ position: "absolute", top: "1rem", right: "1rem" }}>
        <img src="/TWM.png" alt="TWM Labs" width={300} height={150} />
      </Box>
      <Box sx={{ flexGrow: 1, overflow: "auto", padding: "1rem" }}>
        {bootMessages.map((message, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              mb: 0.5,
              color: theme.palette.primary.main,
              fontFamily: "'Consolas', monospace",
            }}
          >
            {message}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default BootSequence;
