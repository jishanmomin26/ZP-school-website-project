import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaEye, FaUserSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import useYouTubeVideos from '../hooks/useYouTubeVideos';
import AntiSkipPlayer from '../components/AntiSkipPlayer';
import WebcamTracker from '../components/WebcamTracker';

const LecturePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { videos, loading } = useYouTubeVideos();
  const lecture = videos.find((l) => l.youtubeId === id);

  const [isFacePresent, setIsFacePresent] = useState(true);
  const [distractionReason, setDistractionReason] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [initialProgress, setInitialProgress] = useState(0);

  useEffect(() => {
    if (!lecture) return;
    const storedData = localStorage.getItem(`lectureProgress_${lecture.youtubeId}`);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setInitialProgress(parsed.percentage || 0);
      } catch (e) {
        console.error("Error parsing progress", e);
      }
    }
  }, [lecture]);

  // ── Stable callbacks (useCallback prevents re-creation on every render) ──
  const handleFaceStatusChange = useCallback((status) => {
    setIsFacePresent(status);
  }, []);

  const handleDistractionChange = useCallback((reason) => {
    setDistractionReason(reason);
  }, []);

  const handleCameraReady = useCallback(() => {
    setPermissionGranted(true);
  }, []);

  const handleCameraError = useCallback(() => {
    alert("Camera permission is required to track presence for this lecture.");
    navigate('/video-lectures');
  }, [navigate]);

  const handleProgressUpdate = useCallback((percentage, currentTime) => {
    if (!lecture) return;
    const isCompleted = percentage >= 95;
    const progressData = {
      lectureId: lecture.youtubeId,
      watchedTime: currentTime,
      percentage: percentage,
      completed: isCompleted,
    };
    localStorage.setItem(`lectureProgress_${lecture.youtubeId}`, JSON.stringify(progressData));
  }, [lecture]);

  // Get contextual distraction message
  const getDistractionInfo = () => {
    switch (distractionReason) {
      case 'looking_left':
        return {
          icon: <FaEye className="text-4xl" />,
          title: 'Please Pay Attention!',
          message: 'You have been looking away from the screen. Please focus on the video to continue the lecture.',
          color: 'amber',
        };
      case 'looking_right':
        return {
          icon: <FaEye className="text-4xl" />,
          title: 'Please Pay Attention!',
          message: 'You have been looking away from the screen. Please focus on the video to continue the lecture.',
          color: 'amber',
        };
      case 'looking_down':
        return {
          icon: <FaEye className="text-4xl" />,
          title: 'Please Pay Attention!',
          message: 'You have been looking down for too long. Please look at the screen to continue the lecture.',
          color: 'amber',
        };
      case 'looking_up':
        return {
          icon: <FaEye className="text-4xl" />,
          title: 'Please Pay Attention!',
          message: 'You have been looking away from the screen. Please focus on the video to continue the lecture.',
          color: 'amber',
        };
      case 'face_missing':
        return {
          icon: <FaUserSlash className="text-4xl" />,
          title: 'Where Are You?',
          message: 'You seem to have left the screen. Please come back and sit in front of the camera to continue.',
          color: 'red',
        };
      default:
        return {
          icon: <FaExclamationTriangle className="text-4xl" />,
          title: 'Please Pay Attention!',
          message: 'Please stay in front of the screen to continue the lecture. Playback has been automatically paused.',
          color: 'red',
        };
    }
  };

  // Show loading while fetching videos from YouTube API
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">Loading lecture...</p>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return <div className="min-h-screen flex items-center justify-center text-white">Lecture not found</div>;
  }

  const distractionInfo = getDistractionInfo();
  const isDistracted = !isFacePresent && permissionGranted;
  const isAmber = distractionInfo.color === 'amber';

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
        
        {/* Loading screen while camera initializes */}
        {!permissionGranted && (
          <div className="absolute inset-0 z-30 bg-dark-900 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold">Requesting camera permission...</p>
              <p className="text-dark-400 text-sm mt-2">Please allow camera access to continue</p>
            </div>
          </div>
        )}

        {/* Video Player */}
        {permissionGranted && (
          <div className={`w-full max-w-6xl aspect-video relative transition-all duration-700 ${isDistracted ? 'blur-md scale-95 opacity-50' : ''}`}>
            <AntiSkipPlayer 
              videoId={lecture.youtubeId} 
              isFacePresent={isFacePresent}
              onProgressUpdate={handleProgressUpdate}
              initialProgress={initialProgress}
            />
          </div>
        )}

        {/* Webcam Tracker */}
        <WebcamTracker
          onFaceStatusChange={handleFaceStatusChange}
          onDistractionChange={handleDistractionChange}
          onReady={handleCameraReady}
          onError={handleCameraError}
        />

        {/* Warning Overlay */}
        <AnimatePresence>
          {isDistracted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/40 backdrop-blur-sm"
            >
              <div className={`backdrop-blur-md rounded-2xl p-8 max-w-lg text-center shadow-2xl ${
                isAmber 
                  ? 'bg-amber-500/10 border border-amber-500/50' 
                  : 'bg-red-500/10 border border-red-500/50'
              }`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  isAmber 
                    ? 'bg-amber-500/20 text-amber-500' 
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {distractionInfo.icon}
                </div>
                <h2 className="text-2xl font-bold font-poppins text-white mb-4">
                  {distractionInfo.title}
                </h2>
                <p className={`text-lg leading-relaxed ${
                  isAmber ? 'text-amber-100/80' : 'text-red-100/80'
                }`}>
                  {distractionInfo.message}
                </p>
                {/* Pulsing indicator */}
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className={`w-3 h-3 rounded-full animate-ping ${
                    isAmber ? 'bg-amber-500' : 'bg-red-500'
                  }`}></span>
                  <span className={`text-sm font-semibold uppercase tracking-wider ${
                    isAmber ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    Video Paused
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default LecturePlayer;
