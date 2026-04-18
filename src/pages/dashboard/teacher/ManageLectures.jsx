import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaVideo, FaPlus, FaTrash, FaYoutube, FaLink, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ManageLectures = () => {
  const [lectures, setLectures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newLecture, setNewLecture] = useState({
    title: '',
    url: '',
    type: 'youtube', // youtube, zoom, meet, other
    subject: 'Mathematics',
    description: ''
  });

  const subjects = ['Mathematics', 'Science', 'English', 'Marathi', 'Social Sciences', 'Art', 'Physical Education'];

  // Load lectures from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zpkudave_lectures');
    if (saved) {
      setLectures(JSON.parse(saved));
    }
  }, []);

  // Save lectures to localStorage
  const saveLectures = (updatedLectures) => {
    setLectures(updatedLectures);
    localStorage.setItem('zpkudave_lectures', JSON.stringify(updatedLectures));
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddLecture = (e) => {
    e.preventDefault();
    
    let videoId = null;
    if (newLecture.type === 'youtube') {
      videoId = extractYoutubeId(newLecture.url);
      if (!videoId) {
        toast.error('Invalid YouTube URL');
        return;
      }
    }

    const lectureToAdd = {
      ...newLecture,
      id: Date.now().toString(),
      videoId,
      createdAt: new Date().toISOString()
    };

    const updated = [...lectures, lectureToAdd];
    saveLectures(updated);
    setNewLecture({ title: '', url: '', type: 'youtube', subject: 'Mathematics', description: '' });
    setShowForm(false);
    toast.success('Lecture added successfully!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      const updated = lectures.filter(l => l.id !== id);
      saveLectures(updated);
      toast.success('Lecture deleted');
    }
  };

  // Group lectures by subject
  const groupedLectures = lectures.reduce((acc, lecture) => {
    const sub = lecture.subject || 'Other';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(lecture);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-800">Manage Lectures</h1>
          <p className="text-dark-500 text-sm">Upload and manage learning materials for students</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <FaPlus className="rotate-45" /> : <FaPlus />}
          {showForm ? 'Cancel' : 'Add New Lecture'}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-dark-100"
        >
          <form onSubmit={handleAddLecture} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Lecture Title</label>
                <input
                  type="text"
                  required
                  value={newLecture.title}
                  onChange={e => setNewLecture({...newLecture, title: e.target.value})}
                  className="input-field"
                  placeholder="e.g. Mathematics - Part 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Subject</label>
                <select
                  value={newLecture.subject}
                  onChange={e => setNewLecture({...newLecture, subject: e.target.value})}
                  className="input-field"
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Lecture Type</label>
                <select
                  value={newLecture.type}
                  onChange={e => setNewLecture({...newLecture, type: e.target.value})}
                  className="input-field"
                >
                  <option value="youtube">YouTube Video</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="other">Other Link</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">URL / Link</label>
                <input
                  type="url"
                  required
                  value={newLecture.url}
                  onChange={e => setNewLecture({...newLecture, url: e.target.value})}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Description (Optional)</label>
                <textarea
                  value={newLecture.description}
                  onChange={e => setNewLecture({...newLecture, description: e.target.value})}
                  className="input-field py-2"
                  rows="3"
                  placeholder="Brief summary of the lecture"
                />
              </div>
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="btn-primary w-full shadow-lg shadow-primary-500/20">
                Create Lecture
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Lectures List grouped by Subject */}
      <div className="space-y-10">
        {lectures.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-dark-200">
            <FaVideo className="text-4xl text-dark-200 mx-auto mb-3" />
            <p className="text-dark-500">No lectures uploaded yet. Click "Add New Lecture" to start.</p>
          </div>
        ) : (
          Object.keys(groupedLectures).map(subject => (
            <div key={subject} className="space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-primary-500 pl-4 py-1">
                <h2 className="text-lg font-bold text-dark-800 uppercase tracking-wider">{subject}</h2>
                <span className="bg-primary-50 text-primary-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {groupedLectures[subject].length} Lectures
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {groupedLectures[subject].map(lecture => (
                  <motion.div
                    key={lecture.id}
                    layout
                    className="bg-white rounded-2xl p-5 shadow-sm border border-dark-100 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${
                        lecture.type === 'youtube' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'
                      }`}>
                        {lecture.type === 'youtube' ? <FaYoutube className="text-xl" /> : <FaLink className="text-xl" />}
                      </div>
                      <button
                        onClick={() => handleDelete(lecture.id)}
                        className="text-dark-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                    <h3 className="font-bold text-dark-800 mb-1 line-clamp-1">{lecture.title}</h3>
                    <p className="text-dark-500 text-sm line-clamp-2 mb-4 h-10">
                      {lecture.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-dark-50">
                      <span className="text-xs text-dark-400">
                        {new Date(lecture.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        <FaCheckCircle className="text-[10px]" />
                        Active
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageLectures;
