import { motion } from 'framer-motion';
import { FaGraduationCap, FaVideo, FaInfoCircle, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';

const StudentOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, progress: 0 });

  useEffect(() => {
    const savedLectures = JSON.parse(localStorage.getItem('zpkudave_lectures') || '[]');
    const savedProgress = JSON.parse(localStorage.getItem('zpkudave_progress') || '{}');
    const studentProgress = savedProgress[user?.studentId] || {};
    
    const completed = Object.values(studentProgress).filter(p => {
      if (typeof p === 'number') return p === 100;
      return p?.percent === 100;
    }).length;
    
    const total = savedLectures.length;
    
    setStats({
      total,
      completed,
      progress: total > 0 ? Math.floor((completed / total) * 100) : 0
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Namaskar, {user?.name}! 👋</h1>
          <p className="text-primary-100 max-w-md">Welcome to your learning dashboard. You can watch lectures and track your progress here.</p>
        </div>
        <FaGraduationCap className="absolute right-[-20px] bottom-[-20px] text-white/10 text-[200px] rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-dark-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <FaVideo />
          </div>
          <div>
            <p className="text-dark-500 text-xs font-semibold uppercase tracking-wider">Available Lectures</p>
            <p className="text-2xl font-bold text-dark-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-dark-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
            <FaGraduationCap />
          </div>
          <div>
            <p className="text-dark-500 text-xs font-semibold uppercase tracking-wider">Last Viewed</p>
            <p className="text-sm font-bold text-dark-800">Continue where you left off</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-dark-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-dark-800 font-bold">
          <FaInfoCircle className="text-primary-500" />
          <h2>Student Portal Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-dark-50 rounded-2xl">
            <span className="text-dark-500 block mb-1">Student ID</span>
            <span className="font-mono font-bold text-dark-800">{user?.studentId}</span>
          </div>
          <div className="p-4 bg-dark-50 rounded-2xl">
            <span className="text-dark-500 block mb-1">Class & Roll No.</span>
            <span className="font-bold text-dark-800">Class {user?.class} • Roll No. {user?.rollNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;