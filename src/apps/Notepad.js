import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  useTheme,
} from "@mui/material";
import {
  Save as SaveIcon,
  FolderOpen as OpenIcon,
  NightlightRound as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";

const TextEditor = () => {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("Untitled");
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
    const savedText = localStorage.getItem("editorText");
    if (savedText) {
      setText(savedText);
    }
  }, []);

  const handleTextChange = (event) => {
    setText(event.target.value);
    localStorage.setItem("editorText", event.target.value);
  };

  const handleSave = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showSnackbar("File saved successfully!");
  };

  const handleOpen = (event) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFileName(file.name.replace(".txt", ""));
        const reader = new FileReader();
        reader.onload = (e) => {
          setText(e.target.result);
          localStorage.setItem("editorText", e.target.result);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNewFile = () => {
    setText("");
    setFileName("Untitled");
    localStorage.removeItem("editorText");
    handleMenuClose();
    showSnackbar("New file created");
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {fileName} - Text Editor
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <OpenIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleSave}>
            <SaveIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleNewFile}>New File</MenuItem>
        <MenuItem onClick={handleOpen}>Open File</MenuItem>
      </Menu>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <TextField
          fullWidth
          multiline
          variant="outlined"
          value={text}
          onChange={handleTextChange}
          minRows={20}
          maxRows={Infinity}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontFamily: "monospace",
              fontSize: "1rem",
            },
          }}
        />
      </Container>
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Typography variant="body2" color="text.secondary">
          Characters: {text.length} | Words:{" "}
          {text.split(/\s+/).filter(Boolean).length}
        </Typography>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </>
  );
};

export default TextEditor;
