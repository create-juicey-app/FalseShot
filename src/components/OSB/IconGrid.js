// Filename: components/OSB/IconGrid.js
import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { Rnd } from "react-rnd";
import { apps } from "@/config/apps";
import { ThemeContext } from "./Theme";
import { isDebugModeEnabled } from './Theme';
import Image from "next/image";

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

const generateInitialLayout = (apps) => {
  const maxIconsPerRow = Math.floor(window.innerWidth / GRID_SIZE);
  return apps.map((app, i) => ({
    id: app.id,
    x: (i % maxIconsPerRow) * GRID_SIZE,
    y: Math.floor(i / maxIconsPerRow) * GRID_SIZE,
  }));
};

const IconGrid = ({ onLaunchApp }) => {
  // Replace context usage with direct localStorage check
  const [debugMode, setDebugMode] = useState(() => isDebugModeEnabled());
  
  // Update debugMode when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setDebugMode(isDebugModeEnabled());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem("iconLayout");
      if (saved) {
        const parsedLayout = JSON.parse(saved);
        // Validate saved positions are still valid
        return parsedLayout.map((item) => ({
          ...item,
          x: Math.max(0, Math.min(snapToGrid(item.x), window.innerWidth - ICON_WIDTH)),
          y: Math.max(0, Math.min(snapToGrid(item.y), window.innerHeight - ICON_HEIGHT)),
        }));
      }
    } catch (e) {
      console.error("Failed to load layout:", e);
    }
    // Filter apps based on debug mode before generating initial layout
    const visibleApps = apps.filter(app => !app.debug || debugMode);
    return generateInitialLayout(visibleApps);
  });

  // Filter apps based on debug mode
  const visibleApps = apps.filter(app => !app.debug || debugMode);

  // Add effect to handle layout updates when debug mode changes
  useEffect(() => {
    const currentAppIds = visibleApps.map(app => app.id);
    const filteredLayout = layout.filter(item => currentAppIds.includes(item.id));
    
    // Add new apps to layout if they don't exist
    const newApps = visibleApps.filter(app => 
      !layout.some(item => item.id === app.id)
    );
    
    if (newApps.length > 0) {
      const existingPositions = filteredLayout.map(item => ({ x: item.x, y: item.y }));
      const newLayout = [...filteredLayout];
      
      newApps.forEach(app => {
        // Find first available position
        let x = 0, y = 0;
        while (existingPositions.some(pos => pos.x === x && pos.y === y)) {
          x += GRID_SIZE;
          if (x >= window.innerWidth - ICON_WIDTH) {
            x = 0;
            y += GRID_SIZE;
          }
        }
        newLayout.push({ id: app.id, x, y });
        existingPositions.push({ x, y });
      });
      
      setLayout(newLayout);
    } else if (filteredLayout.length !== layout.length) {
      setLayout(filteredLayout);
    }
  }, [debugMode, visibleApps]);

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
      {visibleApps.map((app) => {
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
              <Typography variant="h6" sx={{ color: "white" }}>
                {app.label}
              </Typography>
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