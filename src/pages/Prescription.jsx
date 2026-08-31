import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const componentsDef = {
  complaints: 'Chief Complaints',
  history: 'History',
  comorbidity: 'Co-Morbidity',
  allergy: 'Allergy',
  findings: 'Clinical Findings',
  physical: 'Physical Examination',
  diagnosis: 'Diagnosis',
  investigations: 'Investigations',
  procedure: 'Procedure',
  rx: 'Rx (Medication)',
  advices: 'Medical Advices',
  followup: 'Follow-up',
  referred: 'Referred To',
  bt_order: 'BT Order',
  certificate: 'Medical Certificate',
  note: 'Prescription Note',
  admission: 'Admission Request'
};
const sections = Object.keys(componentsDef);

export default function Prescription() {
  const { id } = useParams(); // doctor id
  const { doctor: authDoctor } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [waiting, setWaiting] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [showQueue, setShowQueue] = useState(false);
  const [activeTab, setActiveTab] = useState('waiting');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0,10));
  const [patient, setPatient] = useState({ name:'', mobile:'', age:'', gender:'', address:'', datetime: new Date().toISOString().slice(0,16) });
  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);
  const [selectedData, setSelectedData] = useState(Object.fromEntries(sections.map(s=>[s, []])));
  const [meds, setMeds] = useState([]);
  const [mName, setMName] = useState(''); const [mInst, setMInst] = useState(''); const [mDose, setMDose] = useState(''); const [mDur, setMDur] = useState('');
  const [medicineResults, setMedicineResults] = useState([]); const [adviceResults, setAdviceResults] = useState([]); const [doseResults, setDoseResults] = useState([]);
  const [modalSection, setModalSection] = useState(null);
  const [dbSuggestions, setDbSuggestions] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const suggestionCache = useRef({});

  const doctorId = id || authDoctor?._id;
  const LAYOUT_KEY = `ehr_layout_v2_${doctorId}`;
  const [layout, setLayout] = useState(()=>{ try{ const s=JSON.parse(localStorage.getItem(LAYOUT_KEY)); if(s && s.left && s.right) return s; }catch{} return { left: sections.filter(s=>s!=='rx'), right:['rx'], hidden:[] }; });

  useEffect(()=>{
    if(!doctorId) return;
    api.get(`/doctors/${doctorId}`).then(({data})=> setDoctor(data.data)).catch(()=> setDoctor(authDoctor));
  }, [doctorId]);

  const fetchQueue = async ()=>{
    if(!doctor?.name) return;
    const { data } = await api.get('/appointments/queue/list', { params: { doctorName: doctor.name } });
    // enrich completed with prescription check
    setWaiting(data.waiting||[]);
    setCompleted(data.completed||[]);
  };
  useEffect(()=>{ if(doctor?.name) fetchQueue(); }, [doctor]);

  const startPatient = (p)=>{
    setPatient({ name: p.patient_name||'', mobile: p.patient_contact||'', age: p.patient_age||'', gender: p.patient_gender||'', address:'', datetime: new Date().toISOString().slice(0,16) });
    setCurrentAppointmentId(p._id || p.appointment_id);
    setShowQueue(false);
  };

  const deleteCompletedPatient = async (id)=>{
    if(!confirm('Delete this appointment?')) return;
    await api.put(`/appointments/${id}/status`, { status:'cancelled' });
    fetchQueue();
  };

  // Live search helpers
  const doSearch = async (q, type, setter)=>{
    if(!q.trim()){ setter([]); return; }
    const usr_spec = doctor?.usr_spec || doctor?.specialization || '';
    const { data } = await api.get(`/search/${type}`, { params:{ q, usr_spec } });
    setter(data.items||[]);
  };
  useEffect(()=>{ const t=setTimeout(()=> doSearch(mName,'medicine', setMedicineResults), 250); return ()=>clearTimeout(t); }, [mName]);
  useEffect(()=>{ const t=setTimeout(()=> doSearch(mInst,'medadvice', setAdviceResults), 250); return ()=>clearTimeout(t); }, [mInst]);
  useEffect(()=>{ const t=setTimeout(()=> doSearch(mDose,'dose', setDoseResults), 250); return ()=>clearTimeout(t); }, [mDose]);

  const addMed = ()=>{
    if(!mName.trim()) return;
    setMeds([...meds, { name:mName, instruction:mInst, dose: mDose||'1+0+1', duration: mDur||'7 Days' }]);
    setMName(''); setMInst(''); setMDose(''); setMDur('');
    setMedicineResults([]); setAdviceResults([]); setDoseResults([]);
  };

  const openModal = async (sec)=>{
    setModalSection(sec); setManualInput('');
    if(suggestionCache.current[sec]){ setDbSuggestions(suggestionCache.current[sec]); return; }
    setDbSuggestions([]);
    try{
      const { data } = await api.post('/components/fetch', { doctor_id: doctorId, com_name: sec });
      const list = Array.isArray(data)? data : [];
      suggestionCache.current[sec]=list;
      setDbSuggestions(list);
    }catch{ setDbSuggestions([]); }
  };
  const addTag = (sec,val)=>{
    if(!selectedData[sec].includes(val)){
      const nd = {...selectedData, [sec]: [...selectedData[sec], val]};
      setSelectedData(nd);
    }
  };
  const removeTag = (sec,val)=>{
    const nd = {...selectedData, [sec]: selectedData[sec].filter(x=>x!==val)};
    setSelectedData(nd);
  };
  const handleManualAdd = async ()=>{
    const val = manualInput.trim(); if(!val || !modalSection) return;
    try{
      await api.post('/components/save', { doctor_id: doctorId, com_name: modalSection, sub_com_name: val });
      addTag(modalSection, val);
      suggestionCache.current[modalSection]=null;
      setManualInput('');
      // reload suggestions
      const { data } = await api.post('/components/fetch', { doctor_id: doctorId, com_name: modalSection });
      suggestionCache.current[modalSection]=Array.isArray(data)?data:[];
      setDbSuggestions(suggestionCache.current[modalSection]);
    }catch(e){ alert('Save failed'); }
  };
  const saveSection = ()=>{
    if(!modalSection) return;
    // persist to localStorage like PHP did (presc_{doctorId}_{section})
    localStorage.setItem(`presc_${doctorId}_${modalSection}`, JSON.stringify(selectedData[modalSection]));
    setModalSection(null);
  };

  const saveAndPrint = async ()=>{
    if(!patient.name || !patient.mobile || !patient.age || !patient.gender){ alert('Please fill in all patient details (Name, Mobile, Age, Gender)'); return; }
    try{
      const payload = {
        appointment_id: currentAppointmentId || 'WALK-IN',
        doctor_id: doctorId,
        patient_name: patient.name,
        patient_mobile: patient.mobile,
        patient_age: patient.age,
        patient_gender: patient.gender,
        patient_address: patient.address,
        clinical_data: selectedData,
        medications: meds,
      };
      const { data } = await api.post('/prescriptions', payload);
      if(data.status!=='success'){ alert(data.message||'Save failed'); return; }
      if(currentAppointmentId && currentAppointmentId!=='WALK-IN'){
        await api.post(`/appointments/${currentAppointmentId}/complete`).catch(()=>{});
      }
      window.open(`/print/${data.prescription_id}`, '_blank');
      // reset
      setPatient({ name:'', mobile:'', age:'', gender:'', address:'', datetime: new Date().toISOString().slice(0,16) });
      setMeds([]); setCurrentAppointmentId(null);
      setSelectedData(Object.fromEntries(sections.map(s=>[s, []])));
      fetchQueue();
    }catch(e){ alert('Server error saving prescription'); console.error(e); }
  };

  // Layout helpers
  const layoutSections = layout;
  const isLeft = (id)=> layoutSections.left.includes(id);
  const isRight = (id)=> layoutSections.right.includes(id);
  const isHidden = (id)=> layoutSections.hidden.includes(id) || (!isLeft(id) && !isRight(id) && id!=='rx');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-[13px] antialiased font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <Header />
        <section className="px-5 lg:px-6 py-4 bg-white border-b border-slate-100 flex justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-xl font-black text-slate-950 tracking-tight leading-none">{doctor?.name||'Doctor'}</h1>
            <div className="mt-2 space-y-0.5">
              {doctor?.usr_spec && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doctor.usr_spec}</p>}
              {doctor?.degree && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doctor.degree}</p>}
              {doctor?.experiance && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doctor.experiance}</p>}
            </div>
          </div>
          <div className="text-right">
            {doctor?.name_ban && <div className="text-base font-bold text-slate-900">{doctor.name_ban}</div>}
            {doctor?.usr_spec_ban && <div className="text-[11px] font-semibold text-slate-600">{doctor.usr_spec_ban}</div>}
            {doctor?.degree_ban && <div className="text-[10px] text-slate-500">{doctor.degree_ban}</div>}
            {doctor?.experiance_ban && <div className="text-[10px] text-slate-500">{doctor.experiance_ban}</div>}
          </div>
        </section>

        <div className="flex items-center gap-1 bg-gray-100 border border-gray-300 h-8 px-1 text-sm shrink-0 overflow-x-auto whitespace-nowrap">
          <button onClick={()=>setShowQueue(true)} className="px-4 h-6 rounded border border-indigo-300 bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 text-xs flex items-center gap-2"><span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>Patient Queue</button>
          <input value={patient.name} onChange={e=>setPatient({...patient, name:e.target.value})} placeholder="Name" className="h-6 w-56 rounded border border-gray-300 px-2 text-gray-500" />
          <input value={patient.mobile} onChange={e=>setPatient({...patient, mobile:e.target.value})} placeholder="Mobile" className="h-6 w-32 rounded border border-gray-300 px-2 text-gray-500" />
          <input value={patient.age} onChange={e=>setPatient({...patient, age:e.target.value})} placeholder="Age" className="h-6 w-32 rounded border border-gray-300 px-2 text-gray-500" />
          <select value={patient.gender} onChange={e=>setPatient({...patient, gender:e.target.value})} className="h-6 w-24 rounded border border-gray-300 px-2 text-gray-500 bg-white">
            <option value="">Gender</option><option value="Male">Male</option><option value="Female">Female</option>
          </select>
          <input value={patient.address} onChange={e=>setPatient({...patient, address:e.target.value})} placeholder="Address" className="h-6 min-w-64 flex-1 rounded border border-gray-300 px-2 text-gray-500" />
          <input type="datetime-local" value={patient.datetime} onChange={e=>setPatient({...patient, datetime:e.target.value})} className="h-6 w-44 rounded border border-gray-300 px-2 text-gray-500" />
        </div>

        <main className="flex-1 overflow-hidden flex flex-col lg:flex-row p-4 gap-4">
          <aside className="w-full lg:w-[28%] xl:w-1/4 bg-white border border-slate-100 rounded-3xl p-4 space-y-3 overflow-y-auto">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.22em] mb-3">Sections</h3>
            {sections.filter(s=> s!=='rx' && (isLeft(s) || !isRight(s) && !isHidden(s))).map(id=> (
              <div key={id} className="group bg-white border border-slate-100 rounded-2xl p-3 hover:border-slate-200 hover:shadow-sm transition-all">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[12px] font-black text-slate-700 uppercase tracking-wide group-hover:text-slate-950">{componentsDef[id]}</span>
                  <button onClick={()=>openModal(id)} className="h-7 w-7 rounded-full bg-slate-50 text-blue-600 text-base font-black flex items-center justify-center hover:bg-blue-600 hover:text-white">+</button>
                </div>
                <div className="mt-2 text-[12px] text-slate-400 leading-relaxed flex flex-wrap gap-1">
                  {selectedData[id].map(v=> <span key={v} className="inline-block bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[11px] font-extrabold">{v}</span>)}
                </div>
              </div>
            ))}
          </aside>

          <section className="flex-1 bg-white border border-slate-100 rounded-3xl p-5 lg:p-6 overflow-y-auto">
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between gap-3 mb-2"><span className="text-[12px] font-black text-emerald-800 uppercase tracking-wide">Rx (Medication)</span></div>
              <table className="w-full text-left mb-6 mt-7 relative z-10">
                <thead className="border-b-2 border-slate-300 text-[11px] text-slate-500">
                  <tr><th className="py-2 w-3/7 text-[14px]">Medications</th><th className="py-2 text-center w-2/7 text-[14px]">Dosage</th><th className="py-2 text-right w-2/7 text-[14px]">Duration</th></tr>
                </thead>
                <tbody className="text-[13px] divide-y divide-slate-100">
                  {meds.map((m,idx)=>(
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="py-2"><b>{m.name}</b><br/><small className="text-slate-500">{m.instruction}</small></td>
                      <td className="text-center font-medium">{m.dose}</td>
                      <td className="text-right font-medium">{m.duration}</td>
                      <td><button onClick={()=>setMeds(meds.filter((_,i)=>i!==idx))} className="text-red-400 ml-2">×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="grid grid-cols-12 gap-1 bg-slate-50 p-2 rounded-lg border border-slate-300">
                <div className="col-span-5 relative">
                  <input value={mName} onChange={e=>setMName(e.target.value)} placeholder="Medicine" className="w-full p-2.5 text-xs border rounded outline-none focus:ring-1 focus:ring-blue-400" />
                  {medicineResults.length>0 && <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-300 rounded shadow-md overflow-hidden z-50 max-h-64 overflow-y-auto">{medicineResults.map(it=> <button key={it._id} onClick={()=>{setMName(it.medicine); setMedicineResults([]);}} className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50">{it.medicine}</button>)}</div>}
                </div>
                <div className="col-span-3 relative">
                  <input value={mInst} onChange={e=>setMInst(e.target.value)} placeholder="Advice" className="w-full p-2.5 text-xs border rounded outline-none focus:ring-1 focus:ring-blue-400" />
                  {adviceResults.length>0 && <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-md z-50 max-h-64 overflow-y-auto">{adviceResults.map(it=> <button key={it._id} onClick={()=>{setMInst(it.medadvice); setAdviceResults([]);}} className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50">{it.medadvice}</button>)}</div>}
                </div>
                <div className="col-span-2 relative">
                  <input value={mDose} onChange={e=>setMDose(e.target.value)} placeholder="1+0+1" className="w-full p-2.5 text-xs border rounded text-center outline-none focus:ring-1 focus:ring-blue-400" />
                  {doseResults.length>0 && <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-md z-50 max-h-64 overflow-y-auto">{doseResults.map(it=> <button key={it._id} onClick={()=>{setMDose(it.dose); setDoseResults([]);}} className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50">{it.dose}</button>)}</div>}
                </div>
                <input value={mDur} onChange={e=>setMDur(e.target.value)} placeholder="Days" className="col-span-1 p-1.5 text-xs border rounded text-center" />
                <button onClick={addMed} className="col-span-1 text-slate-900 rounded font-medium text-[24px]">+</button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {sections.filter(s=> s!=='rx' && isRight(s)).map(id=> (
                <div key={id} className="group bg-white border border-slate-100 rounded-2xl p-4 hover:border-slate-200 hover:shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[12px] font-black text-slate-700 uppercase tracking-wide">{componentsDef[id]}</span>
                    <button onClick={()=>openModal(id)} className="h-7 w-7 rounded-full bg-slate-50 text-blue-600 text-base font-black flex items-center justify-center hover:bg-blue-600 hover:text-white">+</button>
                  </div>
                  <div className="text-slate-500 text-[13px] leading-relaxed flex flex-wrap gap-1">
                    {selectedData[id].map(v=> <span key={v} className="inline-block bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[11px] font-extrabold">{v}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Queue Modal */}
      {showQueue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b flex justify-between items-center"><div><h3 className="text-lg font-black">Patient Management Queue</h3><p className="text-[10px] font-bold text-slate-400 uppercase">Doctor: {doctor?.name}</p></div><button onClick={()=>setShowQueue(false)} className="text-slate-300 hover:text-slate-600 text-3xl font-light">&times;</button></div>
            <div className="flex border-b bg-slate-50/50">
              <button onClick={()=>setActiveTab('waiting')} className={`flex-1 py-3 px-4 text-center border-b-2 font-black text-[11px] uppercase ${activeTab==='waiting'?'border-indigo-600 text-indigo-600 bg-white':'border-transparent text-slate-400'}`}>Queue ({waiting.length})</button>
              <button onClick={()=>setActiveTab('completed')} className={`flex-1 py-3 px-4 text-center border-b-2 font-black text-[11px] uppercase ${activeTab==='completed'?'border-emerald-600 text-emerald-600 bg-white':'border-transparent text-slate-400'}`}>Completed ({completed.length})</button>
            </div>
            <div className="p-6 max-h-[500px] overflow-y-auto">
              {activeTab==='waiting' ? (
                waiting.length===0 ? <p className="text-center py-20 text-slate-400 font-bold">No patients in queue.</p> :
                <div className="divide-y divide-slate-100">{waiting.map(p=> (
                  <div key={p._id} onClick={()=>startPatient(p)} className="py-3 flex justify-between items-center hover:bg-slate-50 p-2 rounded cursor-pointer">
                    <div><h4 className="text-sm font-bold text-slate-800">{p.patient_name}</h4><p className="text-xs text-slate-500">{p.patient_age} Yrs | {p.patient_gender} | {p.patient_contact}</p></div><span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-full">ID: #{String(p._id).slice(-6)}</span>
                  </div>
                ))}</div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Filter by date</label>
                    <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} className="h-8 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                    <button onClick={()=>setFilterDate('')} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase">Clear</button>
                  </div>
                  {completed.length===0 ? <p className="text-center py-20 text-slate-400 font-bold">No completed patients yet.</p> :
                  <div className="divide-y divide-slate-100">{completed.filter(p=> !filterDate || new Date(p.appointment_date).toISOString().slice(0,10)===filterDate).map(p=> (
                    <div key={p._id} className="py-3 px-4 flex items-center justify-between hover:bg-slate-50">
                      <div><h4 className="text-sm font-bold">{p.patient_name}</h4><p className="text-xs text-slate-500">{p.patient_age} Yrs | {p.patient_gender} | {p.patient_contact}</p></div>
                      <button onClick={()=>deleteCompletedPatient(p._id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-[10px] font-black uppercase">Delete</button>
                    </div>
                  ))}</div>}
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-slate-50/30 flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">Powered by Popular Diagnostic Centre</span><button onClick={()=>setShowQueue(false)} className="px-6 py-2 bg-white border border-slate-200 rounded text-[11px] font-black uppercase">Close Queue</button></div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {modalSection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-5 flex justify-between items-center bg-slate-50 border-b">
              <div><h3 className="text-[10px] font-black text-slate-400 uppercase">{componentsDef[modalSection]}</h3><h2 className="text-base font-black">Add Records</h2></div>
              <button onClick={()=>setModalSection(null)} className="h-9 w-9 rounded-full bg-white border text-slate-400 hover:text-slate-900 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex flex-wrap gap-2">{selectedData[modalSection].map(val=> <span key={val} className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2">{val}<button onClick={()=>removeTag(modalSection,val)} className="text-red-300 ml-1">×</button></span>)}</div>
              <div className="flex gap-2">
                <input value={manualInput} onChange={e=>setManualInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleManualAdd()} placeholder="New entry..." className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none" />
                <button onClick={handleManualAdd} className="px-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600">Add</button>
              </div>
              <div className="border-t pt-4"><p className="text-[10px] font-black text-slate-300 uppercase mb-3">Database Suggestions</p>
                <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">{dbSuggestions.map(val=> <button key={val} onClick={()=>addTag(modalSection,val)} className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-[11px] font-bold text-slate-500 hover:bg-slate-50">{val}</button>)}</div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex gap-2">
              <button onClick={()=>setModalSection(null)} className="flex-1 py-3 text-[10px] font-black text-slate-400 uppercase">Close</button>
              <button onClick={saveSection} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={saveAndPrint} className="bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2 rounded-lg shadow-lg">
          <span className="px-4 py-2.5 text-xs font-bold tracking-wide uppercase">SAVE & PRINT</span>
          <span className="bg-blue-800/50 px-3 py-2.5 rounded-r-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg></span>
        </button>
      </div>
    </div>
  );
}
