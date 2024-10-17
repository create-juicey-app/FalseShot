import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
} from "@mui/material";
import axios from "axios";

const ErrorLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get("/api/get-logs");
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Error Logs
      </Typography>
      <Button variant="contained" color="primary" onClick={fetchLogs}>
        Refresh Logs
      </Button>
      <List>
        {logs.map((log, index) => (
          <ListItem
            key={index}
            component={Paper}
            elevation={3}
            style={{ marginBottom: "1rem" }}
          >
            <ListItemText
              primary={`Error: ${log.error}`}
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary"
                  >
                    Timestamp: {new Date(log.timestamp).toLocaleString()}
                  </Typography>
                  <br />
                  <Typography
                    component="span"
                    variant="body2"
                    color="textSecondary"
                  >
                    Stack Trace:
                  </Typography>
                  <pre>{log.stackTrace}</pre>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ErrorLogs;
