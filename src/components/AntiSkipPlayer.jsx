import React, { useRef, useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import toast from 'react-hot-toast';

const AntiSkipPlayer = ({ 
  videoId, 
  isFacePresent, 
  onProgressUpdate,
  initialProgress = 0
}) => {
  const playerRef = useRef(null);
  const [lastAllowedTime, setLastAllowedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const checkInterval = useRef(null);
  const resumeTimeout = useRef(null);
  
  // YouTube player options
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      disablekb: 1, // Disable keyboard controls
      modestbranding: 1,
      rel: 0,
    },
  };

  const onReady = (event) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
    
    // Resume from initial progress
    if (initialProgress > 0) {
      const resumeTime = (initialProgress / 100) * event.target.getDuration();
      setLastAllowedTime(resumeTime);
      event.target.seekTo(resumeTime);
    }
    
    startTracking();
  };

  // Enforce face presence
  useEffect(() => {
    if (!playerRef.current) return;
    
    if (!isFacePresent && isPlaying) {
      playerRef.current.pauseVideo();
    } else if (isFacePresent && !isPlaying) {
      // Small delay prevents erratic play/pause toggles
      setTimeout(() => {
         playerRef.current.playVideo();
      }, 500);
    }
  }, [isFacePresent, isPlaying]);

  const startTracking = () => {
    if (checkInterval.current) clearInterval(checkInterval.current);
    
    checkInterval.current = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const currentTime = playerRef.current.getCurrentTime();
        
        // Anti-skip logic
        if (currentTime > lastAllowedTime + 2) {
          // Player tried to skip ahead
          playerRef.current.seekTo(lastAllowedTime);
          toast.error("Skipping is not allowed!", { id: "skip_err" });
        } else {
          // Normal playback update
          if (currentTime > lastAllowedTime) {
           setLastAllowedTime(currentTime);
          }
        }

        // Emit progress
        if (duration > 0) {
          const perc = (Math.max(currentTime, lastAllowedTime) / duration) * 100;
          onProgressUpdate(perc, Math.max(currentTime, lastAllowedTime));
        }
      }
    }, 1000);
  };

  const onStateChange = (event) => {
    const state = event.data;
    
    // Play state
    if (state === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    }

    // Pause state - auto resume if face is present
    if (state === YouTube.PlayerState.PAUSED) {
      setIsPlaying(false);
      if (isFacePresent) {
        toast.error("You cannot pause this lecture manually.", { id: 'pause_warn' });
        resumeTimeout.current = setTimeout(() => {
          if (playerRef.current) playerRef.current.playVideo();
        }, 1000);
      }
    }
    
    // Ended state
    if (state === YouTube.PlayerState.ENDED) {
      setIsPlaying(false);
      onProgressUpdate(100, duration);
    }
  };

  useEffect(() => {
    return () => {
      if (checkInterval.current) clearInterval(checkInterval.current);
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };
  }, []);

  // Prevent Context Menu (Right Click)
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <div 
      className="relative w-full h-full bg-black rounded-2xl overflow-hidden"
      onContextMenu={handleContextMenu}
    >
      {/* Invisible overlay to block click/drag interactions if we want full strictness, 
          but we need to let them use the YouTube volume/fullscreen controls.
          To perfectly disable timeline seeking, we rely on the logic loop snapping them back.
      */}
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
};

export default AntiSkipPlayer;
