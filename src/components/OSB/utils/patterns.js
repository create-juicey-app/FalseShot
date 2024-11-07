export const createRGBA = (hex, opacity = 0.1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const createPatterns = (themeColor, isDark) => {
  const baseColor = isDark
    ? "rgba(255, 255, 255, 0.07)"
    : createRGBA(themeColor, 0.15);

  return {
    none: {
      name: "None",
      pattern: "none",
    },
    dots: {
      name: "Dots",
      pattern: `radial-gradient(${baseColor} 2px, transparent 2px)`,
    },
    grid: {
      name: "Grid",
      pattern: `linear-gradient(${baseColor} 1.5px, transparent 1.5px),
                linear-gradient(to right, ${baseColor} 1.5px, transparent 1.5px)`,
    },
    diagonal: {
      name: "Diagonal Lines",
      pattern: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 5px,
        ${baseColor} 5px,
        ${baseColor} 6px
      )`,
    },
    circles: {
      name: "Circles",
      pattern: `radial-gradient(circle at center, ${baseColor} 0, ${baseColor} 2px, transparent 2px, transparent 100%),
                radial-gradient(circle at center, ${baseColor} 0, ${baseColor} 1.5px, transparent 1.5px, transparent 100%)`,
    },
    waves: {
      name: "Waves",
      pattern: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        ${baseColor} 10px,
        ${baseColor} 11px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 10px,
        ${baseColor} 10px,
        ${baseColor} 11px
      )`,
    },
    hexagons: {
      name: "Hexagons",
      pattern: `repeating-linear-gradient(60deg, ${baseColor}, ${baseColor} 1px, transparent 1px, transparent 15px),
                repeating-linear-gradient(120deg, ${baseColor}, ${baseColor} 1px, transparent 1px, transparent 15px),
                repeating-linear-gradient(180deg, ${baseColor}, ${baseColor} 1px, transparent 1px, transparent 15px)`
    },
  };
};

export const getBackgroundSize = (pattern) => {
  switch (pattern) {
    case "grid":
      return "30px 30px";
    case "dots":
      return "20px 20px";
    case "circles":
      return "25px 25px";
    case "hexagons":
      return "35px 20px";
    case "waves":
      return "30px 30px";
    case "diagonal":
      return "15px 15px";
    default:
      return "20px 20px";
  }
};
