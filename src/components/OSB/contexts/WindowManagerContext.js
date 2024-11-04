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

  return (
    <WindowManagerContext.Provider
      value={{
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        openWindow,
        closeWindow,
        updateWindow,
        focusWindow,
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