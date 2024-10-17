import React from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

const DesktopIcon = ({ icon, label, onClick }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
      width: 64,
      height: 64,
      m: 1,
      p: 2,
      bottom:0,
      userSelect: "none",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    }}
    onClick={onClick}
  >
    <Image src={icon} alt={label} width={45} height={45} draggable={false}/>
    <Typography variant="caption" align="center" sx={{ mt: 0.5 }}>
      {label}
    </Typography>
  </Box>
);

const DesktopIcons = ({ apps, openWindow }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", p: 1 }}>
    {apps.map((app, index) => (
      <DesktopIcon
        key={index}
        icon={app.icon}
        label={app.label}
        onClick={() => openWindow(app)}
      />
    ))}
  </Box>
);

export default DesktopIcons;