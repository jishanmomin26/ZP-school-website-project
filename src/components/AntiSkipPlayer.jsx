import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  const [playerReady, setPlayerReady] = useState(false);
  const checkInterval = useRef(null);
  const lastAllowedTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isFacePresentRef = useRef(true);
  const isPausedBySystem = useRef(false);

  // Keep refs in sync
  useEffect(() => { lastAllowedTimeRef.current = lastAllowedTime; }, [lastAllowedTime]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isFacePresentRef.current = isFacePresent; }, [isFacePresent]);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onReady = useCallback((event) => {
    playerRef.current = event.target;
    const dur = event.target.getDuration();
    setPlayerReady(true);
    
    if (initialProgress > 0 && dur > 0) {
      const resumeTime = (initialProgress / 100) * dur;
      setLastAllowedTime(resumeTime);
      lastAllowedTimeRef.current = resumeTime;
      event.target.seekTo(resumeTime);
    }

    event.target.playVideo();
  }, [initialProgress]);

  // Anti-skip tracking
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    if (checkInterval.current) clearInterval(checkInterval.current);

    checkInterval.current = setInterval(() => {
      if (!playerRef.current || !isPlayingRef.current) return;

      const currentTime = playerRef.current.getCurrentTime();
      const currentAllowed = lastAllowedTimeRef.current;
      
      if (currentTime > currentAllowed + 2) {
        playerRef.current.seekTo(currentAllowed);
        toast.error("Skipping is not allowed!", { id: "skip_err" });
      } else if (currentTime > currentAllowed) {
        setLastAllowedTime(currentTime);
        lastAllowedTimeRef.current = currentTime;
      }

      const dur = playerRef.current.getDuration();
      if (dur > 0) {
        const perc = (Math.max(currentTime, currentAllowed) / dur) * 100;
        onProgressUpdate(perc, Math.max(currentTime, currentAllowed));
      }
    }, 1000);

    return () => { if (checkInterval.current) clearInterval(checkInterval.current); };
  }, [playerReady, onProgressUpdate]);

  // ── Face presence → pause / resume ────────────────────────────────
  // Using a ref-based approach to avoid cleanup killing the timeout
  useEffect(() => {
    if (!playerRef.current || !playerReady) return;

    if (!isFacePresent) {
      // PAUSE immediately
      isPausedBySystem.current = true;
      try { playerRef.current.pauseVideo(); } catch(e) {}
    } else if (isFacePresent && isPausedBySystem.current) {
      // RESUME — use a simple setTimeout that we DON'T clean up on unmount
      // because we want it to fire even if there's a quick re-render
      isPausedBySystem.current = false;
      const t = setTimeout(() => {
        if (playerRef.current && isFacePresentRef.current) {
          try { playerRef.current.playVideo(); } catch(e) {}
        }
      }, 500);
      // Only cancel if component fully unmounts
      return () => clearTimeout(t);
    }
  }, [isFacePresent, playerReady]);

  // YouTube state change
  const onStateChange = useCallback((event) => {
    const state = event.data;

    if (state === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
      isPlayingRef.current = true;
    }

    if (state === YouTube.PlayerState.PAUSED) {
      setIsPlaying(false);
      isPlayingRef.current = false;

      // Only block manual pause if face is present AND system didn't pause
      if (isFacePresentRef.current && !isPausedBySystem.current) {
        toast.error("You cannot pause this lecture manually.", { id: 'pause_warn' });
        setTimeout(() => {
          if (playerRef.current && isFacePresentRef.current && !isPausedBySystem.current) {
            try { playerRef.current.playVideo(); } catch(e) {}
          }
        }, 1000);
      }
    }

    if (state === YouTube.PlayerState.ENDED) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      const dur = playerRef.current ? playerRef.current.getDuration() : 0;
      onProgressUpdate(100, dur);
    }
  }, [onProgressUpdate]);

  useEffect(() => {
    return () => { if (checkInterval.current) clearInterval(checkInterval.current); };
  }, []);

  return (
    <div 
      className="anti-skip-player-wrapper relative w-full h-full bg-black rounded-2xl overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
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
