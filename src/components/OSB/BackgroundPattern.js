import React, { useState, createContext, useContext, useEffect } from "react";
import { Box } from "@mui/material";
import { ThemeContext } from "./Theme";
import { createRGBA, createPatterns, getBackgroundSize } from './utils/patterns';

const STORAGE_KEY = 'osb-pattern';

const loadPattern = () => {
  if (typeof window === 'undefined') return 'dots';
  return localStorage.getItem(STORAGE_KEY) || 'dots';
};

const savePattern = (pattern) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, pattern);
};

export const PatternContext = createContext({
  currentPattern: "dots",
  setCurrentPattern: () => {},
  patterns: {},
});

export const PatternProvider = ({ children }) => {
  const [currentPattern, setCurrentPattern] = useState(() => loadPattern());

  useEffect(() => {
    savePattern(currentPattern);
  }, [currentPattern]);

  return (
    <PatternContext.Provider value={{ currentPattern, setCurrentPattern }}>
      {children}
    </PatternContext.Provider>
  );
};

export const BackgroundPattern = () => {
  const { currentPattern } = useContext(PatternContext);
  const { currentTheme, isDarkMode, themes } = useContext(ThemeContext);

  const activeTheme = themes[currentTheme];
  const themeColor = activeTheme.colors.primary;
  const patterns = createPatterns(themeColor, isDarkMode);

  if (!patterns || !patterns[currentPattern]) {
    console.warn(
      "Pattern context not properly initialized or invalid pattern selected"
    );
    return null;
  }

  const patternStyle = patterns[currentPattern].pattern;
  const gradientColor = isDarkMode
    ? createRGBA(themeColor, 0.05)
    : createRGBA(themeColor, 0.03);

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
        backgroundImage: currentPattern === 'none' 
          ? `linear-gradient(135deg, transparent 0%, ${gradientColor} 100%)`
          : `${patternStyle}, linear-gradient(135deg, transparent 0%, ${gradientColor} 100%)`,
        backgroundSize: `${getBackgroundSize(currentPattern)}, 100% 100%`,
        backgroundPosition: "0 0, center center",
        backgroundRepeat: "repeat, no-repeat",
        opacity: 1,
        zIndex: 0,
        transition: "all 0.3s ease",
      }}
    />
  );
};

export const usePattern = () => {
  const { currentPattern, setCurrentPattern } = useContext(PatternContext);
  const { currentTheme, isDarkMode, themes } = useContext(ThemeContext);
  const patterns = createPatterns(
    themes[currentTheme].colors.primary,
    isDarkMode
  );

  return { currentPattern, setCurrentPattern, patterns };
};

export default BackgroundPattern;
