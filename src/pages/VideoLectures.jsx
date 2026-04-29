import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap } from 'react-icons/fa';
import PageTransition from '../components/PageTransition';
import { lecturesData } from '../data/lectures';
import LectureCard from '../components/LectureCard';

const VideoLectures = () => {
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

          {/* Grid Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {lecturesData.map((lecture, index) => (
              <motion.div
                key={lecture.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <LectureCard lecture={lecture} />
              </motion.div>
            ))}
          </div>

          {/* Empty State Fallback (if no data) */}
          {lecturesData.length === 0 && (
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
