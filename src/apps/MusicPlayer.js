import React, { useState, useEffect, useRef } from "react";
import { Box, Slider, Typography } from "@mui/material";

const GRAMOPHONE_FRAMES = [1, 2, 3, 4, 5, 4, 3, 2];
const NIKO_JAM_FRAMES = [0, 1, 2, 3];
const NIKO_STAND_FRAMES = [4, 5, 6, 5];
const NIKO_SLEEP_FRAMES = [0, 1];

const tracks = [
  {
    title: "FEMTANYL - ACT RIGHT",
    bpm: 190,
    filename: "ACT_RIGHT.mp3",
    defaultSpeed: 100,
  },
  {
    title: "CIRCLOO - GROWTH",
    bpm: 65,
    filename: "Growth.mp3",
    defaultSpeed: 100,
  },
  {
    title: "FEMTANYL - M3 N MIN3",
    bpm: 300,
    filename: "M3NMIN3.mp3",
    defaultSpeed: 100,
  },
  {
    title: "FEMTANYL - MURDER EVERY 1 U KNOW",
    bpm: 113,
    filename: "Murderevery1.mp3",
    defaultSpeed: 100,
  },
  {
    title: "FEMTANYL - P3T",
    bpm: 168,
    filename: "P3T.mp3",
    defaultSpeed: 100,
  },
  {
    title: "FEMTANYL - PUSH YOUR TEMPER",
    bpm: 155,
    filename: "Pushyourtemper.mp3",
    defaultSpeed: 100,
  },
  {
    title: "RAIN WORLD OST - THREAT",
    bpm: 120,
    filename: "RWthreat.mp3",
    defaultSpeed: 100,
  },
  {
    title: "IN STARS AND TIME - TITLE",
    bpm: 140,
    filename: "SATtitle.mp3",
    defaultSpeed: 100,
  },
  {
    title: "Lofi Bloom - school rooftop intro",
    bpm: 53,
    filename: "rooftop.mp3",
    defaultSpeed: 100,
  },
  // Add more tracks here
];

const SpritesheetImage = ({ src, frameIndex, totalFrames, width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingEnabled = false;
      const frameWidth = image.width / totalFrames;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(
        image,
        frameIndex * frameWidth,
        0,
        frameWidth,
        image.height,
        0,
        0,
        width,
        height
      );
    };
  }, [src, frameIndex, totalFrames, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ imageRendering: "pixelated" }}
    />
  );
};

