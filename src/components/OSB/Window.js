import React, { useEffect, Suspense } from "react";
import { Rnd } from "react-rnd";
import { Paper, IconButton, Typography, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import MaximizeIcon from "@mui/icons-material/Maximize";
import { useWindowManager } from "./contexts/WindowManagerContext";

const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }}
  >
    <CircularProgress />
  </div>
);

const Window = ({
  id,
  title,
  content,
  position = { x: 100, y: 100 },
  size = { width: 400, height: 300 },
  zIndex = 1000,
  isMaximized = false,
  isMinimized = false,
  beforeMaximizeState = null,
}) => {
  const { updateWindow, closeWindow, focusWindow } = useWindowManager();
  const rndRef = React.useRef();

  useEffect(() => {
    return () => {
      // Cleanup when window is unmounted
      if (content?.props?.onUnmount) {
        content.props.onUnmount();
      }
    };
  }, [content]);

  const handleMaximize = () => {
    if (!isMaximized) {
      const currentState = {
        position,
        size,
      };
      updateWindow(id, {
        isMaximized: true,
        beforeMaximizeState: currentState,
        position: { x: 0, y: 0 },
        size: { width: "100%", height: "100%" },
      });
    } else {
      updateWindow(id, {
        isMaximized: false,
        position: beforeMaximizeState.position,
        size: beforeMaximizeState.size,
        beforeMaximizeState: null,
      });
    }
  };

  if (isMinimized) {
    return null;
  }

  return (
    <Rnd
      ref={rndRef}
      position={position}
      size={size}
      minWidth={200}
      minHeight={150}
      bounds="parent"
      style={{
        display: "flex",
        flexDirection: "column",
        zIndex,
      }}
      onDragStop={(e, data) => {
        updateWindow(id, {
          position: { x: data.x, y: data.y },
        });
      }}
      onResize={(e, direction, ref, delta, position) => {
        updateWindow(id, {
          size: {
            width: ref.style.width,
            height: ref.style.height,
          },
          position,
        });
      }}
      onMouseDown={() => focusWindow(id)}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      dragHandleClassName="window-header"
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          className="window-header"
          style={{
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#1976d2",
            color: "white",
          }}
        >
          <Typography variant="subtitle1">{title}</Typography>
          <div>
            <IconButton
              size="small"
              onClick={() => updateWindow(id, { isMinimized: true })}
              sx={{ color: "white" }}
            >
              <MinimizeIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleMaximize}
              sx={{ color: "white" }}
            >
              <MaximizeIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => closeWindow(id)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", backgroundColor: "white" }}>
          <Suspense fallback={<LoadingFallback />}>{content}</Suspense>
        </div>
      </Paper>
    </Rnd>
  );
};

export default Window;
