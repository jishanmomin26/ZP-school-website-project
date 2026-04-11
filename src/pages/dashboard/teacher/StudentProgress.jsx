import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserGraduate, FaChartBar, FaCheckCircle, FaClock, FaExclamationCircle, FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaBook } from 'react-icons/fa';

const StudentProgress = () => {
  const [lectures, setLectures] = useState([]);
  const [allProgress, setAllProgress] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  
  // Mock student list
  const students = [
    { id: 'STUDENT001', name: 'Aarav Patil', class: '3', roll: '5' },
    { id: 'STUDENT002', name: 'Saanvi Kulkarni', class: '3', roll: '12' },
    { id: 'STUDENT003', name: 'Ishaan Deshmukh', class: '3', roll: '8' },
    { id: 'STUDENT004', name: 'Ananya More', class: '3', roll: '21' },
    { id: 'STUDENT005', name: 'Viraj Shinde', class: '3', roll: '3' },
  ];

  const subjects = ['All', 'Mathematics', 'Science', 'English', 'Marathi', 'Social Sciences', 'Art', 'Physical Education'];

  useEffect(() => {
    const savedLectures = localStorage.getItem('zpkudave_lectures');
    const savedProgress = localStorage.getItem('zpkudave_progress');
    
    if (savedLectures) setLectures(JSON.parse(savedLectures));
    if (savedProgress) setAllProgress(JSON.parse(savedProgress));
  }, []);

  const getProgress = (studentId, lectureId) => {
    const data = allProgress[studentId] && allProgress[studentId][lectureId];
    if (!data) return { percent: 0, skips: [], lastPosition: 0, timeSpent: 0 };
    if (typeof data === 'number') return { percent: data, skips: [], lastPosition: 0, timeSpent: 0 };
    return { 
      percent: data.percent || 0, 
      skips: data.skips || [], 
      lastPosition: data.lastPosition || 0,
      timeSpent: data.timeSpent || 0
    };
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Group lectures by subject for the table headers
  const groupedLectures = lectures.reduce((acc, lecture) => {
    const sub = lecture.subject || 'Other';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(lecture);
    return acc;
  }, {});

  const displayedSubjects = selectedSubject === 'All' 
    ? Object.keys(groupedLectures) 
    : [selectedSubject].filter(s => groupedLectures[s]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-800">Detailed Student Progress</h1>
          <p className="text-dark-500 text-sm">View completion status for every lecture link, organized by subject</p>
        </div>
        <div className="flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-xl border border-primary-100 font-semibold text-sm">
          <FaBook />
          {lectures.length} Active Links
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Search student by name..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {subjects.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedSubject === sub 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                  : 'bg-white text-dark-500 border border-dark-100 hover:bg-dark-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {displayedSubjects.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dark-100">
          <FaExclamationCircle className="text-4xl text-dark-200 mx-auto mb-3" />
          <p className="text-dark-500">No lectures found for this subject.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {displayedSubjects.map(subject => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={subject}
              className="bg-white rounded-2xl shadow-sm border border-dark-100 overflow-hidden"
            >
              <div className="bg-dark-50/50 px-6 py-4 border-b border-dark-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-primary-500 rounded-full" />
                  <h2 className="text-lg font-bold text-dark-800 uppercase tracking-wider">{subject}</h2>
                </div>
                <span className="text-xs font-bold text-dark-400 capitalize">
                  {groupedLectures[subject].length} Individual Links
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-100">
                      <th className="px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wider min-w-[200px]">Student Details</th>
                      {groupedLectures[subject].map(lecture => (
                        <th key={lecture.id} className="px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wider min-w-[160px]">
                          <div className="line-clamp-1 text-primary-600">{lecture.title}</div>
                          <div className="text-[10px] font-normal text-dark-400 mt-1">{lecture.type}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-50">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-dark-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-dark-800">{student.name}</div>
                              {(() => {
                                const studentData = allProgress[student.id] || {};
                                const totalSkipped = Object.values(studentData).reduce((acc, lecture) => {
                                  return acc + (lecture.skips?.reduce((sAcc, skip) => sAcc + skip.duration, 0) || 0);
                                }, 0);
                                
                                return totalSkipped > 0 ? (
                                  <div className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-0.5">
                                    <FaClock className="text-[9px]" />
                                    Total Skip: {formatTime(totalSkipped)}
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-medium text-green-600 mt-0.5">No Skips Detected</div>
                                );
                              })()}
                            </div>
                          </div>
                        </td>
                        {groupedLectures[subject].map(lecture => {
                          const prog = getProgress(student.id, lecture.id);
                          const totalSkipped = prog.skips?.reduce((acc, s) => acc + s.duration, 0) || 0;
                          const isYT = lecture.type === 'youtube';
                          
                          return (
                            <td key={lecture.id} className="px-6 py-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                  {isYT ? (
                                    <span className={`text-[11px] font-extrabold ${prog.percent === 100 ? 'text-green-600' : 'text-dark-600'}`}>
                                      {prog.percent === 100 ? 'COMPLETED' : `${prog.percent}%`}
                                    </span>
                                  ) : (
                                    <span className={`text-[11px] font-extrabold ${prog.timeSpent > 0 ? 'text-blue-600' : 'text-dark-600'}`}>
                                      {prog.timeSpent > 0 ? 'ATTENDED' : 'NOT JOINED'}
                                    </span>
                                  )}

                                  {prog.skips?.length > 0 && (
                                    <span className="text-[10px] font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md">
                                      {prog.skips.length} SKIPS
                                    </span>
                                  )}
                                </div>
                                
                                <div className="h-1.5 w-full bg-dark-100 rounded-full overflow-hidden mb-2">
                                  <div 
                                    className={`h-full transition-all duration-700 ${
                                      prog.percent === 100 || prog.timeSpent > 0 ? 'bg-green-500' : 'bg-primary-500'
                                    }`}
                                    style={{ width: `${isYT ? prog.percent : (prog.timeSpent > 0 ? 100 : 0)}%` }}
                                  />
                                </div>

                                <div className="space-y-1 mt-2 border-t border-dark-50 pt-2 text-[9px]">
                                  {isYT ? (
                                    <>
                                      {prog.lastPosition > 0 && (
                                        <div className="flex items-center justify-between text-dark-500 mb-1">
                                          <span>Last stop:</span>
                                          <span className="font-bold">{formatTime(Math.floor(prog.lastPosition))}</span>
                                        </div>
                                      )}
                                      {prog.skips?.map((skip, i) => (
                                        <div key={i} className="flex items-center justify-between text-red-500 bg-red-50/50 px-1.5 py-0.5 rounded">
                                          <span className="font-bold">Skipped {formatTime(skip.duration)}</span>
                                          <span className="font-medium opacity-70">at {skip.at}%</span>
                                        </div>
                                      ))}
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-between text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                      <span className="font-bold">Total Engagement:</span>
                                      <span className="font-bold">{formatTime(prog.timeSpent)}</span>
                                    </div>
                                  )}
                                  
                                  {totalSkipped > 0 && (
                                    <div className="text-[9px] font-bold text-dark-400 pt-1 text-right italic">
                                      Total Skip: {formatTime(totalSkipped)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
