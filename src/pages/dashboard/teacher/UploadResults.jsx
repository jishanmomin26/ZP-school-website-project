import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaSave } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { students, defaultResults, getGrade, getGradeColor } from '../../../data/dummyData';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../Firebase/config';


const UploadResults = () => {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState('3');
  const [selectedExam, setSelectedExam] = useState('UT1');
  const [results, setResults] = useState({});

  const exams = ['UT1', 'UT2', 'Semester 1', 'Semester 2'];
  const subjects = ['marathi', 'english', 'maths', 'evs'];
  const maxMarks = selectedExam.startsWith('UT') ? 50 : 100;

  const filteredStudents = students.filter(s => s.class === selectedClass);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const snap = await getDoc(doc(db, 'results', `class_${selectedClass}`));

        let firebaseResults = [];

        if (snap.exists()) {
          firebaseResults = snap.data()[selectedExam] || [];
        }

        const existingResults =
          firebaseResults.length > 0
            ? firebaseResults
            : defaultResults[students, selectedClass]?.[selectedExam] || [];

        const initial = {};

        filteredStudents.forEach(s => {
          const existing = existingResults.find(
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

    loadResults();
  }, [selectedClass, selectedExam]);

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

  const calculateTotal = (marks) => {
    const vals = subjects.map(s => Number(marks[s]) || 0);
    return vals.reduce((a, b) => a + b, 0);
  };

  const calculatePercentage = (marks) => {
    const total = calculateTotal(marks);
    return Math.round((total / (maxMarks * 4)) * 100);
  };

  // 🔥 ONLY CHANGE → FIREBASE SAVE
  const handleSave = async () => {
    try {
      const formattedResults = Object.entries(results).map(([id, marks]) => ({
        studentId: String(id), // ✅ FIXED
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

      {/* Selectors */}
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
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${selectedClass === cls
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-dark-600 border border-dark-200 hover:border-primary-300'
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
        Max marks: {maxMarks} per subject
      </p>

      {/* Results Table (UNCHANGED UI) */}
      <div className="bg-white rounded-xl shadow-sm border border-dark-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">{t('teacher_roll')}</th>
                <th className="px-4 py-3 text-left">{t('teacher_student_name')}</th>
                <th className="px-4 py-3 text-center">{t('teacher_marathi')}</th>
                <th className="px-4 py-3 text-center">{t('teacher_english')}</th>
                <th className="px-4 py-3 text-center">{t('teacher_maths')}</th>
                <th className="px-4 py-3 text-center">{t('teacher_evs')}</th>
                <th className="px-4 py-3 text-center">{t('teacher_total')}</th>
                <th className="px-4 py-3 text-center">{t('teacher_grade')}</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, i) => {
                const marks = results[student.id] || {};
                const total = calculateTotal(marks);
                const pct = calculatePercentage(marks);
                const grade = getGrade(pct);

                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-t border-dark-50 hover:bg-dark-50/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-dark-600">
                      {student.roll}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-dark-800">
                      {student.name}
                    </td>

                    {subjects.map(sub => (
                      <td key={sub} className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          value={marks[sub] ?? ''}
                          onChange={e => updateMark(student.id, sub, e.target.value)}
                          className="w-16 text-center px-2 py-1.5 rounded-lg border border-dark-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </td>
                    ))}

                    <td className="px-4 py-3 text-center font-semibold text-dark-800">
                      {total}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getGradeColor(grade)}`}>
                        {grade}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <FaSave /> {t('teacher_save_results')}
        </button>
      </div>
    </motion.div>
  );
};

export default UploadResults;