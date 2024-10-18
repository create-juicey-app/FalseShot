// apps/imageViewer.js
import React from "react";
import { Box, Typography, Button } from "@mui/material";

const ImageViewer = ({ filePath }) => {
  return (
    <Box
      sx={{
        position: "relative",
        textAlign: "center",
        bgcolor: "background.paper",
        p: 2,
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
          href={`/api/filesystem/download?filePath=${encodeURIComponent(
            filePath
          )}`}
          target="_blank"
        >
          Download
        </Button>
      </Box>
    </Box>
  );
};

export default ImageViewer;
