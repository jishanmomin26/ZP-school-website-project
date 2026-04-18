import { useEffect, useRef, useState } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

const FaceTracker = ({ onTimeout, onPermissionError, onReady, isActive, isVideoPlaying }) => {
  const videoRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const lastFaceDetectedTime = useRef(Date.now());
  const requestRef = useRef(null);
  const streamRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        faceDetectorRef.current = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
            delegate: "GPU"
          },
          runningMode: "VIDEO"
        });
        
        if (isMounted && isActive) {
          startCamera();
        }
      } catch (error) {
        console.error("Face Detector initialization failed:", error);
      }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        if (isMounted) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
              setHasPermission(true);
              if (isMounted) onReady();
              lastFaceDetectedTime.current = Date.now();
              detectFrame();
            };
          }
        }
      } catch (error) {
        console.error("Camera access denied:", error);
        if (isMounted) onPermissionError(error);
      }
    };

    const detectFrame = async () => {
      if (!faceDetectorRef.current || !videoRef.current || !isActive) return;

      const startTimeMs = Date.now();
      const detections = faceDetectorRef.current.detectForVideo(videoRef.current, startTimeMs).detections;

      if (detections.length > 0) {
        lastFaceDetectedTime.current = Date.now();
      } else {
        if (isVideoPlaying) {
          const timeSinceLastFace = Date.now() - lastFaceDetectedTime.current;
          if (timeSinceLastFace > 10000) { // 10 seconds
            console.log("Face detection timeout triggered at:", timeSinceLastFace, "ms");
            if (isMounted) onTimeout();
            return; // Stop detecting once timeout triggered
          }
        } else {
          lastFaceDetectedTime.current = Date.now();
        }
      }

      requestRef.current = requestAnimationFrame(detectFrame);
    };

    if (isActive) {
      initDetector();
    }

    return () => {
      isMounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, isVideoPlaying, onTimeout, onPermissionError]);

  if (!isActive) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 pointer-events-none">
      {/* Green Privacy Dot */}
      <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
      </div>
      
      {/* Hidden Video element for processing */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />
    </div>
  );
};

export default FaceTracker;