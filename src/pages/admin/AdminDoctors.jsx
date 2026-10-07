import { useEffect, useState } from 'react';
import api from '../../utils/api';

const emptyForm = {
  name: '', email: '', password: '', usr_spec: '', specialization: '', degree: '',
  experiance: '', experience: '', phone: '', license_number: '', branch: '',
  bhaban: '', room: '', name_ban: '', usr_spec_ban: '', degree_ban: '', experiance_ban: '',
};

export default function AdminDoctors() {
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async (query = q) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/doctors', { params: query ? { q: query } : {} });
      setList(data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(''); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Keep backend compat: usr_spec <-> specialization, experiance <-> experience
      const payload = { ...form };
      if (payload.specialization && !payload.usr_spec) payload.usr_spec = payload.specialization;
      if (payload.usr_spec && !payload.specialization) payload.specialization = payload.usr_spec;
      if (payload.experiance && !payload.experience) payload.experience = payload.experiance;
      if (payload.experiance && !payload.experiance) payload.experiance = payload.experience;
      if (editingId) {
        const body = { ...payload };
        if (!body.password) delete body.password; // keep old password when blank
        const { data } = await api.put(`/admin/doctors/${editingId}`, body);
        setList((prev) => prev.map((d) => (d._id === editingId ? data.data : d)));
      } else {
        const { data } = await api.post('/admin/doctors', payload);
        setList((prev) => [data.data, ...prev]);
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (d) => {
    setEditingId(d._id);
    setForm({ ...emptyForm, ...Object.fromEntries(Object.keys(emptyForm).map((k) => [k, d[k] || ''])) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this doctor? Appointments/prescriptions stay but lose the link.')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      setList((prev) => prev.filter((d) => d._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <h1 className="text-lg font-black text-slate-800 uppercase">Doctors — {list.length}</h1>
          <p className="text-[11px] text-slate-400 font-bold">GET/POST /api/admin/doctors · PUT/DELETE /api/admin/doctors/:id · search q=name/email/usr_spec</p>
        </div>
        <div className="ml-auto flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Search name / email / spec" className="border border-slate-300 rounded-lg px-3 py-2 text-xs w-56" />
          <button onClick={() => load()} className="bg-[#337ab7] text-white text-xs font-bold px-4 py-2 rounded-lg">Search</button>
          <button onClick={() => { setQ(''); load(''); }} className="border border-orange-400 text-orange-500 text-xs font-bold px-4 py-2 rounded-lg">Reset</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg px-3 py-2">{error}</div>}

      <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">{editingId ? `Edit doctor (${editingId.slice(-6)}) — leave password blank to keep` : 'Add new doctor (name, email, password required)'}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            ['name', 'Name *'], ['email', 'Email *'], ['password', editingId ? 'Password (blank=keep)' : 'Password *'],
            ['phone', 'Phone'], ['usr_spec', 'usr_spec'], ['specialization', 'Specialization'],
            ['degree', 'Degree'], ['experiance', 'Experiance (typo kept)'], ['experience', 'Experience'],
            ['license_number', 'License'], ['branch', 'Branch'], ['bhaban', 'Bhaban'], ['room', 'Room'],
            ['name_ban', 'Name (BN)'], ['usr_spec_ban', 'Spec (BN)'], ['degree_ban', 'Degree (BN)'], ['experiance_ban', 'Experiance (BN)'],
          ].map(([k, label]) => (
            <label key={k} className="block">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
              <input type={k === 'password' ? 'password' : 'text'} value={form[k]} onChange={set(k)} required={k === 'name' || k === 'email' || (k === 'password' && !editingId)} className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs" />
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2 rounded-lg">{saving ? 'Saving…' : editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="border border-slate-300 text-xs font-bold px-5 py-2 rounded-lg">Cancel</button>}
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-[#d9edf7] text-[#31708f] text-[11px]">
            <tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Name</th><th className="px-2 py-2">Email</th><th className="px-2 py-2">Spec</th><th className="px-2 py-2">Room/Bhaban</th><th className="px-2 py-2">Phone</th><th className="px-2 py-2">Actions</th></tr>
          </thead>
          <tbody className="divide-y text-xs">
            {loading ? <tr><td colSpan="7" className="text-center py-8 text-slate-400 font-bold">Loading…</td></tr>
              : list.length === 0 ? <tr><td colSpan="7" className="text-center py-8 text-slate-400 font-bold">No doctors.</td></tr>
              : list.map((d, i) => (
                <tr key={d._id} className="hover:bg-slate-50">
                  <td className="px-2 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-2 py-2 font-bold">{d.name}<div className="text-[10px] text-slate-400 font-normal">{d._id.slice(-6)}</div></td>
                  <td className="px-2 py-2">{d.email}</td>
                  <td className="px-2 py-2">{d.usr_spec || d.specialization || '-'}</td>
                  <td className="px-2 py-2">{d.room || '-'} / {d.bhaban || '-'}</td>
                  <td className="px-2 py-2">{d.phone || '-'}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1.5">
                      <a href={`/prescription/${d._id}`} className="px-2 py-1 rounded bg-blue-600 text-white font-bold" title="Open Room In (doctor panel)">Room In</a>
                      <button onClick={() => onEdit(d)} className="px-2 py-1 rounded bg-[#337ab7] text-white font-bold">Edit</button>
                      <button onClick={() => onDelete(d._id)} className="px-2 py-1 rounded bg-red-600 text-white font-bold">Del</button>
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
