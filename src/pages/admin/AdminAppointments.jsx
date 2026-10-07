import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const emptyCreate = {
  patient_name: '',
  patient_contact: '',
  patient_age: '',
  patient_gender: '',
  doctor_id: '',
  doctor_name: '',
  appointment_date: new Date().toISOString().slice(0, 16),
  status: 'waiting',
};

export default function AdminAppointments() {
  const [params] = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(params.get('status') || '');
  const [doctorName, setDoctorName] = useState('');
  const [list, setList] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const p = {};
      if (q) p.q = q;
      if (status) p.status = status;
      if (doctorName) p.doctor_name = doctorName;
      const { data } = await api.get('/admin/appointments', { params: p });
      setList(data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setStatus(params.get('status') || ''); }, [params]);
  useEffect(() => { load(); loadDoctors(); }, []);

  const loadDoctors = async () => {
    try {
      const { data } = await api.get('/admin/doctors');
      setDoctors(data.data || []);
    } catch {
      try {
        const { data } = await api.get('/doctors');
        setDoctors(data.data || []);
      } catch {}
    }
  };

  const onDoctorSelect = (id) => {
    const d = doctors.find((x) => x._id === id);
    setCreateForm((f) => ({ ...f, doctor_id: id, doctor_name: d ? d.name : f.doctor_name }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    const { patient_name, patient_contact, patient_age, patient_gender, doctor_name, appointment_date } = createForm;
    if (!patient_name.trim() || !patient_contact.trim() || !patient_age.trim() || !patient_gender || !doctor_name.trim() || !appointment_date) {
      setCreateError('Patient name, contact, age, gender, doctor and date are required.');
      return;
    }
    setCreating(true);
    try {
      const payload = {
        ...createForm,
        patient_name: createForm.patient_name.trim(),
        patient_contact: createForm.patient_contact.trim(),
        appointment_date: new Date(createForm.appointment_date).toISOString(),
      };
      let saved;
      try {
        const { data } = await api.post('/admin/appointments', payload);
        saved = data.data;
      } catch (err) {
        // Fallback for old backend without POST /api/admin/appointments
        if (err.response?.status === 404) {
          const { data } = await api.post('/appointments', payload);
          saved = data.data || data.appointment;
        } else throw err;
      }
      setList((prev) => [saved, ...prev]);
      setCreateForm(emptyCreate);
      setShowCreate(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message);
    } finally {
      setCreating(false);
    }
  };

  const setStatusQuick = async (id, s) => {
    try {
      // Uses same semantics as doctor flow: PUT /appointments/:id/status + POST /:id/complete also exist
      await api.put(`/appointments/${id}/status`, { status: s });
      setList((prev) => prev.map((a) => (a._id === id ? { ...a, status: s } : a)));
    } catch (e) {
      // fallback to admin generic update
      try {
        const { data } = await api.put(`/admin/appointments/${id}`, { status: s });
        setList((prev) => prev.map((a) => (a._id === id ? data.data : a)));
      } catch (e2) {
        alert(e2.response?.data?.message || e2.message);
      }
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const { data } = await api.put(`/admin/appointments/${editing._id}`, {
        patient_name: editing.patient_name,
        patient_contact: editing.patient_contact,
        patient_age: editing.patient_age,
        patient_gender: editing.patient_gender,
        doctor_name: editing.doctor_name,
        appointment_date: editing.appointment_date,
        status: editing.status,
      });
      setList((prev) => prev.map((a) => (a._id === editing._id ? data.data : a)));
      setEditing(null);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      setList((prev) => prev.filter((a) => a._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-800 uppercase">Appointments — {list.length}</h1>
        <p className="text-[11px] text-slate-400 font-bold">GET /api/admin/appointments?q&status&doctor_name · POST /api/admin/appointments · PUT/DELETE /api/admin/appointments/:id · quick status uses PUT /api/appointments/:id/status</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 items-end">
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Search (patient/contact/doctor)</span><input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-52" placeholder="q" /></label>
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white">
            <option value="">All</option><option value="waiting">waiting</option><option value="completed">completed</option><option value="cancelled">cancelled</option>
          </select>
        </label>
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Doctor name</span><input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-44" placeholder="doctor_name" /></label>
        <button onClick={load} className="bg-[#337ab7] text-white text-xs font-bold px-4 py-2 rounded-lg">Search</button>
        <button onClick={() => { setQ(''); setStatus(''); setDoctorName(''); setTimeout(load, 0); }} className="border border-orange-400 text-orange-500 text-xs font-bold px-4 py-2 rounded-lg">Reset</button>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setCreateError(''); setShowCreate(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg">+ New Appointment</button>
          <Link to="/patient-reg" className="border border-slate-300 text-xs font-bold px-4 py-2 rounded-lg hover:bg-white" title="Old doctor-panel form (kept)">Patient Reg ↗</Link>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg px-3 py-2">{error}</div>}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-[#d9edf7] text-[#31708f] text-[11px]">
            <tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Patient</th><th className="px-2 py-2">Contact</th><th className="px-2 py-2">Age/Gender</th><th className="px-2 py-2">Doctor</th><th className="px-2 py-2">Date</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Actions</th></tr>
          </thead>
          <tbody className="divide-y text-xs">
            {loading ? <tr><td colSpan="8" className="text-center py-8 text-slate-400 font-bold">Loading…</td></tr>
              : list.length === 0 ? <tr><td colSpan="8" className="text-center py-8 text-slate-400 font-bold">No appointments.</td></tr>
              : list.map((a, i) => (
                <tr key={a._id} className="hover:bg-slate-50">
                  <td className="px-2 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-2 py-2 font-bold">{a.patient_name}</td>
                  <td className="px-2 py-2">{a.patient_contact}</td>
                  <td className="px-2 py-2">{a.patient_age} / {a.patient_gender}</td>
                  <td className="px-2 py-2">{a.doctor_name}</td>
                  <td className="px-2 py-2">{a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-2"><span className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${a.status === 'waiting' ? 'bg-amber-100 text-amber-700' : a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{a.status}</span></td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => setStatusQuick(a._id, 'waiting')} className="px-2 py-1 rounded border font-bold">Wait</button>
                      <button onClick={() => setStatusQuick(a._id, 'completed')} className="px-2 py-1 rounded bg-green-700 text-white font-bold">Done</button>
                      <button onClick={() => setStatusQuick(a._id, 'cancelled')} className="px-2 py-1 rounded bg-slate-600 text-white font-bold">Cancel</button>
                      <button onClick={() => setEditing({ ...a, appointment_date: a.appointment_date ? new Date(a.appointment_date).toISOString().slice(0, 10) : '' })} className="px-2 py-1 rounded bg-[#337ab7] text-white font-bold">Edit</button>
                      <button onClick={() => onDelete(a._id)} className="px-2 py-1 rounded bg-red-600 text-white font-bold">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {showCreate && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={onCreate} className="bg-white rounded-xl p-4 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <div className="font-black uppercase text-sm">New appointment</div>
              <span className="text-[10px] font-bold text-slate-400">POST /api/admin/appointments → saved to appointments table</span>
            </div>
            {createError && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg px-3 py-2">{createError}</div>}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Patient Name *</label>
              <input value={createForm.patient_name} onChange={(e) => setCreateForm({ ...createForm, patient_name: e.target.value })} required placeholder="Full name" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="block"><span className="text-[10px] font-black text-slate-500 uppercase">Mobile / Contact *</span>
                <input value={createForm.patient_contact} onChange={(e) => setCreateForm({ ...createForm, patient_contact: e.target.value })} required placeholder="01XXXXXXXXX" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none" />
              </label>
              <label className="block"><span className="text-[10px] font-black text-slate-500 uppercase">Age *</span>
                <input value={createForm.patient_age} onChange={(e) => setCreateForm({ ...createForm, patient_age: e.target.value })} required placeholder="e.g. 25" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="block"><span className="text-[10px] font-black text-slate-500 uppercase">Gender *</span>
                <select value={createForm.patient_gender} onChange={(e) => setCreateForm({ ...createForm, patient_gender: e.target.value })} required className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white outline-none">
                  <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </label>
              <label className="block"><span className="text-[10px] font-black text-slate-500 uppercase">Status</span>
                <select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white outline-none">
                  <option value="waiting">waiting</option><option value="completed">completed</option><option value="cancelled">cancelled</option>
                </select>
              </label>
            </div>
            <label className="block"><span className="text-[10px] font-black text-slate-500 uppercase">Doctor * (from doctors table)</span>
              <select value={createForm.doctor_id} onChange={(e) => onDoctorSelect(e.target.value)} required className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white outline-none">
                <option value="">Select Doctor</option>
                {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}{d.usr_spec || d.specialization ? ` (${d.usr_spec || d.specialization})` : ''}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-[10px] font-black text-slate-500 uppercase">Appointment Date *</span>
              <input type="datetime-local" value={createForm.appointment_date} onChange={(e) => setCreateForm({ ...createForm, appointment_date: e.target.value })} required className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none" />
            </label>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2 rounded-lg">{creating ? 'Saving…' : 'Save Appointment'}</button>
              <button type="button" onClick={() => setShowCreate(false)} className="border text-xs font-bold px-5 py-2 rounded-lg">Close</button>
            </div>
          </form>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-lg space-y-2">
            <div className="font-black uppercase text-sm">Edit appointment #{editing._id.slice(-6)}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[['patient_name', 'Patient name'], ['patient_contact', 'Contact'], ['patient_age', 'Age'], ['doctor_name', 'Doctor name'], ['appointment_date', 'Date']].map(([k, l]) => (
                <label key={k} className="block"><span className="font-bold text-slate-500 uppercase text-[10px]">{l}</span>
                  <input type={k === 'appointment_date' ? 'date' : 'text'} value={editing[k] || ''} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} className="mt-1 w-full border rounded-lg px-2 py-1.5" />
                </label>
              ))}
              <label className="block"><span className="font-bold text-slate-500 uppercase text-[10px]">Gender</span>
                <select value={editing.patient_gender || ''} onChange={(e) => setEditing({ ...editing, patient_gender: e.target.value })} className="mt-1 w-full border rounded-lg px-2 py-1.5 bg-white"><option value="">-</option><option>Male</option><option>Female</option><option>Other</option></select>
              </label>
              <label className="block"><span className="font-bold text-slate-500 uppercase text-[10px]">Status</span>
                <select value={editing.status || ''} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="mt-1 w-full border rounded-lg px-2 py-1.5 bg-white"><option value="waiting">waiting</option><option value="completed">completed</option><option value="cancelled">cancelled</option></select>
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveEdit} className="bg-emerald-600 text-white text-xs font-bold px-5 py-2 rounded-lg">Save</button>
              <button onClick={() => setEditing(null)} className="border text-xs font-bold px-5 py-2 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
