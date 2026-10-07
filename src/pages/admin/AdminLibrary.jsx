import { useEffect, useState } from 'react';
import api from '../../utils/api';

const TABS = [
  { key: 'medicines', path: 'medicines', field: 'medicine', label: 'Medicines' },
  { key: 'medadvice', path: 'medadvice', field: 'medadvice', label: 'Med Advice' },
  { key: 'doses', path: 'doses', field: 'dose', label: 'Doses' },
];

function LibraryTab({ path, field, label }) {
  const [q, setQ] = useState('');
  const [usrSpec, setUsrSpec] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [spec, setSpec] = useState('');
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const p = {};
      if (q) p.q = q;
      if (usrSpec) p.usr_spec = usrSpec;
      const { data } = await api.get(`/admin/${path}`, { params: p });
      setList(data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await api.post(`/admin/${path}`, { [field]: text.trim(), usr_spec: spec.trim() });
      setList((prev) => [data.data, ...prev]);
      setText('');
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const onUpdate = async () => {
    if (!editing) return;
    try {
      const { data } = await api.put(`/admin/${path}/${editing._id}`, { [field]: editing[field], usr_spec: editing.usr_spec || '' });
      setList((prev) => prev.map((x) => (x._id === editing._id ? data.data : x)));
      setEditing(null);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm(`Delete this ${field}?`)) return;
    try {
      await api.delete(`/admin/${path}/${id}`);
      setList((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400 font-bold">GET /api/admin/{path}?q&usr_spec · POST /api/admin/{path} · PUT/DELETE /api/admin/{path}/:id — also used live by /api/search/{field === 'medicine' ? 'medicine' : field === 'medadvice' ? 'medadvice' : 'dose'}?q&usr_spec in Prescription Rx modal</p>
      <form onSubmit={onCreate} className="flex flex-wrap gap-2 items-end bg-slate-50 border border-slate-200 rounded-xl p-3">
        <label className="block flex-1 min-w-[200px]"><span className="text-[10px] font-bold uppercase text-slate-500">New {field}</span>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`e.g. Napa 500mg`} className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs" />
        </label>
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">usr_spec (blank=general)</span>
          <input value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="Medicine / Cardiology…" className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-44" />
        </label>
        <button className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Add</button>
      </form>
      <div className="flex flex-wrap gap-2 items-end">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder={`Search ${field}`} className="border border-slate-300 rounded-lg px-3 py-2 text-xs w-52" />
        <input value={usrSpec} onChange={(e) => setUsrSpec(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Filter usr_spec" className="border border-slate-300 rounded-lg px-3 py-2 text-xs w-44" />
        <button onClick={load} className="bg-[#337ab7] text-white text-xs font-bold px-4 py-2 rounded-lg">Search</button>
        <button onClick={() => { setQ(''); setUsrSpec(''); setTimeout(load, 0); }} className="border border-orange-400 text-orange-500 text-xs font-bold px-4 py-2 rounded-lg">Reset</button>
        <span className="ml-auto text-[11px] font-bold text-slate-400">{list.length} item(s)</span>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg px-3 py-2">{error}</div>}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-[#d9edf7] text-[#31708f] text-[11px]"><tr><th className="px-2 py-2">#</th><th className="px-2 py-2">{field}</th><th className="px-2 py-2">usr_spec</th><th className="px-2 py-2">Actions</th></tr></thead>
          <tbody className="divide-y text-xs">
            {loading ? <tr><td colSpan="4" className="text-center py-6 text-slate-400 font-bold">Loading…</td></tr>
              : list.length === 0 ? <tr><td colSpan="4" className="text-center py-6 text-slate-400 font-bold">No items.</td></tr>
              : list.map((x, i) => (
                <tr key={x._id} className="hover:bg-slate-50">
                  <td className="px-2 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-2 py-2 font-bold">{x[field]}</td>
                  <td className="px-2 py-2">{x.usr_spec || <span className="text-slate-400 italic">general</span>}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditing({ ...x })} className="px-2 py-1 rounded bg-[#337ab7] text-white font-bold">Edit</button>
                      <button onClick={() => onDelete(x._id)} className="px-2 py-1 rounded bg-red-600 text-white font-bold">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-md space-y-2">
            <div className="font-black uppercase text-sm">Edit {label}</div>
            <label className="block text-xs"><span className="font-bold text-slate-500 uppercase text-[10px]">{field}</span>
              <input value={editing[field] || ''} onChange={(e) => setEditing({ ...editing, [field]: e.target.value })} className="mt-1 w-full border rounded-lg px-2 py-1.5" />
            </label>
            <label className="block text-xs"><span className="font-bold text-slate-500 uppercase text-[10px]">usr_spec</span>
              <input value={editing.usr_spec || ''} onChange={(e) => setEditing({ ...editing, usr_spec: e.target.value })} className="mt-1 w-full border rounded-lg px-2 py-1.5" />
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={onUpdate} className="bg-emerald-600 text-white text-xs font-bold px-5 py-2 rounded-lg">Save</button>
              <button onClick={() => setEditing(null)} className="border text-xs font-bold px-5 py-2 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLibrary() {
  const [tab, setTab] = useState('medicines');
  const active = TABS.find((t) => t.key === tab);
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-black text-slate-800 uppercase">Library — Medicine / Advice / Dose</h1>
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`text-xs font-bold px-4 py-2 rounded-lg ${tab === t.key ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300'}`}>{t.label}</button>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <LibraryTab key={active.key} path={active.path} field={active.field} label={active.label} />
      </div>
    </div>
  );
}
