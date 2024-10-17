import React, { useState, useEffect, useCallback } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Settings as SettingsIcon } from "@mui/icons-material";
import Image from "next/image";

const AnimatedMenuItem = styled(MenuItem)(({ theme }) => ({
  transition: theme.transitions.create(["opacity", "transform"], {
    duration: theme.transitions.duration.shorter,
  }),
  opacity: 0,
  transform: "translateX(-20px)",
  "&.MuiMenuItem-animatedEnter": {
    opacity: 1,
    transform: "translateX(0)",
  },
}));

const StartMenu = ({ anchorEl, isOpen, onClose, apps, openWindow, openSettings }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [animationClass, setAnimationClass] = useState("");

  const handleKeyDown = useCallback((event) => {
    if (!isOpen) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prevIndex) => 
          (prevIndex + 1) % (apps.length + 1)
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prevIndex) => 
          (prevIndex - 1 + apps.length + 1) % (apps.length + 1)
        );
        break;
      case "Enter":
        event.preventDefault();
        if (selectedIndex === apps.length) {
          openSettings();
        } else if (selectedIndex >= 0) {
          openWindow(apps[selectedIndex]);
        }
        onClose();
        break;
      case "Escape":
        event.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, apps, selectedIndex, openWindow, openSettings, onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(-1);
      setAnimationClass("MuiMenuItem-animatedEnter");
    } else {
      setAnimationClass("");
    }
  }, [isOpen]);

  return (
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {apps.map((app, index) => (
          <AnimatedMenuItem
            key={index}
            onClick={() => {
              openWindow(app);
              onClose();
            }}
            selected={index === selectedIndex}
            className={animationClass}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <ListItemIcon>
              <Image src={app.icon} alt={app.label} width={32} height={32} />
            </ListItemIcon>
            <ListItemText primary={app.label} />
          </AnimatedMenuItem>
        ))}
        <Divider />
        <AnimatedMenuItem 
          onClick={openSettings}
          selected={selectedIndex === apps.length}
          className={animationClass}
          style={{ transitionDelay: `${apps.length * 50}ms` }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </AnimatedMenuItem>
      </Menu>

  );
};

export default StartMenu;