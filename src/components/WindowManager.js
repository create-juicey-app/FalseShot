// Filename: Taskbar.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Minimize as MinimizeIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Image from "next/image";

// Clock Component
const Clock = React.memo(() => {
  const [time, setTime] = useState("");

  const updateTime = useCallback(() => {
    const now = new Date();
    setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  useEffect(() => {
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [updateTime]);

  return <Typography variant="body2">{time}</Typography>;
});

// Taskbar Component
const Taskbar = ({ handleStartClick, windowManagerRef }) => {
  const [windows, setWindows] = useState([]);
  const [activeWindow, setActiveWindow] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const updateWindows = () => {
      if (windowManagerRef.current) {
        setWindows(windowManagerRef.current.getWindows());
        setActiveWindow(windowManagerRef.current.getActiveWindow());
      }
    };

    // Initial update
    updateWindows();

    // Set up an interval to check for updates
    const intervalId = setInterval(updateWindows, 100);

    return () => clearInterval(intervalId);
  }, [windowManagerRef]);

  const handleContextMenu = useCallback((event, windowId) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      windowId,
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleMinimizeWindow = useCallback(
    (windowId) => {
      if (windowManagerRef.current) {
        windowManagerRef.current.minimizeWindow(windowId);
      }
      handleCloseContextMenu();
    },
    [windowManagerRef, handleCloseContextMenu]
  );

  const handleShowWindow = useCallback(
    (windowId) => {
      if (windowManagerRef.current) {
        windowManagerRef.current.setActiveWindow(windowId);
      }
      handleCloseContextMenu();
    },
    [windowManagerRef, handleCloseContextMenu]
  );

  const handleCloseWindow = useCallback(
    (windowId) => {
      if (windowManagerRef.current) {
        windowManagerRef.current.closeWindow(windowId);
      }
      handleCloseContextMenu();
    },
    [windowManagerRef, handleCloseContextMenu]
  );

  const handleWindowButtonClick = useCallback(
    (windowId) => {
      if (windowManagerRef.current) {
        windowManagerRef.current.setActiveWindow(windowId);
      }
    },
    [windowManagerRef]
  );

  const handleKeyDown = useCallback(
    (event, windowId) => {
      if (event.key === "Enter" || event.key === " ") {
        handleWindowButtonClick(windowId);
      }
    },
    [handleWindowButtonClick]
  );

  const memoizedWindowButtons = useMemo(
    () =>
      windows.map((window) => (
        <Button
          key={window.id}
          size="small"
          onClick={() => handleWindowButtonClick(window.id)}
          onContextMenu={(event) => handleContextMenu(event, window.id)}
          onKeyDown={(event) => handleKeyDown(event, window.id)}
          tabIndex={0}
          aria-label={`${window.title} ${
            window.isMinimized ? "minimized" : ""
          }`}
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
      )),
    [
      windows,
      activeWindow,
      handleWindowButtonClick,
      handleContextMenu,
      handleKeyDown,
    ]
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        top: "auto",
        bottom: 0,
        height: 44,
        borderRadius: 0,
        bgcolor: "#000000",
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
          aria-label="Open start menu"
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
          {memoizedWindowButtons}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Clock />
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => windowManagerRef.current?.minimizeAllWindows()}
            size="medium"
            sx={{ ml: 1 }}
            aria-label="Minimize all windows"
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
        <MenuItem
          onClick={() =>
            contextMenu && handleMinimizeWindow(contextMenu.windowId)
          }
        >
          <MinimizeIcon sx={{ marginRight: 1 }} />
          Minimize
        </MenuItem>
        <MenuItem
          onClick={() => contextMenu && handleShowWindow(contextMenu.windowId)}
        >
          <OpenInNewIcon sx={{ marginRight: 1 }} />
          Show
        </MenuItem>
        <MenuItem
          onClick={() => contextMenu && handleCloseWindow(contextMenu.windowId)}
        >
          <CloseIcon sx={{ marginRight: 1 }} />
          Close
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

Taskbar.propTypes = {
  handleStartClick: PropTypes.func.isRequired,
  windowManagerRef: PropTypes.shape({
    current: PropTypes.shape({
      getWindows: PropTypes.func.isRequired,
      getActiveWindow: PropTypes.func.isRequired,
      setActiveWindow: PropTypes.func.isRequired,
      minimizeWindow: PropTypes.func.isRequired,
      closeWindow: PropTypes.func.isRequired,
      minimizeAllWindows: PropTypes.func.isRequired,
    }),
  }).isRequired,
};

export default React.memo(Taskbar);
