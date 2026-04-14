import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { FaChartBar, FaList } from 'react-icons/fa';
import { students } from '../../../data/dummyData';
import { db } from '../../../Firebase/config';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

const AttendanceHistory = () => {

  const [viewMode, setViewMode] = useState('monthly');
  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );

  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentSummary, setStudentSummary] = useState([]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.class === String(selectedClass));
  }, [selectedClass]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        if (viewMode === 'daily') {
          const records = [];

          await Promise.all(
            filteredStudents.map(async (student) => {
              const ref = doc(db, 'attendance', String(student.id), 'records', selectedDate);
              const snap = await getDoc(ref);

              records.push({
                id: student.id,
                name: student.name,
                roll: student.roll,
                status: snap.exists() ? snap.data().status : 'n/a'
              });
            })
          );

          setAttendanceData(records.sort((a, b) => a.roll - b.roll));

        } else {
          const studentStats = {};

          filteredStudents.forEach(s => {
            studentStats[s.id] = {
              name: s.name,
              present: 0,
              absent: 0
            };
          });

          // ✅ FIXED MONTH FILTER
          const [year, month] = selectedMonth.split('-');
          const startDate = `${year}-${month}-01`;
          const endDate = `${year}-${month}-31`;

          await Promise.all(
            filteredStudents.map(async (student) => {
              const ref = collection(db, 'attendance', String(student.id), 'records');

              const q = query(
                ref,
                where('__name__', '>=', startDate),
                where('__name__', '<=', endDate)
              );

              const snap = await getDocs(q);

              snap.docs.forEach(d => {
                const status = d.data().status;

                if (status === 'present') {
                  studentStats[student.id].present++;
                } else {
                  studentStats[student.id].absent++;
                }
              });
            })
          );

          setStudentSummary(Object.values(studentStats));
        }

      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchData();
  }, [selectedClass, selectedDate, selectedMonth, viewMode]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Attendance Dashboard</h1>

      {/* CLASS SELECTOR */}
      <div className="flex gap-2 flex-wrap">
        {['1', '2', '3', '4'].map(cls => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedClass === cls
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Class {cls}
          </button>
        ))}
      </div>

      {/* ✅ MONTH SELECTOR (ONLY NEW UI) */}
      {viewMode === 'monthly' && (
        <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
          <label className="text-sm font-medium text-gray-600">
            Select Month:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
        </div>
      )}

      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('daily')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            viewMode === 'daily'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <FaList /> Daily
        </button>

        <button
          onClick={() => setViewMode('monthly')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            viewMode === 'monthly'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <FaChartBar /> Monthly
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <>
          {viewMode === 'daily' ? (
            <div className="bg-white p-4 rounded-xl shadow">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th>Roll</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map(r => (
                    <tr key={r.id} className="border-t">
                      <td>{r.roll}</td>
                      <td>{r.name}</td>
                      <td>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="font-semibold mb-4">Student Attendance Chart</h2>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="present" fill="#3B82F6" radius={[6,6,0,0]} />
                    <Bar dataKey="absent" fill="#FB7185" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="font-semibold mb-4">Student Performance</h2>

                <table className="w-full">
                  <tbody>
                    {studentSummary.map(s => {
                      const total = s.present + s.absent;
                      const pct = total ? Math.round((s.present / total) * 100) : 0;

                      return (
                        <tr key={s.name} className="border-b py-2">
                          <td>{s.name}</td>
                          <td className="text-right font-semibold">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </motion.div>
  );
};

export default AttendanceHistory;