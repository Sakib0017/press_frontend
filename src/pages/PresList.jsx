import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function PresList() {
  const { doctor } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filters, setFilters] = useState({
    from_date: new Date().toISOString().slice(0,10),
    to_date: new Date().toISOString().slice(0,10),
    patient_name: '',
    prescription_id: '',
  });

  const fetchData = async () => {
    const params = { doctor_id: doctor?._id, ...filters };
    // Remove empty strings for cleaner query
    Object.keys(params).forEach(k=>{ if(!params[k]) delete params[k]; });
    const { data } = await api.get('/prescriptions', { params });
    setPrescriptions(data.data || []);
  };

  useEffect(()=>{ if(doctor?._id) fetchData(); }, [doctor]);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 text-slate-700 font-sans antialiased">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <Header />
        <div className="bg-white border-b border-slate-200 p-3 sm:p-4 shadow-sm shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 items-end">
            <div><label className="block text-[9px] sm:text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wide">From Date</label><input type="date" value={filters.from_date} onChange={e=>setFilters({...filters, from_date:e.target.value})} className="w-full border border-slate-300 rounded-lg px-2 py-2 sm:py-1.5 text-xs focus:ring-2 focus:ring-blue-100 outline-none" /></div>
            <div><label className="block text-[9px] sm:text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wide">To Date</label><input type="date" value={filters.to_date} onChange={e=>setFilters({...filters, to_date:e.target.value})} className="w-full border border-slate-300 rounded-lg px-2 py-2 sm:py-1.5 text-xs focus:ring-2 focus:ring-blue-100 outline-none" /></div>
            <div className="col-span-2 sm:col-span-1"><label className="block text-[9px] sm:text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wide">Doctor</label><div className="w-full border border-slate-300 rounded-lg px-2 py-2 sm:py-1.5 text-xs bg-slate-50 text-slate-700 font-medium truncate">{doctor?.name}<input type="hidden" value={doctor?.name} /></div></div>
            <div><label className="block text-[9px] sm:text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wide">Prescription ID</label><input type="text" value={filters.prescription_id} onChange={e=>setFilters({...filters, prescription_id:e.target.value})} placeholder="#ID" className="w-full border border-slate-300 rounded-lg px-2 py-2 sm:py-1.5 text-xs" /></div>
            <div><label className="block text-[9px] sm:text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wide">Patient Name</label><input type="text" value={filters.patient_name} onChange={e=>setFilters({...filters, patient_name:e.target.value})} placeholder="Patient Name" className="w-full border border-slate-300 rounded-lg px-2 py-2 sm:py-1.5 text-xs" /></div>
            <div className="col-span-2 sm:col-span-2 lg:col-span-1 xl:col-span-3 flex flex-wrap gap-2 items-end">
              <button onClick={fetchData} className="flex-1 sm:flex-none bg-[#337ab7] hover:bg-blue-700 text-white px-4 py-2 sm:py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shrink-0">Search</button>
              <button onClick={()=>{ setFilters({ from_date: new Date().toISOString().slice(0,10), to_date: new Date().toISOString().slice(0,10), patient_name:'', prescription_id:''}); }} className="flex-1 sm:flex-none border border-orange-400 text-orange-500 hover:bg-orange-50 px-4 py-2 sm:py-1.5 rounded-lg text-xs font-bold text-center">Reset</button>
              <span className="w-full sm:w-auto text-[10px] font-bold text-slate-400 sm:ml-auto text-center sm:text-left">{prescriptions.length} result(s) • scroll →</span>
            </div>
          </div>
        </div>
        <main className="flex-1 overflow-auto p-3 sm:p-4 bg-white pb-20 md:pb-4">
          <div className="border border-slate-200 rounded-xl sm:rounded overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full text-left border-collapse min-w-[700px] sm:min-w-[900px]">
              <thead className="bg-[#d9edf7] text-[#31708f] border-b border-slate-200 text-[11px]">
                <tr><th className="border-r border-slate-200 px-2 py-2 font-bold">#</th><th className="border-r border-slate-200 px-2 py-2 font-bold">Patient Name</th><th className="border-r border-slate-200 px-2 py-2 font-bold">Contact</th><th className="border-r border-slate-200 px-2 py-2 font-bold">Age/Gender</th><th className="border-r border-slate-200 px-2 py-2 font-bold">Prescription ID</th><th className="border-r border-slate-200 px-2 py-2 font-bold">Date</th><th className="border-r border-slate-200 px-2 py-2 font-bold">Doctor</th><th className="px-2 py-2 font-bold">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {prescriptions.length===0 ? <tr><td colSpan="8" className="text-center py-12 text-slate-400 font-bold">No prescriptions found.</td></tr> :
                  prescriptions.map((p, i)=> (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="border-r border-slate-200 px-2 py-2.5 text-slate-500">{i+1}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 font-medium text-slate-800">{p.patient_name}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-slate-500">{p.patient_mobile}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-slate-500">{p.patient_age} / {p.patient_gender}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-blue-600 font-bold">#{p._id.slice(-6)}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-slate-600">{p.appointment_date ? new Date(p.appointment_date).toLocaleDateString() : '-'}</td>
                      <td className="border-r border-slate-200 px-2 py-2.5 text-slate-600">{p.doctor_name || doctor?.name}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex gap-1.5">
                          <Link to={`/print/${p._id}`} target="_blank" className="p-1.5 bg-white border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white" title="View / Print">👁</Link>
                          <Link to={`/edit-prescription/${p._id}`} className="p-1.5 bg-[#337ab7] text-white rounded hover:bg-blue-700" title="Edit">✎</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 text-[11px] text-slate-500"><div>Showing <b>{prescriptions.length}</b> entries</div></div>
        </main>
      </div>
    </div>
  );
}
