import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../../Firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const TeacherOverview = () => {

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    present: 0,
    absent: 0,
    percentage: 0
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);

      try {
        // 🔥 Get all students
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const students = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        let present = 0;
        let absent = 0;

        // 🔥 Get today's attendance for each student
        await Promise.all(
          students.map(async (student) => {
            const ref = doc(db, 'attendance', String(student.id), 'records', today);
            const snap = await getDoc(ref);

            if (snap.exists()) {
              const status = snap.data().status;

              if (status === 'present') present++;
              else absent++;
            }
          })
        );

        const total = students.length;
        const percentage = total ? Math.round((present / total) * 100) : 0;

        setStats({
          totalStudents: total,
          present,
          absent,
          percentage
        });

      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchOverview();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >

      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <>
          {/* 🔥 STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-500 text-sm">Total Students</h3>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>

            <div className="bg-green-50 p-6 rounded-2xl shadow">
              <h3 className="text-green-600 text-sm">Present</h3>
              <p className="text-2xl font-bold text-green-700">{stats.present}</p>
            </div>

            <div className="bg-red-50 p-6 rounded-2xl shadow">
              <h3 className="text-red-600 text-sm">Absent</h3>
              <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow">
              <h3 className="text-blue-600 text-sm">Attendance %</h3>
              <p className="text-2xl font-bold text-blue-700">{stats.percentage}%</p>
            </div>

          </div>

          {/* 🔥 PROGRESS BAR */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold mb-4">Today's Attendance Progress</h3>

            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {stats.percentage}% students are present today
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TeacherOverview;