import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/authService'; // your API call function

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')? true:false);

  // Define login function here
  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);

      if (data?.user && data?.token) {
        const userWithRole = {
          ...data.user,
          role: data.user.role || 'student', // fallback role
        };

        setUser(userWithRole);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        localStorage.setItem('token', data.token);
        return userWithRole;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      throw typeof err === 'string' ? err : err.message || 'Login error';
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export { AuthContext };
