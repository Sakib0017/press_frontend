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

  if (typeof raw === 'object') {
    return raw._id || raw.id || null;
  }

  return String(raw);
}

function getSavedLayout(doctorId) {
  if (!doctorId) return DEFAULT_LAYOUT;

  try {
    const saved = localStorage.getItem(`ehr_layout_v2_${doctorId}`);

    if (!saved) return DEFAULT_LAYOUT;

    const parsed = JSON.parse(saved);

    if (!parsed?.left || !parsed?.right) {
      return DEFAULT_LAYOUT;
    }

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
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
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

        // Give React time to render the prescription before printing.
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

  const doctor = prescription?.doctor || prescription?.doctor_id || {};
  const clinical = prescription?.clinical_data || {};
  const medications = Array.isArray(prescription?.medications)
    ? prescription.medications
    : [];

  const createdAt = useMemo(() => {
    return prescription?.created_at
      ? new Date(prescription.created_at)
      : new Date();
  }, [prescription?.created_at]);

  const prescriptionId = String(
    prescription?._id || id || ''
  )
    .slice(-6)
    .toUpperCase();

  const date = formatDate(createdAt);
  const time = formatTime(createdAt);

  const hiddenSections = layout.hidden || [];

  const leftSections = (layout.left || []).filter(
    (section) => !hiddenSections.includes(section)
  );

  const rightSections = (layout.right || []).filter(
    (section) => !hiddenSections.includes(section)
  );

  const hasClinicalContent = (key) => {
    const value = clinical?.[key];

    return Array.isArray(value)
      ? value.length > 0
      : Boolean(value);
  };

  const renderMedication = () => {
    return (
      <section className="prescription-section medication-section">
        <div className="section-heading">
          <span className="rx-symbol">℞</span>
          <span>Medication</span>
        </div>

        {medications.length === 0 ? (
          <div className="empty-medication">
            No medication prescribed
          </div>
        ) : (
          <div className="medicine-list">
            {medications.map((medicine, index) => (
              <div className="medicine-row" key={medicine._id || index}>
                <div className="medicine-number">
                  {index + 1}
                </div>

                <div className="medicine-main">
                  <div className="medicine-name">
                    {medicine.name || 'Medicine'}
                  </div>

                  {medicine.instruction && (
                    <div className="medicine-instruction">
                      {medicine.instruction}
                    </div>
                  )}
                </div>

                <div className="medicine-dose">
                  <span className="mobile-label">Dose</span>
                  {medicine.dose || '—'}
                </div>

                <div className="medicine-duration">
                  <span className="mobile-label">Duration</span>
                  {medicine.duration || '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderSection = (key) => {
    if (key === 'rx') {
      return renderMedication();
    }

    if (!hasClinicalContent(key)) {
      return null;
    }

    let values = clinical[key];

    if (!Array.isArray(values)) {
      values = [values];
    }

    return (
      <section
        className="prescription-section"
        key={key}
      >
        <div className="section-heading">
          <span>{SECTION_TITLES[key]}</span>
        </div>

        <ul className="clinical-list">
          {values.map((value, index) => (
            <li key={index}>
              <span className="bullet" />
              <span>{value}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  if (loading && !prescription) {
    return (
      <div className="print-loading">
        Loading prescription…
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="print-error">
        <h2>Prescription not found</h2>
        <button onClick={() => window.history.back()}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          min-height: 100%;
        }

        body {
          background: #f3f4f6;
          color: #111827;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .print-loading,
        .print-error {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 16px;
          background: #fff;
          color: #6b7280;
          font-size: 13px;
        }

        .print-error h2 {
          margin: 0;
          color: #111827;
          font-size: 18px;
        }

        .print-error button {
          border: 1px solid #d1d5db;
          background: white;
          padding: 9px 18px;
          border-radius: 7px;
          cursor: pointer;
        }

        .print-wrapper {
          min-height: 100vh;
          padding: 24px;
        }

        .prescription-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 8px 35px rgba(15, 23, 42, 0.07);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .prescription-header {
          padding: 26px 30px 18px;
        }

        .doctor-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
        }

        .doctor-left {
          min-width: 0;
        }

        .doctor-name {
          margin: 0;
          color: #111827;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 700;
        }

        .doctor-specialization {
          margin-top: 4px;
          color: #4b5563;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .doctor-details {
          margin-top: 9px;
          color: #6b7280;
          font-size: 10px;
          line-height: 1.55;
        }

        .doctor-details strong {
          color: #374151;
          font-weight: 600;
        }

        .doctor-right {
          min-width: 170px;
          text-align: right;
          color: #4b5563;
          font-size: 10px;
          line-height: 1.5;
        }

        .doctor-name-bangla {
          color: #111827;
          font-size: 14px;
          font-weight: 700;
        }

        .chamber-label {
          margin-top: 8px;
          color: #9ca3af;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .header-divider {
          height: 1px;
          margin-top: 17px;
          background: #d1d5db;
        }

        .prescription-meta {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-top: 8px;
          color: #9ca3af;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .patient-box {
          margin: 0 30px;
          padding: 11px 13px;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fafafa;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .patient-main {
          min-width: 0;
        }

        .patient-name {
          color: #111827;
          font-size: 13px;
          font-weight: 700;
        }

        .patient-details {
          margin-top: 3px;
          color: #6b7280;
          font-size: 10px;
        }

        .patient-address {
          max-width: 280px;
          color: #6b7280;
          font-size: 9px;
          text-align: right;
        }

        .prescription-body {
          flex: 1;
          padding: 25px 30px 20px;
        }

        .prescription-columns {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }

        .prescription-column {
          min-width: 0;
        }

        .prescription-column.left {
          padding-right: 24px;
        }

        .prescription-column.right {
          padding-left: 24px;
          border-left: 1px solid #e5e7eb;
        }

        .prescription-section {
          margin-bottom: 22px;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .section-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #111827;
          font-size: 9px;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .section-heading::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #e5e7eb;
        }

        .clinical-list {
          list-style: none;
          padding: 0;
          margin: 9px 0 0;
        }

        .clinical-list li {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          color: #374151;
          font-size: 11px;
          line-height: 1.55;
          margin-bottom: 4px;
          overflow-wrap: anywhere;
        }

        .bullet {
          width: 4px;
          height: 4px;
          min-width: 4px;
          margin-top: 6px;
          border-radius: 50%;
          background: #6b7280;
        }

        .rx-symbol {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 25px;
          line-height: 16px;
          text-transform: none;
          letter-spacing: 0;
        }

        .medicine-list {
          margin-top: 9px;
          border-top: 1px solid #111827;
        }

        .medicine-row {
          display: grid;
          grid-template-columns: 22px minmax(0, 1fr) 68px 68px;
          gap: 8px;
          align-items: start;
          padding: 9px 0;
          border-bottom: 1px solid #e5e7eb;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .medicine-number {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d1d5db;
          border-radius: 50%;
          color: #4b5563;
          font-size: 8px;
          font-weight: 700;
        }

        .medicine-main {
          min-width: 0;
        }

        .medicine-name {
          color: #111827;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .medicine-instruction {
          margin-top: 2px;
          color: #6b7280;
          font-size: 9px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .medicine-dose,
        .medicine-duration {
          color: #374151;
          font-size: 9px;
          line-height: 1.4;
          text-align: center;
          overflow-wrap: anywhere;
        }

        .mobile-label {
          display: none;
        }

        .empty-medication {
          margin-top: 9px;
          padding: 12px;
          border: 1px dashed #d1d5db;
          border-radius: 6px;
          color: #9ca3af;
          text-align: center;
          font-size: 9px;
        }

        .prescription-footer {
          margin-top: 25px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .footer-note {
          max-width: 390px;
          color: #6b7280;
          font-size: 9px;
          line-height: 1.5;
        }

        .footer-note strong {
          color: #374151;
        }

        .signature {
          width: 155px;
          text-align: center;
        }

        .signature-line {
          height: 32px;
          border-bottom: 1px solid #111827;
          margin-bottom: 5px;
        }

        .signature-name {
          color: #111827;
          font-size: 10px;
          font-weight: 700;
        }

        .signature-specialization {
          margin-top: 2px;
          color: #6b7280;
          font-size: 8px;
        }

        .bottom-meta {
          margin-top: 14px;
          padding-top: 8px;
          border-top: 1px dashed #d1d5db;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #9ca3af;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .print-actions {
          width: 210mm;
          margin: 15px auto 0;
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .print-button,
        .back-button {
          border: 0;
          border-radius: 7px;
          padding: 10px 22px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .print-button {
          background: #111827;
          color: #fff;
        }

        .back-button {
          background: #fff;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        @media (max-width: 900px) {
          .print-wrapper {
            padding: 0;
          }

          .prescription-page {
            width: 100%;
            min-height: 100vh;
            border: 0;
            border-radius: 0;
            box-shadow: none;
          }

          .prescription-header {
            padding: 20px 18px 15px;
          }

          .patient-box {
            margin: 0 18px;
          }

          .prescription-body {
            padding: 20px 18px;
          }

          .print-actions {
            width: 100%;
            margin: 0;
            padding: 12px;
            background: #fff;
            border-top: 1px solid #e5e7eb;
            position: sticky;
            bottom: 0;
          }
        }

        @media (max-width: 650px) {
          .doctor-header {
            gap: 12px;
          }

          .doctor-name {
            font-size: 20px;
          }

          .doctor-right {
            display: none;
          }

          .prescription-meta {
            flex-direction: column;
            gap: 3px;
          }

          .patient-box {
            align-items: flex-start;
            flex-direction: column;
            gap: 3px;
          }

          .patient-address {
            max-width: 100%;
            text-align: left;
          }

          .prescription-columns {
            grid-template-columns: 1fr;
          }

          .prescription-column.left,
          .prescription-column.right {
            padding: 0;
            border-left: 0;
          }

          .prescription-column.right {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #e5e7eb;
          }

          .prescription-section {
            margin-bottom: 20px;
          }

          .medicine-row {
            grid-template-columns: 20px minmax(0, 1fr);
            gap: 8px;
          }

          .medicine-dose,
          .medicine-duration {
            grid-column: 2;
            display: inline-flex;
            width: fit-content;
            margin-top: -3px;
            margin-right: 5px;
            padding: 3px 6px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            font-size: 8px;
          }

          .mobile-label {
            display: inline;
            margin-right: 4px;
            color: #9ca3af;
            font-weight: 700;
          }

          .prescription-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .footer-note {
            max-width: 100%;
          }

          .signature {
            margin-left: auto;
          }

          .bottom-meta {
            flex-direction: column;
          }
        }

        @media print {
          html,
          body {
            width: 210mm;
            min-height: 297mm;
            background: #fff !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-wrapper {
            padding: 0 !important;
            min-height: 0 !important;
            background: #fff !important;
          }

          .prescription-page {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          .prescription-header {
            padding: 10mm 13mm 6mm !important;
          }

          .patient-box {
            margin: 0 13mm !important;
          }

          .prescription-body {
            padding: 7mm 13mm 7mm !important;
          }

          .print-actions {
            display: none !important;
          }

          .prescription-section,
          .medicine-row,
          .prescription-footer {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .prescription-columns {
            align-items: start;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      <main className="print-wrapper">
        <article className="prescription-page">
          {/* HEADER */}
          <header className="prescription-header">
            <div className="doctor-header">
              <div className="doctor-left">
                <h1 className="doctor-name">
                  {doctor.name || 'Dr. Name'}
                </h1>

                {(doctor.usr_spec || doctor.specialization) && (
                  <div className="doctor-specialization">
                    {doctor.usr_spec || doctor.specialization}
                  </div>
                )}

                <div className="doctor-details">
                  {doctor.degree && (
                    <div>
                      <strong>{doctor.degree}</strong>
                    </div>
                  )}

                  {doctor.experiance && (
                    <div>{doctor.experiance}</div>
                  )}

                  {(doctor.phone || doctor.license_number) && (
                    <div>
                      {doctor.phone && doctor.phone}

                      {doctor.phone && doctor.license_number && ' • '}

                      {doctor.license_number &&
                        `BMDC ${doctor.license_number}`}
                    </div>
                  )}
                </div>
              </div>

              <div className="doctor-right">
                {doctor.name_ban && (
                  <div className="doctor-name-bangla">
                    {doctor.name_ban}
                  </div>
                )}

                {doctor.usr_spec_ban && (
                  <div>{doctor.usr_spec_ban}</div>
                )}

                {doctor.degree_ban && (
                  <div>{doctor.degree_ban}</div>
                )}

                <div className="chamber-label">
                  Chamber
                </div>

                <div>
                  Popular Diagnostic Centre
                </div>

                <div>
                  Sat – Thu&nbsp;&nbsp;5:00 PM – 9:00 PM
                </div>
              </div>
            </div>

            <div className="header-divider" />

            <div className="prescription-meta">
              <span>
                Prescription {prescriptionId} • {date} {time}
              </span>

              <span>
                {doctor.branch && `${doctor.branch} • `}
                {doctor.bhaban && `${doctor.bhaban} • `}
                {doctor.room && `Room ${doctor.room}`}
              </span>
            </div>
          </header>

          {/* PATIENT */}
          <section className="patient-box">
            <div className="patient-main">
              <div className="patient-name">
                {prescription.patient_name || 'Patient'}
              </div>

              <div className="patient-details">
                {prescription.patient_age &&
                  `${prescription.patient_age} Yrs`}

                {prescription.patient_age &&
                  prescription.patient_gender &&
                  ' • '}

                {prescription.patient_gender}

                {(prescription.patient_gender ||
                  prescription.patient_age) &&
                  prescription.patient_mobile &&
                  ' • '}

                {prescription.patient_mobile}
              </div>
            </div>

            {prescription.patient_address && (
              <div className="patient-address">
                {prescription.patient_address}
              </div>
            )}
          </section>

          {/* BODY */}
          <div className="prescription-body">
            <div className="prescription-columns">
              {/* LEFT */}
              <div className="prescription-column left">
                {leftSections.map(renderSection)}
              </div>

              {/* RIGHT */}
              <div className="prescription-column right">
                {rightSections.map(renderSection)}
              </div>
            </div>

            {/* FOOTER */}
            <footer className="prescription-footer">
              <div className="footer-note">
                <strong>Note:</strong>{' '}
                Follow the advice and dosage exactly. Complete the
                prescribed course. Contact the chamber if any
                adverse effect occurs.
              </div>

              <div className="signature">
                <div className="signature-line" />

                <div className="signature-name">
                  {doctor.name || 'Dr. Name'}
                </div>

                <div className="signature-specialization">
                  {doctor.usr_spec || doctor.specialization || ''}
                </div>
              </div>
            </footer>

            <div className="bottom-meta">
              <span>
                ID {prescriptionId} • {date}
              </span>

              <span>
                Digitally generated prescription
              </span>
            </div>
          </div>
        </article>

        {/* ACTIONS */}
        <div className="print-actions">
          <button
            type="button"
            className="print-button"
            onClick={() => window.print()}
          >
            Print
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() => window.history.back()}
          >
            Back
          </button>
        </div>
      </main>
    </>
  );
}
