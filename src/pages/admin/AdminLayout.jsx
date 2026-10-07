import { NavLink, Outlet, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAdminAuth } from '../../context/AdminAuthContext';

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/doctors', label: 'Doctors' },
  { to: '/admin/appointments', label: 'Appointments' },
  { to: '/admin/prescriptions', label: 'Prescriptions' },
  { to: '/admin/components', label: 'Components' },
  { to: '/admin/library', label: 'Medicine / Advice / Dose' },
  { to: '/admin/admins', label: 'Admins' },
];

export default function AdminLayout() {
  const { admin, adminLogout } = useAdminAuth();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 text-slate-700 font-sans antialiased">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Admin header (NOT doctor Header) — main admin is not a doctor */}
        <header className="bg-slate-900 text-white px-3 py-2 sm:px-4 flex flex-wrap justify-between items-center gap-2 shrink-0">
          <div className="text-[12px] font-bold flex items-center gap-2">
            <span className="bg-blue-600 px-2 py-0.5 rounded-full text-[11px] font-black uppercase">Main Admin</span>
            <span className="truncate max-w-[220px]">{admin?.name || 'Admin'} · {admin?.email || ''}</span>
          </div>
          <button onClick={adminLogout} className="text-[11px] font-black uppercase text-red-300 hover:bg-white/10 px-2 py-1 rounded-lg">Logout admin</button>
        </header>
        {/* Admin sub-nav — keeps ALL doctor-panel functions one click away */}
        <div className="bg-slate-800 text-white px-3 sm:px-4 py-2 flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-[11px] font-black uppercase tracking-widest bg-blue-600 px-2 py-1 rounded">Admin Panel</span>
          <nav className="flex flex-wrap gap-1.5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-white text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex gap-1.5 text-[11px] font-bold">
            <Link to="/dashboard" className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">Doctor Panel</Link>
            <Link to="/patient-reg" className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20">+ Patient Reg</Link>
            <Link to="/patient-list" className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20">Patient List</Link>
            <Link to="/prescriptions" className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20">Pres List</Link>
            <Link to="/setup" className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20">Setup</Link>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
