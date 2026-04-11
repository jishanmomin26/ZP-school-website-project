import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaChalkboardTeacher, FaUserFriends, FaEye, FaEyeSlash, FaSchool } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', parentId: '' });
  const [error, setError] = useState('');

  const validatePassword = (pw) => {
    return pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(pw);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (role === 'teacher') {
      if (!validatePassword(form.password)) {
        setError(t('login_password_rules'));
        return;
      }
      const result = login({ email: form.email, password: form.password }, 'teacher');
      if (result.success) {
        toast.success(`Welcome, Teacher! 🎉`);
        navigate('/dashboard/teacher');
      } else {
        setError(t('login_error'));
      }
    } else {
      const result = login({ parentId: form.parentId, password: form.password }, 'parent');
      if (result.success) {
        toast.success(`Welcome, Parent! 🎉`);
        navigate('/dashboard/parent');
      } else {
        setError(t('login_error'));
      }
    }
  };

  return (
    <PageTransition>
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 via-primary-50/30 to-dark-50 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaSchool className="text-white text-2xl" />
            </div>
            <h1 className="font-poppins text-2xl font-bold text-dark-800">{t('login_title')}</h1>
            <p className="text-dark-500 text-sm mt-1">{t('login_subtitle')}</p>
          </div>

          {/* Role Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-dark-100 overflow-hidden">
            <div className="grid grid-cols-2 border-b border-dark-100">
              <button
                onClick={() => { setRole('teacher'); setError(''); }}
                className={`flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-all duration-200 ${
                  role === 'teacher'
                    ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                    : 'text-dark-400 hover:bg-dark-50'
                }`}
              >
                <FaChalkboardTeacher /> {t('login_teacher')}
              </button>
              <button
                onClick={() => { setRole('parent'); setError(''); }}
                className={`flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-all duration-200 ${
                  role === 'parent'
                    ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                    : 'text-dark-400 hover:bg-dark-50'
                }`}
              >
                <FaUserFriends /> {t('login_parent')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {role === 'teacher' ? (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('login_email')}</label>
                  <input
                    type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="input-field" placeholder="teacher@zpkudave.edu.in" required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('login_parent_id')}</label>
                  <input
                    type="text" value={form.parentId}
                    onChange={e => setForm({ ...form, parentId: e.target.value })}
                    className="input-field" placeholder="PARENT001" required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('login_password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="input-field pr-12" placeholder="••••••••" required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {role === 'teacher' && (
                  <p className="text-dark-400 text-xs mt-1.5">{t('login_password_rules')}</p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              <button type="submit" className="btn-primary w-full">
                {t('login_button')}
              </button>

              <p className="text-center text-dark-500 text-sm">
                {t('login_no_account')}{' '}
                <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
                  {t('login_register_link')}
                </Link>
              </p>

              {/* Demo Credentials */}
              <div className="mt-4 p-4 bg-dark-50 rounded-lg border border-dark-100">
                <p className="text-xs font-semibold text-dark-500 mb-2">Demo Credentials:</p>
                {role === 'teacher' ? (
                  <div className="text-xs text-dark-400 space-y-0.5">
                    <p>Email: <span className="font-mono text-dark-600">teacher@zpkudave.edu.in</span></p>
                    <p>Password: <span className="font-mono text-dark-600">Teacher@123</span></p>
                  </div>
                ) : (
                  <div className="text-xs text-dark-400 space-y-0.5">
                    <p>Parent ID: <span className="font-mono text-dark-600">PARENT001</span></p>
                    <p>Password: <span className="font-mono text-dark-600">Parent@123</span></p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </section>
    </PageTransition>
  );
};

export default Login;
