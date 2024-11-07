import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ImageList,
  ImageListItem,
  Paper,
  Button,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  CircularProgress,
  ButtonGroup,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import UploadIcon from "@mui/icons-material/Upload";
import { styled, keyframes, css } from "@mui/system"; // Add css import
import Modal from "../components/Modal";
import Image from "next/image"; // Change the import line
import gifshot from 'gifshot'; // Add gifshot import at the top

// Styled Components
const AppContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  overflow: "hidden",
}));

const InterfaceBox = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "auto",
  width: "100%",
  maxWidth: "100%", // Changed from 1400px to 100%
  margin: "0 auto",
  marginTop: "-80px",
}));

const OutputBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
}));

const CustomExpressionImage = styled("img")(({ theme }) => ({
  width: "96px",
  height: "96px",
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": {
    boxShadow: theme.shadows[3],
  },
  imageRendering: "pixelated",
}));

const globalStyles = css`
  @font-face {
    font-family: 'Terminus';
    src: url('/fonts/Terminus.ttf') format('truetype');
    font-display: swap;
    font-weight: normal;
    font-style: normal;
  }
`;

function App() {
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [expression, setExpression] = useState("");
  const [useMask, setUseMask] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [terminusFont, setTerminusFont] = useState(null);
  const [isDirty, setIsDirty] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [expandedCharacter, setExpandedCharacter] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [expandedBackground, setExpandedBackground] = useState(null);
  const [customExpressions, setCustomExpressions] = useState([]);
  const [selectedCustomExpression, setSelectedCustomExpression] =
    useState(null);
  const [fontSize, setFontSize] = useState(28); // Default font size
  const [selectedFont, setSelectedFont] = useState("Terminus");
  const [fontConfig, setFontConfig] = useState({});
  const [currentLinePos, setCurrentLinePos] = useState(0);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const offscreenCtxRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const renderRef = useRef(null);
  const imageCache = useRef({});

  const ResponsiveGrid = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
    gap: theme.spacing(1),
    justifyContent: "center",
  }));

  const CharacterImage = styled("img")(({ theme }) => ({
    width: "96px",
    height: "96px",
    borderRadius: "5px",
    cursor: "pointer",
    "&:hover": {
      boxShadow: theme.shadows[3],
    },
    imageRendering: "pixelated",
  }));
  const BackgroundThumbnail = styled("div")(({ theme }) => ({
    width: "200px",
    height: "42px",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: `2px solid ${theme.palette.background.paper}`,
    "&:hover": {
      boxShadow: theme.shadows[3],
    },
  }));
  const AccordionHeader = styled(AccordionSummary)(({ theme }) => ({
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    "& .MuiAccordionSummary-content": {
      margin: "4px 0",
    },
  }));

  const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
