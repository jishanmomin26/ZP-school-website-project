import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaGraduationCap, FaCalendarCheck,
  FaChartBar, FaSignOutAlt, FaSchool,
  FaCalendarAlt, FaList
} from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../Firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getGrade, getGradeColor } from '../../../data/dummyData';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const ParentDashboard = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  const [studentData, setStudentData] = useState(null);
  const [resultData, setResultData] = useState([]);

  // 🔥 FETCH STUDENT FROM FIREBASE
  useEffect(() => {
    const fetchStudent = async () => {
      if (!user?.studentId) return;

      const snap = await getDoc(doc(db, 'students', user.studentId));
      if (snap.exists()) {
        setStudentData({ id: snap.id, ...snap.data() });
      }
    };

    fetchStudent();
  }, [user]);

  // 🔥 FETCH ATTENDANCE
  useEffect(() => {
    if (!studentData) return;

    const fetchAttendance = async () => {
      setLoadingAttendance(true);

      try {
        const ref = collection(db, 'attendance', studentData.id, 'records');
        const snap = await getDocs(ref);

        const records = snap.docs.map(doc => ({
          date: doc.id,
          status: doc.data().status
        }));

        setAttendanceRecords(records);

      } catch (err) {
        console.error(err);
      }

      setLoadingAttendance(false);
    };

    fetchAttendance();
  }, [studentData]);

  // 🔥 FETCH RESULTS
  useEffect(() => {
    const fetchResults = async () => {
      if (!studentData) return;

      try {
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
              ...studentResult,
              total,
              maxMarks,
              percentage: pct,
              grade: getGrade(pct)
            });
          }
        });

        setResultData(formatted);

      } catch (err) {
        console.error(err);
      }
    };

    fetchResults();
  }, [studentData]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

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
      const dateStr = `${monthPrefix}-${String(i).padStart(2, '0')}`;
      const record = attendanceRecords.find(r => r.date === dateStr);

      days.push({
        date: i,
        fullDate: dateStr,
        status: record?.status,
        key: dateStr
      });
    }

    return days;
  }, [attendanceRecords, currentMonth, currentYear]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  return (
    <div className="min-h-screen bg-dark-50">

      {/* 🔥 TOP BAR */}
      <div className="bg-white border-b px-6 py-4 flex justify-between">
        <div>{user?.name}</div>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="p-6 space-y-6">

        {/* 🔥 STUDENT */}
        {studentData && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold">{studentData.name}</h2>
            <p>Class: {studentData.class}</p>
          </div>
        )}

        {/* 🔥 ATTENDANCE */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Attendance</h3>
          <p className="text-2xl font-bold text-blue-600">
            {monthlyStats.percentage}%
          </p>
        </div>

        {/* 🔥 RESULTS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Results</h3>

          {resultData.length === 0 ? (
            <p>No results available</p>
          ) : (
            resultData.map((res, i) => (
              <div key={i} className="border-b py-2">
                <p className="font-bold">{res.exam}</p>
                <p>Total: {res.total}</p>
                <p>Percentage: {res.percentage}%</p>
                <p>Grade: {res.grade}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default ParentDashboard;