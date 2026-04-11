import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaDownload, FaChartBar, FaCalendarAlt, FaList } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../../context/LanguageContext';
import { students } from '../../../data/dummyData';
import { db } from '../../../Firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const AttendanceHistory = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState('monthly'); // 'daily' | 'monthly'
  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]); // For Daily: list of students, For Monthly: aggregated daily stats
  const [studentSummary, setStudentSummary] = useState([]); // For Monthly: student-wise stats

  const filteredStudents = students.filter(s => s.class === String(selectedClass));

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (viewMode === 'daily') {
          // Fetch all student records for this day
          const records = [];
          await Promise.all(
            filteredStudents.map(async (student) => {
              const docRef = doc(db, 'attendance', String(student.id), 'records', selectedDate);
              const snap = await getDoc(docRef);
              records.push({
                id: student.id,
                name: student.name,
                roll: student.roll,
                status: snap.exists() ? snap.data().status : 'n/a'
              });
            })
          );
          if (isMounted) setAttendanceData(records.sort((a,b) => a.roll - b.roll));
        } else {
          // Monthly: Fetch all records for the month for this class
          const dailyAggregated = {}; // { "2026-04-01": { present: X, absent: Y } }
          const studentStats = {}; // { studentId: { present: X, absent: Y } }

          // Initialize student stats
          filteredStudents.forEach(s => {
            studentStats[s.id] = { name: s.name, roll: s.roll, present: 0, absent: 0 };
          });

          await Promise.all(
            filteredStudents.map(async (student) => {
              const recordsRef = collection(db, 'attendance', String(student.id), 'records');
              const snap = await getDocs(recordsRef);
              
              snap.docs.forEach(d => {
                if (d.id.startsWith(selectedMonth)) {
                  const status = d.data().status;
                  const date = d.id;

                  // Aggregate by date
                  if (!dailyAggregated[date]) dailyAggregated[date] = { date, present: 0, absent: 0 };
                  if (status === 'present') {
                    dailyAggregated[date].present++;
                    studentStats[student.id].present++;
                  } else if (status === 'absent') {
                    dailyAggregated[date].absent++;
                    studentStats[student.id].absent++;
                  }
                }
              });
            })
          );

          if (isMounted) {
            // Convert to array and sort by date
            const chartData = Object.values(dailyAggregated).sort((a, b) => a.date.localeCompare(b.date));
            setAttendanceData(chartData);
            setStudentSummary(Object.values(studentStats).sort((a,b) => a.roll - b.roll));
          }
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (filteredStudents.length > 0) {
      fetchData();
    } else {
      setAttendanceData([]);
      setStudentSummary([]);
    }

    return () => { isMounted = false; };
  }, [selectedClass, selectedDate, selectedMonth, viewMode, filteredStudents]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="font-poppins text-2xl font-bold text-dark-800">{t('dash_attendance_history')}</h1>
        
        {/* Toggle Mode */}
        <div className="flex bg-white p-1 rounded-lg border border-dark-100 shadow-sm">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              viewMode === 'daily' ? 'bg-primary-50 text-primary-600' : 'text-dark-500 hover:text-dark-700'
            }`}
          >
            <FaList /> {t('dash_daily_view') || "Daily"}
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              viewMode === 'monthly' ? 'bg-primary-50 text-primary-600' : 'text-dark-500 hover:text-dark-700'
            }`}
          >
            <FaChartBar /> {t('dash_monthly_view') || "Monthly Analysis"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-dark-100">
        <div>
          <label className="block text-sm font-semibold text-dark-600 mb-2">{t('teacher_select_class')}</label>
          <div className="flex flex-wrap gap-2">
            {['1', '2', '3', '4'].map(c => (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedClass === c ? 'bg-primary-600 text-white' : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
                }`}
              >
                {t('teacher_class')} {c}
              </button>
            ))}
          </div>
        </div>

        <div>
           <label className="block text-sm font-semibold text-dark-600 mb-2">
             {viewMode === 'daily' ? t('teacher_select_date') : "Select Month"}
           </label>
           <div className="relative">
             {viewMode === 'daily' ? (
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-dark-200 focus:border-primary-500 outline-none font-medium"
                />
             ) : (
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-dark-200 focus:border-primary-500 outline-none font-medium"
                />
             )}
             <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
           </div>
        </div>

        <div className="flex items-end">
          <button className="w-full md:w-auto px-6 py-2.5 bg-dark-50 text-dark-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-dark-100 border border-dark-200 transition-all opacity-60 cursor-not-allowed">
            <FaDownload /> {t('teacher_export')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dark-100 shadow-sm animate-pulse">
           <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin mb-4" />
           <p className="text-dark-500 font-medium">Loading History Data...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'daily' ? (
            <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-2xl shadow-sm border border-dark-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-dark-50 border-b border-dark-100">
                    <tr>
                      <th className="px-6 py-4 text-sm font-bold text-dark-600">{t('teacher_roll')}</th>
                      <th className="px-6 py-4 text-sm font-bold text-dark-600">{t('teacher_student_name')}</th>
                      <th className="px-6 py-4 text-sm font-bold text-dark-600 text-center">{t('teacher_status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.length === 0 ? (
                      <tr><td colSpan="3" className="px-6 py-10 text-center text-dark-400">No records found for this date.</td></tr>
                    ) : (
                      attendanceData.map((record) => (
                        <tr key={record.id} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-dark-500">{record.roll}</td>
                          <td className="px-6 py-4 font-bold text-dark-800">{record.name}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                              record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                              record.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'bg-dark-100 text-dark-500'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div key="monthly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              
              {/* Graphical Visualization */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-dark-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-poppins font-bold text-xl text-dark-800">Attendance Visualization</h3>
                    <p className="text-dark-500 text-sm">Present vs Absent trends for {selectedMonth}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary-500 rounded-full" /> <span className="text-xs font-bold text-dark-600">Present</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-400 rounded-full" /> <span className="text-xs font-bold text-dark-600">Absent</span></div>
                  </div>
                </div>
                
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => str.slice(-2)} 
                        tick={{fontSize: 10, fill: '#64748B'}}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tick={{fontSize: 12, fill: '#64748B'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{fill: '#F1F5F9'}} 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                      />
                      <Bar dataKey="present" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="absent" fill="#FB7185" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Aggregated Daily Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-dark-100 overflow-hidden">
                <div className="p-6 border-b border-dark-100">
                  <h3 className="font-poppins font-bold text-lg text-dark-800">Monthly Aggregated Report</h3>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-dark-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-sm font-bold text-dark-600 border-b border-dark-100">Date</th>
                        <th className="px-6 py-4 text-sm font-bold text-dark-600 border-b border-dark-100 text-center">Present Count</th>
                        <th className="px-6 py-4 text-sm font-bold text-dark-600 border-b border-dark-100 text-center">Absent Count</th>
                        <th className="px-6 py-4 text-sm font-bold text-dark-600 border-b border-dark-100 text-center">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-10 text-center text-dark-400">No data available for this month.</td></tr>
                      ) : (
                        attendanceData.map((row) => {
                          const total = row.present + row.absent;
                          const pct = total > 0 ? Math.round((row.present / total) * 100) : 0;
                          return (
                            <tr key={row.date} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-dark-700">{row.date}</td>
                              <td className="px-6 py-4 text-center text-emerald-600 font-bold">{row.present}</td>
                              <td className="px-6 py-4 text-center text-rose-600 font-bold">{row.absent}</td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <div className="w-16 bg-dark-100 h-1.5 rounded-full overflow-hidden">
                                     <div className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{width: `${pct}%`}} />
                                  </div>
                                  <span className="text-xs font-bold text-dark-600">{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Student Summary Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-dark-100 overflow-hidden">
                <div className="p-6 border-b border-dark-100 flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-lg text-dark-800">Student-wise Performance Summary</h3>
                  <span className="text-xs bg-primary-50 text-primary-600 font-bold px-3 py-1 rounded-full uppercase">For {selectedMonth}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-dark-50">
                      <tr>
                        <th className="px-6 py-4 text-sm font-bold text-dark-600">{t('teacher_roll')}</th>
                        <th className="px-6 py-4 text-sm font-bold text-dark-600">{t('teacher_student_name')}</th>
                        <th className="px-6 py-4 text-sm font-bold text-dark-600 text-center">Days Present</th>
                        <th className="px-6 py-4 text-sm font-bold text-dark-600 text-center">Days Absent</th>
                        <th className="px-6 py-4 text-sm font-bold text-dark-600 text-center">Month Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentSummary.map((summary) => {
                        const total = summary.present + summary.absent;
                        const pct = total > 0 ? Math.round((summary.present / total) * 100) : 0;
                        return (
                          <tr key={summary.roll} className="border-b border-dark-50 hover:bg-dark-50/50">
                            <td className="px-6 py-4 font-medium text-dark-500">{summary.roll}</td>
                            <td className="px-6 py-4 font-bold text-dark-800">{summary.name}</td>
                            <td className="px-6 py-4 text-center font-bold text-emerald-600">{summary.present}</td>
                            <td className="px-6 py-4 text-center font-bold text-rose-600">{summary.absent}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${pct >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {pct}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default AttendanceHistory;
