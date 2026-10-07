import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AdminAdmins() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/admins');
      setList(data.data || []);
    } catch (e) {
      if (e.response?.status === 404) {
        setError('Route not found: /api/admin/admins. Backend not redeployed yet — push press_backend to Vercel and redeploy.');
      } else {
        setError(e.response?.data?.message || e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/admin/admins', { name, email, password });
      setList((prev) => [data.data, ...prev]);
      setName(''); setEmail(''); setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const onUpdate = async () => {
    if (!editing) return;
    try {
      const body = { name: editing.name, email: editing.email };
      if (editing.password) body.password = editing.password;
      const { data } = await api.put(`/admin/admins/${editing._id}`, body);
      setList((prev) => prev.map((a) => (a._id === editing._id ? data.data : a)));
      setEditing(null);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this admin?')) return;
    try {
      await api.delete(`/admin/admins/${id}`);
      setList((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-800 uppercase">Main Admins — {list.length} (not doctors)</h1>
        <p className="text-[11px] text-slate-400 font-bold">GET/POST /api/admin/admins · PUT/DELETE /api/admin/admins/:id · admin-only. Change default admin@press.com password here.</p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg px-3 py-2">{error}</div>}
      <form onSubmit={onCreate} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-2 items-end">
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-44" placeholder="Main Admin" />
        </label>
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Email *</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-52" placeholder="admin2@press.com" />
        </label>
        <label className="block"><span className="text-[10px] font-bold uppercase text-slate-500">Password *</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-44" placeholder="••••••" />
        </label>
        <button className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Add admin</button>
        <button type="button" onClick={load} className="border text-xs font-bold px-4 py-2 rounded-lg">Refresh</button>
      </form>
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-[#d9edf7] text-[#31708f] text-[11px]"><tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Name</th><th className="px-2 py-2">Email</th><th className="px-2 py-2">Created</th><th className="px-2 py-2">Actions</th></tr></thead>
          <tbody className="divide-y text-xs">
            {loading ? <tr><td colSpan="5" className="text-center py-6 text-slate-400 font-bold">Loading…</td></tr>
              : list.map((a, i) => (
                <tr key={a._id} className="hover:bg-slate-50">
                  <td className="px-2 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-2 py-2 font-bold">{a.name}</td>
                  <td className="px-2 py-2">{a.email}</td>
                  <td className="px-2 py-2">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditing({ ...a, password: '' })} className="px-2 py-1 rounded bg-[#337ab7] text-white font-bold">Edit</button>
                      <button onClick={() => onDelete(a._id)} className="px-2 py-1 rounded bg-red-600 text-white font-bold">Del</button>
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
            <div className="font-black uppercase text-sm">Edit admin</div>
            <label className="block text-xs"><span className="font-bold uppercase text-[10px]">Name</span>
              <input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full border rounded-lg px-2 py-1.5" />
            </label>
            <label className="block text-xs"><span className="font-bold uppercase text-[10px]">Email</span>
              <input value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="mt-1 w-full border rounded-lg px-2 py-1.5" />
            </label>
            <label className="block text-xs"><span className="font-bold uppercase text-[10px]">New password (blank=keep)</span>
              <input type="password" value={editing.password || ''} onChange={(e) => setEditing({ ...editing, password: e.target.value })} className="mt-1 w-full border rounded-lg px-2 py-1.5" />
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
