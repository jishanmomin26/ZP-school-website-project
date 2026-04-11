import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaGraduationCap, FaCalendarCheck, FaChartBar, FaSignOutAlt, FaSchool } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { students, defaultAttendanceHistory, defaultResults, getGrade, getGradeColor } from '../../../data/dummyData';

const ParentDashboard = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const studentData = useMemo(() => {
    const found = students.find(s => s.name === user?.studentName && s.class === user?.studentClass);
    return found || { id: 15, name: user?.studentName || 'Aarav Patil', class: user?.studentClass || '3', roll: user?.studentRoll || 5 };
  }, [user]);

  const attendanceStats = useMemo(() => {
    const saved = JSON.parse(localStorage.getItem('zpkudave_attendance') || '[]');
    const allRecords = [...saved, ...defaultAttendanceHistory];
    let present = 0, total = 0;
    allRecords.forEach(record => {
      if (record.class === studentData.class) {
        if (record.present.includes(studentData.id)) { present++; total++; }
        else if (record.absent.includes(studentData.id)) { total++; }
      }
    });
    return { present, absent: total - present, total, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
  }, [studentData]);

  const attendanceHistory = useMemo(() => {
    const saved = JSON.parse(localStorage.getItem('zpkudave_attendance') || '[]');
    const allRecords = [...saved, ...defaultAttendanceHistory];
    return allRecords
      .filter(r => r.class === studentData.class)
      .map(r => ({
        date: r.date,
        status: r.present.includes(studentData.id) ? 'Present' : 'Absent',
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [studentData]);

  const resultData = useMemo(() => {
    const saved = JSON.parse(localStorage.getItem('zpkudave_results') || '{}');
    const classResults = { ...defaultResults[studentData.class], ...saved[studentData.class] };
    const exams = ['UT1', 'UT2', 'Semester 1', 'Semester 2'];
    return exams.map(exam => {
      const examResults = classResults[exam] || [];
      const studentResult = examResults.find(r => r.studentId === studentData.id);
      if (!studentResult) return null;
      const maxMarks = exam.startsWith('UT') ? 50 : 100;
      const total = (studentResult.marathi || 0) + (studentResult.english || 0) + (studentResult.maths || 0) + (studentResult.evs || 0);
      const pct = Math.round((total / (maxMarks * 4)) * 100);
      return { exam, ...studentResult, total, maxMarks, percentage: pct, grade: getGrade(pct) };
    }).filter(Boolean);
  }, [studentData]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-dark-100 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <FaSchool className="text-white" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-dark-800 text-sm">{t('nav_school_name')}</h3>
              <p className="text-dark-400 text-xs">{t('dash_parent')} — {user?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <FaSignOutAlt /> {t('dash_logout')}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-md">
              <FaUser className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="font-poppins text-xl font-bold text-dark-800">{studentData.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-dark-500">
                <span className="flex items-center gap-1"><FaGraduationCap /> {t('parent_class')}: {studentData.class}</span>
                <span>{t('parent_roll')}: {studentData.roll}</span>
                <span>{t('parent_parent_name')}: {user?.name}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Attendance Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 mb-8">
          <h3 className="font-poppins font-bold text-lg text-dark-800 mb-5 flex items-center gap-2">
            <FaCalendarCheck className="text-primary-500" /> {t('parent_attendance_summary')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: t('parent_total_days'), value: attendanceStats.total, color: 'bg-blue-50 text-blue-600' },
              { label: t('parent_present'), value: attendanceStats.present, color: 'bg-emerald-50 text-emerald-600' },
              { label: t('parent_absent'), value: attendanceStats.absent, color: 'bg-rose-50 text-rose-600' },
              { label: t('parent_percentage'), value: `${attendanceStats.percentage}%`, color: 'bg-violet-50 text-violet-600' },
            ].map((item, i) => (
              <div key={i} className={`rounded-xl p-4 ${item.color}`}>
                <p className="text-xs font-medium opacity-70">{item.label}</p>
                <p className="text-2xl font-bold font-poppins mt-1">{item.value}</p>
              </div>
            ))}
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-dark-100 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${attendanceStats.percentage}%` }}
              transition={{ duration: 1 }}
              className={`h-3 rounded-full ${attendanceStats.percentage >= 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-rose-400 to-rose-600'}`}
            />
          </div>
        </motion.div>

        {/* Attendance History */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 mb-8">
          <h3 className="font-poppins font-bold text-lg text-dark-800 mb-5">{t('parent_attendance_history')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-3 text-left">{t('teacher_date')}</th>
                  <th className="px-6 py-3 text-center">{t('teacher_status')}</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.slice(0, 10).map((record, i) => (
                  <tr key={i} className="border-t border-dark-50">
                    <td className="px-6 py-3 text-sm text-dark-700">{record.date}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        record.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>{record.status === 'Present' ? t('teacher_present') : t('teacher_absent')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Result Tracker */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100">
          <h3 className="font-poppins font-bold text-lg text-dark-800 mb-5 flex items-center gap-2">
            <FaChartBar className="text-primary-500" /> {t('parent_results')}
          </h3>
          {resultData.length === 0 ? (
            <p className="text-dark-400 text-center py-8">No results available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3 text-left">Exam</th>
                    <th className="px-4 py-3 text-center">{t('teacher_marathi')}</th>
                    <th className="px-4 py-3 text-center">{t('teacher_english')}</th>
                    <th className="px-4 py-3 text-center">{t('teacher_maths')}</th>
                    <th className="px-4 py-3 text-center">{t('teacher_evs')}</th>
                    <th className="px-4 py-3 text-center">{t('teacher_total')}</th>
                    <th className="px-4 py-3 text-center">%</th>
                    <th className="px-4 py-3 text-center">{t('teacher_grade')}</th>
                  </tr>
                </thead>
                <tbody>
                  {resultData.map((result, i) => (
                    <tr key={i} className="border-t border-dark-50">
                      <td className="px-4 py-3 text-sm font-semibold text-dark-800">{result.exam}</td>
                      <td className="px-4 py-3 text-sm text-center text-dark-600">{result.marathi}</td>
                      <td className="px-4 py-3 text-sm text-center text-dark-600">{result.english}</td>
                      <td className="px-4 py-3 text-sm text-center text-dark-600">{result.maths}</td>
                      <td className="px-4 py-3 text-sm text-center text-dark-600">{result.evs}</td>
                      <td className="px-4 py-3 text-sm text-center font-bold text-dark-800">{result.total}/{result.maxMarks * 4}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 bg-dark-100 rounded-full h-1.5">
                            <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${result.percentage}%` }} />
                          </div>
                          <span className="text-xs font-bold text-dark-700">{result.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ParentDashboard;