`;

  const BackgroundItem = styled(Box)(({ theme }) => ({
    width: "100%",
    height: "60px",
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
    marginBottom: theme.spacing(1),
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage:
        "linear-gradient(to right, transparent, black 50%, black)",
      opacity: 1,
      animation: `${gradientAnimation} 3s infinite`, // Add the animation here
    },
    "&:hover": {
      boxShadow: theme.shadows[4],
      "&::before": {
        backgroundImage:
          "linear-gradient(to right, transparent, rgba(0,0,0,0.5) 50%, black)",
      },
    },
  }));

  const BackgroundName = styled(Typography)(({ theme }) => ({
    position: "absolute",
    right: theme.spacing(2),
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.common.white,
    fontSize: "1.5rem",
    fontWeight: "bold",
    zIndex: 1,
    transition: "color 0.3s ease",
  }));

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Load configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/nyko.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const configData = await response.json();
        setConfig(configData);
        setSelectedCharacter(configData.characters[0].name);
        setSelectedBackground(configData.backgrounds[0].name);
        setExpression(configData.characters[0].expressions[0].name);
        setUseMask(configData.backgrounds[0].useMask);
        setIsLoading(false);
        setIsDirty(true);
      } catch (error) {
        console.error("Failed to load configuration:", error);
        setErrorMessage(
          "Failed to load configuration. Please check if config.json exists and is valid."
        );
        setError(true);
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Load custom font
  useEffect(() => {
    const loadFont = async () => {
      try {
        // Create and inject global styles for Terminus only
        const style = document.createElement('style');
        style.textContent = globalStyles;
        document.head.appendChild(style);

        // Load Terminus font
        const terminusFont = new FontFace('Terminus', 'url(/fonts/Terminus.ttf)');
        await terminusFont.load();
        document.fonts.add(terminusFont);
        
        setTerminusFont(terminusFont);
      } catch (error) {
        console.error("Failed to load font:", error);
        setErrorMessage("Failed to load Terminus font. Using system font instead.");
        setError(true);
      }
    };
    loadFont();
  }, []);

  // Load selected font
  useEffect(() => {
    const loadFont = async () => {
      if (selectedFont && selectedFont !== "Terminus") {
        const font = new FontFace(
          selectedFont,
          `url(/fonts/${selectedFont}.ttf)`
        );
        await font.load();
        document.fonts.add(font);
        setIsDirty(true);
      }
    };
    loadFont();
  }, [selectedFont]);

  // Load selected font (add font to document for preview)
  useEffect(() => {
    const loadSelectedFont = async () => {
      if (selectedFont && selectedFont !== "Terminus") {
        const font = new FontFace(
          selectedFont,
          `url(/fonts/${selectedFont}.ttf)`
        );
        await font.load();
        document.fonts.add(font);
        setIsDirty(true);
      }
    };
    loadSelectedFont();
  }, [selectedFont]);

  // Initialize canvas and context
  useEffect(() => {
    if (!isMounted || !config) return;

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element not found");
      setErrorMessage(
        "Failed to initialize canvas. Please try refreshing the page."
      );
      setError(true);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context from canvas");
      setErrorMessage(
        "Failed to initialize canvas context. Please try a different browser."
      );
      setError(true);
      return;
    }

    ctx.imageSmoothingEnabled = false;
    ctxRef.current = ctx;

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext("2d");
    if (!offscreenCtx) {
      console.error("Failed to get 2D context from offscreen canvas");
      setErrorMessage(
        "Failed to initialize offscreen canvas. Please try a different browser."
      );
      setError(true);
      return;
    }

    offscreenCtx.imageSmoothingEnabled = false;
    offscreenCanvasRef.current = offscreenCanvas;
    offscreenCtxRef.current = offscreenCtx;

    setIsDirty(true);
  }, [isMounted, config]);

  const handleCustomExpressionUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newCustomExpression = {
          id: Date.now(),
          name: file.name,
          data: e.target.result,
        };
        setCustomExpressions((prev) => [...prev, newCustomExpression]);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  const handleCustomExpressionSelect = useCallback((customExpression) => {
    setSelectedCustomExpression(customExpression);
    setExpression(null);
    setIsDirty(true);
  }, []);
  // Handle message input with line limit
  const handleMessageChange = useCallback((e) => {
    const text = e.target.value;
    const maxLines = 5;
    const currentFont = config.fonts.find(f => f.name === selectedFont);
    const maxLineLength = currentFont ? currentFont.charLimit : 30; // Default to 30 if not found

    // Split the text into lines, preserving user-entered line breaks
    let lines = text.split("\n");

    // Process each line to ensure max line length
    let formattedLines = [];
    lines.forEach((line, index) => {
      while (line.length > maxLineLength) {
        let splitAt = line.lastIndexOf(" ", maxLineLength);
        if (splitAt === -1) splitAt = maxLineLength; // In case of long words
        formattedLines.push(line.substring(0, splitAt));
        line = line.substring(splitAt + 1);
      }
      formattedLines.push(line);
    });

    // Enforce the maxLines limit
    formattedLines = formattedLines.slice(0, maxLines);

    const formattedText = formattedLines.join("\n");

    if (formattedLines.length > maxLines) {
      setErrorMessage(
        `Your message is too long, only ${maxLines} lines of text can be rendered!`
      );
      setError(true);
      setIsErrorModalOpen(true);
    } else {
      setError(false);
      setErrorMessage("");
      setMessage(formattedText);
      setIsDirty(true);

      // Adjust font size based on line count
      if (formattedLines.length === 5) {
        setFontSize(16); // Smallest font size for 5 lines
      } else if (formattedLines.length === 4) {
        setFontSize(20); // Medium font size for 4 lines
      } else {
        setFontSize(28); // Default font size for 1-3 lines
      }
    }
  }, [selectedFont, config]);

  const handleCloseError = useCallback(() => {
    setIsErrorModalOpen(false);
    setError(false);
    setErrorMessage("");
  }, []);
  // Toggle category expansion
  const handleAccordionChange = useCallback(
    (category) => (event, isExpanded) => {
      setExpandedCategories((prev) => ({
        ...prev,
        [category]: isExpanded,
      }));
    },
    []
  );

  // Handle expression selection
  const handleExpressionChange = useCallback((expr) => {
    setExpression(expr);
    setSelectedCustomExpression(null);
    setIsDirty(true);
  }, []);

  // Handle character selection
  const handleCharacterChange = useCallback(
    (characterName) => {
      setSelectedCharacter(characterName);
      const character = config.characters.find((c) => c.name === characterName);
      if (character && character.expressions.length > 0) {
        setExpression(character.expressions[0].name);
      }
      setSelectedCustomExpression(null);
      setIsDirty(true);
    },
    [config]
  );
  const handleBackgroundChange = useCallback(
    (backgroundName) => {
      const background = config.backgrounds.find(
        (b) => b.name === backgroundName
      );
      setSelectedBackground(background.name);
      setUseMask(background.useMask);
      setIsDirty(true);
    },
    [config]
  );

  const backgroundSelection = useMemo(() => {
    if (!config) return null;

    return (
      <Box mt={2}>
        <Typography variant="h5" mb={1}>
          Backgrounds
        </Typography>
        {config.backgrounds.map((bg) => (
          <BackgroundItem
            key={bg.name}
            onClick={() => handleBackgroundChange(bg.name)}
            sx={{
              backgroundImage: `url(/backgrounds/${bg.file})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border:
                selectedBackground === bg.name ? "2px solid #FFA500" : "none",
            }}
          >
            <BackgroundName
              sx={{
                color: selectedBackground === bg.name ? "#FFA500" : "white",
              }}
            >
              {bg.name}
            </BackgroundName>
          </BackgroundItem>
        ))}
      </Box>
    );
  }, [config, selectedBackground, handleBackgroundChange]);

  // Handle background selection

  // Handle mask toggle
  const handleMaskToggle = useCallback((event) => {
    setUseMask(event.target.checked);
    setIsDirty(true);
  }, []);

  // Load and cache image
  const loadImage = useCallback((src) => {
    return new Promise((resolve, reject) => {
      if (imageCache.current[src]) {
        resolve(imageCache.current[src]);
      } else {
        const img = document.createElement('img');
        img.onload = () => {
          imageCache.current[src] = img;
          resolve(img);
        };
        img.onerror = reject;
        img.src = src;
      }
    });
  }, []);

  const handleCharacterAccordionChange = useCallback(
    (characterName) => (event, isExpanded) => {
      setExpandedCharacter(isExpanded ? characterName : null);
    },
    []
  );
  const characterAccordions = useMemo(() => {
    if (!config) return null;

    return config.characters.map((character) => (
      <Accordion
        key={character.name}
        expanded={expandedCharacter === character.name}
        onChange={handleCharacterAccordionChange(character.name)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${character.name}-content`}
          id={`${character.name}-header`}
        >
          <Box display="flex" alignItems="center">
            <CharacterImage
              src={`/faces/${character.folder}/${
                character.expressions[0]?.file || ""
              }`}
              alt={character.name}
            />
            <Typography variant="h4" sx={{ ml: 2 }}>
              {character.name}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <ResponsiveGrid>
            {character.expressions.map((expr) => (
              <Tooltip key={expr.name} title={expr.name}>
                <Box
                  component="img"
                  src={`/faces/${character.folder}/${expr.file}`}
                  alt={expr.name}
                  onClick={() => {
                    handleCharacterChange(character.name);
                    handleExpressionChange(expr.name);
                  }}
                  sx={{
                    width: "96px",
                    height: "96px",
                    border:
                      selectedCharacter === character.name &&
                      expression === expr.name
                        ? "2px solid"
                        : "2px solid transparent",
                    borderColor:
                      selectedCharacter === character.name &&
                      expression === expr.name
                        ? "primary.main"
                        : "transparent",
                    borderRadius: "5px",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "primary.light",
                    },
                    imageRendering: "pixelated",
                  }}
                />
              </Tooltip>
            ))}
          </ResponsiveGrid>
        </AccordionDetails>
      </Accordion>
    ));
  }, [
    config,
    expandedCharacter,
    selectedCharacter,
    expression,
    handleCharacterAccordionChange,
    handleCharacterChange,
    handleExpressionChange,
  ]);

  // Render the output image

  useEffect(() => {
    if (
      !isMounted ||
      !terminusFont ||
      !isDirty ||
      !config ||
      !ctxRef.current ||
      !offscreenCtxRef.current
    ) {
      return;
    }

    const renderImage = async () => {
      const ctx = ctxRef.current;
      const offscreenCtx = offscreenCtxRef.current;

      if (!ctx || !offscreenCtx) {
        setErrorMessage(
          "Something went wrong, please send console output to juicey ):"
        );
        setError(true);
        return;
      }

      try {
        const character = config.characters.find(
          (c) => c.name === selectedCharacter
        );
        const background = config.backgrounds.find(
          (b) => b.name === selectedBackground
        );

        const [backgroundImg, expressionImg, maskImg] = await Promise.all([
          loadImage(`/backgrounds/${background.file}`),
          selectedCustomExpression
            ? loadImage(selectedCustomExpression.data)
            : loadImage(
                `/faces/${character.folder}/${
                  character.expressions.find((e) => e.name === expression)
                    ?.file || character.expressions[0].file
                }`
              ),
          useMask ? loadImage("/cmask.png") : null,
        ]);

        offscreenCtx.clearRect(
          0,
          0,
          offscreenCanvasRef.current.width,
          offscreenCanvasRef.current.height
        );
        offscreenCtx.drawImage(
          backgroundImg,
          0,
          0,
          offscreenCanvasRef.current.width,
          offscreenCanvasRef.current.height
        );

        // Create a temporary canvas for the expression
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 96;
        tempCanvas.height = 96;
        const tempCtx = tempCanvas.getContext("2d");

        // Draw expression on temporary canvas
        tempCtx.drawImage(expressionImg, 0, 0, 96, 96);

        // Apply mask if needed
        if (useMask && maskImg) {
          tempCtx.globalCompositeOperation = "destination-in";
          tempCtx.drawImage(maskImg, 0, 0, 96, 96);
        }

        // Draw the masked expression onto the main canvas
        offscreenCtx.drawImage(
          tempCanvas,
          offscreenCanvasRef.current.width - 114,
          16,
          96,
          96
        );

        // Text rendering with automatic line breaks
        offscreenCtx.font = `${fontSize}px "${selectedFont}"`;
        offscreenCtx.textBaseline = 'top';
        offscreenCtx.textAlign = 'left';
        // Add font smoothing prevention
        offscreenCtx.imageSmoothingEnabled = false;
        offscreenCtx.textRendering = 'pixelated';
        offscreenCtx.fillStyle = "white";
        offscreenCtx.textAlign = "left";

        const maxWidth = offscreenCanvasRef.current.width - 144; // Leave space for the expression
        const lineHeight = fontSize + 4; // Adjust line height based on font size
        const lines = message.split("\n");
        let y = fontSize-8; // Adjust starting y position based on font size

        for (let i = 0; i < lines.length; i++) {
          offscreenCtx.fillText(lines[i], 30, y);
          y += lineHeight;
        }

        for (let i = 0; i < lines.length && i; i++) {
          const words = lines[i].split(" ");
          let line = "";

          for (let j = 0; j < words.length; j++) {
            const testLine = line + words[j] + " ";
            const metrics = offscreenCtx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && j > 0) {
              offscreenCtx.fillText(line.trim(), 30, y);
              line = words[j] + " ";
              y += lineHeight;
              break;
            } else {
              line = testLine;
            }
          }

          // Draw the last line of this paragraph
          if (line) {
            offscreenCtx.fillText(line.trim(), 30, y);
            y += lineHeight;
          }
        }

        // Copy from offscreen canvas to main canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(offscreenCanvasRef.current, 0, 0);

        // Update imageData state with the new rendered image
        const imageDataUrl = canvasRef.current.toDataURL();
        setImageData(imageDataUrl);

        setIsDirty(false);
      } catch (error) {
        console.error("Failed to render image:", error);
        setErrorMessage(`Failed to render image: ${error.message}`);
        setError(true);
      }
    };
    requestAnimationFrame(renderImage);
  }, [
    isMounted,
    message,
    selectedCharacter,
    selectedBackground,
    expression,
    terminusFont,
    isDirty,
    loadImage,
    config,
    useMask,
    selectedCustomExpression,
    fontSize, // Add fontSize to the dependency array
    selectedFont,
  ]);
  const handleCopyImage = useCallback(() => {
    if (imageData) {
      navigator.clipboard
        .writeText(imageData)
        .then(() => {
          alert(
            "Image URL copied to clipboard! You can paste it in most applications."
          );
        })
        .catch((err) => {
          console.error("Failed to copy image URL:", err);
          setErrorMessage(
            "Failed to copy image URL. Please try again or use right-click to copy the image."
          );
          setError(true);
        });
    } else {
      setErrorMessage("Image not ready. Please wait for it to render.");
      setError(true);
    }
  }, [imageData]);

  const handleDownload = useCallback(() => {
    if (imageData) {
      const link = document.createElement("a");
      link.href = imageData;
      link.download = "character-dialogue.png";
      link.click();
    } else {
      console.error("Image data is not available");
      setErrorMessage("Failed to download image. Please try again.");
      setError(true);
    }
  }, [imageData]);
  // Memoize the expression buttons to prevent unnecessary re-renders
  const expressionButtons = useMemo(() => {
    if (!config) return null;

    const character = config.characters.find(
      (c) => c.name === selectedCharacter
    );
    if (!character) return null;

    return (
      <Accordion
        expanded={expandedCategories[character.name] || false}
        onChange={handleAccordionChange(character.name)}
        sx={{
          boxShadow: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{character.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ResponsiveGrid>
            {character.expressions.map((expr) => (
              <Tooltip key={expr.name} title={expr.name}>
                <Box
                  component="img"
                  src={`/faces/${character.folder}/${expr.file}`}
                  alt={expr.name}
                  onClick={() => handleExpressionChange(expr.name)}
                  sx={{
                    width: "96px",
                    height: "96px",
                    border:
                      expression === expr.name
                        ? "2px solid"
                        : "2px solid transparent",
                    borderColor:
                      expression === expr.name ? "primary.main" : "transparent",
                    borderRadius: "5px",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "primary.light",
                    },
                    imageRendering: "pixelated",
                  }}
                />
              </Tooltip>
            ))}
          </ResponsiveGrid>
        </AccordionDetails>
      </Accordion>
    );
  }, [
    config,
    selectedCharacter,
    expandedCategories,
    expression,
    handleAccordionChange,
    handleExpressionChange,
  ]);
  const customAccordion = useMemo(
    () => (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="custom-expression-content"
          id="custom-expression-header"
        >
          <Box display="flex" alignItems="center">
            <Typography variant="h6">Custom</Typography>
            <Tooltip title="Upload and use custom expressions">
              <HelpOutlineIcon sx={{ ml: 1 }} />
            </Tooltip>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box mb={2}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="custom-expression-upload"
              type="file"
              onChange={handleCustomExpressionUpload}
            />
            <label htmlFor="custom-expression-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
              >
                Upload Image
              </Button>
            </label>
          </Box>
          <ResponsiveGrid>
            {customExpressions.map((customExpr) => (
              <Tooltip key={customExpr.id} title={customExpr.name}>
                <CustomExpressionImage
                  src={customExpr.data}
                  alt={customExpr.name}
                  onClick={() => handleCustomExpressionSelect(customExpr)}
                  sx={{
                    border:
                      selectedCustomExpression === customExpr
                        ? "2px solid"
                        : "2px solid transparent",
                    borderColor:
                      selectedCustomExpression === customExpr
                        ? "primary.main"
                        : "transparent",
                  }}
                />
              </Tooltip>
            ))}
          </ResponsiveGrid>
        </AccordionDetails>
      </Accordion>
    ),
    [
      customExpressions,
      selectedCustomExpression,
      handleCustomExpressionUpload,
      handleCustomExpressionSelect,
    ]
  );

  const handleFontChange = (event) => {
    const newFont = event.target.value;
    setSelectedFont(newFont);
    
    // Reset text position when changing fonts
    setCurrentLinePos(0);
    
    // Adjust font size based on the new font
    const currentFont = config.fonts.find(f => f.name === newFont);
    if (currentFont) {
      // Recalculate line breaks with new font's character limit
      handleMessageChange({ target: { value: message } });
    }
    
    setIsDirty(true);
  };

  // Use MUI theme and useMediaQuery to detect screen size
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Use isSmallScreen to adjust styles dynamically
  const contentContainerStyles = {
    marginTop: isSmallScreen ? "-80px" : "0",
    padding: isSmallScreen ? theme.spacing(2) : theme.spacing(4),
    maxWidth: "100%", // Changed from 1200px to 100%
    width: "100%",
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Don't prevent default behavior for arrow keys
      return;
    }
  
    const textarea = e.target;
    const selectionStart = textarea.selectionStart;
    const currentLineStart = textarea.value.lastIndexOf('\n', selectionStart - 1) + 1;
    const currentLineEnd = textarea.value.indexOf('\n', selectionStart);
    const currentLine = textarea.value.substring(
      currentLineStart,
      currentLineEnd === -1 ? textarea.value.length : currentLineEnd
    );
  
    switch (e.key) {
      case 'Home':
        setCursorPosition(currentLineStart);
        e.preventDefault();
        break;
      case 'End':
        setCursorPosition(currentLineStart + currentLine.length);
        e.preventDefault();
        break;
    }
  }, []);

  // Add new state for GIF generation
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [generatedGif, setGeneratedGif] = useState(null);
  const [arrowImage, setArrowImage] = useState(null);

  // Add this near other useEffects
  useEffect(() => {
    // Load arrow image once
    loadImage('/arrow.png').then(img => {
      setArrowImage(img);
    });
  }, [loadImage]);

  // Add new function to generate individual frames
  const generateFrame = useCallback(async (text, frameIndex, isFinalFrame = false) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas and redraw background/character
    // This reuses most of the existing render logic
    const character = config.characters.find(c => c.name === selectedCharacter);
    const background = config.backgrounds.find(b => b.name === selectedBackground);

    const [backgroundImg, expressionImg, maskImg] = await Promise.all([
      loadImage(`/backgrounds/${background.file}`),
      selectedCustomExpression
        ? loadImage(selectedCustomExpression.data)
        : loadImage(`/faces/${character.folder}/${character.expressions.find(
            (e) => e.name === expression
          )?.file || character.expressions[0].file}`),
      useMask ? loadImage("/cmask.png") : null,
    ]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // Draw character
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 96;
    tempCanvas.height = 96;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(expressionImg, 0, 0, 96, 96);

    if (useMask && maskImg) {
      tempCtx.globalCompositeOperation = "destination-in";
      tempCtx.drawImage(maskImg, 0, 0, 96, 96);
    }

    ctx.drawImage(tempCanvas, canvas.width - 114, 16, 96, 96);

    // Draw text with typewriter effect
    ctx.font = `${fontSize}px "${selectedFont}"`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = "white";
    
    const lines = text.split('\n');
    const lineHeight = fontSize + 4;
    let y = fontSize - 8;

    lines.forEach((line, lineIndex) => {
      const chars = line.slice(0, frameIndex);
      ctx.fillText(chars, 30, y + (lineHeight * lineIndex));
    });

    // Draw arrow if this is the final frame
    if (isFinalFrame && arrowImage) {
      const arrowX = canvas.width / 2 - arrowImage.width / 2;
      const arrowY = canvas.height - arrowImage.height + 4; // Y offset of +4
      ctx.drawImage(arrowImage, arrowX, arrowY);
    }

    return canvas.toDataURL();
  }, [selectedCharacter, selectedBackground, selectedCustomExpression, expression, useMask, fontSize, selectedFont, loadImage, arrowImage]);

  // Add function to generate GIF
  const handleGenerateGif = useCallback(async () => {
    setIsGeneratingGif(true);
    
    try {
      const frames = [];
      let currentIndex = 0;
      const text = message;
      
      // Generate frames for each character - faster by incrementing by 3
      while (currentIndex <= text.length) {
        const frame = await generateFrame(text, currentIndex);
        frames.push(frame);
        
        // Add extra frames for pauses, but fewer than before
        if (text[currentIndex - 1] === '.' || text[currentIndex - 1] === ',') {
          for (let i = 0; i < 5; i++) { // Reduced from 10 to 5 frames for pauses
            frames.push(frame);
          }
        }
        
        currentIndex += 3; // Increment by 3 instead of 1 for faster text
      }

      // Generate the final frame with arrow
      const finalFrame = await generateFrame(text, text.length, true); // Add true parameter for final frame
      
      // Add final frame multiple times for longer display
      for (let i = 0; i < 50; i++) { // 50 frames = 5 seconds at 0.1s interval
        frames.push(finalFrame);
      }

      // Generate GIF using gifshot
      gifshot.createGIF({
        images: frames,
        gifWidth: 608,
        gifHeight: 128,
        interval: 0.1,
        progressCallback: (progress) => {
          console.log('GIF Progress:', progress);
        }
      }, function(obj) {
        if(!obj.error) {
          setGeneratedGif(obj.image);
        }
      });
    } catch (error) {
      console.error('Error generating GIF:', error);
      setErrorMessage('Failed to generate GIF');
      setError(true);
    } finally {
      setIsGeneratingGif(false);
    }
  }, [message, generateFrame]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!config) {
    return <Typography>Error loading configuration</Typography>;
  }

  return (
    <AppContainer>
      <OutputBox>
        <Box>
          <canvas
            ref={canvasRef}
            width="608"
            height="128"
            style={{
              display: "none",
              imageRendering: "pixelated",
              border: "1px solid #000",
            }}
          />
          {imageData && (
            <Box>
              <Image
                src={imageData}
                alt="Rendered output"
                width={608}
                height={128}
                style={{
                  imageRendering: "pixelated",
                  border: "1px solid #000",
                }}
                unoptimized // Add this prop since we're using a data URL
              />
            </Box>
          )}
        </Box>
        <Button
          color="primary"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyImage}
          sx={{ mt: 2, mr: 2 }}
        >
          Copy Image
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{ mt: 2 }}
        >
          Download Image
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleGenerateGif}
          disabled={isGeneratingGif || !message}
          sx={{ mt: 2, ml: 2 }}
        >
          {isGeneratingGif ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Generating GIF...
            </>
          ) : (
            'Generate GIF'
          )}
        </Button>

        {/* Display generated GIF */}
        {generatedGif && (
          <Box mt={2}>
            <Typography variant="h6">Generated GIF:</Typography>
            <Image
              src={generatedGif}
              alt="Generated GIF"
              width={608}
              height={128}
              style={{
                imageRendering: "pixelated",
                border: "1px solid #000",
              }}
              unoptimized
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const link = document.createElement('a');
                link.href = generatedGif;
                link.download = 'dialogue-animation.gif';
                link.click();
              }}
              sx={{ mt: 1 }}
            >
              Download GIF
            </Button>
          </Box>
        )}

        {/* Main Content */}
        <ContentContainer>
          <InterfaceBox sx={contentContainerStyles}>
            <Grid container spacing={3} sx={{ px: 4 }}>
              {" "}
              {/* Added horizontal padding */}
              {/* Characters Column - Even wider */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  Characters
                </Typography>
                {characterAccordions}
                {/* Custom Expressions */}
                <Box mt={2}>{customAccordion}</Box>
              </Grid>
              {/* Message and Controls Column - Slightly narrower */}
              <Grid item xs={12} md={3}>
                <Box mb={3}>
                  <Typography
                    variant="h5"
                    component="label"
                    htmlFor="message"
                    gutterBottom
                  >
                    Message
                  </Typography>
                  <TextField
                    id="message"
                    placeholder="What's the character going to say?"
                    multiline
                    rows={5}
                    fullWidth
                    variant="outlined"
                    value={message}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyDown}
                    inputProps={{ 
                      maxLength: 250,
                      style: { 
                        fontFamily: selectedFont,
                        fontSize: `${fontSize}px`
                      }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: selectedFont,
                        caretColor: 'auto', // Add this to ensure cursor is visible
                      }
                    }}
                    // Add this to control cursor position
                    onSelect={(e) => {
                      setCursorPosition(e.target.selectionStart);
                    }}
                  />
                </Box>

                {/* Font controls below message */}
                <Box mb={3}>
                  <Typography variant="h5" gutterBottom>
                    Font Settings
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="font-selector-label">Font Style</InputLabel>
                    <Select
                      labelId="font-selector-label"
                      id="font-selector"
                      value={selectedFont}
                      label="Font Style"
                      onChange={handleFontChange}
                    >
                      {config.fonts.map((font) => (
                        <MenuItem
                          key={font.name}
                          value={font.name}
                          style={{ 
                            fontFamily: font.name === 'Terminus' ? 'Terminus' : font.name 
                          }}
                        >
                          {font.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={useMask}
                        onChange={handleMaskToggle}
                        name="useMask"
                      />
                    }
                    label="Use Mask"
                  />
                </Box>
              </Grid>
              {/* Backgrounds Column */}
              <Grid item xs={12} md={3}>
                <Typography variant="h5" gutterBottom>
                  Backgrounds
                </Typography>
                {backgroundSelection}
              </Grid>
            </Grid>
          </InterfaceBox>
        </ContentContainer>
      </OutputBox>
      {/* Error Modal */}
      <Modal
        isOpen={error}
        onClose={handleCloseError}
        title="Error!"
        content={errorMessage}
        icon="Error"
        buttons={[{ label: "Discard", onClick: handleCloseError }]}
      />
    </AppContainer>
  );
}

export default App;
