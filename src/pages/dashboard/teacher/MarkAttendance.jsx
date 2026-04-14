import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaSave, FaCalendarAlt, FaList } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { getStudents } from '../../../Firebase/students';
import { db } from '../../../Firebase/config';
import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';

const getDaysInMonth = (monthStr) => {
  if (!monthStr) return 0;
  const [year, month] = monthStr.split('-');
  return new Date(year, month, 0).getDate();
};

const MarkAttendance = () => {
  const { t } = useLanguage();

  useEffect(() => {
    const fetchStudents = async () => {
      const data = await getStudents();
      setStudents(data);
    };

    fetchStudents();
  }, []);

  // Modes & Selectors
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'
  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [students, setStudents] = useState([]);

  // Data State
  const [dailyAttendance, setDailyAttendance] = useState({});
  const [monthlyAttendance, setMonthlyAttendance] = useState({});
  const [dirtyCells, setDirtyCells] = useState({});
  const [loading, setLoading] = useState(true);

  const filteredStudents = students.filter(s => s.class === String(selectedClass));
  const numDays = getDaysInMonth(selectedMonth);
  const daysArray = Array.from({ length: numDays }, (_, i) => String(i + 1).padStart(2, '0'));

  useEffect(() => {
    let isMounted = true;

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        if (viewMode === 'daily') {
          const initial = {};
          await Promise.all(
            filteredStudents.map(async (student) => {
              try {
                const recordRef = doc(db, 'attendance', String(student.id), 'records', selectedDate);
                const recordSnap = await getDoc(recordRef);
                if (recordSnap.exists()) {
                  initial[student.id] = recordSnap.data().status;
                } else {
                  initial[student.id] = 'present'; // Default to present for daily
                }
              } catch (err) {
                console.warn("Firestore fetch error for student", student.id, err);
                initial[student.id] = 'present';
              }
            })
          );
          if (isMounted) {
            setDailyAttendance(initial);
          }
        } else {
          // Monthly fetch
          const initialMonthly = {};
          await Promise.all(
            filteredStudents.map(async (student) => {
              try {
                initialMonthly[student.id] = {};
                const recordsRef = collection(db, 'attendance', String(student.id), 'records');
                const snap = await getDocs(recordsRef);
                snap.docs.forEach(d => {
                  if (d.id.startsWith(selectedMonth)) {
                    initialMonthly[student.id][d.id] = d.data().status;
                  }
                });
              } catch (err) {
                console.warn(err);
              }
            })
          );
          if (isMounted) {
            setMonthlyAttendance(initialMonthly);
            setDirtyCells({}); // Clear dirty cells on fresh fetch
          }
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (filteredStudents.length > 0) {
      fetchAttendance();
    } else {
      if (isMounted) {
        setDailyAttendance({});
        setMonthlyAttendance({});
        setLoading(false);
      }
    }

    return () => { isMounted = false; };
  }, [selectedClass, selectedDate, selectedMonth, viewMode]);

  const toggleDailyAttendance = (id) => {
    setDailyAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present',
    }));
  };

  const toggleMonthlyAttendance = (studentId, dateStr) => {
    setMonthlyAttendance(prev => {
      const current = prev[studentId]?.[dateStr];
      let next = 'present';
      if (current === 'present') next = 'absent';
      else if (current === 'absent') next = null; // Clear if clicked again

      setDirtyCells(dc => ({ ...dc, [`${studentId}_${dateStr}`]: next }));

      return {
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [dateStr]: next
        }
      };
    });
  };

  const handleSave = async () => {
    const toastId = toast.loading('Saving attendance...');
    try {
      if (viewMode === 'daily') {
        let currentBatch = writeBatch(db);
        let opCount = 0;

        for (const student of filteredStudents) {
          const status = dailyAttendance[student.id] || 'present';
          const docRef = doc(db, 'attendance', String(student.id), 'records', selectedDate);
          currentBatch.set(docRef, { status, timestamp: new Date().toISOString() }, { merge: true });

          opCount++;
          if (opCount === 500) {
            await currentBatch.commit();
            currentBatch = writeBatch(db);
            opCount = 0;
          }
        }
        if (opCount > 0) await currentBatch.commit();

      } else {
        const keys = Object.keys(dirtyCells);
        if (keys.length === 0) {
          toast.success("No changes to save.", { id: toastId });
          return;
        }

        let currentBatch = writeBatch(db);
        let opCount = 0;

        for (const key of keys) {
          // key pattern: "studentId_YYYY-MM-DD"
          const underscoreIndex = key.indexOf('_');
          const studentId = key.substring(0, underscoreIndex);
          const dateStr = key.substring(underscoreIndex + 1);
          const status = dirtyCells[key];

          const docRef = doc(db, 'attendance', String(studentId), 'records', dateStr);
          if (status) {
            currentBatch.set(docRef, { status, timestamp: new Date().toISOString() }, { merge: true });
          } else {
            currentBatch.delete(docRef);
          }

          opCount++;
          if (opCount === 500) {
            await currentBatch.commit();
            currentBatch = writeBatch(db);
            opCount = 0;
          }
        }
        if (opCount > 0) await currentBatch.commit();
        setDirtyCells({}); // Clear dirty on success
      }

      toast.success(t('teacher_saved') || 'Attendance Saved successfully!', { id: toastId });
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      toast.error("Failed to save to Firebase.", { id: toastId });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="font-poppins text-2xl font-bold text-dark-800">{t('dash_mark_attendance')}</h1>

        {/* View Toggle */}
        <div className="flex bg-white p-1 rounded-lg border border-dark-100 shadow-sm">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'daily' ? 'bg-primary-50 text-primary-600' : 'text-dark-500 hover:text-dark-700'
              }`}
          >
            <FaList /> {t('dash_daily_view') || "Daily"}
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'monthly' ? 'bg-primary-50 text-primary-600' : 'text-dark-500 hover:text-dark-700'
              }`}
          >
            <FaCalendarAlt /> {t('dash_monthly_view') || "Monthly Overview"}
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mb-6 bg-white p-4 rounded-xl shadow-sm border border-dark-100">
        {/* Class Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-dark-600 mb-2">{t('teacher_select_class')}:</label>
          <div className="flex flex-wrap gap-2">
            {['1', '2', '3', '4'].map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${selectedClass === cls
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-dark-50 text-dark-600 border border-dark-200 hover:border-primary-300'
                  }`}
              >
                {t('teacher_class')} {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Date/Month Selector */}
        <div className="sm:w-64">
          <label className="block text-sm font-medium text-dark-600 mb-2">
            {viewMode === 'daily' ? t('teacher_select_date') || 'Select Date' : 'Select Month'}:
          </label>
          <div className="relative">
            {viewMode === 'daily' ? (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg text-sm font-medium border border-dark-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            ) : (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg text-sm font-medium border border-dark-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            )}
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-100 overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-8 bg-dark-100 rounded flex-1" />
                <div className="h-8 bg-dark-100 rounded flex-1" />
                <div className="h-8 bg-dark-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'daily' ? (
              <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="px-6 py-4 text-left">{t('teacher_roll')}</th>
                      <th className="px-6 py-4 text-left">{t('teacher_student_name')}</th>
                      <th className="px-6 py-4 text-center">{t('teacher_status') || 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-6 text-dark-500">No students found</td></tr>
                    ) : (
                      filteredStudents.map((student, i) => (
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
                                onClick={() => toggleDailyAttendance(student.id)}
                                className={`relative w-20 h-9 rounded-full transition-all duration-300 ${dailyAttendance[student.id] === 'present'
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-500'
                                  }`}
                              >
                                <span className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow transition-all duration-300 ${dailyAttendance[student.id] === 'present' ? 'left-11' : 'left-1'
                                  }`} />
                                <span className={`absolute inset-0 flex items-center text-white text-xs font-bold ${dailyAttendance[student.id] === 'present' ? 'justify-start pl-2.5' : 'justify-end pr-2'
                                  }`}>
                                  {dailyAttendance[student.id] === 'present' ? 'P' : 'A'}
                                </span>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div key="monthly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-dark-50 border-b border-dark-100">
                      <th className="sticky text-xs font-bold text-dark-600 p-3 text-left border-r border-dark-100 select-none min-w-[200px]" style={{ left: 0, zIndex: 10, background: '#f8fafc' }}>
                        Student Name
                      </th>
                      {daysArray.map(day => (
                        <th key={day} className="text-xs font-bold text-dark-500 p-2 text-center border-r border-dark-100 min-w-[36px]">
                          {day}
                        </th>
                      ))}
                      <th className="text-xs font-bold text-dark-600 p-3 text-center bg-primary-50 min-w-[80px]">P</th>
                      <th className="text-xs font-bold text-dark-600 p-3 text-center bg-rose-50 min-w-[80px]">A</th>
                      <th className="text-xs font-bold text-dark-600 p-3 text-center bg-dark-50">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan={numDays + 4} className="text-center py-6 text-dark-500">No students found</td></tr>
                    ) : (
                      filteredStudents.map((student) => {
                        // Calculate summary for this student
                        let totalP = 0;
                        let totalA = 0;
                        daysArray.forEach(day => {
                          const sPath = `${selectedMonth}-${day}`;
                          const state = monthlyAttendance[student.id]?.[sPath];
                          if (state === 'present') totalP++;
                          else if (state === 'absent') totalA++;
                        });
                        const totalDays = totalP + totalA;
                        const pct = totalDays > 0 ? Math.round((totalP / totalDays) * 100) : 0;

                        return (
                          <tr key={student.id} className="border-t border-dark-50 hover:bg-dark-50/50 group">
                            <td className="sticky text-sm font-medium text-dark-800 p-3 border-r border-dark-100 flex items-center gap-2 select-none" style={{ left: 0, zIndex: 10, background: 'white' }}>
                              <span className="text-xs text-dark-400 bg-dark-50 px-1.5 py-0.5 rounded">{student.roll}</span>
                              {student.name}
                            </td>
                            {daysArray.map(day => {
                              const dateStr = `${selectedMonth}-${day}`;
                              const status = monthlyAttendance[student.id]?.[dateStr];

                              let cellClass = 'bg-dark-50/50 text-transparent hover:bg-dark-100';
                              let char = '-';
                              if (status === 'present') {
                                cellClass = 'bg-emerald-500 text-white shadow-sm';
                                char = 'P';
                              } else if (status === 'absent') {
                                cellClass = 'bg-rose-500 text-white shadow-sm';
                                char = 'A';
                              } else if (status === 'holiday') {
                                cellClass = 'bg-amber-400 text-white shadow-sm';
                                char = 'H';
                              }

                              return (
                                <td key={day} className="p-1 border-r border-dark-100 text-center">
                                  <button
                                    onClick={() => toggleMonthlyAttendance(student.id, dateStr)}
                                    className={`w-7 h-7 mx-auto rounded text-xs font-bold transition-all transform active:scale-95 ${cellClass}`}
                                    title={`${student.name} - ${dateStr}`}
                                  >
                                    {char}
                                  </button>
                                </td>
                              )
                            })}
                            <td className="text-sm font-bold text-emerald-600 text-center bg-emerald-50/30 p-2">{totalP}</td>
                            <td className="text-sm font-bold text-rose-600 text-center bg-rose-50/30 p-2">{totalA}</td>
                            <td className="text-sm font-bold text-primary-600 text-center bg-primary-50/30 p-2">{pct}%</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info & Save Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-4 items-center">
          {viewMode === 'monthly' && (
            <div className="flex gap-3 text-xs bg-white px-4 py-2 rounded-lg border border-dark-100 shadow-sm">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Present (P)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Absent (A)</span>
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={loading || (viewMode === 'monthly' && Object.keys(dirtyCells).length === 0)}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSave /> {viewMode === 'monthly' && Object.keys(dirtyCells).length > 0 ? `Save Changes (${Object.keys(dirtyCells).length})` : t('teacher_save')}
        </button>
      </div>
    </motion.div>
  );
};

export default MarkAttendance;
