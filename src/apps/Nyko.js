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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import UploadIcon from "@mui/icons-material/Upload";
import { styled } from "@mui/system";
import Modal from "../components/Modal";
import { keyframes } from "@mui/system"; // Add this import
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
  scale: "90%",
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
  4;
  const [imageData, setImageData] = useState(null);
  const [expandedBackground, setExpandedBackground] = useState(null);
  const [customExpressions, setCustomExpressions] = useState([]);
  const [selectedCustomExpression, setSelectedCustomExpression] =
    useState(null);
  const handleBackgroundAccordionChange = useCallback(
    (backgroundName) => (event, isExpanded) => {
      setExpandedBackground(isExpanded ? backgroundName : null);
    },
    []
  );

  const [fontSize, setFontSize] = useState(28); // Default font size
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const offscreenCtxRef = useRef(null);

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
        const font = new FontFace("Teerminus", "url(/fonts/Terminus.ttf)");
        await font.load();
        document.fonts.add(font);
        setTerminusFont(font);
      } catch (error) {
        console.error("Failed to load font:", error);
        setErrorMessage(
          "Failed to load custom font. Using system font instead."
        );
        setError(true);
      }
    };
    loadFont();
  }, []);

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
    const maxLines = 5; // Maximum number of lines
    const fontSize = 28; // Example: use dynamic fontSize state value here

    // Dynamically adjust maxLineLength based on font size
    let maxLineLength = Math.floor(30 * (30 / fontSize));

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
  }, []);

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
        const img = new Image();
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
        offscreenCtx.font = `${fontSize}px ${terminusFont.family}`;
        offscreenCtx.fillStyle = "white";
        offscreenCtx.textAlign = "left";

        const maxWidth = offscreenCanvasRef.current.width - 144; // Leave space for the expression
        const lineHeight = fontSize + 4; // Adjust line height based on font size
        const lines = message.split("\n");
        let y = fontSize + 11; // Adjust starting y position based on font size

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

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!config) {
    return <Typography>Error loading configuration</Typography>;
  }

  return (
    <AppContainer>
      {/* Output Section */}
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
              <img
                src={imageData}
                alt="Rendered output"
                style={{
                  imageRendering: "pixelated",
                  border: "1px solid #000",
                }}
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

        {/* Main Content */}
        <ContentContainer>
          <InterfaceBox>
            <Box mb={2}>
              <Typography variant="h5" component="label" htmlFor="message">
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
                inputProps={{ maxLength: 250 }}
                sx={{ mt: 1 }}
              />
            </Box>

            {/* Character Selection */}
            <Box mt={2}>
              <Typography variant="h5">Characters</Typography>
              {characterAccordions}
            </Box>
            <Box mt={2}>{customAccordion}</Box>
            {!selectedCustomExpression}
            {/* Background Selection */}
            {backgroundSelection}

            {/* Mask Toggle */}
            <Box mt={2}>
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

            {/* Expression Selection */}
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
