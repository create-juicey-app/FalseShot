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
      pattern: `radial-gradient(${baseColor} 1.5px, transparent 1.5px)`,
    },
    grid: {
      name: "Grid",
      pattern: `linear-gradient(${baseColor} 1px, transparent 1px),
                linear-gradient(to right, ${baseColor} 1px, transparent 1px)`,
    },
    diagonal: {
      name: "Diagonal Lines",
      pattern: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 9px,
        ${baseColor} 9px,
        ${baseColor} 10px
      )`,
    },
    circles: {
      name: "Circles",
      pattern: `repeating-radial-gradient(
        circle,
        ${baseColor} 0,
        ${baseColor} 1px,
        transparent 1px,
        transparent 30px
      )`,
    },
    waves: {
      name: "Waves",
      pattern: `
        radial-gradient(circle at 50% 50%, ${baseColor} 25%, transparent 26%),
        radial-gradient(circle at 50% 50%, transparent 19%, ${baseColor} 20%)
      `,
    },
    hexagons: {
      name: "Hexagons",
      pattern: `
        linear-gradient(30deg, ${baseColor} 12%, transparent 12.5%, transparent 87%, ${baseColor} 87.5%, ${baseColor}),
        linear-gradient(150deg, ${baseColor} 12%, transparent 12.5%, transparent 87%, ${baseColor} 87.5%, ${baseColor}),
        linear-gradient(90deg, transparent 37%, ${baseColor} 37.5%, ${baseColor} 62%, transparent 62.5%, transparent)
      `,
    },
  };
};

export const getBackgroundSize = (pattern) => {
  switch (pattern) {
    case "grid":
      return "20px 20px";
    case "dots":
      return "15px 15px";
    case "circles":
      return "40px 40px";
    case "hexagons":
      return "30px 52px";
    case "waves":
      return "50px 50px";
    case "diagonal":
      return "12px 12px";
    default:
      return "20px 20px";
  }
};
