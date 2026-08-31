import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const allComponents = [
  { id:'rx', name:'Rx (Medication)' }, { id:'complaints', name:'Chief Complaints' }, { id:'history', name:'History' },
  { id:'comorbidity', name:'Co-Morbidity' }, { id:'allergy', name:'Allergy' }, { id:'findings', name:'Clinical Findings' },
  { id:'physical', name:'Physical Examination' }, { id:'diagnosis', name:'Diagnosis' }, { id:'investigations', name:'Investigations' },
  { id:'procedure', name:'Procedure' }, { id:'advices', name:'Medical Advices' }, { id:'followup', name:'Follow-up' },
  { id:'referred', name:'Referred To' }, { id:'bt_order', name:'BT Order' }, { id:'certificate', name:'Medical Certificate' }, { id:'note', name:'Prescription Note' }, { id:'admission', name:'Admission Request' }
];
const defaultConfig = { left: ['complaints','history','comorbidity','allergy','findings','physical','diagnosis','investigations','procedure','advices','followup','referred','bt_order','certificate','note','admission'], right:['rx'], hidden:[] };

export default function Setup(){
  const { doctor } = useAuth();
  const STORAGE_KEY = `ehr_layout_v2_${doctor?._id}`;
  const [config, setConfig] = useState(()=>{
    try{ const s=JSON.parse(localStorage.getItem(STORAGE_KEY)); if(s && s.left && s.right) return s; }catch{}
    return JSON.parse(JSON.stringify(defaultConfig));
  });
  const [dragId, setDragId] = useState(null);

  const saveConfig = ()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    const el=document.getElementById('save-status'); if(el){ el.classList.remove('hidden'); el.textContent='Saved!'; setTimeout(()=>el.classList.add('hidden'),2000); }
  };

  const handleDrop = (targetZone, targetId=null, e)=>{
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain') || dragId;
    if(!draggedId) return;
    const newCfg = { left:[...config.left], right:[...config.right], hidden:[...config.hidden] };
    ['left','right','hidden'].forEach(z=> newCfg[z]=newCfg[z].filter(i=>i!==draggedId));
    if(draggedId==='rx' && targetZone!=='right') targetZone='right';
    if(targetId && targetId!==draggedId){
      const idx=newCfg[targetZone].indexOf(targetId);
      if(idx!==-1) newCfg[targetZone].splice(idx,0,draggedId); else newCfg[targetZone].push(draggedId);
    } else newCfg[targetZone].push(draggedId);
    setConfig(newCfg);
  };
  const handleDropZone = (targetZone,e)=>{
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain') || dragId;
    if(!draggedId) return;
    const newCfg={ left:[...config.left], right:[...config.right], hidden:[...config.hidden]};
    ['left','right','hidden'].forEach(z=> newCfg[z]=newCfg[z].filter(i=>i!==draggedId));
    let tz=targetZone; if(draggedId==='rx' && tz!=='right') tz='right';
    newCfg[tz].push(draggedId); setConfig(newCfg);
  };

  useEffect(()=>{ /* persist on change optionally */ }, [config]);

  const Card = ({compId})=>{
    const isRx=compId==='rx';
    const name=allComponents.find(c=>c.id===compId)?.name||compId;
    return (
      <div draggable={!isRx} onDragStart={e=>{e.dataTransfer.setData('text/plain',compId); setDragId(compId);}} onDragEnd={()=>setDragId(null)}
        onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop('hidden', compId, e)}
        className={`bg-white border rounded-lg inline-flex items-center px-2 py-1 ${isRx?'border-emerald-300 bg-emerald-50/40':'border-slate-200 hover:border-slate-300'}`}>
        <h3 className="text-[9px] font-black uppercase whitespace-nowrap">{name}{isRx && <span className="ml-1 text-[6px] bg-emerald-50 text-emerald-500 px-1 rounded-full">Fixed</span>}</h3>
      </div>
    );
  };

  const Zone = ({zone, title, color})=>(
    <section>
      <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border shadow-sm mb-2">
        <h2 className="text-[10px] font-black uppercase tracking-wider">{title}</h2>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${color}`}>{config[zone].length}</span>
      </div>
      <div onDragOver={e=>e.preventDefault()} onDrop={e=>handleDropZone(zone,e)} className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-2 flex flex-wrap gap-1 min-h-[120px] content-start">
        {config[zone].length===0 ? <div className="text-center text-[10px] font-bold text-slate-300 uppercase py-8 w-full">{zone==='hidden'?'No hidden components':'Drop components here'}</div> :
          config[zone].map(id=> <div key={id} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.stopPropagation(); handleDrop(zone, id, e);}}><Card compId={id} /></div>)
        }
      </div>
    </section>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 text-slate-700 font-sans text-sm antialiased">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3"><h1 className="text-sm font-black tracking-tight">Layout Editor</h1><span className="text-[10px] font-bold text-slate-400 hidden sm:inline">{doctor?.name}</span></div>
          <div className="flex items-center gap-2">
            <span id="save-status" className="text-[10px] font-bold text-slate-400 hidden">Saved</span>
            <button onClick={saveConfig} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase shadow-sm">Save Layout</button>
            <a href={`/prescription/${doctor?._id}`} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase">Launch EHR</a>
          </div>
        </div>
        <main className="flex-1 p-4 lg:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Zone zone="left" title="Left" color="text-blue-600 bg-blue-50" />
            <Zone zone="right" title="Right" color="text-emerald-600 bg-emerald-50" />
            <Zone zone="hidden" title="Hidden" color="text-slate-500 bg-slate-100" />
          </div>
        </main>
      </div>
    </div>
  );
}
