// Filename: components/OSB/WindowManager.js
import React from "react";
import { useWindowManager } from "./contexts/WindowManagerContext";
import Window from "./Window";

const WindowManager = () => {
  const { windows, closeWindow, updateWindow, focusWindow } = useWindowManager();

  return (
    <>
      {Object.values(windows).map((windowConfig) => (
        <Window
          key={windowConfig.id}
          {...windowConfig}
          zIndex={windowConfig.zIndex} // Pass zIndex prop
          onClose={() => closeWindow(windowConfig.id)}
          onMinimize={() =>
            updateWindow(windowConfig.id, { isMinimized: true })
          }
          onMaximize={() =>
            updateWindow(windowConfig.id, {
              isMaximized: !windowConfig.isMaximized,
            })
          }
          onFocus={() => focusWindow(windowConfig.id)}
          focusWindow={() => focusWindow(windowConfig.id)} // Pass focusWindow
        />
      ))}
    </>
  );
};

export default WindowManager;