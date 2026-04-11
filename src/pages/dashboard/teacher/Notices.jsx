import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaPlus, FaBullhorn, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { notices as defaultNotices } from '../../../data/dummyData';

const Notices = () => {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [noticeList, setNoticeList] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('zpkudave_notices') || '[]');
    setNoticeList([...saved, ...defaultNotices]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Please fill all fields');
      return;
    }
    const newNotice = {
      id: Date.now(),
      title: form.title,
      content: form.content,
      date: new Date().toISOString().split('T')[0],
      important: false,
    };

    const saved = JSON.parse(localStorage.getItem('zpkudave_notices') || '[]');
    saved.unshift(newNotice);
    localStorage.setItem('zpkudave_notices', JSON.stringify(saved));
    setNoticeList([newNotice, ...noticeList]);
    setForm({ title: '', content: '' });
    setShowForm(false);
    toast.success(t('teacher_notice_saved'));
  };

  const handleDelete = (id) => {
    const saved = JSON.parse(localStorage.getItem('zpkudave_notices') || '[]');
    const filtered = saved.filter(n => n.id !== id);
    localStorage.setItem('zpkudave_notices', JSON.stringify(filtered));
    setNoticeList(noticeList.filter(n => n.id !== id));
    toast.success('Notice deleted');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins text-2xl font-bold text-dark-800">{t('dash_notices')}</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <FaPlus /> {t('teacher_add_notice')}
        </button>
      </div>

      {/* Add Notice Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-xl p-6 shadow-sm border border-dark-100 mb-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('teacher_notice_title')}</label>
              <input
                type="text" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input-field" placeholder={t('teacher_notice_title')} required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('teacher_notice_content')}</label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="input-field" rows="3" placeholder={t('teacher_notice_content')} required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary text-sm">{t('teacher_notice_save')}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Notice List */}
      <div className="space-y-4">
        {noticeList.map((notice, i) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${
              notice.important ? 'border-l-accent-500' : 'border-l-primary-500'
            } border border-dark-100`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <FaBullhorn className={`text-sm ${notice.important ? 'text-accent-500' : 'text-primary-500'}`} />
                  <h4 className="font-poppins font-semibold text-dark-800">{notice.title}</h4>
                  {notice.important && (
                    <span className="px-2 py-0.5 bg-accent-50 text-accent-600 text-xs font-semibold rounded-full">Important</span>
                  )}
                </div>
                <p className="text-dark-500 text-sm">{notice.content}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="flex items-center gap-1.5 text-dark-400 text-xs">
                  <FaCalendarAlt /> {notice.date}
                </span>
                {!defaultNotices.find(n => n.id === notice.id) && (
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="p-1.5 text-dark-300 hover:text-red-500 transition-colors"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Notices;
