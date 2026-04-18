import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaSave } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { getGrade } from '../../../data/dummyData';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../Firebase/config';
import { getStudents } from '../../../Firebase/students';

const UploadResults = () => {
  const { t } = useLanguage();

  const [selectedClass, setSelectedClass] = useState('3');
  const [selectedExam, setSelectedExam] = useState('UT1');

  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});

  const exams = ['UT1', 'UT2', 'Semester 1', 'Semester 2'];
  const subjects = ['marathi', 'english', 'maths', 'evs'];
  const maxMarks = selectedExam.startsWith('UT') ? 50 : 100;

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      const data = await getStudents();
      setStudents(data);
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    student => String(student.class) === String(selectedClass)
  );

  // Load existing results
  useEffect(() => {
    const loadResults = async () => {
      try {
        const snap = await getDoc(doc(db, 'results', `class_${selectedClass}`));

        let firebaseResults = [];

        if (snap.exists()) {
          firebaseResults = snap.data()[selectedExam] || [];
        }

        const initialResults = {};

        filteredStudents.forEach(student => {
          const existing = firebaseResults.find(
            r => String(r.studentId) === String(student.id)
          );

          initialResults[student.id] = existing || {
            marathi: '',
            english: '',
            maths: '',
            evs: ''
          };
        });

        setResults(initialResults);
      } catch (error) {
        console.error('Error loading results:', error);
      }
    };

    if (students.length > 0) {
      loadResults();
    }
  }, [students, selectedClass, selectedExam]);

  const updateMark = (studentId, subject, value) => {
    const mark =
      value === ''
        ? ''
        : Math.min(maxMarks, Math.max(0, Number(value)));

    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: mark
      }
    }));
  };

  const calculateTotal = marks => {
    return subjects.reduce((sum, subject) => {
      return sum + (Number(marks[subject]) || 0);
    }, 0);
  };

  const calculatePercentage = marks => {
    const total = calculateTotal(marks);
    return Math.round((total / (subjects.length * maxMarks)) * 100);
  };

  const handleSave = async () => {
    try {
      const formattedResults = Object.entries(results).map(([studentId, marks]) => ({
        studentId: String(studentId),
        ...marks
      }));

      await setDoc(
        doc(db, 'results', `class_${selectedClass}`),
        {
          [selectedExam]: formattedResults
        },
        { merge: true }
      );

      toast.success('Results saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save results');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="font-poppins text-2xl font-bold text-dark-800 mb-6">
        {t('dash_upload_results')}
      </h1>

      {/* Selectors */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-dark-600 mb-2">
            Select Class
          </label>

          <div className="flex gap-2">
            {['1', '2', '3', '4'].map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedClass === cls
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-300 text-dark-700'
                }`}
              >
                Class {cls}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-600 mb-2">
            Select Exam
          </label>

          <select
            value={selectedExam}
            onChange={e => setSelectedExam(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          >
            {exams.map(exam => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-dark-500 mb-4">
        Maximum Marks per Subject: {maxMarks}
      </p>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left font-semibold">Roll No</th>
              <th className="p-3 text-left font-semibold">Student Name</th>

              {subjects.map(subject => (
                <th
                  key={subject}
                  className="p-3 text-center font-semibold capitalize"
                >
                  {subject}
                </th>
              ))}

              <th className="p-3 text-center font-semibold">Total</th>
              <th className="p-3 text-center font-semibold">Percentage</th>
              <th className="p-3 text-center font-semibold">Grade</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map(student => {
              const marks = results[student.id] || {};
              const total = calculateTotal(marks);
              const percentage = calculatePercentage(marks);
              const grade = getGrade(percentage);

              return (
                <tr
                  key={student.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{student.roll}</td>
                  <td className="p-3 font-medium">{student.name}</td>

                  {subjects.map(subject => (
                    <td key={subject} className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max={maxMarks}
                        value={marks[subject] ?? ''}
                        onChange={e =>
                          updateMark(student.id, subject, e.target.value)
                        }
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    </td>
                  ))}

                  <td className="p-3 text-center font-semibold">{total}</td>
                  <td className="p-3 text-center">{percentage}%</td>
                  <td className="p-3 text-center font-bold">{grade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-lg font-medium transition"
      >
        <FaSave />
        Save Results
      </button>
    </motion.div>
  );
};

export default UploadResults;
