import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../Firebase/config";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('zpkudave_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('zpkudave_token');
  });

  // 🔥 ADD THIS
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('zpkudave_user');
    const token = localStorage.getItem('zpkudave_token');

    if (saved && token) {
      setUser(JSON.parse(saved));
      setIsAuthenticated(true);
    }

    setLoading(false); // ✅ VERY IMPORTANT
  }, []);

  // 🔐 FIREBASE LOGIN
  const loginWithFirebase = async (firebaseUser) => {
    try {
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: firebaseUser.email === "rzpschoolkudave1956@gmail.com"
          ? "teacher"
          : "parent",
      };

      // 🔥 FORCE SAVE (NO FIRESTORE DEPENDENCY)
      localStorage.setItem("zpkudave_user", JSON.stringify(userData));
      localStorage.setItem("zpkudave_token", "token");

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, role: userData.role };

    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('zpkudave_user');
    localStorage.removeItem('zpkudave_token');
    localStorage.removeItem('zpkudave_role');

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading, // ✅ ADD THIS
      loginWithFirebase,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔁 CUSTOM HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;