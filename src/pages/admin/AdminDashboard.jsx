import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch (e) {
      if (e.response?.status === 404 || (e.response?.data?.message || '').includes('Route not found')) {
        setError('Route not found: /api/admin/stats. Your live backend does NOT have /api/admin yet. Fix: push updated press_backend to Vercel → Redeploy → run `npm run seed` once. Then login at /admin/login as main admin (not doctor).');
      } else if (e.response?.status === 401 || e.response?.status === 403) {
        setError(`${e.response?.data?.message || 'Unauthorized'}. Login at /admin/login as main admin (admin@press.com), not doctor /login.`);
      } else {
        setError(e.response?.data?.message || e.friendlyMessage || e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cards = stats
    ? [
        { label: 'Doctors', value: stats.doctors, to: '/admin/doctors', color: 'bg-blue-600' },
        { label: 'Appointments', value: stats.appointments, to: '/admin/appointments', color: 'bg-emerald-600' },
        { label: 'Prescriptions', value: stats.prescriptions, to: '/admin/prescriptions', color: 'bg-violet-600' },
        { label: 'Components', value: stats.components, to: '/admin/components', color: 'bg-orange-500' },
        { label: 'Medicines', value: stats.medicines, to: '/admin/library', color: 'bg-cyan-600' },
        { label: 'Med Advices', value: stats.medAdvices, to: '/admin/library', color: 'bg-teal-600' },
        { label: 'Doses', value: stats.doses, to: '/admin/library', color: 'bg-pink-600' },
        { label: 'Appt Today', value: stats.apptToday, to: '/admin/appointments', color: 'bg-slate-700' },
        { label: 'Pres Today', value: stats.presToday, to: '/admin/prescriptions', color: 'bg-slate-700' },
        { label: 'Waiting', value: stats.waiting, to: '/admin/appointments?status=waiting', color: 'bg-amber-500' },
        { label: 'Completed', value: stats.completed, to: '/admin/appointments?status=completed', color: 'bg-green-700' },
        { label: 'Cancelled', value: stats.cancelled, to: '/admin/appointments?status=cancelled', color: 'bg-red-600' },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">Admin Overview</h1>
        <span className="text-[11px] text-slate-400 font-bold">GET /api/admin/stats — every collection, today counts, queue status</span>
        <button onClick={load} className="ml-auto text-[11px] font-bold border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-white">Refresh</button>
      </div>
      {loading && <div className="text-sm text-slate-500 font-bold">Loading stats…</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg px-3 py-2">{error} — make sure backend /api/admin is deployed and you are logged in.</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className={`${c.color} px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white`}>{c.label}</div>
            <div className="px-3 py-3 text-3xl font-black text-slate-800">{c.value}</div>
          </Link>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
        <div className="font-black text-slate-800 uppercase text-[11px] tracking-widest">What this panel keeps (nothing removed)</div>
        <ul className="list-disc ml-5 space-y-1">
          <li><b>Doctor panel intact:</b> Dashboard, Patient Reg, Patient List, Pres List, Prescription (queue + 17 sections + Rx modal), Edit, Print, Setup layout, Profile, Reset.</li>
          <li><b>Backend intact:</b> /auth, /doctors, /appointments, /prescriptions, /components, /search + /admin (stats, doctors, appointments, prescriptions, components, medicines, medadvice, doses).</li>
          <li><b>Admin adds:</b> full CRUD + search for every collection via <code>/api/admin/*</code> with your JWT token.</li>
        </ul>
      </div>
    </div>
  );
}
