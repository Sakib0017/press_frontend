import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PatientReg from './pages/PatientReg';
import PatientList from './pages/PatientList';
import PresList from './pages/PresList';
import Prescription from './pages/Prescription';
import EditPrescription from './pages/EditPrescription';
import PrintPrescription from './pages/PrintPrescription';
import Setup from './pages/Setup';
import Profile from './pages/Profile';
import Reset from './pages/Reset';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminPrescriptions from './pages/admin/AdminPrescriptions';
import AdminComponents from './pages/admin/AdminComponents';
import AdminLibrary from './pages/admin/AdminLibrary';
import AdminAdmins from './pages/admin/AdminAdmins';

function Protected({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// Main admin guard — NOT a doctor guard. Uses admin_token.
function AdminProtected({ children }) {
  const { adminToken } = useAdminAuth();
  if (!adminToken) return <Navigate to="/admin/login" replace />;
  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/patient-reg" element={<Protected><PatientReg /></Protected>} />
            <Route path="/patient-list" element={<Protected><PatientList /></Protected>} />
            <Route path="/prescriptions" element={<Protected><PresList /></Protected>} />
            <Route path="/prescription/:id" element={<Protected><Prescription /></Protected>} />
            <Route path="/edit-prescription/:id" element={<Protected><EditPrescription /></Protected>} />
            <Route path="/print/:id" element={<PrintPrescription />} />
            <Route path="/setup" element={<Protected><Setup /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/reset" element={<Protected><Reset /></Protected>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminProtected><AdminLayout /></AdminProtected>}>
              <Route index element={<AdminDashboard />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="prescriptions" element={<AdminPrescriptions />} />
              <Route path="components" element={<AdminComponents />} />
              <Route path="library" element={<AdminLibrary />} />
              <Route path="admins" element={<AdminAdmins />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </AuthProvider>
  </React.StrictMode>
);
