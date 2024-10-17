import '@/styles/App.css';
import '@/styles/globals.css'
import React from 'react';
import App from 'next/app';
import Bsod from '../components/Bsod';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Check if the error is from an in-app component
      if (this.props.isInApp) {
        // For in-app errors, return null to allow the app to handle it
        return null;
      }
      // For critical errors, show the BSOD
      return <Bsod error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

class MyApp extends App {
  render() {
    const { Component, pageProps, router } = this.props;
    
    // Check if the current route is an in-app route
    const isInApp = router.pathname.startsWith('/app/');

    return (
      <ErrorBoundary isInApp={isInApp}>
        <Component {...pageProps} />
      </ErrorBoundary>
    );
  }
}

export default MyApp;