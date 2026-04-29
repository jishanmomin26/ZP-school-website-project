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
  const isPausedByTracker = useRef(false);   // true when WE paused the video
  const resumeDebounce = useRef(0);          // counts how many ticks face has been present while paused

  // Keep refs in sync with state/props
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

  // ═══════════════════════════════════════════════════════════════════
  //  SINGLE polling loop — handles anti-skip + face pause/resume
  //  This avoids all useEffect cleanup / stale closure bugs.
  // ═══════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    if (checkInterval.current) clearInterval(checkInterval.current);

    checkInterval.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      // Get real YouTube player state (1=PLAYING, 2=PAUSED, etc.)
      let playerState;
      try { playerState = player.getPlayerState(); } catch(e) { return; }

      const faceOk = isFacePresentRef.current;

      // ────────────────────────────────────────────────────────────
      // CASE 1: Face is ABSENT → pause the video if playing
      // ────────────────────────────────────────────────────────────
      if (!faceOk) {
        resumeDebounce.current = 0;    // reset resume counter

        if (playerState === 1 && !isPausedByTracker.current) {
          // Video is playing but face is gone — pause it
          isPausedByTracker.current = true;
          try { player.pauseVideo(); } catch(e) {}
          console.log('[AntiSkip] Paused by tracker — face absent');
        }
        // If already paused by tracker, do nothing (stay paused)
        return;
      }

      // ────────────────────────────────────────────────────────────
      // CASE 2: Face is PRESENT + we previously paused → resume
      // ────────────────────────────────────────────────────────────
      if (faceOk && isPausedByTracker.current) {
        resumeDebounce.current += 1;

        // Wait 1 tick (~1 second) of stable face before resuming
        if (resumeDebounce.current >= 1) {
          isPausedByTracker.current = false;
          resumeDebounce.current = 0;
          try {
            player.playVideo();
            console.log('[AntiSkip] Resumed — face is back');
          } catch(e) {
            console.error('[AntiSkip] playVideo() failed:', e);
          }
        }
        return;
      }

      // ────────────────────────────────────────────────────────────
      // CASE 3: Normal playback — anti-skip logic
      // ────────────────────────────────────────────────────────────
      if (playerState !== 1) return;  // not playing, skip

      const currentTime = player.getCurrentTime();
      const currentAllowed = lastAllowedTimeRef.current;
      
      // Anti-skip: snap back if jumped ahead
      if (currentTime > currentAllowed + 2) {
        player.seekTo(currentAllowed);
        toast.error("Skipping is not allowed!", { id: "skip_err" });
      } else if (currentTime > currentAllowed) {
        setLastAllowedTime(currentTime);
        lastAllowedTimeRef.current = currentTime;
      }

      // Report progress
      const dur = player.getDuration();
      if (dur > 0) {
        const perc = (Math.max(currentTime, currentAllowed) / dur) * 100;
        onProgressUpdate(perc, Math.max(currentTime, currentAllowed));
      }
    }, 1000);

    return () => { if (checkInterval.current) clearInterval(checkInterval.current); };
  }, [playerReady, onProgressUpdate]);

  // ═══════════════════════════════════════════════════════════════════
  //  YouTube state change — only handles manual pause blocking
  // ═══════════════════════════════════════════════════════════════════
  const onStateChange = useCallback((event) => {
    const state = event.data;

    if (state === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
      isPlayingRef.current = true;
    }

    if (state === YouTube.PlayerState.PAUSED) {
      setIsPlaying(false);
      isPlayingRef.current = false;

      // Block manual pause ONLY if face is present AND tracker didn't pause
      if (isFacePresentRef.current && !isPausedByTracker.current) {
        toast.error("You cannot pause this lecture manually.", { id: 'pause_warn' });
        setTimeout(() => {
          if (playerRef.current && isFacePresentRef.current && !isPausedByTracker.current) {
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

  // Cleanup on unmount
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
