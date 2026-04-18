import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Context
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import EventSlider from "./components/EventSlider";

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Donate from './pages/Donate';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Teacher Dashboard Pages
import TeacherOverview from './pages/dashboard/teacher/TeacherOverview';
import MarkAttendance from './pages/dashboard/teacher/MarkAttendance';
import AttendanceHistory from './pages/dashboard/teacher/AttendanceHistory';
import DefaulterList from './pages/dashboard/teacher/DefaulterList';
import UploadResults from './pages/dashboard/teacher/UploadResults';
import Notices from './pages/dashboard/teacher/Notices';
import ManageStudents from './pages/dashboard/teacher/ManageStudents';
import EventPhotoUpload from "./pages/dashboard/teacher/EventPhotoUpload";
import MidDayMeal from './pages/dashboard/teacher/MidDayMeal';

// Parent Dashboard
import ParentDashboard from './pages/dashboard/parent/ParentDashboard';

// ScrollToTopOnNavigate component
import { useEffect } from 'react';

const ScrollToTopOnNavigate = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout wrapper for public pages with Navbar + Footer
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

// Layout wrapper for auth pages (no footer, minimal navbar)
const AuthLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <LanguageProvider>
      <AuthProvider>
        <ScrollToTopOnNavigate />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              borderRadius: '12px',
              padding: '14px 20px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
        <ScrollToTop />

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Pages */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/donate" element={<PublicLayout><Donate /></PublicLayout>} />
            <Route path="/help" element={<PublicLayout><Help /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

            {/* Auth Pages */}
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

            {/* Teacher Dashboard */}
            <Route
              path="/dashboard/teacher"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherOverview />} />
              <Route path="mark-attendance" element={<MarkAttendance />} />
              <Route path="attendance-history" element={<AttendanceHistory />} />
              <Route path="defaulters" element={<DefaulterList />} />
              <Route path="upload-results" element={<UploadResults />} />
              <Route path="notices" element={<Notices />} />
              <Route path="manage-students" element={<ManageStudents />} />
              <Route path="event-photos" element={<EventPhotoUpload />} />
              <Route path="mid-day-meal" element={<MidDayMeal />} />
            </Route>

            {/* Parent Dashboard */}
            <Route
              path="/dashboard/parent"
              element={
                <ProtectedRoute requiredRole="parent">
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
