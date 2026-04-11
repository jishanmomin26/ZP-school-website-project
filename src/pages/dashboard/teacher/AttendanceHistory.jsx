import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaDownload } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { students, defaultAttendanceHistory } from '../../../data/dummyData';

const AttendanceHistory = () => {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const allAttendance = useMemo(() => {
    const saved = JSON.parse(localStorage.getItem('zpkudave_attendance') || '[]');
    return [...saved, ...defaultAttendanceHistory];
  }, []);

  const filtered = useMemo(() => {
    let data = allAttendance;
    if (selectedClass !== 'all') data = data.filter(r => r.class === selectedClass);
    if (selectedDate) data = data.filter(r => r.date === selectedDate);
    return data.sort((a, b) => b.date.localeCompare(a.date));
  }, [allAttendance, selectedClass, selectedDate]);

  const getStudentName = (id) => students.find(s => s.id === id)?.name || `Student ${id}`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-poppins text-2xl font-bold text-dark-800 mb-6">{t('dash_attendance_history')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FaFilter className="text-dark-400" />
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
        <input
          type="date" value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="input-field w-auto py-2"
        />
        <button className="btn-outline py-2 px-4 text-sm flex items-center gap-2 opacity-60 cursor-not-allowed">
          <FaDownload /> {t('teacher_export')}
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-4 text-left">{t('teacher_date')}</th>
                <th className="px-6 py-4 text-left">{t('teacher_class')}</th>
                <th className="px-6 py-4 text-left">{t('teacher_present')}</th>
                <th className="px-6 py-4 text-left">{t('teacher_absent')}</th>
                <th className="px-6 py-4 text-center">{t('teacher_attendance_pct_col')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-dark-400">
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 20).map((record, i) => {
                  const total = record.present.length + record.absent.length;
                  const pct = total > 0 ? Math.round((record.present.length / total) * 100) : 0;
                  return (
                    <motion.tr
                      key={`${record.date}-${record.class}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-t border-dark-50 hover:bg-dark-50/50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-dark-700">{record.date}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-semibold">
                          Class {record.class}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-emerald-600 font-medium">{record.present.length}</td>
                      <td className="px-6 py-4 text-sm text-rose-600 font-medium">{record.absent.length}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-dark-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-dark-700">{pct}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceHistory;
