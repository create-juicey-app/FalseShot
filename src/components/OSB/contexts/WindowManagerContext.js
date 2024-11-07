// Filename: components/OSB/contexts/WindowManagerContext.js
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
const WindowManagerContext = createContext();

const initialState = {
  windows: {},
  activeWindowId: null,
  zIndexCounter: 1000,
  isScreenShaking: false, // Add global screen shaking state
};

const windowReducer = (state, action) => {
  switch (action.type) {
    case "OPEN_WINDOW":
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload.id]: {
            ...action.payload,
            zIndex: state.zIndexCounter, // Assign zIndex
            isMinimized: false,
            isMaximized: false,
          },
        },
        activeWindowId: action.payload.id,
        zIndexCounter: state.zIndexCounter + 1,
      };
    case "CLOSE_WINDOW":
      const { [action.payload]: closedWindow, ...remainingWindows } =
        state.windows;
      return {
        ...state,
        windows: remainingWindows,
        activeWindowId:
          state.activeWindowId === action.payload ? null : state.activeWindowId,
      };

    case "UPDATE_WINDOW":
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload.id]: {
            ...state.windows[action.payload.id],
            ...action.payload.updates,
            // If isMaximized is true, ensure isMinimized is false
            ...(action.payload.updates.isMaximized && { isMinimized: false }),
          },
        },
      };

    case "FOCUS_WINDOW":
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload]: {
            ...state.windows[action.payload],
            zIndex: state.zIndexCounter, // Update zIndex
          },
        },
        activeWindowId: action.payload,
        zIndexCounter: state.zIndexCounter + 1,
      };

    case "SHAKE_WINDOW":
      if (action.payload.aggressiveness === 5) {
        return {
          ...state,
          isScreenShaking: true, // Trigger global screen shaking
        };
      } else {
        return {
          ...state,
          windows: {
            ...state.windows,
            [action.payload.id]: {
              ...state.windows[action.payload.id],
              isShaking: true,
              aggressiveness: action.payload.aggressiveness, // Store aggressiveness level
            },
          },
        };
      }
    case "RESET_SCREEN_SHAKE":
      return {
        ...state,
        isScreenShaking: false, // Reset global screen shaking
      };

    default:
      return state;
  }
};

export const WindowManagerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(windowReducer, initialState);

  const openWindow = useCallback((windowConfig) => {
    dispatch({ type: "OPEN_WINDOW", payload: windowConfig });
  }, []);

  const closeWindow = useCallback((windowId) => {
    dispatch({ type: "CLOSE_WINDOW", payload: windowId });
  }, []);

  const updateWindow = useCallback((windowId, updates) => {
    dispatch({ type: "UPDATE_WINDOW", payload: { id: windowId, updates } });
  }, []);

  const focusWindow = useCallback((windowId) => {
    dispatch({ type: "FOCUS_WINDOW", payload: windowId });
  }, []);

  // Add utility functions
  const maximizeWindow = useCallback((windowId) => {
    updateWindow(windowId, { isMaximized: true, isMinimized: false });
  }, [updateWindow]);

  const minimizeWindow = useCallback((windowId) => {
    updateWindow(windowId, { isMinimized: true, isMaximized: false });
  }, [updateWindow]);

  const shakeWindow = useCallback((windowId, aggressiveness = 1) => {
    dispatch({ type: "SHAKE_WINDOW", payload: { id: windowId, aggressiveness } });

    if (aggressiveness === 5) {
      // Reset the screen shaking after the animation completes
      setTimeout(() => {
        dispatch({ type: "RESET_SCREEN_SHAKE" });
      }, 600); // Duration matching the animation
    }
  }, []);

  const createWindow = useCallback((windowConfig) => {
    openWindow(windowConfig);
  }, [openWindow]);

  return (
    <WindowManagerContext.Provider
      value={{
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        openWindow,
        closeWindow,
        updateWindow,
        focusWindow,
        maximizeWindow,
        minimizeWindow,
        shakeWindow,
        createWindow,
        isScreenShaking: state.isScreenShaking, // Expose isScreenShaking
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
};

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error(
      "useWindowManager must be used within a WindowManagerProvider"
    );
  }
  return context;
};