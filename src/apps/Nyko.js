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
  Tabs,
  Tab,
  LinearProgress,
  Skeleton, // Add this import
  IconButton, // Add this import
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import UploadIcon from "@mui/icons-material/Upload";
import { styled, keyframes, css } from "@mui/system"; // Add css import
import Modal from "../components/Modal";
import Image from "next/image"; // Change the import line
import gifshot from "gifshot"; // Add gifshot import at the top
import { RefreshRounded } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search"; // Add this import
import VisibilityIcon from "@mui/icons-material/Visibility"; // Add this import
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"; // Add this import
// Styled Components
// Update AppContainer to handle full width without margins
const AppContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  maxHeight: "100vh",
  width: "100vw",
  margin: 0,
  padding: 0,
  overflow: "hidden",
}));

// Update ContentContainer to use full width
const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  width: "100%",
  overflowY: "auto",
  paddingTop: theme.spacing(2),
  margin: 0,
  "& > *": {
    maxWidth: "100vw",
    boxSizing: "border-box",
  },
}));

// Update InterfaceBox to use full width
const InterfaceBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  boxSizing: "border-box",
}));

// Add SearchBox component
const SearchBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
  gap: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const OutputBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  overflowY: "auto", // Add this line to enable scrolling
}));

const CustomExpressionImage = styled("img")(({ theme }) => ({
  width: "96px",
  height: "96px",
  "&:hover": {
    boxShadow: theme.shadows[3],
  },
  imageRendering: "pixelated",
}));

const globalStyles = css`
  @font-face {
    font-family: "Terminus";
    src: url("/fonts/Terminus.ttf") format("truetype");
    font-display: swap;
    font-weight: normal;
    font-style: normal;
  }
`;

const PreviewContainer = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  width: "100%",
  margin: 0,
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxSizing: "border-box",
}));

// Add new styled component for the grid layout
const TwoColumnGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "50% 50%", // Change to equal width columns
  },
}));

// Add styled components for the columns
const CharacterColumn = styled(Box)(({ theme }) => ({
  height: "100%",
  width: "100%",
  overflowY: "auto",
  padding: theme.spacing(2),
  borderRight: `1px solid ${theme.palette.divider}`,
  boxSizing: "border-box", // Ensure padding is included in width calculation
}));

