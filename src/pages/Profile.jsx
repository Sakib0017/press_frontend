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
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <Header />
        <section className="px-3 sm:px-5 lg:px-6 py-3 sm:py-4 bg-white border-b flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 shrink-0">
          <div className="min-w-0"><h1 className="text-lg sm:text-xl font-black tracking-tight truncate">Dr. {doctor.name}</h1>{doctor.usr_spec && <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wide">{doctor.usr_spec}</p>}</div>
          <div className="text-left sm:text-right shrink-0">{doctor.name_ban && <div className="text-sm sm:text-base font-bold">{doctor.name_ban}</div>}</div>
        </section>
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 pb-20 md:pb-6">
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b bg-slate-50/50"><h2 className="text-[11px] sm:text-xs font-black uppercase tracking-wide">Doctor Information</h2></div>
              <div className="divide-y divide-slate-100">
                {Object.entries(fields).map(([k,v])=>(
                  <div key={k} className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4"><span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide">{k}</span><span className="text-[13px] font-semibold break-words sm:text-right">{v||'-'}</span></div>
                ))}
              </div>
            </div>
            {doctor.name_ban && (
              <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm overflow-hidden mt-3 sm:mt-4">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b bg-slate-50/50"><h2 className="text-[11px] sm:text-xs font-black uppercase tracking-wide">Bangla Information</h2></div>
                <div className="divide-y divide-slate-100">{Object.entries(bangla).map(([k,v])=>(
                  <div key={k} className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide">{k}</span><span className="text-[13px] font-semibold break-words sm:text-right">{v||'-'}</span></div>
                ))}</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
