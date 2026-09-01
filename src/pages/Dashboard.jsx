import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { doctor } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    let cancelled = false;
    api.get('/doctors').then(({ data }) => {
      if(cancelled) return;
      const list = data.data || [];
      setDoctors(list);
      const g = {};
      list.forEach(doc => {
        const spec = doc.usr_spec || doc.specialization || 'General';
        if (!g[spec]) g[spec] = [];
        g[spec].push(doc);
      });
      setGrouped(g);
    });
    return ()=>{ cancelled=true; };
  }, []);

  const sessionName = doctor?.name?.toLowerCase() || '';

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 text-slate-700 font-sans antialiased">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-[#f8fafc] space-y-8 sm:space-y-12 pb-20 md:pb-6">
          {Object.entries(grouped).map(([spec, rooms]) => {
            const myRooms = rooms.filter(r => r.name.toLowerCase() === sessionName);
            if (myRooms.length === 0) return null;
            return (
              <section key={spec}>
                <div className="inline-block border-b-4 border-cyan-500 mb-6">
                  <h2 className="text-base font-black text-slate-800 uppercase tracking-tighter pb-1">{spec}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {myRooms.map(row => (
                    <div key={row._id} className="bg-white rounded border border-blue-500 ring-4 ring-blue-50 shadow-md overflow-hidden flex flex-col transition-all duration-300">
                      <div className="flex divide-x divide-slate-100 border-b border-slate-100">
                        <div className="flex-1 p-3 text-center">
                          <div className="text-2xl font-black text-blue-600 leading-none">0</div>
                          <div className="text-[9px] uppercase font-bold text-slate-400 mt-2">Total Patient</div>
                        </div>
                        <div className="flex-1 p-3 text-center bg-slate-50/40">
                          <div className="text-2xl font-black text-slate-700 leading-none">{row.room}</div>
                          <div className="text-[9px] uppercase font-bold text-slate-400 mt-2">Room Number</div>
                        </div>
                      </div>
                      <div className="px-3 py-2.5 flex justify-between items-center bg-white">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date().toISOString().slice(0,10)}</span>
                        <span className="text-[10px] font-black text-blue-600 uppercase truncate max-w-[100px]">{row.bhaban}</span>
                      </div>
                      <Link to={`/prescription/${row._id}`} className="w-full bg-[#3078b4] hover:bg-[#256092] text-white text-center text-xs py-2.5 font-black uppercase tracking-widest transition-colors shadow-inner">Room In</Link>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
