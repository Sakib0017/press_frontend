import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Profile(){
  const { doctor } = useAuth();
  if(!doctor) return <div className="p-10 text-center">Loading...</div>;
  const fields = { Name: doctor.name, Degree: doctor.degree, Specialization: doctor.usr_spec||doctor.specialization, Experience: doctor.experiance||doctor.experience, 'License Number': doctor.license_number, Room: doctor.room, Branch: doctor.branch, Bhaban: doctor.bhaban, Phone: doctor.phone };
  const bangla = { 'Name (Bangla)': doctor.name_ban, 'Specialization (Bangla)': doctor.usr_spec_ban, 'Degree (Bangla)': doctor.degree_ban, 'Experience (Bangla)': doctor.experiance_ban };
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 text-[13px] antialiased">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        <section className="px-5 lg:px-6 py-4 bg-white border-b flex justify-between gap-4 shrink-0">
          <div><h1 className="text-xl font-black tracking-tight">Dr. {doctor.name}</h1>{doctor.usr_spec && <p className="text-[10px] font-black text-slate-400 uppercase">{doctor.usr_spec}</p>}</div>
          <div className="text-right">{doctor.name_ban && <div className="text-base font-bold">{doctor.name_ban}</div>}</div>
        </section>
        <main className="flex-1 p-4 lg:p-6 space-y-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b"><h2 className="text-xs font-black uppercase">Doctor Information</h2></div>
              <div className="divide-y divide-slate-100">
                {Object.entries(fields).map(([k,v])=>(
                  <div key={k} className="px-5 py-3 flex justify-between items-center gap-4"><span className="text-[11px] font-bold text-slate-500 uppercase">{k}</span><span className="text-[13px] font-semibold text-right">{v||'-'}</span></div>
                ))}
              </div>
            </div>
            {doctor.name_ban && (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-4">
                <div className="px-5 py-4 border-b"><h2 className="text-xs font-black uppercase">Bangla Information</h2></div>
                <div className="divide-y">{Object.entries(bangla).map(([k,v])=>(
                  <div key={k} className="px-5 py-3 flex justify-between gap-4"><span className="text-[11px] font-bold text-slate-500 uppercase">{k}</span><span className="text-[13px] font-semibold text-right">{v||'-'}</span></div>
                ))}</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
