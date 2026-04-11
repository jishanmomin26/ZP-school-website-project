import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaSchool, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: t('nav_home') },
    { path: '/about', label: t('nav_about') },
    { path: '/donate', label: t('nav_donate') },
    { path: '/help', label: t('nav_help') },
    { path: '/contact', label: t('nav_contact') },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentLang = languages.find(l => l.code === language);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-lg shadow-dark-900/5 border-b border-dark-100'
            : 'bg-white/70 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <FaSchool className="text-white text-lg" />
              </div>
              <span className="font-poppins font-bold text-lg text-dark-800 hidden sm:block group-hover:text-primary-600 transition-colors duration-200">
                {t('nav_school_name')}
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-dark-600 hover:bg-dark-50 transition-all duration-200"
                >
                  <FaGlobe className="text-primary-500" />
                  <span className="hidden sm:inline">{currentLang?.flag}</span>
                  <span className="hidden md:inline text-xs">{currentLang?.label}</span>
                </button>
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-dark-100 overflow-hidden z-50"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150 ${
                            language === lang.code
                              ? 'bg-primary-50 text-primary-600 font-semibold'
                              : 'text-dark-600 hover:bg-dark-50'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to={user?.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/parent'}
                    className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
                  >
                    {t('nav_dashboard')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-dark-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                  >
                    {t('nav_logout')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:inline-flex px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary-600/20"
                >
                  {t('nav_login')}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2 rounded-lg text-dark-600 hover:bg-dark-50 transition-colors duration-200"
              >
                {isMobileOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark-900/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-100">
                <span className="font-poppins font-bold text-dark-800">{t('nav_school_name')}</span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-dark-50"
                >
                  <HiX className="text-xl text-dark-500" />
                </button>
              </div>
              <div className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive(link.path)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-dark-600 hover:bg-dark-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t border-dark-100 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to={user?.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/parent'}
                        className="block w-full px-4 py-3 text-center text-sm font-semibold text-primary-600 bg-primary-50 rounded-lg"
                      >
                        {t('nav_dashboard')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-3 text-center text-sm font-semibold text-red-600 bg-red-50 rounded-lg"
                      >
                        {t('nav_logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block w-full px-4 py-3 text-center text-sm font-semibold text-white bg-primary-600 rounded-lg"
                      >
                        {t('nav_login')}
                      </Link>
                      <Link
                        to="/register"
                        className="block w-full px-4 py-3 text-center text-sm font-semibold text-primary-600 border-2 border-primary-600 rounded-lg"
                      >
                        {t('nav_register')}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside to close language dropdown */}
      {isLangOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsLangOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
