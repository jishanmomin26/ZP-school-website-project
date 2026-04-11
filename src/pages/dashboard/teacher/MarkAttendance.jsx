import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaSave, FaCalendarAlt } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { students } from '../../../data/dummyData';
import { db } from '../../../Firebase/config';
import { doc, getDoc, writeBatch } from 'firebase/firestore';

const MarkAttendance = () => {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  const filteredStudents = students.filter(s => s.class === selectedClass);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const initial = {};
        
        // Fetch from Firestore
        await Promise.all(
          filteredStudents.map(async (student) => {
            try {
              const recordRef = doc(db, 'attendance', String(student.id), 'records', selectedDate);
              const recordSnap = await getDoc(recordRef);
              
              if (recordSnap.exists()) {
                initial[student.id] = recordSnap.data().status;
              } else {
                initial[student.id] = 'present'; // Default to present
              }
            } catch (err) {
              console.warn("Firestore fetch error for student", student.id, err);
              initial[student.id] = 'present';
            }
          })
        );

        if (isMounted) {
          setAttendance(initial);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        if (isMounted) setLoading(false);
      }
    };

    if (filteredStudents.length > 0) {
      fetchAttendance();
    } else {
      setAttendance({});
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [selectedClass, selectedDate]);

  const toggleAttendance = (id) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present',
    }));
  };

  const handleSave = async () => {
    const toastId = toast.loading('Saving attendance...');
    try {
      const batch = writeBatch(db);

      filteredStudents.forEach((student) => {
        const status = attendance[student.id] || 'present';
        const docRef = doc(db, 'attendance', String(student.id), 'records', selectedDate);
        batch.set(docRef, { status, timestamp: new Date().toISOString() }, { merge: true });
      });

      await batch.commit();

      // Legacy support for dummy data visualization
      const presentIds = Object.entries(attendance).filter(([, v]) => v === 'present').map(([k]) => Number(k));
      const absentIds = Object.entries(attendance).filter(([, v]) => v === 'absent').map(([k]) => Number(k));
      const saved = JSON.parse(localStorage.getItem('zpkudave_attendance') || '[]');
      const filtered = saved.filter(r => !(r.date === selectedDate && r.class === selectedClass));
      filtered.push({ date: selectedDate, class: selectedClass, present: presentIds, absent: absentIds });
      localStorage.setItem('zpkudave_attendance', JSON.stringify(filtered));

      toast.success(t('teacher_saved'), { id: toastId });
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      toast.error("Failed to save to Firebase. Check config.", { id: toastId });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-poppins text-2xl font-bold text-dark-800 mb-6">{t('dash_mark_attendance')}</h1>

      <div className="flex flex-col sm:flex-row gap-6 mb-6 bg-white p-4 rounded-xl shadow-sm border border-dark-100">
        {/* Class Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-dark-600 mb-2">{t('teacher_select_class')}:</label>
          <div className="flex flex-wrap gap-2">
            {['1', '2', '3', '4'].map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedClass === cls
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-dark-50 text-dark-600 border border-dark-200 hover:border-primary-300'
                }`}
              >
                {t('teacher_class')} {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Date Selector */}
        <div className="sm:w-64">
          <label className="block text-sm font-medium text-dark-600 mb-2">{t('teacher_select_date') || 'Select Date'}:</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg text-sm font-medium border border-dark-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          </div>
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
                  <th className="px-6 py-4 text-center">{t('teacher_status') || 'Status'}</th>
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
        <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
          <FaSave /> {t('teacher_save')}
        </button>
      </div>
    </motion.div>
  );
};

export default MarkAttendance;
