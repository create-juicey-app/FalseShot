import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, ThemeProvider } from "@mui/material";
import { styled } from "@mui/system";
import Desktop from "./OSA/Desktop";
import TextEditor from "./OSB/Desktop";
import BootSequence from "./OSA/BootSequence";
import { ThemeProviderCustom } from "./OSB/Theme"; // Remove useTheme import
import { WindowManagerProvider } from "./OSB/contexts/WindowManagerContext";
import { isDebugModeEnabled } from './OSB/Theme'; // Add isDebugModeEnabled import

const ConsoleContainer = styled(Box)({
  minHeight: "100vh",
  backgroundColor: "#000000 !important",
  padding: "2rem",
  fontFamily: "monospace !important",
  position: "relative",
  "& *": {
    fontFamily: "monospace !important",
  },
});

const ConsoleText = styled(Typography)({
  color: "#00ff00 !important",
  fontFamily: "monospace !important",
});

const YellowText = styled(Typography)({
  color: "#ffff00 !important",
  fontFamily: "monospace !important",
});

const GrayText = styled(Typography)({
  color: "#666666 !important",
  fontFamily: "monospace !important",
});

const MenuOption = styled(Box)(({ selected }) => ({
  padding: "0.25rem 1rem",
  cursor: "pointer",
  backgroundColor: selected ? "#004400 !important" : "transparent",
  color: selected ? "#ffffff !important" : "#00ff00 !important",
  "&:hover": {
    backgroundColor: selected ? "#004400 !important" : "#002200 !important",
  },
}));

const BottomContainer = styled(Box)({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "2rem",
  backgroundColor: "#000000",
});

const OSSelectionLanding = ({
  themeA,
  themeB,
  themeModeA,
  primaryColorA,
  onThemeModeChangeA,
  onPrimaryColorChangeA,
  themeModeB,
  primaryColorB,
  onThemeModeChangeB,
  onPrimaryColorChangeB,
}) => {
  // Replace the useTheme hook usage with direct localStorage check
  const [debugMode, setDebugMode] = useState(() => isDebugModeEnabled());
  
  // Update debugMode when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setDebugMode(isDebugModeEnabled());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [selectedOS, setSelectedOS] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isBooting, setIsBooting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0);

  // Calculate blocks once on mount
  useEffect(() => {
    const containerWidth = window.innerWidth - 100; // Account for padding and brackets
    const charWidth = 19;
    const newTotalBlocks = Math.floor(containerWidth / charWidth) - 2; // Subtract 2 for brackets
    setTotalBlocks(newTotalBlocks);
  }, []); // Empty dependency array ensures this runs once

  const playBeep = () => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  useEffect(() => {
    playBeep();
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Automatically boot into JuicedOS when debug mode is off
  useEffect(() => {
    if (!debugMode) {
      handleOSSelect("alternative");
    }
  }, [debugMode]);

  const handleOSSelect = async (os) => {
    setIsBooting(true);

    const duration = totalBlocks * 10;
    const startTime = Date.now();

    while (Date.now() - startTime < duration) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 200 + 50)
      );
      console.log("totalBlocks:", totalBlocks);
      setProgress((prev) => {
        const increment = Math.floor(Math.random() * 3) + 1;
        return Math.min(prev + increment, totalBlocks);
      });
    }
    console.log("Boot completed");
    setProgress(totalBlocks);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSelectedOS(os);
  };

  // Modify handleKeyDown to handle only visible options
  const handleKeyDown = (e) => {
    if (isBooting) return;

    if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === "ArrowDown") {
      // Only allow moving down if TWM is visible (debug mode)
      if (debugMode) {
        setSelectedIndex((prev) => Math.min(1, prev + 1));
      }
    } else if (e.key === "Enter") {
      handleOSSelect(selectedIndex === 0 ? "alternative" : "twm");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (selectedOS === "twm") {
    return (
      <ThemeProvider theme={themeA}>
        <BootSequence>
          <Desktop
            themeMode={themeModeA}
            primaryColor={primaryColorA}
            onThemeModeChange={onThemeModeChangeA}
            onPrimaryColorChange={onPrimaryColorChangeA}
          />
        </BootSequence>
      </ThemeProvider>
    );
  }

  if (selectedOS === "alternative") {
    return (
      <ThemeProviderCustom>
        <WindowManagerProvider>
          <TextEditor />
        </WindowManagerProvider>
      </ThemeProviderCustom>
    );
  }

  const renderProgressBar = () => {
    const filled = "▮".repeat(progress);
    const empty = "▯".repeat(totalBlocks - progress);
    return `[${filled}${empty}]`;
  };

  return (
    <ConsoleContainer>
      <Box sx={{ mb: 10 }}>
        {showPrompt && !isBooting && debugMode && ( // Only show prompt if debug mode is enabled
          <Box sx={{ mt: 4, mb: 4 }}>
            <YellowText variant="body1" sx={{ mb: 2 }}>
              Please select an operating system:
            </YellowText>

            <MenuOption
              selected={selectedIndex === 0}
              onClick={() => !isBooting && handleOSSelect("alternative")}
            >
              {selectedIndex === 0 ? ">" : " "} Juiced OS
            </MenuOption>

            <MenuOption
              selected={selectedIndex === 1}
              onClick={() => !isBooting && handleOSSelect("twm")}
            >
              {selectedIndex === 1 ? ">" : " "} TWM OS
            </MenuOption>

            <GrayText variant="body2" sx={{ mt: 2 }}>
              Use ↑↓ arrows to select and Enter to boot
            </GrayText>
          </Box>
        )}

        {/* Only show boot options text if in debug mode */}
        {debugMode && (
          <GrayText variant="body2" sx={{ mt: 4 }}>
            Press F12 for boot options | ESC for BIOS
          </GrayText>
        )}
      </Box>

      {isBooting && (
        <BottomContainer>
          <YellowText variant="body1" sx={{ mb: 1 }}>
            Loading selected OS...
          </YellowText>
          <ConsoleText
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              letterSpacing: "0.1em",
            }}
          >
            {renderProgressBar()}
          </ConsoleText>
        </BottomContainer>
      )}
    </ConsoleContainer>
  );
};

export default OSSelectionLanding;
