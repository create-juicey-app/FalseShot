import React, { useState, createContext, useContext, useEffect } from "react";
import { Box } from "@mui/material";
import { ThemeContext } from "./Theme";
import { createRGBA, createPatterns, getBackgroundSize } from './utils/patterns';

const STORAGE_KEYS = {
  MODE: 'osb-bg-mode',
  PATTERN: 'osb-pattern',
  IMAGE: 'osb-bg-image',
  COLOR: 'osb-bg-color'
};

// Updated load setting function to handle different data types
const loadSetting = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    // Handle non-JSON string values
    if (key === STORAGE_KEYS.MODE || key === STORAGE_KEYS.PATTERN) {
      return item;
    }
    
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error loading setting for ${key}:`, error);
    return defaultValue;
  }
};

// Updated save setting function to handle different data types
const saveSetting = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    // Handle non-JSON string values
    if (key === STORAGE_KEYS.MODE || key === STORAGE_KEYS.PATTERN) {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.warn(`Error saving setting for ${key}:`, error);
  }
};

export const BackgroundContext = createContext({
  mode: "pattern", // pattern, image, or color
  setMode: () => {},
  currentPattern: "dots",
  setCurrentPattern: () => {},
  backgroundImage: null,
  setBackgroundImage: () => {},
  backgroundColor: "#000000",
  setBackgroundColor: () => {},
  patterns: {},
});

export const BackgroundProvider = ({ children }) => {
  const [mode, setMode] = useState(() => loadSetting(STORAGE_KEYS.MODE, 'pattern'));
  const [currentPattern, setCurrentPattern] = useState(() => loadSetting(STORAGE_KEYS.PATTERN, 'dots'));
  const [backgroundImage, setBackgroundImage] = useState(() => loadSetting(STORAGE_KEYS.IMAGE, null));
  const [backgroundColor, setBackgroundColor] = useState(() => loadSetting(STORAGE_KEYS.COLOR, '#000000'));

  // Save settings when they change
  useEffect(() => {
    saveSetting(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  useEffect(() => {
    saveSetting(STORAGE_KEYS.PATTERN, currentPattern);
  }, [currentPattern]);

  useEffect(() => {
    saveSetting(STORAGE_KEYS.IMAGE, backgroundImage);
  }, [backgroundImage]);

  useEffect(() => {
    saveSetting(STORAGE_KEYS.COLOR, backgroundColor);
  }, [backgroundColor]);

  const value = {
    mode,
    setMode,
    currentPattern,
    setCurrentPattern,
    backgroundImage,
    setBackgroundImage,
    backgroundColor,
    setBackgroundColor
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const Background = () => {
  const { mode, currentPattern, backgroundImage, backgroundColor } = useContext(BackgroundContext);
  const { currentTheme, isDarkMode, themes } = useContext(ThemeContext);

  const activeTheme = themes[currentTheme];
  const themeColor = activeTheme.colors.primary;
  const patterns = createPatterns(themeColor, isDarkMode);

  const renderBackground = () => {
    switch (mode) {
      case 'image':
        return {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'color':
        return {
          backgroundColor: backgroundColor,
        };
      case 'pattern':
      default:
        const patternStyle = patterns[currentPattern]?.pattern;
        const gradientColor = isDarkMode
          ? createRGBA(themeColor, 0.05)
          : createRGBA(themeColor, 0.03);
        return {
          backgroundImage: `${patternStyle}, linear-gradient(135deg, transparent 0%, ${gradientColor} 100%)`,
          backgroundSize: getBackgroundSize(currentPattern),
          backgroundPosition: 'center center',
          backgroundRepeat: 'repeat, no-repeat',
        };
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 1,
        zIndex: 0,
        transition: "all 0.3s ease",
        ...renderBackground(),
      }}
    />
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  const { currentTheme, isDarkMode, themes } = useContext(ThemeContext);
  const patterns = createPatterns(
    themes[currentTheme].colors.primary,
    isDarkMode
  );

  // Helper function to handle image upload
  const handleImageUpload = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        context.setBackgroundImage(reader.result);
        context.setMode('image');
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    ...context,
    patterns,
    handleImageUpload
  };
};

export default Background;
