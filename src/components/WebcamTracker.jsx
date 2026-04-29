import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Draggable from 'react-draggable';
import * as faceapi from '@vladmandic/face-api';
import toast from 'react-hot-toast';

const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';

// ── Thresholds ──────────────────────────────────────────────────────
const DISTRACTION_PAUSE_SEC = 5;
const FACE_MISSING_PAUSE_SEC = 5;
const DETECTION_INTERVAL_MS = 600;

// Head-pose geometry thresholds (normalised ratios)
// IMPORTANT: These are intentionally WIDE to avoid false positives.
// A normal forward gaze has offsetX ~0 and dropRatio ~0.45.
// Only clear, deliberate head turns should trigger distraction.
const HORIZ_THRESHOLD = 0.45;         // nose must be WAY off center → clear left/right turn
const VERT_DOWN_THRESHOLD = 0.70;     // nose must drop significantly → clearly looking down

// Require N consecutive non-forward detections before starting the timer.
// This filters out momentary glitches from face landmark jitter.
const DISTRACTION_CONFIRM_COUNT = 3;

// For resume: student must have 2 consecutive forward detections (~1.2 s)
const FORWARD_COUNT_TO_RESUME = 2;

/**
 * Estimate gaze direction from 68-point face landmarks.
 * Only detects CLEAR head turns — normal screen-watching posture → 'forward'.
 */
const estimateDirection = (landmarks) => {
  const pts = landmarks.positions;

  const leftJaw   = pts[0];
  const rightJaw  = pts[16];
  const noseTip   = pts[30];
  const noseBridge = pts[27];
  const chin      = pts[8];

  const faceW   = rightJaw.x - leftJaw.x;
  const centerX = (leftJaw.x + rightJaw.x) / 2;
  const offsetX = (noseTip.x - centerX) / faceW;

  const faceH     = chin.y - noseBridge.y;
  const dropRatio = (noseTip.y - noseBridge.y) / faceH;

  // Only flag clear, deliberate head turns
  if (offsetX < -HORIZ_THRESHOLD) return 'looking_right';
  if (offsetX >  HORIZ_THRESHOLD) return 'looking_left';
  if (dropRatio > VERT_DOWN_THRESHOLD) return 'looking_down';

  return 'forward';
};

// ─────────────────────────────────────────────────────────────────────

