import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaSave } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { students } from '../../../data/dummyData';

const MarkAttendance = () => {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState('1');
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  const filteredStudents = students.filter(s => s.class === selectedClass);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const saved = JSON.parse(localStorage.getItem('zpkudave_attendance') || '[]');
      const todayRecord = saved.find(r => r.date === today && r.class === selectedClass);

      const initial = {};
      filteredStudents.forEach(s => {
        if (todayRecord) {
          initial[s.id] = todayRecord.present.includes(s.id) ? 'present' : 'absent';
        } else {
          initial[s.id] = 'present';
        }
      });
      setAttendance(initial);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedClass]);

  const toggleAttendance = (id) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present',
    }));
  };

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const present = Object.entries(attendance).filter(([, v]) => v === 'present').map(([k]) => Number(k));
    const absent = Object.entries(attendance).filter(([, v]) => v === 'absent').map(([k]) => Number(k));

    const saved = JSON.parse(localStorage.getItem('zpkudave_attendance') || '[]');
    const filtered = saved.filter(r => !(r.date === today && r.class === selectedClass));
    filtered.push({ date: today, class: selectedClass, present, absent });
    localStorage.setItem('zpkudave_attendance', JSON.stringify(filtered));

    toast.success(t('teacher_saved'));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-poppins text-2xl font-bold text-dark-800 mb-6">{t('dash_mark_attendance')}</h1>

      {/* Class Selector */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium text-dark-600">{t('teacher_select_class')}:</label>
        <div className="flex gap-2">
          {['1', '2', '3', '4'].map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedClass === cls
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-dark-600 border border-dark-200 hover:border-primary-300'
              }`}
            >
              {t('teacher_class')} {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-100 overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-6 space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-8 bg-dark-100 rounded flex-1" />
                <div className="h-8 bg-dark-100 rounded flex-1" />
                <div className="h-8 bg-dark-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4 text-left">{t('teacher_roll')}</th>
                  <th className="px-6 py-4 text-left">{t('teacher_student_name')}</th>
                  <th className="px-6 py-4 text-center">{t('teacher_status')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, i) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="border-t border-dark-50 hover:bg-dark-50/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-dark-600">{student.roll}</td>
                    <td className="px-6 py-4 text-sm font-medium text-dark-800">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleAttendance(student.id)}
                          className={`relative w-20 h-9 rounded-full transition-all duration-300 ${
                            attendance[student.id] === 'present'
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                        >
                          <span className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow transition-all duration-300 ${
                            attendance[student.id] === 'present' ? 'left-11' : 'left-1'
                          }`} />
                          <span className={`absolute inset-0 flex items-center text-white text-xs font-bold ${
                            attendance[student.id] === 'present' ? 'justify-start pl-2.5' : 'justify-end pr-2'
                          }`}>
                            {attendance[student.id] === 'present' ? 'P' : 'A'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <FaSave /> {t('teacher_save')}
        </button>
      </div>
    </motion.div>
  );
};

export default MarkAttendance;
