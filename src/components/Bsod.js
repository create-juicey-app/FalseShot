import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Bsod = ({ error, errorInfo }) => {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const lines = React.useMemo(() => generateBsodLines(error, errorInfo), [error, errorInfo]);

  useEffect(() => {
    let lineIndex = 0;
    let isCancelled = false;

    const showNextLine = () => {
      if (lineIndex < lines.length && !isCancelled) {
        setDisplayedLines(prev => [...prev, lines[lineIndex]]);
        lineIndex++;
        const delay = Math.random() * 200 + 200;
        setTimeout(showNextLine, delay);
      } else if (!isCancelled) {
        startLoading();
      }
    };

    const startLoading = () => {
      let percentage = 0;
      const loadingInterval = setInterval(() => {
        if (isCancelled) {
          clearInterval(loadingInterval);
          return;
        }
        percentage += Math.random() * 5;
        if (percentage >= 100) {
          percentage = 100;
          clearInterval(loadingInterval);
          sendErrorToServer();
        }
        setLoadingPercentage(Math.floor(percentage));
      }, 200);
    };

    const sendErrorToServer = async () => {
      try {
        const logData = {
          error: error.toString(),
          stackTrace: errorInfo.componentStack,
          hexDump: generateHexDump(),
          timestamp: new Date().toISOString(),
        };
        await axios.post('/api/log-error', logData);
      } catch (err) {
        console.error('Failed to send error log to server:', err);
      }
    };

    setTimeout(() => {
      showNextLine();
    }, 2000);

    return () => {
      isCancelled = true;
    };
  }, [lines, error, errorInfo]);

  return (
    <div style={{
      backgroundColor: '#000088',
      color: 'white',
      height: '100vh',
      padding: '20px',
      fontFamily: 'Lucida Console, Monaco, monospace',
      fontSize: '14px',
      lineHeight: '1.2',
      overflow: 'hidden'
    }}>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {displayedLines.join('\n')}
        {loadingPercentage > 0 && `\n\nCompleting dump of physical memory... ${loadingPercentage}%`}
        {loadingPercentage === 100 && '\nPhysical memory dump complete.'}
      </pre>
    </div>
  );
};

const generateBsodLines = (error, errorInfo) => {
  const stackTrace = errorInfo && errorInfo.componentStack
    ? errorInfo.componentStack.split('\n').slice(0, 6)
    : ['No stack trace available'];
    
  

  const hexDump = generateHexDump();

  return [
    'A unrecoverable error has happened to the OS and must restart. Please wait...',
    '',
    'UNEXPECTED_ERROR',
    '',
    `Error: ${error ? error.toString() : 'Unknown error'}`,
    '',
    'Stack trace:',
    ...stackTrace,
    '',
    'Technical information:',
    '',
    '*** STOP: 0x0000000E (0xC0000005, 0x00000000, 0x00000000, 0x00000000)',
    '',
    'Hex dump:',
    ...hexDump,
    '',
    'Beginning dump of physical memory',
  ];
};

const generateHexDump = () => {
  const hexDump = [];
  for (let i = 0; i < 5; i++) {
    let line = '';
    for (let j = 0; j < 16; j++) {
      line += Math.floor(Math.random() * 256).toString(16).padStart(2, '0') + ' ';
    }
    hexDump.push(line.trim());
  }
  return hexDump;
};

export default Bsod;