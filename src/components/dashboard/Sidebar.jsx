import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FaChartPie, FaClipboardCheck, FaHistory, FaExclamationTriangle, FaUpload, FaBullhorn, FaSignOutAlt, FaBars, FaTimes, FaSchool } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { FaUserGraduate } from "react-icons/fa";

const Sidebar = () => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard/teacher', icon: FaChartPie, label: t('dash_overview'), end: true },
    { path: '/dashboard/teacher/mark-attendance', icon: FaClipboardCheck, label: t('dash_mark_attendance') },
    { path: '/dashboard/teacher/attendance-history', icon: FaHistory, label: t('dash_attendance_history') },
    { path: '/dashboard/teacher/defaulters', icon: FaExclamationTriangle, label: t('dash_defaulter_list') },
    { path: '/dashboard/teacher/upload-results', icon: FaUpload, label: t('dash_upload_results') },
    { path: '/dashboard/teacher/notices', icon: FaBullhorn, label: t('dash_notices') },
    { path: '/dashboard/teacher/manage-students', icon: FaUserGraduate, label: "Manage Students" },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-dark-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <FaSchool className="text-white" />
          </div>
          <div>
            <h3 className="font-poppins font-bold text-dark-800 text-sm">{t('nav_school_name')}</h3>
            <p className="text-dark-400 text-xs">{t('dash_teacher')}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <item.icon className="text-lg" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-dark-100">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="text-sm">{t('dash_logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-dark-100 h-screen fixed left-0 top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-dark-600 hover:bg-dark-50"
      >
        <FaBars />
      </button>

      {/* Mobile Sidebar */}
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
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-2xl z-50 lg:hidden"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-50 text-dark-500"
              >
                <FaTimes />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
