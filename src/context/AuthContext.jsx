import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEMO_CREDENTIALS = {
  teacher: {
    email: 'teacher@zpkudave.edu.in',
    password: 'Teacher@123',
    name: 'Sou. Renitas Pardeshi',
    role: 'teacher',
  },
  parent: {
    parentId: 'PARENT001',
    password: 'Parent@123',
    name: 'Ramesh Patil',
    role: 'parent',
    studentName: 'Aarav Patil',
    studentClass: '3',
    studentRoll: '5',
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('zpkudave_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('zpkudave_token');
  });

  const login = (credentials, role) => {
    if (role === 'teacher') {
      if (
        credentials.email === DEMO_CREDENTIALS.teacher.email &&
        credentials.password === DEMO_CREDENTIALS.teacher.password
      ) {
        const userData = {
          name: DEMO_CREDENTIALS.teacher.name,
          email: credentials.email,
          role: 'teacher',
        };
        localStorage.setItem('zpkudave_user', JSON.stringify(userData));
        localStorage.setItem('zpkudave_token', 'demo-teacher-token-' + Date.now());
        localStorage.setItem('zpkudave_role', 'teacher');
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, role: 'teacher' };
      }
    } else if (role === 'parent') {
      if (
        credentials.parentId === DEMO_CREDENTIALS.parent.parentId &&
        credentials.password === DEMO_CREDENTIALS.parent.password
      ) {
        const userData = {
          name: DEMO_CREDENTIALS.parent.name,
          parentId: credentials.parentId,
          role: 'parent',
          studentName: DEMO_CREDENTIALS.parent.studentName,
          studentClass: DEMO_CREDENTIALS.parent.studentClass,
          studentRoll: DEMO_CREDENTIALS.parent.studentRoll,
        };
        localStorage.setItem('zpkudave_user', JSON.stringify(userData));
        localStorage.setItem('zpkudave_token', 'demo-parent-token-' + Date.now());
        localStorage.setItem('zpkudave_role', 'parent');
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, role: 'parent' };
      }
    }
    return { success: false };
  };

  const logout = () => {
    localStorage.removeItem('zpkudave_user');
    localStorage.removeItem('zpkudave_token');
    localStorage.removeItem('zpkudave_role');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
