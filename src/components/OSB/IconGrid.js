// Filename: components/OSB/IconGrid.js
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Rnd } from "react-rnd";
import { apps } from "@/config/apps";

const GRID_SIZE = 80; // Define grid size for snapping

const IconGrid = ({ onLaunchApp }) => {
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("iconLayout");
    return saved ? JSON.parse(saved) : generateDefaultLayout();
  });

  function generateDefaultLayout() {
    return apps.map((app, i) => ({
      id: app.id,
      x: (i % 4) * GRID_SIZE,
      y: Math.floor(i / 4) * GRID_SIZE,
    }));
  }

  useEffect(() => {
    localStorage.setItem("iconLayout", JSON.stringify(layout));
  }, [layout]);

  const updatePosition = (id, x, y) => {
    setLayout((prevLayout) =>
      prevLayout.map((item) => (item.id === id ? { ...item, x, y } : item))
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        // backgroundColor: "#282c34",
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
          <Rnd
            key={app.id}
            position={{ x: position.x, y: position.y }}
            size={{ width: 60, height: 70 }}
            grid={[GRID_SIZE, GRID_SIZE]}
            bounds="parent"
            enableResizing={false}
            onDragStop={(e, data) => {
              updatePosition(app.id, data.x, data.y);
            }}
            style={{
              border: "2px solid #61dafb",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "transform 0.2s",
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.zIndex = 2;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.zIndex = 1;
            }}
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
              <Typography
                variant="caption"
                sx={{
                  color: "white",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                  textAlign: "center",
                  mt: 1,
                  userSelect: "none",
                }}
              >
                {app.label}
              </Typography>
            </Box>
          </Rnd>
        );
      })}
    </Box>
  );
};

export default IconGrid;