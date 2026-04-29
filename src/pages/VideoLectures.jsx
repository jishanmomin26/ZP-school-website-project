import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import PageTransition from '../components/PageTransition';
import LectureCard from '../components/LectureCard';
import useYouTubeVideos from '../hooks/useYouTubeVideos';

const VideoLectures = () => {
  const { videos, loading, error, refetch } = useYouTubeVideos();

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center p-3 sm:p-4 bg-primary-100 dark:bg-primary-500/10 rounded-2xl mb-6 shadow-inner"
            >
              <FaGraduationCap className="text-3xl sm:text-4xl text-primary-600 dark:text-primary-400" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-poppins text-3xl sm:text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-4"
            >
              Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Lectures</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-dark-500 dark:text-dark-400 text-lg max-w-2xl mx-auto"
            >
              Access premium educational content anywhere. Track your progress with smart presence detection.
            </motion.p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {[...Array(8)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg border border-dark-100 dark:border-dark-700"
                >
                  {/* Thumbnail skeleton */}
                  <div className="relative aspect-video bg-dark-200 dark:bg-dark-700 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
                  </div>
                  {/* Progress bar skeleton */}
                  <div className="w-full h-1.5 bg-dark-200 dark:bg-dark-700" />
                  {/* Content skeleton */}
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-20 bg-dark-200 dark:bg-dark-700 rounded animate-pulse" />
                    <div className="h-5 w-full bg-dark-200 dark:bg-dark-700 rounded animate-pulse" />
                    <div className="h-5 w-3/4 bg-dark-200 dark:bg-dark-700 rounded animate-pulse" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-4 w-24 bg-dark-200 dark:bg-dark-700 rounded animate-pulse" />
                      <div className="h-9 w-24 bg-dark-200 dark:bg-dark-700 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 max-w-lg mx-auto"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaExclamationTriangle className="text-3xl text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-dark-800 dark:text-white mb-2">Failed to Load Lectures</h3>
              <p className="text-dark-500 dark:text-dark-400 mb-6 text-sm leading-relaxed">{error}</p>
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
              >
                <FaSync /> Try Again
              </button>
            </motion.div>
          )}

          {/* Grid Section */}
          {!loading && !error && videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {videos.map((lecture, index) => (
                <motion.div
                  key={lecture.youtubeId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <LectureCard lecture={lecture} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State Fallback (if no data) */}
          {!loading && !error && videos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-dark-500 dark:text-dark-400 text-lg">No lectures available at the moment. Please check back later.</p>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
};

export default VideoLectures;
