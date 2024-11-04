import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  LinearProgress,
} from "@mui/material";
import { CloudUpload, Download } from "@mui/icons-material";

const VideoDownloader = () => {
  const [url, setUrl] = useState("");
  const [targetSize, setTargetSize] = useState("original");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  // Update the useEffect hook in your VideoDownloader component
  useEffect(() => {
    let eventSource;

    if (loading) {
      eventSource = new EventSource("/api/videodownloader/progress");

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setProgress(data.progress);
        setStatus(data.status);
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
        setLoading(false);
        setError("Lost connection to server");
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [loading]);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError("");
      setProgress(0);

      const response = await fetch("/api/videodownloader/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, targetSize }),
      });

      if (!response.ok) {
        throw new Error("Failed to download video");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "video.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(0);
      setStatus("");
    }
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      setError("");
      setProgress(0);

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("targetSize", targetSize);

      const response = await fetch("/api/videodownloader/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload video");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = uploadFile.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(0);
      setStatus("");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Video Downloader & Compressor
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube, Facebook, Vimeo, TikTok, or Twitter URL"
          disabled={loading}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Or upload your own video:
        </Typography>

        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUpload />}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          Upload Video
          <input
            type="file"
            hidden
            accept="video/*"
            onChange={(e) => setUploadFile(e.target.files[0])}
          />
        </Button>

        {uploadFile && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selected file: {uploadFile.name}
          </Typography>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Target Size</InputLabel>
          <Select
            value={targetSize}
            onChange={(e) => setTargetSize(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="original">Original Size</MenuItem>
            <MenuItem value="10">10 MB</MenuItem>
            <MenuItem value="25">25 MB</MenuItem>
            <MenuItem value="100">100 MB</MenuItem>
          </Select>
        </FormControl>

        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary" align="center">
              {status} ({Math.round(progress)}%)
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={url ? handleDownload : handleUpload}
            disabled={loading || (!url && !uploadFile)}
            startIcon={loading ? <CircularProgress size={20} /> : <Download />}
            fullWidth
          >
            {loading ? "Processing..." : url ? "Download" : "Process Upload"}
          </Button>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Supported platforms: YouTube, Facebook, Vimeo, TikTok, Twitter
      </Typography>
    </Paper>
  );
};

export default VideoDownloader;
