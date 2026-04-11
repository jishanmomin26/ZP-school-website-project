import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaGraduationCap, FaCalendarCheck, FaChartBar, FaSignOutAlt, FaSchool, FaCalendarAlt, FaList } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { students, defaultResults, getGrade, getGradeColor } from '../../../data/dummyData';
import { db } from '../../../Firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const ParentDashboard = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'daily'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  const studentData = useMemo(() => {
    const found = students.find(s => s.name === user?.studentName && s.class === String(user?.studentClass));
    return found || { id: 15, name: user?.studentName || 'Aarav Patil', class: user?.studentClass || '3', roll: user?.studentRoll || 5 };
  }, [user]);

  // Fetch Attendance from Firebase
  useEffect(() => {
    let isMounted = true;
    const fetchAttendance = async () => {
      setLoadingAttendance(true);
      try {
        const recordsRef = collection(db, 'attendance', String(studentData.id), 'records');
        const snapshot = await getDocs(recordsRef);
        const records = snapshot.docs.map(doc => ({
          date: doc.id,
          status: doc.data().status
        }));
        
        if (isMounted) {
          setAttendanceRecords(records);
          setLoadingAttendance(false);
        }
      } catch (error) {
        console.error("Error fetching attendance from Firebase:", error);
        // Fallback to local storage for demo if Firebase fails
        if (isMounted) {
            const saved = JSON.parse(localStorage.getItem('zpkudave_attendance') || '[]');
            const localRecords = [];
            saved.forEach(r => {
                if (r.class === String(studentData.class)) {
                    if (r.present.includes(studentData.id)) localRecords.push({ date: r.date, status: 'present' });
                    else if (r.absent.includes(studentData.id)) localRecords.push({ date: r.date, status: 'absent' });
                }
            });
            setAttendanceRecords(localRecords);
            setLoadingAttendance(false);
        }
      }
    };
    fetchAttendance();
    return () => { isMounted = false; };
  }, [studentData]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Statistics specific to the selected month
  const monthlyStats = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const thisMonthRecords = attendanceRecords.filter(r => r.date.startsWith(monthPrefix));
    
    let present = 0, absent = 0, holiday = 0;
    thisMonthRecords.forEach(r => {
      if (r.status === 'present') present++;
      if (r.status === 'absent') absent++;
      if (r.status === 'holiday') holiday++;
    });

    const total = present + absent;
    return {
      present,
      absent,
      holiday,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }, [attendanceRecords, currentMonth, currentYear]);

  // Calendar Grid Data
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
    const days = [];
    // Empty slots before 1st of month
    for (let i = 0; i < firstDay; i++) {
      days.push({ empty: true, key: `empty-${i}` });
    }
    
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${monthPrefix}-${String(i).padStart(2, '0')}`;
      const record = attendanceRecords.find(r => r.date === dateStr);
      
      // Assume Sundays are holidays if no explicit record
      const isSunday = new Date(currentYear, currentMonth, i).getDay() === 0;
      let status = record ? record.status : (isSunday ? 'holiday' : null);

      days.push({
        date: i,
        fullDate: dateStr,
        status,
        key: dateStr
      });
    }
    return days;
  }, [currentYear, currentMonth, attendanceRecords]);

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

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

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

        {/* Attendance Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-dark-100 mb-8 overflow-hidden">
          
          <div className="border-b border-dark-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-poppins font-bold text-lg text-dark-800 flex items-center gap-2">
              <FaCalendarCheck className="text-primary-500" /> {t('parent_attendance_summary')}
            </h3>
            
            {/* View Toggle */}
            <div className="flex bg-dark-50 p-1 rounded-lg border border-dark-100">
              <button
                onClick={() => setViewMode('monthly')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  viewMode === 'monthly' ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-500 hover:text-dark-700'
                }`}
              >
                <FaCalendarAlt /> {t('dash_monthly_view') || "Monthly"}
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  viewMode === 'daily' ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-500 hover:text-dark-700'
                }`}
              >
                <FaList /> {t('dash_daily_view') || "Daily"}
              </button>
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {viewMode === 'monthly' ? (
                <motion.div key="monthly" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  
                  {/* Month Navigation & Stats Header */}
                  <div className="flex flex-col lg:flex-row gap-8 mb-6">
                    <div className="lg:w-1/3 space-y-6">
                      <div className="flex items-center justify-between bg-dark-50 p-3 rounded-xl border border-dark-100">
                        <button onClick={prevMonth} className="p-2 hover:bg-dark-100 rounded-lg transition-colors">&larr;</button>
                        <h4 className="font-poppins font-bold text-dark-800">
                          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button onClick={nextMonth} className="p-2 hover:bg-dark-100 rounded-lg transition-colors">&rarr;</button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                          <p className="text-xs font-semibold text-emerald-600 mb-1">{t('parent_present')}</p>
                          <p className="text-2xl font-bold text-emerald-700">{monthlyStats.present}</p>
                        </div>
                        <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                          <p className="text-xs font-semibold text-rose-600 mb-1">{t('parent_absent')}</p>
                          <p className="text-2xl font-bold text-rose-700">{monthlyStats.absent}</p>
                        </div>
                        <div className="col-span-2 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-4 border border-primary-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-primary-600 mb-1">{t('parent_percentage')}</p>
                            <p className="text-3xl font-poppins font-bold text-primary-700">{monthlyStats.percentage}%</p>
                          </div>
                          {/* CSS Circular Progress */}
                          <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-white border-4 border-primary-100">
                            <span className="text-xs font-bold text-primary-600">{monthlyStats.percentage}%</span>
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-emerald-400"
                                strokeDasharray="176" strokeDashoffset={176 - (176 * monthlyStats.percentage) / 100} strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="lg:w-2/3">
                      {loadingAttendance ? (
                        <div className="animate-pulse space-y-4 pt-10">
                           <div className="h-64 bg-dark-50 rounded-xl border border-dark-100"></div>
                        </div>
                      ) : (
                        <div className="border border-dark-100 rounded-xl overflow-hidden shadow-sm">
                          <div className="grid grid-cols-7 bg-dark-50 border-b border-dark-100">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                              <div key={i} className="p-3 text-center text-xs font-bold text-dark-500 uppercase">{day}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 bg-white">
                            {calendarDays.map((dateObj) => (
                              <div key={dateObj.key} className={`aspect-square sm:aspect-auto sm:h-20 border-b border-r border-dark-50 p-1 sm:p-2 relative group ${dateObj.empty ? 'bg-dark-50/30' : ''}`}>
                                {!dateObj.empty && (
                                  <>
                                    <span className="text-xs font-medium text-dark-500">{dateObj.date}</span>
                                    {dateObj.status && (
                                      <div className={`mt-1 sm:mt-2 h-2 sm:h-6 rounded-sm sm:rounded-md flex items-center justify-center ${
                                        dateObj.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                                        dateObj.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                                        'bg-amber-100 text-amber-700'
                                      }`}>
                                        <span className="hidden sm:block text-[10px] font-bold uppercase">{
                                          dateObj.status === 'present' ? 'Present' : dateObj.status === 'absent' ? 'Absent' : 'Holiday'
                                        }</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-4 mt-4 justify-center sm:justify-start">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400"></div><span className="text-xs text-dark-500">{t('teacher_present') || 'Present'}</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-400"></div><span className="text-xs text-dark-500">{t('teacher_absent') || 'Absent'}</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400"></div><span className="text-xs text-dark-500">{t('dash_holiday') || 'Holiday'}</span></div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              ) : (
                <motion.div key="daily" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="table-header">
                          <th className="px-6 py-3 text-left">{t('teacher_date')}</th>
                          <th className="px-6 py-3 text-center">{t('teacher_status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.length === 0 ? (
                            <tr><td colSpan="2" className="text-center py-6 text-dark-400">No records found.</td></tr>
                        ) : attendanceRecords.sort((a,b) => b.date.localeCompare(a.date)).map((record, i) => (
                          <tr key={i} className="border-t border-dark-50">
                            <td className="px-6 py-4 text-sm font-medium text-dark-700">{record.date}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                record.status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                                record.status === 'absent' ? 'bg-rose-50 text-rose-600' :
                                'bg-amber-50 text-amber-600'
                              }`}>{record.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                    <tr key={i} className="border-t border-dark-50 hover:bg-dark-50/50">
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
