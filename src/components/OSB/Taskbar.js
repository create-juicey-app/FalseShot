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
import StartMenu from './StartMenu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OpenIcon from '@mui/icons-material/Launch';
import MaximizeIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded';
const Taskbar = () => {
  const { windows, activeWindow, focusWindow, openWindow, updateWindow, closeWindow } = useWindowManager();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { currentTheme, taskbarSettings, animationSpeed, themes } =
    useContext(ThemeContext);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextMenuWindowId, setContextMenuWindowId] = useState(null);

  const handleStartMenuToggle = () => {
    setStartMenuOpen((prev) => !prev);
  };

  const handleContextMenu = (event, windowId) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setContextMenuWindowId(windowId);
  };

  const handleCloseContextMenu = () => {
    setAnchorEl(null);
    setContextMenuWindowId(null);
  };

  const handleContextMenuAction = (action) => {
    if (contextMenuWindowId) {
      const window = windows[contextMenuWindowId];
      if (action === 'open') {
        if (window.isMinimized) {
          updateWindow(contextMenuWindowId, { isMinimized: false });
        }
        focusWindow(contextMenuWindowId);
      } else if (action === 'maximize') {
        updateWindow(contextMenuWindowId, { isMaximized: true });
      } else if (action === 'minimize') {
        updateWindow(contextMenuWindowId, { isMaximized: false });
      } else if (action === 'close') {
        closeWindow(contextMenuWindowId);
      }
    }
    handleCloseContextMenu();
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
                onClick={handleStartMenuToggle}
                sx={{ color: "white" }}
              >
                <WidgetsRoundedIcon/>
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
                    onClick={() => {
                      if (window.isMinimized) {
                        updateWindow(id, { isMinimized: false });
                      }
                      focusWindow(id);
                    }}
                    onContextMenu={(e) => handleContextMenu(e, id)}
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
                    <img
                      src={window.icon || "/oneshot.png"}
                      alt=""
                      style={{ width: 16, height: 16, marginRight: 8 }}
                    />
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

      {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseContextMenu}
      >
        <MenuItem onClick={() => handleContextMenuAction('open')}>
          <OpenIcon fontSize="small" /> Open
        </MenuItem>
        {contextMenuWindowId && !windows[contextMenuWindowId].isMaximized ? (
          <MenuItem onClick={() => handleContextMenuAction('maximize')}>
            <MaximizeIcon fontSize="small" /> Maximize
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleContextMenuAction('minimize')}>
            <MinimizeIcon fontSize="small" /> Minimize
          </MenuItem>
        )}
        <MenuItem onClick={() => handleContextMenuAction('close')}>
          <CloseIcon fontSize="small" /> Close
        </MenuItem>
      </Menu>
    </>
  );
};

export default Taskbar;
