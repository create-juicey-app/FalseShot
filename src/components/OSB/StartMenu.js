import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Grid, Typography, TextField } from '@mui/material';
import Image from 'next/image';
import { apps } from '../../config/apps';
import { ThemeContext } from './Theme';
import { useWindowManager } from './contexts/WindowManagerContext';
import dynamic from 'next/dynamic';


const ScrollingText = ({ text }) => {
  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: '20px',
      overflow: 'hidden',
    }}>
      <motion.div
        animate={{
          x: [-300, -20],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </Typography>
      </motion.div>
    </Box>
  );
};

const StartMenu = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const { openWindow } = useWindowManager();
  const { currentTheme, themes } = useContext(ThemeContext);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredApps = apps.filter(app => 
    app.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && filteredApps.length > 0) {
      handleLaunchApp(filteredApps[0]);
    }
  };

  const handleLaunchApp = async (app) => {
    const AppComponent = dynamic(() => import(`@/apps/${app.filename}`), {
      loading: () => <div>Loading...</div>,
    });

    openWindow({
      id: `${app.id}-${Date.now()}`,
      title: app.label,
      content: <AppComponent {...app.componentProps} />,
      size: {
        width: app.windowProps.width,
        height: app.windowProps.height,
      },
      icon: app.icon,
    });

    onClose();
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity:1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        bottom: '60px',
        left: '20px',
        width: '400px',
        height: '500px',
        borderRadius: '10px',
        boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.8)',
      }}
    >
      <Box p={2}>
        <TextField
          inputRef={inputRef}
          fullWidth
          variant="outlined"
          placeholder="Search apps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255,255,255,0.5)',
            },
          }}
        />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {filteredApps.map((app) => (
            <Grid item xs={4} key={app.id} onClick={() => handleLaunchApp(app)}>
              <Box
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  },
                  p: 1,
                }}
              >
                <Box position="relative" width={48} height={48} mx="auto">
                  <Image
                    src={app.icon}
                    alt={app.label}
                    fill
                    sizes="48px"
                    style={{ objectFit: 'contain' }}
                    priority
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                  {app.label}
                </Typography>
                <ScrollingText text={app.description} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </motion.div>
  );
};

export default StartMenu;
