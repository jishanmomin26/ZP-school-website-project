import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import Draggable from 'react-draggable';
import * as faceapi from '@vladmandic/face-api';
import toast from 'react-hot-toast';

const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';

const WebcamTracker = ({ onFaceStatusChange, onReady, onError }) => {
  const webcamRef = useRef(null);
  const [isFaceDetected, setIsFaceDetected] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const missingStartTime = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Error loading face-api models", err);
        toast.error("Failed to load AI models for presence tracking.");
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!isModelLoaded) return;

    const detectInterval = setInterval(async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        
        // Detect face
        const detection = await faceapi.detectSingleFace(
          video, 
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })
        );

        if (detection) {
          // Face detected
          if (!isFaceDetected) {
            setIsFaceDetected(true);
            onFaceStatusChange(true);
            missingStartTime.current = null;
          }
        } else {
          // No face detected
          if (!missingStartTime.current) {
            missingStartTime.current = Date.now();
          } else {
            const missingDuration = (Date.now() - missingStartTime.current) / 1000;
            // Missing for more than 10 seconds
            if (missingDuration > 10 && isFaceDetected) {
              setIsFaceDetected(false);
              onFaceStatusChange(false);
            }
          }
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(detectInterval);
  }, [isModelLoaded, isFaceDetected, onFaceStatusChange]);

  return (
    <Draggable bounds="parent">
      <div 
        className={`absolute bottom-6 right-6 w-48 h-36 rounded-xl overflow-hidden cursor-move shadow-2xl z-50 border-4 transition-colors duration-300 ${
          isFaceDetected ? 'border-emerald-500' : 'border-red-500'
        }`}
      >
        {!isModelLoaded && (
          <div className="absolute inset-0 bg-dark-800 flex items-center justify-center text-xs text-white z-10">
            Loading AI...
          </div>
        )}
        <Webcam
          ref={webcamRef}
          audio={false}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          mirrored={true}
          videoConstraints={{ facingMode: 'user', width: 320, height: 240 }}
          onUserMedia={() => onReady && onReady()}
          onUserMediaError={(err) => onError && onError(err)}
        />
        {/* Status Indicator */}
        <div className="absolute bottom-2 left-2 bg-dark-900/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
          {isFaceDetected ? 'Presence Detected' : 'Missing'}
        </div>
      </div>
    </Draggable>
  );
};

export default WebcamTracker;
