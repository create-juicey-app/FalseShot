import React, { useState, useContext } from "react";
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
  Code, // Add this import
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

const SettingsModal = ({ open, onClose }) => {
  const [tab, setTab] = useState(0);
  const [showReloadPrompt, setShowReloadPrompt] = useState(false);
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

  // Check if required context values are available
  if (!patterns || !currentPattern) {
    console.warn("Pattern context not properly initialized");
    return null;
  }

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
          <Typography variant="h6" gutterBottom>
            Advanced Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
              {showReloadPrompt && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography color="warning.main" gutterBottom>
                    Debug mode change requires a page reload to take effect.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.location.reload()}
                    sx={{ mr: 1 }}
                  >
                    Reload Now
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowReloadPrompt(false)}
                  >
                    Later
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
