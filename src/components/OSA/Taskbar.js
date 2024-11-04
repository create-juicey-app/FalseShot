import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  Typography,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Minimize as MinimizeIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Image from "next/image";

const Clock = () => {
  const [time, setTime] = React.useState("");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return <Typography variant="body2">{time}</Typography>;
};

const Taskbar = ({
  windows,
  activeWindow,
  setActiveWindow,
  setWindows,
  handleStartClick,
  minimizeAllWindows,
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const theme = useTheme();

  const handleContextMenu = (event, windowId) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      windowId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleMinimizeWindow = (windowId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
    );
    handleCloseContextMenu();
  };

  const handleShowWindow = (windowId) => {
    setActiveWindow(windowId);
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: false } : w))
    );
    handleCloseContextMenu();
  };

  const handleCloseWindow = (windowId) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
    handleCloseContextMenu();
  };

  useEffect(() => {
    // Ensure the active window is updated when windows change
    if (activeWindow && !windows.some((w) => w.id === activeWindow)) {
      setActiveWindow(null);
    }
  }, [windows, activeWindow, setActiveWindow]);

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "#000000",
        top: "auto",
        bottom: 0,
        height: 44,
        borderRadius: 0,
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          minHeight: 44,
          px: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleStartClick}
          size="small"
        >
          <MenuIcon fontSize="medium" />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            overflow: "hidden",
            mx: 1,
          }}
        >
          {windows.map((window) => (
            <Button
              key={window.id}
              size="small"
              onClick={() => {
                setActiveWindow(window.id);
                setWindows((prev) =>
                  prev.map((w) =>
                    w.id === window.id ? { ...w, isMinimized: false } : w
                  )
                );
              }}
              onContextMenu={(event) => handleContextMenu(event, window.id)}
              sx={{
                minWidth: "auto",
                px: 1,
                mx: 0.5,
                height: 32,
                backgroundColor:
                  activeWindow === window.id
                    ? "rgba(255, 255, 255, 0.2)"
                    : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
                borderRadius: 0,
                border: `1px solid ${
                  activeWindow === window.id ? "#ffffff" : "transparent"
                }`,
              }}
            >
              <Image
                src={window.icon}
                alt={window.title}
                width={20}
                height={20}
                style={{ marginRight: 8 }}
              />
              <Typography variant="caption" noWrap>
                {window.title}
              </Typography>
            </Button>
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Clock />
          <IconButton
            edge="end"
            color="inherit"
            onClick={minimizeAllWindows}
            size="medium"
            sx={{ ml: 1 }}
          >
            <Image
              src="/minimizer.png"
              alt="Minimize All"
              width={30}
              height={30}
            />
          </IconButton>
        </Box>
      </Toolbar>
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleMinimizeWindow(contextMenu?.windowId)}>
          <MinimizeIcon sx={{ marginRight: theme.spacing(1) }} />
          Minimize
        </MenuItem>
        <MenuItem onClick={() => handleShowWindow(contextMenu?.windowId)}>
          <OpenInNewIcon sx={{ marginRight: theme.spacing(1) }} />
          Show
        </MenuItem>
        <MenuItem onClick={() => handleCloseWindow(contextMenu?.windowId)}>
          <CloseIcon sx={{ marginRight: theme.spacing(1) }} />
          Close
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Taskbar;
