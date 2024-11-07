import React from 'react';
import { Button, Box } from '@mui/material';
import { useWindowManager } from '../components/OSB/contexts/WindowManagerContext';

const WindowTester = () => {
  const {
    maximizeWindow,
    minimizeWindow,
    shakeWindow,
    closeWindow,
    createWindow,
    activeWindowId,
  } = useWindowManager();

  const handleMaximize = () => {
    maximizeWindow(activeWindowId);
  };

  const handleMinimize = () => {
    minimizeWindow(activeWindowId);
  };

  const handleShake = (level) => {
    shakeWindow(activeWindowId, level);
  };

  const handleClose = () => {
    closeWindow(activeWindowId);
  };

  const handleCreateWindow = () => {
    createWindow({
      id: `test-window-${Date.now()}`,
      title: 'New Test Window',
      content: <div>This is a test window.</div>,
      size: { width: 400, height: 300 },
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      <Button variant="contained" onClick={handleMaximize}>Maximize Window</Button>
      <Button variant="contained" onClick={handleMinimize}>Minimize Window</Button>
      <Button variant="contained" onClick={() => handleShake(1)}>Shake Level 1</Button>
      <Button variant="contained" onClick={() => handleShake(2)}>Shake Level 2</Button>
      <Button variant="contained" onClick={() => handleShake(3)}>Shake Level 3</Button>
      <Button variant="contained" onClick={() => handleShake(4)}>Shake Level 4</Button>
      <Button variant="contained" onClick={() => handleShake(5)}>Shake Level 5</Button>
      <Button variant="contained" onClick={handleClose}>Close Window</Button>
      <Button variant="contained" onClick={handleCreateWindow}>Create New Window</Button>
    </Box>
  );
};

export default WindowTester;
