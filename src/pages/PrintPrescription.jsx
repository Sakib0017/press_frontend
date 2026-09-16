import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const SECTION_TITLES = {
  complaints: 'Chief Complaints',
  history: 'History',
  comorbidity: 'Co-Morbidity',
  allergy: 'Allergy',
  findings: 'Clinical Findings',
  physical: 'Physical Examination',
  diagnosis: 'Diagnosis',
  investigations: 'Investigations',
  procedure: 'Procedure',
  rx: 'Medication',
  advices: 'Advice',
  followup: 'Follow Up',
  referred: 'Referred To',
  bt_order: 'BT Order',
  certificate: 'Certificate',
  note: 'Note',
  admission: 'Admission',
};

const ALL_SECTIONS = Object.keys(SECTION_TITLES);

const DEFAULT_LAYOUT = {
  left: ALL_SECTIONS.filter((item) => item !== 'rx'),
  right: ['rx'],
  hidden: [],
};

function getDoctorId(prescription) {
  const raw =
    prescription?.doctor?._id ||
    prescription?.doctor_id?._id ||
    prescription?.doctor_id ||
    prescription?.doctorId;

  if (!raw) return null;
  if (typeof raw === 'object') return raw._id || raw.id || null;
  return String(raw);
}

function getSavedLayout(doctorId) {
  if (!doctorId) return DEFAULT_LAYOUT;
  try {
    const saved = localStorage.getItem(`ehr_layout_v2_${doctorId}`);
    if (!saved) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(saved);
    if (!parsed?.left || !parsed?.right) return DEFAULT_LAYOUT;
    return {
      left: Array.isArray(parsed.left) ? parsed.left : [],
      right: Array.isArray(parsed.right) ? parsed.right : [],
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export default function PrintPrescription() {
  const { id } = useParams();

  const [prescription, setPrescription] = useState(null);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPrescription() {
      try {
        const response = await api.get(`/prescriptions/${id}`);
        if (!mounted) return;

        const data = response?.data?.data;
        setPrescription(data);

        const doctorId = getDoctorId(data);
        const savedLayout = getSavedLayout(doctorId);
        setLayout(savedLayout);

        setTimeout(() => {
          window.print();
        }, 700);
      } catch (error) {
        console.error('Failed to load prescription:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPrescription();

    return () => {
      mounted = false;
    };
  }, [id]);

  const rawDoctor = prescription?.doctor || prescription?.doctor_id || {};
  
  const doctor = {
    name: rawDoctor.name || 'Ruhul Kuddus',
    usr_spec: rawDoctor.usr_spec || rawDoctor.specialization || 'Neurology',
    specialization: rawDoctor.specialization || 'Neurology',
    degree: rawDoctor.degree || 'MBBS',
    experiance: rawDoctor.experiance || rawDoctor.experience || '20',
    email: rawDoctor.email || 'ruhul@gmail.com',
    phone: rawDoctor.phone || '01911111111',
    license_number: rawDoctor.license_number || '001',
    branch: rawDoctor.branch || 'Dhanmondi',
    bhaban: rawDoctor.bhaban || '2',
    room: rawDoctor.room || '303',
    name_ban: rawDoctor.name_ban || '',
    usr_spec_ban: rawDoctor.usr_spec_ban || '',
    degree_ban: rawDoctor.degree_ban || '',
    experiance_ban: rawDoctor.experiance_ban || '',
  };

  const clinical = prescription?.clinical_data || {};
  const medications = Array.isArray(prescription?.medications)
    ? prescription.medications
    : [];

  const createdAt = useMemo(() => {
    return prescription?.created_at
      ? new Date(prescription.created_at)
      : new Date();
  }, [prescription?.created_at]);

  const prescriptionId = String(prescription?._id || id || '')
    .slice(-8)
    .toUpperCase();

  const dateStr = formatDate(createdAt);
  const timeStr = formatTime(createdAt);

  const hiddenSections = layout.hidden || [];
  const leftSections = (layout.left || []).filter(
    (section) => !hiddenSections.includes(section)
  );
  const rightSections = (layout.right || []).filter(
    (section) => !hiddenSections.includes(section)
  );

  const hasClinicalContent = (key) => {
    const value = clinical?.[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  };

  const renderMedication = () => {
    return (
      <section className="prescription-rx-section">
        <div className="rx-header flex items-center gap-3 mb-3">
          <span className="rx-badge text-2xl font-serif font-bold text-slate-900">Rx</span>
          
          
        </div>

        {medications.length === 0 ? (
          <div className="empty-rx p-4  text-slate-900 text-center text-xs">
            No medication prescribed
          </div>
        ) : (
          <div className="medicine-cards flex flex-col">
            {medications.map((medicine, index) => (
              <div className="med-card px-2.5 py-1   flex items-center justify-between  whitespace-nowrap overflow-hidden text-ellipsis" key={medicine._id || index}>
                <div className="med-name text-xs font-bold text-slate-900 flex  items-center truncate min-w-0">
                  
                  <span className="truncate">{medicine.name || 'Medicine Name'}</span>
                </div>

                <div className="flex items-center gap-2 text-[12px] font-medium text-slate-900 shrink-0">
                  {medicine.dose && (
                    <span className="font-semibold text-slate-900">{medicine.dose}</span>
                  )}

                  {medicine.duration && (
                    <span className="text-[12px] font-semibold text-slate-900  px-2 py-0.5 rounded-full">
                      {medicine.duration}
                    </span>
                  )}

                  {medicine.instruction && (
                    <span className="text-[12px] text-slate-900 italic max-w-[120px] truncate">
                      ({medicine.instruction})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderSection = (key) => {
    if (key === 'rx') return renderMedication();
    if (!hasClinicalContent(key)) return null;

    let values = clinical[key];
    if (!Array.isArray(values)) values = [values];

    return (
      <section className="clinical-card mb-4" key={key}>
        <div className="clinical-title text-[12px] font-bold tracking-wider text-slate-900 uppercase  pb-1 mb-1.5">
          {SECTION_TITLES[key]}
        </div>
        <ul className="clinical-items space-y-1 overflow-hidden">
          {values.map((value, index) => (
            <li key={index} className="text-[12px] text-slate-900 flex items-center gap-2 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="w-1.5 h-1.5 rounded-full  shrink-0"></span>
              <span className="truncate">{value}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  if (loading && !prescription) {
    return <div className="print-loading min-h-screen flex items-center justify-center text-slate-900 text-xs">Loading prescription…</div>;
  }

  if (!prescription) {
    return (
      <div className="print-error min-h-screen flex flex-col items-center justify-center gap-3">
        <h2 className="text-base font-bold text-slate-900">Prescription not found</h2>
        <button className="px-4 py-2 border rounded-md text-xs font-semibold" onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        
        body {
          margin: 0;
          background-color: #f8fafc;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .prescription-wrapper {
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .prescription-sheet {
          width: 210mm;
          min-height: 297mm;
          background: #ffffff;
          padding: 12mm 14mm;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .header-container {
          border-bottom: 2px solid #0f172a;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }

        .doctor-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .doc-english-name {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .doc-bangla-name {
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
          text-align: right;
        }

        .doc-subtitle {
          font-size: 11px;
          font-weight: 600;
          color: #334155;
          margin-top: 1px;
        }

        .doc-detail-text {
          font-size: 10.5px;
          color: #050b14;
          line-height: 1.4;
        }

        .chamber-bar {
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed #cbd5e1;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #475569;
          font-weight: 500;
        }

        .patient-card {
          border-bottom: 2px solid #0f172a;
          padding: 10px 14px;
          margin-bottom: 16px;
        }

        .patient-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1.2fr 0.8fr;
          gap: 8px 12px;
          font-size: 11px;
        }

        .patient-label {
          color: #05090f;
          font-size: 9.5px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
          display: block;
        }

        .patient-value {
          color: #0f172a;
          font-weight: 600;
        }

        .prescription-body-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 72mm 1fr;
          gap: 0;
        }

        .left-clinical-col {
          border-right: 1px solid #e2e8f0;
          padding-right: 16px;
        }

        .right-rx-col {
          padding-left: 18px;
        }

        .prescription-footer-bar {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #cbd5e1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          color: #94a3b8;
          font-weight: 600;
        }

        .action-bar {
          margin-top: 20px;
          display: flex;
          gap: 12px;
        }

        .btn-print {
          background: #0f172a;
          color: #ffffff;
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: none;
        }

        .btn-back {
          background: #ffffff;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        @media print {
          body { background: #ffffff !important; }
          .prescription-wrapper { padding: 0 !important; }
          .prescription-sheet {
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 10mm 12mm !important;
          }
          .action-bar { display: none !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      <main className="prescription-wrapper">
        <article className="prescription-sheet">
          <div>
            {/* HEADER */}
            <header className="header-container">
              <div className="doctor-grid">
                <div>
                  <div className="doc-english-name">Dr. {doctor.name}</div>
                  <div className="doc-subtitle">{doctor.degree}</div>
                  <div className="doc-detail-text">{doctor.usr_spec}</div>
                  <div className="doc-detail-text">Experience: {doctor.experiance} Years</div>
                  {doctor.license_number && (
                    <div className="doc-detail-text">BMDC Reg: #{doctor.license_number}</div>
                  )}
                </div>

                <div className="text-right">
                  {doctor.name_ban ? (
                    <>
                      <div className="doc-bangla-name">{doctor.name_ban}</div>
                      <div className="doc-subtitle">{doctor.degree_ban}</div>
                      <div className="doc-detail-text">{doctor.usr_spec_ban}</div>
                    </>
                  ) : (
                    <>
                      <div className="doc-bangla-name">ডাঃ {doctor.name}</div>
                      <div className="doc-subtitle">{doctor.degree}</div>
                      <div className="doc-detail-text">নিউরোলোজি (Neurology)</div>
                    </>
                  )}
                  {doctor.phone && <div className="doc-detail-text">মোবাইল: {doctor.phone}</div>}
                </div>
              </div>

              <div className="chamber-bar">
                <div>
                  <span className="font-bold text-slate-900">Chamber:</span> Popular Diagnostic Centre ({doctor.branch})
                </div>
                <div>
                  <span>Bhaban: {doctor.bhaban}</span> &bull; <span>Room: {doctor.room}</span>
                </div>
              </div>
            </header>

            {/* PATIENT INFO CARD */}
            <section className="patient-card">
              <div className="patient-grid">
                <div>
                  <span className="patient-label">Patient Name</span>
                  <span className="patient-value">{prescription.patient_name || 'Ms. Shirin'}</span>
                </div>
                <div>
                  <span className="patient-label">Age / Gender</span>
                  <span className="patient-value">
                    {prescription.patient_age || '38Y'} / {prescription.patient_gender || 'Female'}
                  </span>
                </div>
                <div>
                  <span className="patient-label">Patient ID</span>
                  <span className="patient-value font-mono">{prescription.patient_id || 'RDHN26081700002'}</span>
                </div>
                <div>
                  <span className="patient-label">Date</span>
                  <span className="patient-value">{dateStr}</span>
                </div>
              </div>
            </section>

            {/* MAIN PRESCRIPTION BODY */}
            <div className="prescription-body-grid">
              <div className="left-clinical-col">
                {leftSections.map(renderSection)}
              </div>

              <div className="right-rx-col">
                {rightSections.map(renderSection)}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="prescription-footer-bar">
            <div>Printed: {dateStr} {timeStr}</div>
            <div>Prescription ID: #{prescriptionId}</div>
            <div>Powered by eGeneration PLC</div>
          </footer>
        </article>

        <div className="action-bar">
          <button type="button" className="btn-print" onClick={() => window.print()}>
            Print Prescription
          </button>
          <button type="button" className="btn-back" onClick={() => window.history.back()}>
            Back
          </button>
        </div>
      </main>
    </>
  );
}