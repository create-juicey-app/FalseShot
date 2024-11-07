// Filename: components/OSB/WindowManager.js
import React from "react";
import { useWindowManager } from "./contexts/WindowManagerContext";
import Window from "./Window";
import dynamic from 'next/dynamic';
const WindowManager = () => {
  const { windows, closeWindow, updateWindow, focusWindow } = useWindowManager();

  const loadComponent = (filename) => {
    return dynamic(() =>
      import(`../../apps/${filename}`), { loading: () => <p>Loading...</p> }
    );
  };

  return (
    <>
      {Object.values(windows).map((windowConfig) => {
        const Component = loadComponent(windowConfig.filename);
        return (
          <Window
            key={windowConfig.id}
            {...windowConfig}
            zIndex={windowConfig.zIndex} // Pass zIndex prop
            aggressiveness={windowConfig.aggressiveness || 1} // Pass aggressiveness prop
            onClose={() => closeWindow(windowConfig.id)}
            onMinimize={() =>
              updateWindow(windowConfig.id, { isMinimized: true })
            }
            onMaximize={() =>
              updateWindow(windowConfig.id, { 
                isMaximized: !windowConfig.isMaximized, 
                isMinimized: false // Ensure the window is not minimized when maximizing
              })
            }
            onFocus={() => focusWindow(windowConfig.id)}
            focusWindow={() => focusWindow(windowConfig.id)} // Pass focusWindow
            component={Component} // Pass Component to the Window
          />
        );
      })}
    </>
  );
};

export default WindowManager;