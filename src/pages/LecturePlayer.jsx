import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { lecturesData } from '../data/lectures';
import AntiSkipPlayer from '../components/AntiSkipPlayer';
import WebcamTracker from '../components/WebcamTracker';

const LecturePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lecture = lecturesData.find((l) => l.id === parseInt(id));

  const [isFacePresent, setIsFacePresent] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [initialProgress, setInitialProgress] = useState(0);

  useEffect(() => {
    if (!lecture) return;

    // Check local storage for existing progress
    const storedData = localStorage.getItem(`lectureProgress_${lecture.id}`);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setInitialProgress(parsed.percentage || 0);
      } catch (e) {
        console.error("Error parsing progress", e);
      }
    }
  }, [lecture]);

  // Called by WebcamTracker once camera stream is active
  const handleCameraReady = () => {
    setPermissionGranted(true);
  };

  // Called by WebcamTracker if camera permission is denied
  const handleCameraError = () => {
    alert("Camera permission is required to track presence for this lecture.");
    navigate('/video-lectures');
  };

  const handleProgressUpdate = (percentage, currentTime) => {
    if (!lecture) return;
    const isCompleted = percentage >= 95;
    const progressData = {
      lectureId: lecture.id,
      watchedTime: currentTime,
      percentage: percentage,
      completed: isCompleted,
    };
    localStorage.setItem(`lectureProgress_${lecture.id}`, JSON.stringify(progressData));
  };

  if (!lecture) {
    return <div className="min-h-screen flex items-center justify-center text-white">Lecture not found</div>;
  }

  return (
    <div className="relative min-h-screen bg-dark-900 overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="bg-dark-800 border-b border-dark-700 py-4 px-6 flex items-center gap-4 z-40">
        <button 
          onClick={() => navigate('/video-lectures')}
          className="w-10 h-10 rounded-full bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-white transition-colors"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-white font-poppins font-bold text-lg">{lecture.title}</h1>
          <p className="text-dark-400 text-sm">{lecture.subject} • {lecture.duration}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-grow flex items-center justify-center bg-black p-4 lg:p-8">
        
        {/* Show loading screen while camera is initializing */}
        {!permissionGranted && (
          <div className="absolute inset-0 z-30 bg-dark-900 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold">Requesting camera permission...</p>
              <p className="text-dark-400 text-sm mt-2">Please allow camera access to continue</p>
            </div>
          </div>
        )}

        {/* Anti-Skip Player Wrapper — only renders after camera is ready */}
        {permissionGranted && (
          <div className={`w-full max-w-6xl aspect-video relative transition-all duration-700 ${!isFacePresent ? 'blur-md scale-95 opacity-50' : ''}`}>
            <AntiSkipPlayer 
              videoId={lecture.youtubeId} 
              isFacePresent={isFacePresent}
              onProgressUpdate={handleProgressUpdate}
              initialProgress={initialProgress}
            />
          </div>
        )}

        {/* Draggable Webcam Tracker — always rendered so it can request camera */}
        <WebcamTracker
          onFaceStatusChange={(status) => setIsFacePresent(status)}
          onReady={handleCameraReady}
          onError={handleCameraError}
        />

        {/* Warning Overlay */}
        <AnimatePresence>
          {!isFacePresent && permissionGranted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/40 backdrop-blur-sm"
            >
              <div className="bg-red-500/10 border border-red-500/50 backdrop-blur-md rounded-2xl p-8 max-w-lg text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                  <FaExclamationTriangle className="text-4xl" />
                </div>
                <h2 className="text-2xl font-bold font-poppins text-white mb-4">Attention Required</h2>
                <p className="text-red-100/80 text-lg leading-relaxed">
                  Please stay in front of the screen to continue the lecture. Playback has been automatically paused.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default LecturePlayer;

