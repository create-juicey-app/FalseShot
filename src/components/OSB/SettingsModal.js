import React, { useState, useContext, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Slider,
  Select,
  MenuItem,
  IconButton,
  styled,
  Button,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Dialog as ConfirmDialog,
  DialogActions,
  DialogContent as ConfirmDialogContent,
  DialogTitle as ConfirmDialogTitle,
} from "@mui/material";
import Image from "next/image";
import {
  Palette,
  Wallpaper,
  Dashboard,
  Animation,
  DarkMode,
  LightMode,
  Close,
  WallpaperRounded,
  Texture,
  FormatColorFill,
  Code,
  Download,
  DeleteForever,
} from "@mui/icons-material";
import { ThemeContext } from "./Theme";
import TabPanel from "./TabPanel";
import { usePattern } from "./BackgroundPattern";
import { useBackground } from './Background';


const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 51,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& + .MuiSwitch-track": {
        backgroundColor: "#333",
        opacity: 1,
      },
      "& .MuiSwitch-thumb": {
        backgroundColor: "#1a1a1a",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#fbd38d",
    width: 32,
    height: 32,
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#bdbdbd",
    borderRadius: 20,
  },
}));

const StyledIcon = styled("div")({
  position: "absolute",
  top: "8px",
  left: "1px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "inherit",
  zIndex: 1,
});

const BackgroundModeCard = styled(Card)(({ theme, active }) => ({
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  transform: active ? 'translateY(-4px)' : 'none',
  boxShadow: active ? theme.shadows[8] : theme.shadows[1],
  border: active ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const ModeIcon = styled(Box)(({ theme }) => ({
  fontSize: '2rem',
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    fontSize: '2rem',
  },
}));

const InfoSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
}));

