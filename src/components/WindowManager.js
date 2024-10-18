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
import Modal from "./Modal";
import ErrorBoundary from "./ErrorBoundary"; // Ensure you have this component
import path from "path";

const WindowManager = forwardRef(({ apps }, ref) => {
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

  const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );

  const WindowContent = ({
    component: Component,
    componentProps,
    windowId,
  }) => {
    return (
      <Suspense fallback={<CircularProgress />}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error) => handleError(error, windowId)}
          onReset={() => {
            // Add any reset logic here if needed
          }}
        >
          <Component {...componentProps} />
        </ErrorBoundary>
      </Suspense>
    );
  };

  useImperativeHandle(ref, () => ({
    openWindow: (app) => {
      const existingWindow = windows.find(
        (window) => window.title === app.label
      );
      if (existingWindow) {
        setWindows((prev) =>
          prev.map((window) =>
            window.id === existingWindow.id
              ? { ...window, isMinimized: false }
              : window
          )
        );
        setActiveWindow(existingWindow.id);
      } else {
        const newWindow = {
          id: Date.now(),
          title: app.label,
          component: lazy(() =>
            import(`../apps/${app.filename}`)
              .then((module) => ({ default: module.default }))
              .catch((error) => {
                handleError(error, newWindow.id);
                return { default: () => <div>Failed to load component</div> };
              })
          ),
          componentProps: app.componentProps,
          position: { x: Math.random() * 100, y: Math.random() * 100 },
          isMaximized: false,
          isMinimized: false,
          icon: app.icon,
          ...app.windowProps,
        };
        setWindows((prev) => [...prev, newWindow]);
        setActiveWindow(newWindow.id);
      }
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
      setActiveWindow(null);
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
    },
    getWindows: () => windows,
    getActiveWindow: () => activeWindow,
    setActiveWindow: (id) => setActiveWindow(id),
  }));

  // Automatically open the Documents window when the component mounts
  useEffect(() => {
    // Find the Documents app from the apps prop
    const documentsApp = apps.find((app) => app.label === "Documents");

    if (documentsApp) {
      ref.current.openWindow(documentsApp);
    } else {
      console.warn("Documents app not found in the apps prop.");
    }
  }, [apps, ref]);

  return (
    <>
      {windows.map((window) => (
        <Window
          key={window.id}
          {...window}
          onClose={() => ref.current.closeWindow(window.id)}
          onMinimize={() => ref.current.minimizeWindow(window.id)}
          onMaximize={() => ref.current.maximizeWindow(window.id)}
          setActiveWindow={() => setActiveWindow(window.id)}
          isActive={activeWindow === window.id}
        >
          <WindowContent
            component={window.component}
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
