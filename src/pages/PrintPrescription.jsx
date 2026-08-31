import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

export default function PrintPrescription(){
  const { id } = useParams();
  const [data,setData]=useState(null);
  useEffect(()=>{
    api.get(`/prescriptions/${id}`).then(({data})=>{
      const p=data.data;
      setData(p);
      setTimeout(()=>window.print(), 600);
    });
  },[id]);
  if(!data) return <div className="p-10 text-center">Loading...</div>;
  const pres = data;
  const doctor = pres.doctor || pres.doctor_id || {};
  const clinical = pres.clinical_data || {};
  const medications = pres.medications || [];
  const sectionTitles = { complaints:'Chief Complaints', history:'History', comorbidity:'Co-Morbidity', allergy:'Allergy', findings:'Clinical Findings', physical:'Physical Examination', diagnosis:'Diagnosis', investigations:'Investigations', procedure:'Procedure', advices:'Medical Advices', followup:'Follow-up', referred:'Referred To', bt_order:'BT Order', certificate:'Medical Certificate', note:'Prescription Note', admission:'Admission Request' };
  const leftSections = ['complaints','history','comorbidity','allergy','findings','physical','diagnosis','investigations','procedure','advices','followup','referred','bt_order','certificate','note','admission'];
  const prescription_datetime = new Date(pres.created_at).toLocaleString();
  return (
    <div style={{ background:'#f3f4f6', minHeight:'100vh', padding:'15px'}}>
      <style>{`@media print { .no-print{ display:none } .page{ margin:0; box-shadow:none; width:auto; } }`}</style>
      <div className="page" style={{ width:'210mm', minHeight:'297mm', margin:'15px auto', background:'#fff', padding:'15mm', boxSizing:'border-box' }}>
        <table style={{width:'100%', borderBottom:'1px solid #e2e8f0', paddingBottom:'6px', marginBottom:'8px'}}>
          <tbody><tr>
            <td style={{verticalAlign:'top'}}>
              <div style={{fontSize:'18px', fontWeight:800}}>{doctor.name}</div>
              <div style={{fontSize:'13px', fontWeight:600}}>{doctor.usr_spec||doctor.specialization}</div>
              <div style={{fontSize:'12px', marginTop:'3px', width:'50%'}}><div>{doctor.degree}</div>{doctor.experiance && <div>{doctor.experiance}</div>}</div>
            </td>
            <td style={{verticalAlign:'top', textAlign:'right', width:'180px'}}>
              <div style={{fontSize:'13px'}}>{doctor.name_ban && <div style={{fontWeight:700, fontSize:'14px'}}>{doctor.name_ban}</div>}{doctor.usr_spec_ban && <div style={{fontSize:'12px'}}>{doctor.usr_spec_ban}</div>}</div>
            </td>
          </tr></tbody>
        </table>
        <table style={{width:'100%', marginBottom:'8px', fontSize:'12px'}}><tbody><tr><td style={{width:'50%'}}><strong>Prescription:</strong> {prescription_datetime}</td><td style={{width:'50%', textAlign:'right'}}><strong>Chamber:</strong> Sat - Thu 5:00 PM - 9:00 PM</td></tr></tbody></table>
        <div style={{border:'1px solid #e2e8f0', padding:'8px 14px', marginBottom:'12px'}}>
          <div style={{fontSize:'14px', display:'flex', gap:'24px'}}>
            <span><strong>Patient:</strong> {pres.patient_name}</span>
            <span><strong>Age:</strong> {pres.patient_age} yrs</span>
            <span><strong>Sex:</strong> {pres.patient_gender}</span>
            <span><strong>Mobile:</strong> {pres.patient_mobile}</span>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'33% 67%', gap:'20px', marginTop:'20px'}}>
          <div style={{borderRight:'1px solid #e5e7eb', paddingRight:'20px'}}>
            {leftSections.map(key=> {
              if(!clinical[key] || clinical[key].length===0) return null;
              return <div key={key} style={{marginBottom:'8px'}}><div style={{fontSize:'13px', fontWeight:800, textTransform:'uppercase'}}>{sectionTitles[key]}</div><div style={{fontSize:'14px'}}>{clinical[key].join(', ')}</div></div>;
            })}
          </div>
          <div>
            <div style={{fontSize:'20px', fontWeight:900, fontStyle:'italic', marginBottom:'4px'}}>R<sub style={{fontSize:'14px'}}>x</sub></div>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead><tr><th style={{textAlign:'left', padding:'3px 6px', fontSize:'13px', fontWeight:800, textTransform:'uppercase'}}>Medicine</th><th style={{textAlign:'left', padding:'3px 6px', fontSize:'13px', fontWeight:800}}>Dose</th><th style={{textAlign:'left', padding:'3px 6px', fontSize:'13px', fontWeight:800}}>Duration</th></tr></thead>
              <tbody>
                {medications.length ? medications.map((med, i)=>(
                  <tr key={i}><td style={{padding:'5px 6px'}}><div style={{fontWeight:700}}>{med.name}</div>{med.instruction && <div style={{fontSize:'13px', fontStyle:'italic'}}>{med.instruction}</div>}</td><td style={{padding:'5px 6px', fontWeight:600}}>{med.dose}</td><td style={{padding:'5px 6px'}}>{med.duration}</td></tr>
                )): <tr><td colSpan="3" style={{textAlign:'center', padding:'20px', fontStyle:'italic'}}>No medications prescribed.</td></tr>}
              </tbody>
            </table>
            <div style={{marginTop:'24px', textAlign:'right'}}><div style={{display:'inline-block', width:'180px', textAlign:'center'}}><div style={{borderTop:'1.5px solid #94a3b8', marginTop:'20px'}}></div><div style={{fontWeight:700, fontSize:'14px'}}>{doctor.name}</div><div style={{fontSize:'13px'}}>{doctor.usr_spec}</div></div></div>
          </div>
        </div>
        <div className="no-print" style={{marginTop:'20px', textAlign:'center'}}><button onClick={()=>window.print()} className="px-6 py-2 bg-blue-600 text-white rounded">Print</button></div>
      </div>
    </div>
  );
}
