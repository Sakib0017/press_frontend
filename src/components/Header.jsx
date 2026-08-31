import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Header() {
  const { doctor, logout } = useAuth();
  const room = doctor?.room || 'N/A';
  return (
    <header className="bg-white border-b border-slate-200 p-2 flex flex-col sm:flex-row justify-between items-center shrink-0 z-20 shadow-sm gap-2">
      <div className="font-bold text-slate-800 flex items-center gap-2 text-[12px] w-full sm:w-auto">
        Room: <span className="text-blue-700">{room}</span>
      </div>
      <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-end w-full sm:w-auto">
        <select className="border border-slate-300 rounded px-2 py-1 text-[11px] bg-white shadow-sm">
          <option>Previous Prescriptions</option>
        </select>
        <div className="flex border border-slate-300 rounded overflow-hidden shadow-sm">
          <button className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 text-[10px] font-bold">Files</button>
          <button className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 text-[10px] font-bold border-l border-white/20">EHR</button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-[10px] font-bold border-l border-white/20">Reset</button>
        </div>
        <button onClick={logout} className="flex items-center gap-1 text-red-500 font-black text-[10px] uppercase hover:underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Logout
        </button>
      </div>
    </header>
  );
}