const WebcamTracker = ({ onFaceStatusChange, onDistractionChange, onReady, onError }) => {
  const webcamRef = useRef(null);
  const nodeRef   = useRef(null);

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraReady, setCameraReady]     = useState(false);
  const [displayDir, setDisplayDir]       = useState('forward');
  const [statusColor, setStatusColor]     = useState('emerald');

  // ── Mutable refs for tracking (no re-renders) ──
  const distractedSince   = useRef(null);
  const missingSince      = useRef(null);
  const forwardCount      = useRef(0);       // consecutive forward detections
  const distractionCount  = useRef(0);       // consecutive non-forward detections (filter noise)
  const isPausedRef       = useRef(false);

  // Store latest callbacks in refs so the interval never goes stale
  const onFaceStatusRef   = useRef(onFaceStatusChange);
  const onDistractionRef  = useRef(onDistractionChange);
  useEffect(() => { onFaceStatusRef.current = onFaceStatusChange; }, [onFaceStatusChange]);
  useEffect(() => { onDistractionRef.current = onDistractionChange; }, [onDistractionChange]);

  // ── Load models ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error('Model load error', err);
        toast.error('Failed to load face-tracking AI models.');
      }
    })();
  }, []);

  // ── Camera callbacks ──────────────────────────────────────────────
  const handleUserMedia = useCallback(() => {
    setCameraReady(true);
    if (onReady) onReady();
  }, [onReady]);

  const handleUserMediaError = useCallback((err) => {
    console.error('Camera error:', err);
    if (onError) onError(err);
  }, [onError]);

  // ── Pause helper ──────────────────────────────────────────────────
  const doPause = useCallback((reason) => {
    if (isPausedRef.current) return;
    isPausedRef.current = true;
    forwardCount.current = 0;
    onFaceStatusRef.current(false);
    if (onDistractionRef.current) onDistractionRef.current(reason);
    toast.error(
      reason === 'face_missing'
        ? '🚶 You seem to have left — video paused!'
        : '⚠️ Please pay attention to the screen!',
      { id: 'distraction_warn' }
    );
  }, []);

  // ── Resume helper ─────────────────────────────────────────────────
  const doResume = useCallback(() => {
    if (!isPausedRef.current) return;
    isPausedRef.current = false;
    onFaceStatusRef.current(true);
    if (onDistractionRef.current) onDistractionRef.current(null);
    toast.success('✅ Welcome back — resuming!', { id: 'refocus_info' });
  }, []);

  // ── Main detection loop (stable deps — never restarts) ────────────
  useEffect(() => {
    if (!isModelLoaded || !cameraReady) return;

    const id = setInterval(async () => {
      const cam = webcamRef.current;
      if (!cam?.video || cam.video.readyState !== 4) return;

      try {
        const result = await faceapi
          .detectSingleFace(cam.video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.3,
          }))
          .withFaceLandmarks(true);

        const now = Date.now();

        if (result) {
          // ─── FACE VISIBLE ────────────────────────────────
          missingSince.current = null;

          const dir = estimateDirection(result.landmarks);
          setDisplayDir(dir);

          if (dir === 'forward') {
            // ── Looking at screen ──
            distractionCount.current = 0;   // reset noise filter
            distractedSince.current = null;

            if (isPausedRef.current) {
              // Count consecutive forward detections
              forwardCount.current += 1;
              setStatusColor('blue');

              if (forwardCount.current >= FORWARD_COUNT_TO_RESUME) {
                doResume();
                forwardCount.current = 0;
                setStatusColor('emerald');
              }
            } else {
              forwardCount.current = 0;
              setStatusColor('emerald');
            }
          } else {
            // ── Looking away ──
            forwardCount.current = 0;  // reset forward counter
            distractionCount.current += 1;

            // Only start the timer after DISTRACTION_CONFIRM_COUNT
            // consecutive non-forward detections (filters jitter)
            if (distractionCount.current >= DISTRACTION_CONFIRM_COUNT) {
              if (!distractedSince.current) {
                distractedSince.current = now;
              }

              const elapsed = (now - distractedSince.current) / 1000;
              if (elapsed >= DISTRACTION_PAUSE_SEC) {
                doPause(dir);
              }
            }

            setStatusColor(isPausedRef.current ? 'red' : 'amber');
          }
        } else {
          // ─── NO FACE ─────────────────────────────────────
          setDisplayDir('absent');
          distractedSince.current = null;
          forwardCount.current = 0;

          if (!missingSince.current) {
            missingSince.current = now;
          }

          const elapsed = (now - missingSince.current) / 1000;
          if (elapsed >= FACE_MISSING_PAUSE_SEC) {
            doPause('face_missing');
          }

          setStatusColor(isPausedRef.current ? 'red' : 'amber');
        }
      } catch (err) {
        console.error('Detection error:', err);
      }
    }, DETECTION_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isModelLoaded, cameraReady, doPause, doResume]);

  // ── UI helpers ────────────────────────────────────────────────────
  const label = (() => {
    switch (displayDir) {
      case 'looking_left':  return '👈 Looking Left';
      case 'looking_right': return '👉 Looking Right';
      case 'looking_down':  return '👇 Looking Down';
      case 'absent':        return '⛔ Missing';
      default:              return '✅ Focused';
    }
  })();

  const borderCls =
    statusColor === 'emerald' ? 'border-emerald-500' :
    statusColor === 'blue'    ? 'border-blue-400'    :
    statusColor === 'amber'   ? 'border-amber-500'   :
                                'border-red-500';

  const arrowMap = { looking_down: '↓', looking_up: '↑', looking_left: '←', looking_right: '→' };

  return (
    <Draggable bounds="parent" nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        className={`absolute bottom-6 right-6 w-48 h-36 rounded-xl overflow-hidden cursor-move shadow-2xl z-50 border-4 transition-colors duration-300 ${borderCls}`}
      >
        {!isModelLoaded && (
          <div className="absolute inset-0 bg-dark-800 flex items-center justify-center text-xs text-white z-10">
            Loading AI…
          </div>
        )}

        <Webcam
          ref={webcamRef}
          audio={false}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          mirrored
          videoConstraints={{ facingMode: 'user', width: 320, height: 240 }}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
        />

        {/* Status badge */}
        <div className="absolute bottom-2 left-2 bg-dark-900/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
          {label}
        </div>

        {/* Direction arrow */}
        {arrowMap[displayDir] && (
          <div className="absolute top-2 right-2 bg-amber-500/90 text-dark-900 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
            {arrowMap[displayDir]}
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default WebcamTracker;
