import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(() => {
    try { return JSON.parse(localStorage.getItem('doctor')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.status === 'success') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('doctor', JSON.stringify(data.doctor));
      setToken(data.token);
      setDoctor(data.doctor);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    if (data.status === 'success') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('doctor', JSON.stringify(data.doctor));
      setToken(data.token);
      setDoctor(data.doctor);
      return data;
    }
    throw new Error(data.message || 'Register failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('doctor');
    setToken(null);
    setDoctor(null);
  };

  // Refresh me
  useEffect(() => {
    if (token && !doctor) {
      api.get('/doctors/me').then(({ data }) => {
        if (data.status === 'success') {
          setDoctor(data.data);
          localStorage.setItem('doctor', JSON.stringify(data.data));
        }
      }).catch(() => logout());
    }
  }, []);

  return (
    <AuthContext.Provider value={{ doctor, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
