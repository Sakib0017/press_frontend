import { useEffect, useState } from 'react';
import api from '../../utils/api';

const SECTIONS = ['complaints', 'history', 'comorbidity', 'allergy', 'findings', 'physical', 'diagnosis', 'investigations', 'procedure', 'rx', 'advices', 'followup', 'referred', 'bt_order', 'certificate', 'note', 'admission'];

export default function AdminComponents() {
  const [doctorId, setDoctorId] = useState('');
  const [comName, setComName] = useState('');
  const [q, setQ] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const p = {};
      if (doctorId) p.doctor_id = doctorId;
      if (comName) p.com_name = comName;
      if (q) p.q = q;
      const { data } = await api.get('/admin/components', { params: p });
      setList(data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDoctors(); load(); }, []);

  const onDelete = async (id) => {
    if (!window.confirm('Delete this component?')) return;
    try {
      await api.delete(`/admin/components/${id}`);
      setList((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-800 uppercase">Components — {list.length}</h1>
        <p className="text-[11px] text-slate-400 font-bold">GET /api/admin/components?doctor_id&com_name&q · DELETE /api/admin/components/:id · create/fetch stay in Prescription flow (POST /api/components/save + /fetch)</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 items-end">
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Doctor</span>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white min-w-[180px]">
            <option value="">All doctors</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </label>
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Section (com_name)</span>
          <select value={comName} onChange={(e) => setComName(e.target.value)} className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white">
            <option value="">All sections</option>
            {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Search sub_com_name</span><input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-52" placeholder="q" /></label>
        <button onClick={load} className="bg-[#337ab7] text-white text-xs font-bold px-4 py-2 rounded-lg">Search</button>
        <button onClick={() => { setDoctorId(''); setComName(''); setQ(''); setTimeout(load, 0); }} className="border border-orange-400 text-orange-500 text-xs font-bold px-4 py-2 rounded-lg">Reset</button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg px-3 py-2">{error}</div>}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-[#d9edf7] text-[#31708f] text-[11px]">
            <tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Doctor</th><th className="px-2 py-2">com_name</th><th className="px-2 py-2">sub_com_name</th><th className="px-2 py-2">name_en</th><th className="px-2 py-2">Actions</th></tr>
          </thead>
          <tbody className="divide-y text-xs">
            {loading ? <tr><td colSpan="6" className="text-center py-8 text-slate-400 font-bold">Loading…</td></tr>
              : list.length === 0 ? <tr><td colSpan="6" className="text-center py-8 text-slate-400 font-bold">No components.</td></tr>
              : list.map((c, i) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-2 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-2 py-2">{c.doctor_id?.name || c.doctor_id || '-'}</td>
                  <td className="px-2 py-2 font-bold">{c.com_name}</td>
                  <td className="px-2 py-2">{c.sub_com_name}</td>
                  <td className="px-2 py-2 text-slate-500">{c.name_en || '-'}</td>
                  <td className="px-2 py-2"><button onClick={() => onDelete(c._id)} className="px-2 py-1 rounded bg-red-600 text-white font-bold">Del</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
