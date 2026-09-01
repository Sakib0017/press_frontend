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
const defaultConfig = { left: ['complaints','history','comorbidity','allergy','findings','physical','diagnosis','investigations','procedure','advices','followup','referred','bt_order','certificate','note','admission'], right:['rx'], hidden:[], zoneOrder: ['left','right','hidden'] };

const ZONE_META = {
  left:   { title: 'Left',   color: 'text-blue-600 bg-blue-50',   dot:'bg-blue-500' },
  right:  { title: 'Right',  color: 'text-emerald-600 bg-emerald-50', dot:'bg-emerald-500' },
  hidden: { title: 'Hidden', color: 'text-slate-500 bg-slate-100', dot:'bg-slate-400' },
};

export default function Setup(){
  const { doctor } = useAuth();
  const STORAGE_KEY = `ehr_layout_v2_${doctor?._id}`;
  const [config, setConfig] = useState(()=>{
    try{
      const s=JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(s && s.left && s.right){
        // ensure zoneOrder exists for old saves
        if(!s.zoneOrder) s.zoneOrder = ['left','right','hidden'];
        // keep backward compat: hidden may be missing
        if(!s.hidden) s.hidden = [];
        return s;
      }
    }catch{}
    return JSON.parse(JSON.stringify(defaultConfig));
  });
  const [dragId, setDragId] = useState(null);
  const [draggedZone, setDraggedZone] = useState(null);
  const [zoneDragOver, setZoneDragOver] = useState(null);
  const [cardDragOver, setCardDragOver] = useState(null);

  // keep zoneOrder in sync if config was migrated
  const zoneOrder = config.zoneOrder || ['left','right','hidden'];

  const saveConfig = ()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    const el=document.getElementById('save-status'); if(el){ el.classList.remove('hidden'); el.textContent='Saved!'; setTimeout(()=>el.classList.add('hidden'),2000); }
  };

  const resetConfig = ()=>{
    if(!confirm('Reset layout to default?')) return;
    setConfig(JSON.parse(JSON.stringify(defaultConfig)));
  };

  // ---- component drag ----
  const handleDrop = (targetZone, targetId=null, e)=>{
    e.preventDefault(); e.stopPropagation();
    // ignore if this was a zone drag
    if(e.dataTransfer.types.includes('application/x-zone')) return;
    const draggedId = e.dataTransfer.getData('text/plain') || dragId;
    if(!draggedId) return;
    const newCfg = { left:[...config.left], right:[...config.right], hidden:[...config.hidden], zoneOrder:[...zoneOrder] };
    ['left','right','hidden'].forEach(z=> newCfg[z]=newCfg[z].filter(i=>i!==draggedId));
    if(draggedId==='rx' && targetZone!=='right') targetZone='right';
    if(targetId && targetId!==draggedId){
      const idx=newCfg[targetZone].indexOf(targetId);
      if(idx!==-1) newCfg[targetZone].splice(idx,0,draggedId); else newCfg[targetZone].push(draggedId);
    } else newCfg[targetZone].push(draggedId);
    setConfig(newCfg);
    setCardDragOver(null);
  };
  const handleDropZone = (targetZone,e)=>{
    e.preventDefault();
    if(e.dataTransfer.types.includes('application/x-zone')) return;
    const draggedId = e.dataTransfer.getData('text/plain') || dragId;
    if(!draggedId) return;
    const newCfg={ left:[...config.left], right:[...config.right], hidden:[...config.hidden], zoneOrder:[...zoneOrder]};
    ['left','right','hidden'].forEach(z=> newCfg[z]=newCfg[z].filter(i=>i!==draggedId));
    let tz=targetZone; if(draggedId==='rx' && tz!=='right') tz='right';
    newCfg[tz].push(draggedId); setConfig(newCfg);
    setCardDragOver(null);
  };

  // ---- container order is now FIXED left/right/hidden for prescription left/right fix ----
  // keep legacy zoneOrder in storage for backward compat but do not use for visual order
  const handleZoneDragStart = ()=>{};
  const handleZoneDragEnd = ()=>{};
  const handleZoneDragOver = (e)=>{ e.preventDefault(); };
  const handleZoneDropContainer = (e)=>{ e.preventDefault(); };

  // reload when doctor changes (fixes visiting Setup after Dashboard)
  useEffect(()=>{
    if(!doctor?._id) return;
    try{
      const s=JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(s && s.left && s.right){
        if(!s.zoneOrder) s.zoneOrder=['left','right','hidden'];
        if(!s.hidden) s.hidden=[];
        setConfig(s);
      }
    }catch{}
  }, [doctor?._id]);

  useEffect(()=>{ /* persist on change optionally */ }, [config]);

  const Card = ({compId, zone})=>{
    const isRx=compId==='rx';
    const name=allComponents.find(c=>c.id===compId)?.name||compId;
    const isDragging = dragId===compId;
    const isOver = cardDragOver===compId;
    return (
      <div
        draggable={!isRx}
        onDragStart={e=>{ e.dataTransfer.setData('text/plain',compId); e.dataTransfer.effectAllowed='move'; setDragId(compId); e.stopPropagation(); }}
        onDragEnd={()=>{ setDragId(null); setCardDragOver(null); }}
        onDragOver={e=>{ e.preventDefault(); if(dragId && dragId!==compId) setCardDragOver(compId); }}
        onDragLeave={()=> setCardDragOver(null)}
        onDrop={e=>handleDrop(zone, compId, e)}
        className={`group bg-white border rounded-lg inline-flex items-center gap-1.5 px-2 py-1.5 cursor-grab active:cursor-grabbing select-none transition-all
          ${isRx?'border-emerald-300 bg-emerald-50/40 cursor-not-allowed':'border-slate-200 hover:border-slate-300 hover:shadow-sm hover:-translate-y-[1px]'}
          ${isDragging?'opacity-40 scale-95 ring-2 ring-blue-300':''}
          ${isOver?'ring-2 ring-blue-400 -translate-y-0.5':''}
        `}>
        {!isRx && <span className="text-slate-300 group-hover:text-slate-400 cursor-grab text-[10px] leading-none">⋮⋮</span>}
        <h3 className="text-[9px] font-black uppercase whitespace-nowrap tracking-wider">{name}{isRx && <span className="ml-1.5 text-[6px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-black">Fixed</span>}</h3>
      </div>
    );
  };

  const Zone = ({zone})=>{
    const meta = ZONE_META[zone];
    return (
      <section className="flex flex-col rounded-xl">
        {/* Fixed header - no container drag, keep left always left and right always right */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border shadow-sm mb-2 select-none">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${meta.dot}`}></span>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700">{meta.title}</h2>
            <span className="hidden sm:inline text-[10px] font-bold text-slate-300">— {zone==='left'?'Left side of prescription': zone==='right'?'Right side of prescription':'Hidden'}</span>
          </div>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${meta.color}`}>{config[zone].length}</span>
        </div>

        {/* Drop area for components */}
        <div
          onDragOver={e=>{
            e.preventDefault();
            // highlight if dragging a card over this zone
            if(dragId && !e.dataTransfer.types.includes('application/x-zone')) e.currentTarget.classList.add('border-blue-300','bg-blue-50/30');
          }}
          onDragLeave={e=> e.currentTarget.classList.remove('border-blue-300','bg-blue-50/30')}
          onDrop={e=>{ e.currentTarget.classList.remove('border-blue-300','bg-blue-50/30'); handleDropZone(zone,e); }}
          className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-2.5 flex flex-wrap gap-1.5 min-h-[140px] content-start transition-colors hover:border-slate-300"
        >
          {config[zone].length===0 ? (
            <div className="flex flex-col items-center justify-center gap-1 text-center py-8 w-full pointer-events-none">
              <span className="text-xl opacity-20">⬇</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{zone==='hidden'?'No hidden components':'Drop components here'}</span>
              <span className="text-[9px] text-slate-300">Drag pills from other containers</span>
            </div>
          ) : (
            config[zone].map(id=> (
              <Card key={id} compId={id} zone={zone} />
            ))
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 text-slate-700 font-sans text-sm antialiased">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <Header />
        <div className="bg-white border-b px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0"><h1 className="text-sm font-black tracking-tight shrink-0">Layout Editor</h1><span className="text-[10px] font-bold text-slate-400 truncate hidden sm:inline">{doctor?.name}</span></div>
          <div className="flex items-center gap-2 shrink-0">
            <span id="save-status" className="text-[10px] font-bold text-emerald-600 hidden">Saved</span>
            <button onClick={saveConfig} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2 rounded-xl sm:rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase shadow-sm hover:bg-blue-700">Save Layout</button>
            <a href={`/prescription/${doctor?._id}`} className="flex-1 sm:flex-none text-center px-3 sm:px-4 py-2 sm:py-2 rounded-xl sm:rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase hover:bg-black">Launch EHR</a>
          </div>
        </div>
        <main className="flex-1 p-3 sm:p-4 lg:p-5 overflow-y-auto pb-20 md:pb-5">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mb-3 text-center leading-relaxed px-2">Left container → left side of prescription &nbsp;•&nbsp; Right container → right side &nbsp;•&nbsp; Drag pills <span className="inline-flex items-center gap-1 bg-white border px-1.5 py-0.5 rounded text-[10px]">⋮⋮</span> between containers</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <Zone zone="left" />
            <Zone zone="right" />
            <Zone zone="hidden" />
          </div>
          <div className="mt-6 flex justify-center">
            <button onClick={resetConfig} className="px-6 py-3 sm:py-2 rounded-xl sm:rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase hover:bg-slate-50">Reset to Default Layout</button>
          </div>
        </main>
      </div>
    </div>
  );
}
