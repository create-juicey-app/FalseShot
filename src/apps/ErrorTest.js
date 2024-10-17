import React from 'react';
import { Button } from '@mui/material';
const ErrorTest = () => {
  const throwError = () => {
    throw new Error('This is a test error');
  };

  return (
    <div>
      <h2>Error Test</h2>
      <Button onClick={throwError}>Throw Error</Button>
    </div>
  );
};

export default ErrorTest;