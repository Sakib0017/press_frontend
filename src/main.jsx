import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

function Protected({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
