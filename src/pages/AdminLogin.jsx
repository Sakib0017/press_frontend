import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const { adminLogin } = useAdminAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@press.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      nav('/admin', { replace: true });
    } catch (err) {
      const server = err.response?.data?.message;
      const friendly = err.friendlyMessage;
      if (err.response?.status === 404 && (err.config?.url || '').includes('/admin/auth/login')) {
        setError('Route not found: POST /api/admin/auth/login. Backend /api/admin is NOT deployed yet. Redeploy press_backend to Vercel (push / redeploy), then run `npm run seed` once for admin@press.com.');
      } else {
        setError(server || friendly || err.message || 'Admin login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-3 shadow-2xl">
        <div className="text-[11px] font-black uppercase tracking-widest bg-blue-600 text-white inline-block px-2 py-1 rounded">Main Admin — not a doctor</div>
        <h1 className="text-xl font-black text-slate-800">Admin Login</h1>
        <p className="text-[11px] text-slate-500 font-bold">Manages whole prescription system: doctors, appointments, prescriptions (create/update/delete), components, medicine/advice/dose. Doctor logins stay separate at /login.</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg px-3 py-2">{error}</div>}
        <label className="block text-xs"><span className="font-bold uppercase text-slate-500 text-[10px]">Admin email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="admin@press.com" />
        </label>
        <label className="block text-xs"><span className="font-bold uppercase text-slate-500 text-[10px]">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="••••••" />
        </label>
        <button disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-lg">
          {loading ? 'Logging in…' : 'Login as Main Admin'}
        </button>
        <div className="text-[11px] text-slate-500 text-center">
          Default seed: <code>admin@press.com / Admin@123456</code> (change after first login via Admins tab)<br />
          <Link to="/login" className="text-blue-600 font-bold">Doctor login →</Link>
        </div>
      </form>
    </div>
  );
}
