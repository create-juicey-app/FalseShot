import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Button,
  Grid,
  Paper,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  Typography,
  CircularProgress,
  Menu,
  Slider,
  LinearProgress,
} from "@mui/material";
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CreateNewFolder as CreateNewFolderIcon,
  NoteAdd as NoteAddIcon,
  FileCopy as FileCopyIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  ContentPaste as ContentPasteIcon,
  Edit as EditIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from "@mui/icons-material";
import axios from "axios";
import path from "path";
// New ImageViewer component
const ImageViewer = ({ imagePath, onClose }) => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(
          `/api/filesystem/read?filePath=${encodeURIComponent(imagePath)}`,
          { responseType: "json" }
        );
        setImageData(response.data);
      } catch (err) {
        console.error("Error fetching image:", err);
        setError("Failed to load image");
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, [imagePath]);

  const handleZoomChange = (_, newValue) => setZoom(newValue);
  const handleRotate = (direction) => {
    setRotation((prev) => {
      const newRotation = (prev + direction) % 360;
      return newRotation < 0 ? newRotation + 360 : newRotation;
    });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <Dialog open={true} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Image Viewer
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : imageData ? (
            <>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "60vh",
                  overflow: "hidden",
                }}
              >
                <img
                  ref={imageRef}
                  src={`data:${imageData.mimeType};base64,${imageData.data}`}
                  alt="Viewed image"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transform: `translate(${position.x}px, ${
                      position.y
                    }px) scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: "transform 0.3s ease-out",
                    cursor: isDragging ? "grabbing" : "grab",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                  }}
                  onMouseDown={handleMouseDown}
                  draggable="false"
                />
              </Box>
              <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
                <Grid item>
                  <IconButton onClick={() => handleRotate(-90)}>
                    <RotateLeftIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <ZoomOutIcon />
                </Grid>
                <Grid item xs>
                  <Slider
                    value={zoom}
                    onChange={handleZoomChange}
                    min={10}
                    max={400}
                  />
                </Grid>
                <Grid item>
                  <ZoomInIcon />
                </Grid>
                <Grid item>
                  <IconButton onClick={() => handleRotate(90)}>
                    <RotateRightIcon />
                  </IconButton>
                </Grid>
              </Grid>
              <Paper elevation={3} sx={{ p: 2, mt: 2, width: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Image Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>File Path:</strong> {imageData.filePath}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>MIME Type:</strong> {imageData.mimeType}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>File Size:</strong>{" "}
                      {((imageData.data.length * 3) / 4 / 1024).toFixed(2)} KB
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </>
          ) : (
            <Typography>No image data available</Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const Documents = ({ initialPath = "/", windowManagerRef }) => {
  // State variables
  const [currentDir, setCurrentDir] = useState("/"); // Will set to initialPath on load
  const [items, setItems] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedItems, setSelectedItems] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const [openCreateFolderDialog, setOpenCreateFolderDialog] = useState(false);
  const [openCreateFileDialog, setOpenCreateFileDialog] = useState(false);
  const [createName, setCreateName] = useState("");
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  const [copyDestination, setCopyDestination] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [breadcrumb, setBreadcrumb] = useState(["/"]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [renameDialog, setRenameDialog] = useState({
    open: false,
    item: null,
  });
  const [newName, setNewName] = useState("");
  const [clipboardItems, setClipboardItems] = useState([]);
  // Context Menu State
  const [contextMenu, setContextMenu] = useState(null);
  const [contextItem, setContextItem] = useState(null);

  const itemsRef = useRef([]);

  // Fetch directory contents
  const fetchDirectory = async (dir = "/") => {
    setLoading(true);
    try {
      const res = await axios.get("/api/filesystem/list", { params: { dir } });
      setCurrentDir(res.data.path);
      setItems(res.data.items);
      setSelectedItems([]);
      // Update breadcrumb
      if (res.data.path === "/") {
        setBreadcrumb(["/"]);
      } else {
        const pathSegments = res.data.path.split("/").filter(Boolean);
        setBreadcrumb(["/", ...pathSegments]);
      }
      itemsRef.current = res.data.items;
    } catch (error) {
      console.error(error);
      showSnackbar(
        error.response?.data?.error || "Error fetching directory",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set the initial directory
    const sanitizedPath = initialPath.startsWith("/")
      ? initialPath.slice(1)
      : initialPath;
    fetchDirectory(sanitizedPath);
  }, [initialPath]);

  // Handle navigation to a directory
  const navigateTo = (dir) => {
    fetchDirectory(dir);
  };

  // Handle navigation back
  const navigateBack = () => {
    if (breadcrumb.length <= 1) return; // Already at root

    const newBreadcrumb = [...breadcrumb];
    newBreadcrumb.pop(); // Remove the last segment

    const previousPath =
      newBreadcrumb.length === 1 ? "/" : `/${newBreadcrumb.slice(1).join("/")}`;
    setBreadcrumb(newBreadcrumb);
    fetchDirectory(previousPath);
  };

  // Handle item selection with Shift and Ctrl/Cmd
  const handleSelect = (event, item, index) => {
    const isSelected = selectedItems.includes(item.name);

    if (event.shiftKey && lastSelectedIndex !== null) {
      // Shift+Click: Select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const range = items.slice(start, end + 1).map((i) => i.name);
      setSelectedItems((prev) => Array.from(new Set([...prev, ...range])));
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+Click: Toggle selection
      if (isSelected) {
        setSelectedItems((prev) => prev.filter((name) => name !== item.name));
      } else {
        setSelectedItems((prev) => [...prev, item.name]);
      }
      setLastSelectedIndex(index);
    } else {
      // Regular Click: Select or Deselect
      if (isSelected && selectedItems.length === 1) {
        // If the item is already the only selected, deselect it
        setSelectedItems([]);
        setLastSelectedIndex(null);
      } else if (isSelected) {
        // If multiple items are selected and clicked item is one of them, deselect it
        setSelectedItems((prev) => prev.filter((name) => name !== item.name));
        setLastSelectedIndex(index);
      } else {
        // Select only the clicked item
        setSelectedItems([item.name]);
        setLastSelectedIndex(index);
      }
    }
  };

  // Handle creating new folder
  const handleCreateFolder = async () => {
    if (!createName.trim()) {
      showSnackbar("Folder name cannot be empty", "error");
      return;
    }

    try {
      await axios.post("/api/filesystem/create", {
        dir: currentDir,
        name: createName.trim(),
        type: "folder",
      });
      showSnackbar("Folder created successfully", "success");
      setOpenCreateFolderDialog(false);
      setCreateName("");
      fetchDirectory(currentDir);
    } catch (error) {
      console.error(error);
      showSnackbar(
        error.response?.data?.error || "Error creating folder",
        "error"
      );
    }
  };

  // Handle creating new file
  const handleCreateFile = async () => {
    if (!createName.trim()) {
      showSnackbar("File name cannot be empty", "error");
      return;
    }

    try {
      await axios.post("/api/filesystem/create", {
        dir: currentDir,
        name: createName.trim(),
        type: "file",
      });
      showSnackbar("File created successfully", "success");
      setOpenCreateFileDialog(false);
      setCreateName("");
      fetchDirectory(currentDir);
    } catch (error) {
      console.error(error);
      showSnackbar(
        error.response?.data?.error || "Error creating file",
        "error"
      );
    }
  };
  const handleRename = async () => {
    if (!newName.trim()) {
      showSnackbar("New name cannot be empty", "error");
      return;
    }

    try {
      await axios.post("/api/filesystem/rename", {
        oldPath: `${currentDir}/${renameDialog.item.name}`,
        newPath: `${currentDir}/${newName.trim()}`,
      });
      showSnackbar("Item renamed successfully", "success");
      setRenameDialog({ open: false, item: null });
      setNewName("");
      fetchDirectory(currentDir);
    } catch (error) {
      console.error(error);
      showSnackbar(
        error.response?.data?.error || "Error renaming item",
        "error"
      );
    }
  };

  // Handle deleting selected items
  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      showSnackbar("No items selected for deletion", "error");
      return;
    }

    if (!window.confirm("Are you sure you want to delete the selected items?"))
      return;

    try {
      await Promise.all(
        selectedItems.map((name) =>
          axios.delete("/api/filesystem/delete", {
            data: { path: `${currentDir}/${name}` },
          })
        )
      );
      showSnackbar("Selected items deleted successfully", "success");
      fetchDirectory(currentDir);
    } catch (error) {
      console.error(error);
      showSnackbar(
        error.response?.data?.error || "Error deleting items",
        "error"
      );
    }
  };

  // Handle copying selected items
  const handleCopy = async () => {
    if (selectedItems.length === 0) {
      showSnackbar("No items selected for copying", "error");
      return;
    }

    if (!copyDestination.trim()) {
      showSnackbar("Destination path cannot be empty", "error");
      return;
    }

    try {
      await Promise.all(
        selectedItems.map((name) =>
          axios.post("/api/filesystem/copy", {
            source: `${currentDir}/${name}`,
            destination: copyDestination.trim(),
          })
        )
      );
      showSnackbar("Selected items copied successfully", "success");
      setOpenCopyDialog(false);
      setCopyDestination("");
      fetchDirectory(currentDir);
    } catch (error) {
      console.error(error);
      showSnackbar(
        error.response?.data?.error || "Error copying items",
        "error"
      );
    }
  };

  // Handle right-click context menu
  const handleContextMenu = (event, item, index) => {
    event.preventDefault();
    setContextItem(item);
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            index: index,
          }
        : null
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextItem(null);
  };

  // Handle actions from context menu
  const handleContextAction = (action) => {
    console.log(`Action: ${action}`);

    switch (action) {
      case "open":
        if (contextItem.isDirectory) {
          navigateTo(`${currentDir}/${contextItem.name}`);
        } else if (isImageFile(contextItem.name)) {
          setViewingImage(`${currentDir}/${contextItem.name}`);
        } else {
          console.log("File type not supported for viewing");
        }
        break;

      case "copy":
        handleCopyToClipboard();
        break;
      case "paste":
        handlePaste();
        break;
      case "delete":
        handleDelete();
        break;
      case "rename":
        setRenameDialog({ open: true, item: contextItem });
        setNewName(contextItem.name);
        break;
      default:
        showSnackbar("Action not supported", "error");
    }
    handleCloseContextMenu();
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle item double-click (navigate into directory or open image)
  // apps/Documents.js
  const handleItemDoubleClick = (item) => {
    if (item.isDirectory) {
      navigateTo(`${currentDir}/${item.name}`);
    } else if (isImageFile(item.name)) {
      setViewingImage(`${currentDir}/${item.name}`);
    } else {
      // Handle other file types if needed
      console.log("File type not supported for viewing");
    }
  };

  const handleCopyToClipboard = () => {
    const itemsToCopy = selectedItems.map((name) => `${currentDir}/${name}`);
    setClipboardItems(itemsToCopy);
    navigator.clipboard
      .writeText(itemsToCopy.join("\n"))
      .then(() => showSnackbar("Items copied to clipboard", "success"))
      .catch((err) => showSnackbar("Failed to copy to clipboard", "error"));
  };

  // Handle paste
  const handlePaste = async () => {
    if (clipboardItems.length === 0) {
      showSnackbar("Nothing to paste", "info");
      return;
    }

    try {
      await Promise.all(
        clipboardItems.map((sourcePath) =>
          axios.post("/api/filesystem/copy", {
            source: sourcePath,
            destination: currentDir,
          })
        )
      );
      showSnackbar("Items pasted successfully", "success");
      fetchDirectory(currentDir);
    } catch (error) {
      console.error(error);
      showSnackbar(
        error.response?.data?.error || "Error pasting items",
        "error"
      );
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (event) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case "c":
          event.preventDefault();
          handleCopyToClipboard();
          break;
        case "v":
          event.preventDefault();
          handlePaste();
          break;
        case "x":
          event.preventDefault();
          handleCopyToClipboard();
          handleDelete();
          break;
        default:
          break;
      }
    } else if (event.key === "Delete") {
      handleDelete();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItems]);

  /**
   * Helper function to get the basename of a path
   * @param {string} pathStr - The path string
   * @returns {string} - The basename of the path
   */
  const getBaseName = (pathStr) => {
    if (pathStr === "/") return "/";
    const segments = pathStr.split("/").filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : "/";
  };

  // Drag and Drop Handlers
  const handleDragStart = (event, item, index) => {
    let draggedItems = [];
    if (selectedItems.includes(item.name)) {
      // If the dragged item is selected, drag all selected items
      draggedItems = selectedItems;
    } else {
      // Else, drag only the current item
      draggedItems = [item.name];
      setSelectedItems([item.name]); // Select the dragged item
    }
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify(draggedItems)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  /**
   * Handles the drop event for both folder items and breadcrumb segments.
   * @param {Event} event - The drop event.
   * @param {string} destinationPath - The path where items are to be moved.
   */
  const handleDrop = async (event, destinationPath) => {
    event.preventDefault();
    try {
      const data = event.dataTransfer.getData("application/json");
      if (!data) {
        showSnackbar("No items were dragged.", "error");
        return;
      }
      const draggedItems = JSON.parse(data);

      // Get the basename of the destination path
      const baseName = getBaseName(destinationPath);

      // Prevent moving a folder into itself or its subdirectories
      if (draggedItems.includes(baseName)) {
        showSnackbar(
          "Cannot move a folder into itself or its subdirectories.",
          "error"
        );
        return;
      }

      // Perform the move operation for each dragged item
      await Promise.all(
        draggedItems.map((name) =>
          axios.post("/api/filesystem/move", {
            source: `${currentDir}/${name}`,
            destination: destinationPath, // Correct destination path
          })
        )
      );
      showSnackbar("Items moved successfully", "success");
      fetchDirectory(currentDir);
    } catch (error) {
      console.error(error);
      showSnackbar(
        error.response?.data?.error || "Error moving items",
        "error"
      );
    } finally {
      // Reset drag over state
      setContextMenu(null);
    }
  };

  // Handle file uploads with progress tracking
  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      showSnackbar("No files selected for upload.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("dir", currentDir);

    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    try {
      setUploading(true);
      setUploadProgress(0); // Reset progress

      const res = await axios.post("/api/filesystem/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      showSnackbar("Files uploaded successfully", "success");
      fetchDirectory(currentDir);
    } catch (error) {
      console.error(error);
      showSnackbar(
        error.response?.data?.error || "Error uploading files",
        "error"
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Helper function to check if a file is an image based on extension
  const isImageFile = (filename) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  };

  return (
    <Box sx={{ display: "flex", height: "76vh" }}>
      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          overflow: "auto",
        }}
      >
        {/* Top Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Tooltip title="Go Back">
            <span>
              <IconButton
                edge="start"
                color="inherit"
                onClick={navigateBack}
                disabled={breadcrumb.length <= 1}
              >
                <ArrowBackIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Box
            sx={{
              padding: 2,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {breadcrumb.map((dir, index) => {
              const pathSegments = breadcrumb.slice(0, index + 1);
              const path =
                pathSegments.length === 1
                  ? "/"
                  : "/" + pathSegments.slice(1).join("/");
              const displayName = dir === "/" ? "C:" : dir;
              const isLast = index === breadcrumb.length - 1;

              return (
                <React.Fragment key={index}>
                  <Button
                    variant="text"
                    onClick={() => fetchDirectory(path)}
                    disabled={isLast}
                    onDragOver={(e) => handleDragOver(e)}
                    onDrop={(e) => handleDrop(e, path)}
                    sx={{
                      backgroundColor: "transparent",
                    }}
                  >
                    {displayName}
                  </Button>
                  {!isLast && <Typography>/</Typography>}
                </React.Fragment>
              );
            })}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
            <Tooltip title="Refresh">
              <IconButton
                color="inherit"
                onClick={() => fetchDirectory(currentDir)}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Create Folder">
              <IconButton
                color="inherit"
                onClick={() => setOpenCreateFolderDialog(true)}
              >
                <CreateNewFolderIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Create File">
              <IconButton
                color="inherit"
                onClick={() => setOpenCreateFileDialog(true)}
              >
                <NoteAddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Upload">
              <IconButton color="inherit" component="label">
                <UploadIcon />
                <input type="file" hidden multiple onChange={handleUpload} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy" placement="bottom">
              <span>
                <IconButton
                  color="inherit"
                  onClick={() => setOpenCopyDialog(true)}
                  disabled={selectedItems.length === 0}
                >
                  <FileCopyIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Toggle View" placement="bottom">
              <IconButton
                color="inherit"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
              >
                {viewMode === "grid" ? <ViewListIcon /> : <ViewModuleIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" placement="bottom">
              <span>
                <IconButton
                  color="inherit"
                  onClick={handleDelete}
                  disabled={selectedItems.length === 0}
                >
                  <DeleteIcon />
                </IconButton>
                <Tooltip title="Paste">
                  <span>
                    <IconButton
                      color="inherit"
                      onClick={handlePaste}
                      disabled={clipboardItems.length === 0}
                    >
                      <ContentPasteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Upload Progress Bar */}
        {uploading && (
          <Box sx={{ width: "100%", mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Uploading: {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {/* File/Folder Listing */}
        <Box sx={{ padding: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : viewMode === "grid" ? (
            <Grid container spacing={2}>
              {items.map((item, index) => (
                <Grid item xs={6} sm={4} md={3} key={item.name}>
                  <Paper
                    elevation={selectedItems.includes(item.name) ? 4 : 1}
                    sx={{
                      padding: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: selectedItems.includes(item.name)
                        ? "primary.light"
                        : "background.paper",
                      position: "relative",
                      height: "150px", // Increased height for thumbnail
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "text.primary",
                      border: selectedItems.includes(item.name)
                        ? "2px solid #1976d2"
                        : "none",
                      "&:hover": {
                        backgroundColor: "grey.100",
                      },
                    }}
                    onClick={(e) => handleSelect(e, item, index)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item, index)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item, index)}
                    onDragOver={
                      item.isDirectory ? (e) => handleDragOver(e) : null
                    }
                    onDrop={
                      item.isDirectory
                        ? (e) => handleDrop(e, `${currentDir}/${item.name}`)
                        : null
                    }
                  >
                    {item.isDirectory ? (
                      <FolderIcon sx={{ fontSize: 50, color: "#FFD700" }} />
                    ) : isImageFile(item.name) ? (
                      <img
                        src={`/api/filesystem/thumbnail?filePath=${encodeURIComponent(
                          `${currentDir}/${item.name}`.replace(/^\/+/, "")
                        )}&size=100`}
                        alt={item.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          marginBottom: 8,
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <FileIcon sx={{ fontSize: 50 }} />
                    )}
                    <Typography variant="subtitle1" noWrap>
                      {item.name}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
              {items.length === 0 && (
                <Typography variant="body1">This folder is empty.</Typography>
              )}
            </Grid>
          ) : (
            <Box>
              {/* List Header */}
              <Box
                sx={{
                  display: "flex",
                  padding: "8px 16px",
                  backgroundColor: "grey.200",
                  alignItems: "center",
                  fontWeight: "bold",
                }}
              >
                <Typography sx={{ flex: 2 }}>Name</Typography>
                <Typography sx={{ flex: 2 }}>Size</Typography>
                <Typography sx={{ flex: 2 }}>Type</Typography>
                <Typography sx={{ flex: 3 }}>Dimensions</Typography>
              </Box>
              {/* List Items */}
              {items.map((item, index) => (
                <Box
                  key={item.name}
                  sx={{
                    display: "flex",
                    padding: "8px 16px",
                    backgroundColor: selectedItems.includes(item.name)
                      ? "primary.light"
                      : "background.paper",
                    alignItems: "center",
                    cursor: "pointer",
                    borderBottom: "1px solid #e0e0e0",
                    "&:hover": {
                      backgroundColor: "grey.100",
                    },
                  }}
                  onClick={(e) => handleSelect(e, item, index)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  onContextMenu={(e) => handleContextMenu(e, item, index)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item, index)}
                  onDragOver={
                    item.isDirectory ? (e) => handleDragOver(e) : null
                  }
                  onDrop={
                    item.isDirectory
                      ? (e) => handleDrop(e, `${currentDir}/${item.name}`)
                      : null
                  }
                >
                  <Box sx={{ flex: 2, display: "flex", alignItems: "center" }}>
                    {item.isDirectory ? (
                      <FolderIcon sx={{ marginRight: 1 }} />
                    ) : isImageFile(item.name) ? (
                      <img
                        src={`/api/filesystem/thumbnail?filePath=${encodeURIComponent(
                          `${currentDir}/${item.name}`.replace(/^\/+/, "")
                        )}&size=40`}
                        alt={item.name}
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          marginRight: 8,
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <FileIcon sx={{ marginRight: 1 }} />
                    )}
                    <Typography noWrap>{item.name}</Typography>
                  </Box>
                  <Box sx={{ flex: 2 }}>
                    <Typography>
                      {item.size ? `${item.size} KB` : "--"}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 2 }}>
                    <Typography>
                      {item.isDirectory
                        ? "Folder"
                        : item.format
                        ? item.format.toUpperCase()
                        : "File"}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 3 }}>
                    <Typography>
                      {item.isDirectory
                        ? "--"
                        : item.width && item.height
                        ? `${item.width}x${item.height}`
                        : "--"}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {items.length === 0 && (
                <Typography variant="body1" sx={{ padding: 2 }}>
                  This folder is empty.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
      {viewingImage && (
        <ImageViewer
          imagePath={viewingImage}
          onClose={() => setViewingImage(null)}
        />
      )}
      <Dialog
        open={renameDialog.open}
        onClose={() => setRenameDialog({ open: false, item: null })}
      >
        <DialogTitle>Rename Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialog({ open: false, item: null })}>
            Cancel
          </Button>
          <Button onClick={handleRename} variant="contained" color="primary">
            Rename
          </Button>
        </DialogActions>
      </Dialog>
      {/* Create Folder Dialog */}
      <Dialog
        open={openCreateFolderDialog}
        onClose={() => setOpenCreateFolderDialog(false)}
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateFolderDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateFolder}
            variant="contained"
            color="primary"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create File Dialog */}
      <Dialog
        open={openCreateFileDialog}
        onClose={() => setOpenCreateFileDialog(false)}
      >
        <DialogTitle>Create New File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            helperText="Include the file extension (e.g., example.txt)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateFileDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateFile}
            variant="contained"
            color="primary"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Dialog */}
      <Dialog open={openCopyDialog} onClose={() => setOpenCopyDialog(false)}>
        <DialogTitle>Copy Selected Items</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Destination Path:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Destination"
            fullWidth
            value={copyDestination}
            onChange={(e) => setCopyDestination(e.target.value)}
            helperText="Enter the destination path where the items will be copied."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCopyDialog(false)}>Cancel</Button>
          <Button onClick={handleCopy} variant="contained" color="primary">
            Copy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleContextAction("open")}>
          <FolderIcon fontSize="small" style={{ marginRight: 8 }} />
          <Typography variant="inherit">Open</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleContextAction("copy")}>
          <FileCopyIcon fontSize="small" style={{ marginRight: 8 }} />
          <Typography variant="inherit">Copy</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleContextAction("paste")}>
          <ContentPasteIcon fontSize="small" style={{ marginRight: 8 }} />
          <Typography variant="inherit">Paste</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleContextAction("delete")}>
          <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
          <Typography variant="inherit">Delete</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleContextAction("rename")}>
          <EditIcon fontSize="small" style={{ marginRight: 8 }} />
          <Typography variant="inherit">Rename</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Documents;
