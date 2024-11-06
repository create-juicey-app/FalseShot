// src/components/Taskbar.jsx

import React, { useState, useContext } from "react";
import { Paper, IconButton, Button, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import { hexToRgb } from "./utils/utils";
import SettingsModal from "./SettingsModal";
import { ThemeContext } from "./Theme";
import { useWindowManager } from "./contexts/WindowManagerContext";
import { Rnd } from "react-rnd";

const Taskbar = () => {
  const { windows, activeWindow, focusWindow, openWindow } = useWindowManager();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { currentTheme, taskbarSettings, animationSpeed, themes } =
    useContext(ThemeContext);

  const handleCreateWindow = () => {
    openWindow({
      title: `Window ${Date.now()}`,
      children: (
        <div>
          <h1>New Window</h1>
          <p>This is a new window created programmatically!</p>
        </div>
      ),
      position: {
        x: Math.random() * 200,
        y: Math.random() * 200,
      },
    });
  };

  const getAnimationDuration = (speed) => {
    switch (speed) {
      case "slow":
        return 0.8;
      case "fast":
        return 0.3;
      default:
        return 0.5;
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{
            type: "spring",
            duration: getAnimationDuration(animationSpeed),
            bounce: 0.2,
          }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: `${taskbarSettings.width}%`,
              height: `${taskbarSettings.height}px`,
              backgroundColor: taskbarSettings.transparent
                ? `rgba(${hexToRgb(themes[currentTheme].colors.taskbar)}, 0.85)`
                : themes[currentTheme].colors.taskbar,
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: "8px",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
            }}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                size="small"
                onClick={handleCreateWindow}
                sx={{ color: "white" }}
              >
                <AddIcon />
              </IconButton>
            </motion.div>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                py: 1,
              }}
            >
              {Object.entries(windows).map(([id, window]) => (
                <motion.div
                  key={id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={activeWindow === id ? "contained" : "text"}
                    size="small"
                    onClick={() => focusWindow(id)}
                    sx={{
                      color: "white",
                      minWidth: "160px",
                      justifyContent: "flex-start",
                      backgroundColor:
                        activeWindow === id
                          ? "rgba(255, 255, 255, 0.2)"
                          : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    {window.title}
                  </Button>
                </motion.div>
              ))}
            </Box>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                size="small"
                onClick={() => setSettingsOpen(true)}
                sx={{ color: "white" }}
              >
                <SettingsIcon />
              </IconButton>
            </motion.div>
          </Paper>
        </motion.div>
      </AnimatePresence>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};

export default Taskbar;
