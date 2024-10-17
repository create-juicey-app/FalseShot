import React from "react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
} from "@mui/material";

const SettingsDrawer = ({
  isOpen,
  onClose,
  themeMode,
  primaryColor,
  onThemeModeChange,
  onPrimaryColorChange,
}) => (
  <Drawer anchor="right" open={isOpen} onClose={onClose}>
    <Box sx={{ width: 250, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Settings
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Theme Mode" />
          <Button onClick={onThemeModeChange}>
            {themeMode === "dark" ? "Light" : "Dark"}
          </Button>
        </ListItem>
        <ListItem>
          <ListItemText primary="Primary Color" />
          <TextField
            type="color"
            value={primaryColor}
            onChange={onPrimaryColorChange}
            sx={{ width: 60 }}
          />
        </ListItem>
      </List>
    </Box>
  </Drawer>
);

export default SettingsDrawer;