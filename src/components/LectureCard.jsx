import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaCheckCircle, FaClock, FaBook } from 'react-icons/fa';

const LectureCard = ({ lecture }) => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(`lectureProgress_${lecture.youtubeId}`);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setProgress(parsed.percentage || 0);
        setIsCompleted(parsed.completed || false);
      }
    } catch (e) {
      console.error('Error parsing progress data', e);
    }
  }, [lecture.youtubeId]);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg border border-dark-100 dark:border-dark-700 hover:shadow-xl group flex flex-col h-full relative"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={lecture.thumbnail}
          alt={lecture.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent"></div>
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-lg">
            <FaPlay className="text-xl ml-1" />
          </div>
        </div>

        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white p-2 rounded-full shadow-lg" title="Completed">
            <FaCheckCircle className="text-lg" />
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-dark-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
          <FaClock /> {lecture.duration}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-dark-200 dark:bg-dark-700">
        <div 
          className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-primary-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 mb-2">
          <FaBook />
          {lecture.subject}
        </div>
        
        <h3 className="font-poppins font-bold text-lg text-dark-900 dark:text-white line-clamp-2 mb-4 flex-grow group-hover:text-primary-500 transition-colors">
          {lecture.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div className="text-sm font-medium text-dark-500 dark:text-dark-400">
            {progress > 0 && !isCompleted ? `${Math.round(progress)}% Watched` : isCompleted ? 'Completed' : 'Not Started'}
          </div>
          <Link
            to={`/video-lectures/${lecture.youtubeId}`}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              isCompleted 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                : 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100'
            }`}
          >
            {progress > 0 && !isCompleted ? 'Resume' : 'Watch Now'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default LectureCard;
