import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Separate from doctor AuthContext. Main admin is NOT a doctor.
// Stores admin_token + admin in localStorage.
const AdminAuthContext = createContext(null);
export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin')); } catch { return null; }
  });
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token'));

  const adminLogin = async (email, password) => {
    const { data } = await api.post('/admin/auth/login', { email, password });
    if (data.status === 'success') {
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      setAdminToken(data.token);
      setAdmin(data.admin);
      return data;
    }
    throw new Error(data.message || 'Admin login failed');
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    setAdminToken(null);
    setAdmin(null);
  };

  // Rehydrate me if token exists but admin missing
  useEffect(() => {
    if (adminToken && !admin) {
      api.get('/admin/auth/me').then(({ data }) => {
        if (data.status === 'success') {
          setAdmin(data.data);
          localStorage.setItem('admin', JSON.stringify(data.data));
        }
      }).catch(() => adminLogout());
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, adminToken, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
