// Filename: components/OSB/IconGrid.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { Rnd } from "react-rnd";
import { apps } from "@/config/apps";

const GRID_SIZE = 80;
const ICON_WIDTH = 60;
const ICON_HEIGHT = 58;

const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const validatePosition = (x, y, id, layout) => {
  const maxX =
    Math.floor((window.innerWidth - ICON_WIDTH) / GRID_SIZE) * GRID_SIZE;
  const maxY =
    Math.floor((window.innerHeight - ICON_HEIGHT) / GRID_SIZE) * GRID_SIZE;
  const validX = Math.max(0, Math.min(snapToGrid(x), maxX));
  const validY = Math.max(0, Math.min(snapToGrid(y), maxY));

  const isOccupied = layout.some(
    (item) => item.id !== id && item.x === validX && item.y === validY
  );

  if (isOccupied) {
    return null;
  } else {
    return { x: validX, y: validY };
  }
};

const IconGrid = ({ onLaunchApp }) => {
  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem("iconLayout");
      if (saved) {
        const parsedLayout = JSON.parse(saved);
        return parsedLayout.map((item) => ({
          ...item,
          x: Math.max(
            0,
            Math.min(snapToGrid(item.x), window.innerWidth - ICON_WIDTH)
          ),
          y: Math.max(
            0,
            Math.min(snapToGrid(item.y), window.innerHeight - ICON_HEIGHT)
          ),
        }));
      }
    } catch (e) {
      console.error("Failed to load layout:", e);
    }
    return apps.map((app, i) => ({
      id: app.id,
      x: (i % 4) * GRID_SIZE,
      y: Math.floor(i / 4) * GRID_SIZE,
    }));
  });

  useEffect(() => {
    try {
      localStorage.setItem("iconLayout", JSON.stringify(layout));
    } catch (e) {
      console.error("Failed to save layout:", e);
    }
  }, [layout]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        padding: 2,
      }}
    >
      {apps.map((app) => {
        const position = layout.find((item) => item.id === app.id) || {
          x: 0,
          y: 0,
        };
        return (
          <IconItem
            key={app.id}
            app={app}
            position={position}
            layout={layout}
            setLayout={setLayout}
            onLaunchApp={onLaunchApp}
          />
        );
      })}
    </Box>
  );
};

const IconItem = React.memo(
  ({ app, position, layout, setLayout, onLaunchApp }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleDragStop = (e, d) => {
      const validPos = validatePosition(d.x, d.y, app.id, layout);
      if (validPos) {
        setLayout((prevLayout) =>
          prevLayout.map((item) =>
            item.id === app.id ? { ...item, ...validPos } : item
          )
        );
      } else {
        // Revert to previous position
        setLayout((prevLayout) => prevLayout);
      }
    };

    return (
      <Rnd
        position={{ x: position.x, y: position.y }}
        size={{ width: ICON_WIDTH, height: ICON_HEIGHT }}
        onDragStop={handleDragStop}
        bounds="parent"
        enableResizing={false}
        dragGrid={[GRID_SIZE, GRID_SIZE]}
        style={{
          border: "2px solid #61dafb",
          borderRadius: "8px",
          boxShadow: isHovered
            ? "0 4px 8px rgba(0, 0, 0, 0.4)"
            : "0 2px 4px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.2s",
          zIndex: isHovered ? 2 : 1,
          transform: isHovered ? "scale(1.05)" : "scale(1)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Tooltip
          title={
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={app.previewImage}
                alt={app.label}
                style={{ width: 200, marginBottom: 8 }}
              />
              <Typography variant="body2" sx={{ color: "white" }}>
                {app.description}
              </Typography>
            </Box>
          }
          arrow
          placement="top"
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
            onDoubleClick={() => onLaunchApp(app)}
          >
            <img
              src={app.icon}
              alt={app.label}
              draggable={false}
              style={{ width: 48, height: 48, pointerEvents: "none" }}
            />

          </Box>
        </Tooltip>
      </Rnd>
    );
  }
);

export default IconGrid;