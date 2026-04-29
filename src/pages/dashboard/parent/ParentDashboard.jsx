import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../Firebase/config';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { getGrade } from '../../../data/dummyData';
import { FaHome, FaSignOutAlt } from "react-icons/fa";

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [resultData, setResultData] = useState([]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 🔥 FETCH STUDENT
  useEffect(() => {
    const fetchStudent = async () => {
      if (!user?.uid) return;

      const parentDoc = await getDoc(doc(db, "users", user.uid));
      if (!parentDoc.exists()) return;

      const parentId = parentDoc.data().parentId;

      const q = query(collection(db, "students"), where("parentId", "==", parentId));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const studentDoc = snap.docs[0];
        setStudentData({ id: studentDoc.id, ...studentDoc.data() });
      }
    };

    fetchStudent();
  }, [user]);

  // 🔥 FETCH ATTENDANCE
  useEffect(() => {
    if (!studentData) return;

    const fetchAttendance = async () => {
      const ref = collection(db, 'attendance', studentData.id, 'records');
      const snap = await getDocs(ref);

      const records = snap.docs.map(doc => ({
        date: doc.id,
        status: doc.data().status
      }));

      setAttendanceRecords(records);
    };

    fetchAttendance();
  }, [studentData]);

  // 🔥 FETCH RESULTS
  useEffect(() => {
    if (!studentData) return;

    const fetchResults = async () => {
      const snap = await getDoc(doc(db, 'results', `class_${studentData.class}`));
      if (!snap.exists()) return;

      const allResults = snap.data();
      const exams = ['UT1', 'UT2', 'Semester 1', 'Semester 2'];

      const formatted = [];

      exams.forEach(exam => {
        const examResults = allResults[exam] || [];

        const studentResult = examResults.find(
          r => r.studentId === studentData.id
        );

        if (studentResult) {
          const maxMarks = exam.startsWith('UT') ? 50 : 100;

          const total =
            (studentResult.marathi || 0) +
            (studentResult.english || 0) +
            (studentResult.maths || 0) +
            (studentResult.evs || 0);

          const pct = Math.round((total / (maxMarks * 4)) * 100);

          formatted.push({
            exam,
            total,
            percentage: pct,
            grade: getGrade(pct),

            marathi: studentResult.marathi,
            english: studentResult.english,
            maths: studentResult.maths,
            evs: studentResult.evs
          });
        }
      });

      setResultData(formatted);
    };

    fetchResults();
  }, [studentData]);

  const monthlyStats = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const thisMonthRecords = attendanceRecords.filter(r => r.date.startsWith(monthPrefix));

    let present = 0, absent = 0;

    thisMonthRecords.forEach(r => {
      if (r.status === 'present') present++;
      if (r.status === 'absent') absent++;
    });

    const total = present + absent;

    return {
      present,
      absent,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }, [attendanceRecords, currentMonth, currentYear]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ empty: true, key: `empty-${i}` });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const record = attendanceRecords.find(r =>
        r.date.startsWith(monthPrefix) &&
        r.date.endsWith(`-${String(i).padStart(2, '0')}`)
      );

      days.push({
        date: i,
        status: record?.status,
        key: i
      });
    }

    return days;
  }, [attendanceRecords, currentMonth, currentYear]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6 pb-24">

      

      {/* STUDENT */}
      {studentData && (
        <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 text-white flex items-center justify-center rounded-full">
            {studentData.name[0]}
          </div>
          <div>
            <h2 className="font-bold">{studentData.name}</h2>
            <p className="text-gray-500">Class {studentData.class}</p>
          </div>
        </div>
      )}

      {/* MONTH PICKER */}
      <div className="bg-white p-5 rounded-2xl shadow flex justify-between items-center">
        <h3 className="font-semibold">Attendance Overview</h3>

        <div className="flex gap-3">
          <select
            value={currentMonth}
            onChange={(e) =>
              setCurrentDate(new Date(currentYear, Number(e.target.value), 1))
            }
            className="px-4 py-2 rounded-full bg-gray-100"
          >
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) =>
              setCurrentDate(new Date(Number(e.target.value), currentMonth, 1))
            }
            className="px-4 py-2 rounded-full bg-gray-100"
          >
            {Array.from({ length: 6 }, (_, i) => currentYear - 3 + i).map(year => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-5 rounded-2xl shadow">
          <p>Attendance</p>
          <p className="text-3xl font-bold">{monthlyStats.percentage}%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p>Present</p>
          <p className="text-green-600 font-bold">{monthlyStats.present}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p>Absent</p>
          <p className="text-red-500 font-bold">{monthlyStats.absent}</p>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="w-full bg-gray-200 h-3 rounded-full">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: `${monthlyStats.percentage}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {monthlyStats.present} / {monthlyStats.total} days present
        </p>
      </div>

      {/* CALENDAR */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="grid grid-cols-7 gap-2 text-center">
          {calendarDays.map(day => (
            <div
              key={day.key}
              className={`p-2 rounded-lg ${day.empty
                ? ''
                : day.status === 'present'
                  ? 'bg-green-100'
                  : day.status === 'absent'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}
            >
              {day.date || ''}
            </div>
          ))}
        </div>
      </div>

      {/* RESULTS TABLE */}
      <div className="bg-white p-6 rounded-2xl shadow overflow-x-auto">
        <h3 className="font-bold mb-4">Results</h3>

        {resultData.length === 0 ? (
          <p>No results available</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <tr>
                <th className="p-3">Exam</th>
                <th className="p-3">Marathi</th>
                <th className="p-3">English</th>
                <th className="p-3">Maths</th>
                <th className="p-3">EVS</th>
                <th className="p-3">Total</th>
                <th className="p-3">%</th>
                <th className="p-3">Grade</th>
              </tr>
            </thead>

            <tbody>
              {resultData.map((res, i) => (
                <tr key={i} className="border-t text-center">
                  <td className="p-3 font-semibold text-blue-600">{res.exam}</td>
                  <td>{res.marathi}</td>
                  <td>{res.english}</td>
                  <td>{res.maths}</td>
                  <td>{res.evs}</td>
                  <td className="font-semibold">{res.total}</td>
                  <td>{res.percentage}%</td>
                  <td className="text-green-600 font-semibold">{res.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔥 Bottom Navigation (Home + Logout) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around py-3">

        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center text-blue-600 hover:text-blue-800 transition"
        >
          <FaHome className="text-xl mb-1" />
          <span className="text-sm font-medium">Home</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-red-500 hover:text-red-700 transition"
        >
          <FaSignOutAlt className="text-xl mb-1" />
          <span className="text-sm font-medium">Logout</span>
        </button>

      </div>
    </div>
  );
};

export default ParentDashboard;
