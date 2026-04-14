import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('zpkudave_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('zpkudave_token');
  });

  useEffect(() => {
    const saved = localStorage.getItem('zpkudave_user');
    const token = localStorage.getItem('zpkudave_token');

    if (saved && token) {
      setUser(JSON.parse(saved));
      setIsAuthenticated(true);
    }
  }, []);

  // 🔐 FIREBASE LOGIN (SECURE)
  const loginWithFirebase = async (firebaseUser) => {
    try {
      // 📌 Fetch role from Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User role not found in Firestore");
      }

      const userRole = userSnap.data().role;

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.email,
        role: userRole,
      };

      // 💾 Save in localStorage
      localStorage.setItem('zpkudave_user', JSON.stringify(userData));
      localStorage.setItem('zpkudave_token', 'firebase-token-' + Date.now());
      localStorage.setItem('zpkudave_role', userRole);

      // 🔄 Update state
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, role: userRole };

    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.message };
    }
  };

  // 🚪 LOGOUT
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