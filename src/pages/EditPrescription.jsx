import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Header from '../components/Header';

const componentsDef = {
  complaints:'Chief Complaints', history:'History', comorbidity:'Co-Morbidity', allergy:'Allergy', findings:'Clinical Findings',
  physical:'Physical Examination', diagnosis:'Diagnosis', investigations:'Investigations', procedure:'Procedure', rx:'Rx (Medication)',
  advices:'Medical Advices', followup:'Follow-up', referred:'Referred To', bt_order:'BT Order', certificate:'Medical Certificate', note:'Prescription Note', admission:'Admission Request'
};
const sections = Object.keys(componentsDef);

export default function EditPrescription(){
  const { id } = useParams();
  const [pres, setPres] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState({ name:'', mobile:'', age:'', gender:'', address:''});
  const [selectedData, setSelectedData] = useState(Object.fromEntries(sections.map(s=>[s,[]])));
  const [meds, setMeds] = useState([]);
  const [mName, setMName] = useState(''); const [mInst,setMInst]=useState(''); const [mDose,setMDose]=useState(''); const [mDur,setMDur]=useState('');
  const [modalSection,setModalSection]=useState(null); const [dbSuggestions,setDbSuggestions]=useState([]); const [manualInput,setManualInput]=useState('');
  const [showRxModal, setShowRxModal]=useState(false);
  const [isSaving, setIsSaving]=useState(false);

  // Respect Setup layout (left / right / hidden) — same key as Prescription + Setup
  const doctorId = doctor?._id || (typeof doctor === 'string' ? doctor : null);
  const LAYOUT_KEY = doctorId ? `ehr_layout_v2_${doctorId}` : null;
  const [layout, setLayout] = useState({ left: sections.filter(s=>s!=='rx'), right:['rx'], hidden:[] });

  useEffect(()=>{
    if(!LAYOUT_KEY) return;
    try{
      const s = JSON.parse(localStorage.getItem(LAYOUT_KEY));
      if(s && s.left && s.right){
        if(!s.hidden) s.hidden = [];
        setLayout(s);
      }
    }catch{}
  }, [LAYOUT_KEY]);

  useEffect(()=>{
    api.get(`/prescriptions/${id}`).then(({data})=>{
      const p=data.data; setPres(p); setDoctor(p.doctor||p.doctor_id);
      setPatient({ name:p.patient_name||'', mobile:p.patient_mobile||'', age:p.patient_age||'', gender:p.patient_gender||'', address:p.patient_address||''});
      setSelectedData(prev=>{
        const nd={...prev};
        if(p.clinical_data) Object.entries(p.clinical_data).forEach(([k,v])=>{ if(nd.hasOwnProperty(k) && Array.isArray(v)) nd[k]=v; });
        return nd;
      });
      setMeds(p.medications||[]);
    });
  }, [id]);

  const openModal = async (sec)=>{
    setModalSection(sec); setManualInput('');
    try{ const {data}=await api.post('/components/fetch', { doctor_id: doctorId, com_name: sec }); setDbSuggestions(Array.isArray(data)?data:[]); }catch{ setDbSuggestions([]); }
  };
  const addTag=(sec,val)=>{ if(!selectedData[sec].includes(val)) setSelectedData({...selectedData, [sec]: [...selectedData[sec], val]}); };
  const removeTag=(sec,val)=> setSelectedData({...selectedData, [sec]: selectedData[sec].filter(x=>x!==val)});
  const handleManualAdd=async()=>{
    const val=manualInput.trim(); if(!val||!modalSection) return;
    await api.post('/components/save', { doctor_id: doctorId, com_name: modalSection, sub_com_name: val });
    addTag(modalSection,val); setManualInput('');
    const {data}=await api.post('/components/fetch', { doctor_id: doctorId, com_name: modalSection }); setDbSuggestions(Array.isArray(data)?data:[]);
  };
  const addMed=()=>{ if(!mName.trim()) return; setMeds([...meds, { name:mName, instruction:mInst, dose:mDose||'1+0+1', duration:mDur||'7 Days'}]); setMName('');setMInst('');setMDose('');setMDur(''); };

  const updateAndPrint=async()=>{
    if(isSaving) return;
    if(!patient.name||!patient.mobile||!patient.age||!patient.gender){ alert('Fill all patient details'); return; }
    setIsSaving(true);
    try{
      const payload={ patient_name:patient.name, patient_mobile:patient.mobile, patient_age:patient.age, patient_gender:patient.gender, patient_address:patient.address, clinical_data:selectedData, medications:meds };
      const {data}=await api.put(`/prescriptions/${id}`, payload);
      if(data.status==='success'){ window.open(`/print/${id}`, '_blank'); }
      else alert('Update failed');
    }catch(e){ alert('Update failed'); }
    finally{ setTimeout(()=> setIsSaving(false), 1200); }
  };

  if(!pres) return <div className="p-10 text-center">Loading...</div>;

  // Layout helpers (same as Prescription.jsx) — left keeps left, right keeps right, hidden is dropped
  const isLeft = (sid)=> layout.left.includes(sid);
  const isRight = (sid)=> layout.right.includes(sid);
  const isHidden = (sid)=> layout.hidden.includes(sid) || (!isLeft(sid) && !isRight(sid) && sid!=='rx');
  const leftSections = sections.filter(s=> s!=='rx' && (isLeft(s) || (!isRight(s) && !isHidden(s))));
  const rightSections = sections.filter(s=> s!=='rx' && isRight(s));

  return (
    <div className="flex flex-col md:flex-row h-screen md:h-screen overflow-hidden  text-[13px] antialiased font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0  min-h-0 overflow-hidden">
        <Header />
        <section className="px-3 sm:px-5 lg:px-6 py-3 sm:py-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 shrink-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-none truncate">{doctor?.name||'Doctor'}</h1>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[9px] font-black uppercase shrink-0">Editing #{id.slice(-6)}</span>
            </div>
            <div className="mt-1.5 sm:mt-2 space-y-0.5">
              {doctor?.usr_spec && <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{doctor.usr_spec}</p>}
              {doctor?.degree && <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight line-clamp-2">{doctor.degree}</p>}
              {doctor?.experiance && <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{doctor.experiance}</p>}
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0">
            {doctor?.name_ban && <div className="text-sm sm:text-base font-bold text-slate-900">{doctor.name_ban}</div>}
            {doctor?.usr_spec_ban && <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600">{doctor.usr_spec_ban}</div>}
            {doctor?.degree_ban && <div className="text-[10px] text-slate-500 line-clamp-2 max-w-[200px] sm:max-w-none">{doctor.degree_ban}</div>}
            {doctor?.experiance_ban && <div className="text-[10px] text-slate-500">{doctor.experiance_ban}</div>}
          </div>
        </section>
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5 bg-gray-100 border-y sm:border border-gray-300 px-2 py-2 text-sm shrink-0 lg:overflow-x-auto">
          <input value={patient.name} onChange={e=>setPatient({...patient, name:e.target.value})} placeholder="Name *" className="h-9 sm:h-6 flex-1 sm:flex-none sm:w-40 lg:w-56 rounded-lg sm:rounded border border-gray-300 px-2.5 sm:px-2 text-xs bg-white min-w-[120px]" />
          <input value={patient.mobile} onChange={e=>setPatient({...patient, mobile:e.target.value})} placeholder="Mobile *" className="h-9 sm:h-6 w-[48%] sm:w-32 rounded-lg sm:rounded border border-gray-300 px-2.5 sm:px-2 text-xs bg-white" />
          <input value={patient.age} onChange={e=>setPatient({...patient, age:e.target.value})} placeholder="Age *" className="h-9 sm:h-6 w-[48%] sm:w-24 rounded-lg sm:rounded border border-gray-300 px-2.5 sm:px-2 text-xs bg-white" />
          <select value={patient.gender} onChange={e=>setPatient({...patient, gender:e.target.value})} className="h-9 sm:h-6 w-[48%] sm:w-24 rounded-lg sm:rounded border border-gray-300 px-2.5 sm:px-2 text-xs bg-white"><option value="">Gender *</option><option value="Male">Male</option><option value="Female">Female</option></select>
          <input value={patient.address} onChange={e=>setPatient({...patient, address:e.target.value})} placeholder="Address" className="h-9 sm:h-6 w-full lg:flex-1 rounded-lg sm:rounded border border-gray-300 px-2.5 sm:px-2 text-xs bg-white" />
        </div>
        <main className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row p-3 sm:p-4 gap-3 sm:gap-4 pb-40 md:pb-4">
          <aside className="w-full lg:w-[28%] xl:w-1/4 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-4 space-y-3 lg:overflow-y-auto shrink-0">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 sm:mb-3">Sections</h3>
            {leftSections.map(idSec=> (
              <div key={idSec} className="group bg-white rounded-xl sm:rounded-2xl p-3 transition-all">
                <div className="flex justify-between items-center gap-2"><span className="text-[11px] sm:text-[12px] font-black uppercase tracking-wide leading-tight">{componentsDef[idSec]}</span><button onClick={()=>openModal(idSec)} className="h-7 w-7 rounded-full  text-blue-600 text-base font-black flex items-center justify-center shrink-0">+</button></div>
                <div className="mt-2 flex flex-wrap gap-1">{selectedData[idSec].map(v=> <span key={v} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[11px] font-extrabold break-words">{v}</span>)}</div>
              </div>
            ))}
          </aside>
          <section className="flex-1 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 lg:overflow-y-auto min-h-0">
            <div className="rounded-2xl p-3 sm:p-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] sm:text-[12px] font-black text-blue-800 uppercase tracking-wide">Rx (Medication)</span>
                {meds.length > 0 && <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">{meds.length}</span>}
                <button onClick={()=>setShowRxModal(true)} className="h-7 w-7  rounded-full  text-blue-600 font-black flex items-center justify-center gap-1 shrink-0">+</button>
              </div>
              {meds.length === 0 ? (
                <p className="mt-3 text-[12px] text-slate-400 font-medium"></p>
              ) : (
                <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                <table className="w-full text-left mt-3 min-w-[320px]">
                  <thead className="border-b-2 border-slate-300 text-[11px] text-slate-500"><tr><th className="py-2 text-[12px] sm:text-[14px]">Medications</th><th className="py-2 text-center text-[12px] sm:text-[14px]">Dosage</th><th className="py-2 text-right text-[12px] sm:text-[14px]">Duration</th><th className="w-6"></th></tr></thead>
                  <tbody className="text-[12px] sm:text-[13px] divide-y divide-slate-100">{meds.map((m,idx)=>(<tr key={idx} className="border-b "><td className="py-2 pr-2"><b className="break-words">{m.name}</b><br/><small className="text-slate-500 break-words">{m.instruction}</small></td><td className="text-center whitespace-nowrap font-medium">{m.dose}</td><td className="text-right whitespace-nowrap font-medium">{m.duration}</td><td><button onClick={()=>setMeds(meds.filter((_,i)=>i!==idx))} className="text-red-400 ml-1 p-1">×</button></td></tr>))}</tbody>
                </table>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
              {rightSections.map(idSec=> (
                <div key={idSec} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <div className="flex justify-between items-center gap-2 mb-2"><span className="text-[11px] sm:text-[12px] font-black uppercase tracking-wide leading-tight">{componentsDef[idSec]}</span><button onClick={()=>openModal(idSec)} className="h-7 w-7 rounded-full  text-blue-600 text-base font-black flex items-center justify-center shrink-0">+</button></div>
                  <div className="text-[13px] flex flex-wrap gap-1">{selectedData[idSec].map(v=> <span key={v} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[11px] font-extrabold break-words">{v}</span>)}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      {showRxModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl  overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 flex justify-between items-center bg-blue-50/60 border-b border-blue-100 shrink-0">
              <div><h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Rx (Medication){meds.length > 0 ? ` • ${meds.length}` : ''}</h3><h2 className="text-base font-black">Manage Medications</h2></div>
              <button onClick={()=>setShowRxModal(false)} className="h-9 w-9 rounded-full bg-white border text-slate-400  text-xl flex items-center justify-center">&times;</button>
            </div>
            <div className="p-4 sm:p-5 overflow-y-auto">
              <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-left mb-4 min-w-[340px]">
                <thead className="border-b-2 border-slate-300 text-[11px] text-slate-500"><tr><th className="py-2 text-[12px] sm:text-[14px]">Medications</th><th className="py-2 text-center text-[12px] sm:text-[14px]">Dosage</th><th className="py-2 text-right text-[12px] sm:text-[14px]">Duration</th><th className="w-6"></th></tr></thead>
                <tbody className="text-[12px] sm:text-[13px] divide-y divide-slate-100">
                  {meds.length===0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400 font-medium">No medications added yet.</td></tr>}
                  {meds.map((m,idx)=>(<tr key={idx} className="border-b "><td className="py-2 pr-2"><b className="break-words">{m.name}</b><br/><small className="text-slate-500 break-words">{m.instruction}</small></td><td className="text-center whitespace-nowrap font-medium">{m.dose}</td><td className="text-right whitespace-nowrap font-medium">{m.duration}</td><td><button onClick={()=>setMeds(meds.filter((_,i)=>i!==idx))} className="text-red-400 ml-1 p-1">×</button></td></tr>))}
                </tbody>
              </table>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-1  p-2 rounded-xl border border-slate-300">
                <input value={mName} onChange={e=>setMName(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') addMed(); }} placeholder="Medicine *" className="sm:col-span-5 p-3 sm:p-2.5 text-xs border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-400" />
                <input value={mInst} onChange={e=>setMInst(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') addMed(); }} placeholder="Advice" className="sm:col-span-3 p-3 sm:p-2.5 text-xs border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-400" />
                <input value={mDose} onChange={e=>setMDose(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') addMed(); }} placeholder="1+0+1" className="sm:col-span-2 p-3 sm:p-2.5 text-xs border rounded-xl text-center bg-white outline-none focus:ring-2 focus:ring-blue-400" />
                <input value={mDur} onChange={e=>setMDur(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') addMed(); }} placeholder="Days" className="sm:col-span-1 p-3 sm:p-1.5 text-xs border rounded-xl text-center bg-white" />
                <button onClick={addMed} className="sm:col-span-1 h-11 sm:h-auto bg-blue-600 text-white rounded-xl font-bold text-lg sm:text-[24px] ">+</button>
              </div>
            </div>
            <div className="p-3 sm:p-4  border-t flex gap-2 shrink-0">
              <button onClick={()=>setShowRxModal(false)} className="flex-1 py-3 text-[10px] font-black text-slate-400 uppercase">Close</button>
              <button onClick={()=>setShowRxModal(false)} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase ">Done{meds.length > 0 ? ` (${meds.length})` : ''}</button>
            </div>
          </div>
        </div>
      )}
      {modalSection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl  overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 flex justify-between items-center  border-b shrink-0"><div><h3 className="text-[10px] font-black text-slate-400 uppercase">{componentsDef[modalSection]}</h3><h2 className="text-base font-black">Add Records</h2></div><button onClick={()=>setModalSection(null)} className="h-9 w-9 rounded-full bg-white border text-slate-400  text-xl flex items-center justify-center">&times;</button></div>
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap gap-2">{selectedData[modalSection].map(v=> <span key={v} className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2">{v}<button onClick={()=>removeTag(modalSection,v)} className="text-red-300 ml-1">×</button></span>)}</div>
              <div className="flex gap-2"><input value={manualInput} onChange={e=>setManualInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleManualAdd()} placeholder="New entry..." className="flex-1 h-11 px-4  border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-200" /><button onClick={handleManualAdd} className="px-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase  shrink-0">Add</button></div>
              <div className="border-t pt-4"><p className="text-[10px] font-black text-slate-300 uppercase mb-3">Database Suggestions</p><div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">{dbSuggestions.map(val=> <button key={val} onClick={()=>addTag(modalSection,val)} className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-[11px] font-bold text-slate-600 ">{val}</button>)}</div></div>
            </div>
            <div className="p-3 sm:p-4  border-t flex gap-2 shrink-0"><button onClick={()=>setModalSection(null)} className="flex-1 py-3 text-[10px] font-black text-slate-400 uppercase">Close</button><button onClick={()=>{ if(doctorId) localStorage.setItem(`presc_${doctorId}_${modalSection}`, JSON.stringify(selectedData[modalSection])); setModalSection(null); }} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase">Save Changes</button></div>
          </div>
        </div>
      )}
      <div className="fixed bottom-[72px] md:bottom-4 right-3 left-3 md:left-auto md:right-4 z-40 flex gap-2 sm:gap-3 justify-center md:justify-end pointer-events-none">
        <Link to={`/prescription/${doctorId}`} className="pointer-events-auto flex-1 md:flex-none bg-white border border-slate-300 px-4 py-3 md:py-2.5 text-xs font-bold rounded-xl  uppercase text-center max-w-[120px] md:max-w-none">Cancel</Link>
        <button onClick={updateAndPrint} disabled={isSaving} className={`pointer-events-auto flex-1 md:flex-none text-white flex items-center justify-center gap-2 rounded-xl  max-w-[200px] md:max-w-none ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-700 '}`}><span className="px-3 sm:px-4 py-3 md:py-2.5 text-xs font-bold uppercase">{isSaving ? 'SAVING...' : 'UPDATE & PRINT'}</span></button>
      </div>
    </div>
  );
}
