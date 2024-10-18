// src/App.js
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ImageList,
  ImageListItem,
  Paper,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import { styled } from "@mui/system";

// Styled Components
const AppContainer = styled(Box)(({ theme }) => ({
  fontFamily: "'Terminus', monospace",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
}));

const Header = styled(Box)(({ theme }) => ({
  backgroundColor: "#282c34",
  padding: theme.spacing(2),
  color: "white",
  textAlign: "center",
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  overflow: "hidden",
}));

const Sidebar = styled(Paper)(({ theme }) => ({
  width: "250px",
  padding: theme.spacing(2),
  backgroundColor: "#f5f5f5",
  overflowY: "auto",
}));

const InterfaceBox = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "auto",
}));

const OutputBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "#eaeaea",
  textAlign: "center",
}));

const RenderedImage = styled("img")(({ theme }) => ({
  border: "1px solid #ccc",
  cursor: "pointer",
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

function App() {
  const [message, setMessage] = useState("");
  const [expression, setExpression] = useState("normal");
  const [error, setError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const canvasRef = useRef(null);
  const renderRef = useRef(null);

  // Define available expressions
  const expressions = {
    Niko: [
      "normal",
      "niko2",
      "niko3",
      "niko4",
      "niko5",
      "niko6",
      "disgusted",
      "distressed",
      "distressed2",
      "distressed_talk",
      "shock",
      "shocked",
      "what",
      "what2",
      "wtf",
      "wtf2",
      "yawn",
      "eyeclosed",
      "eyeclosed_sigh",
      "sunglasses",
      "popcorn",
      "smile",
      "owo",
      "83c",
      "owoc",
      "uwu",
      "x3",
      "wink",
      "winkc",
      "winkp",
      "derp",
      "derp_flat",
      "speak",
      "pancakes",
      "surprise",
      "shy",
      "blush",
      "blushier",
      "oof",
      "ouch",
      "thinking",
      "fingerguns",
      "gasmask",
      "teary",
      "distressed_cry",
      "crying",
      "wipe_tears",
      "upset",
      "upset_meow",
      "upset2",
      "really",
      "rage",
      "creepypasta",
      "xwx",
    ],
    "World Machine": ["wm-normal"],
    Other: [
      "rqst_other_sonicastle",
      "rqst_other_fnfxtf2",
      "rqst_other_baseball",
    ],
  };

  // Handle message input with line limit
  const handleMessageChange = (e) => {
    const text = e.target.value;
    const lines = text.split("\n");
    if (lines.length > 3) {
      setError(
        "Your message is too long, only three lines of text can be rendered!"
      );
    } else {
      setError("");
      setMessage(text);
    }
  };

  // Toggle category expansion
  const handleAccordionChange = (category) => (event, isExpanded) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: isExpanded,
    }));
  };

  // Handle expression selection
  const handleExpressionChange = (expr) => {
    setExpression(expr);
  };

  // Render the output image whenever message or expression changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const background = new Image();
    const expressionImg = new Image();

    background.src = "/images/niko-background.png";
    expressionImg.src = `/images/faces/${expression}.png`;

    background.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      expressionImg.onload = () => {
        ctx.drawImage(expressionImg, 0, 0, canvas.width, canvas.height);

        // Text rendering
        ctx.font = "16px Terminus";
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        const lines = message.split("\n");
        lines.forEach((line, index) => {
          ctx.fillText(line, 10, 30 + index * 20);
        });

        // Update the rendered image
        const dataURL = canvas.toDataURL();
        renderRef.current.src = dataURL;
      };
    };

    // Error handling for image loading
    background.onerror = () => {
      console.error("Failed to load background image.");
      alert("Failed to load background image.");
    };
    expressionImg.onerror = () => {
      console.error(`Failed to load expression image: ${expression}.png`);
      alert("Failed to load selected expression image.");
    };
  }, [message, expression]);

  // Handle image download
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = renderRef.current.src;
    link.download = "niko-dialogue.png";
    link.click();
  };

  return (
    <AppContainer>
      {/* Header */}
      <Header>
        <Typography variant="h4">NikoMaker - Niko died for our suns</Typography>
      </Header>

      {/* Main Content */}
      <ContentContainer>
        {/* Left Sidebar */}
        <Sidebar elevation={3}>
          <Typography variant="h6">Welcome to NikoMaker!</Typography>
          <Typography variant="body1" paragraph>
            This tool allows you to quickly create an image of Niko (the main
            character of{" "}
            <a
              href="https://store.steampowered.com/app/420530/OneShot/"
              target="_blank"
              rel="noopener noreferrer"
            >
              OneShot
            </a>
            ) saying whatever you like, with any expression from the game!
          </Typography>
          <Typography variant="body2" paragraph>
            Hover over an element to get more information on it.
          </Typography>
          <Typography variant="h6">Quick Basics</Typography>
          <Typography variant="body2" paragraph>
            You need to select Niko's expression and write a message to display
            on the image.
          </Typography>
          <Typography variant="body2" paragraph>
            Once you've done that, you can copy or save the created image by
            clicking the download button below.
          </Typography>
        </Sidebar>

        {/* Interface */}
        <InterfaceBox>
          <Box mb={2}>
            <Typography variant="h6" component="label" htmlFor="message">
              Message
            </Typography>
            {error && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}
            <TextField
              id="message"
              placeholder="What's Niko going to say?"
              multiline
              minRows={3}
              maxRows={3}
              fullWidth
              variant="outlined"
              value={message}
              onChange={handleMessageChange}
              sx={{ mt: 1 }}
              inputProps={{ maxLength: 150 }}
            />
          </Box>

          {/* Expression Selection */}
          <Box mt={4}>
            <Typography variant="h6">Expression</Typography>
            {Object.keys(expressions).map((category) => (
              <Accordion
                key={category}
                expanded={expandedCategories[category] || false}
                onChange={handleAccordionChange(category)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{category}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ImageList cols={5} gap={8}>
                    {expressions[category].map((expr) => (
                      <ImageListItem key={expr}>
                        <Tooltip title={expr}>
                          <Box
                            component="img"
                            src={`/images/faces/${expr}.png`}
                            alt={expr}
                            onClick={() => handleExpressionChange(expr)}
                            sx={{
                              width: "50px",
                              height: "50px",
                              border:
                                expression === expr
                                  ? "2px solid blue"
                                  : "2px solid transparent",
                              borderRadius: "5px",
                              cursor: "pointer",
                              "&:hover": {
                                borderColor: "primary.main",
                              },
                            }}
                          />
                        </Tooltip>
                      </ImageListItem>
                    ))}
                  </ImageList>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </InterfaceBox>

        {/* Right Sidebar */}
        <Sidebar elevation={3}>
          <Typography variant="h6">Quick Help</Typography>
          <Typography variant="body2" paragraph>
            Hover over a control for details.
          </Typography>
          {/* Additional help content can be added here */}
        </Sidebar>
      </ContentContainer>

      {/* Output Section */}
      <OutputBox>
        <Box>
          <canvas
            ref={canvasRef}
            width="608"
            height="128"
            style={{ display: "none" }}
          ></canvas>
          <RenderedImage
            ref={renderRef}
            width="608"
            height="128"
            src="/images/niko-background.png"
            alt="Niko Output"
            onContextMenu={(e) => e.preventDefault()} // Prevent default context menu
          />
        </Box>
        <DownloadButton
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download Image
        </DownloadButton>
      </OutputBox>
    </AppContainer>
  );
}

export default App;
