import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaUserCheck, FaUserTimes, FaPercentage } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { students, defaultAttendanceHistory } from '../../../data/dummyData';

const TeacherOverview = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });

  useEffect(() => {
    const total = students.length;
    const today = new Date().toISOString().split('T')[0];
    const savedAttendance = JSON.parse(localStorage.getItem('zpkudave_attendance') || '[]');
    const allAttendance = [...defaultAttendanceHistory, ...savedAttendance];
    
    let presentToday = 0;
    const todayRecords = allAttendance.filter(r => r.date === today);
    todayRecords.forEach(r => {
      presentToday += r.present.length;
    });

    // If no today's data, use the latest date
    if (todayRecords.length === 0) {
      const latestDate = allAttendance.length > 0 ? allAttendance[0].date : '';
      const latestRecords = allAttendance.filter(r => r.date === latestDate);
      latestRecords.forEach(r => {
        presentToday += r.present.length;
      });
    }

    const absent = total - presentToday;
    const pct = total > 0 ? Math.round((presentToday / total) * 100) : 0;
    setStats({ total, present: presentToday, absent: Math.max(0, absent), percentage: pct });
  }, []);

  const statCards = [
    { icon: FaUsers, label: t('teacher_total_students'), value: stats.total, color: 'from-blue-500 to-blue-700', bg: 'bg-blue-50' },
    { icon: FaUserCheck, label: t('teacher_present_today'), value: stats.present, color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-50' },
    { icon: FaUserTimes, label: t('teacher_absent_today'), value: stats.absent, color: 'from-rose-500 to-rose-700', bg: 'bg-rose-50' },
    { icon: FaPercentage, label: t('teacher_attendance_pct'), value: `${stats.percentage}%`, color: 'from-violet-500 to-violet-700', bg: 'bg-violet-50' },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-dark-800">
          {t('dash_welcome')}, {user?.name || t('dash_teacher')} 👋
        </h1>
        <p className="text-dark-500 mt-1">{t('dash_overview')}</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-md`}>
                <card.icon className="text-white text-xl" />
              </div>
            </div>
            <p className="text-dark-500 text-sm font-medium">{card.label}</p>
            <p className="font-poppins text-3xl font-bold text-dark-800 mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-dark-100"
        >
          <h3 className="font-poppins font-semibold text-dark-800 mb-4">Class Distribution</h3>
          <div className="space-y-3">
            {['1', '2', '3', '4'].map(cls => {
              const count = students.filter(s => s.class === cls).length;
              const pct = (count / students.length) * 100;
              return (
                <div key={cls} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-dark-600 w-16">Class {cls}</span>
                  <div className="flex-1 bg-dark-100 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-semibold text-dark-700 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-dark-100"
        >
          <h3 className="font-poppins font-semibold text-dark-800 mb-4">Attendance Overview</h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#E2E8F0" strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="url(#gradient)" strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${stats.percentage}, 100` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="gradient">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-dark-800 font-poppins">{stats.percentage}%</span>
                  <p className="text-dark-400 text-xs mt-1">Attendance</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherOverview;
