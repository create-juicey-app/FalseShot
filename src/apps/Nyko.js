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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import { styled } from "@mui/system";
import Modal from "../components/Modal";
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
}));

const OutputBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
}));

const RenderedImage = styled("img")(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  cursor: "pointer",
  imageRendering: "pixelated",
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
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
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const offscreenCtxRef = useRef(null);
  const renderRef = useRef(null);
  const imageCache = useRef({});

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
        const font = new FontFace("Teerminus", "url(/fonts/terminus.ttf)");
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

  // Handle message input with line limit
  const handleMessageChange = useCallback((e) => {
    const text = e.target.value;
    const lines = text.split("\n");
    if (lines.length > 3) {
      setErrorMessage(
        "Your message is too long, only three lines of text can be rendered!"
      );
      setError(true);
      setIsErrorModalOpen(true);
    } else {
      setError(false);
      setErrorMessage("");
      setMessage(text);
      setIsDirty(true);
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
    setIsDirty(true);
  }, []);

  // Handle character selection
  const handleCharacterChange = useCallback(
    (event) => {
      const character = event.target.value;
      setSelectedCharacter(character);
      setExpression(
        config.characters.find((c) => c.name === character).expressions[0].name
      );
      setIsDirty(true);
    },
    [config]
  );

  // Handle background selection
  const handleBackgroundChange = useCallback(
    (event) => {
      const background = config.backgrounds.find(
        (b) => b.name === event.target.value
      );
      setSelectedBackground(background.name);
      setUseMask(background.useMask);
      setIsDirty(true);
    },
    [config]
  );

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

  // Render the output image
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
          "Failed to render image. Please try refreshing the page."
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
          loadImage(
            `/faces/${character.folder}/${
              character.expressions.find((e) => e.name === expression).file
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
        offscreenCtx.font = `28px ${terminusFont.family}`;
        offscreenCtx.fillStyle = "white";
        offscreenCtx.textAlign = "left";

        const maxWidth = offscreenCanvasRef.current.width - 144; // Leave space for the expression
        const lineHeight = 32;
        const maxLines = 3;
        const lines = message.split("\n");
        let y = 39;

        for (let i = 0; i < lines.length && i < maxLines; i++) {
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

        if (renderRef.current) {
          renderRef.current.src = canvasRef.current.toDataURL();
        } else {
          setErrorMessage(
            "Failed to update rendered image. Please try refreshing the page."
          );
          setError(true);
        }
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
  ]);

  // Handle image download
  const handleDownload = useCallback(() => {
    if (renderRef.current) {
      const link = document.createElement("a");
      link.href = renderRef.current.src;
      link.download = "character-dialogue.png";
      link.click();
    } else {
      console.error("Render reference is not available");
      setErrorMessage("Failed to download image. Please try again.");
      setError(true);
    }
  }, []);

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
          <ImageList cols={5} gap={8}>
            {character.expressions.map((expr) => (
              <ImageListItem key={expr.name}>
                <Tooltip title={expr.name}>
                  <Box
                    component="img"
                    src={`/faces/${character.folder}/${expr.file}`}
                    alt={expr.name}
                    onClick={() => handleExpressionChange(expr.name)}
                    sx={{
                      width: "50px",
                      height: "50px",
                      border:
                        expression === expr.name
                          ? "2px solid"
                          : "2px solid transparent",
                      borderColor:
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
              </ImageListItem>
            ))}
          </ImageList>
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
              imageRendering: "pixelated",
              border: "1px solid #000", // Add a border to make sure the canvas is visible
            }}
          ></canvas>
        </Box>
        <RenderedImage
          ref={renderRef}
          alt="Rendered output"
          style={{ display: "none" }} // Hide this image as we're using it for download only
        />
        <DownloadButton
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download Image
        </DownloadButton>

        {/* Main Content */}
        <ContentContainer>
          <InterfaceBox>
            <Box mb={2}>
              <Typography variant="h6" component="label" htmlFor="message">
                Message
              </Typography>
              <TextField
                id="message"
                placeholder="What's the character going to say?"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={message}
                onChange={handleMessageChange}
                sx={{ mt: 1 }}
                inputProps={{
                  maxLength: 150,
                }}
              />
            </Box>

            {/* Character Selection */}
            <Box mt={2}>
              <FormControl fullWidth>
                <InputLabel id="character-select-label">Character</InputLabel>
                <Select
                  labelId="character-select-label"
                  id="character-select"
                  value={selectedCharacter}
                  label="Character"
                  onChange={handleCharacterChange}
                >
                  {config.characters.map((char) => (
                    <MenuItem key={char.name} value={char.name}>
                      {char.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Background Selection */}
            <Box mt={2}>
              <FormControl fullWidth>
                <InputLabel id="background-select-label">Background</InputLabel>
                <Select
                  labelId="background-select-label"
                  id="background-select"
                  value={selectedBackground}
                  label="Background"
                  onChange={handleBackgroundChange}
                >
                  {config.backgrounds.map((bg) => (
                    <MenuItem key={bg.name} value={bg.name}>
                      {bg.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

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
            <Box mt={4}>
              <Typography variant="h6">Expression</Typography>
              {expressionButtons}
            </Box>
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