const SettingsModal = ({ open, onClose }) => {
  const [tab, setTab] = useState(0);
  const [showReloadPrompt, setShowReloadPrompt] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    gitBranch: 'Unknown',
    version: '1.0.0',
    userAgent: '',
    platform: '',
    timestamp: new Date().toISOString(),
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const {
    currentTheme,
    setCurrentTheme,
    isDarkMode,
    setIsDarkMode,
    taskbarSettings,
    setTaskbarSettings,
    animationSpeed,
    setAnimationSpeed,
    themes,
    getCurrentTheme,
    debugMode,
    setDebugMode,
  } = useContext(ThemeContext);

  // Use the custom hook instead of direct context access
  const { 
    mode, 
    setMode, 
    currentPattern,
    setCurrentPattern,
    patterns,
    backgroundImage,
    handleImageUpload,
    setBackgroundImage,  // Add this
    backgroundColor,
    setBackgroundColor 
  } = useBackground();
  const activeTheme = getCurrentTheme();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleDebugModeChange = (e) => {
    setDebugMode(e.target.checked);
    setShowReloadPrompt(true);
  };

  useEffect(() => {
    const getSystemInfo = async () => {
      try {
        // In a real app, you might want to fetch this from your backend
        // This is just a mock implementation
        setSystemInfo({
          gitBranch: process.env.NEXT_PUBLIC_GIT_BRANCH || 'main',
          version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
          userAgent: window.navigator.userAgent,
          platform: window.navigator.platform,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to fetch system info:', error);
      }
    };

    if (tab === 4) { // Advanced tab
      getSystemInfo();
    }
  }, [tab]);

  const handleDownloadData = () => {
    try {
      const data = {
        settings: {
          theme: currentTheme,
          darkMode: isDarkMode,
          taskbar: taskbarSettings,
          animation: animationSpeed,
          debug: debugMode,
        },
        systemInfo,
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'osb-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowDownloadConfirm(false);
    } catch (error) {
      console.error('Failed to download data:', error);
    }
  };

  const handleDeleteData = () => {
    try {
      localStorage.clear();
      setShowDeleteConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete data:', error);
    }
  };

  // Check if required context values are available
  if (!patterns || !currentPattern) {
    console.warn("Pattern context not properly initialized");
    return null;
  }

  const renderAdvancedTab = () => (
    <>
      <Typography variant="h6" gutterBottom>
        Advanced Settings
      </Typography>

      <InfoSection>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          System Information
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Git Branch" secondary={systemInfo.gitBranch} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Version" secondary={systemInfo.version} />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="User Agent" 
              secondary={systemInfo.userAgent}
              sx={{ wordBreak: 'break-word' }}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Platform" secondary={systemInfo.platform} />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Last Updated" 
              secondary={new Date(systemInfo.timestamp).toLocaleString()} 
            />
          </ListItem>
        </List>
      </InfoSection>

      <InfoSection>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Debug Settings
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={debugMode}
              onChange={handleDebugModeChange}
            />
          }
          label="Debug Mode"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Enables error reporting and shows debug applications
        </Typography>
      </InfoSection>

      <InfoSection>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Data Management
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<Download />}
              onClick={() => setShowDownloadConfirm(true)}
            >
              Download Data
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteForever />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete All Data
            </Button>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}> Remember that your data isnt stored on our servers, it is stored inside of your computer with Local Storage for websites. </Typography>
      </InfoSection>

      {/* Confirmation Dialogs */}
      <ConfirmDialog open={showDownloadConfirm} onClose={() => setShowDownloadConfirm(false)}>
        <ConfirmDialogTitle>Download Data</ConfirmDialogTitle>
        <ConfirmDialogContent>
          <Typography>Are you sure you want to download your settings and data?</Typography>
        </ConfirmDialogContent>
        <DialogActions>
          <Button onClick={() => setShowDownloadConfirm(false)}>Cancel</Button>
          <Button onClick={handleDownloadData} variant="contained" color="primary">
            Download
          </Button>
        </DialogActions>
      </ConfirmDialog>

      <ConfirmDialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <ConfirmDialogTitle>Delete All Data</ConfirmDialogTitle>
        <ConfirmDialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All your settings will be reset to defaults.
          </Alert>
          <Typography>Are you sure you want to delete all your data?</Typography>
        </ConfirmDialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDeleteData} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </ConfirmDialog>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "48px",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">Desktop Settings</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<Palette />} label="Theme" />
          <Tab icon={<Wallpaper />} label="Background" />
          <Tab icon={<Dashboard />} label="Taskbar" />
          <Tab icon={<Animation />} label="Animations" />
          <Tab icon={<Code />} label="Advanced" />
        </Tabs>
      </Box>

      <DialogContent>
        <TabPanel value={tab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <MaterialUISwitch
                    checked={isDarkMode}
                    onChange={(e) => setIsDarkMode(e.target.checked)}
                    icon={
                      <StyledIcon>
                        <LightMode sx={{ fontSize: 16, color: "#b7791f" }} />
                      </StyledIcon>
                    }
                    checkedIcon={
                      <StyledIcon>
                        <DarkMode sx={{ fontSize: 16, color: "#fff" }} />
                      </StyledIcon>
                    }
                  />
                }
                label={isDarkMode ? "Dark Mode" : "Light Mode"}
                sx={{
                  color: isDarkMode ? "#fff" : "inherit",
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Color Themes
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(themes).map(([key, theme]) => (
                  <Grid item xs={6} sm={3} key={key}>
                    <Card
                      elevation={currentTheme === key ? 8 : 1}
                      sx={{
                        position: "relative",
                        border:
                          currentTheme === key
                            ? `2px solid ${activeTheme.colors.primary}`
                            : "none",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardActionArea onClick={() => setCurrentTheme(key)}>
                        <Box
                          sx={{
                            height: 60,
                            background: theme.colors.primary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                          }}
                        >
                          {theme.icon}
                        </Box>
                        <CardContent>
                          <Typography variant="subtitle1" align="center">
                            {theme.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Typography variant="h6" gutterBottom>
            Background Settings
          </Typography>
          
          {/* Mode Selection Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <BackgroundModeCard 
                active={mode === 'pattern'}
                onClick={() => setMode('pattern')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <ModeIcon>
                    <Texture fontSize="inherit" />
                  </ModeIcon>
                  <Typography variant="h6" component="div">
                    Pattern
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose from various geometric patterns
                  </Typography>
                </CardContent>
              </BackgroundModeCard>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <BackgroundModeCard
                active={mode === 'image'}
                onClick={() => setMode('image')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <ModeIcon>
                    <WallpaperRounded fontSize="inherit" />
                  </ModeIcon>
                  <Typography variant="h6" component="div">
                    Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload your own background image
                  </Typography>
                </CardContent>
              </BackgroundModeCard>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <BackgroundModeCard
                active={mode === 'color'}
                onClick={() => setMode('color')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <ModeIcon>
                    <FormatColorFill fontSize="inherit" />
                  </ModeIcon>
                  <Typography variant="h6" component="div">
                    Solid Color
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pick a solid background color
                  </Typography>
                </CardContent>
              </BackgroundModeCard>
            </Grid>
          </Grid>

          {/* Mode-specific content */}
          <Box sx={{ mt: 4 }}>
            {mode === 'pattern' && (
              <Grid container spacing={2}>
                {Object.entries(patterns).map(([key, pattern]) => (
                  <Grid item xs={6} sm={3} key={key}>
                    <Card
                      elevation={currentPattern === key ? 8 : 1}
                      sx={{
                        position: "relative",
                        border: currentPattern === key
                          ? `2px solid ${activeTheme.colors.primary}`
                          : "none",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardActionArea onClick={() => setCurrentPattern(key)}>
                        <Box
                          sx={{
                            height: 100,
                            backgroundImage: pattern.pattern,
                            backgroundColor: isDarkMode
                              ? "#121212"
                              : activeTheme.colors.background,
                            backgroundSize: key === "grid" ? "20px 20px" : "10px 10px",
                            backgroundPosition: "center",
                          }}
                        />
                        <CardContent>
                          <Typography variant="subtitle1" align="center">
                            {pattern.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {mode === 'image' && (
              <Box sx={{ textAlign: 'center' }}>
                <input
                  accept="image/*"
                  id="background-image-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="background-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<WallpaperRounded />}
                    sx={{ mb: 3 }}
                  >
                    Choose Image
                  </Button>
                </label>
                {backgroundImage && (
                  <Box
                    sx={{
                      mt: 2,
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden',
                      '&:hover .overlay': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Image 
                      src={backgroundImage} 
                      alt="Background Preview" 
                      layout="responsive"
                      width={16}
                      height={9}
                      objectFit="cover"
                    />
                    <Box
                      className="overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => setBackgroundImage(null)}
                        color="error"
                      >
                        Remove Image
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {mode === 'color' && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: backgroundColor,
                      border: '2px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'color';
                      input.value = backgroundColor;
                      input.addEventListener('input', (e) => {
                        setBackgroundColor(e.target.value);
                      });
                      input.click();
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Click to change color
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Typography variant="h6" gutterBottom>
            Taskbar Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={taskbarSettings.transparent}
                    onChange={(e) =>
                      setTaskbarSettings((prev) => ({
                        ...prev,
                        transparent: e.target.checked,
                      }))
                    }
                  />
                }
                label="Transparent Taskbar"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Taskbar Width</Typography>
              <Slider
                value={taskbarSettings.width}
                onChange={(e, newValue) =>
                  setTaskbarSettings((prev) => ({
                    ...prev,
                    width: newValue,
                  }))
                }
                min={50}
                max={100}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Taskbar Height</Typography>
              <Slider
                value={taskbarSettings.height}
                onChange={(e, newValue) =>
                  setTaskbarSettings((prev) => ({
                    ...prev,
                    height: newValue,
                  }))
                }
                min={40}
                max={80}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}px`}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Typography variant="h6" gutterBottom>
            Animation Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography gutterBottom>Animation Speed</Typography>
              <Select
                fullWidth
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(e.target.value)}
              >
                <MenuItem value="slow">Slow</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="fast">Fast</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={4}>
          {renderAdvancedTab()}
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
