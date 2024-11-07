// Filename: components/OSB/Window.js
import React, { useState, useEffect, Suspense } from "react";
import {
  Paper,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Maximize as MaximizeIcon,
} from "@mui/icons-material";
import { Rnd } from "react-rnd";
import Image from "next/image";

const Window = ({
  title,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized,
  isMinimized,
  canMaximize,
  component: Component,
  content,
  componentProps,
  icon,
  width,
  height,
  x,
  y,
  zIndex, // Added zIndex prop
}) => {
  const minWidth = 200;
  const minHeight = 150;

  const [windowSize, setWindowSize] = useState({
    width: width || 400,
    height: height || 300,
  });
  const [position, setPosition] = useState({ x: x || 100, y: y || 100 });
  const [LazyComponent, setLazyComponent] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isSpawning, setIsSpawning] = useState(true);
  const [isMinimizing, setIsMinimizing] = useState(false);

  useEffect(() => {
    const updateWindowSize = () => {
      if (isMaximized) {
        const topBarHeight = 40;
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight - topBarHeight,
        });
        setPosition({ x: 0, y: 0 });
      } else {
        setWindowSize({
          width: width || 400,
          height: height || 300,
        });
      }
    };
    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);
    return () => window.removeEventListener("resize", updateWindowSize);
  }, [isMaximized, width, height]);

  useEffect(() => {
    if (Component) {
      if (
        typeof Component === "function" ||
        (typeof Component === "object" &&
          Component.$$typeof === Symbol.for("react.lazy"))
      ) {
        setLazyComponent(() => Component);
      } else {
        setLazyComponent(() => () => Component);
      }
    }
  }, [Component]);

  useEffect(() => {
    if (isSpawning) {
      setTimeout(() => setIsSpawning(false), 300);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleMinimize = () => {
    setIsMinimizing(true);
    setTimeout(() => {
      onMinimize();
      setIsMinimizing(false);
    }, 300);
  };

  if (isMinimized) {
    return null;
  }

  return (
    <Rnd
      position={position}
      size={windowSize}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResize={(e, direction, ref, delta, position) => {
        setWindowSize({
          width: Math.max(ref.offsetWidth, minWidth),
          height: Math.max(ref.offsetHeight, minHeight),
        });
        setPosition(position);
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      dragHandleClassName="window-handle"
      bounds="window" // Changed from "parent" to "window"
      style={{ zIndex }} // Apply zIndex to Rnd component
    >
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.paper",
          borderRadius: 0,
          transition: "all 0.3s ease-in-out",
          transform: isSpawning
            ? "scale(0.9)"
            : isClosing
            ? "scale(0.9)"
            : isMinimizing
            ? "scale(0.9) translateY(100%)"
            : "scale(1)",
          opacity: isSpawning ? 0 : isClosing ? 0 : 1,
        }}
      >
        <AppBar
          position="static"
          color="primary"
          sx={{
            cursor: isMaximized ? "default" : "move",
            borderRadius: 0,
            userSelect: "none",
          }}
        >
          <Toolbar
            disableGutters={true}
            variant="dense"
            className="window-handle"
            sx={{ minHeight: 24, padding: "0 -8px" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
                paddingLeft: 1,
              }}
            >
              {icon && (
                <Image
                  src={icon}
                  alt={title}
                  width={32}
                  height={32}
                  draggable={false}
                />
              )}
              {icon && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ marginLeft: 1, marginRight: 1 }}
                />
              )}
              <Typography sx={{ paddingLeft: 1 }} variant="body2">
                {title}
              </Typography>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMinimize}
              size="small"
              sx={{ marginRight: 0.3 }}
            >
              <Image
                src="/Minimize.png"
                alt="Minimize the window"
                width={24}
                height={24}
              />
            </IconButton>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onMaximize}
              size="small"
              sx={{ marginRight: 0.3 }}
            >
              <Image
                src="/Maximize.png"
                alt="Maximize the window"
                width={24}
                height={24}
              />
            </IconButton>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleClose}
              size="small"
              sx={{ marginRight: 1 }}
            >
              <Image
                src="/Close.png"
                alt="Close the window"
                width={24}
                height={24}
              />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, overflow: "auto", p: 1 }}>
          {LazyComponent ? (
            <Suspense
              fallback={
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <CircularProgress />
                </Box>
              }
            >
              <LazyComponent {...componentProps} />
            </Suspense>
          ) : content ? (
            <Typography>{content}</Typography>
          ) : null}
        </Box>
      </Paper>
    </Rnd>
  );
};

export default Window;