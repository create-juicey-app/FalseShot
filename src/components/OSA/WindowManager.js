// components/WindowManager.js
import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  lazy,
  Suspense,
  useEffect,
} from "react";
import { CircularProgress, Button } from "@mui/material";
import Window from "./Window";
import Modal from "../Modal";
import ErrorBoundary from "../ErrorBoundary"; // Ensure this component exists

const WindowManager = forwardRef((props, ref) => {
  const { apps } = props; // Extract apps from props
  const [windows, setWindows] = useState([]);
  const [activeWindow, setActiveWindow] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, content: "" });

  // Function to handle errors within windows
  const handleError = (error, windowId) => {
    console.error(`Error in window ${windowId}:`, error);
    setErrorModal({
      isOpen: true,
      content: `An error occurred in ${
        windows.find((w) => w.id === windowId)?.title || "the application"
      }: ${error.message}`,
    });
  };

  const handleCloseErrorModal = () => {
    setErrorModal({ isOpen: false, content: "" });
  };

  // Error boundary fallback component
  const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    openWindow: (app) => {
      // Check if a window with the same title already exists
      const existingWindow = windows.find(
        (window) => window.title === app.label
      );
      if (existingWindow) {
        // If the window exists and is minimized, restore it
        if (existingWindow.isMinimized) {
          setWindows((prev) =>
            prev.map((window) =>
              window.id === existingWindow.id
                ? { ...window, isMinimized: false }
                : window
            )
          );
        }
        setActiveWindow(existingWindow.id);
        return;
      }

      // Create a unique window ID
      const windowId = Date.now();

      let Component = null;

      if (app.component) {
        // If a component is directly provided, use it
        Component = app.component;
      } else if (app.filename) {
        // Dynamically import based on filename
        Component = lazy(() =>
          import(`../../apps/${app.filename}`)
            .then((module) => ({ default: module.default }))
            .catch((error) => {
              handleError(error, windowId);
              return { default: () => <div>Failed to load component</div> };
            })
        );
      }

      if (!Component) {
        handleError(new Error("Component is undefined"), windowId);
        return;
      }

      // Add the new window to the state
      setWindows((prev) => [
        ...prev,
        {
          id: windowId,
          title: app.label,
          component: Component,
          componentProps: app.componentProps,
          icon: app.icon,
          position: { x: 100, y: 100 }, // Default position
          isMaximized: false,
          isMinimized: false,
          ...app.windowProps, // Spread the windowProps here
        },
      ]);

      setActiveWindow(windowId);
    },
    closeWindow: (id) => {
      setWindows((prev) => prev.filter((window) => window.id !== id));
      if (activeWindow === id) {
        setActiveWindow(null);
      }
    },
    minimizeWindow: (id) => {
      setWindows((prev) =>
        prev.map((window) =>
          window.id === id ? { ...window, isMinimized: true } : window
        )
      );
      if (activeWindow === id) {
        setActiveWindow(null);
      }
    },
    maximizeWindow: (id) => {
      setWindows((prev) =>
        prev.map((window) =>
          window.id === id
            ? { ...window, isMaximized: !window.isMaximized }
            : window
        )
      );
    },
    minimizeAllWindows: () => {
      setWindows((prev) =>
        prev.map((window) => ({ ...window, isMinimized: true }))
      );
      setActiveWindow(null);
    },
    getWindows: () => windows,
    getActiveWindow: () => activeWindow,
    setActiveWindow: (id) => setActiveWindow(id),
  }));

  // Component wrapper with Suspense and ErrorBoundary
  const WindowContent = ({ Component, componentProps, windowId }) => {
    return (
      <Suspense fallback={<CircularProgress />}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error) => handleError(error, windowId)}
          onReset={() => {
            // Handle reset if needed
          }}
        >
          {/* Pass windowManagerRef to the component */}
          <Component {...componentProps} windowManagerRef={ref} />
        </ErrorBoundary>
      </Suspense>
    );
  };

  return (
    <>
      {windows.map((window) => (
        <Window
          key={window.id}
          {...window}
          onClose={() => ref.current?.closeWindow(window.id)}
          onMinimize={() => ref.current?.minimizeWindow(window.id)}
          onMaximize={() => ref.current?.maximizeWindow(window.id)}
          setActiveWindow={() => setActiveWindow(window.id)}
          isActive={activeWindow === window.id}
        >
          <WindowContent
            Component={window.component}
            componentProps={window.componentProps}
            windowId={window.id}
          />
        </Window>
      ))}
      <Modal
        icon="Error"
        isOpen={errorModal.isOpen}
        onClose={handleCloseErrorModal}
        title="Application Error"
        content={errorModal.content}
        buttons={[
          {
            label: "Close",
            onClick: handleCloseErrorModal,
            color: "primary",
            variant: "contained",
          },
        ]}
      />
    </>
  );
});

WindowManager.displayName = "WindowManager";

export default WindowManager;
