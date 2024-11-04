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
} from "@mui/material";

import {
  Palette,
  Wallpaper,
  Dashboard,
  Animation,
  DarkMode,
  LightMode,
  Close,
} from "@mui/icons-material";
import { ThemeContext } from "./Theme";
import TabPanel from "./TabPanel";
import { usePattern } from "./BackgroundPattern";
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

const SettingsModal = ({ open, onClose }) => {
  const [tab, setTab] = useState(0);
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
  } = useContext(ThemeContext);

  // Use the custom hook instead of direct context access
  const { currentPattern, setCurrentPattern, patterns } = usePattern();
  const activeTheme = getCurrentTheme();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
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
            Background Pattern
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(patterns).map(([key, pattern]) => (
              <Grid item xs={6} sm={3} key={key}>
                <Card
                  elevation={currentPattern === key ? 8 : 1}
                  sx={{
                    position: "relative",
                    border:
                      currentPattern === key
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
                        height: 60,
                        backgroundImage: pattern.pattern,
                        backgroundColor: isDarkMode
                          ? "#121212"
                          : activeTheme.colors.background,
                        backgroundSize:
                          key === "grid" ? "20px 20px" : "10px 10px",
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
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
