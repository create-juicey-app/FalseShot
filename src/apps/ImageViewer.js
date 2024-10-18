// apps/ImageViewer.js
import React from "react";
import { Box, Typography, Button } from "@mui/material";

const ImageViewer = ({ filePath }) => {
  if (!filePath) {
    return (
      <Box
        sx={{
          padding: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6">No Image Selected</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        textAlign: "center",
        bgcolor: "background.paper",
        p: 2,
        height: "100%",
        overflow: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Image Viewer
      </Typography>
      <Box
        component="img"
        src={`/api/filesystem/image?filePath=${encodeURIComponent(filePath)}`}
        alt={filePath}
        sx={{
          maxWidth: "100%",
          maxHeight: "80vh",
          borderRadius: 2,
        }}
      />
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          href={`/api/filesystem/download?filePath=${encodeURIComponent(filePath)}`}
          target="_blank"
        >
          Download
        </Button>
      </Box>
    </Box>
  );
};

export default ImageViewer;