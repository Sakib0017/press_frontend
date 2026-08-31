import { useEffect, useState } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function PatientList() {
  const { doctor } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0,10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0,10));

  const fetchData = async () => {
    const { data } = await api.get('/appointments', { params: { doctor_name: doctor?.name, from_date: fromDate, to_date: toDate } });
    setAppointments(data.data || []);
  };

  useEffect(()=>{ if(doctor?.name) fetchData(); }, [doctor]);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 text-slate-700 text-[13px] antialiased font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        <section className="bg-white border-b border-slate-100 px-5 py-5 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Patient List</h1>
            <p className="text-xs text-slate-400 mt-1">View appointments day by day — <span className="font-bold text-slate-600">{doctor?.name}</span></p>
          </div>
        </section>
        <div className="bg-white border-b border-slate-100 px-5 py-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">From</label>
              <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-200 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">To</label>
              <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-200 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Doctor</label>
              <div className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 inline-flex items-center text-slate-700">{doctor?.name}</div>
            </div>
            <button onClick={fetchData} className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all">Search</button>
            <a href="#" onClick={e=>{e.preventDefault(); const d=new Date().toISOString().slice(0,10); setFromDate(d); setToDate(d);}} className="h-9 px-4 border border-orange-400 text-orange-500 hover:bg-orange-50 rounded-lg text-xs font-black uppercase inline-flex items-center transition-all">Reset</a>
            <span className="text-[10px] font-bold text-slate-400 ml-auto">{appointments.length} result(s)</span>
          </div>
        </div>
        <main className="flex-1 p-5 lg:p-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">#</th><th className="px-4 py-3">Patient Name</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Age</th><th className="px-4 py-3">Gender</th><th className="px-4 py-3">Doctor</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {appointments.length===0 ? <tr><td colSpan="8" className="px-4 py-16 text-center text-slate-300 font-bold">No appointments found for the selected criteria.</td></tr> :
                    appointments.map((a,i)=> (
                      <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-bold">{i+1}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{a.patient_name}</td>
                        <td className="px-4 py-3 text-slate-500">{a.patient_contact}</td>
                        <td className="px-4 py-3 text-slate-600">{a.patient_age}</td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${a.patient_gender==='Male'?'bg-blue-50 text-blue-600':'bg-pink-50 text-pink-600'}`}>{a.patient_gender}</span></td>
                        <td className="px-4 py-3 text-slate-600">{a.doctor_name}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(a.appointment_date).toLocaleString()}</td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${a.status==='completed'?'bg-emerald-50 text-emerald-600': a.status==='cancelled'?'bg-red-50 text-red-500':'bg-amber-50 text-amber-600'}`}>{a.status||'waiting'}</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
