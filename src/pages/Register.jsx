import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaChalkboardTeacher, FaUserFriends, FaEye, FaEyeSlash, FaSchool } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import PageTransition from '../components/PageTransition';

/* ✅ FIX: Move InputField OUTSIDE component */
const InputField = ({ label, name, type = 'text', placeholder, error, form, setForm }) => (
  <div>
    <label className="block text-sm font-medium text-dark-700 mb-1.5">
      {label} *
    </label>
    <input
      type={type}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      className={`input-field ${error ? 'border-red-400' : ''}`}
      placeholder={placeholder}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState('teacher');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    parentId: '',
    studentName: '',
    studentClass: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};

    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';

    if (!form.password) e.password = 'Required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';

    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';

    if (role === 'teacher') {
      if (!form.email.trim()) e.email = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    } else {
      if (!form.parentId.trim()) e.parentId = 'Required';
      if (!form.studentName.trim()) e.studentName = 'Required';
      if (!form.studentClass) e.studentClass = 'Required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    toast.success(t('register_success'));
    navigate('/login');
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
            <h1 className="font-poppins text-2xl font-bold text-dark-800">
              {t('register_title')}
            </h1>
            <p className="text-dark-500 text-sm mt-1">
              {t('register_subtitle')}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-dark-100 overflow-hidden">

            {/* Role Tabs */}
            <div className="grid grid-cols-2 border-b border-dark-100">
              <button
                onClick={() => setRole('teacher')}
                className={`flex items-center justify-center gap-2 py-4 font-semibold text-sm ${
                  role === 'teacher'
                    ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                    : 'text-dark-400 hover:bg-dark-50'
                }`}
              >
                <FaChalkboardTeacher /> {t('register_teacher')}
              </button>

              <button
                onClick={() => setRole('parent')}
                className={`flex items-center justify-center gap-2 py-4 font-semibold text-sm ${
                  role === 'parent'
                    ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                    : 'text-dark-400 hover:bg-dark-50'
                }`}
              >
                <FaUserFriends /> {t('register_parent')}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <InputField
                label={t('register_name')}
                name="name"
                placeholder={t('register_name')}
                error={errors.name}
                form={form}
                setForm={setForm}
              />

              {role === 'teacher' ? (
                <InputField
                  label={t('register_email')}
                  name="email"
                  type="email"
                  placeholder="teacher@example.com"
                  error={errors.email}
                  form={form}
                  setForm={setForm}
                />
              ) : (
                <>
                  <InputField
                    label={t('register_parent_id')}
                    name="parentId"
                    placeholder="PARENT002"
                    error={errors.parentId}
                    form={form}
                    setForm={setForm}
                  />

                  <InputField
                    label={t('register_student_name')}
                    name="studentName"
                    placeholder={t('register_student_name')}
                    error={errors.studentName}
                    form={form}
                    setForm={setForm}
                  />

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1.5">
                      {t('register_class')} *
                    </label>
                    <select
                      value={form.studentClass}
                      onChange={(e) => setForm({ ...form, studentClass: e.target.value })}
                      className={`input-field ${errors.studentClass ? 'border-red-400' : ''}`}
                    >
                      <option value="">{t('teacher_select_class')}</option>
                      <option value="1">1st</option>
                      <option value="2">2nd</option>
                      <option value="3">3rd</option>
                      <option value="4">4th</option>
                    </select>
                    {errors.studentClass && (
                      <p className="text-red-500 text-xs mt-1">{errors.studentClass}</p>
                    )}
                  </div>
                </>
              )}

              <InputField
                label={t('register_phone')}
                name="phone"
                type="tel"
                placeholder="+91 9876543210"
                error={errors.phone}
                form={form}
                setForm={setForm}
              />

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                  {t('register_password')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`input-field pr-12 ${errors.password ? 'border-red-400' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <InputField
                label={t('register_confirm')}
                name="confirm"
                type="password"
                placeholder="••••••••"
                error={errors.confirm}
                form={form}
                setForm={setForm}
              />

              <button type="submit" className="btn-primary w-full">
                {t('register_button')}
              </button>

              <p className="text-center text-dark-500 text-sm">
                {t('register_have_account')}{' '}
                <Link to="/login" className="text-primary-600 font-semibold">
                  {t('register_login_link')}
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </section>
    </PageTransition>
  );
};

export default Register;
