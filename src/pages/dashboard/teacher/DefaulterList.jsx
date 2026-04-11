import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { students, defaultAttendanceHistory } from '../../../data/dummyData';

const DefaulterList = () => {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState('all');

  const defaulters = useMemo(() => {
    const saved = JSON.parse(localStorage.getItem('zpkudave_attendance') || '[]');
    const allRecords = [...saved, ...defaultAttendanceHistory];

    const studentStats = {};
    students.forEach(s => {
      studentStats[s.id] = { ...s, present: 0, total: 0 };
    });

    allRecords.forEach(record => {
      record.present.forEach(id => {
        if (studentStats[id]) {
          studentStats[id].present += 1;
          studentStats[id].total += 1;
        }
      });
      record.absent.forEach(id => {
        if (studentStats[id]) {
          studentStats[id].total += 1;
        }
      });
    });

    return Object.values(studentStats)
      .filter(s => s.total > 0 && (s.present / s.total) * 100 < 75)
      .map(s => ({
        ...s,
        percentage: Math.round((s.present / s.total) * 100),
      }))
      .sort((a, b) => a.percentage - b.percentage);
  }, []);

  const filtered = selectedClass === 'all'
    ? defaulters
    : defaulters.filter(d => d.class === selectedClass);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <FaExclamationTriangle className="text-2xl text-amber-500" />
        <h1 className="font-poppins text-2xl font-bold text-dark-800">{t('dash_defaulter_list')}</h1>
      </div>

      <p className="text-dark-500 mb-6">{t('teacher_defaulter_title')}</p>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          className="input-field w-auto py-2"
        >
          <option value="all">All Classes</option>
          {['1', '2', '3', '4'].map(c => (
            <option key={c} value={c}>{t('teacher_class')} {c}</option>
          ))}
        </select>
      </div>

      {/* Defaulter Table */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-4 text-left">{t('teacher_roll')}</th>
                <th className="px-6 py-4 text-left">{t('teacher_student_name')}</th>
                <th className="px-6 py-4 text-center">{t('teacher_class')}</th>
                <th className="px-6 py-4 text-center">{t('teacher_days_present')}</th>
                <th className="px-6 py-4 text-center">{t('teacher_days_total')}</th>
                <th className="px-6 py-4 text-center">{t('teacher_attendance_pct_col')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-dark-400">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-3">🎉</span>
                      <p>No defaulters found! All students have good attendance.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((student, i) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-t border-dark-50 bg-red-50/30 hover:bg-red-50/60"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-dark-600">{student.roll}</td>
                    <td className="px-6 py-4 text-sm font-medium text-dark-800">{student.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-semibold">
                        Class {student.class}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-dark-600">{student.present}</td>
                    <td className="px-6 py-4 text-sm text-center text-dark-600">{student.total}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                        {student.percentage}%
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default DefaulterList;
