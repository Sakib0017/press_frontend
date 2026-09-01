import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { doctor, logout } = useAuth();
  const room = doctor?.room || 'N/A';
  return (
    <header className="bg-white border-b border-slate-200 px-3 py-2 sm:px-4 flex flex-wrap justify-between items-center gap-2 shrink-0 z-20 shadow-sm">
      <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[12px] shrink-0">
        <span className="hidden xs:inline">Room:</span><span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">Room {room}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center justify-end flex-1 sm:flex-none">
        <select className="flex-1 sm:flex-none min-w-[140px] sm:min-w-0 border border-slate-300 rounded-lg px-2 py-1.5 text-[11px] bg-white shadow-sm focus:ring-2 focus:ring-blue-100 outline-none">
          <option>Previous Prescriptions</option>
        </select>
        <div className="flex border border-slate-300 rounded-lg overflow-hidden shadow-sm">
          <button className="bg-slate-600 hover:bg-slate-700 text-white px-2.5 sm:px-3 py-1.5 text-[10px] font-bold">Files</button>
          <button className="bg-green-700 hover:bg-green-800 text-white px-2.5 sm:px-3 py-1.5 text-[10px] font-bold border-l border-white/20">EHR</button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-2.5 sm:px-3 py-1.5 text-[10px] font-bold border-l border-white/20">Reset</button>
        </div>
        <button onClick={logout} className="flex items-center gap-1 text-red-500 font-black text-[11px] uppercase hover:bg-red-50 px-2 py-1 rounded-lg shrink-0">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
