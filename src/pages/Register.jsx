import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaChalkboardTeacher, FaUserFriends, FaSchool, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import { registerTeacher, registerParent } from '../Firebase/auth.js';

const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithFirebase } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const roleFromURL = queryParams.get('role');

  const [role, setRole] = useState(roleFromURL || 'teacher');
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Separate Forms
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [parentForm, setParentForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    parentId: ''
  });

  // 🔥 Dynamic form
  const form = role === 'teacher' ? teacherForm : parentForm;
  const setForm = role === 'teacher' ? setTeacherForm : setParentForm;

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

    if (!validatePassword(form.password)) {
      setError(t('login_password_rules'));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (role === 'parent' && !form.parentId.trim()) {
      setError('Parent ID is required.');
      return;
    }

    setLoading(true);

    try {
      let result;

      if (role === 'teacher') {
        result = await registerTeacher({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password
        });

        if (result.success) {
          toast.success('Registration successful! Please login.');

          navigate('/login');
        }
      } else {
        result = await registerParent({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          parentId: form.parentId.trim()
        });

        if (result.success) {
          toast.success('Parent registered 🎉');

          loginWithFirebase({
            email: result.user.email,
            name: form.name
          }, 'parent');

          navigate('/dashboard/parent');
        }
      }

      if (!result.success) {
        setError(result.error || 'Registration failed.');
      }

    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
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
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaSchool className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
          </div>

          <div className="bg-white rounded-xl shadow p-6">

            {/* Tabs */}
            <div className="grid grid-cols-2 mb-4">

              <button
                onClick={() => {
                  setRole('teacher');
                  setError('');
                  setTeacherForm({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                  });
                }}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg transition ${role === 'teacher'
                  ? 'bg-blue-100 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                <FaChalkboardTeacher className="text-lg" />
                <span>Teacher</span>
              </button>

              <button
                onClick={() => {
                  setRole('parent');
                  setError('');
                  setParentForm({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    parentId: ''
                  });
                }}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg transition ${role === 'parent'
                  ? 'bg-blue-100 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                <FaUserFriends className="text-lg" />
                <span>Parent</span>
              </button>

            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                required
              />

              {role === 'parent' && (
                <input
                  type="text"
                  placeholder="Parent ID"
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value.toUpperCase() })}
                  className="input-field"
                  required
                />
              )}

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button className="btn-primary w-full">
                {loading ? 'Please wait...' : 'Register'}
              </button>

            </form>

            <p className="text-center mt-4 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary-600 hover:underline"
              >
                Login
              </Link>
            </p>

          </div>
        </motion.div>
      </section>
    </PageTransition>
  );
};

export default Register;