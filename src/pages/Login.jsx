import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaChalkboardTeacher, FaUserFriends, FaEye, FaEyeSlash, FaSchool } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; // 🔥 ADDED
import PageTransition from '../components/PageTransition';
import { loginTeacher, loginParent } from '../Firebase/auth.js';

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { loginWithFirebase } = useAuth(); // 🔥 ADDED

  const [role, setRole] = useState('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    parentId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pw) => {
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(pw)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'teacher') {
        if (!validatePassword(form.password)) {
          setError(t('login_password_rules'));
          setLoading(false);
          return;
        }

        const result = await loginTeacher({
          email: form.email.trim(),
          password: form.password
        });

        if (result.success) {
          toast.success('Welcome, Teacher! 🎉');

          // 🔥 THIS WAS MISSING (VERY IMPORTANT)
          loginWithFirebase(result.user, 'teacher');

          navigate('/dashboard/teacher');
        } else {
          setError(result.error || t('login_error'));
        }
      } else {
        const result = await loginParent({
          parentId: form.parentId.trim(),
          password: form.password
        });

        if (result.success) {
          toast.success('Welcome, Parent! 🎉');

          // 🔥 ALSO ADD FOR PARENT
          loginWithFirebase({
            email: result.user.email,
            name: result.userData.name, // ✅ real name
          }, 'parent');

          navigate('/dashboard/parent');
        } else {
          setError(result.error || t('login_error'));
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
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
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaSchool className="text-white text-2xl" />
            </div>
            <h1 className="font-poppins text-2xl font-bold text-dark-800">{t('login_title')}</h1>
            <p className="text-dark-500 text-sm mt-1">{t('login_subtitle')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-dark-100 overflow-hidden">
            <div className="grid grid-cols-2 border-b border-dark-100">
              <button
                type="button"
                onClick={() => {
                  setRole('teacher');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-4 font-semibold text-sm ${role === 'teacher'
                    ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                    : 'text-dark-400 hover:bg-dark-50'
                  }`}
              >
                <FaChalkboardTeacher /> {t('login_teacher')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('parent');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-4 font-semibold text-sm ${role === 'parent'
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
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">
                    {t('login_email')}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field"
                    placeholder="teacher@gmail.com"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">
                    {t('login_parent_id')}
                  </label>
                  <input
                    type="text"
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="input-field"
                    placeholder="PARENT001"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                  {t('login_password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <button type="submit" className="btn-primary w-full">
                {loading ? 'Please wait...' : t('login_button')}
              </button>

              <p className="text-center text-sm">
                {t('login_no_account')}{' '}
                <Link
                  to={`/register?role=${role}`}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  {t('login_register_link')}
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </section>
    </PageTransition>
  );
};

export default Login;