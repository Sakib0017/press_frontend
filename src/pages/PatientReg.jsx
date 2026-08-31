import { useEffect, useState } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function PatientReg() {
  const { doctor } = useAuth();
  const [doctorsList, setDoctorsList] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ patient_name: '', patient_contact: '', patient_age: '', patient_gender: '', doctor_name: doctor?.name || '', appointment_date: new Date().toISOString().slice(0,16) });

  useEffect(() => {
    api.get('/doctors').then(({ data }) => setDoctorsList(data.data || []));
  }, []);
  useEffect(()=>{ if(doctor?.name) setForm(f=>({...f, doctor_name: f.doctor_name || doctor.name})); }, [doctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError('');
    try {
      const payload = { ...form, appointment_date: new Date(form.appointment_date).toISOString(), doctor_id: doctorsList.find(d=>d.name===form.doctor_name)?._id };
      const { data } = await api.post('/appointments', payload);
      if (data.status === 'success') setSuccess('Patient registered successfully!');
      else setError(data.message);
    } catch (err) { setError(err.response?.data?.message || err.message); }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 text-slate-700 text-[13px] antialiased font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        <section className="bg-white border-b border-slate-100 px-5 py-5 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Patient Registration</h1>
            <p className="text-xs text-slate-400 mt-1">Register a new patient for <span className="font-bold text-slate-600">{doctor?.name}</span></p>
          </div>
        </section>
        <main className="flex-1 p-5 lg:p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
              {success && <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">{success}</div>}
              {error && <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Patient Name</label>
                  <input type="text" required value={form.patient_name} onChange={e=>setForm({...form, patient_name:e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all outline-none" placeholder="Full name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Mobile / Contact</label>
                    <input type="text" required value={form.patient_contact} onChange={e=>setForm({...form, patient_contact:e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:bg-white focus:border-blue-300 outline-none" placeholder="01XXXXXXXXX" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Age</label>
                    <input type="text" required value={form.patient_age} onChange={e=>setForm({...form, patient_age:e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none" placeholder="e.g. 25" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Gender</label>
                    <select required value={form.patient_gender} onChange={e=>setForm({...form, patient_gender:e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none text-slate-500">
                      <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Doctor</label>
                    <select required value={form.doctor_name} onChange={e=>setForm({...form, doctor_name:e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none text-slate-500">
                      <option value="">Select Doctor</option>
                      {doctorsList.map(doc=> <option key={doc._id} value={doc.name}>{doc.name} {doc.usr_spec ? `(${doc.usr_spec})`:''}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Appointment Date</label>
                  <input type="datetime-local" required value={form.appointment_date} onChange={e=>setForm({...form, appointment_date:e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none" />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lg">Register Patient</button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