const CustomIconButton = ({ src, onClick, alt, size = 24 }) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
    }}
  >
    <img
      src={`/jukebox/${src}`}
      alt={alt}
      width={size}
      height={size}
      style={{
        imageRendering: "pixelated",
        filter:
          "invert(40%) sepia(100%) saturate(7500%) hue-rotate(265deg) brightness(100%) contrast(100%)",
      }}
    />
  </button>
);

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [playbackSpeed, setPlaybackSpeed] = useState(tracks[0].defaultSpeed);
  const [gramophoneFrameIndex, setGramophoneFrameIndex] = useState(0);
  const [nikoFrameIndex, setNikoFrameIndex] = useState(0);
  const [nikoState, setNikoState] = useState("stand");
  const [sleepTimer, setSleepTimer] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      const interval = (200 * 100) / playbackSpeed;
      const gramophoneInterval = setInterval(() => {
        setGramophoneFrameIndex(
          (prev) => (prev + 1) % GRAMOPHONE_FRAMES.length
        );
      }, interval);

      return () => clearInterval(gramophoneInterval);
    }
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    if (isPlaying) {
      const bpm = tracks[currentTrack].bpm;
      const interval = (60000 / bpm) * (100 / playbackSpeed);

      const nikoInterval = setInterval(
        () => {
          if (nikoState === "jam") {
            setNikoFrameIndex((prev) => (prev + 1) % NIKO_JAM_FRAMES.length);
          } else if (nikoState === "stand") {
            setNikoFrameIndex((prev) => (prev + 1) % NIKO_STAND_FRAMES.length);
          }
        },
        nikoState === "jam" ? interval : 200
      );

      return () => clearInterval(nikoInterval);
    }
  }, [isPlaying, currentTrack, nikoState, playbackSpeed]);

  useEffect(() => {
    if (!isPlaying) {
      const timer = setTimeout(() => {
        setNikoState("sleep");
        const sleepInterval = setInterval(() => {
          setNikoFrameIndex((prev) => (prev + 1) % NIKO_SLEEP_FRAMES.length);
        }, 1000);
        setSleepTimer(sleepInterval);
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      if (sleepTimer) {
        clearInterval(sleepTimer);
        setSleepTimer(null);
      }
      setNikoState(Math.random() < 0.5 ? "jam" : "stand");
      setNikoFrameIndex(0);
    }
  }, [isPlaying, sleepTimer]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = `/songs/${tracks[currentTrack].filename}`;
      setPlaybackSpeed(tracks[currentTrack].defaultSpeed);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack, isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue / 100;
    }
  };

  const handleSpeedChange = (event, newValue) => {
    setPlaybackSpeed(newValue);
    if (audioRef.current) {
      audioRef.current.playbackRate = newValue / 100;
      audioRef.current.preservesPitch = false;
    }
  };

  const handlePrevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleNextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  return (
    <Box
      sx={{
        width: "60%",
        margin: "auto",
        textAlign: "center",
        bgcolor: "#000",
        p: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 150,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <img
          src="/jukebox/small_sun.png"
          alt="Small Sun"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
        <img
          src={`/jukebox/grammaphone${GRAMOPHONE_FRAMES[gramophoneFrameIndex]}.png`}
          alt="Gramophone"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
        <Box sx={{ width: "80px", height: "80px" }}>
          <SpritesheetImage
            src={`/jukebox/niko_${nikoState}.png`}
            frameIndex={
              nikoState === "jam"
                ? NIKO_JAM_FRAMES[nikoFrameIndex]
                : nikoState === "stand"
                ? NIKO_STAND_FRAMES[nikoFrameIndex]
                : NIKO_SLEEP_FRAMES[nikoFrameIndex]
            }
            totalFrames={
              nikoState === "jam" ? 4 : nikoState === "stand" ? 7 : 2
            }
            width={80}
            height={80}
          />
        </Box>
      </Box>

      <Typography variant="body2" sx={{ mb: 1 }}>
        Current Track
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <CustomIconButton
          src="arrow_left.png"
          onClick={handlePrevTrack}
          alt="Previous Track"
        />
        <Typography variant="body2" sx={{ mx: 1, flexGrow: 1 }}>
          {tracks[currentTrack].title}
        </Typography>
        <CustomIconButton
          src="arrow_right.png"
          onClick={handleNextTrack}
          alt="Next Track"
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" sx={{ mr: 1, minWidth: 120 }}>
          Playback Speed: {playbackSpeed}%
        </Typography>
        <CustomIconButton
          src="arrow_left.png"
          onClick={() =>
            handleSpeedChange(null, Math.max(50, playbackSpeed - 10))
          }
          alt="Decrease Speed"
        />
        <Slider
          value={playbackSpeed}
          onChange={handleSpeedChange}
          aria-labelledby="speed-slider"
          step={10}
          min={50}
          max={200}
          sx={{ marginRight: "3px" }}
        />
        <CustomIconButton
          src="arrow_right.png"
          onClick={() =>
            handleSpeedChange(null, Math.min(200, playbackSpeed + 10))
          }
          alt="Increase Speed"
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" sx={{ mr: 1, minWidth: 120 }}>
          Volume: {volume}%
        </Typography>
        <CustomIconButton
          src="arrow_left.png"
          onClick={() => handleVolumeChange(null, Math.max(0, volume - 5))}
          alt="Decrease Volume"
        />
        <Slider
          value={volume}
          onChange={handleVolumeChange}
          aria-labelledby="volume-slider"
          step={5}
          min={0}
          max={100}
          sx={{ marginRight: "3px" }}
        />
        <CustomIconButton
          src="arrow_right.png"
          onClick={() => handleVolumeChange(null, Math.min(100, volume + 5))}
          alt="Increase Volume"
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <CustomIconButton
          src="restart_track.png"
          onClick={() => (audioRef.current.currentTime = 0)}
          alt="Restart Track"
          size={32}
        />
        <CustomIconButton
          src={isPlaying ? "pause.png" : "play.png"}
          onClick={togglePlayPause}
          alt={isPlaying ? "Pause" : "Play"}
          size={32}
        />
        <CustomIconButton
          src="stop.png"
          onClick={() => {
            setIsPlaying(false);
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }}
          alt="Stop"
          size={32}
        />
      </Box>

      <audio
        ref={audioRef}
        src={`/songs/${tracks[currentTrack].filename}`}
        onEnded={handleNextTrack}
      />
    </Box>
  );
}