const ControlsColumn = styled(Box)(({ theme }) => ({
  height: "100%",
  width: "100%",
  overflowY: "auto",
  padding: theme.spacing(2),
  boxSizing: "border-box", // Ensure padding is included in width calculation
}));

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
  const [previewTab, setPreviewTab] = useState(0);
  const [gifProgress, setGifProgress] = useState(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true); // Add this line
  const [isGeneratingWebP, setIsGeneratingWebP] = useState(false); // Add this line
  const [GeneratedWebP, setGeneratedWebP] = useState(null);
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

  const PreviewContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
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
        const style = document.createElement("style");
        style.textContent = globalStyles;
        document.head.appendChild(style);

        // Load Terminus font
        const terminusFont = new FontFace(
          "Terminus",
          "url(/fonts/Terminus.ttf)"
        );
        await terminusFont.load();
        document.fonts.add(terminusFont);

        setTerminusFont(terminusFont);
      } catch (error) {
        console.error("Failed to load font:", error);
        setErrorMessage(
          "Failed to load Terminus font. Using system font instead."
        );
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
  const handleMessageChange = useCallback(
    (e) => {
      const text = e.target.value;
      const maxLines = 5;
      const currentFont = config.fonts.find((f) => f.name === selectedFont);
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
    },
    [selectedFont, config]
  );

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
        const img = document.createElement("img");
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
  const [searchTerms, setSearchTerms] = useState({});

  const characterAccordions = useMemo(() => {
    if (!config) return null;

    return config.characters.map((character) => {
      const searchTerm = searchTerms[character.name] || "";
      const filteredExpressions = character.expressions.filter((expr) =>
        expr.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
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
            <SearchBox>
              <SearchIcon />
              <TextField
                size="small"
                fullWidth
                placeholder="Search expressions..."
                value={searchTerms[character.name] || ""}
                onChange={(e) =>
                  setSearchTerms((prev) => ({
                    ...prev,
                    [character.name]: e.target.value,
                  }))
                }
              />
            </SearchBox>
            <ResponsiveGrid>
              {filteredExpressions.map((expr) => (
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
      );
    });
  }, [
    config,
    searchTerms,
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
        offscreenCtx.textBaseline = "top";
        offscreenCtx.textAlign = "left";
        // Add font smoothing prevention
        offscreenCtx.imageSmoothingEnabled = false;
        offscreenCtx.textRendering = "pixelated";
        offscreenCtx.fillStyle = "white";
        offscreenCtx.textAlign = "left";

        const maxWidth = offscreenCanvasRef.current.width - 144; // Leave space for the expression
        const lineHeight = fontSize + 4; // Adjust line height based on font size
        const lines = message.split("\n");
        let y = fontSize - 8; // Adjust starting y position based on font size

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
      fetch(imageData)
        .then((res) => res.blob())
        .then(async (blob) => {
          const item = new ClipboardItem({ [blob.type]: blob });
          await navigator.clipboard.write([item]);
          // Optionally, display a success message
        })
        .catch((err) => {
          // Handle error
        });
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
    const currentFont = config.fonts.find((f) => f.name === newFont);
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
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      // Don't prevent default behavior for arrow keys
      return;
    }

    const textarea = e.target;
    const selectionStart = textarea.selectionStart;
    const currentLineStart =
      textarea.value.lastIndexOf("\n", selectionStart - 1) + 1;
    const currentLineEnd = textarea.value.indexOf("\n", selectionStart);
    const currentLine = textarea.value.substring(
      currentLineStart,
      currentLineEnd === -1 ? textarea.value.length : currentLineEnd
    );

    switch (e.key) {
      case "Home":
        setCursorPosition(currentLineStart);
        e.preventDefault();
        break;
      case "End":
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
    loadImage("/arrow.png").then((img) => {
      setArrowImage(img);
    });
  }, [loadImage]);

  // Add new state for arrow animation
  const [arrowOffset, setArrowOffset] = useState(-3);

  // Modify generateFrame function to handle text animation per line
  const generateFrame = useCallback(
    async (
      lines,
      currentLineIndex,
      charIndex,
      arrowYOffset = -3,
      showArrow = false
    ) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Clear canvas and redraw background/character
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

      // Draw text with line-by-line animation
      ctx.font = `${fontSize}px "${selectedFont}"`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = "white";

      const lineHeight = fontSize + 4;
      let y = fontSize - 8;

      // Draw completed lines
      for (let i = 0; i < currentLineIndex; i++) {
        ctx.fillText(lines[i], 30, y + lineHeight * i);
      }

      // Draw current line with typewriter effect
      if (currentLineIndex < lines.length) {
        const currentLineText = lines[currentLineIndex].slice(0, charIndex);
        ctx.fillText(currentLineText, 30, y + lineHeight * currentLineIndex);
      }

      // Draw arrow with animation if this is showing the arrow
      if (showArrow && arrowImage) {
        const arrowX = canvas.width / 2 - arrowImage.width / 2;
        const arrowY = canvas.height - arrowImage.height + arrowYOffset;
        ctx.drawImage(arrowImage, arrowX, arrowY);
      }

      return canvas.toDataURL();
    },
    [
      selectedCharacter,
      selectedBackground,
      selectedCustomExpression,
      expression,
      useMask,
      fontSize,
      selectedFont,
      loadImage,
      arrowImage,
    ]
  );

  // Modify handleGenerateGif function
  const handleGenerateAnimation = useCallback(
    async (format) => {
      if (!message) return;
      setIsGeneratingGif(format === "gif");
      setIsGeneratingWebP(format === "webp");
      setGifProgress(0);
      setGeneratedGif(null);
      setGeneratedWebP(null); // Add this line

      try {
        const lines = message.split("\n");
        const frames = [];
        const punctuationPauses = [".", "!", "?", ";", ","];
        const pauseFrames = {
          ".": 5,
          "!": 5,
          "?": 5,
          ";": 3,
          ",": 2,
        };

        let totalSteps = lines.reduce((acc, line) => acc + line.length, 0);
        let currentStep = 0;

        // Generate frames with optimizations
        const baseFrame = await generateFrame(lines, 0, 0);
        frames.push(baseFrame);
        setGifProgress(5);

        // Generate text animation frames
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex];
          for (let charIndex = 0; charIndex <= line.length; charIndex++) {
            // Change increment from 2 to 1
            const frame = await generateFrame(lines, lineIndex, charIndex);
            frames.push(frame);

            if (
              charIndex > 0 &&
              punctuationPauses.includes(line[charIndex - 1])
            ) {
              const pauseCount = pauseFrames[line[charIndex - 1]] || 1;
              const pauseFrame = frames[frames.length - 1];
              for (let i = 0; i < pauseCount; i++) {
                frames.push(pauseFrame);
              }
            }

            currentStep += 1; // Change increment from 2 to 1
            setGifProgress(5 + (currentStep / totalSteps) * 70);
          }
        }

        // Generate arrow animation frames
        setGifProgress(75);
        const arrowAnimationFrames = [];
        const animationSteps = 15; // Keep the original steps

        for (let i = 0; i < animationSteps; i++) {
          const arrowOffset = -3 + Math.sin((i / animationSteps) * Math.PI) * 2;
          const frameWithArrow = await generateFrame(
            lines,
            lines.length - 1,
            lines[lines.length - 1].length,
            arrowOffset,
            true
          );
          arrowAnimationFrames.push(frameWithArrow);
          setGifProgress(75 + (i / animationSteps) * 15);
        }

        // Add arrow animation cycles (increase to 10 times)
        for (let cycle = 0; cycle < 10; cycle++) {
          frames.push(...arrowAnimationFrames);
        }

        setGifProgress(90);

        // Create GIF with optimized settings
        const blob = await createAnimationBlob(frames, format); // Modify this line
        const animationUrl = URL.createObjectURL(blob);

        if (format === "gif") {
          setGeneratedGif(animationUrl);
        } else if (format === "webp") {
          setGeneratedWebP(animationUrl); // Add this line
        }
        setGifProgress(100);
        setIsGeneratingGif(false);
        setIsGeneratingWebP(false);
      } catch (error) {
        console.error("GIF generation error:", error);
        setErrorMessage(`Failed to generate GIF: ${error.message}`);
        setError(true);
        setIsGeneratingGif(false);
        setIsGeneratingWebP(false);
        setGifProgress(0);
      }
    },
    [message, generateFrame]
  );

  // Add a function to create animation blob in the desired format
  const createAnimationBlob = async (frames, format) => {
    return new Promise((resolve, reject) => {
      gifshot.createGIF(
        {
          images: frames,
          gifWidth: 608,
          gifHeight: 128,
          numFrames: frames.length,
          frameDuration: 1,
          sampleInterval: 10,
          numWorkers: 2,
          // Add 'format' option
          format: format === "webp" ? "image/webp" : "image/gif",
        },
        (obj) => {
          if (!obj.error) {
            const image = obj.image;
            const binary = atob(image.replace(/^data:image\/\w+;base64,/, ""));
            const array = [];
            for (let i = 0; i < binary.length; i++) {
              array.push(binary.charCodeAt(i));
            }
            const blob = new Blob([new Uint8Array(array)], {
              type: format === "webp" ? "image/webp" : "image/gif",
            });
            resolve(blob);
          } else {
            reject(obj.error);
          }
        }
      );
    });
  };

  // Add a toggle function for the preview tab
  const handleTogglePreview = () => {
    setIsPreviewVisible((prev) => !prev);
  };

  const renderPreview = () => (
    <PreviewContainer>
      {previewTab === 0 && (
        <Box>
          {imageData ? (
            <Image
              src={imageData}
              alt="Rendered output"
              width={608}
              height={128}
              style={{
                imageRendering: "pixelated",
                border: "1px solid #000",
              }}
              unoptimized
            />
          ) : (
            <Skeleton variant="rectangular" width={608} height={128} />
          )}
          <ButtonGroup sx={{ mt: 2 }}>
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyImage}
              disabled={!imageData}
            >
              Copy Image
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={!imageData}
            >
              Download Image
            </Button>
          </ButtonGroup>
        </Box>
      )}

      {previewTab === 1 && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {isGeneratingGif ? (
            <>
              <Skeleton width={608} height={128} />
              <Box sx={{ width: "100%", mt: 2 }}>
                <LinearProgress variant="determinate" value={gifProgress} />
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {Math.round(gifProgress)}% - Processing frames...
                </Typography>
              </Box>
            </>
          ) : generatedGif ? (
            <>
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
              <ButtonGroup sx={{ mt: 2 }}>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = generatedGif;
                    link.download = "dialogue-animation.gif";
                    link.click();
                  }}
                >
                  Download GIF
                </Button>
                <Button
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyGif} // Update to use the new copy function
                >
                  Copy GIF
                </Button>
                <Button
                  startIcon={<RefreshRounded />} // Add a refresh icon
                  onClick={() => handleGenerateAnimation("gif")}
                >
                  Regenerate GIF
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => handleGenerateAnimation("gif")}
              disabled={isGeneratingGif || !message}
              sx={{ mt: 2 }}
            >
              Generate GIF
            </Button>
          )}
          {isGeneratingWebP ? (
            <>
              <Skeleton width={608} height={128} />
              <Box sx={{ width: "100%", mt: 2 }}>
                <LinearProgress variant="determinate" value={gifProgress} />
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {Math.round(gifProgress)}% - Processing frames...
                </Typography>
              </Box>
            </>
          ) : GeneratedWebP ? (
            <>
              <Image
                src={GeneratedWebP}
                alt="Generated WebP"
                width={608}
                height={128}
                style={{
                  imageRendering: "pixelated",
                  border: "1px solid #000",
                }}
                unoptimized
              />
              <ButtonGroup sx={{ mt: 2 }}>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = GeneratedWebP;
                    link.download = "dialogue-animation.webp";
                    link.click();
                  }}
                >
                  Download WebP
                </Button>
                <Button
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyWebP} // Update to use the new copy function
                >
                  Copy WebP
                </Button>
                <Button
                  startIcon={<RefreshRounded />}
                  onClick={() => handleGenerateAnimation("webp")}
                >
                  Regenerate WebP
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => handleGenerateAnimation("webp")}
              disabled={isGeneratingWebP || !message}
              sx={{ mt: 2 }}
            >
              Generate WebP
            </Button>
          )}
        </Box>
      )}
    </PreviewContainer>
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!config) {
    return <Typography>Error loading configuration</Typography>;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      width="100vw"
      m={0}
      p={0}
    >
      <AppContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "background.paper",
            padding: theme.spacing(1),
          }}
        >
          <IconButton onClick={handleTogglePreview}>
            {isPreviewVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </Box>

        {isPreviewVisible && (
          <Box
            sx={{
              backgroundColor: "background.paper",
              position: "sticky",
              top: 0,
              width: "100%",
              margin: 0,
              padding: theme.spacing(0, 0, 2, 0),
              zIndex: 1,
            }}
          >
            <Tabs
              value={previewTab}
              onChange={(e, newValue) => setPreviewTab(newValue)}
              centered
              sx={{ mb: 0 }}
            >
              <Tab label="Image Editor" />
              <Tab label="GIF Generator (beta)" />
              <Tab label="WebP Generator (beta)" />
            </Tabs>

            {/* Image Preview Tab */}
            {previewTab === 0 && (
              <Box>
                {imageData ? (
                  <img
                    src={imageData}
                    alt="Rendered output"
                    width={608}
                    height={128}
                    style={{
                      imageRendering: "pixelated",
                      border: "1px solid #000",
                    }}
                  />
                ) : (
                  <Skeleton width={608} height={128} />
                )}
                <Box
                  sx={{
                    mt: 2,
                    position: "sticky",
                    bottom: 0,
                    backgroundColor: "background.paper",
                    py: 1,
                  }}
                >
                  <ButtonGroup>
                    <Button
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyImage}
                      disabled={!imageData}
                    >
                      Copy Image
                    </Button>
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      disabled={!imageData}
                    >
                      Download Image
                    </Button>
                  </ButtonGroup>
                </Box>
              </Box>
            )}

            {/* GIF Preview Tab */}
            {previewTab === 1 && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {isGeneratingGif ? (
                  <>
                    <Skeleton variant="rectangular" width={608} height={128} />
                    <Box sx={{ width: "100%", mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={gifProgress}
                      />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {Math.round(gifProgress)}% - Processing frames...
                      </Typography>
                    </Box>
                  </>
                ) : generatedGif ? (
                  <>
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
                    <Box
                      sx={{
                        mt: 2,
                        position: "sticky",
                        bottom: 0,
                        backgroundColor: "background.paper",
                        py: 1,
                      }}
                    >
                      <ButtonGroup>
                        <Button
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = generatedGif;
                            link.download = "dialogue-animation.gif";
                            link.click();
                          }}
                        >
                          Download GIF
                        </Button>
                        <Button
                          startIcon={<ContentCopyIcon />}
                          onClick={handleCopyGif}
                        >
                          Copy GIF
                        </Button>
                        <Button
                          startIcon={<RefreshRounded />}
                          onClick={() => handleGenerateAnimation("gif")}
                        >
                          Regenerate GIF
                        </Button>
                      </ButtonGroup>
                    </Box>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => handleGenerateAnimation("gif")}
                    disabled={isGeneratingGif || !message}
                    sx={{ mt: 2 }}
                  >
                    Generate GIF
                  </Button>
                )}
              </Box>
            )}

            {/* WebP Preview Tab */}
            {previewTab === 2 && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {isGeneratingWebP ? (
                  <>
                    <Skeleton variant="rectangular" width={608} height={128} />
                    <Box sx={{ width: "100%", mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={gifProgress}
                      />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {Math.round(gifProgress)}% - Processing frames...
                      </Typography>
                    </Box>
                  </>
                ) : GeneratedWebP ? (
                  <>
                    <Image
                      src={GeneratedWebP}
                      alt="Generated WebP"
                      width={608}
                      height={128}
                      style={{
                        imageRendering: "pixelated",
                        border: "1px solid #000",
                      }}
                      unoptimized
                    />
                    <Box
                      sx={{
                        mt: 2,
                        position: "sticky",
                        bottom: 0,
                        backgroundColor: "background.paper",
                        py: 1,
                      }}
                    >
                      <ButtonGroup>
                        <Button
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = GeneratedWebP;
                            link.download = "dialogue-animation.webp";
                            link.click();
                          }}
                        >
                          Download WebP
                        </Button>
                        <Button
                          startIcon={<ContentCopyIcon />}
                          onClick={handleCopyWebP}
                        >
                          Copy WebP
                        </Button>
                        <Button
                          startIcon={<RefreshRounded />}
                          onClick={() => handleGenerateAnimation("webp")}
                        >
                          Regenerate WebP
                        </Button>
                      </ButtonGroup>
                    </Box>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => handleGenerateAnimation("webp")}
                    disabled={isGeneratingWebP || !message}
                    sx={{ mt: 2 }}
                  >
                    Generate WebP
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}

        <ContentContainer sx={contentContainerStyles}>
          <TwoColumnGrid>
            <CharacterColumn>
              {characterAccordions}
              {customAccordion}
            </CharacterColumn>

            <ControlsColumn>
              <TextField
                label="Message"
                multiline
                rows={5}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                fullWidth
                variant="outlined"
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={useMask}
                    onChange={handleMaskToggle}
                    color="primary"
                  />
                }
                label="Use Mask"
              />
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Font</InputLabel>
                <Select
                  value={selectedFont}
                  onChange={handleFontChange}
                  label="Font"
                >
                  {config.fonts.map((font) => (
                    <MenuItem key={font.name} value={font.name}>
                      {font.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {backgroundSelection}
            </ControlsColumn>
          </TwoColumnGrid>
          <OutputBox>
            <canvas
              ref={canvasRef}
              width={608}
              height={128}
              style={{ display: "none" }}
            />
          </OutputBox>
        </ContentContainer>

        <Modal
          isOpen={isErrorModalOpen}
          onClose={handleCloseError}
          title="Error"
          content={errorMessage}
          buttons={[
            {
              label: "Close",
              onClick: handleCloseError,
              variant: "contained",
            },
          ]}
        />
      </AppContainer>
    </Box>
  );
}
