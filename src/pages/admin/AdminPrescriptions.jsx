import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminPrescriptions() {
  const [q, setQ] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const p = {};
      if (q) p.q = q;
      if (doctorId) p.doctor_id = doctorId;
      const { data } = await api.get('/admin/prescriptions', { params: p });
      setList(data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/admin/doctors').then(({ data }) => setDoctors(data.data || [])).catch(() => {
      api.get('/doctors').then(({ data }) => setDoctors(data.data || [])).catch(() => {});
    });
    load();
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm('Delete prescription #' + id.slice(-6) + '?')) return;
    try {
      await api.delete(`/admin/prescriptions/${id}`);
      setList((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-800 uppercase">Prescriptions — {list.length}</h1>
        <p className="text-[11px] text-slate-400 font-bold">GET /api/admin/prescriptions?q&doctor_id · DELETE /api/admin/prescriptions/:id · view/edit/print reuse doctor-panel pages (nothing removed)</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 items-end">
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Search patient / mobile</span><input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-52" placeholder="q" /></label>
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Doctor</span>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white min-w-[180px]">
            <option value="">All doctors</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>{d.name} — {d.usr_spec || d.specialization}</option>)}
          </select>
        </label>
        <button onClick={load} className="bg-[#337ab7] text-white text-xs font-bold px-4 py-2 rounded-lg">Search</button>
        <button onClick={() => { setQ(''); setDoctorId(''); setTimeout(load, 0); }} className="border border-orange-400 text-orange-500 text-xs font-bold px-4 py-2 rounded-lg">Reset</button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg px-3 py-2">{error}</div>}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-[#d9edf7] text-[#31708f] text-[11px]">
            <tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Patient</th><th className="px-2 py-2">Mobile</th><th className="px-2 py-2">Age/Gender</th><th className="px-2 py-2">Doctor</th><th className="px-2 py-2">Meds</th><th className="px-2 py-2">Date</th><th className="px-2 py-2">Actions</th></tr>
          </thead>
          <tbody className="divide-y text-xs">
            {loading ? <tr><td colSpan="8" className="text-center py-8 text-slate-400 font-bold">Loading…</td></tr>
              : list.length === 0 ? <tr><td colSpan="8" className="text-center py-8 text-slate-400 font-bold">No prescriptions.</td></tr>
              : list.map((p, i) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-2 py-2 text-slate-400">{i + 1}<div className="text-blue-600 font-bold">#{p._id.slice(-6)}</div></td>
                  <td className="px-2 py-2 font-bold">{p.patient_name}</td>
                  <td className="px-2 py-2">{p.patient_mobile}</td>
                  <td className="px-2 py-2">{p.patient_age} / {p.patient_gender}</td>
                  <td className="px-2 py-2">{p.doctor_id?.name || p.doctor_name || '-'}</td>
                  <td className="px-2 py-2">{Array.isArray(p.medications) ? p.medications.length : 0}</td>
                  <td className="px-2 py-2">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1.5">
                      <Link to={`/print/${p._id}`} target="_blank" className="px-2 py-1 rounded border border-blue-600 text-blue-600 font-bold" title="View / Print">👁</Link>
                      <Link to={`/edit-prescription/${p._id}`} className="px-2 py-1 rounded bg-[#337ab7] text-white font-bold" title="Edit (doctor flow)">✎</Link>
                      <button onClick={() => onDelete(p._id)} className="px-2 py-1 rounded bg-red-600 text-white font-bold">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
