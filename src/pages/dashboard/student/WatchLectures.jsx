import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRegClock, FaCheckCircle, FaYoutube, FaLock, FaBookOpen, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import FaceTracker from '../../../components/dashboard/FaceTracker';
import { FaVideo, FaExclamationTriangle } from 'react-icons/fa';

const WatchLectures = () => {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [progress, setProgress] = useState({}); // { lectureId: { percent, skips: [], lastPosition, timeSpent } }
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const liveTimerRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showCameraPermissionPrompt, setShowCameraPermissionPrompt] = useState(false);
  const [cameraRetryCount, setCameraRetryCount] = useState(0);
  const [lectureEnded, setLectureEnded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Load lectures and progress from localStorage
  useEffect(() => {
    const savedLectures = localStorage.getItem('zpkudave_lectures');
    const savedProgress = localStorage.getItem('zpkudave_progress');
    const pendingCameraRejection = localStorage.getItem('zpkudave_pendingLecture');
    
    if (savedLectures) {
      setLectures(JSON.parse(savedLectures));
    }
    
    if (savedProgress) {
      const allProgress = JSON.parse(savedProgress);
      const studentData = allProgress[user?.studentId] || {};
      
      // Normalize data
      const normalizedData = {};
      Object.entries(studentData).forEach(([id, data]) => {
        if (typeof data === 'number') {
          normalizedData[id] = { percent: data, skips: [], lastPosition: 0, timeSpent: 0 };
        } else {
          normalizedData[id] = { 
            percent: data.percent || 0, 
            skips: data.skips || [], 
            lastPosition: data.lastPosition || 0,
            timeSpent: data.timeSpent || 0
          };
        }
      });
      
      setProgress(normalizedData);
    }

    // Check if there's a pending lecture from previous page refresh
    if (pendingCameraRejection) {
      const pendingLecture = JSON.parse(pendingCameraRejection);
      setSelectedLecture(pendingLecture);
      setShowCameraPermissionPrompt(true);
      localStorage.removeItem('zpkudave_pendingLecture');
    }

    // Load YouTube API script
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    };
  }, [user]);

  // Handle progress updates including live tracking and position
  const updateProgress = (lectureId, percent, skipDelta = 0, currentPos = 0, timeSpentDelta = 0) => {
    setProgress(prev => {
      const currentData = prev[lectureId] || { percent: 0, skips: [], lastPosition: 0, timeSpent: 0 };
      const newPercent = Math.max(currentData.percent || 0, Math.floor(percent || 0));
      const newTimeSpent = (currentData.timeSpent || 0) + timeSpentDelta;
      
      let newSkips = [...(currentData.skips || [])];
      if (skipDelta > 0) {
        newSkips.push({ duration: skipDelta, at: newPercent });
      }

      const newProgress = { 
        ...prev, 
        [lectureId]: { 
          percent: newPercent, 
          skips: newSkips, 
          lastPosition: currentPos || currentData.lastPosition,
          timeSpent: newTimeSpent
        } 
      };

      // Save to localStorage
      const allProgress = JSON.parse(localStorage.getItem('zpkudave_progress') || '{}');
      allProgress[user?.studentId] = newProgress;
      localStorage.setItem('zpkudave_progress', JSON.stringify(allProgress));

      return newProgress;
    });
  };

  const startTracking = (lectureId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    lastTimeRef.current = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        
        // Skip detection
        const timeDiff = currentTime - lastTimeRef.current;
        let skipDelta = 0;
        if (timeDiff > 3) {
          skipDelta = Math.floor(timeDiff);
        }

        if (duration > 0) {
          const percent = Math.floor((currentTime / duration) * 100);
          updateProgress(lectureId, percent, skipDelta, currentTime, 1); // 1 second spent
        }
        
        lastTimeRef.current = currentTime;
      }
    }, 1000); 
  };

  const handleVideoSelect = (lecture) => {
    if (lecture.type !== 'youtube') {
      window.open(lecture.url, '_blank');
      // Start a "Live Tracking" pulse for external links (simulated while tab is visible)
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
      liveTimerRef.current = setInterval(() => {
        updateProgress(lecture.id, 100, 0, 0, 10); // Log 10 seconds spent every 10s pulse
      }, 10000);
      return;
    }
    setSelectedLecture(lecture);
    
    const resumePos = progress[lecture.id]?.lastPosition || 0;

    setTimeout(() => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: lecture.videoId,
          playerVars: {
            start: Math.floor(resumePos),
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 1,
            iv_load_policy: 3
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsVideoPlaying(true);
                setLectureEnded(false);
                startTracking(lecture.id);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                setIsVideoPlaying(false);
                setLectureEnded(true);
              } else {
                setIsVideoPlaying(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
              }
            }
          }
        });
      }
    }, 500);
  };

  const closePlayer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // If closing due to camera error, save the lecture so user can retry after refresh
    if (cameraError && selectedLecture) {
      localStorage.setItem('zpkudave_pendingLecture', JSON.stringify(selectedLecture));
    }
    
    setSelectedLecture(null);
    playerRef.current = null;
    setIsCameraReady(false);
    setCameraError(null);
    setShowCameraPermissionPrompt(false);
    setCameraRetryCount(0);
    setLectureEnded(false);
  };

  const handleTimeout = () => {
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
    closePlayer();
    toast.error("Lecture stopped: No face detected for 10 seconds.", {
      duration: 6000,
      icon: '👤'
    });
  };

  const handlePermissionError = (err) => {
    setCameraError("Camera permission is required to watch lectures. Please enable your webcam and try again.");
    setIsCameraReady(false);
    setShowCameraPermissionPrompt(true);
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  };

  // Group lectures by subject
  const groupedLectures = lectures.reduce((acc, lecture) => {
    const sub = lecture.subject || 'Other';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(lecture);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-800">Learning Center</h1>
          <p className="text-dark-500 text-sm">Watch recorded lectures and track your progress</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-dark-100">
          <FaBookOpen className="text-primary-500" />
          <span className="text-sm font-semibold text-dark-700">Course Materials</span>
        </div>
      </div>

      <div className="space-y-12">
        {lectures.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-dark-200">
            <FaYoutube className="text-5xl text-dark-100 mx-auto mb-4" />
            <h3 className="text-dark-600 font-semibold">No lectures available yet</h3>
            <p className="text-dark-400 text-sm">Your teacher hasn't uploaded any materials yet.</p>
          </div>
        ) : (
          Object.keys(groupedLectures).map(subject => (
            <div key={subject} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 bg-primary-600 rounded-full" />
                <h2 className="text-xl font-bold text-dark-800 uppercase tracking-wide">{subject}</h2>
                <span className="text-dark-400 text-sm font-medium">({groupedLectures[subject].length} Modules)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedLectures[subject].map(lecture => {
                  const lectureData = progress[lecture.id] || { percent: 0, skipped: 0 };
                  const lectureProgress = lectureData.percent;
                  return (
                    <motion.div
                      key={lecture.id}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-dark-100 group"
                    >
                      <div className="relative aspect-video bg-dark-900 overflow-hidden">
                        {lecture.type === 'youtube' ? (
                          <img
                            src={`https://img.youtube.com/vi/${lecture.videoId}/mqdefault.jpg`}
                            alt={lecture.title}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary-900">
                            <FaVideo className="text-4xl text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent flex items-center justify-center">
                          <button
                            onClick={() => handleVideoSelect(lecture)}
                            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-primary-500 hover:border-primary-500 transition-all duration-300"
                          >
                            <FaPlay className="ml-1" />
                          </button>
                        </div>
                        {lectureProgress === 100 && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                            <FaCheckCircle className="text-xs" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-dark-800 mb-2 line-clamp-1">{lecture.title}</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs text-dark-500">
                            <span className="flex items-center gap-1">
                              <FaRegClock /> {lecture.type === 'youtube' ? 'Video' : 'Meeting'}
                            </span>
                          </div>
                          <div className="h-1.5 bg-dark-50 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-100" style={{ width: '100%' }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Video Player Overlay */}
      <AnimatePresence>
        {selectedLecture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-900/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 sm:p-8"
          >
            <div className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl">
              <button
                onClick={closePlayer}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <FaTimes />
              </button>
              
              <div className="aspect-video w-full bg-black relative">
                {!isCameraReady && !cameraError && (
                  <div className="absolute inset-0 z-20 bg-dark-900 flex flex-col items-center justify-center text-white p-6 text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <h3 className="text-xl font-bold mb-2">Initializing Secure Environment...</h3>
                    <p className="text-dark-400 max-w-md">Please allow camera access when prompted. This is required for real-time monitoring.</p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 z-30 bg-dark-900 flex flex-col items-center justify-center text-white p-6 text-center">
                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                      <FaExclamationTriangle className="text-2xl" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Camera Access Required</h3>
                    <p className="text-dark-400 max-w-md mb-6">{cameraError}</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={retryCameraAccess}
                        className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors font-semibold"
                      >
                        Retry
                      </button>
                      <button 
                        onClick={closePlayer}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                )}

                <div id="youtube-player"></div>
                
                {lectureEnded && (
                  <div className="absolute inset-0 z-50 bg-dark-900/80 flex flex-col items-center justify-center text-white p-6 text-center">
                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                      <FaCheckCircle className="text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Lecture Completed! 🎉</h3>
                    <p className="text-dark-300 max-w-md mb-6">Great job! You've finished watching this lecture.</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          playerRef.current?.seekTo(0);
                          playerRef.current?.playVideo();
                          setLectureEnded(false);
                        }}
                        className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors font-semibold"
                      >
                        Watch Again
                      </button>
                      <button 
                        onClick={closePlayer}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                )}
                
                {selectedLecture && (
                  <FaceTracker 
                    key={`${selectedLecture.id}-${cameraRetryCount}`}
                    isActive={!!selectedLecture}
                    isVideoPlaying={isVideoPlaying}
                    onTimeout={handleTimeout}
                    onPermissionError={handlePermissionError}
                    onReady={() => setIsCameraReady(true)}
                  />
                )}
              </div>

              <div className="p-6 bg-white border-t border-dark-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-dark-800">{selectedLecture.title}</h2>
                    <p className="text-dark-500 text-sm mt-1">{selectedLecture.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchLectures;