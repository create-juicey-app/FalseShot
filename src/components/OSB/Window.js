import React, { useEffect, Suspense, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import {
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Box,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Maximize as MaximizeIcon,
  Restore as RestoreIcon,
} from "@mui/icons-material";
import { useWindowManager } from "./contexts/WindowManagerContext";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

const Window = ({
  id,
  title,
  content,
  position = { x: 100, y: 100 },
  size = { width: 400, height: 300 },
  zIndex = 1000,
  isMaximized = false,
  isMinimized = false,
  isShaking = false,
  aggressiveness = 1, // Add aggressiveness prop with default value
}) => {
  const theme = useTheme();
  const { updateWindow, closeWindow, focusWindow } = useWindowManager();
  const rndRef = useRef();

  // Add state to store previous size and position
  const [prevSize, setPrevSize] = useState(size);
  const [prevPosition, setPrevPosition] = useState(position);
  const [shakeAnimation, setShakeAnimation] = useState({});
  const [shakeTransition, setShakeTransition] = useState({});

  useEffect(() => {
    return () => {
      if (content?.props?.onUnmount) {
        content.props.onUnmount();
      }
    };
  }, [content]);

  useEffect(() => {
    if (isShaking) {
      if (aggressiveness >= 3 && aggressiveness <= 4) {
        // Generate random positions
        const shakeKeyframesX = [];
        const shakeKeyframesY = [];
        const amplitude = aggressiveness === 3 ? 30 : 50;
        const steps = 10;
        for (let i = 0; i <= steps; i++) {
          shakeKeyframesX.push((Math.random() - 0.5) * amplitude * 2);
          shakeKeyframesY.push((Math.random() - 0.5) * amplitude * 2);
        }
        // Set the animation
        setShakeAnimation({
          x: shakeKeyframesX,
          y: shakeKeyframesY,
        });
        setShakeTransition({
          duration: 0.6,
          ease: "easeInOut",
        });
      } else if (aggressiveness <= 2) {
        // Levels 1 and 2
        setShakeAnimation(getShakeAnimation(aggressiveness));
        setShakeTransition(getShakeTransition(aggressiveness));
      }
      // Level 5 is handled in Desktop.js
    }
  }, [isShaking, aggressiveness]);

  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => {
        if (aggressiveness >= 3 && aggressiveness <= 4) {
          // Update window position to last shake position
          const lastX =
            shakeAnimation.x && shakeAnimation.x.length > 0
              ? shakeAnimation.x[shakeAnimation.x.length - 1]
              : 0;
          const lastY =
            shakeAnimation.y && shakeAnimation.y.length > 0
              ? shakeAnimation.y[shakeAnimation.y.length - 1]
              : 0;
          
          updateWindow(id, {
            isShaking: false,
            aggressiveness: 1,
            position: {
              x: position.x + lastX,
              y: position.y + lastY,
            },
          });
        } else {
          // Levels 1 and 2
          updateWindow(id, { isShaking: false, aggressiveness: 1 });
        }
      }, shakeTransition.duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [isShaking, aggressiveness, id, updateWindow, position, shakeAnimation, shakeTransition]);

  // Modify getShakeAnimation to exclude levels 3 and above
  const getShakeAnimation = (level) => {
    switch (level) {
      case 1:
        return { x: [-5, 5, -5, 5, 0] };
      case 2:
        return { x: [-10, 10, -10, 10, -5, 5, 0] };
      default:
        return {};
    }
  };

  const getShakeTransition = (level) => {
    return { duration: 0.5 };
  };

  const handleMaximize = () => {
    if (!isMaximized) {
      // Store current size and position before maximizing
      setPrevSize(size);
      setPrevPosition(position);
      updateWindow(id, { 
        isMaximized: true, 
        isMinimized: false, 
        size: { width: window.innerWidth, height: window.innerHeight }, 
        position: { x: 0, y: 0 } 
      });
    } else {
      // Restore previous size and position when unmaximizing
      updateWindow(id, { 
        isMaximized: false, 
        size: prevSize, 
        position: prevPosition 
      });
    }
  };

  // Adjust currentSize and currentPosition to always use size and position
  const currentSize = size;
  const currentPosition = position;

  return (
    <Rnd
      ref={rndRef}
      position={currentPosition}
      size={currentSize}
      minWidth={200}
      minHeight={150}
      bounds="parent"
      style={{ zIndex, display: isMinimized ? 'none' : 'block' }}
      enableResizing={!isMaximized && {
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      onDragStop={(e, data) => {
        updateWindow(id, { position: { x: data.x, y: data.y } });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWindow(id, {
          size: { width: ref.offsetWidth, height: ref.offsetHeight },
          position,
        });
      }}
      onMouseDown={() => focusWindow(id)}
      disableDragging={isMaximized}
      dragHandleClassName="window-header"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={
          isShaking
            ? {
                opacity: 1,
                scale: 1,
                ...shakeAnimation,
              }
            : { opacity: 1, scale: 1 }
        }
        transition={
          isShaking ? shakeTransition : { duration: 0.2, ease: "easeOut" }
        }
        style={{ width: "100%", height: "100%" }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            className="window-header"
            sx={{
              height: 32,
              display: "flex",
              alignItems: "center",
              px: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.background.default 
                : theme.palette.primary.main,
              color: theme.palette.mode === 'dark'
                ? theme.palette.text.primary
                : theme.palette.primary.contrastText,
              userSelect: "none",
            }}
          >
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              flex: 1,
              minWidth: 0,
            }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  ml: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {title}
              </Typography>
            </Box>
            <Box sx={{ 
              display: "flex",
              gap: "2px"
            }}>
              <IconButton
                size="small"
                onClick={() => updateWindow(id, { isMinimized: true })}
                sx={{
                  padding: "2px",
                  borderRadius: 0.5,
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? theme.palette.action.hover
                      : theme.palette.primary.dark,
                  }
                }}
              >
                <MinimizeIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleMaximize}
                sx={{
                  padding: "2px",
                  borderRadius: 0.5,
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? theme.palette.action.hover
                      : theme.palette.primary.dark,
                  }
                }}
              >
                {isMaximized ? 
                  <RestoreIcon sx={{ fontSize: 16 }} /> : 
                  <MaximizeIcon sx={{ fontSize: 16 }} />
                }
              </IconButton>
              <IconButton
                size="small"
                onClick={() => closeWindow(id)}
                sx={{
                  padding: "2px",
                  borderRadius: 0.5,
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText
                  }
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ 
            flex: 1, 
            overflow: "auto", 
            backgroundColor: theme.palette.background.default,
            p: 1
          }}>
            <Suspense
              fallback={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              }
            >
              {content}
            </Suspense>
          </Box>
        </Paper>
      </motion.div>
    </Rnd>
  );
};

export default Window;