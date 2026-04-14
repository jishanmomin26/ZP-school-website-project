import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaSave } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { getGrade, getGradeColor } from '../../../data/dummyData';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../Firebase/config';
import { getStudents } from '../../../Firebase/students';

const UploadResults = () => {
  const { t } = useLanguage();

  const [selectedClass, setSelectedClass] = useState('3');
  const [selectedExam, setSelectedExam] = useState('UT1');

  const [students, setStudents] = useState([]); // ✅ Firebase students
  const [results, setResults] = useState({});

  const exams = ['UT1', 'UT2', 'Semester 1', 'Semester 2'];
  const subjects = ['marathi', 'english', 'maths', 'evs'];
  const maxMarks = selectedExam.startsWith('UT') ? 50 : 100;

  // ✅ FETCH STUDENTS
  useEffect(() => {
    const fetchStudents = async () => {
      const data = await getStudents();
      setStudents(data);
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => s.class === selectedClass);

  // ✅ LOAD RESULTS FROM FIREBASE
  useEffect(() => {
    const loadResults = async () => {
      try {
        const snap = await getDoc(doc(db, 'results', `class_${selectedClass}`));

        let firebaseResults = [];

        if (snap.exists()) {
          firebaseResults = snap.data()[selectedExam] || [];
        }

        const initial = {};

        filteredStudents.forEach(s => {
          const existing = firebaseResults.find(
            r => String(r.studentId) === String(s.id)
          );

          initial[s.id] = existing || {
            marathi: '',
            english: '',
            maths: '',
            evs: ''
          };
        });

        setResults(initial);

      } catch (err) {
        console.error("Error loading results:", err);
      }
    };

    if (students.length > 0) loadResults();

  }, [students, selectedClass, selectedExam]);

  // 🔥 UPDATE MARK
  const updateMark = (studentId, subject, value) => {
    const num = value === '' ? '' : Math.min(maxMarks, Math.max(0, Number(value)));

    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: num
      }
    }));
  };

  // 🔥 CALCULATIONS
  const calculateTotal = (marks) => {
    const vals = subjects.map(s => Number(marks[s]) || 0);
    return vals.reduce((a, b) => a + b, 0);
  };

  const calculatePercentage = (marks) => {
    const total = calculateTotal(marks);
    return Math.round((total / (maxMarks * 4)) * 100);
  };

  // 🔥 SAVE TO FIREBASE
  const handleSave = async () => {
    try {
      const formattedResults = Object.entries(results).map(([id, marks]) => ({
        studentId: String(id),
        ...marks,
      }));

      await setDoc(
        doc(db, 'results', `class_${selectedClass}`),
        {
          [selectedExam]: formattedResults
        },
        { merge: true }
      );

      toast.success(t('teacher_results_saved'));

    } catch (err) {
      console.error(err);
      toast.error("Failed to save results ❌");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-poppins text-2xl font-bold text-dark-800 mb-6">
        {t('dash_upload_results')}
      </h1>

      {/* SELECTORS (UNCHANGED UI) */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1">
            {t('teacher_select_class')}
          </label>
          <div className="flex gap-2">
            {['1', '2', '3', '4'].map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  selectedClass === cls
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border'
                }`}
              >
                {t('teacher_class')} {cls}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1">
            {t('teacher_select_exam')}
          </label>
          <select
            value={selectedExam}
            onChange={e => setSelectedExam(e.target.value)}
            className="input-field w-auto py-2"
          >
            {exams.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-dark-400 text-sm mb-4">
        Max marks: {maxMarks}
      </p>

      {/* TABLE (UNCHANGED UI) */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full">
          <tbody>
            {filteredStudents.map(student => {
              const marks = results[student.id] || {};
              const total = calculateTotal(marks);
              const pct = calculatePercentage(marks);
              const grade = getGrade(pct);

              return (
                <tr key={student.id}>
                  <td>{student.roll}</td>
                  <td>{student.name}</td>

                  {subjects.map(sub => (
                    <td key={sub}>
                      <input
                        type="number"
                        value={marks[sub] ?? ''}
                        onChange={e => updateMark(student.id, sub, e.target.value)}
                      />
                    </td>
                  ))}

                  <td>{total}</td>
                  <td>{grade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button onClick={handleSave} className="btn-primary mt-4">
        <FaSave /> Save
      </button>
    </motion.div>
  );
};

export default UploadResults;