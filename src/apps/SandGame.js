import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Button,
  Slider,
  Typography,
  Container,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

// Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CELL_SIZE = 4;
const GRID_WIDTH = CANVAS_WIDTH / CELL_SIZE;
const GRID_HEIGHT = CANVAS_HEIGHT / CELL_SIZE;

const MATERIALS = {
  EMPTY: { name: "Empty", color: "#000000", density: 0, state: "gas" },
  SAND: { name: "Sand", color: "#c2b280", density: 1.6, state: "solid" },
  WATER: { name: "Water", color: "#0000ff", density: 1.0, state: "liquid" },
  STONE: { name: "Stone", color: "#808080", density: 2.6, state: "solid" },
  STEAM: { name: "Steam", color: "#ffffff", density: 0.0006, state: "gas" },
  LAVA: { name: "Lava", color: "#ff4500", density: 3.1, state: "liquid" },
};

const TEMPERATURE_RANGE = { min: -273, max: 10000 };
const PRESSURE_RANGE = { min: 0, max: 1000 };

// Main component
const SandGame = () => {
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const gridRef = useRef([]);
  const [temperature, setTemperature] = useState(20);
  const [pressure, setPressure] = useState(101);
  const [selectedMaterial, setSelectedMaterial] = useState("SAND");
  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(0);

  // Initialize grid
  useEffect(() => {
    gridRef.current = Array(GRID_HEIGHT)
      .fill()
      .map(() =>
        Array(GRID_WIDTH)
          .fill()
          .map(() => ({ ...MATERIALS.EMPTY, temp: temperature }))
      );

    // Create offscreen canvas
    offscreenCanvasRef.current = document.createElement("canvas");
    offscreenCanvasRef.current.width = CANVAS_WIDTH;
    offscreenCanvasRef.current.height = CANVAS_HEIGHT;
  }, []);

  // Main game loop
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsUpdateTime = 0;

    const fixedDeltaTime = 1000 / 60; // 60 FPS
    let accumulator = 0;

    const gameLoop = (currentTime) => {
      if (!isPlaying) return;

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      accumulator += deltaTime;

      while (accumulator >= fixedDeltaTime) {
        updateGrid();
        accumulator -= fixedDeltaTime;
      }

      renderGrid();

      frameCount++;
      fpsUpdateTime += deltaTime;

      if (fpsUpdateTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsUpdateTime = 0;
      }

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
  }, [isPlaying]);

  // Update grid state
  const updateGrid = useCallback(() => {
    const newGrid = gridRef.current;

    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = newGrid[y][x];
        if (cell.name === "Empty") continue;

        if (cell.state === "solid" || cell.state === "liquid") {
          // Apply gravity
          if (y < GRID_HEIGHT - 1 && newGrid[y + 1][x].density < cell.density) {
            [newGrid[y][x], newGrid[y + 1][x]] = [
              newGrid[y + 1][x],
              newGrid[y][x],
            ];
          } else if (cell.state === "liquid") {
            // Liquids spread horizontally
            const direction = Math.random() < 0.5 ? -1 : 1;
            if (
              x + direction >= 0 &&
              x + direction < GRID_WIDTH &&
              newGrid[y][x + direction].density < cell.density
            ) {
              [newGrid[y][x], newGrid[y][x + direction]] = [
                newGrid[y][x + direction],
                newGrid[y][x],
              ];
            }
          }
        } else if (cell.state === "gas") {
          // Gases rise and spread
          const dy = Math.random() < 0.5 ? -1 : 0;
          const dx = Math.random() < 0.33 ? -1 : Math.random() < 0.5 ? 1 : 0;
          if (
            y + dy >= 0 &&
            y + dy < GRID_HEIGHT &&
            x + dx >= 0 &&
            x + dx < GRID_WIDTH &&
            newGrid[y + dy][x + dx].density > cell.density
          ) {
            [newGrid[y][x], newGrid[y + dy][x + dx]] = [
              newGrid[y + dy][x + dx],
              newGrid[y][x],
            ];
          }
        }

        // Apply temperature effects
        if (cell.name === "Water" && cell.temp >= 100) {
          newGrid[y][x] = { ...MATERIALS.STEAM, temp: cell.temp };
        } else if (cell.name === "Steam" && cell.temp < 100) {
          newGrid[y][x] = { ...MATERIALS.WATER, temp: cell.temp };
        } else if (cell.name === "Lava" && cell.temp < 700) {
          newGrid[y][x] = { ...MATERIALS.STONE, temp: cell.temp };
        }

        // Temperature equilibrium (simplified)
        if (y > 0)
          newGrid[y][x].temp =
            (newGrid[y][x].temp + newGrid[y - 1][x].temp) / 2;
        if (x > 0)
          newGrid[y][x].temp =
            (newGrid[y][x].temp + newGrid[y][x - 1].temp) / 2;
      }
    }

    gridRef.current = newGrid;
  }, []);

  // Render grid on canvas
  const renderGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    const ctx = offscreenCanvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imageData.data;

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = gridRef.current[y][x];
        const index = (y * CELL_SIZE * CANVAS_WIDTH + x * CELL_SIZE) * 4;
        const color = cell.color.slice(1);
        const r = parseInt(color.slice(0, 2), 16);
        const g = parseInt(color.slice(2, 4), 16);
        const b = parseInt(color.slice(4, 6), 16);

        for (let dy = 0; dy < CELL_SIZE; dy++) {
          for (let dx = 0; dx < CELL_SIZE; dx++) {
            const pixelIndex = index + (dy * CANVAS_WIDTH + dx) * 4;
            data[pixelIndex] = r;
            data[pixelIndex + 1] = g;
            data[pixelIndex + 2] = b;
            data[pixelIndex + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    canvas.getContext("2d").drawImage(offscreenCanvas, 0, 0);
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (event) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
      const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);

      if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
        gridRef.current[y][x] = {
          ...MATERIALS[selectedMaterial],
          temp: temperature,
        };
      }
    },
    [selectedMaterial, temperature]
  );

  // Material selection handler
  const handleMaterialChange = (event) => {
    setSelectedMaterial(event.target.value);
  };

  // Temperature change handler
  const handleTemperatureChange = (event, newValue) => {
    if (
      newValue >= TEMPERATURE_RANGE.min &&
      newValue <= TEMPERATURE_RANGE.max
    ) {
      setTemperature(newValue);
    }
  };

  // Pressure change handler
  const handlePressureChange = (event, newValue) => {
    if (newValue >= PRESSURE_RANGE.min && newValue <= PRESSURE_RANGE.max) {
      setPressure(newValue);
    }
  };

  // Play/Pause handler
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Reset handler
  const handleReset = () => {
    gridRef.current = Array(GRID_HEIGHT)
      .fill()
      .map(() =>
        Array(GRID_WIDTH)
          .fill()
          .map(() => ({ ...MATERIALS.EMPTY, temp: temperature }))
      );
    setTemperature(20);
    setPressure(101);
  };

  // Memoized material options
  const materialOptions = useMemo(
    () =>
      Object.entries(MATERIALS).map(([key, value]) => (
        <MenuItem key={key} value={key}>
          {value.name}
        </MenuItem>
      )),
    []
  );

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sand Falling Game
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3}>
              <Box p={2}>
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  onClick={handleCanvasClick}
                  style={{ border: "1px solid black" }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3}>
              <Box p={2}>
                <Typography variant="h6" gutterBottom>
                  Controls
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="material-select-label">Material</InputLabel>
                  <Select
                    labelId="material-select-label"
                    value={selectedMaterial}
                    onChange={handleMaterialChange}
                  >
                    {materialOptions}
                  </Select>
                </FormControl>
                <Box mt={2}>
                  <Typography id="temperature-slider" gutterBottom>
                    Temperature: {temperature}°C
                  </Typography>
                  <Slider
                    value={temperature}
                    onChange={handleTemperatureChange}
                    aria-labelledby="temperature-slider"
                    min={TEMPERATURE_RANGE.min}
                    max={TEMPERATURE_RANGE.max}
                    valueLabelDisplay="auto"
                  />
                </Box>
                <Box mt={2}>
                  <Typography id="pressure-slider" gutterBottom>
                    Pressure: {pressure} kPa
                  </Typography>
                  <Slider
                    value={pressure}
                    onChange={handlePressureChange}
                    aria-labelledby="pressure-slider"
                    min={PRESSURE_RANGE.min}
                    max={PRESSURE_RANGE.max}
                    valueLabelDisplay="auto"
                  />
                </Box>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePlayPause}
                    fullWidth
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                </Box>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleReset}
                    fullWidth
                  >
                    Reset
                  </Button>
                </Box>
                <Box mt={2}>
                  <Typography variant="body2">FPS: {fps}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SandGame;
