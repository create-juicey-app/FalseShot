import React, { useState, useEffect, useRef } from "react";
import { Box, Slider, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Card, CardContent, CardMedia } from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from "@mui/icons-material";
import {
  Shuffle as ShuffleIcon,
  Repeat as RepeatIcon,
  QueueMusic as QueueMusicIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import Paper from "@mui/material/Paper";

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
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [ratings, setRatings] = useState({});
  const [nextTracks, setNextTracks] = useState([]);
  const [playlists, setPlaylists] = useState([
    {
      id: "playlist1",
      name: "Femtanyl Pack",
      description: "Here are all the tracks of the indie artist FEMTANYL",
      thumbnail: "/playlists/hyperpop.png",
      tracks: tracks.filter((track) => track.title.includes("FEMTANYL")),
      source: "FEMTANYL",
    },
    {
      id: "playlist2",
      name: "Chill Gaming",
      description: "Relaxing game soundtracks",
      thumbnail: "/playlists/gaming.jpg",
      tracks: tracks.filter(
        (track) => track.title.includes("OST") || track.title.includes("TIME")
      ),
      source: "Various Games",
    },
  ]);
  const audioRef = useRef(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(playlists[0]);

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
    fetchRatings();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = `/songs/${tracks[currentTrack].filename}`;
      setPlaybackSpeed(tracks[currentTrack].defaultSpeed);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (isShuffle) {
      const shuffledTracks = [...currentPlaylist.tracks]
        .filter((_, i) => i !== currentTrack)
        .sort(() => Math.random() - 0.5);
      setNextTracks(shuffledTracks);
    } else {
      setNextTracks(currentPlaylist.tracks.slice(currentTrack + 1));
    }
  }, [currentTrack, isShuffle, currentPlaylist]);
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
  const fetchRatings = async () => {
    try {
      const response = await fetch("/api/ratings");
      const data = await response.json();
      setRatings(data);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };
  const handleRate = async (playlistId, rating) => {
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId, rating }),
      });
      const data = await response.json();
      setRatings(data);
    } catch (error) {
      console.error("Error rating playlist:", error);
    }
  };

  const PlaylistOverlay = ({ open, onClose }) => {
    const calculateAverageBpm = (tracks) => {
      return Math.round(
        tracks.reduce((acc, track) => acc + track.bpm, 0) / tracks.length
      );
    };

    if (!open) return null;

    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        {/* Backdrop with blur */}
        <Box
          onClick={onClose}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
          }}
        />

        {/* Paper content */}
        <Paper
          elevation={24}
          sx={{
            position: "relative",
            width: "90%",
            maxWidth: "1200px",
            maxHeight: "90vh",
            overflowY: "auto",
            m: 2,
            zIndex: 10000,
            boxShadow: "0 0 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Select Playlist
              </Typography>
              <IconButton
                onClick={onClose}
                sx={{
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "rotate(90deg)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  sx={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setCurrentPlaylist(playlist);
                    setCurrentTrack(0);
                    onClose();
                  }}
                >
                  <CardMedia
                    component="img"
                    image={playlist.thumbnail}
                    alt={playlist.name}
                    sx={{ height: 140, objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {playlist.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {playlist.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Average BPM: {calculateAverageBpm(playlist.tracks)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Source: {playlist.source}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRate(playlist.id, "up");
                        }}
                      >
                        <ThumbUpIcon />
                      </IconButton>
                      <Typography>{ratings[playlist.id]?.up || 0}</Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRate(playlist.id, "down");
                        }}
                      >
                        <ThumbDownIcon />
                      </IconButton>
                      <Typography>{ratings[playlist.id]?.down || 0}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>
    );
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
    if (currentTrack === currentPlaylist.tracks.length - 1) {
      if (isRepeat) {
        setCurrentTrack(0);
      } else {
        setIsPlaying(false);
      }
    } else {
      setCurrentTrack((prev) => prev + 1);
    }
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
      <Typography variant="h5" sx={{ mb: 2, color: "red" }}>
        !!!WARNING!!! THIS APP IS IN A VERY VERY INSABLE STATE, HERE BE DRAGONS
        AND BUGS.
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Next in Queue:
        </Typography>
        <Box sx={{ maxHeight: "100px", overflow: "auto" }}>
          {nextTracks.slice(0, 3).map((track, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: "text.secondary" }}
            >
              {index + 1}. {track.title}
            </Typography>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 200,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "80px",
            height: "80px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/jukebox/small_sun.png"
            alt="Small Sun"
            style={{
              top: 26,
              width: "60px",
              height: "60px",
              objectFit: "contain",
              imageRendering: "pixelated",
              position: "relative",
              zIndex: 1,
            }}
          />
        </Box>
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
        <Box sx={{ width: "120px", height: "120px" }}>
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
            width={120}
            height={120}
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
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
        <IconButton
          onClick={() => setIsShuffle(!isShuffle)}
          sx={{ color: isShuffle ? "primary.main" : "inherit" }}
        >
          <ShuffleIcon />
        </IconButton>
        <IconButton
          onClick={() => setIsRepeat(!isRepeat)}
          sx={{ color: isRepeat ? "primary.main" : "inherit" }}
        >
          <RepeatIcon />
        </IconButton>
        <IconButton onClick={() => setShowPlaylistModal(true)}>
          <QueueMusicIcon />
        </IconButton>
      </Box>

      <PlaylistOverlay
        open={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
      />
      <audio
        ref={audioRef}
        src={`/songs/${tracks[currentTrack].filename}`}
        onEnded={handleNextTrack}
      />
    </Box>
  );
}
