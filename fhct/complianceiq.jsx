import { useState, useEffect, useRef, Fragment } from "react";

// ── Fonts ──────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;500&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// ── Course Data ────────────────────────────────────────────────────────────
const ELEVEN_LABS_KEY = "sk_9314d656a8c7c46862624e2bbca4c7bfb66c8d93c7f31240";
const HEYGEN_API_KEY = "PASTE_HEYGEN_API_KEY_HERE";
const LUMA_API_KEY = "PASTE_LUMA_API_KEY_HERE";
const OPENAI_API_KEY = "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";

const COURSES = [
  // Federal - All Staff
  { id: 1, title: "HIPAA Privacy & Security Fundamentals", category: "Federal", role: "All Staff", freq: "Annual", duration: 45, citation: "45 CFR Parts 160 & 164", languages: ["EN", "ES"], surveyed: true, rating: 4.2, completionRate: 87, quizFailRate: 18 },
  { id: 2, title: "OSHA Bloodborne Pathogens", category: "Federal", role: "All Staff", freq: "Annual", duration: 30, citation: "29 CFR 1910.1030", languages: ["EN", "ES"], surveyed: true, rating: 4.5, completionRate: 92, quizFailRate: 12 },
  { id: 3, title: "OSHA Hazard Communication / HazCom", category: "Federal", role: "All Staff", freq: "Annual", duration: 25, citation: "29 CFR 1910.1200", languages: ["EN", "ES"], surveyed: true, rating: 3.8, completionRate: 84, quizFailRate: 24 },
  { id: 4, title: "Fraud, Waste & Abuse (FWA)", category: "Federal", role: "All Staff", freq: "Annual", duration: 40, citation: "42 CFR §422.503(b)", languages: ["EN", "ES"], surveyed: true, rating: 3.9, completionRate: 89, quizFailRate: 21 },
  { id: 5, title: "Corporate Compliance & False Claims Act", category: "Federal", role: "All Staff", freq: "Annual", duration: 35, citation: "31 U.S.C. §§ 3729-3733", languages: ["EN", "ES"], surveyed: true, rating: 4.1, completionRate: 86, quizFailRate: 19 },
  { id: 6, title: "Anti-Kickback Statute & Stark Law", category: "Federal", role: "Clinical", freq: "Annual", duration: 35, citation: "42 U.S.C. § 1320a-7b", languages: ["EN", "ES"], surveyed: true, rating: 4.0, completionRate: 81, quizFailRate: 28 },
  { id: 7, title: "Emergency Preparedness", category: "Federal", role: "All Staff", freq: "Annual", duration: 50, citation: "CMS/OSHA Dual Standard", languages: ["EN", "ES"], surveyed: true, rating: 4.3, completionRate: 90, quizFailRate: 15 },
  { id: 8, title: "Infection Control & Prevention", category: "Federal", role: "All Staff", freq: "Annual", duration: 40, citation: "CDC/CMS Guidelines", languages: ["EN", "ES"], surveyed: true, rating: 4.6, completionRate: 94, quizFailRate: 10 },
  { id: 9, title: "Workplace Violence Prevention", category: "Federal", role: "All Staff", freq: "Annual", duration: 30, citation: "OSHA 3148-04R", languages: ["EN", "ES"], surveyed: false, rating: 4.2, completionRate: 88, quizFailRate: 14 },
  { id: 10, title: "Fire Safety & Life Safety", category: "Federal", role: "All Staff", freq: "Annual", duration: 25, citation: "NFPA 101 / CMS", languages: ["EN", "ES"], surveyed: true, rating: 4.0, completionRate: 91, quizFailRate: 16 },
  // Florida-Specific
  { id: 11, title: "Abuse, Neglect & Exploitation Prevention", category: "Florida", role: "All Staff", freq: "Annual", duration: 45, citation: "FL Statute 415 / AHCA", languages: ["EN", "ES"], surveyed: true, rating: 4.7, completionRate: 96, quizFailRate: 8 },
  { id: 12, title: "IRAS — Incident Reporting & Analysis System", category: "Florida", role: "All Staff", freq: "At Hire", duration: 30, citation: "AHCA Rule 59A-3", languages: ["EN", "ES"], surveyed: true, rating: 4.1, completionRate: 93, quizFailRate: 11 },
  { id: 13, title: "Medicaid Fraud Prevention — Florida", category: "Florida", role: "All Staff", freq: "Annual", duration: 40, citation: "FL Statute 409.920", languages: ["EN", "ES"], surveyed: true, rating: 3.7, completionRate: 82, quizFailRate: 31 },
  { id: 14, title: "Patient Rights & Grievance Procedures", category: "Florida", role: "All Staff", freq: "Annual", duration: 35, citation: "AHCA 59A-3.264", languages: ["EN", "ES"], surveyed: true, rating: 4.3, completionRate: 88, quizFailRate: 17 },
  { id: 15, title: "Background Screening Compliance — HB 975", category: "Florida", role: "Admin", freq: "At Hire", duration: 20, citation: "HB 975 (eff. July 1, 2025)", languages: ["EN", "ES"], surveyed: false, rating: 4.4, completionRate: 97, quizFailRate: 6 },
  { id: 16, title: "HIV/AIDS Awareness", category: "Florida", role: "Clinical", freq: "One-Time", duration: 20, citation: "FL Statute 381.0041", languages: ["EN", "ES"], surveyed: false, rating: 4.0, completionRate: 99, quizFailRate: 5 },
  // Role-Specific
  { id: 17, title: "Medical Documentation Standards", category: "Role-Specific", role: "Clinical", freq: "Annual", duration: 45, citation: "CMS Conditions of Participation", languages: ["EN", "ES"], surveyed: true, rating: 4.2, completionRate: 79, quizFailRate: 22 },
  { id: 18, title: "Medication Management & Error Reporting", category: "Role-Specific", role: "Clinical", freq: "Annual", duration: 40, citation: "AHCA / USP <800>", languages: ["EN", "ES"], surveyed: true, rating: 4.5, completionRate: 85, quizFailRate: 18 },
  { id: 19, title: "CMS Coding Accuracy & Claim Submission", category: "Role-Specific", role: "Billing", freq: "Annual", duration: 50, citation: "CMS ICD-10-CM Guidelines", languages: ["EN", "ES"], surveyed: true, rating: 3.9, completionRate: 76, quizFailRate: 33 },
  { id: 20, title: "OIG Compliance for Senior Leadership", category: "Role-Specific", role: "Leadership", freq: "Annual", duration: 60, citation: "HHS OIG GCPG", languages: ["EN", "ES"], surveyed: true, rating: 4.1, completionRate: 88, quizFailRate: 14 },
  { id: 21, title: "ER / Emergency Department Safety Protocols", category: "Role-Specific", role: "ER Staff", freq: "Annual", duration: 45, citation: "EMTALA / AHCA", languages: ["EN", "ES"], surveyed: false, rating: 4.6, completionRate: 90, quizFailRate: 9 },
  { id: 22, title: "Obstetrics Unit Compliance", category: "Role-Specific", role: "OB Staff", freq: "Annual", duration: 40, citation: "ACOG / CMS", languages: ["EN", "ES"], surveyed: false, rating: 4.4, completionRate: 87, quizFailRate: 12 },
  { id: 23, title: "Laser Safety", category: "Role-Specific", role: "Clinical", freq: "Annual", duration: 25, citation: "ANSI Z136.3", languages: ["EN", "ES"], surveyed: false, rating: 4.3, completionRate: 94, quizFailRate: 8 },
  { id: 24, title: "Radiation Safety — CT/MRI/Echo/Imaging", category: "Role-Specific", role: "Imaging", freq: "Annual", duration: 35, citation: "NRC 10 CFR / ACR", languages: ["EN", "ES"], surveyed: false, rating: 4.5, completionRate: 93, quizFailRate: 7 },
  { id: 25, title: "Chemical Hygiene & Laboratory Safety", category: "Role-Specific", role: "Lab", freq: "Annual", duration: 30, citation: "OSHA 29 CFR 1910.1450", languages: ["EN", "ES"], surveyed: false, rating: 4.2, completionRate: 89, quizFailRate: 14 },
  { id: 26, title: "Hazardous Waste — Pharma/Chemical/BioHaz", category: "Role-Specific", role: "Clinical", freq: "Annual", duration: 35, citation: "EPA RCRA / DEA", languages: ["EN", "ES"], surveyed: false, rating: 4.0, completionRate: 86, quizFailRate: 19 },
  { id: 27, title: "ALF Resident Care Standards — Florida", category: "Role-Specific", role: "ALF Staff", freq: "Annual", duration: 55, citation: "AHCA Rule 58A-5", languages: ["EN", "ES"], surveyed: true, rating: 4.8, completionRate: 95, quizFailRate: 6 },
  { id: 28, title: "Home Health Agency Compliance — AHCA", category: "Role-Specific", role: "HH Staff", freq: "Annual", duration: 50, citation: "AHCA Rule 59A-8", languages: ["EN", "ES"], surveyed: true, rating: 4.6, completionRate: 91, quizFailRate: 9 },
  { id: 29, title: "Behavioral Health — Baker Act & Marchman Act", category: "Role-Specific", role: "BH Staff", freq: "Annual", duration: 45, citation: "FL Statute 394 / 397", languages: ["EN", "ES"], surveyed: true, rating: 4.7, completionRate: 92, quizFailRate: 7 },
  { id: 30, title: "Telehealth Compliance — Florida Post-Pandemic", category: "Role-Specific", role: "Clinical", freq: "Annual", duration: 30, citation: "AHCA / FL HB 7025", languages: ["EN", "ES"], surveyed: false, rating: 4.1, completionRate: 83, quizFailRate: 20 },
  { id: 31, title: "Human Trafficking Awareness for Healthcare", category: "Florida", role: "All Staff", freq: "Biennial", duration: 60, citation: "Section 456.0341, Florida Statutes", languages: ["EN", "ES"], surveyed: true, rating: 4.8, completionRate: 92, quizFailRate: 15 },
  { id: 32, title: "Domestic Violence Awareness for Healthcare", category: "Florida", role: "Clinical", freq: "Every 3rd Renewal", duration: 120, citation: "Section 456.031, Florida Statutes", languages: ["EN", "ES"], surveyed: true, rating: 4.6, completionRate: 85, quizFailRate: 12 },
  { id: 33, title: "Alzheimer's & Related Disorders (Level I)", category: "Florida", role: "Direct Care", freq: "Annual", duration: 240, citation: "Section 429.178, Florida Statutes", languages: ["EN", "ES"], surveyed: true, rating: 4.9, completionRate: 94, quizFailRate: 8 },
  { id: 34, title: "Cybersecurity & Patient Data Protection", category: "Federal", role: "All Staff", freq: "Annual", duration: 40, citation: "HHS Health Industry Cybersecurity Practices", languages: ["EN", "ES"], surveyed: true, rating: 4.7, completionRate: 88, quizFailRate: 14 },
  { id: 35, title: "Artificial Intelligence in Medical Compliance", category: "Federal", role: "All Staff", freq: "Annual", duration: 45, citation: "HHS AI Playbook 2024", languages: ["EN", "ES"], surveyed: false, rating: 4.5, completionRate: 82, quizFailRate: 18 },
];

const DEPARTMENTS = [
  { name: "Emergency Department", compliance: 78, staff: 24, overdue: 5 },
  { name: "Nursing / Clinical", compliance: 94, staff: 87, overdue: 5 },
  { name: "Administration", compliance: 91, staff: 31, overdue: 3 },
  { name: "Billing & Coding", compliance: 72, staff: 18, overdue: 5 },
  { name: "Laboratory", compliance: 88, staff: 12, overdue: 1 },
  { name: "Imaging / Radiology", compliance: 95, staff: 9, overdue: 0 },
  { name: "Behavioral Health", compliance: 89, staff: 22, overdue: 2 },
  { name: "Home Health", compliance: 83, staff: 45, overdue: 8 },
];

const EMPLOYEES = [
  { id: 1, name: "Maria Rodriguez", dept: "Nursing / Clinical", role: "RN", type: "Employee", completed: 14, total: 16, overdue: 2, lastActivity: "2 days ago" },
  { id: 2, name: "James Thompson", dept: "Billing & Coding", role: "Billing Specialist", type: "Independent Contractor", completed: 8, total: 13, overdue: 5, lastActivity: "12 days ago" },
  { id: 3, name: "Ana Gutierrez", dept: "Emergency Department", role: "ER Nurse", type: "Employee", completed: 11, total: 15, overdue: 4, lastActivity: "5 days ago" },
  { id: 4, name: "David Chen", dept: "Administration", role: "Practice Manager", type: "Employee", completed: 16, total: 17, overdue: 1, lastActivity: "1 day ago" },
  { id: 5, name: "Sofia Martinez", dept: "Home Health", role: "HHA", type: "Agency Staff", completed: 10, total: 14, overdue: 4, lastActivity: "8 days ago" },
  { id: 6, name: "Robert Jackson", dept: "Laboratory", role: "Lab Tech", type: "Employee", completed: 12, total: 12, overdue: 0, lastActivity: "3 days ago" },
];

const ALERTS = [
  { id: 1, type: "regulation", title: "AHCA Rule 59A-3 Updated", desc: "New deficiency categories added to survey protocols. Courses 12, 14 may need revision.", date: "Mar 6, 2026", severity: "high", url: "https://ahca.myflorida.com/bulletins" },
  { id: 2, type: "course", title: "Course Health Alert: Medicaid Fraud Prevention", desc: "Quiz failure rate on Question 4 reached 31%. AI has drafted content revisions.", date: "Mar 4, 2026", severity: "medium", url: "https://flmedicaidtpl.com/" },
  { id: 3, type: "course", title: "Course Health Alert: CMS Coding Accuracy", desc: "Average rating dropped to 3.9. Employee feedback flagged 'too long' and 'outdated examples'.", date: "Mar 2, 2026", severity: "medium", url: "https://www.cms.gov/medicare/coding/icd10" },
  { id: 4, type: "regulation", title: "HHS OIG Updated Compliance Guidance", desc: "New guidance on AI use in healthcare billing. Course 20 flagged for review.", date: "Feb 28, 2026", severity: "low", url: "https://oig.hhs.gov/compliance/general-compliance-program-guidance/" },
];

const QUIZ_QUESTIONS = {
  1: [
    { q: "What does PHI stand for under HIPAA?", options: ["Personal Health Information", "Protected Health Information", "Private Healthcare Identity", "Patient Health Index"], correct: 1 },
    { q: "How long must covered entities retain HIPAA training records?", options: ["3 years", "5 years", "6 years", "10 years"], correct: 2 },
    { q: "Which rule governs electronic PHI security safeguards?", options: ["Privacy Rule", "Enforcement Rule", "Security Rule", "Breach Notification Rule"], correct: 2 },
    { q: "What is the minimum necessary standard?", options: ["Use only the minimum required PHI to accomplish the purpose", "Train at minimum once per year", "Minimum staff must be trained", "Only minimum wage staff need training"], correct: 0 },
    { q: "Who must receive HIPAA training?", options: ["Only clinical staff", "Only billing staff", "All workforce members", "Only managers"], correct: 2 },
  ],
  11: [
    { q: "Under Florida Statute 415, who is a 'vulnerable adult'?", options: ["Anyone over 60", "A person 18+ whose ability to perform self-care is impaired", "Any patient in a hospital", "Anyone receiving Medicaid"], correct: 1 },
    { q: "When must ANE be reported to DCF?", options: ["Within 72 hours", "Immediately or as soon as possible", "Within 30 days", "At the next staff meeting"], correct: 1 },
    { q: "Which Florida agency handles ANE reports for vulnerable adults?", options: ["AHCA", "DOH", "DCF", "FDLE"], correct: 2 },
    { q: "Which of these is an example of neglect?", options: ["Giving a resident extra medication", "Failing to provide adequate food or water", "Documenting a patient fall", "Updating a care plan"], correct: 1 },
    { q: "What is mandatory reporter status in Florida healthcare?", options: ["Optional reporting for licensed staff", "All healthcare workers are legally required to report suspected ANE", "Only physicians must report", "Reporting is voluntary"], correct: 1 },
  ],
  31: [
    { q: "Which Florida Statute mandates human trafficking training for specified healthcare licenses?", options: ["FL Statute 415", "FL Statute 456.0341", "FL Statute 381", "FL Statute 394"], correct: 1 },
    { q: "What is a common behavioral indicator of a human trafficking victim?", options: ["Making consistent eye contact", "Answering questions independently", "Displaying signs of being coached or scripted", "Carrying their own identification documents"], correct: 2 },
    { q: "What is the National Human Trafficking Hotline number?", options: ["1-800-962-2873", "1-888-373-7888", "911", "1-800-FLA-HELP"], correct: 1 },
    { q: "True or False: Healthcare professionals are often the first (and only) point of contact for trafficking victims.", options: ["True", "False"], correct: 0 },
    { q: "What should you do if you suspect a patient is a victim of trafficking?", options: ["Confront the suspected trafficker directly", "Follow your facility's safety protocol and offer resources confidentially", "Do nothing unless the patient explicitly asks for help", "Call the patient's family members immediately"], correct: 1 },
  ],
  32: [
    { q: "Under Florida law, how many hours of Domestic Violence CE are required for specified licensees?", options: ["1 hour", "2 hours", "3 hours", "4 hours"], correct: 1 },
    { q: "What is a 'mandatory reporter' obligation regarding domestic violence involving adults in Florida?", options: ["Mandatory reporting for all suspected cases", "Reporting is only mandatory for child abuse, elder abuse, or certain injuries like gunshots", "No reporting is ever allowed due to HIPAA", "Reporting is mandatory if the victim is over 65"], correct: 1 },
    { q: "Which of these is a common indicator of domestic abuse?", options: ["Injuries in different stages of healing", "Patient is eager to explain injuries", "Injuries are always consistent with the explanation", "Partner is very encouraging of the patient speaking alone with the doctor"], correct: 0 },
    { q: "When screening for domestic violence, you should:", options: ["Ask in front of the partner for safety", "Screen the patient privately and confidentially", "Only ask if you see visible bruises", "Ask the partner if they are being abusive"], correct: 1 },
    { q: "The 'Cycle of Violence' typically includes which phase?", options: ["The Permanent Peace phase", "The Tension Building phase", "The Argument phase", "The Legal phase"], correct: 1 },
  ],
  33: [
    { q: "Which Florida agency approves Alzheimer's training curricula for ALFs?", options: ["Department of Children and Families (DCF)", "Department of Elder Affairs (DOEA)", "Department of Health (DOH)", "Florida Board of Nursing"], correct: 1 },
    { q: "What is the primary difference between Alzheimer's and Dementia?", options: ["They are exactly the same thing", "Dementia is a symptom; Alzheimer's is a specific disease", "Alzheimer's only affects memory; Dementia affects everything", "Dementia is much more severe than Alzheimer's"], correct: 1 },
    { q: "A common 'behavioral' symptom of mid-stage Alzheimer's is:", options: ["Perfect recall of recent events", "Sundowning (increased confusion in late afternoon/evening)", "Ability to manage complex finances independently", "Improved physical coordination"], correct: 1 },
    { q: "When communicating with a resident who has dementia, you should:", options: ["Use complex, multi-step instructions", "Speak loudly and slowly", "Use short, simple sentences and maintain eye contact", "Argue with them if they are confused about the date"], correct: 2 },
    { q: "What is 'validation therapy' in dementia care?", options: ["Correcting the resident constantly", "Accepting the resident's reality and feelings rather than arguing", "Asking the resident to validate their identity daily", "Making the resident sign validation forms"], correct: 1 },
  ],
};

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #0B1628;
    --navy2: #0F1E35;
    --navy3: #162544;
    --teal: #00D4C8;
    --teal2: #00B8AD;
    --teal3: rgba(0,212,200,0.12);
    --warm: #F5F0E8;
    --warm2: #D4CBBA;
    --muted: #6B7FA3;
    --red: #FF4D6A;
    --amber: #FFB340;
    --green: #00C48C;
    --border: rgba(255,255,255,0.08);
    --font-head: 'Outfit', sans-serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }
  body { background: var(--navy); color: var(--warm); font-family: var(--font-body); }
  .app { display: flex; min-height: 100vh; }
  
  /* Sidebar */
  .sidebar {
    width: 240px; min-width: 240px; background: var(--navy2);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
  }
  .sidebar-logo { padding: 28px 24px 20px; border-bottom: 1px solid var(--border); }
  .logo-mark { font-family: var(--font-head); font-size: 20px; font-weight: 800; color: var(--warm); letter-spacing: -0.5px; }
  .logo-mark span { color: var(--teal); }
  .logo-sub { font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-top: 3px; font-family: var(--font-mono); }
  .sidebar-nav { padding: 16px 12px; flex: 1; overflow-y: auto; }
  .nav-section { font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; padding: 12px 12px 6px; font-family: var(--font-mono); }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px;
    cursor: pointer; font-size: 13.5px; color: var(--warm2); font-weight: 500;
    transition: all 0.15s; margin-bottom: 2px; border: 1px solid transparent;
  }
  .nav-item:hover { background: var(--teal3); color: var(--warm); border-color: rgba(0,212,200,0.15); }
  .nav-item.active { background: var(--teal3); color: var(--teal); border-color: rgba(0,212,200,0.25); }
  .nav-icon { width: 18px; text-align: center; font-size: 15px; }
  .sidebar-bottom { padding: 16px 12px; border-top: 1px solid var(--border); }
  .org-badge { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--navy3); border-radius: 8px; }
  .org-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, var(--teal), var(--teal2)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: var(--navy); font-family: var(--font-head); }
  .org-info { flex: 1; min-width: 0; }
  .org-name { font-size: 12px; font-weight: 600; color: var(--warm); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .org-plan { font-size: 10px; color: var(--teal); font-family: var(--font-mono); }
  
  /* Main */
  .main { margin-left: 240px; flex: 1; min-height: 100vh; }
  .topbar {
    position: sticky; top: 0; background: rgba(11,22,40,0.9); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border); padding: 0 32px; height: 60px;
    display: flex; align-items: center; justify-content: space-between; z-index: 50;
  }
  .topbar-title { font-family: var(--font-head); font-size: 18px; font-weight: 700; color: var(--warm); }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .badge-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; font-family: var(--font-mono); }
  .badge-red { background: rgba(255,77,106,0.15); color: var(--red); border: 1px solid rgba(255,77,106,0.3); }
  .badge-amber { background: rgba(255,179,64,0.15); color: var(--amber); border: 1px solid rgba(255,179,64,0.3); }
  .badge-green { background: rgba(0,196,140,0.15); color: var(--green); border: 1px solid rgba(0,196,140,0.3); }
  .badge-teal { background: var(--teal3); color: var(--teal); border: 1px solid rgba(0,212,200,0.25); }
  .badge-muted { background: rgba(107,127,163,0.15); color: var(--muted); border: 1px solid rgba(107,127,163,0.25); }
  
  .content { padding: 32px; }
  
  /* Cards */
  .card { background: var(--navy2); border: 1px solid var(--border); border-radius: 12px; }
  .card-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-family: var(--font-head); font-size: 15px; font-weight: 700; color: var(--warm); }
  .card-body { padding: 20px 24px; }
  
  /* Grid */
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; margin-bottom: 24px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-bottom: 24px; }
  
  /* Stat cards */
  .stat-card { padding: 24px; position: relative; overflow: hidden; }
  .stat-card::before { content:''; position:absolute; top:-30px; right:-30px; width:100px; height:100px; border-radius:50%; opacity:0.06; }
  .stat-card.teal::before { background: var(--teal); }
  .stat-card.red::before { background: var(--red); }
  .stat-card.amber::before { background: var(--amber); }
  .stat-card.green::before { background: var(--green); }
  .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); font-family: var(--font-mono); margin-bottom: 10px; }
  .stat-value { font-family: var(--font-head); font-size: 36px; font-weight: 800; color: var(--warm); line-height: 1; }
  .stat-value.teal { color: var(--teal); }
  .stat-value.red { color: var(--red); }
  .stat-value.amber { color: var(--amber); }
  .stat-value.green { color: var(--green); }
  .stat-sub { font-size: 12px; color: var(--muted); margin-top: 8px; }
  
  /* Progress ring */
  .ring-wrap { display: flex; align-items: center; justify-content: center; padding: 20px 0; }
  .ring-container { position: relative; width: 160px; height: 160px; }
  .ring-svg { transform: rotate(-90deg); }
  .ring-bg { fill: none; stroke: var(--navy3); stroke-width: 12; }
  .ring-fill { fill: none; stroke-width: 12; stroke-linecap: round; transition: stroke-dashoffset 1s ease; }
  .ring-fill.teal { stroke: var(--teal); }
  .ring-fill.green { stroke: var(--green); }
  .ring-fill.amber { stroke: var(--amber); }
  .ring-fill.red { stroke: var(--red); }
  .ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .ring-pct { font-family: var(--font-head); font-size: 32px; font-weight: 800; }
  .ring-lbl { font-size: 10px; color: var(--muted); font-family: var(--font-mono); letter-spacing: 1px; }
  
  /* Tables */
  .table { width: 100%; border-collapse: collapse; }
  .table th { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); font-family: var(--font-mono); padding: 10px 16px; text-align: left; border-bottom: 1px solid var(--border); }
  .table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13.5px; color: var(--warm); vertical-align: middle; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: rgba(255,255,255,0.02); }
  
  /* Progress bar */
  .prog-bar { height: 6px; background: var(--navy3); border-radius: 3px; overflow: hidden; }
  .prog-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
  .prog-fill.teal { background: var(--teal); }
  .prog-fill.red { background: var(--red); }
  .prog-fill.amber { background: var(--amber); }
  .prog-fill.green { background: var(--green); }
  
  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: var(--font-body); transition: all 0.15s; }
  .btn-primary { background: var(--teal); color: var(--navy); }
  .btn-primary:hover { background: var(--teal2); }
  .btn-outline { background: transparent; color: var(--teal); border: 1px solid rgba(0,212,200,0.4); }
  .btn-outline:hover { background: var(--teal3); }
  .btn-ghost { background: var(--navy3); color: var(--warm2); }
  .btn-ghost:hover { background: rgba(255,255,255,0.08); color: var(--warm); }
  .btn-danger { background: rgba(255,77,106,0.15); color: var(--red); border: 1px solid rgba(255,77,106,0.3); }
  
  /* Course List (Table) */
  .course-table-wrap { background: var(--navy2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .course-table { width: 100%; border-collapse: collapse; }
  .course-table th { background: var(--navy3); font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); font-family: var(--font-mono); padding: 14px 20px; text-align: left; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
  .course-table td { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,253,0.04); font-size: 13.5px; color: var(--warm); vertical-align: middle; transition: all 0.2s; }
  .course-table tr:hover td { background: var(--teal3); cursor: pointer; }
  .course-table tr.flagged td { border-left: 2px solid var(--amber); }
  .course-table .course-title-cell { font-family: var(--font-head); font-weight: 700; font-size: 14px; color: var(--warm); }
  .course-table .citation-cell { font-family: var(--font-mono); font-size: 11px; color: var(--muted); }
  .course-table .metric-cell { font-family: var(--font-head); font-weight: 700; font-size: 15px; }

  /* Stars */
  .stars { display: inline-flex; gap: 2px; }
  .star { font-size: 12px; }
  .star.filled { color: var(--amber); }
  .star.empty { color: var(--navy3); }
  
  /* Alert cards */
  .alert-card { border-radius: 10px; padding: 16px 20px; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 14px; border: 1px solid; }
  .alert-card.high { background: rgba(255,77,106,0.07); border-color: rgba(255,77,106,0.25); }
  .alert-card.medium { background: rgba(255,179,64,0.07); border-color: rgba(255,179,64,0.25); }
  .alert-card.low { background: rgba(107,127,163,0.1); border-color: rgba(107,127,163,0.2); }
  .alert-icon { font-size: 18px; margin-top: 1px; }
  .alert-title { font-size: 13.5px; font-weight: 600; color: var(--warm); margin-bottom: 4px; }
  .alert-desc { font-size: 12.5px; color: var(--warm2); line-height: 1.5; }
  .alert-date { font-size: 11px; color: var(--muted); font-family: var(--font-mono); margin-top: 6px; }
  
  /* Course player */
  .player-wrap { max-width: 800px; margin: 0 auto; }
  .player-header { margin-bottom: 24px; }
  .player-slide { background: var(--navy2); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; min-height: 400px; }
  .slide-content { padding: 48px; }
  .slide-num { font-size: 11px; color: var(--muted); font-family: var(--font-mono); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 20px; }
  .slide-title { font-family: var(--font-head); font-size: 26px; font-weight: 800; color: var(--warm); margin-bottom: 20px; line-height: 1.25; }
  .slide-body { font-size: 15px; color: var(--warm2); line-height: 1.75; }
  .slide-body ul { padding-left: 20px; margin-top: 12px; }
  .slide-body li { margin-bottom: 8px; }
  .slide-body strong { color: var(--teal); }
  .player-controls { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; }
  .progress-step { display: flex; align-items: center; gap: 8px; }
  .step-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--navy3); transition: all 0.2s; }
  .step-dot.active { background: var(--teal); width: 24px; border-radius: 4px; }
  .step-dot.done { background: var(--teal); opacity: 0.5; }
  
  /* Quiz */
  .quiz-option { width: 100%; text-align: left; padding: 14px 18px; background: var(--navy3); border: 1px solid var(--border); border-radius: 10px; color: var(--warm); font-size: 14px; cursor: pointer; margin-bottom: 10px; transition: all 0.15s; font-family: var(--font-body); position: relative; overflow: hidden; }
  .quiz-option::after { content: ''; position: absolute; left: 0; bottom: 0; height: 2px; width: 0; background: var(--teal); transition: width 0.3s; }
  .quiz-option:hover::after { width: 100%; }
  .quiz-option:hover { border-color: rgba(0,212,200,0.3); background: var(--teal3); transform: translateX(4px); }
  .quiz-option.correct { background: rgba(0,196,140,0.15); border-color: var(--green); color: var(--green); }
  .quiz-option.wrong { background: rgba(255,77,106,0.1); border-color: var(--red); color: var(--red); }
  .quiz-option.selected { border-color: var(--teal); background: var(--teal3); }

  /* Dynamic Slide Elements */
  .slide-example { background: rgba(0,212,200,0.05); border-left: 4px solid var(--teal); padding: 20px; border-radius: 0 12px 12px 0; margin-top: 24px; animation: slideInRight 0.5s ease both; }
  .example-tag { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--teal); margin-bottom: 8px; font-weight: 700; letter-spacing: 1px; }
  .example-content { font-size: 14px; color: var(--warm2); font-style: italic; }

  @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  .animate-content > * { animation: fadeIn 0.5s ease both; }
  .animate-content > *:nth-child(1) { animation-delay: 0.1s; }
  .animate-content > *:nth-child(2) { animation-delay: 0.2s; }
  .animate-content > *:nth-child(3) { animation-delay: 0.3s; }
  .animate-content > *:nth-child(4) { animation-delay: 0.4s; }
  
  /* Certificate */
  .cert-wrap { background: linear-gradient(135deg, var(--navy2) 0%, var(--navy3) 100%); border: 2px solid rgba(0,212,200,0.3); border-radius: 16px; padding: 48px; text-align: center; position: relative; overflow: hidden; }
  .cert-wrap::before { content:''; position:absolute; inset:-1px; background:linear-gradient(135deg, rgba(0,212,200,0.15), transparent 50%); border-radius:16px; pointer-events:none; }
  .cert-seal { width: 80px; height: 80px; background: linear-gradient(135deg, var(--teal), var(--teal2)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 32px; }
  .cert-org { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--teal); font-family: var(--font-mono); margin-bottom: 8px; }
  .cert-title-big { font-family: var(--font-head); font-size: 28px; font-weight: 800; color: var(--warm); margin-bottom: 8px; }
  .cert-presented { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
  .cert-name { font-family: var(--font-head); font-size: 22px; font-weight: 700; color: var(--teal); margin-bottom: 16px; }
  .cert-course { font-size: 15px; color: var(--warm); margin-bottom: 8px; font-weight: 500; }
  .cert-citation { font-size: 11px; color: var(--muted); font-family: var(--font-mono); margin-bottom: 24px; }
  .cert-meta { display: flex; justify-content: center; gap: 40px; }
  .cert-meta-item { text-align: center; }
  .cert-meta-label { font-size: 10px; color: var(--muted); font-family: var(--font-mono); letter-spacing: 1px; margin-bottom: 4px; }
  .cert-meta-val { font-size: 13px; color: var(--warm); font-weight: 600; }
  
  /* AI Builder */
  .ai-builder { background: var(--navy2); border: 1px solid var(--border); border-radius: 16px; padding: 32px; }
  .ai-input { width: 100%; background: var(--navy3); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; color: var(--warm); font-family: var(--font-body); font-size: 14px; resize: vertical; min-height: 120px; outline: none; transition: border-color 0.15s; }
  .ai-input:focus { border-color: rgba(0,212,200,0.4); }
  .ai-input::placeholder { color: var(--muted); }
  .ai-response { background: var(--navy3); border: 1px solid rgba(0,212,200,0.2); border-radius: 12px; padding: 24px; margin-top: 20px; }
  .ai-thinking { display: flex; align-items: center; gap: 10px; color: var(--teal); font-size: 13px; font-family: var(--font-mono); }
  .pulse-dot { width: 8px; height: 8px; background: var(--teal); border-radius: 50%; animation: pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  
  /* Filters */
  .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .filter-btn { padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: var(--navy2); color: var(--warm2); font-family: var(--font-body); transition: all 0.15s; }
  .filter-btn:hover { border-color: rgba(0,212,200,0.3); color: var(--teal); }
  .filter-btn.active { background: var(--teal3); border-color: rgba(0,212,200,0.4); color: var(--teal); }
  
  /* Tabs */
  .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
  .tab { padding: 12px 20px; font-size: 13.5px; font-weight: 500; cursor: pointer; color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; font-family: var(--font-body); }
  .tab:hover { color: var(--warm); }
  .tab.active { color: var(--teal); border-bottom-color: var(--teal); }
  
  /* Feedback */
  .feedback-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
  .feedback-q { font-size: 14px; color: var(--warm); margin-bottom: 14px; font-weight: 500; }
  .checkbox-group { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .check-item { display: flex; align-items: center; gap: 7px; padding: 7px 12px; background: var(--navy3); border-radius: 6px; font-size: 12.5px; color: var(--warm2); cursor: pointer; border: 1px solid var(--border); transition: all 0.15s; }
  .check-item:hover { border-color: rgba(0,212,200,0.3); color: var(--teal); }
  .check-item.checked { background: var(--teal3); border-color: rgba(0,212,200,0.4); color: var(--teal); }
  
  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--navy2); } ::-webkit-scrollbar-thumb { background: var(--navy3); border-radius: 3px; }
  
  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal { background: var(--navy2); border: 1px solid var(--border); border-radius: 16px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto; }
  .modal-header { padding: 24px 28px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-family: var(--font-head); font-size: 17px; font-weight: 700; color: var(--warm); }
  .modal-body { padding: 24px 28px; }
  .modal-close { background: var(--navy3); border: none; color: var(--muted); width: 30px; height: 30px; border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
  .modal-close:hover { color: var(--warm); background: rgba(255,255,255,0.08); }
  
  /* Avatar Studio */
  /* Avatar Instructor */
  .avatar-overlay { 
    width: 80px; 
    height: 80px; 
    border-radius: 50%; 
    border: 3px solid var(--teal); 
    overflow: hidden; 
    box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,212,200,0.2); 
    z-index: 999; 
    background: var(--navy);
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  .avatar-overlay.playing { 
    border-color: var(--teal); 
    box-shadow: 0 0 30px var(--teal3); 
    animation: avatar-pulse 2s infinite ease-in-out; 
  }
  @keyframes avatar-pulse { 
    0%, 100% { transform: scale(1); box-shadow: 0 0 20px var(--teal3); } 
    50% { transform: scale(1.05); box-shadow: 0 0 40px var(--teal); } 
  }
  .avatar-img { width: 100%; height: 100%; object-fit: cover; }
  .audio-indicator { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 3px; padding: 3px 8px; background: rgba(11,22,40,0.7); backdrop-filter: blur(4px); border-radius: 8px; }
  .audio-bar { width: 3px; background: var(--teal); border-radius: 2px; animation: audio-play 1s infinite alternate; }
  
  /* Cinematic Scalable Overlay */
  .player-slide { 
    background: rgba(11, 22, 40, 0.4);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 0;
    overflow: hidden;
    position: relative;
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 600px;
    height: 80vh;
    display: flex;
    flex-direction: column;
  }
  
  .slide-header-visual {
    height: 380px;
    width: 100%;
    position: relative;
    overflow: hidden;
    background: #000;
  }

  .video-content { position: absolute; top: 40px; left: 40px; right: 40px; z-index: 20; transition: all 0.6s ease; }
  .video-content.hidden { opacity: 0; transform: translateY(-10px); }
  .video-content.active { opacity: 1; transform: translateY(0); }
  
  .audio-sub-header {
    background: var(--navy3);
    padding: 12px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 20px;
    z-index: 20;
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(10px);
    pointer-events: none;
  }
  .player-slide:hover .audio-sub-header {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
  }
  
  .slide-main-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 32px 40px;
    scrollbar-width: thin;
    scrollbar-color: var(--teal3) transparent;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .cinematic-title {
    font-family: var(--font-head);
    font-size: 32px;
    font-weight: 900;
    line-height: 1.1;
    background: linear-gradient(to right, #fff, var(--teal));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 20px;
  }

  .scalable-text {
    font-size: 17px;
    line-height: 1.7;
    color: var(--warm2);
    font-weight: 400;
  }

  @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
  .animate-content { animation: slideInRight 0.6s ease both; }
  
  /* Indicators */
  .audio-indicator { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 3px; padding: 3px 8px; background: rgba(11,22,40,0.7); backdrop-filter: blur(4px); border-radius: 8px; }
  .audio-bar { width: 3px; background: var(--teal); border-radius: 2px; animation: audio-play 1s infinite alternate; }
  
  @keyframes audio-play { from { height: 3px; } to { height: 12px; } }
  
  /* Animated Video Short Simulation */
  .video-short-container { position: relative; width: 100%; height: 320px; background: #000; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin: 20px 0; }
  .video-scene { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease; display: flex; align-items: center; justify-content: center; }
  .video-scene.active { opacity: 1; }
  .video-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.65) contrast(1.1) saturate(1.1); transform: scale(1.18) translate(0,0); transition: transform 12s cubic-bezier(0.1, 0, 0.9, 1); }
  .video-scene.active .video-bg { transform: scale(1.05) translate(-15px, -8px); }
  .pulse-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 10px; background: #ff4444; animation: pulse-red 2s infinite cubic-bezier(0.455, 0.03, 0.515, 0.955); }
  .video-overlay { position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 20%, rgba(11,22,40,0.85) 100%); z-index: 5; }
  
  /* Lidar / Neural Scanning Effect */
  .lidar-scan { position: absolute; inset: 0; pointer-events: none; z-index: 6; overflow: hidden; opacity: 0.3; }
  .scan-line { position: absolute; top: -100%; left: 0; width: 100%; height: 40px; background: linear-gradient(to bottom, transparent, var(--teal), transparent); opacity: 0.4; animation: scanMove 4s infinite linear; }
  @keyframes scanMove { 0% { top: -10%; } 100% { top: 110%; } }

  /* Atmospheric Light */
  .light-shimmer { position: absolute; inset: 0; background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%); background-size: 200% 200%; z-index: 7; animation: lightWander 10s infinite alternate linear; pointer-events: none; }
  @keyframes lightWander { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }

  .video-content { position: relative; z-index: 10; padding: 32px; text-align: center; max-width: 500px; text-shadow: 0 4px 12px rgba(0,0,0,0.8); }
  
  .caption-bar { 
    position: absolute; bottom: 0; left: 0; right: 0; 
    background: linear-gradient(to top, rgba(11,22,40,0.95), transparent); 
    padding: 60px 40px 30px; z-index: 100; pointer-events: none;
  }
  .caption-label { font-size: 9px; font-family: var(--font-mono); color: var(--teal); letter-spacing: 2px; margin-bottom: 8px; opacity: 0.8; }
  .caption-text { 
    font-size: 15px; color: var(--warm); line-height: 1.5; font-weight: 500; 
    text-shadow: 0 2px 4px rgba(0,0,0,0.5); max-width: 90%;
    animation: captionSlideUp 0.5s ease both;
  }
  @keyframes captionSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .video-label { font-family: var(--font-mono); font-size: 10px; color: var(--teal); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; animation: fadeInUp 0.5s ease both; }
  .video-text { font-family: var(--font-head); font-size: 20px; font-weight: 800; color: #fff; line-height: 1.2; animation: fadeInUp 0.5s 0.2s ease both; }
  .video-subtext { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 12px; animation: fadeInUp 0.5s 0.4s ease both; }
  
  .cinematic-frame { position: absolute; inset: 0; border: 20px solid transparent; transition: all 1s ease; pointer-events: none; z-index: 20; }
  .cinematic-frame::before, .cinematic-frame::after { content: ''; position: absolute; left: 0; width: 100%; height: 2px; background: rgba(0,212,200,0.3); opacity: 0; transition: 0.5s; }
  .cinematic-frame::before { top: 10%; }
  .cinematic-frame::after { bottom: 10%; }
  .active .cinematic-frame::before, .active .cinematic-frame::after { opacity: 1; width: 100%; }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  @keyframes pulse-alt { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
  @keyframes pulse-red { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); opacity: 0.7; } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 68, 68, 0); opacity: 1; } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); opacity: 0.7; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.4s ease forwards; }

  /* Interactive Exercises & Mini-Graphs */
  .mini-graph { background: var(--navy3); border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid var(--border); position: relative; }
  .graph-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .graph-label { font-size: 11px; color: var(--muted); width: 80px; font-family: var(--font-mono); }
  .graph-bar-bg { flex: 1; height: 8px; background: var(--navy); border-radius: 4px; overflow: hidden; }
  .graph-bar-fill { height: 100%; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 4px; }
  .graph-val { font-size: 11px; color: var(--warm); font-family: var(--font-mono); width: 30px; text-align: right; }
  
  .exercise-box { border: 1px dashed var(--teal); border-radius: 12px; padding: 20px; margin-top: 20px; background: rgba(0, 212, 200, 0.03); }
  .exercise-title { font-size: 13px; font-weight: 700; color: var(--teal); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  
  .stagger-list li { opacity: 0; animation: fadeIn 0.4s ease forwards; }
  .stagger-list li:nth-child(1) { animation-delay: 0.1s; }
  .stagger-list li:nth-child(2) { animation-delay: 0.2s; }
  .stagger-list li:nth-child(3) { animation-delay: 0.3s; }
  .stagger-list li:nth-child(4) { animation-delay: 0.4s; }
  .stagger-list li:nth-child(5) { animation-delay: 0.5s; }

  /* New Neural Chart Styles */
  .neural-chart-overlay {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 200px;
    background: rgba(11, 22, 40, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid var(--teal3);
    border-radius: 12px;
    padding: 12px;
    z-index: 10;
    pointer-events: none;
    animation: fadeIn 0.8s ease-out;
  }
  .neural-chart-title {
    font-size: 9px;
    font-family: var(--font-mono);
    color: var(--teal);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--teal3);
    padding-bottom: 4px;
  }
  .data-point {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .data-label { font-size: 10px; color: var(--warm2); font-family: var(--font-mono); }
  .data-value { font-size: 10px; color: var(--teal); font-family: var(--font-mono); font-weight: 700; }
  .data-bar-bg { width: 100%; height: 2px; background: rgba(255,255,255,0.1); margin-top: 2px; }
  .data-bar-fill { height: 100%; background: var(--teal); transition: width 2s cubic-bezier(0.4, 0, 0.2, 1); }
`;

// ── Helper components ──────────────────────────────────────────────────────
function AnimatedVideoShort({ courseId, isPlaying }) {
  const [scene, setScene] = useState(0);
  const videoRef = useRef(null);

  const SCENES = {
    1: [
      { label: "Scene 1: Data Integrity", text: "The ePHI Fortress", sub: "Ensuring every record is encrypted and hardware is physically secured.", img: "/hipaa_compliance_hero_1773092188472.png", videoUrl: "" },
      { label: "Scene 2: Minimum Necessary", text: "Role-Based Access", sub: "Only accessing what is required for your specific job function.", img: "/hipaa_compliance_hero_1773092188472.png", videoUrl: "" }
    ],
    2: [
      { label: "Scene 1: The Biohazard Risk", text: "Sharps Safety Protocol", sub: "Proper disposal into OSHA-mandated red containers.", img: "/bloodborne_pathogens_hero_1773092231806.png", videoUrl: "" },
      { label: "Scene 2: Exposure Control", text: "Immediate Response", sub: "Wash, report, and document within the first 60 minutes.", img: "/bloodborne_sharps_safety_1773093436237.png", videoUrl: "" }
    ],
    4: [
      { label: "Scene 1: The Audit Trail", text: "Spotting Billing Anomalies", sub: "AI-driven detection of upcoding and duplicate billing patterns.", img: "/fraud_prevention_hero_1773092325162.png" },
      { label: "Scene 2: Whistleblower Path", text: "Reporting Without Fear", sub: "Confidential channels for alerting compliance officers.", img: "/fraud_prevention_hero_1773092325162.png" }
    ],
    7: [
      { label: "Scene 1: Command Control", text: "The Florida Disaster Plan", sub: "Coordinating with AHCA and EMS during extreme weather events.", img: "/emergency_prep_hero_1773092311134.png" },
      { label: "Scene 2: Evacuation Flow", text: "Moving Vulnerable Adults", sub: "Prioritizing bedridden residents and oxygen-dependent patients.", img: "/emergency_prep_hero_1773092311134.png" }
    ],
    8: [
      { label: "Scene 1: The Barrier", text: "Donning Protocol (v2026)", sub: "Gown first, then mask, then eyes, then gloves.", img: "/infection_control_hero_1773092204162.png" },
      { label: "Scene 2: The Seal Check", text: "Ensuring N95 Integrity", sub: "Perform positive and negative pressure checks.", img: "/infection_control_hero_1773092204162.png" },
      { label: "Scene 3: Safer Doffing", text: "The Self-Contamination Risk", sub: "Sanitize hands between every single removal step.", img: "/infection_control_hero_1773092204162.png" }
    ],
    9: [
      { label: "Scene 1: The Agitation", text: "Recognizing the 'Critical Zone'", sub: "Watch for rapid pacing, yelling, and direct threats.", img: "/healthcare_deescalation_visual_1_1773088747081.png", chart: { title: "INCIDENT TRIGGERS", data: [{ label: "Wait Times", val: 45 }, { label: "Pain Level", val: 32 }, { label: "Confusion", val: 23 }] } },
      { label: "Scene 2: Physical Safety", text: "Maintain the 'Safety Stance'", sub: "2 arm-lengths distance. Hands visible. 45-degree angle.", img: "/healthcare_deescalation_visual_1_1773088747081.png" },
      { label: "Scene 3: Verbal Judo", text: "Lower Your Volume", sub: "Forcing them to listen closer through 'soft power'.", img: "/healthcare_deescalation_visual_1_1773088747081.png" }
    ],
    10: [
      { label: "Scene 1: The Alarm", text: "R.A.C.E. Response Plan", sub: "Rescue, Alarm, Confine, Extinguish/Evacuate.", img: "/fire_safety_hero_1773092218263.png" },
      { label: "Scene 2: P.A.S.S. Method", text: "Extinguisher Operation", sub: "Pull, Aim, Squeeze, Sweep at the base of the fire.", img: "/fire_safety_hero_1773092218263.png" }
    ],
    11: [
      { label: "Scene 1: Vigilance", text: "The DCF Mandatory Report", sub: "Suspicion is the only requirement. Proof is not needed.", img: "/abuse_prevention_hero_1773092297226.png", chart: { title: "HOTLINE VOLUME", data: [{ label: "Neglect", val: 56 }, { label: "Physical", val: 24 }, { label: "Financial", val: 20 }] } },
      { label: "Scene 2: Skin Integrity", text: "Spotting Hidden Indicators", sub: "Systematic assessment for unexplained bruises or neglect signs.", img: "/abuse_prevention_hero_1773092297226.png" }
    ],
    31: [
      { label: "Scene 1: Florida Hub", text: "The Trafficking Reality", sub: "Florida ranks 3rd in the US for trafficking volume.", img: "/human_trafficking_awareness_hero_1773092472539.png", chart: { title: "TRAFFICKING TYPES", data: [{ label: "Labor", val: 32 }, { label: "Sex", val: 68 }] } },
      { label: "Scene 2: Clinical Intervention", text: "Healthcare Entry Points", sub: "88% of victims visit a clinician while being trafficked.", img: "/human_trafficking_awareness_hero_1773092472539.png" }
    ],
    3: [
      { label: "Scene 1: The GHS System", text: "Universal Hazard Labeling", sub: "The Globally Harmonized System standardizes chemical safety across borders.", img: "/hazcom_safety_hero_1773093350877.png" },
      { label: "Scene 2: Safety Data Sheets", text: "The 16-Section Blueprint", sub: "Immediate access to SDS is required for every chemical on site.", img: "/hazcom_safety_hero_1773093350877.png" }
    ],
    14: [
      { label: "Scene 1: The Bill of Rights", text: "Patient Self-Determination", sub: "Respecting the right to choose, refuse, and control care.", img: "/patient_rights_hero_1773093363663.png" },
      { label: "Scene 2: Privacy Ethos", text: "Beyond HIPAA Compliance", sub: "Dignity in every interaction, from bathing to bad news.", img: "/patient_rights_hero_1773093363663.png" }
    ],
    33: [
      { label: "Scene 1: The Cognitive Landscape", text: "Understanding Neurodegeneration", sub: "Navigating the complexities of Alzheimer's and related dementias.", img: "/alzheimers_care_hero_v2_1773093378765.png" },
      { label: "Scene 2: Comfort & Connection", text: "De-escalating Sun-downing", sub: "Using sensory grounding and environmental control to reduce anxiety.", img: "/alzheimers_care_hero_v2_1773093378765.png" }
    ],
    12: [
      { label: "Scene 1: Adverse Events", text: "The IRAS Reporting Path", sub: "Documentation required for unexpected patient outcomes in Florida.", img: "/emergency_prep_hero_1773092311134.png" },
      { label: "Scene 2: Root Cause", text: "Analysis & Prevention", sub: "Ensuring every incident leads to facility-wide improvement.", img: "/emergency_prep_hero_1773092311134.png" }
    ],
    13: [
      { label: "Scene 1: Public Trust", text: "Florida Medicaid Integrity", sub: "Protecting state resources from fraudulent billing practices.", img: "/fraud_prevention_hero_1773092325162.png" },
      { label: "Scene 2: Enforcement", text: "The AG's Medicaid Fraud Unit", sub: "Understanding the consequences of intentional misreporting.", img: "/fraud_prevention_hero_1773092325162.png" }
    ],
    15: [
      { label: "Scene 1: Trusted Staffing", text: "HB 975 Level 2 Screening", sub: "Ensuring every employee meets Florida's rigorous trust standards.", img: "/patient_rights_hero_1773093363663.png" },
      { label: "Scene 2: Continuous Review", text: "The Rapback System", sub: "Real-time updates on criminal history changes.", img: "/patient_rights_hero_1773093363663.png" }
    ],
    17: [
      { label: "Scene 1: Clinical Narrative", text: "Precision Documentation", sub: "If it isn't documented correctly, it didn't happen for the AHCA audit.", img: "/hipaa_compliance_hero_1773092188472.png" },
      { label: "Scene 2: Objective Fact", text: "Avoiding Opinionated Charting", sub: "Focusing on measurable patient state and intervention timing.", img: "/hipaa_compliance_hero_1773092188472.png" }
    ],
    18: [
      { label: "Scene 1: The 6 Rights", text: "Medication Safety Protocol", sub: "Patient, Drug, Dose, Route, Time, and Documentation.", img: "/infection_control_hero_1773092204162.png" },
      { label: "Scene 2: Error Reduction", text: "Electronic Verification", sub: "Scanning and redundant checks to prevent adverse drug events.", img: "/infection_control_hero_1773092204162.png" }
    ],
    27: [
      { label: "Scene 1: Resident Focus", text: "Florida ALF Core Standards", sub: "Maintaining dignified living environments under AHCA Rule 58A-5.", img: "/alzheimers_care_hero_v2_1773093378765.png" },
      { label: "Scene 2: Quality of Life", text: "Resident Self-Directed Care", sub: "Empowering residents to control their schedule and preferences.", img: "/alzheimers_care_hero_v2_1773093378765.png" }
    ],
    28: [
      { label: "Scene 1: Community Care", text: "Home Health Compliance", sub: "Ensuring clinical excellence in the resident's home environment.", img: "/patient_rights_hero_1773093363663.png" },
      { label: "Scene 2: Field Safety", text: "Staff Security & Preparedness", sub: "Equipping mobile clinicians for dynamic care settings.", img: "/patient_rights_hero_1773093363663.png" }
    ],
    29: [
      { label: "Scene 1: Rights & Safety", text: "The Baker Act Protocol", sub: "Balancing patient autonomy with acute crisis stabilization.", img: "/healthcare_deescalation_visual_1_1773088747081.png" },
      { label: "Scene 2: Ethical Care", text: "Least Restrictive Treatment", sub: "Prioritizing dignity and clinical intervention over coercion.", img: "/healthcare_deescalation_visual_1_1773088747081.png" }
    ],
    8: [
      { label: "Scene 1: The Barrier", text: "Donning Protocol (v2026)", sub: "Gown first, then mask, then eyes, then gloves.", img: "/infection_control_hero_1773092204162.png", chart: { title: "CONTAMINATION RISK", data: [{ label: "Gloves", val: 92 }, { label: "Gown", val: 45 }, { label: "Mask", val: 12 }] } },
      { label: "Scene 2: The Seal Check", text: "Ensuring N95 Integrity", sub: "Perform positive and negative pressure checks.", img: "/infection_control_hero_1773092204162.png" }
    ],
    33: [
      { label: "Scene 1: The Cognitive Landscape", text: "Understanding Neurodegeneration", sub: "Navigating the complexities of Alzheimer's care.", img: "/alzheimers_care_hero_v2_1773093378765.png", chart: { title: "DEMENTIA PREVALENCE", data: [{ label: "Age 65+", val: 10 }, { label: "Age 85+", val: 33 }, { label: "FL Growth", val: 42 }] } },
      { label: "Scene 2: Comfort & Connection", text: "De-escalating Sun-downing", sub: "Using sensory grounding to reduce anxiety.", img: "/alzheimers_care_hero_v2_1773093378765.png" }
    ]
  };

  const [showOverlay, setShowOverlay] = useState(true);
  const courseScenes = SCENES[courseId] || SCENES[9];
  const currentScene = courseScenes[scene];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setScene(s => (s + 1) % courseScenes.length);
        setShowOverlay(true);
      }, 7000); // 7s for more cinematic feel
    }
    return () => clearInterval(interval);
  }, [isPlaying, courseScenes.length]);

  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 2500);
    return () => clearTimeout(timer);
  }, [scene]);

  return (
    <div className="video-short-container">
      {courseScenes.map((s, i) => (
        <div key={i} className={`video-scene ${scene === i ? "active" : ""}`}>
          {s.videoUrl ? (
            <video
              src={s.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <>
              <img src={s.img} className="video-bg" alt="Scene Background" />
              <div className="light-shimmer" />
            </>
          )}
          {s.chart && (
            <div className="neural-chart-overlay">
              <div className="neural-chart-title">{s.chart.title || "RISK ANALYTICS"}</div>
              {s.chart.data.map((d, di) => (
                <div key={di} style={{ marginBottom: 8 }}>
                  <div className="data-point">
                    <span className="data-label">{d.label}</span>
                    <span className="data-value">{d.val}%</span>
                  </div>
                  <div className="data-bar-bg">
                    <div className="data-bar-fill" style={{ width: isPlaying ? `${d.val}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="video-overlay" />
          <div className="cinematic-frame" />
          <div className={`video-content ${showOverlay ? "active" : "hidden"}`}>
            <div className="video-label">
              <span className="pulse-dot"></span>
              LIVE AI FEED: {s.label}
            </div>
            <div className="video-text">{s.text}</div>
            <div className="video-subtext">{s.sub}</div>
          </div>
        </div>
      ))}
      <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 30, display: "flex", gap: 4 }}>
        {courseScenes.map((_, i) => (
          <div key={i} style={{ width: 12, height: 3, borderRadius: 2, background: scene === i ? "var(--teal)" : "rgba(255,255,255,0.2)", transition: "0.3s" }} />
        ))}
      </div>
    </div >
  );
}

function Stars({ rating }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`star ${i <= Math.round(rating) ? "filled" : "empty"}`}>★</span>
      ))}
    </span>
  );
}

function ProgressRing({ pct, color = "teal", size = 160, stroke = 12, label = "" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="ring-container" style={{ width: size, height: size }}>
      <svg className="ring-svg" width={size} height={size}>
        <circle className="ring-bg" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle className={`ring-fill ${color}`} cx={size / 2} cy={size / 2} r={r}
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="ring-center">
        <span className={`ring-pct ${color}`} style={{ fontSize: size < 100 ? 20 : 32 }}>{pct}%</span>
        {label && <span className="ring-lbl">{label}</span>}
      </div>
    </div>
  );
}

function ProgBar({ pct, color }) {
  const c = pct >= 90 ? "green" : pct >= 75 ? "teal" : pct >= 60 ? "amber" : "red";
  return (
    <div className="prog-bar" style={{ flex: 1 }}>
      <div className={`prog-fill ${color || c}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function RingChart({ pct, size = 100, color = "teal" }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  const colorMap = { green: "#22c55e", teal: "#00D4C8", amber: "#f59e0b", red: "#ef4444" };
  const stroke = colorMap[color] || colorMap.teal;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth={10}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        style={{ fontSize: size * 0.22, fontWeight: 900, fill: stroke, fontFamily: "var(--font-head)" }}>
        {pct}%
      </text>
    </svg>
  );
}


// ── Slide content for course player ───────────────────────────────────────
const SLIDE_CONTENT = {
  1: [
    {
      title: "The Three Pillars of HIPAA",
      body: `Health Insurance Portability and Accountability Act (HIPAA) isn't just one rule—it's a comprehensive federal framework designed to balance patient privacy with the high-speed transfer of medical data. Under the <strong>HITECH Act</strong>, penalties for violations were significantly increased, moving from 'unintentional' to 'willful neglect' with fines reaching $1.5 million per year.\n\n<strong>The 3 Main Rules You MUST Know:</strong>\n<ul class="stagger-list"><li><strong>Privacy Rule:</strong> Protects PHI in ANY form (written, verbal, electronic). It dictates exactly WHO can see patients' info and WHEN.</li><li><strong>Security Rule:</strong> Deeply technical—focuses on locking down electronic data (ePHI) with administrative, physical, and technical safeguards.</li><li><strong>Breach Notification:</strong> A strictly timed mandate requiring us to admit when we've messed up and lost control of patient data.</li></ul>`,
      type: "video",
      image: "/hipaa_compliance_hero_1773092188472.png",
      example: "Stat: 94% of healthcare organizations have experienced at least one data breach in the last two years. Phishing remains the #1 entry point.",
      chartData: [
        { label: "Phishing/Social Eng", val: 68, color: "var(--red)" },
        { label: "Internal Negligence", val: 31, color: "var(--teal)" },
        { label: "Theft/Loss", val: 42, color: "var(--amber)" }
      ]
    },
    {
      title: "Protected Health Information (PHI)",
      body: `PHI includes any information that can link a patient to their specific medical record. If a stranger can use the data to guess who the patient is, it's PHI. Under AHCA and OCR scrutiny, even 'anonymized' data can be cited if it remains 'identifiable' within a small community.\n\n<strong>The Big 18 Identifiers:</strong>\n<ul class="stagger-list"><li>Names, full addresses, and Zip codes.</li><li>Dates (Birth, Admission, Discharge, Death).</li><li>Phone numbers, Email addresses, and SSNs.</li><li>Medical Record Numbers & Health Plan Account Numbers.</li><li>Full face photos and biometric identifiers.</li></ul>`,
      type: "video",
      image: "/hipaa_compliance_hero_1773092188472.png",
      example: "Audit Note: Even an 'anonymous' photo of a unique clinical case can be considered PHI if the patient is recognizable or the location is specific."
    },
    {
      title: "Minimum Necessary & The 'Right to Know'",
      body: `This is the core philosophy of HIPAA. You should only access the <strong>smallest amount of data</strong> required to perform your specific job function at that specific moment. In Florida healthcare, curious chart-peeking (e.g., checking on a neighbor or a celebrity) is ground for immediate termination.\n\n<strong>Operational Bounds:</strong>\n<ul><li><strong>Billing:</strong> Needs codes and dates, not detailed psychotherapy notes.</li><li><strong>Lab:</strong> Needs the test order, not the patient's home financial history.</li><li><strong>Personal Records:</strong> You cannot look up YOUR OWN records or those of your family via our clinical system. You must follow the standard release-of-info protocols.</li></ul>`,
      interaction: {
        type: "mcq",
        question: "You are a nurse. You notice your neighbor has been admitted in the room across from your assigned patient. Can you 'just check' their diagnosis to be a good neighbor?",
        options: ["Yes, if I am a close friend", "Yes, it is good customer service", "No, it violates the minimum necessary standard and my employment agreement", "No, unless they specifically asked me to"],
        correct: 2,
        feedback: "Correct. Unless you are directly assigned to their care or have a specific treatment reason, accessing their chart is a major violation that we are required by law to report."
      }
    },
    {
      title: "Physical & Technical Safeguards",
      body: `Compliance isn't just about what you say, it's about what you DO with your hardware. Security is only as strong as the weakest link—often an unlocked workstation or a shared password.\n\n<strong>Mandatory Actions:</strong>\n<ul class="stagger-list"><li><strong>Workstation Security:</strong> Always lock (Win+L) when stepping away, even for 30 seconds.</li><li><strong>Credential Integrity:</strong> Never share logins, even with a supervisor or a 'busy' doctor. Your digital signature is legally binding.</li><li><strong>Disposal:</strong> PHI must NEVER go in a regular trash can. It must be placed in a locked shred bin or incinerated.</li></ul>`,
      example: "Real-Life: A Florida clinic was fined $20,000 after an unencrypted laptop was stolen from an employee's car. Physical security is just as important as passwords.",
      chartData: [
        { label: "Lost Devices", val: 15, color: "var(--red)" },
        { label: "Weak Passwords", val: 42, color: "var(--amber)" },
        { label: "Human Error", val: 43, color: "var(--teal)" }
      ]
    }
  ],
  9: [
    {
      title: "The Crisis Prevention Mindset",
      body: `Workplace violence isn't a random event; it's the culmination of a 'Crisis Cycle.' As Florida healthcare professionals, our goal is to identify agitation before it turns into aggression.\n\n<strong>The Scripted Strategy:</strong>\nAI algorithms analyze historical incident data to identify high-risk triggers in the AHCA environment. This course provides a tactical framework for de-escalation that protects both staff and residents.`,
      type: "video",
      image: "/healthcare_deescalation_visual_1_1773088747081.png"
    },
    {
      title: "Recognizing Early Warning Signs",
      body: `Violence often begins with 'pre-attack indicators'—subtle shifts in behavior that suggest a loss of rational control. Surveyors frequently audit whether staff missed these early signs.\n\n<strong>Physical Indicators:</strong>\n<ul class="stagger-list"><li><strong>Level 1: Anxiety.</strong> Pacing, wringing hands, or staring.</li><li><strong>Level 2: Defensiveness.</strong> Challenging authority or shouting.</li><li><strong>Level 3: Acting Out.</strong> Physical contact or destruction of property.</li></ul>`,
      type: "chart",
      chartData: [
        { label: "Verbal Abuse", val: 72, color: "var(--amber)" },
        { label: "Physical Threats", val: 18, color: "var(--red)" },
        { label: "Physical Assault", val: 10, color: "var(--red)" }
      ],
      example: "Data Insight: 72% of all incidents reported to OSHA in healthcare begin as 'Level 1' verbal agitation. Correcting here prevents the assault."
    },
    {
      title: "The 4-Step De-escalation Protocol",
      body: `When a resident or visitor becomes agitated, follow the <strong>R.A.P.I.D.</strong> de-escalation framework:\n\n<ol class="stagger-list"><li><strong>Remain Calm:</strong> Your non-verbal cues (posture, tone) are contagious.</li><li><strong>Assess the Exit:</strong> Never let a patient get between you and the door.</li><li><strong>Provide Options:</strong> Give the individual a sense of control (e.g., 'Would you like to speak in the office or here?').</li><li><strong>Identify the Root:</strong> Are they in pain? Are they confused? Address the need, not just the behavior.</li></ol>`,
      interaction: {
        type: "mcq",
        question: "A family member is yelling at the front desk because their relative's laundry is missing. They are leaning over the counter. What is your first move?",
        options: ["Yell back to show authority", "Step back to create safety distance and lower your voice", "Call the police immediately", "Ignore them until they calm down"],
        correct: 1,
        feedback: "Correct. Creating 'Safety Distance' (approx. 2 arm lengths) and using 'Volume Dissonance' (speaking softer as they speak louder) are primary de-escalation tactics."
      }
    }
  ],
  8: [
    {
      title: "The Chain of Infection",
      body: `To prevent infection, we must break one of the six links in the 'Chain of Infection'. In a Florida clinical environment, this is our primary defensive strategy.\n\n<strong>The Links:</strong>\n<ul class="stagger-list"><li><strong>Infectious Agent:</strong> The bacteria, virus, or fungi.</li><li><strong>Reservoir:</strong> Where the agent lives (people, equipment, water).</li><li><strong>Portal of Exit:</strong> How it leaves the reservoir (blood, respiratory tract).</li><li><strong>Mode of Transmission:</strong> Contact, Droplet, or Airborne.</li><li><strong>Portal of Entry:</strong> How it enters the next person.</li><li><strong>Susceptible Host:</strong> The next patient or staff member.</li></ul>`,
      type: "video",
      image: "/infection_control_hero_1773092204162.png",
      example: "Real-Life: A common 'Reservoir' in hospitals is stagnant water in decorative fountains or poorly maintained HVAC drip pans.",
      chartData: [
        { label: "C. Difficile", val: 42, color: "var(--red)" },
        { label: "MRSA", val: 28, color: "var(--amber)" },
        { label: "Norovirus", val: 30, color: "var(--teal)" }
      ]
    },
    {
      title: "The Barrier Protocol & CDC Standards",
      body: `In healthcare, your gear is your shield. Under **CDC Standard Precautions**, we treat all blood and body fluids as infectious—no exceptions. But even the best armor fails if not applied correctly.\n\n<strong>The Donning Sequence:</strong>\n<ol><li><strong>Gown:</strong> Fully cover torso and wrap around back.</li><li><strong>Mask:</strong> Secure ties and perform seal check.</li><li><strong>Goggles:</strong> Ensure fit over eyes/prescription glasses.</li><li><strong>Gloves:</strong> Pull cuffs over the gown sleeves for 100% skin coverage.</li></ol>`,
      type: "video",
      image: "/infection_control_hero_1773092204162.png",
      example: "Pro Tip: If you have a beard, a standard mask may not provide a perfect seal. Use a 'hood' or 'PAPR' if the patient is on Airborne precautions."
    },
    {
      title: "Doffing Sequence: The High-Risk Moment",
      body: `Removal of PPE is the most dangerous moment of your shift. Studies show 70% of self-contamination happens during improper doffing.\n\n<strong>The Safe Removal (CDC Method):</strong>\n<ul><li><strong>Gloves First:</strong> Use the glove-in-glove technique. They are the most contaminated.</li><li><strong>Gown:</strong> Pull away from neck/shoulders, touching only the inside. Roll into a bundle.</li><li><strong>Exit Room:</strong> Perform hand hygiene IMMEDIATELY after gown removal.</li><li><strong>Mask:</strong> Handle only by the clean straps after exiting the room.</li></ul>`,
      example: "Case Study: A nurse touched her forehead with a contaminated glove while removing her mask, leading to a viral exposure. Don't rush the doffing process.",
      chartData: [
        { label: "Glove Removal", val: 62, color: "var(--red)" },
        { label: "Mask Removal", val: 18, color: "var(--amber)" },
        { label: "Gown Removal", val: 20, color: "var(--teal)" }
      ],
      interaction: {
        type: "mcq",
        question: "During the doffing (removal) sequence, you have just removed your contaminated gown. What MUST you do before touching your mask straps?",
        options: [
          "Immediately remove the mask",
          "Perform hand hygiene (sanitizer or soap)",
          "Put on a fresh pair of gloves",
          "Exit the patient room"
        ],
        correct: 1,
        feedback: "Correct. CDC guidelines state you must perform hand hygiene after gown removal and BEFORE touching your face or mask straps to prevent self-contamination."
      }
    }
  ],
  12: [
    {
      title: "Incident Reporting & IRAS System",
      body: `Florida Statute and **AHCA Rule 59A-3** require facilities to report specific clinical incidents through the **Incident Reporting and Analysis System (IRAS)**.\n\n<strong>The Reporting Windows:</strong>\n<ul class="stagger-list"><li><strong>2-Hour Window:</strong> Immediate verbal report for sentinel events like wrong-site surgery or abduction.</li><li><strong>24-Hour Window:</strong> Electronic IRAS filing for adverse events, resident elopement, or unexpected deaths.</li><li><strong>15-Day Window:</strong> Follow-up investigation and root cause analysis (RCA).</li></ul>`,
      type: "video",
      image: "/emergency_prep_hero_1773092311134.png"
    },
    {
      title: "Adverse Events vs. Sentinel Events",
      body: `Understanding the definition determines the reporting path. An <strong>Adverse Event</strong> is any incident over which health care personnel could exercise control and which is associated in whole or in part with the facility's medical intervention, rather than the patient's condition.\n\n<strong>Critical Examples:</strong>\n<ul><li>Fractures or serious injury resulting from a fall.</li><li>Medication errors resulting in clinical harm.</li><li>Equipment failure during a life-sustaining procedure.</li></ul>`,
      example: "Compliance Note: AHCA surveyors will cross-reference your internal nurses' notes with the IRAS database. Mismatches are a major red flag."
    }
  ],
  2: [
    {
      title: "Bloodborne Pathogens: The OSHA Standard",
      body: `OSHA's Bloodborne Pathogens standard (29 CFR 1910.1030) is designed to protect workers from health hazards related to HBV, HCV, and HIV. This standard applies to any employee who could be 'reasonably anticipated' to come into contact with blood or Other Potentially Infectious Materials (OPIM).\n\n<strong>Annual Requirement:</strong> This training is NOT a one-time event. It must be completed annually and within 10 days of any job assignment where exposure is possible.\n\n<strong>The Exposure Control Plan (ECP):</strong>\nOur facility maintains a written ECP that is accessible to you 24/7. It outlines our specific local protocols for sharps safety, waste disposal, and emergency response.`,
      type: "video",
      image: "/bloodborne_pathogens_hero_1773092231806.png"
    },
    {
      title: "Engineering & Work Practice Controls",
      body: `We don't just rely on PPE; we redesign the work environment to eliminate the risk at the source. Under the **Needlestick Safety and Prevention Act**, we are required to evaluate and use 'safer medical devices' annually with input from non-managerial staff.\n\n<strong>Key Controls:</strong>\n<ul><li><strong>Sharps Containers:</strong> Must be puncture-resistant, leakproof, and kept upright. Close and replace when 2/3 full.</li><li><strong>Hand Hygiene:</strong> Wash hands immediately after removing gloves or if skin is touched by blood.</li><li><strong>Prohibited Actions:</strong> Never recap needles by hand. No eating, drinking, or applying cosmetics in areas of potential exposure.</li></ul>`,
      example: "Mandatory: If you discover a full sharps container, report it immediately. Overfilling is a top OSHA citation."
    }
  ],
  7: [
    {
      title: "Emergency Preparedness & Florida Hurricanes",
      body: `In Florida, emergency preparedness isn't just a drill—it's a critical life-safety requirement under the **CMS Emergency Preparedness Rule**. Every facility must maintain a comprehensive Emergency Operations Plan (EOP) that addresses a 'Full Hazards' approach.\n\n<strong>The Command Structure:</strong>\nWe utilize the **Incident Command System (ICS)**. During a hurricane or infrastructure failure, roles become strictly hierarchical to ensure clear communication and rapid response.\n\n<strong>Critical Elements:</strong>\n<ul><li><strong>Communication:</strong> Redundant systems (satellite phones, ham radio) when cellular networks fail.</li><li><strong>Resources:</strong> 72-hour minimum supply of water, medications, and food.</li><li><strong>Evacuation:</strong> Pre-negotiated agreements with transport and sister facilities.</li></ul>`,
      type: "video",
      image: "/emergency_prep_hero_1773092311134.png"
    }
  ],
  5: [
    {
      title: "Corporate Compliance & The False Claims Act",
      body: `The **False Claims Act (31 U.S.C. §§ 3729-3733)** is the government's primary tool for protecting taxpayer money. It prohibits knowingly submitting a false claim to the government for payment.\n\n<strong>The 'Knowingly' Standard:</strong>\nYou don't need a 'specific intent to defraud'. Under the law, 'knowingly' includes acting with <strong>reckless disregard</strong> or <strong>deliberate ignorance</strong> of the truth. If you should have known the billing was wrong, you are liable.\n\n<strong>Compliance Pillars:</strong>\n<ul class="stagger-list"><li><strong>Monitoring:</strong> Regular internal audits of clinical documentation.</li><li><strong>Training:</strong> Ensuring every member knows the coding standards.</li><li><strong>Reporting:</strong> A zero-retaliation policy for whistle-blowers who report internal anomalies.</li></ul>`,
      type: "video",
      image: "/fraud_prevention_hero_1773092325162.png"
    }
  ],
  34: [
    {
      title: "The Threat Landscape in Healthcare",
      body: `Healthcare is the #1 target for ransomware because medical records are high-value and uptime is life-critical.\n\n<strong>Common Attack Vectors:</strong>\n<ul><li><strong>Phishing:</strong> Deceptive emails designed to steal credentials</li><li><strong>Social Engineering:</strong> Tricking staff over the phone</li><li><strong>Unsecured Devices:</strong> Personal phones or USB drives containing patient data</li></ul>`,
      type: "video",
      image: "/fraud_prevention_hero_1773092325162.png",
      example: "Shock Stat: The average cost of a healthcare data breach in 2024 exceeded $10 million."
    },
    {
      title: "Phishing Red Flags",
      body: `Always inspect emails carefully before clicking links or opening attachments.\n\n<strong>Look for:</strong>\n<ul><li>Urgent or threatening language ('Account suspended!', 'Action required!')</li><li>Slightly misspelled domain names (e.g., support@microsoft-care.com instead of microsoft.com)</li><li>Requests for passwords or sensitive information</li></ul>`,
      example: "Real World: A staff member received an email looking like it was from the CEO asking for a wire transfer change. Always verify financial requests via a phone call."
    },
  ],
  11: [
    {
      title: "ANE Framework: Florida Statute 415",
      body: `Florida has some of the strictest protections in the nation for the elderly and disabled. Under **Florida Statute 415**, you are legally required to understand and identify the three faces of harm:\n\n<ul class="stagger-list"><li><strong>Abuse:</strong> The intentional infliction of physical or psychological injury, as well as active deprivation of food, water, or shelter.</li><li><strong>Neglect:</strong> Failure to provide the care, supervision, and services necessary to maintain health.</li><li><strong>Exploitation:</strong> The improper use of a vulnerable adult's funds, assets, or property for personal gain.</li></ul>`,
      type: "video",
      image: "/abuse_prevention_hero_1773092297226.png",
      example: "Case Study: A staff member using a resident's ATM card with 'permission' is still considered Exploitation under Florida law."
    },
    {
      title: "The Mandatory Reporter & Protected Reporting",
      body: `In Florida, **every healthcare worker is a mandatory reporter**. You do not need absolute proof to report; you ONLY need a 'reasonable suspicion'. If you suspect harm and fail to report, YOU are liable for a third-degree felony.\n\n<strong>The DCF Abuse Hotline:</strong>\n<ul><li><strong>Availability:</strong> 24/7/365.</li><li><strong>Phone:</strong> 1-800-962-2873</li><li><strong>Web:</strong> reportabuse.dcf.state.fl.us</li></ul>\n\nFlorida law provides strict whistle-blower protections—you cannot be retaliated against for making a report in good faith.`,
      interaction: {
        type: "mcq",
        question: "A resident tells you their daughter is 'taking their social security money'. You aren't sure if it's true. What should you do?",
        options: ["Wait for proof before reporting", "Ask the daughter first", "Report to the DCF Abuse Hotline immediately", "Only tell your supervisor"],
        correct: 2,
        feedback: "Correct. Financial exploitation is a form of abuse. Under FS 415, reasonable suspicion is the only requirement for placing a report to the state hotline."
      }
    }
  ],
  31: [
    {
      title: "Human Trafficking in Florida Healthcare",
      body: `Florida consistently ranks as one of the states with the <strong>highest volume of human trafficking cases</strong> reported to the National Human Trafficking Hotline.\n\nUnder <strong>Section 456.0341, Florida Statutes</strong>, healthcare practitioners are REQUIRED to complete 1 hour of continuing education on human trafficking.\n\n<strong>Why Healthcare?</strong>\nStudies show that up to 88% of trafficking victims come into contact with a healthcare professional while being trafficked, yet many go unrecognized.`,
      type: "video",
      image: "/human_trafficking_awareness_hero_1773092472539.png",
      example: "Data: In Florida, over 1,500 cases of human trafficking are reported annually. Your intervention can save a life."
    },
    {
      title: "Recognizing the Hidden Indicators",
      body: `Trafficking victims are often 'hidden in plain sight'. They may have a 'handler' who insists on speaking for them or refuses to leave the exam room.\n\n<strong>Clinical Warning Signs:</strong>\n<ul><li><strong>Physical:</strong> Brands/tattoos of names/logos, untreated STI's, or signs of physical restraint.</li><li><strong>Behavioral:</strong> Scripted history, hyper-vigilance, and submissive posture.</li><li><strong>Operational:</strong> No identification, someone else holding their documents, and inability to provide a permanent address.</li></ul>`,
      example: "Mandatory: If you suspect trafficking, follow your facility's safety protocol. Never confront the suspected handler directly."
    },
  ],
  32: [
    {
      title: "Domestic Violence Requirements in Florida",
      body: `Under <strong>Section 456.031, Florida Statutes</strong>, many Florida healthcare license holders must complete a specialized course on domestic violence. Florida law recognizes that healthcare providers are uniquely positioned to intervene early.\n\n<strong>The Cycle of Violence:</strong>\nIt is rarely a single event. It often involves a pattern of 'Tension Building' followed by an 'Acute Incident' and then a 'Honeymoon' phase. Breaking this cycle requires professional intervention and support.`,
      type: "video",
      image: "/patient_rights_hero_1773093363663.png",
      example: "Data: In Florida, over 100,000 domestic violence incidents are reported annually."
    },
    {
      title: "Florida Victim Resources & Safety Planning",
      body: `Your role is to offer resources, not to force a decision. Helping a patient create a 'Safety Plan' can be the difference between life and death.\n\n<strong>Florida Resources:</strong>\n<ul><li><strong>Florida Domestic Violence Hotline:</strong> 1-800-500-1119</li><li><strong>Safe Space:</strong> Every Florida county has at least one certified domestic violence center.</li><li><strong>Address Confidentiality:</strong> The AG's office provides an ACP program for victims to keep their new address secret from the abuser.</li></ul>`,
      example: "Pro Tip: Provide phone numbers on 'palm cards' or discreet materials that can be easily hidden if the abuser is monitoring their belongings."
    }
  ],
  17: [
    {
      title: "Medical Documentation & CMS Compliance",
      body: `In any AHCA audit, your clinical notes are the 'Law of the Land'. If it isn't documented correctly, the service is deemed 'never performed', leading to claim denials and potential fraud investigations.\n\n<strong>The Golden Rules of Documentation:</strong>\n<ul class="stagger-list"><li><strong>Be Timely:</strong> Document as close to the event as possible—never 'pre-document'.</li><li><strong>Be Objective:</strong> Record what you see, hear, and do. No opinions (e.g., 'Patient was being difficult').</li><li><strong>Be Precise:</strong> Use exact times, dosages, and verbatim patient quotes.</li></ul>`,
      type: "video",
      image: "/hip_compliance_hero_1773092188472.png"
    }
  ],
  18: [
    {
      title: "Medication Management & The 6 Rights",
      body: `Medication errors are among the most frequent 'Serious Adverse Events' reported to AHCA. We maintain a zero-tolerance policy for bypasses of the electronic scanning system.\n\n<strong>The 6 Rights of Administration:</strong>\n<ul class="stagger-list"><li><strong>Right Patient:</strong> Verify with 2 independent identifiers.</li><li><strong>Right Medication:</strong> Ensure label matches original order.</li><li><strong>Right Dose:</strong> Double-check calculations for high-alert drugs.</li><li><strong>Right Route:</strong> IV, IM, PO, etc.</li><li><strong>Right Time:</strong> Adhere to the 'grace period' window.</li><li><strong>Right Documentation:</strong> Record immediately AFTER administration.</li></ul>`,
      type: "video",
      image: "/infection_control_hero_1773092204162.png"
    }
  ],
  10: [
    {
      title: "Fire Safety & Life Safety Code",
      body: `In a healthcare setting, we use the **'Defend in Place'** strategy. Because patients cannot easily evacuate, the building itself is a series of fire-rated compartments.\n\n<strong>The R.A.C.E. Protocol:</strong>\n<ul class="stagger-list"><li><strong>Rescue:</strong> Move patients in immediate danger.</li><li><strong>Alarm:</strong> Activate the fire alarm and call 911.</li><li><strong>Contain:</strong> Close all doors to starve the fire of oxygen.</li><li><strong>Extinguish:</strong> Use the extinguisher ONLY if the fire is small and you have a clear exit.</li></ul>`,
      type: "video",
      image: "/fire_safety_hero_1773092218263.png",
      example: "Tactical: When using an extinguisher, remember P.A.S.S. — Pull the pin, Aim at the base, Squeeze the handle, Sweep side-to-side."
    }
  ],
  33: [
    {
      title: "Alzheimer's & Dementia Care: The Florida Standard",
      body: `Florida has the second-highest prevalence of Alzheimer's in the U.S. As a healthcare worker in an ALF or Skilled Nursing facility, you are mandated by **Section 429.178, F.S.** to master specialized care techniques.\n\n<strong>Understanding the Progression:</strong>\n<ul class="stagger-list"><li><strong>Early Stage:</strong> Focus on independent functioning and memory aids.</li><li><strong>Middle Stage:</strong> High risk for 'Sun-downing', agitation, and wandering.</li><li><strong>Late Stage:</strong> Focus on sensory engagement, palliative comfort, and dignity.</li></ul>`,
      type: "video",
      image: "/alzheimers_care_hero_v2_1773093378765.png",
      example: "Stat: 1 in 3 seniors dies with Alzheimer's or another dementia. It kills more than breast cancer and prostate cancer combined."
    },
    {
      title: "Behavioral De-escalation & Communication",
      body: `When a resident with dementia becomes agitated, the 'Reasoned' part of their brain is offline. You must communicate with the 'Emotional' brain.\n\n<strong>The V.A.S.T. Framework:</strong>\n<ul><li><strong>Validate:</strong> Acknowledge their feeling without correcting their facts.</li><li><strong>Ask:</strong> Simple yes/no questions to identify physical needs (Pain, Hunger, Toilet).</li><li><strong>Shift:</strong> Gently redirect their attention to a pleasant sensory stimulus.</li><li><strong>Thrive:</strong> Maintain a calm, unhurried body language.</li></ul>`,
      example: "Pro Tip: Never argue or attempt to 're-orient' a resident who is in a different timeline. It only increases anxiety. If they think they are waiting for a bus to go to work in 1965, ask them what their job was—redirect them through their own memory.",
      chartData: [
        { label: "Grounding", val: 65, color: "var(--teal)" },
        { label: "Validation", val: 88, color: "var(--teal)" },
        { label: "Correction", val: 12, color: "var(--red)" }
      ],
      interaction: {
        type: "mcq",
        question: "A resident is crying because they 'need to go home to feed their mother' (who you know passed away years ago). What is the most effective approach?",
        options: [
          "Explain logically that their mother is no longer alive",
          "Tell them it is night time and no buses are running",
          "Validate their feeling: 'You must really love your mother. Tell me what she used to cook for you.'",
          "Ask them to go back to their room and rest"
        ],
        correct: 2,
        feedback: "Correct. This is 'Validation Therapy'. By acknowledging the underlying emotion and redirecting through a positive memory, you reduce their anxiety without causing the trauma of re-explaining a death."
      }
    }
  ],
  3: [
    {
      title: "HazCom & The GHS Standard",
      body: `OSHA's Hazard Communication Standard (HCS) is now aligned with the Globally Harmonized System (GHS). This provides a single, universal approach to chemical safety. In a medical facility, this covers everything from cleaning agents to clinical reagents.\n\n<strong>The 3 Pillars of GHS:</strong>\n<ul class="stagger-list"><li><strong>Labels:</strong> Must include a Signal Word ('Danger' or 'Warning') and specific Pictograms.</li><li><strong>SDS:</strong> Safety Data Sheets must follow a 16-section standardized format.</li><li><strong>Inventory:</strong> A master list of every chemical on the premises must be maintained.</li></ul>`,
      type: "video",
      image: "/hazcom_safety_hero_1773093350877.png",
      example: "Stat: HazCom violations are consistently in the top 5 most frequent OSHA citations in healthcare."
    }
  ],
  14: [
    {
      title: "Patient Rights & Grievance Procedures",
      body: `Healthcare is a partnership. Patients have fundamental rights protected by both federal law (CMS) and **Florida Statute**. Respecting these rights is the foundation of clinical ethics.\n\n<strong>Core Protections:</strong>\n<ul><li><strong>Self-Determination:</strong> The right to refuse any treatment or medication.</li><li><strong>Dignity:</strong> Protection from all forms of abuse, including psychological manipulation.</li><li><strong>Privacy:</strong> The right to have examinations and personal discussions kept private.</li></ul>\n\n<strong>The Grievance Path:</strong> All patients have the right to file a formal complaint without fear of retaliation. Florida requires a written response to grievances within a specific time-frame.`,
      type: "video",
      image: "/patient_rights_hero_1773093363663.png",
      example: "Audit Note: AHCA surveyors will interview residents specifically to check if they know WHO to talk to if they have a complaint."
    }
  ],
  35: [
    {
      title: "AI in Medical Compliance: The 2024 Playbook",
      body: `Artificial Intelligence is transforming how we manage AHCA surveys and CMS audits. By leveraging the **HHS AI Playbook**, we are moving from reactive monitoring to 'Predictive Compliance'.\n\n<strong>Our AI Governance Framework:</strong>\n<ul class="stagger-list"><li><strong>Algorithmic Oversight:</strong> Every AI-supported clinical decision must be reviewed by a human professional.</li><li><strong>Bias Detection:</strong> We audit our models to ensure equitable patient outcomes across all demographics.</li><li><strong>Data Integrity:</strong> AI inputs must be verified for accuracy to prevent 'hallucinations' in regulatory reporting.</li></ul>`,
      type: "video",
      image: "/ai_compliance_hero_1773120643581_png_1773125899123.png"
    }
  ],
  24: [
    {
      title: "Radiation Safety for Imaging Professionals",
      body: `Under NRC and Florida DOH regulations, we practice the **ALARA** principle: 'As Low As Reasonably Achievable'. This protects both our staff and our patients from the cumulative effects of ionizing radiation.\n\n<strong>The 3 Keys to Protection:</strong>\n<ul><li><strong>Time:</strong> Minimize the duration of exposure.</li><li><strong>Distance:</strong> Use the inverse square law—doubling the distance reduces exposure by 75%.</li><li><strong>Shielding:</strong> Always utilize lead aprons, thyroid shields, and mobile barriers provided in the Imaging Suite.</li></ul>`,
      type: "video",
      image: "/radiation_safety_hero_1773120643582_png_1773125917662.png"
    }
  ],
  25: [
    {
      title: "Chemical Hygiene & Lab Safety Protocols",
      body: `Our laboratory environment contains diverse chemical hazards. OSHA's <strong>Chemical Hygiene Plan (CHP)</strong> is our roadmap for safe handling and emergency response.\n\n<strong>Key Safety Measures:</strong>\n<ul class="stagger-list"><li><strong>Fume Hood Mastery:</strong> All volatile or reactive procedures MUST be performed under the hood with the sash at the correct height.</li><li><strong>Pictogram Recognition:</strong> Understand GHS symbols for corrosive, flammable, and toxic materials.</li><li><strong>Spill Response:</strong> Know the location of the neutralizer kits and the mandatory reporting path for any exposure.</li></ul>`,
      type: "video",
      image: "/chemical_hygiene_hero_1773120643583_png_1773125934470.png"
    }
  ],
  20: [
    {
      title: "OIG Compliance for Senior Leadership",
      body: `The HHS Office of Inspector General (OIG) expects a 'Seven-Element' compliance program for any facility receiving federal funds. Leadership sets the <strong>Tone at the Top</strong>.\n\n<strong>Effective Compliance Indicators:</strong>\n<ul><li><strong>Access:</strong> The Compliance Officer must have a direct line to the Board of Directors.</li><li><strong>Responsiveness:</strong> All identified anomalies must be investigated and remediated within defined timeframes.</li><li><strong>Enforcement:</strong> Compliance standards must be applied consistently across all levels of the organization.</li></ul>`,
      type: "video"
    }
  ],
  15: [
    {
      title: "Background Screening & HB 975 Compliance",
      body: `Effective July 1, 2025, **HB 975** significantly updates Florida's screening requirements. This course ensures your facility remains compliant with Level 2 background checks and the Clearinghouse system.\n\n<strong>Key Updates:</strong>\n<ul class="stagger-list"><li><strong>Mandatory Rescreening:</strong> Specific triggers for five-year fingerprints and annual attestations.</li><li><strong>Disqualifying Offenses:</strong> Expanded list of offenses that preclude employment in vulnerable adult settings.</li><li><strong>Exemption Path:</strong> Strict protocols for reporting and managing 'Exemption from Disqualification' requests.</li></ul>`,
      type: "video",
      image: "/patient_rights_hero_1773093363663.png"
    }
  ]
};

const DEFAULT_SLIDES = [
  {
    title: "The Florida Regulatory Landscape",
    body: `Florida healthcare facilities operate under a dual-oversight model, reporting to both the <strong>Agency for Health Care Administration (AHCA)</strong> and federal bodies like <strong>CMS</strong> and <strong>OSHA</strong>.\n\nCompliance isn't just a set of rules—it's the operational framework that ensures resident safety, fiscal integrity, and clinical excellence. In this module, we will bridge the gap between abstract regulations and your daily clinical or administrative actions.\n\n<strong>Key Agencies:</strong>\n<ul><li><strong>AHCA:</strong> The primary state regulator for Florida hospitals, ALFs, and nursing homes.</li><li><strong>CMS:</strong> Sets the 'Conditions of Participation' (CoP) for any facility receiving Medicare/Medicaid.</li><li><strong>DCF:</strong> Manages the Florida Abuse Hotline and vulnerable adult investigations.</li></ul>`
  },
  {
    title: "Standard of Care & Individual Accountability",
    body: `The 'Standard of Care' is the legal benchmark for measuring your performance. Under Florida law, you are expected to perform duties with the same level of skill and care as a 'reasonably prudent' professional in your role.\n\n<strong>Professional Consequences:</strong>\nIgnoring compliance isn't just an HR issue—it can lead to <strong>Individual Licensure Action</strong>, civil penalties under the False Claims Act, and in cases of gross negligence, criminal prosecution.\n\n<strong>Audit Readiness:</strong>\nAHCA surveyors don't just look at files; they observe your workflows. You must be prepared to articulate the 'Why' behind our safety protocols at any time.`
  },
  {
    title: "Documentation: The Legal Mirror",
    body: `In the world of medical compliance, the governing maxim is: <strong>'If it isn't documented correctly, it didn't happen.'</strong>\n\nFlorida auditors look for the <strong>N.O.F.A.</strong> reporting standard:\n<ul class="stagger-list"><li><strong>Narrative:</strong> A clear, objective chronological account of the event.</li><li><strong>Observation:</strong> Physical signs or verbatim quotes from the patient.</li><li><strong>Fact:</strong> Measurable data (vitals, time, dosage), never opinions.</li><li><strong>Action:</strong> Your specific intervention and the patient's response.</li></ul>\n\nAccurate documentation is your strongest defense during a survey or legal proceeding.`
  }
];

// ── Required Courses Reference Data ────────────────────────────────────────
const FACILITY_TYPES = [
  {
    id: "all",
    label: "All Facilities",
    icon: "🏥",
    color: "teal",
    desc: "Universal requirements applying to every licensed Florida healthcare employer",
    govBody: "CMS / OSHA / HHS / AHCA",
    courses: [
      { name: "HIPAA Privacy & Security", citation: "45 CFR Parts 160 & 164", freq: "Annual + At Hire", mandatory: true, courseId: 1 },
      { name: "OSHA Bloodborne Pathogens", citation: "29 CFR 1910.1030", freq: "Annual + within 10 days of hire", mandatory: true, courseId: 2 },
      { name: "OSHA Hazard Communication (HazCom)", citation: "29 CFR 1910.1200", freq: "Annual", mandatory: true, courseId: 3 },
      { name: "Fraud, Waste & Abuse (FWA)", citation: "42 CFR §422.503(b)", freq: "Within 90 days of hire + Annual", mandatory: true, courseId: 4 },
      { name: "Corporate Compliance / False Claims Act", citation: "31 U.S.C. §§ 3729-3733", freq: "Annual", mandatory: true, courseId: 5 },
      { name: "Emergency Preparedness", citation: "CMS/OSHA Dual Standard", freq: "Annual", mandatory: true, courseId: 7 },
      { name: "Infection Control & Prevention", citation: "CDC/CMS Guidelines", freq: "Annual", mandatory: true, courseId: 8 },
      { name: "Workplace Violence Prevention", citation: "OSHA 3148-04R", freq: "Annual", mandatory: true, courseId: 9 },
      { name: "Fire Safety & Life Safety", citation: "NFPA 101 / CMS", freq: "Annual", mandatory: true, courseId: 10 },
      { name: "Abuse, Neglect & Exploitation (ANE) Prevention", citation: "FL Statute 415 / AHCA", freq: "At Hire + Annual", mandatory: true, courseId: 11 },
      { name: "IRAS — Incident Reporting & Analysis System", citation: "AHCA Rule 59A-3", freq: "At Hire", mandatory: true, courseId: 12 },
      { name: "Patient Rights & Grievance Procedures", citation: "AHCA 59A-3.264", freq: "Annual", mandatory: true, courseId: 14 },
      { name: "Background Screening Compliance — HB 975", citation: "HB 975 (eff. July 1, 2025)", freq: "At Hire", mandatory: true, courseId: 15 },
      { name: "Human Trafficking Awareness for Healthcare", citation: "Section 456.0341, Florida Statutes", freq: "Biennial", mandatory: true, courseId: 31 },
    ]
  },
  {
    id: "alf",
    label: "Assisted Living Facilities",
    icon: "🏡",
    color: "amber",
    desc: "AHCA Rule 58A-5 governs ALFs. Staff requirements are among the most detailed in Florida healthcare.",
    govBody: "AHCA Rule 58A-5",
    courses: [
      { name: "ALF Core Training — Initial 26-Hour Course", citation: "FL Statute 429.52 / AHCA 58A-5.0191", freq: "Pre-employment or within 30 days", mandatory: true, courseId: 27 },
      { name: "ALF In-Service Training — 6 Hours Annual", citation: "AHCA Rule 58A-5.0191(3)", freq: "Annual (6 hrs minimum)", mandatory: true, courseId: 27 },
      { name: "Alzheimer's / Dementia Care (Level I)", citation: "FL Statute 429.178 / 58A-5.0181", freq: "At hire (4 hrs)", mandatory: true, courseId: 33 },
      { name: "Resident Elopement Prevention & Response", citation: "AHCA 58A-5.0182", freq: "Annual", mandatory: true, courseId: null },
      { name: "Residents' Rights & Dignity", citation: "FL Statute 429.28", freq: "At hire + Annual", mandatory: true, courseId: 14 },
      { name: "Medication Management for ALF Staff", citation: "AHCA 58A-5.0185", freq: "Annual", mandatory: true, courseId: 18 },
      { name: "Emergency Management for ALF", citation: "AHCA 58A-5.026", freq: "Annual (includes drills)", mandatory: true, courseId: 7 },
      { name: "Fall Prevention & Reduction", citation: "AHCA Best Practice Mandate", freq: "Annual", mandatory: true, courseId: null },
      { name: "Nutrition & Hydration for Elderly Residents", citation: "AHCA 58A-5.020", freq: "Annual", mandatory: false, courseId: null },
      { name: "Documentation & Care Plan Standards", citation: "AHCA 58A-5.0181", freq: "Annual", mandatory: true, courseId: 17 },
    ]
  },
  {
    id: "hha",
    label: "Home Health Agencies",
    icon: "🏠",
    color: "green",
    desc: "Licensed under AHCA Rule 59A-8. Florida has one of the largest home health workforces in the country.",
    govBody: "AHCA Rule 59A-8 / CMS CoP 42 CFR 484",
    courses: [
      { name: "Home Health Aide (HHA) Initial 75-Hour Training", citation: "42 CFR 484.80 / AHCA 59A-8.0095", freq: "Pre-employment", mandatory: true, courseId: 28 },
      { name: "HHA Competency Evaluation — Annual", citation: "42 CFR 484.80(e)", freq: "Annual", mandatory: true, courseId: 28 },
      { name: "Home Health Infection Control", citation: "CMS CoP 42 CFR 484.70", freq: "Annual", mandatory: true, courseId: 8 },
      { name: "Patient Rights in the Home Setting", citation: "42 CFR 484.50 / AHCA 59A-8", freq: "At hire + Annual", mandatory: true, courseId: 14 },
      { name: "Proper Body Mechanics & Injury Prevention", citation: "OSHA / AHCA 59A-8", freq: "At hire + Annual", mandatory: true, courseId: null },
      { name: "Handling Emergencies in the Home", citation: "AHCA 59A-8.0085", freq: "Annual", mandatory: true, courseId: 7 },
      { name: "Documenting Care in the Home (OASIS/485)", citation: "CMS OASIS Requirements", freq: "Annual", mandatory: true, courseId: 17 },
      { name: "Recognizing & Reporting ANE in Home Settings", citation: "FL Statute 415 / DCF", freq: "At hire + Annual", mandatory: true, courseId: 11 },
      { name: "Telehealth & Remote Patient Monitoring", citation: "AHCA / FL HB 7025", freq: "Annual", mandatory: false, courseId: 30 },
    ]
  },
  {
    id: "hospital",
    label: "Hospitals & Health Systems",
    icon: "🏨",
    color: "teal",
    desc: "CMS Conditions of Participation + The Joint Commission accreditation standards + AHCA licensure.",
    govBody: "CMS CoP / TJC / AHCA",
    courses: [
      { name: "National Patient Safety Goals (NPSG)", citation: "The Joint Commission Annual Update", freq: "Annual", mandatory: true, courseId: null },
      { name: "Restraint & Seclusion — CMS Standards", citation: "42 CFR 482.13(e)", freq: "Annual", mandatory: true, courseId: null },
      { name: "EMTALA — Emergency Medical Treatment Obligations", citation: "42 CFR 489.24", freq: "At hire + Annual for ER staff", mandatory: true, courseId: 21 },
      { name: "Hand Hygiene Compliance", citation: "CDC / TJC NPSG 07.01.01", freq: "Annual", mandatory: true, courseId: 8 },
      { name: "Medical Staff Credentialing Requirements", citation: "CMS 42 CFR 482.22 / TJC MS.06", freq: "At hire", mandatory: true, courseId: null },
      { name: "Moderate Sedation Competency", citation: "TJC RC.02.01.01", freq: "Annual", mandatory: true, courseId: null },
      { name: "Preventing Central Line Infections (CLABSI)", citation: "CDC / TJC NPSG 07.04.01", freq: "Annual", mandatory: true, courseId: null },
      { name: "Preventing Falls with Injury", citation: "TJC NPSG 09.02.01", freq: "Annual", mandatory: true, courseId: null },
      { name: "Suicide Risk Reduction", citation: "TJC NPSG 15.01.01", freq: "Annual", mandatory: true, courseId: null },
      { name: "Anti-Kickback & Stark Law for Hospital Staff", citation: "42 U.S.C. § 1320a-7b", freq: "Annual", mandatory: true, courseId: 6 },
      { name: "Documentation & Medical Record Standards", citation: "CMS 42 CFR 482.24", freq: "Annual", mandatory: true, courseId: 17 },
    ]
  },
  {
    id: "behavioral",
    label: "Behavioral Health Centers",
    icon: "🧠",
    color: "teal",
    desc: "DCF-licensed facilities and AHCA-licensed providers. Covers Baker Act, Marchman Act, and substance abuse.",
    govBody: "FL DCF / AHCA / FL Statute 394 & 397",
    courses: [
      { name: "Baker Act — Involuntary Examination Procedures", citation: "FL Statute 394.451-.4789", freq: "At hire + Annual", mandatory: true, courseId: 29 },
      { name: "Marchman Act — Substance Abuse Intervention", citation: "FL Statute 397", freq: "At hire + Annual", mandatory: true, courseId: 29 },
      { name: "Crisis Intervention & De-escalation", citation: "AHCA / DCF Requirements", freq: "At hire + Annual", mandatory: true, courseId: null },
      { name: "Suicide Prevention & Zero Suicide Framework", citation: "FL Statute 394 / SAMHSA", freq: "Annual", mandatory: true, courseId: null },
      { name: "Trauma-Informed Care", citation: "SAMHSA / DCF Standards", freq: "Annual", mandatory: true, courseId: null },
      { name: "Seclusion & Restraint — Behavioral Settings", citation: "42 CFR 483.358 / FL Rule 65E-14", freq: "Annual", mandatory: true, courseId: null },
      { name: "Substance Abuse Counselor Ethics", citation: "FL Statute 491 / 490", freq: "Annual (CE required)", mandatory: true, courseId: null },
      { name: "Documentation in Behavioral Health (SOAP/DAP)", citation: "DCF 65E-14 / CARF Standards", freq: "Annual", mandatory: true, courseId: 17 },
      { name: "LGBTQ+ Affirming Care — Best Practices", citation: "DCF / SAMHSA Guidelines", freq: "Annual", mandatory: false, courseId: null },
    ]
  },
  {
    id: "physician",
    label: "Physician Offices & Clinics",
    icon: "⚕️",
    color: "teal",
    desc: "AHCA-licensed offices, CMS-participating practices. Smaller staff but full federal compliance requirements apply.",
    govBody: "CMS / AHCA / FL DOH",
    courses: [
      { name: "HIPAA for Medical Practices", citation: "45 CFR Parts 160 & 164", freq: "At hire + Annual", mandatory: true, courseId: 1 },
      { name: "OSHA Bloodborne Pathogens", citation: "29 CFR 1910.1030", freq: "Annual + within 10 days", mandatory: true, courseId: 2 },
      { name: "Fraud, Waste & Abuse (Medicare/Medicaid)", citation: "42 CFR §422.503(b)", freq: "Within 90 days + Annual", mandatory: true, courseId: 4 },
      { name: "Medical Record Documentation Standards", citation: "CMS Documentation Guidelines", freq: "Annual", mandatory: true, courseId: 17 },
      { name: "Prescription Drug Monitoring (PDMP)", citation: "FL Statute 893.055", freq: "At hire + Biennial", mandatory: true, courseId: null },
      { name: "Florida Controlled Substance Rules", citation: "FL Statute 893 / DEA", freq: "Biennial (CE)", mandatory: true, courseId: null },
      { name: "HIV Testing & Informed Consent", citation: "FL Statute 381.004", freq: "Once (at hire)", mandatory: true, courseId: 16 },
      { name: "Advance Directives & End-of-Life Documentation", citation: "FL Statute 765", freq: "Annual", mandatory: true, courseId: null },
      { name: "Safe Injection Practices", citation: "CDC / AHCA Guidance", freq: "Annual", mandatory: true, courseId: null },
      { name: "Sexual Misconduct Prevention", citation: "FL Statute 456.063", freq: "Every 2 years (CE)", mandatory: true, courseId: null },
    ]
  },
  {
    id: "longterm",
    label: "Skilled Nursing / Long-Term Care",
    icon: "🛏️",
    color: "amber",
    desc: "Among the most heavily regulated settings. CMS F-Tags, AHCA surveys, and resident rights are paramount.",
    govBody: "CMS 42 CFR 483 / AHCA / TJC",
    courses: [
      { name: "Resident Rights & Dignity — Long-Term Care", citation: "42 CFR 483.10 / CMS F-Tags", freq: "At hire + Annual", mandatory: true, courseId: 14 },
      { name: "Abuse, Neglect & Exploitation in LTC", citation: "42 CFR 483.12 / FL Statute 415", freq: "At hire + Annual", mandatory: true, courseId: 11 },
      { name: "Dementia / Alzheimer's Care Competency", citation: "CMS F-Tag 758 / FL Statute 400", freq: "Annual (12 hrs)", mandatory: true, courseId: null },
      { name: "Pressure Injury Prevention & Wound Care", citation: "CMS F-Tag 686 / AHCA", freq: "Annual", mandatory: true, courseId: null },
      { name: "Dining & Nutrition — CMS Requirements", citation: "42 CFR 483.60", freq: "Annual", mandatory: true, courseId: null },
      { name: "CNA In-Service Training (12 hrs annual)", citation: "42 CFR 483.95 / FL Statute 400.211", freq: "Annual (12 hrs)", mandatory: true, courseId: null },
      { name: "Fall Prevention in Long-Term Care", citation: "CMS F-Tag 689", freq: "Annual", mandatory: true, courseId: null },
      { name: "Infection Prevention — LTC Specific", citation: "42 CFR 483.80 / CDC NHSN", freq: "Annual", mandatory: true, courseId: 8 },
      { name: "Surveyor Readiness & CMS F-Tag Overview", citation: "CMS State Operations Manual", freq: "Annual", mandatory: true, courseId: null },
      { name: "Medication Management in LTC", citation: "42 CFR 483.45", freq: "Annual", mandatory: true, courseId: 18 },
    ]
  },
  {
    id: "dental",
    label: "Dental Practices",
    icon: "🦷",
    color: "teal",
    desc: "Florida Board of Dentistry continuing education requirements plus OSHA and AHCA standards.",
    govBody: "FL Board of Dentistry / AHCA / OSHA",
    courses: [
      { name: "OSHA Bloodborne Pathogens for Dental", citation: "29 CFR 1910.1030", freq: "Annual + within 10 days", mandatory: true, courseId: 2 },
      { name: "Dental Infection Control & Sterilization", citation: "CDC Dental Guidelines 2016", freq: "Annual", mandatory: true, courseId: 8 },
      { name: "Nitrous Oxide / Analgesia Safety", citation: "FL Rule 64B5-14 / AHCA", freq: "Before administering", mandatory: true, courseId: null },
      { name: "Dental Radiography Safety & ALARA", citation: "64B5-17 / ACR", freq: "Annual", mandatory: true, courseId: 24 },
      { name: "Medical Emergencies in the Dental Office", citation: "FL Board of Dentistry", freq: "Every 2 years (CE)", mandatory: true, courseId: null },
      { name: "HIPAA for Dental Practices", citation: "45 CFR Parts 160 & 164", freq: "At hire + Annual", mandatory: true, courseId: 1 },
      { name: "Florida Dental CE — 30 Hours Biennial", citation: "FL Statute 466.013", freq: "Every 2 years", mandatory: true, courseId: null },
      { name: "Child Abuse Recognition & Reporting", citation: "FL Statute 415 / 39", freq: "At hire", mandatory: true, courseId: 11 },
      { name: "PDMP Prescribing Requirements", citation: "FL Statute 893.055", freq: "Before prescribing controlled substances", mandatory: true, courseId: null },
    ]
  },
];

const REQ_ROLES = [
  {
    role: "Registered Nurse (RN)", licenseBody: "Florida Board of Nursing (BON)", ceHours: "24 hrs/2 years", courses: [
      { name: "HIPAA", freq: "Annual", courseId: 1 }, { name: "Bloodborne Pathogens", freq: "Annual", courseId: 2 }, { name: "ANE Prevention", freq: "Annual", courseId: 11 },
      { name: "Domestic Violence (2 hrs)", freq: "Every renewal — FL Statute 464.003", courseId: 32 }, { name: "Medical Errors (2 hrs)", freq: "Every renewal — FL 458.303" },
      { name: "Human Trafficking (1 hr)", freq: "Every renewal — FL Statute 409.17", courseId: 31 }, { name: "Laws & Rules (2 hrs)", freq: "Every renewal" },
    ]
  },
  {
    role: "Licensed Practical Nurse (LPN)", licenseBody: "Florida Board of Nursing (BON)", ceHours: "24 hrs/2 years", courses: [
      { name: "HIPAA", freq: "Annual" }, { name: "Bloodborne Pathogens", freq: "Annual" },
      { name: "Domestic Violence (2 hrs)", freq: "Every renewal" }, { name: "Medical Errors (2 hrs)", freq: "Every renewal" },
      { name: "Human Trafficking (1 hr)", freq: "Every renewal" }, { name: "Laws & Rules (2 hrs)", freq: "Every renewal" },
    ]
  },
  {
    role: "Physician (MD/DO)", licenseBody: "FL Board of Medicine / Osteopathic Medicine", ceHours: "40 hrs/2 years", courses: [
      { name: "Controlled Substance Prescribing (2 hrs)", freq: "Every renewal — FL Statute 458.326" },
      { name: "Domestic Violence (2 hrs)", freq: "Every renewal" }, { name: "Medical Errors (2 hrs)", freq: "Every renewal" },
      { name: "Human Trafficking (1 hr)", freq: "Every renewal" }, { name: "Laws & Rules (2 hrs)", freq: "Every renewal" },
      { name: "HIV/AIDS (1 hr)", freq: "Once — FL Statute 381.0041" },
    ]
  },
  {
    role: "Medical Assistant (CMA)", licenseBody: "AHCA (not state-licensed)", ceHours: "Per employer policy", courses: [
      { name: "HIPAA", freq: "Annual" }, { name: "Bloodborne Pathogens", freq: "Annual" },
      { name: "ANE Prevention", freq: "Annual" }, { name: "Emergency Preparedness", freq: "Annual" },
    ]
  },
  {
    role: "Physical Therapist (PT)", licenseBody: "FL Board of Physical Therapy Practice", ceHours: "26 hrs/2 years", courses: [
      { name: "Domestic Violence (2 hrs)", freq: "Every renewal" }, { name: "Medical Errors (2 hrs)", freq: "Every renewal" },
      { name: "Human Trafficking (1 hr)", freq: "Every renewal" }, { name: "Laws & Rules (2 hrs)", freq: "Every renewal" },
      { name: "Prevention of Medical Errors", freq: "Every renewal" },
    ]
  },
  {
    role: "Social Worker (LCSW/LMSW)", licenseBody: "FL Board of Clinical Social Work", ceHours: "30 hrs/2 years", courses: [
      { name: "Laws & Rules (3 hrs)", freq: "Every renewal" }, { name: "Human Trafficking (1 hr)", freq: "Every renewal" },
      { name: "Domestic Violence (2 hrs)", freq: "Every renewal" }, { name: "Medical Errors", freq: "Every renewal" },
      { name: "HIV/AIDS (1 hr)", freq: "Once" },
    ]
  },
  {
    role: "Home Health Aide (HHA)", licenseBody: "AHCA / CMS CoP", ceHours: "75 hrs initial / 12 hrs annual", courses: [
      { name: "Initial 75-Hour Training Program", freq: "Pre-employment" },
      { name: "12-Hour Annual In-Service", freq: "Annual — 42 CFR 484.80" },
      { name: "Competency Evaluation — 13 Skills", freq: "Annual" },
      { name: "ANE Recognition & Reporting", freq: "Annual" },
    ]
  },
  {
    role: "Certified Nursing Assistant (CNA)", licenseBody: "AHCA / FL Nurse Aide Registry", ceHours: "75 hrs initial / 12 hrs annual", courses: [
      { name: "State-Approved 75-Hour CNA Program", freq: "Pre-employment" },
      { name: "12-Hour Annual In-Service", freq: "Annual — 42 CFR 483.95" },
      { name: "ANE Prevention", freq: "Annual" },
      { name: "Residents' Rights", freq: "Annual" },
    ]
  },
];

// ── Required Courses View Component ────────────────────────────────────────
function RequiredCoursesView({ onStartCourse, completedCourses }) {
  const [activeTab, setActiveTab] = useState("facility");
  const [activeFacility, setActiveFacility] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  const facility = FACILITY_TYPES.find(f => f.id === activeFacility);

  const allCourses = FACILITY_TYPES.flatMap(f => f.courses.map(c => ({ ...c, facilityLabel: f.label })));
  const uniqueFiltered = searchQ.length > 1
    ? allCourses.filter(c => c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.citation.toLowerCase().includes(searchQ.toLowerCase()))
    : [];

  return (
    <>
      {/* Header bar */}
      <div style={{ background: "linear-gradient(135deg, rgba(0,212,200,0.08), rgba(0,212,200,0.02))", border: "1px solid rgba(0,212,200,0.2)", borderRadius: 12, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 700, color: "var(--warm)", marginBottom: 4 }}>
            🌴 Florida Healthcare Compliance — Mandatory Training Reference
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Official requirements by facility type and license category · AHCA / CMS / FL DOH · Updated March 2026
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge-pill badge-teal">{FACILITY_TYPES.reduce((a, f) => a + f.courses.length, 0)} total requirements</span>
          <span className="badge-pill badge-amber">{FACILITY_TYPES.length} facility types</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <input
          style={{ width: "100%", background: "var(--navy2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px 12px 42px", color: "var(--warm)", fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }}
          placeholder="Search requirements by name or regulatory citation..."
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 16 }}>⌕</span>
        {searchQ && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", cursor: "pointer", fontSize: 14 }} onClick={() => setSearchQ("")}>✕</span>}
      </div>

      {/* Search results */}
      {searchQ.length > 1 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><span className="card-title">Search Results — {uniqueFiltered.length} matches</span></div>
          <div className="card-body" style={{ padding: "8px 16px" }}>
            {uniqueFiltered.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No matches found</div>
            ) : (
              <table className="table">
                <thead><tr><th>Course</th><th>Facility Type</th><th>Citation</th><th>Frequency</th><th>Mandatory</th></tr></thead>
                <tbody>
                  {uniqueFiltered.slice(0, 20).map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</td>
                      <td><span className="badge-pill badge-teal" style={{ fontSize: 10 }}>{c.facilityLabel}</span></td>
                      <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{c.citation}</td>
                      <td style={{ fontSize: 12, color: "var(--warm2)" }}>{c.freq}</td>
                      <td>{c.mandatory ? <span className="badge-pill badge-red" style={{ fontSize: 10 }}>Required</span> : <span className="badge-pill badge-muted" style={{ fontSize: 10 }}>Recommended</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${activeTab === "facility" ? "active" : ""}`} onClick={() => setActiveTab("facility")}>By Facility Type</div>
        <div className={`tab ${activeTab === "role" ? "active" : ""}`} onClick={() => setActiveTab("role")}>By License / Role</div>
        <div className={`tab ${activeTab === "matrix" ? "active" : ""}`} onClick={() => setActiveTab("matrix")}>Compliance Matrix</div>
      </div>

      {/* Facility Tab */}
      {activeTab === "facility" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
          {/* Left nav */}
          <div>
            {FACILITY_TYPES.map(f => (
              <div key={f.id}
                onClick={() => setActiveFacility(f.id)}
                style={{
                  padding: "12px 16px", borderRadius: 10, cursor: "pointer", marginBottom: 6,
                  background: activeFacility === f.id ? "var(--teal3)" : "var(--navy2)",
                  border: `1px solid ${activeFacility === f.id ? "rgba(0,212,200,0.3)" : "var(--border)"}`,
                  transition: "all 0.15s"
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: activeFacility === f.id ? "var(--teal)" : "var(--warm)", lineHeight: 1.3 }}>{f.label}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{f.courses.length} requirements</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right content */}
          {facility && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 26 }}>{facility.icon}</span>
                        <span style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 800, color: "var(--warm)" }}>{facility.label}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 520 }}>{facility.desc}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>GOVERNING BODY</div>
                      <div style={{ fontSize: 12, color: "var(--teal)", fontFamily: "var(--font-mono)" }}>{facility.govBody}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span className="badge-pill badge-red">{facility.courses.filter(c => c.mandatory).length} mandatory</span>
                    <span className="badge-pill badge-muted">{facility.courses.filter(c => !c.mandatory).length} recommended</span>
                    <span className="badge-pill badge-green">{facility.courses.filter(c => c.courseId && completedCourses.has(c.courseId)).length} completed in your org</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Required Training Courses</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{facility.courses.length} total</span>
                </div>
                <div style={{ padding: "8px 16px" }}>
                  <table className="table">
                    <thead><tr>
                      <th style={{ width: 32 }}>#</th>
                      <th>Course Name</th>
                      <th>Regulatory Citation</th>
                      <th>Frequency</th>
                      <th>Status</th>
                      <th></th>
                    </tr></thead>
                    <tbody>
                      {facility.courses.map((c, i) => {
                        const linked = COURSES.find(x => x.id === c.courseId);
                        const done = c.courseId && completedCourses.has(c.courseId);
                        return (
                          <tr key={i}>
                            <td style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{i + 1}</td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--warm)", marginBottom: 2 }}>{c.name}</div>
                              {!c.mandatory && <span style={{ fontSize: 10, color: "var(--muted)" }}>Recommended</span>}
                            </td>
                            <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{c.citation}</td>
                            <td style={{ fontSize: 12, color: "var(--warm2)" }}>{c.freq}</td>
                            <td>
                              {!c.mandatory ? <span className="badge-pill badge-muted" style={{ fontSize: 10 }}>Recommended</span>
                                : done ? <span className="badge-pill badge-green" style={{ fontSize: 10 }}>✓ Complete</span>
                                  : <span className="badge-pill badge-red" style={{ fontSize: 10 }}>Required</span>}
                            </td>
                            <td>
                              {linked ? (
                                <button className="btn btn-outline" style={{ padding: "5px 12px", fontSize: 11 }}
                                  onClick={() => onStartCourse(linked)}>
                                  {done ? "Retake" : "Start →"}
                                </button>
                              ) : (
                                <span style={{ fontSize: 11, color: "var(--muted)" }}>Coming soon</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role Tab */}
      {activeTab === "role" && (
        <div>
          {REQ_ROLES.map((r, ri) => (
            <div key={ri} className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <div>
                  <span className="card-title">{r.role}</span>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, fontFamily: "var(--font-mono)" }}>{r.licenseBody} · {r.ceHours}</div>
                </div>
                <span className="badge-pill badge-amber" style={{ fontSize: 10 }}>CE: {r.ceHours}</span>
              </div>
              <div style={{ padding: "8px 16px" }}>
                <table className="table">
                  <thead><tr><th>Required Training</th><th>Frequency / Regulatory Trigger</th></tr></thead>
                  <tbody>
                    {r.courses.map((c, ci) => (
                      <tr key={ci}>
                        <td style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</td>
                        <td style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{c.freq}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matrix Tab */}
      {activeTab === "matrix" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Compliance Matrix — Core Courses × Facility Types</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>✓ = Required · R = Recommended · — = N/A</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>Course</th>
                  {FACILITY_TYPES.map(f => (
                    <th key={f.id} style={{ textAlign: "center", fontSize: 10, whiteSpace: "nowrap" }}>{f.icon} {f.label.split(" ")[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "HIPAA Privacy & Security",
                  "OSHA Bloodborne Pathogens",
                  "OSHA HazCom",
                  "Fraud, Waste & Abuse",
                  "ANE Prevention",
                  "IRAS Incident Reporting",
                  "Emergency Preparedness",
                  "Infection Control",
                  "Patient Rights & Grievances",
                  "Background Screening (HB 975)",
                  "Workplace Violence Prevention",
                  "Fire Safety",
                  "Medication Management",
                  "Medical Documentation",
                  "HIV/AIDS Awareness",
                  "Human Trafficking Awareness",
                  "Domestic Violence Awareness",
                  "Alzheimer's & Dementia Care",
                ].map((courseName, ci) => {
                  const matrixData = {
                    "HIPAA Privacy & Security": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
                    "OSHA Bloodborne Pathogens": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
                    "OSHA HazCom": ["✓", "R", "✓", "✓", "R", "✓", "R", "R"],
                    "Fraud, Waste & Abuse": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
                    "ANE Prevention": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
                    "IRAS Incident Reporting": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "R"],
                    "Emergency Preparedness": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
                    "Infection Control": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
                    "Patient Rights & Grievances": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
                    "Background Screening (HB 975)": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
                    "Workplace Violence Prevention": ["✓", "✓", "✓", "✓", "R", "R", "✓", "R"],
                    "Fire Safety": ["✓", "✓", "✓", "✓", "R", "✓", "✓", "R"],
                    "Medication Management": ["R", "✓", "R", "✓", "✓", "R", "✓", "R"],
                    "Medical Documentation": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "R"],
                    "HIV/AIDS Awareness": ["R", "R", "R", "✓", "R", "✓", "R", "R"],
                    "Human Trafficking Awareness": ["✓", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
                    "Domestic Violence Awareness": ["✓", "R", "✓", "✓", "✓", "✓", "✓", "R"],
                    "Alzheimer's & Dementia Care": ["R", "✓", "✓", "R", "✓", "R", "✓", "R"],
                  };
                  const row = matrixData[courseName] || [];
                  return (
                    <tr key={ci}>
                      <td style={{ fontWeight: 500, fontSize: 12.5 }}>{courseName}</td>
                      {row.map((val, vi) => (
                        <td key={vi} style={{
                          textAlign: "center", fontSize: 14,
                          color: val === "✓" ? "var(--green)" : val === "R" ? "var(--amber)" : "var(--muted)"
                        }}>
                          {val || "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 20 }}>
            <span style={{ fontSize: 12, color: "var(--green)" }}>✓ Required by law</span>
            <span style={{ fontSize: 12, color: "var(--amber)" }}>R Recommended / conditional</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>— Not applicable</span>
          </div>
        </div>
      )}
    </>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

export default function ComplianceIQFlorida() {
  const [view, setView] = useState("dashboard");
  const [agencies, setAgencies] = useState([
    {
      id: 1,
      name: "Sunshine Medical Group & Surgical Centers",
      tagline: "Unwavering Compliance, Superior Outcome.",
      platformBrand: "ComplianceIQ Florida",
      short: "SMG",
      logoColor: "#00D4C8",
      whiteLabel: true,
      logoUrl: "",
      staffCount: 244,
      compliance: 89
    },
    {
      id: 2,
      name: "Atlantic Care Senior Living",
      tagline: "Quality Care for Our Seniors.",
      platformBrand: "ComplianceIQ Florida",
      short: "ACSL",
      logoColor: "#FF6B6B",
      whiteLabel: true,
      logoUrl: "",
      staffCount: 156,
      compliance: 72
    },
    {
      id: 3,
      name: "Bayview Behavioral Health Network",
      tagline: "Compassionate Care. Clinical Excellence.",
      platformBrand: "BayviewLearn",
      short: "BBH",
      logoColor: "#7C3AED",
      whiteLabel: true,
      logoUrl: "",
      staffCount: 318,
      compliance: 94
    },
    {
      id: 4,
      name: "Palm Coast Home Health Partners",
      tagline: "Your Home. Our Commitment.",
      platformBrand: "ComplianceIQ Florida",
      short: "PCH",
      logoColor: "#F59E0B",
      whiteLabel: false,
      logoUrl: "",
      staffCount: 87,
      compliance: 81
    }
  ]);
  const [activeAgencyId, setActiveAgencyId] = useState(1);
  const [selectedAgencyPanel, setSelectedAgencyPanel] = useState(null);
  const agency = agencies.find(a => a.id === activeAgencyId) || agencies[0];
  const setAgency = (updated) => setAgencies(prev => prev.map(a => a.id === updated.id ? updated : a));
  const [userRole, setUserRole] = useState("Employee"); // "Management", "Employee", or "Admin"
  const [selectedVoice, setSelectedVoice] = useState("eleven_matilda");
  const [selectedAvatar, setSelectedAvatar] = useState("clinical_elena");
  const [isUsingElevenLabs, setIsUsingElevenLabs] = useState(false);
  const [isStudioAdvanced, setIsStudioAdvanced] = useState(true);
  const [adminAccessConfirmed, setAdminAccessConfirmed] = useState(false);
  const [adminNavOpen, setAdminNavOpen] = useState(true);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditSections, setAuditSections] = useState({
    execSummary: true,
    deptCompliance: true,
    ahcaCourses: true,
    atRiskEmployees: true,
    quizPerformance: true,
    categoryDist: true,
    employeeProgress: false,
    regulatoryCitations: true,
  });

  const generateAuditPDF = () => {
    // Build printable report in a new window using current auditSections
    const totalStaffP = EMPLOYEES.length;
    const atRiskP = EMPLOYEES.filter(e => e.overdue > 0).length;
    const avgCompP = Math.round(EMPLOYEES.reduce((s, e) => {
      const assigned = (assignTraining[e.id] || []);
      const total = assigned.length || 1;
      return s + Math.round((e.completed / total) * 100);
    }, 0) / totalStaffP);
    const totalOverdueP = EMPLOYEES.reduce((s, e) => s + e.overdue, 0);
    const ahcaReadyP = DEPARTMENTS.filter(d => d.compliance >= 85).length;
    const catDataP = ["Florida", "Federal", "Role-Specific"].map(cat => ({
      label: cat,
      count: COURSES.filter(c => c.category === cat).length,
      completion: Math.round(COURSES.filter(c => c.category === cat).reduce((s, c) => s + c.completionRate, 0) / Math.max(1, COURSES.filter(c => c.category === cat).length))
    }));
    const worstP = [...COURSES].sort((a, b) => b.quizFailRate - a.quizFailRate).slice(0, 6);
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // SVG Pie chart helper
    const pie = (data, cx = 90, cy = 90, r = 70) => {
      const total = data.reduce((s, d) => s + d.value, 0);
      let angle = -Math.PI / 2;
      const slices = data.map(d => {
        const sw = (d.value / total) * Math.PI * 2;
        const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
        angle += sw;
        const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
        const large = sw > Math.PI ? 1 : 0;
        return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z" fill="${d.color}" stroke="white" stroke-width="2"/>`;
      }).join("");
      return `<svg width="180" height="180" viewBox="0 0 180 180">${slices}</svg>`;
    };

    // Horizontal bar helper
    const hbar = (data, w = 420) => {
      const maxV = Math.max(...data.map(d => d.value));
      const rows = data.map((d, i) => `
        <tr>
          <td style="padding:5px 8px;font-size:12px;width:180px;color:#1a2744">${d.label}</td>
          <td style="padding:5px 4px;"><div style="height:14px;width:${Math.round((d.value / 100) * (w - 200))}px;background:${d.color || "#00a99d"};border-radius:3px;min-width:4px"></div></td>
          <td style="padding:5px 8px;font-size:12px;font-weight:700;color:${d.color || "#00a99d"}">${d.value}%</td>
        </tr>`).join("");
      return `<table style="width:100%;border-collapse:collapse">${rows}</table>`;
    };

    // Vertical bar helper
    const vbar = (data) => {
      const maxV = Math.max(...data.map(d => d.value));
      const bars = data.map((d, i) => {
        const bh = Math.round((d.value / maxV) * 100);
        return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:4px">
          <span style="font-size:10px;font-weight:700;color:${d.value > 30 ? "#ef4444" : "#f59e0b"}">${d.value}%</span>
          <div style="width:100%;background:#e2e8f0;height:80px;border-radius:4px;display:flex;align-items:flex-end">
            <div style="width:100%;height:${bh}%;background:${d.value > 30 ? "#ef4444" : "#f59e0b"};border-radius:4px 4px 0 0"></div>
          </div>
          <span style="font-size:9px;text-align:center;color:#475569;max-width:60px;line-height:1.2">${d.label.substring(0, 20)}</span>
        </div>`;
      }).join("");
      return `<div style="display:flex;align-items:flex-end;gap:6px;height:120px;padding:0 8px">${bars}</div>`;
    };

    const lineChart = () => {
      const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
      const vals = [74, 77, 79, 81, 83, 86, avgCompP];
      const W = 380, H = 90, pad = 30;
      const xs = months.map((_, i) => pad + i * ((W - pad * 2) / 6));
      const ys = vals.map(v => H - pad - (v - 60) * (H - pad * 2) / 40);
      const polyline = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
      const dots = xs.map((x, i) => `<circle cx="${x}" cy="${ys[i]}" r="4" fill="#00a99d" stroke="white" stroke-width="2"/><text x="${x}" y="${ys[i] - 8}" text-anchor="middle" font-size="9" fill="#00a99d">${vals[i]}%</text>`).join("");
      const xlabels = xs.map((x, i) => `<text x="${x}" y="${H - 4}" text-anchor="middle" font-size="9" fill="#64748b">${months[i]}</text>`).join("");
      return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <polyline points="${polyline}" fill="none" stroke="#00a99d" stroke-width="2.5" stroke-linejoin="round"/>
        ${dots}${xlabels}
        <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="#e2e8f0" stroke-width="1"/>
      </svg>`;
    };

    const pieSVG = pie([
      { label: "Florida", value: catDataP[0].count, color: "#00a99d" },
      { label: "Federal", value: catDataP[1].count, color: "#f59e0b" },
      { label: "Role-Specific", value: catDataP[2].count, color: "#6366f1" }
    ]);
    const deptBar = hbar(DEPARTMENTS.map(d => ({ label: d.name, value: d.compliance, color: d.compliance >= 90 ? "#22c55e" : d.compliance >= 75 ? "#00a99d" : "#f59e0b" })));
    const quizVBar = vbar(worstP.map(c => ({ label: c.title, value: c.quizFailRate })));

    const html = `<!DOCTYPE html><html><head><title>AHCA Compliance Audit Report — ${agency.name}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background: white; font-size: 13px; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }
  .letterhead { border-bottom: 3px solid #00a99d; padding-bottom: 20px; margin-bottom: 28px; display:flex; justify-content:space-between; align-items:flex-end; }
  .lh-left h1 { font-size: 26px; font-weight: 900; color: #00a99d; letter-spacing: -0.5px; }
  .lh-left h2 { font-size: 13px; color: #64748b; font-weight: 400; margin-top: 2px; }
  .lh-right { text-align: right; font-size: 11px; color:#64748b; line-height:1.7 }
  .report-title { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
  .report-sub { font-size: 12px; color: #64748b; margin-bottom: 28px; }
  .section { margin-bottom: 36px; page-break-inside: avoid; }
  .section-title { font-size: 15px; font-weight: 800; color: #1e293b; border-left: 4px solid #00a99d; padding-left: 10px; margin-bottom: 14px; }
  .kpi-row { display:flex; gap:16px; margin-bottom:20px; flex-wrap:wrap; }
  .kpi { flex:1; min-width:110px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; text-align:center; }
  .kpi-val { font-size:24px; font-weight:900; color:#00a99d; }
  .kpi-lbl { font-size:10px; color:#64748b; margin-top:3px; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th { background:#f1f5f9; padding:7px 10px; text-align:left; font-weight:700; color:#475569; border-bottom:2px solid #e2e8f0; }
  td { padding:7px 10px; border-bottom:1px solid #f1f5f9; color:#1e293b; }
  tr:nth-child(even) td { background:#f8fafc; }
  .badge { display:inline-block; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700; }
  .badge-green { background:#dcfce7; color:#166534; }
  .badge-red { background:#fee2e2; color:#991b1b; }
  .badge-amber { background:#fef3c7; color:#92400e; }
  .pie-legend { display:flex; flex-direction:column; gap:8px; justify-content:center; }
  .legend-item { display:flex; align-items:center; gap:8px; font-size:12px; }
  .legend-dot { width:14px; height:14px; border-radius:50%; flex-shrink:0; }
  .summary-box { background:#f0fdfb; border:1px solid #99f6e4; border-radius:8px; padding:16px; font-size:13px; line-height:1.7; color:#134e4a; }
  .citation-row td { font-size:11px; }
  .footer { margin-top:40px; padding-top:14px; border-top:1px solid #e2e8f0; font-size:10px; color:#94a3b8; display:flex; justify-content:space-between; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body><div class="page">

<!-- LETTERHEAD -->
<div class="letterhead">
  <div class="lh-left">
    <h1>ComplianceIQ Florida</h1>
    <h2>${agency.name} · AHCA Regulatory Compliance Report</h2>
  </div>
  <div class="lh-right">
    <div><strong>Report Date:</strong> ${today}</div>
    <div><strong>Period:</strong> Q1 2026 · Fiscal Year</div>
    <div><strong>Prepared by:</strong> ComplianceIQ AI Platform</div>
    <div><strong>Facility:</strong> ${agency.name}</div>
  </div>
</div>

<div class="report-title">AHCA Compliance Audit Report</div>
<div class="report-sub">Regulatory Training & Staff Compliance Status · Generated ${today} · Sections: ${Object.entries(auditSections).filter(([, v]) => v).length} of 8 included</div>

<!-- KPI ROW -->
<div class="kpi-row">
  <div class="kpi"><div class="kpi-val">${avgCompP}%</div><div class="kpi-lbl">Overall Completion</div></div>
  <div class="kpi"><div class="kpi-val">${totalStaffP}</div><div class="kpi-lbl">Total Staff</div></div>
  <div class="kpi"><div class="kpi-val">${atRiskP}</div><div class="kpi-lbl">At-Risk Employees</div></div>
  <div class="kpi"><div class="kpi-val">${DEPARTMENTS.length}</div><div class="kpi-lbl">Total Departments</div></div>
  <div class="kpi"><div class="kpi-val">${totalOverdueP}</div><div class="kpi-lbl">Overdue Items</div></div>
  <div class="kpi"><div class="kpi-val">${COURSES.filter(c => c.surveyed).length}</div><div class="kpi-lbl">Surveyed Courses</div></div>
</div>

${auditSections.execSummary ? `
<!-- EXECUTIVE SUMMARY -->
<div class="section">
  <div class="section-title">Executive Summary</div>
  <div class="summary-box">
    <p><strong>${agency.name}</strong> currently reports an overall staff compliance rate of <strong>${avgCompP}%</strong> across ${totalStaffP} employees and ${COURSES.length} regulatory training modules. Of the facility's ${DEPARTMENTS.length} departments, <strong>${ahcaReadyP} meet the AHCA survey readiness threshold of 85%</strong>, with ${DEPARTMENTS.length - ahcaReadyP} department(s) requiring immediate remediation plans.</p>
    <br/>
    <p>A total of <strong>${atRiskP} employees (${Math.round(atRiskP / totalStaffP * 100)}% of workforce)</strong> carry at least one overdue training item, representing a combined backlog of ${totalOverdueP} training units. The ${DEPARTMENTS.filter(d => d.compliance < 75).map(d => d.name).join(", ") || "No departments"} department(s) fall below the 75% threshold and present the highest regulatory exposure during an AHCA survey.</p>
    <br/>
    <p>The compliance trajectory shows a <strong>positive trend</strong> over the last 7 months, with overall completion rising from 74% in September 2025 to ${avgCompP}% as of this report date. Management is advised to prioritize the ${worstP[0]?.title || "top-flagged"} training module, which carries the highest quiz failure rate at ${worstP[0]?.quizFailRate}%, indicating potential content gaps or policy complexity that may require curriculum review.</p>
  </div>
</div>` : ""}

${auditSections.deptCompliance ? `
<!-- DEPT COMPLIANCE -->
<div class="section">
  <div class="section-title">Department Compliance Overview</div>
  <p style="font-size:12px;color:#64748b;margin-bottom:14px">Horizontal bar chart — AHCA threshold marker at 85%. Color coding: Green ≥90%, Teal ≥75%, Amber &lt;75%.</p>
  ${deptBar}
  <p style="font-size:11px;color:#94a3b8;margin-top:10px">▏ Dashed line represents the 85% AHCA survey readiness threshold.</p>
</div>` : ""}

${auditSections.categoryDist ? `
<!-- CATEGORY PIE -->
<div class="section">
  <div class="section-title">Course Category Distribution</div>
  <div style="display:flex;gap:32px;align-items:center">
    ${pieSVG}
    <div class="pie-legend">
      ${catDataP.map((c, i) => `<div class="legend-item"><div class="legend-dot" style="background:${["#00a99d", "#f59e0b", "#6366f1"][i]}"></div><div><strong>${c.label}</strong> — ${c.count} courses, ${c.completion}% avg completion</div></div>`).join("")}
      <div style="margin-top:12px;font-size:12px;color:#64748b">Total: ${COURSES.length} courses across 3 regulatory categories.</div>
    </div>
  </div>
</div>` : ""}

${auditSections.quizPerformance ? `
<!-- QUIZ PERFORMANCE -->
<div class="section">
  <div class="section-title">Quiz Failure Rate Analysis — Top Concerns</div>
  <p style="font-size:12px;color:#64748b;margin-bottom:14px">Courses with the highest staff quiz failure rates. Red = &gt;30% fail rate (critical), Amber = 20–30% (moderate risk).</p>
  ${quizVBar}
  <table style="margin-top:16px">
    <thead><tr><th>#</th><th>Course Title</th><th>Citation</th><th>Quiz Fail %</th><th>Completion %</th><th>Priority</th></tr></thead>
    <tbody>
      ${worstP.map((c, i) => `<tr><td>${i + 1}</td><td>${c.title}</td><td style="font-size:10px;color:#64748b">${c.citation}</td><td style="font-weight:700;color:${c.quizFailRate > 30 ? "#ef4444" : "#f59e0b"}">${c.quizFailRate}%</td><td>${c.completionRate}%</td><td><span class="badge ${c.quizFailRate > 30 ? "badge-red" : "badge-amber"}">${c.quizFailRate > 30 ? "CRITICAL" : "MONITOR"}</span></td></tr>`).join("")}
    </tbody>
  </table>
  <div style="margin-top:12px;font-size:12px;color:#475569;background:#fef3c7;padding:10px;border-radius:6px">⚠ <strong>Anecdote:</strong> A quiz failure rate exceeding 25% on any AHCA-surveyed course may be cited as evidence of inadequate training under F-Tag 726 (Sufficient, Competent Staff). Management is advised to review the curriculum and add remediation pathways for the flagged modules.</div>
</div>` : ""}

${auditSections.ahcaCourses ? `
<!-- AHCA COURSES -->
<div class="section">
  <div class="section-title">AHCA Surveyed Course Completion Status</div>
  <table>
    <thead><tr><th>Course</th><th>Citation</th><th>Frequency</th><th>Completion</th><th>Quiz Fail</th><th>Expires</th><th>Status</th></tr></thead>
    <tbody>
      ${COURSES.filter(c => c.surveyed).map(c => `<tr>
        <td>${c.title}</td>
        <td style="font-size:10px;color:#64748b">${c.citation}</td>
        <td><span class="badge badge-amber" style="background:#f1f5f9;color:#475569">${c.freq}</span></td>
        <td style="font-weight:700;color:${c.completionRate >= 90 ? "#166534" : c.completionRate >= 75 ? "#00a99d" : "#92400e"}">${c.completionRate}%</td>
        <td style="color:${c.quizFailRate > 25 ? "#991b1b" : "#475569"}">${c.quizFailRate}%</td>
        <td>Dec 31, 2026</td>
        <td><span class="badge ${c.completionRate >= 85 ? "badge-green" : "badge-red"}">${c.completionRate >= 85 ? "✓ Ready" : "Action Needed"}</span></td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>` : ""}

${auditSections.atRiskEmployees ? `
<!-- AT RISK -->
<div class="section">
  <div class="section-title">⚠ At-Risk Employees — Overdue Training</div>
  <p style="font-size:12px;color:#64748b;margin-bottom:14px">${atRiskP} employee(s) require immediate manager intervention. Sorted by overdue item count descending.</p>
  <table>
    <thead><tr><th>Employee</th><th>Department</th><th>Role</th><th>Overdue Items</th><th>Completion</th><th>Last Active</th><th>Risk</th></tr></thead>
    <tbody>
      ${EMPLOYEES.filter(e => e.overdue > 0).sort((a, b) => b.overdue - a.overdue).map(e => `<tr>
        <td><strong>${e.name}</strong></td><td>${e.dept}</td><td>${e.role}</td>
        <td><span class="badge badge-red">${e.overdue}</span></td>
        <td>${Math.round(e.completed / e.total * 100)}%</td>
        <td>${e.lastActivity}</td>
        <td><span class="badge ${e.overdue >= 4 ? "badge-red" : "badge-amber"}">${e.overdue >= 4 ? "HIGH" : "MEDIUM"}</span></td>
      </tr>`).join("")}
    </tbody>
  </table>
  <div style="margin-top:12px;font-size:12px;color:#475569;background:#fee2e2;padding:10px;border-radius:6px">📌 <strong>Anecdote:</strong> Per AHCA Rule 59A-35.110, Florida ALFs must maintain documentation of all mandatory training completions. Employees with overdue AHCA-surveyed courses present direct survey citation risk. A 72-hour remediation notice is recommended.</div>
</div>` : ""}

${auditSections.employeeProgress ? `
<!-- FULL EMPLOYEE TABLE -->
<div class="section">
  <div class="section-title">Full Employee Training Progress</div>
  <table>
    <thead><tr><th>Employee</th><th>Department</th><th>Role</th><th>Type</th><th>Completed</th><th>Total</th><th>Completion %</th><th>Overdue</th></tr></thead>
    <tbody>
      ${EMPLOYEES.map(e => `<tr>
        <td>${e.name}</td><td>${e.dept}</td><td>${e.role}</td>
        <td>${e.type}</td>
        <td>${e.completed}</td><td>${e.total}</td>
        <td style="font-weight:700;color:${Math.round(e.completed / e.total * 100) >= 85 ? "#166534" : "#92400e"}">${Math.round(e.completed / e.total * 100)}%</td>
        <td>${e.overdue > 0 ? `<span class="badge badge-red">${e.overdue}</span>` : `<span class="badge badge-green">✓</span>`}</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>` : ""}

<!-- COMPLIANCE TREND LINE CHART -->
<div class="section">
  <div class="section-title">Compliance Trend — 7-Month Overview</div>
  <p style="font-size:12px;color:#64748b;margin-bottom:10px">Monthly overall completion rate trajectory. Positive trend indicates sustained management effort.</p>
  ${lineChart()}
  <div style="margin-top:10px;font-size:12px;color:#475569">Trend: +${avgCompP - 74} percentage points gained since September 2025. ${avgCompP >= 85 ? "Facility meets the AHCA audit threshold." : "Facility is approaching the AHCA 85% threshold — projected to reach compliance within 1–2 months at current pace."}</div>
</div>

${auditSections.regulatoryCitations ? `
<!-- CITATIONS APPENDIX -->
<div class="section">
  <div class="section-title">Regulatory Citations Appendix</div>
  <table class="citation-row">
    <thead><tr><th>F-Tag / Citation</th><th>Regulation</th><th>Scope</th><th>Linked Courses</th></tr></thead>
    <tbody>
      <tr><td>F-Tag 600</td><td>Protection from Abuse — 42 CFR §483.12</td><td>Federal / CMS</td><td>Abuse Prevention & Mandatory Reporting</td></tr>
      <tr><td>F-Tag 726</td><td>Sufficient & Competent Staff — 42 CFR §483.35</td><td>Federal / CMS</td><td>All AHCA-Surveyed Training Modules</td></tr>
      <tr><td>F.S. §400.141</td><td>AHCA General Requirements for ALFs</td><td>Florida Statute</td><td>FL Required Courses — All Staff</td></tr>
      <tr><td>F.S. §408.8051</td><td>Background Screening — Florida AHCA</td><td>Florida Statute</td><td>HR Compliance & New Hire Orientation</td></tr>
      <tr><td>45 CFR §164</td><td>HIPAA Security Rule — ePHI Safeguards</td><td>Federal / OCR</td><td>HIPAA & Privacy Compliance</td></tr>
      <tr><td>29 CFR §1910.1030</td><td>OSHA Bloodborne Pathogens Standard</td><td>Federal / OSHA</td><td>Bloodborne Pathogens Training</td></tr>
      <tr><td>F.S. §415.1034</td><td>Mandatory Reporting of Elder Abuse</td><td>Florida Statute</td><td>Elder Abuse & Neglect Prevention</td></tr>
      <tr><td>§59A-35.110 FAC</td><td>AHCA ALF Training Requirements</td><td>FL Admin Code</td><td>All Florida-Category Courses</td></tr>
    </tbody>
  </table>
</div>` : ""}

<!-- FOOTER -->
<div class="footer">
  <div>ComplianceIQ Florida · AI-Powered Compliance Platform · complianceiq.ai</div>
  <div>CONFIDENTIAL — ${agency.name} · Generated ${today}</div>
</div>

</div></body></html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  const generateBriefingPDF = () => {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const highAlerts = ALERTS.filter(a => a.severity === "high").length;

    const html = `<html><head>
      <title>Regulatory Briefing — ${agency.name}</title>
      <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 50px; color: #1e293b; background: white; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 30px; margin-bottom: 40px; }
        .title-group h1 { font-size: 28px; font-weight: 800; margin: 0; color: #0f172a; }
        .title-group p { font-size: 14px; color: #64748b; margin: 5px 0 0; }
        .agency-info { text-align: right; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .summary-card { padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; }
        .summary-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .summary-val { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 5px; }
        .alert-item { margin-bottom: 30px; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .alert-item.high { border-left: 6px solid #ef4444; background: #fffafb; }
        .alert-item.medium { border-left: 6px solid #f59e0b; background: #fffcf0; }
        .alert-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .alert-title { font-size: 18px; font-weight: 700; color: #0f172a; }
        .alert-meta { font-size: 12px; color: #64748b; }
        .alert-desc { font-size: 15px; color: #334155; margin-bottom: 15px; }
        .alert-action { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; }
        .action-label { font-weight: 700; color: #0284c7; margin-bottom: 5px; font-size: 11px; text-transform: uppercase; }
        @media print { body { padding: 0; } .header { margin-top: 20px; } }
      </style>
    </head><body>
      <div class="header">
        <div class="title-group">
          <h1>Regulatory Compliance Briefing</h1>
          <p>AHCA Monitor & Workforce Intelligence Summary</p>
        </div>
        <div class="agency-info">
          <div style="font-weight: 800; color: #0284c7;">${agency.name}</div>
          <div style="font-size: 12px; color: #64748b;">Generated: ${today}</div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Active Alerts</div>
          <div class="summary-val">${ALERTS.length}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">High Severity</div>
          <div class="summary-val" style="color: #ef4444;">${highAlerts}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Monitor Status</div>
          <div class="summary-val" style="color: #10b981;">OPERATIONAL</div>
        </div>
      </div>

      <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 25px;">Critical Regulatory & Operational Updates</h2>

      ${ALERTS.map(alert => `
        <div class="alert-item ${alert.severity}">
          <div class="alert-header">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-meta">${alert.date} · ${alert.severity.toUpperCase()} IMPACT</div>
          </div>
          <div class="alert-desc">${alert.desc}</div>
          <div class="alert-action">
            <div class="action-label">Recommended Management Action</div>
            ${alert.type === 'regulation'
        ? `Review AHCA updated bulletins and schedule a mandatory staff update. Update courses listed in the description.`
        : `Review individual student feedback for the flagged questions. Use AI Co-pilot to re-draft course content.`}
          </div>
        </div>
      `).join('')}

      <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
        This briefing is powered by ComplianceIQ AI Monitor. Source data is cross-referenced from Florida Statutes, AHCA Rule filings, and Internal LMS Analytics.
      </div>
    </body></html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  const [expandedReportSections, setExpandedReportSections] = useState({});

  const toggleReportSection = key => setExpandedReportSections(p => ({ ...p, [key]: !p[key] }));



  const VOICES = [
    { id: "eleven_matilda", name: "Matilda (Compassionate/Clinical)", gender: "Female" },
    { id: "eleven_marcus", name: "Marcus (Authoritative/Legal)", gender: "Male" },
    { id: "eleven_sarah", name: "Sarah (Friendly/Instructional)", gender: "Female" },
    { id: "eleven_david", name: "David (Steady/Administrative)", gender: "Male" },
  ];

  const AVATARS = [
    { id: "clinical_elena", name: "Dr. Elena (Clinical)", desc: "Senior Clinical Advisor", img: "/avatar_elena.png" },
    { id: "admin_marcus", name: "Marcus (Admin)", desc: "Regulatory Specialist", img: "/avatar_marcus.png" },
  ];

  const [courseFilter, setCourseFilter] = useState("All");
  const [activeCourse, setActiveCourse] = useState(null);
  const [playerStep, setPlayerStep] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [activeScenario, setActiveScenario] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [completedCourses, setCompletedCourses] = useState(new Set([1, 2, 7, 8, 10, 11, 12, 15, 16, 23, 24, 27]));
  const [feedbackChecks, setFeedbackChecks] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTab, setAiTab] = useState("builder");
  const [surveyPrompt, setSurveyPrompt] = useState("");
  const [surveyResult, setSurveyResult] = useState(null);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [alertAnalysis, setAlertAnalysis] = useState("");
  const [narrativeText, setNarrativeText] = useState("");
  const [videoJobs, setVideoJobs] = useState([]);
  const [openAiKey, setOpenAiKey] = useState(() => localStorage.getItem('ciq_openai_key') || OPENAI_API_KEY);
  const [generatedImages, setGeneratedImages] = useState({});
  const [generatedSlides, setGeneratedSlides] = useState(null);
  // assignTraining: { [employeeId]: [courseId, ...] }
  const [assignTraining, setAssignTraining] = useState(() => {
    const defaults = {};
    EMPLOYEES.forEach(e => {
      // Seed initial assigned courses from their baseline data
      const courseIds = COURSES.slice(0, e.total).map(c => c.id);
      defaults[e.id] = courseIds;
    });
    return defaults;
  });
  const [selectedEmployeeAssign, setSelectedEmployeeAssign] = useState(null); // employee being assigned
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  // Elevation to Admin via /admin hash
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#admin") {
        setUserRole("Admin");
        setAdminAccessConfirmed(true);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  // Removed fixed interval progress logic.
  // Progress will be tracked via the Audio object's timeupdate event.

  const slides = activeCourse
    ? (activeCourse.id === 999 && generatedSlides
      ? generatedSlides
      : (SLIDE_CONTENT[activeCourse.id] || DEFAULT_SLIDES))
    : [];
  const TOTAL_SLIDES = slides.length;
  const isQuiz = playerStep >= TOTAL_SLIDES;

  const orgCompliance = Math.round(EMPLOYEES.reduce((s, e) => {
    const assigned = (assignTraining[e.id] || []);
    const total = assigned.length || 1;
    return s + Math.round((e.completed / total) * 100);
  }, 0) / EMPLOYEES.length);

  const overallCompliance = userRole === "Employee"
    ? Math.round((completedCourses.size / (assignTraining[1] || COURSES.slice(0, 16)).length) * 100)
    : orgCompliance;

  const totalOverdue = EMPLOYEES.reduce((s, e) => s + e.overdue, 0);
  const overdueCount = userRole !== "Employee" ? totalOverdue : (COURSES.length - completedCourses.size);
  const ahcaReadyCount = DEPARTMENTS.filter(d => d.compliance >= 85).length;

  useEffect(() => {
    setAudioProgress(0);
    setAudioTime(0);
    setAudioDuration(0);
    window.speechSynthesis.cancel();
  }, [playerStep]);

  useEffect(() => {
    let audio = null;

    async function playElevenLabs() {
      if (!isPlayingAudio) return;

      try {
        let fullText = "";

        if (isQuiz) {
          const q = questions[quizIdx];
          if (!q) return;
          fullText = `Knowledge Check Question ${quizIdx + 1}. ${q.q}. The options are: ${q.options.join(". ")}.`;
        } else if (slides[playerStep]) {
          const slide = slides[playerStep];
          fullText = `${slide.title}. ${slide.body.replace(/<[^>]*>?/gm, '').replace(/\n/g, ' ')}. ${slide.example ? 'For example: ' + slide.example : ''}`;
        } else {
          setNarrativeText("");
          return;
        }

        setNarrativeText(fullText);

        const VOICE_MAP = {
          "eleven_matilda": "XrExE9yKIg1WjnnlVkGX",
          "eleven_marcus": "vGWWh1bodhwwi4yHd6qZ",
          "eleven_sarah": "EXAVITQu4vr4xnSDxMaL",
          "eleven_david": "BNgbHR0DNeZixGQVzloa"
        };

        const voiceId = VOICE_MAP[selectedVoice] || "XrExE9yKIg1WjnnlVkGX";

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVEN_LABS_KEY
          },
          body: JSON.stringify({
            text: fullText,
            model_id: "eleven_turbo_v2_5",
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          audio = new Audio(url);

          audio.onloadedmetadata = () => {
            setAudioDuration(audio.duration);
          };

          audio.ontimeupdate = () => {
            setAudioTime(audio.currentTime);
            setAudioProgress((audio.currentTime / audio.duration) * 100);
          };

          audio.onended = () => {
            setIsPlayingAudio(false);
            setAudioProgress(0);
          };

          setIsUsingElevenLabs(true);
          audio.play();
        } else {
          const errData = await response.json();
          console.error("ElevenLabs API ERROR DETAILS:", errData);
          throw new Error(errData?.detail?.status || "API Limit");
        }
      } catch (err) {
        setIsUsingElevenLabs(false);
        console.warn("ElevenLabs failed, using browser TTS", err);
        let textToSpeak = "";
        if (isQuiz) {
          const q = questions[quizIdx];
          textToSpeak = `Question ${quizIdx + 1}. ${q?.q}.`;
        } else {
          const slide = slides[playerStep];
          textToSpeak = `${slide?.title}. ${slide?.body.replace(/<[^>]*>?/gm, '').replace(/\n/g, ' ')}. ${slide?.example ? 'For example: ' + slide.example : ''}`;
        }
        setNarrativeText(textToSpeak);

        // Simple word-count based progress for Browser TTS
        const words = textToSpeak.split(' ').length;
        const estDuration = Math.max(2, words * 0.45); // rough estimate
        setAudioDuration(estDuration);

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;

        let startTime = Date.now();
        const ttsInterval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          setAudioTime(elapsed);
          setAudioProgress(Math.min((elapsed / estDuration) * 100, 99.9));
        }, 100);

        utterance.onend = () => {
          clearInterval(ttsInterval);
          setIsPlayingAudio(false);
          setAudioProgress(0);
          setAudioTime(0);
          setAudioDuration(0);
        };
        window.speechSynthesis.speak(utterance);
      }
    }

    if (isPlayingAudio) {
      playElevenLabs();
    } else {
      window.speechSynthesis.cancel();
      if (audio) {
        audio.pause();
        audio = null;
      }
    }

    return () => {
      window.speechSynthesis.cancel();
      if (audio) {
        audio.pause();
        audio = null;
      }
    };
  }, [isPlayingAudio, playerStep, isQuiz, slides, selectedVoice]);
  const questions = activeCourse ? (QUIZ_QUESTIONS[activeCourse.id] || QUIZ_QUESTIONS[1]) : [];
  const quizIdx = playerStep - TOTAL_SLIDES;

  function startCourse(c) {
    setActiveCourse(c);
    setPlayerStep(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setShowCert(false);
    setFeedbackChecks([]);
    setFeedbackText("");
    setFeedbackDone(false);
    setView("player");
  }

  function handleQuizAnswer(optIdx) {
    if (quizSubmitted) return;
    setQuizAnswers(a => ({ ...a, [quizIdx]: optIdx }));
  }

  function submitQuiz() {
    if (Object.keys(quizAnswers).length < questions.length) return;
    setQuizSubmitted(true);
    const score = questions.filter((q, i) => quizAnswers[i] === q.correct).length;
    if (score / questions.length >= 0.8) {
      setTimeout(() => setShowCert(true), 2500); // Give time to see the "Passed" state
      setCompletedCourses(s => new Set([...s, activeCourse.id]));
    }
  }

  function retryQuiz() {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setPlayerStep(TOTAL_SLIDES); // Back to first question
  }

  function toggleCheck(item) {
    setFeedbackChecks(a => a.includes(item) ? a.filter(x => x !== item) : [...a, item]);
  }

  // ── DALL-E 3 Neural Still Generator ──────────────────────────────────
  async function generateSlideImage(visualPrompt, slideIndex) {
    const key = openAiKey || localStorage.getItem('ciq_openai_key') || OPENAI_API_KEY;
    if (!key) return null;
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `${visualPrompt}. Photorealistic, professional healthcare setting, cinematic lighting, 16:9 wide angle, teal and amber color grading, ultra-high definition.`,
          n: 1,
          size: "1792x1024",
          quality: "hd"
        })
      });
      const data = await res.json();
      const url = data.data?.[0]?.url;
      if (url) {
        setGeneratedImages(prev => ({ ...prev, [slideIndex]: url }));
        return url;
      }
    } catch (err) {
      console.error("DALL-E 3 generation failed:", err);
    }
    return null;
  }

  async function triggerLiveHeyGen(job, script) {
    if (HEYGEN_API_KEY === "PASTE_HEYGEN_API_KEY_HERE") return; // Keep simulation

    try {
      const res = await fetch("https://api.heygen.com/v2/video/generate", {
        method: "POST",
        headers: { "X-Api-Key": HEYGEN_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          video_inputs: [{
            character: { type: "avatar", avatar_id: "clinical_elena_id", avatar_style: "normal" },
            voice: { type: "text", input_text: script, voice_id: "XrExE9yKIg1WjnnlVkGX" }
          }],
          dimension: { width: 1280, height: 720 }
        })
      });
      const data = await res.json();
      console.log("HeyGen Job Triggered:", data);
      // In production, we would poll data.data.video_id
    } catch (err) {
      console.error("HeyGen API Failure", err);
    }
  }

  async function triggerLiveLuma(job, visualPrompt) {
    if (LUMA_API_KEY === "PASTE_LUMA_API_KEY_HERE") return; // Keep simulation

    try {
      const res = await fetch("https://api.lumalabs.ai/v1/generations", {
        method: "POST",
        headers: { "Authorization": `Bearer ${LUMA_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: visualPrompt,
          aspect_ratio: "16:9",
          resolution: "720p",
          loop: true
        })
      });
      const data = await res.json();
      console.log("Luma Job Triggered:", data);
      // In production, we would poll data.id
    } catch (err) {
      console.error("Luma API Failure", err);
    }
  }

  async function runAiBuilder() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult("");
    try {
      // (Mocking Anthropic response for immediate logic flow demonstration)
      const mockResult = {
        title: "FL Advanced Directives & AHCA Rule 58A",
        citation: "FL Statute 765",
        duration: 25,
        objectives: ["Understand FL living wills", "Identify Healthcare Surrogate roles", "AHCA DNR requirements"],
        role: "Clinical",
        ahcaSurveyed: true,
        slides: [
          { title: "Introduction to Florida Directives", keyPoints: ["Power of Attorney vs Surrogate", "Legal requirements"], script: "In Florida, healthcare directives are critical for honoring patient autonomy in clinical settings.", visualPrompt: "Cinematic shot of senior couple with legal counselor, clinical environment." },
          { title: "The Florida DNR (Yellow Form)", keyPoints: ["Specific AHCA requirements", "Physician signature needed"], script: "The DH Form 1896 is the only DNR recognized by Florida EMS and facility surveyors.", visualPrompt: "Close up of clinical form with medical seal, bokeh healthcare background." }
        ],
        quizQuestions: [
          { question: "Which color is the only recognized Florida DNR form?", options: ["Blue", "Yellow", "White", "Red"], correctIndex: 1, rationale: "DH Form 1896 must be on yellow paper." }
        ]
      };

      setAiResult(mockResult);
      setAiLoading(false);

      // Start asynchronous Video Generation Jobs for the new course
      const newJobs = [];
      mockResult.slides.forEach((s, i) => {
        newJobs.push({ id: `inst-${Date.now()}-${i}`, slideTitle: s.title, type: 'instructor', status: 'queued', progress: 0 });
        newJobs.push({ id: `broll-${Date.now()}-${i}`, slideTitle: s.title, type: 'broll', status: 'queued', progress: 0 });
      });

      setVideoJobs(prev => [...prev, ...newJobs]);

      // Generate DALL-E 3 images for each slide's visual prompt (if key available)
      if (openAiKey || localStorage.getItem('ciq_openai_key')) {
        mockResult.slides.forEach((s, i) => {
          generateSlideImage(s.visualPrompt, i);
        });
      }

      // Execution Layer: Trigger Live APIs or Simulation
      newJobs.forEach((job, idx) => {
        const slideIdx = parseInt(job.id.split('-').pop());
        const slide = mockResult.slides[slideIdx];

        if (job.type === 'instructor') {
          triggerLiveHeyGen(job.id, slide.script);
        } else {
          triggerLiveLuma(job.id, slide.visualPrompt);
        }

        // Maintain progress-tracking (Simulation or Polling bridge)
        setTimeout(() => {
          setVideoJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'rendering', progress: 20 } : j));

          let p = 20;
          const interval = setInterval(() => {
            p += Math.floor(Math.random() * 15) + 5;
            if (p >= 100) {
              setVideoJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', progress: 100 } : j));
              clearInterval(interval);
            } else {
              setVideoJobs(prev => prev.map(j => j.id === job.id ? { ...j, progress: p } : j));
            }
          }, 1500 + (idx * 500));
        }, 1000 + (idx * 1000));
      });

    } catch (err) {
      console.error(err);
      setAiLoading(false);
      setAiResult({ error: "Generation failed. Please check connection." });
    }
  }

  async function runSurveyAnalysis() {
    if (!surveyPrompt.trim()) return;
    setSurveyLoading(true);
    setSurveyResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: `Analyze this AHCA 2567 Statement of Deficiencies: "${surveyPrompt}". Identify tags, findings, and map to courses: ${COURSES.map(c => c.title).join(", ")}. Return JSON.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content ? data.content[0].text : "";
      try {
        const parsed = JSON.parse(text);
        setSurveyResult(parsed);
      } catch {
        setSurveyResult({ raw: text });
      }
    } catch {
      setSurveyResult({ error: "Analysis failed." });
    }
    setSurveyLoading(false);
  }

  async function analyzeAlert(alert) {
    if (!alert) return;
    setAlertLoading(true);
    setAlertAnalysis("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Explain the Florida healthcare compliance risk for this alert: ${alert.title} - ${alert.desc}.`
          }]
        })
      });
      const data = await res.json();
      setAlertAnalysis(data.content ? data.content[0].text : "Analysis unavailable.");
    } catch {
      setAlertAnalysis("Error analyzing alert.");
    }
    setAlertLoading(false);
  }

  const navItems = [
    { id: "dashboard", icon: "◈", label: "My Training", roles: ["Management", "Employee", "Admin"] },
    { id: "courses", icon: "⊞", label: "Course Library", roles: ["Management", "Employee", "Admin"] },
    { id: "required", icon: "⊛", label: "FL Required Courses", roles: ["Management", "Admin"] },
    { id: "employees", icon: "⊙", label: "Workforce", roles: ["Management", "Admin"] },
    { id: "assign", icon: "⊕", label: "Assign Training", roles: ["Management", "Admin"] },
    { id: "reports", icon: "⊟", label: "Compliance Reports & Statistics", roles: ["Management", "Admin", "Employee"] },
    { id: "alerts", icon: "⌬", label: "Regulatory Monitor", roles: ["Management", "Admin"] },
  ];

  const adminNavItems = [
    { id: "ai", icon: "✦", label: "AI Co-pilot" },
    { id: "agencies", icon: "🏢", label: "Agencies" },
    { id: "agency", icon: "⚙", label: "Settings" },
  ];

  const activeNavItems = navItems.filter(n => n.roles.includes(userRole));

  const filteredCourses = userRole === "Employee"
    ? (courseFilter === "All" ? COURSES.filter(c => c.role === "All Staff" || c.role === "Clinical") // Narrowing to specific role
      : COURSES.filter(c => (c.role === "All Staff" || c.role === "Clinical") && c.category === courseFilter))
    : (courseFilter === "All" ? COURSES
      : courseFilter === "Florida" ? COURSES.filter(c => c.category === "Florida")
        : courseFilter === "Federal" ? COURSES.filter(c => c.category === "Federal")
          : courseFilter === "Role-Specific" ? COURSES.filter(c => c.category === "Role-Specific")
            : courseFilter === "Flagged" ? COURSES.filter(c => c.rating < 4.0 || c.quizFailRate > 25)
              : COURSES);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            {agency.whiteLabel && agency.logoUrl ? (
              <div style={{ height: 40, display: "flex", alignItems: "center" }}>
                <img src={agency.logoUrl} alt="Logo" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
              </div>
            ) : (
              <>
                <div className="logo-mark" style={{ color: agency.logoColor }}>
                  {agency.whiteLabel ? (
                    <>Compliance<span>IQ</span></>
                  ) : (
                    <>ComplianceIQ<span>Florida</span></>
                  )}
                </div>
                <div className="logo-sub">{agency.whiteLabel ? agency.name.toUpperCase() : "FLORIDA EDITION"}</div>
              </>
            )}
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">Main Menu</div>
            {activeNavItems.map(n => (
              <div key={n.id} className={`nav-item ${view === n.id ? "active" : ""}`}
                onClick={() => setView(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
                {n.badge ? <span className="badge-pill badge-red" style={{ marginLeft: "auto", fontSize: 10 }}>{n.badge}</span> : null}
              </div>
            ))}

            {/* Admin collapsible section */}
            {userRole === "Admin" && (
              <>
                <div className="nav-section" style={{ marginTop: 16 }}>Administration</div>
                <div
                  className={`nav-item ${adminNavItems.some(n => n.id === view) ? "active" : ""}`}
                  style={{ justifyContent: "space-between" }}
                  onClick={() => setAdminNavOpen(o => !o)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="nav-icon">⚡</span>Admin
                  </div>
                  <span style={{ fontSize: 10, opacity: 0.6, transition: "transform 0.2s", display: "inline-block", transform: adminNavOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                </div>
                {adminNavOpen && adminNavItems.map(n => (
                  <div key={n.id}
                    className={`nav-item ${view === n.id ? "active" : ""}`}
                    style={{ paddingLeft: 32 }}
                    onClick={() => setView(n.id)}>
                    <span className="nav-icon" style={{ fontSize: 13 }}>{n.icon}</span>
                    {n.label}
                  </div>
                ))}
              </>
            )}

            {userRole !== "Employee" && (
              <>
                <div className="nav-section" style={{ marginTop: 16 }}>Quick Actions</div>
                <div className="nav-item" onClick={generateAuditPDF}>
                  <span className="nav-icon">↓</span>AHCA Audit Report (PDF)
                </div>
              </>
            )}
          </nav>

          <div className="sidebar-bottom">
            {adminAccessConfirmed && (
              <div style={{ padding: "0 12px 12px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginBottom: 8, letterSpacing: 1 }}>DEMO ROLE SWITCHER</div>
                <div style={{ display: "flex", background: "var(--navy3)", borderRadius: 6, padding: 3 }}>
                  <button
                    onClick={() => { setUserRole("Management"); setView("dashboard"); }}
                    style={{ flex: 1, padding: "6px", fontSize: 10, border: "none", borderRadius: 4, cursor: "pointer", background: userRole === "Management" ? "var(--teal)" : "transparent", color: userRole === "Management" ? "var(--navy)" : "var(--muted)" }}
                  >MGMT</button>
                  <button
                    onClick={() => { setUserRole("Employee"); setView("dashboard"); }}
                    style={{ flex: 1, padding: "6px", fontSize: 10, border: "none", borderRadius: 4, cursor: "pointer", background: userRole === "Employee" ? "var(--teal)" : "transparent", color: userRole === "Employee" ? "var(--navy)" : "var(--muted)" }}
                  >EMP</button>
                  <button
                    onClick={() => { setUserRole("Admin"); setView("dashboard"); }}
                    style={{ flex: 1, padding: "6px", fontSize: 10, border: "none", borderRadius: 4, cursor: "pointer", background: userRole === "Admin" ? "var(--teal2)" : "transparent", color: userRole === "Admin" ? "var(--navy)" : "var(--muted)" }}
                  >ADM</button>
                </div>
              </div>
            )}
            <div className="org-badge">
              <div className="org-avatar" style={{ background: `linear-gradient(135deg, ${agency.logoColor}, var(--teal2))` }}>{agency.short}</div>
              <div className="org-info">
                <div className="org-name">{agency.name}</div>
                <div className="org-plan">{userRole === "Admin" ? "Master Platform Admin" : userRole === "Management" ? "Enterprise Admin" : "Employee Portal"}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div className="topbar-title">
              {view === "dashboard" && "Mission Control"}
              {view === "courses" && "Course Library"}
              {view === "employees" && "Workforce Management"}
              {view === "reports" && "Compliance Reports"}
              {view === "alerts" && "Regulatory Monitor"}
              {view === "required" && "FL Required Courses Reference"}
              {view === "ai" && "AI Co-pilot"}
              {view === "agency" && "Agency Settings & White-Labeling"}
              {view === "player" && (activeCourse?.title || "Course Player")}
            </div>
            <div className="topbar-right">
              <span className="badge-pill badge-teal">🌴 Florida-Specific</span>
              <span className="badge-pill badge-green">✓ AHCA Aligned</span>
              <span className="badge-pill badge-muted">EN | ES</span>
            </div>
          </div>

          <div className="content fade-in" key={view}>
            {/* ── DASHBOARD ── */}
            {view === "dashboard" && (
              <>
                <div className="grid-4">
                  {userRole !== "Employee" ? (
                    [
                      {
                        label: "Org Compliance", value: `${overallCompliance}% `, sub: `${ahcaReadyCount}/${DEPARTMENTS.length} Depts Audit-Ready`, color: "teal"
                      },
                      { label: "Overdue Items", value: overdueCount, sub: "Across all employees", color: "red" },
                      { label: "Active Alerts", value: ALERTS.length, sub: `${ALERTS.filter(a => a.severity === "high").length} high priority`, color: "amber" },
                      { label: "Certified Staff", value: "89%", sub: "217 of 244 employees", color: "green" },
                    ].map((s, i) => (
                      <div key={i} className={`card stat-card ${s.color}`}>
                        <div className="stat-label">{s.label}</div>
                        <div className={`stat-value ${s.color}`}>{s.value}</div>
                        <div className="stat-sub">{s.sub}</div>
                      </div>
                    ))
                  ) : (
                    [
                      { label: "My Progress", value: `${Math.round((completedCourses.size / 20) * 100)}%`, sub: "12 of 20 assigned courses", color: "teal" },
                      { label: "Required Tasks", value: "3", sub: "Due in next 30 days", color: "red" },
                      { label: "CE Credits", value: "18.5", sub: "Earned this biennium", color: "amber" },
                      { label: "Certifications", value: "4", sub: "Active & Valid", color: "green" },
                    ].map((s, i) => (
                      <div key={i} className={`card stat-card ${s.color}`}>
                        <div className="stat-label">{s.label}</div>
                        <div className={`stat-value ${s.color}`}>{s.value}</div>
                        <div className="stat-sub">{s.sub}</div>
                      </div>
                    ))
                  )
                  }
                </div >

                {userRole !== "Employee" ? (
                  <>
                    <div className="grid-2">
                      <div className="card">
                        <div className="card-header">
                          <span className="card-title">Overall Compliance Score</span>
                          <span className="badge-pill badge-teal">Live</span>
                        </div>
                        <div className="card-body">
                          <div className="ring-wrap">
                            <ProgressRing pct={overallCompliance} color={overallCompliance >= 90 ? "green" : overallCompliance >= 75 ? "teal" : "amber"} label="COMPLIANT" />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 }}>
                            {[
                              { label: "Federal", pct: 91 },
                              { label: "Florida", pct: 88 },
                              { label: "Role-Specific", pct: 76 },
                            ].map(item => (
                              <div key={item.label} style={{ textAlign: "center" }}>
                                <ProgressRing pct={item.pct} size={80} stroke={8} />
                                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 6, letterSpacing: 1 }}>{item.label.toUpperCase()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-header">
                          <span className="card-title">Department Compliance</span>
                          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setView("reports")}>Full Report →</button>
                        </div>
                        <div className="card-body" style={{ padding: "12px 20px" }}>
                          {DEPARTMENTS.map(d => (
                            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                              <div style={{ width: 140, fontSize: 12.5, color: "var(--warm2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                              <ProgBar pct={d.compliance} />
                              <div style={{ width: 36, textAlign: "right", fontSize: 12, fontFamily: "var(--font-mono)", color: d.compliance >= 90 ? "var(--green)" : d.compliance >= 75 ? "var(--teal)" : "var(--amber)" }}>{d.compliance}%</div>
                              {d.overdue > 0 && <span className="badge-pill badge-red" style={{ fontSize: 10 }}>{d.overdue}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="card">
                        <div className="card-header">
                          <span className="card-title">Recent Alerts</span>
                          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setView("alerts")}>View All →</button>
                        </div>
                        <div className="card-body">
                          {ALERTS.slice(0, 3).map(a => (
                            <div key={a.id} className={`alert-card ${a.severity}`}>
                              <span className="alert-icon">{a.severity === "high" ? "🔴" : a.severity === "medium" ? "🟡" : "⚪"}</span>
                              <div>
                                <div className="alert-title">{a.title}</div>
                                <div className="alert-desc">{a.desc}</div>
                                <div className="alert-date">{a.date}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-header">
                          <span className="card-title">Most Overdue Employees</span>
                          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setView("employees")}>All Employees →</button>
                        </div>
                        <div className="card-body" style={{ padding: "8px 16px" }}>
                          <table className="table">
                            <thead><tr>
                              <th>Employee</th><th>Dept</th><th>Overdue</th><th></th>
                            </tr></thead>
                            <tbody>
                              {EMPLOYEES.filter(e => e.overdue > 0).sort((a, b) => b.overdue - a.overdue).slice(0, 5).map(e => (
                                <tr key={e.id}>
                                  <td style={{ fontWeight: 500 }}>{e.name}</td>
                                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.dept}</td>
                                  <td><span className="badge-pill badge-red">{e.overdue} overdue</span></td>
                                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }}>Remind</button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid-2">
                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">My Compliance Health</span>
                      </div>
                      <div className="card-body" style={{ textAlign: "center", padding: "30px 0" }}>
                        <div className="ring-wrap">
                          <ProgressRing pct={85} color="teal" label="UP TO DATE" />
                        </div>
                        <div style={{ marginTop: 24, padding: "0 20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: "var(--muted)" }}>Federal Training</span>
                            <span style={{ fontSize: 12, color: "var(--green)" }}>100% Complete</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: "var(--muted)" }}>Florida Requirements</span>
                            <span style={{ fontSize: 12, color: "var(--green)" }}>100% Complete</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, color: "var(--muted)" }}>Role-Specific Skills</span>
                            <span style={{ fontSize: 12, color: "var(--amber)" }}>65% Complete</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">Upcoming Deadlines</span>
                      </div>
                      <div className="card-body" style={{ padding: "0 20px 20px" }}>
                        <div style={{ background: "rgba(255,179,64,0.1)", borderLeft: "4px solid var(--amber)", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: 12 }}>
                          <div style={{ color: "var(--amber)", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>DUE IN 12 DAYS</div>
                          <div style={{ color: "#fff", fontWeight: 600 }}>Alzheimer's & Dementia Care</div>
                          <div style={{ color: "var(--muted)", fontSize: 11 }}>FL Statute 429.178 Requirement</div>
                        </div>
                        <div style={{ background: "rgba(0,212,200,0.1)", borderLeft: "4px solid var(--teal)", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: 12 }}>
                          <div style={{ color: "var(--teal)", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>DUE IN 30 DAYS</div>
                          <div style={{ color: "#fff", fontWeight: 600 }}>Fraud, Waste & Abuse (FWA)</div>
                          <div style={{ color: "var(--muted)", fontSize: 11 }}>Annual CMS Requirement</div>
                        </div>
                        <button className="btn btn-primary" style={{ width: "100%", marginTop: 12 }} onClick={() => setView("courses")}>View My Course Library</button>
                      </div>
                    </div>
                  </div>
                )
                }
              </>
            )}

            {/* ── COURSES ── */}
            {
              view === "courses" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>{COURSES.length} courses • {completedCourses.size} completed • {COURSES.filter(c => c.languages.includes("ES")).length} available in Spanish</div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setView("ai")}>✦ AI Course Builder</button>
                  </div>
                  <div className="filter-bar">
                    {["All", "Federal", "Florida", "Role-Specific", "Flagged"].map(f => (
                      <button key={f} className={`filter-btn ${courseFilter === f ? "active" : ""}`} onClick={() => setCourseFilter(f)}>
                        {f === "Flagged" ? "⚠ Flagged for Review" : f}
                      </button>
                    ))}
                  </div>
                  <div className="course-table-wrap fade-in">
                    <table className="course-table">
                      <thead>
                        <tr>
                          <th style={{ width: 80 }}>Category</th>
                          <th>Course Module</th>
                          <th>Target Role</th>
                          <th>Frequency</th>
                          <th>Citations</th>
                          <th>Rating</th>
                          <th style={{ textAlign: "center" }}>Comp %</th>
                          <th style={{ textAlign: "center" }}>Fail %</th>
                          <th style={{ textAlign: "right" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.map(c => {
                          const done = completedCourses.has(c.id);
                          const flagged = c.rating < 4.0 || c.quizFailRate > 25;
                          return (
                            <tr key={c.id} className={flagged ? "flagged" : ""} onClick={() => startCourse(c)}>
                              <td>
                                <span className={`badge-pill ${c.category === "Florida" ? "badge-teal" : c.category === "Federal" ? "badge-muted" : "badge-amber"}`} style={{ fontSize: 9 }}>
                                  {c.category === "Florida" ? "🌴 FL" : c.category === "Federal" ? "FED" : "ROLE"}
                                </span>
                              </td>
                              <td>
                                <div className="course-title-cell">{c.title}</div>
                                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                                  <span className="badge-pill badge-muted" style={{ fontSize: 9, padding: "2px 6px" }}>⏱ {c.duration}m</span>
                                  {c.surveyed && <span className="badge-pill badge-amber" style={{ fontSize: 9, padding: "2px 6px" }}>AHCA Surveyed</span>}
                                  {c.languages.includes("ES") && <span className="badge-pill badge-teal" style={{ fontSize: 9, padding: "2px 6px" }}>EN|ES</span>}
                                </div>
                              </td>
                              <td><span className="badge-pill badge-muted" style={{ fontSize: 10 }}>{c.role}</span></td>
                              <td style={{ fontSize: 12, color: "var(--warm2)" }}>{c.freq}</td>
                              <td><div className="citation-cell">{c.citation}</div></td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <Stars rating={c.rating} />
                                  <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{c.rating}</span>
                                </div>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div className="metric-cell" style={{ color: c.completionRate >= 90 ? "var(--green)" : c.completionRate >= 75 ? "var(--teal)" : "var(--amber)" }}>
                                  {c.completionRate}%
                                </div>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div className="metric-cell" style={{ color: c.quizFailRate > 25 ? "var(--red)" : "var(--warm)" }}>
                                  {c.quizFailRate}%
                                </div>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                {done ? (
                                  <span className="badge-pill badge-green">Complete</span>
                                ) : (
                                  <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: 11 }}>Start →</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )
            }

            {/* ── PLAYER ── */}
            {
              view === "player" && activeCourse && !showCert && (
                <div className="player-wrap">
                  <div className="player-header">
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <span className={`badge-pill ${activeCourse.category === "Florida" ? "badge-teal" : "badge-muted"}`} style={{ fontSize: 10 }}>{activeCourse.category}</span>
                      <span className="badge-pill badge-muted" style={{ fontSize: 10 }}>{activeCourse.citation}</span>
                      {activeCourse.surveyed && <span className="badge-pill badge-amber" style={{ fontSize: 10 }}>AHCA Surveyed</span>}
                    </div>
                    <h2 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, color: "var(--warm)", marginBottom: 8 }}>{activeCourse.title}</h2>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {isQuiz ? `Quiz — Question ${quizIdx + 1} of ${questions.length}` : `Slide ${playerStep + 1} of ${TOTAL_SLIDES}`}
                      </div>
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setView("courses")}>← Back to Library</button>
                    </div>
                    <div style={{ marginTop: 10, height: 4, background: "var(--navy3)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--teal)", borderRadius: 2, width: `${isQuiz ? ((quizIdx + 1) / questions.length) * 100 : ((playerStep + 1) / TOTAL_SLIDES) * 100}%`, transition: "width 0.4s" }} />
                    </div>
                  </div>

                  {!isQuiz ? (
                    <div className="player-slide fade-in">
                      <div className="slide-header-visual">
                        {(() => {
                          // Priority: DALL-E generated > slide.image > course scenes fallback > avatar
                          const COURSE_IMAGES = {
                            1: "/hipaa_compliance_hero_1773092188472.png",
                            2: "/bloodborne_pathogens_hero_1773092231806.png",
                            3: "/hazcom_safety_hero_1773093350877.png",
                            4: "/fraud_prevention_hero_1773092325162.png",
                            5: "/fraud_prevention_hero_1773092325162.png",
                            6: "/fraud_prevention_hero_1773092325162.png",
                            7: "/emergency_prep_hero_1773092311134.png",
                            8: "/infection_control_hero_1773092204162.png",
                            9: "/healthcare_deescalation_visual_1_1773088747081.png",
                            10: "/fire_safety_hero_1773092218263.png",
                            11: "/abuse_prevention_hero_1773092297226.png",
                            12: "/hipaa_compliance_hero_1773092188472.png",
                            13: "/fraud_prevention_hero_1773092325162.png",
                            14: "/patient_rights_hero_1773093363663.png",
                            15: "/patient_rights_hero_1773093363663.png",
                            16: "/infection_control_hero_1773092204162.png",
                            17: "/hipaa_compliance_hero_1773092188472.png",
                            18: "/infection_control_hero_1773092204162.png",
                            24: "/radiation_safety_hero_1773120643582_png_1773125917662.png",
                            25: "/chemical_hygiene_hero_1773120643583_png_1773125934470.png",
                            27: "/alzheimers_care_hero_v2_1773093378765.png",
                            28: "/patient_rights_hero_1773093363663.png",
                            29: "/healthcare_deescalation_visual_1_1773088747081.png",
                            31: "/human_trafficking_awareness_hero_1773092472539.png",
                            33: "/alzheimers_care_hero_v2_1773093378765.png",
                            34: "/cybersecurity_hero_1773120643580_png_1773125876729.png",
                            35: "/ai_compliance_hero_1773120643581_png_1773125899123.png",
                          };
                          const imgSrc = generatedImages[playerStep]
                            || slides[playerStep]?.image
                            || COURSE_IMAGES[activeCourse?.id]
                            || AVATARS.find(a => a.id === selectedAvatar)?.img;

                          return (
                            <div className="video-short-container">
                              <div className="video-scene active">
                                <img src={imgSrc} className="video-bg" alt="Course Visual" />
                                <div className="light-shimmer" />
                                <div className="video-overlay" />
                                <div className="cinematic-frame" />
                                <div className="video-content">
                                  <div className="video-label">
                                    <span className="pulse-dot"></span>
                                    {generatedImages[playerStep] ? "DALL-E 3 NEURAL STILL" : "LIVE AI FEED"}
                                  </div>
                                  <div className="video-text">{slides[playerStep]?.title}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="audio-sub-header">
                        <div className={`avatar-overlay ${isPlayingAudio ? "playing" : ""}`} style={{ width: 60, height: 60 }}>
                          <img src={AVATARS.find(a => a.id === selectedAvatar)?.img} className="avatar-img" />
                          {isPlayingAudio && (
                            <div className="audio-indicator">
                              {[1, 2, 3, 4, 5].map(i => <div key={i} className="audio-bar" style={{ animationDelay: `${i * 0.1}s` }} />)}
                            </div>
                          )}
                        </div>

                        <div className="audio-control-row" style={{ marginTop: 0, flex: 1 }}>
                          {!isPlayingAudio ? (
                            <button className="btn btn-primary" style={{ padding: "12px", justifyContent: "center", width: "100%" }} onClick={() => setIsPlayingAudio(true)}>
                              ▶ Play Instructor Audio
                            </button>
                          ) : (
                            <div className="audio-progress-btn" style={{ width: "100%" }} onClick={() => setIsPlayingAudio(false)}>
                              <div className="audio-progress-fill" style={{ width: `${audioProgress}%` }} />
                              <div className="audio-progress-content">
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span className="audio-progress-text">⏸ Listening to Lesson...</span>
                                  {isUsingElevenLabs && <span className="badge-pill badge-teal" style={{ fontSize: 8, padding: "2px 6px", opacity: 0.8 }}>ELEVENLABS AI</span>}
                                </div>
                                <span className="audio-progress-time">
                                  {Math.floor(audioTime / 60)}:{(Math.floor(audioTime) % 60).toString().padStart(2, '0')} / {Math.floor(audioDuration / 60)}:{(Math.floor(audioDuration) % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="slide-main-scroll">
                        <div className="animate-content">
                          <div className="scalable-text" dangerouslySetInnerHTML={{ __html: (slides[playerStep]?.body || "").replace(/\n/g, "<br/>") }} />

                          {slides[playerStep]?.chartData && (
                            <div className="glass-card" style={{ marginTop: 32 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
                                Statistical Risk Analysis
                              </div>
                              {slides[playerStep].chartData.map((d, i) => (
                                <div key={i} className="graph-bar-row">
                                  <div className="graph-label">{d.label}</div>
                                  <div className="graph-bar-bg">
                                    <div className="graph-bar-fill" style={{ width: isPlayingAudio ? `${d.val}%` : '4%', backgroundColor: d.color || 'var(--teal)' }} />
                                  </div>
                                  <div className="graph-val">{d.val}%</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {slides[playerStep]?.example && (
                            <div className="glass-card" style={{ borderLeft: "4px solid var(--amber)", background: "rgba(255, 179, 64, 0.05)" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", marginBottom: 8, textTransform: "uppercase" }}>High-Value Example</div>
                              <div style={{ fontSize: 14, color: "var(--warm2)", fontStyle: "italic" }}>{slides[playerStep].example}</div>
                            </div>
                          )}

                          {slides[playerStep]?.interaction && (
                            <button className="btn btn-outline" style={{ marginTop: 8, width: "100%", height: 54, justifyContent: "center", fontSize: 14, fontWeight: 600 }} onClick={() => setActiveScenario(slides[playerStep].interaction)}>
                              ✦ Launch Interactive Scenario
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="player-slide">
                      <div className="slide-content">
                        <div className="slide-num">KNOWLEDGE CHECK — QUESTION {quizIdx + 1}</div>
                        <div className="slide-title" style={{ fontSize: 18 }}>{questions[quizIdx]?.q}</div>
                        <div style={{ marginTop: 20 }}>
                          {questions[quizIdx]?.options.map((opt, oi) => {
                            let cls = "quiz-option";
                            if (quizSubmitted) {
                              if (oi === questions[quizIdx].correct) cls += " correct";
                              else if (quizAnswers[quizIdx] === oi) cls += " wrong";
                            } else if (quizAnswers[quizIdx] === oi) {
                              cls += " selected";
                            }
                            return <button key={oi} className={cls} onClick={() => handleQuizAnswer(oi)}>{opt}</button>;
                          })}
                        </div>
                        {quizSubmitted && quizIdx < questions.length - 1 && (
                          <div style={{ marginTop: 16, textAlign: "right" }}>
                            <button className="btn btn-primary" onClick={() => setPlayerStep(s => s + 1)}>Next Question →</button>
                          </div>
                        )}

                        {quizSubmitted && quizIdx === questions.length - 1 && (
                          <div style={{ marginTop: 20, padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid var(--border)" }}>
                            {(() => {
                              const score = questions.filter((q, i) => quizAnswers[i] === q.correct).length;
                              const pct = Math.round((score / questions.length) * 100);
                              const passed = pct >= 80;
                              return (
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 13, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Final Result</div>
                                  <div style={{ fontSize: 32, fontWeight: 800, color: passed ? "var(--green)" : "var(--red)", marginBottom: 4 }}>{pct}%</div>
                                  <div style={{ fontSize: 14, color: "var(--warm2)", marginBottom: 20 }}>
                                    {passed ? "Congratulations! You have passed the assessment." : "Required passing score is 80%."}
                                  </div>
                                  {passed ? (
                                    <div className="fade-in" style={{ color: "var(--teal)", fontWeight: 600 }}>
                                      <span style={{ animation: "pulse 2s infinite" }}>✦ Generating your certificate...</span>
                                    </div>
                                  ) : (
                                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={retryQuiz}>
                                      ↻ Retry Assessment
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {!quizSubmitted && quizAnswers[quizIdx] !== undefined && quizIdx === questions.length - 1 && (
                          <div style={{ marginTop: 16, textAlign: "right" }}>
                            <button className="btn btn-primary" onClick={submitQuiz}>Submit Quiz</button>
                          </div>
                        )}
                        {!quizSubmitted && quizAnswers[quizIdx] !== undefined && quizIdx < questions.length - 1 && (
                          <div style={{ marginTop: 16, textAlign: "right" }}>
                            <button className="btn btn-primary" onClick={() => setPlayerStep(s => s + 1)}>Next →</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="player-controls" style={{ marginTop: 20 }}>
                    <button className="btn btn-ghost" onClick={() => setPlayerStep(s => Math.max(0, s - 1))} disabled={playerStep === 0}>← Previous</button>
                    <div className="progress-step">
                      {slides.map((_, i) => (
                        <div key={i} className={`step-dot ${i === playerStep ? "active" : i < playerStep ? "done" : ""}`} />
                      ))}
                      <div style={{ width: 16 }} />
                      {questions.map((_, i) => (
                        <div key={i} className={`step-dot ${playerStep === TOTAL_SLIDES + i ? "active" : playerStep > TOTAL_SLIDES + i ? "done" : ""}`} style={{ background: playerStep > TOTAL_SLIDES + i ? "var(--green)" : undefined }} />
                      ))}
                    </div>
                    {!isQuiz && (
                      <button className="btn btn-primary" onClick={() => setPlayerStep(s => s + 1)}>
                        {playerStep < TOTAL_SLIDES - 1 ? "Next →" : "Start Quiz →"}
                      </button>
                    )}
                  </div>
                  {/* Scenario Modal */}
                  {activeScenario && (
                    <div className="scenario-card">
                      <div className="scenario-box">
                        <div style={{ fontSize: 10, color: "var(--teal)", fontFamily: "var(--font-mono)", marginBottom: 12, letterSpacing: 2 }}>MODULE INTERACTION</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--warm)", marginBottom: 20, lineHeight: 1.4 }}>{activeScenario.question}</div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {activeScenario.options?.map((opt, oi) => {
                            let cls = "quiz-option";
                            if (scenarioResult !== null) {
                              if (oi === activeScenario.correct) cls += " correct";
                              else if (scenarioResult === oi) cls += " wrong";
                            } else if (scenarioResult === oi) {
                              cls += " selected";
                            }
                            return (
                              <button key={oi} className={cls} onClick={() => {
                                if (scenarioResult !== null) return;
                                setScenarioResult(oi);
                              }}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {scenarioResult !== null && (
                          <div className="fade-in" style={{ marginTop: 20, padding: 12, background: "var(--navy3)", borderRadius: 8, fontSize: 12.5, color: "var(--warm2)", border: "1px solid var(--border)" }}>
                            <div style={{ fontWeight: 700, color: scenarioResult === activeScenario.correct ? "var(--green)" : "var(--red)", marginBottom: 4 }}>
                              {scenarioResult === activeScenario.correct ? "✓ Correct Action" : "✗ Incorrect Action"}
                            </div>
                            {activeScenario.feedback}
                            <button className="btn btn-primary" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} onClick={() => { setActiveScenario(null); setScenarioResult(null); }}>Continue Course →</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            {/* ── CERTIFICATE ── */}
            {
              view === "player" && showCert && (
                <div className="player-wrap">
                  {!feedbackDone ? (
                    <div className="card" style={{ marginBottom: 24 }}>
                      <div className="card-header"><span className="card-title">Course Feedback</span></div>
                      <div className="card-body">
                        <div className="feedback-section" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
                          <div className="feedback-q">How would you rate this course?</div>
                          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} style={{ fontSize: 28, background: "none", border: "none", cursor: "pointer", opacity: 0.7 }}>⭐</button>
                            ))}
                          </div>
                          <div className="feedback-q">Was this training relevant to your daily work?</div>
                          <div className="checkbox-group">
                            {["Up-to-date", "Easy to understand", "Too long", "Too short", "Needs more examples", "Great real-world scenarios"].map(item => (
                              <div key={item} className={`check-item ${feedbackChecks.includes(item) ? "checked" : ""}`} onClick={() => toggleCheck(item)}>{item}</div>
                            ))}
                          </div>
                          <div className="feedback-q">What was missing or could be improved?</div>
                          <textarea className="ai-input" style={{ minHeight: 80 }} placeholder="Optional — your feedback helps us improve this course..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
                          <div style={{ marginTop: 16, textAlign: "right" }}>
                            <button className="btn btn-primary" onClick={() => setFeedbackDone(true)}>Submit Feedback & Get Certificate →</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="cert-wrap" style={{ marginBottom: 24 }}>
                        <div className="cert-seal">🏥</div>
                        <div className="cert-org">ComplianceIQ Florida</div>
                        <div className="cert-title-big">Certificate of Completion</div>
                        <div className="cert-presented">This certifies that</div>
                        <div className="cert-name">Maria Rodriguez, RN</div>
                        <div className="cert-course">has successfully completed</div>
                        <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700, color: "var(--warm)", margin: "8px 0" }}>{activeCourse.title}</div>
                        <div className="cert-citation">{activeCourse.citation}</div>
                        <div className="cert-meta">
                          <div className="cert-meta-item"><div className="cert-meta-label">Completed</div><div className="cert-meta-val">Mar 9, 2026</div></div>
                          <div className="cert-meta-item"><div className="cert-meta-label">Expires</div><div className="cert-meta-val">Mar 9, 2027</div></div>
                          <div className="cert-meta-item"><div className="cert-meta-label">Score</div><div className="cert-meta-val" style={{ color: "var(--green)" }}>100%</div></div>
                          <div className="cert-meta-item"><div className="cert-meta-label">Verify</div><div className="cert-meta-val" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>CIQ-2026-FL-{activeCourse.id}834</div></div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <button className="btn btn-primary">⬇ Download Certificate</button>
                        <button className="btn btn-outline" onClick={() => setView("courses")}>← Back to Library</button>
                      </div>
                    </>
                  )}
                </div>
              )
            }

            {/* ── EMPLOYEES ── */}
            {
              view === "employees" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>244 total employees · 27 overdue · Last sync 2 hours ago</div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn btn-ghost">⬇ Export CSV</button>
                      <button className="btn btn-primary">+ Add Employee</button>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body" style={{ padding: "8px 16px" }}>
                      <table className="table">
                        <thead><tr>
                          <th>Workforce Member</th><th>Department</th><th>Status</th><th>Type</th><th>Progress</th><th>Completed</th><th>Overdue</th><th></th>
                        </tr></thead>
                        <tbody>
                          {EMPLOYEES.map(e => (
                            <tr key={e.id}>
                              <td style={{ fontWeight: 600 }}>{e.name}</td>
                              <td style={{ fontSize: 12.5, color: "var(--muted)" }}>{e.dept}</td>
                              <td><span className="badge-pill badge-muted" style={{ fontSize: 10 }}>{e.role}</span></td>
                              <td>
                                <span className={`badge-pill ${e.type === "Employee" ? "badge-teal" : e.type === "Independent Contractor" ? "badge-amber" : "badge-muted"}`} style={{ fontSize: 9 }}>
                                  {e.type}
                                </span>
                              </td>
                              <td style={{ width: 140 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <ProgBar pct={Math.round(e.completed / e.total * 100)} />
                                  <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", width: 36 }}>{Math.round(e.completed / e.total * 100)}%</span>
                                </div>
                              </td>
                              <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{e.completed}/{e.total}</td>
                              <td>{e.overdue > 0 ? <span className="badge-pill badge-red">{e.overdue}</span> : <span className="badge-pill badge-green">✓</span>}</td>
                              <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.lastActivity}</td>
                              <td><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }}>View Profile</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )
            }

            {/* ── ASSIGN TRAINING ── */}
            {view === "assign" && (
              <div className="fade-in">
                {/* Assignment Modal */}
                {assignModalOpen && selectedEmployeeAssign && (
                  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setAssignModalOpen(false)}>
                    <div style={{ background: "var(--navy2)", border: "1px solid var(--border)", borderRadius: 20, width: "100%", maxWidth: 680, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.8)", animation: "slideUp 0.3s ease-out" }} onClick={e => e.stopPropagation()}>
                      <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800, color: "var(--warm)" }}>Assign Training — {selectedEmployeeAssign.name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{selectedEmployeeAssign.role} · {selectedEmployeeAssign.dept}</div>
                        </div>
                        <button className="btn btn-ghost" style={{ padding: "8px 16px" }} onClick={() => setAssignModalOpen(false)}>✕ Close</button>
                      </div>
                      <div style={{ padding: "16px 28px", background: "rgba(0,212,200,0.03)", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", gap: 12 }}>
                          <input type="text" placeholder="Search courses by name or regulation..." className="ai-input" style={{ flex: 1, minHeight: 40, padding: "8px 16px", fontSize: 13 }} />
                          <select className="ai-input" style={{ width: 140, minHeight: 40, padding: "0 12px", fontSize: 13 }}>
                            <option>All Categories</option>
                            <option>Florida</option>
                            <option>Federal</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ overflowY: "auto", flex: 1, padding: 20 }}>
                        <div style={{ fontSize: 10, color: "var(--teal)", fontFamily: "var(--font-mono)", marginBottom: 16, letterSpacing: 2 }}>AVAILABLE FLORIDA & FEDERAL CATALOG</div>
                        {COURSES.filter(c => !(assignTraining[selectedEmployeeAssign.id] || []).includes(c.id)).length === 0 ? (
                          <div style={{ padding: 48, textAlign: "center" }}>
                            <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
                            <div style={{ color: "var(--warm)", fontWeight: 600 }}>All courses assigned</div>
                            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>This employee has the full catalog assigned.</div>
                          </div>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                            {COURSES.filter(c => !(assignTraining[selectedEmployeeAssign.id] || []).includes(c.id)).map(c => (
                              <div key={c.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", background: "var(--navy3)", transition: "all 0.2s" }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--warm)" }}>{c.title}</div>
                                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                    <span style={{ fontSize: 10, color: "var(--teal)", fontFamily: "var(--font-mono)" }}>{c.category.toUpperCase()}</span>
                                    <span style={{ fontSize: 10, color: "var(--muted)" }}>·</span>
                                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{c.duration} MIN</span>
                                    <span style={{ fontSize: 10, color: "var(--muted)" }}>·</span>
                                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{c.citation}</span>
                                  </div>
                                </div>
                                <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 12, fontWeight: 700 }}
                                  onClick={() => {
                                    setAssignTraining(prev => ({
                                      ...prev,
                                      [selectedEmployeeAssign.id]: [...(prev[selectedEmployeeAssign.id] || []), c.id]
                                    }));
                                  }}>
                                  + Assign
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, color: "var(--warm)", marginBottom: 4 }}>Assign Training</h3>
                    <p style={{ fontSize: 13, color: "var(--muted)" }}>Select an employee to view or manage their assigned compliance training.</p>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textAlign: "right" }}>
                    <div>{EMPLOYEES.length} employees · {COURSES.length} available courses</div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Employee</th>
                          <th>Department</th>
                          <th>Type</th>
                          <th>Assigned</th>
                          <th>Progress</th>
                          <th>Overdue</th>
                          <th>Last Active</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {EMPLOYEES.map(e => {
                          const assignedIds = assignTraining[e.id] || [];
                          const assignedCourses = COURSES.filter(c => assignedIds.includes(c.id));
                          const completedCount = Math.min(e.completed, assignedCourses.length);
                          const pct = assignedCourses.length > 0 ? Math.round(completedCount / assignedCourses.length * 100) : 0;
                          const isExpanded = expandedEmployee === e.id;
                          return (
                            <Fragment key={e.id}>
                              <tr style={{ cursor: "pointer", background: isExpanded ? "var(--teal3)" : "transparent" }} onClick={() => setExpandedEmployee(isExpanded ? null : e.id)}>
                                <td style={{ width: 24, paddingLeft: 20, color: "var(--teal)", fontSize: 14, fontWeight: 800 }}>{isExpanded ? "−" : "+"}</td>
                                <td style={{ fontWeight: 600, color: "var(--warm)" }}>{e.name}</td>
                                <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.dept}</td>
                                <td><span className={`badge-pill ${e.type.includes("Employee") ? "badge-teal" : "badge-amber"}`} style={{ fontSize: 9 }}>{e.type}</span></td>
                                <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--warm2)" }}>{assignedCourses.length} courses</td>
                                <td style={{ width: 160 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <ProgBar pct={pct} />
                                    <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", width: 36 }}>{pct}%</span>
                                  </div>
                                </td>
                                <td>
                                  {e.overdue > 0 ? (
                                    <span className="badge-pill badge-red" style={{ fontSize: 10, padding: "3px 8px" }}>{e.overdue} OVERDUE</span>
                                  ) : (
                                    <span className="badge-pill badge-green" style={{ fontSize: 10, padding: "3px 8px" }}>ON TRACK</span>
                                  )}
                                </td>
                                <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.lastActivity}</td>
                                <td style={{ textAlign: "right", paddingRight: 20 }}>
                                  <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 11, borderRadius: 6 }}
                                    onClick={ev => { ev.stopPropagation(); setSelectedEmployeeAssign(e); setAssignModalOpen(true); }}>
                                    Assign Course
                                  </button>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr key={`${e.id}-expanded`}>
                                  <td colSpan={9} style={{ padding: 0 }}>
                                    <div style={{ background: "var(--navy3)", padding: "24px 32px 32px 64px", borderBottom: "1px solid var(--border)", borderLeft: "4px solid var(--teal)" }}>
                                      {/* Header row */}
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                        <div>
                                          <div style={{ fontSize: 10, color: "var(--teal)", fontFamily: "var(--font-mono)", letterSpacing: 2, marginBottom: 4 }}>ACTIVE TRAINING CURRICULUM — {e.name.toUpperCase()}</div>
                                          <div style={{ fontSize: 13, color: "var(--warm2)" }}>
                                            Managing <strong>{assignedCourses.length}</strong> assigned courses. Current completion is <strong>{pct}%</strong>.
                                          </div>
                                        </div>
                                        <button className="btn btn-primary" style={{ padding: "8px 18px", fontSize: 12 }}
                                          onClick={ev => { ev.stopPropagation(); setSelectedEmployeeAssign(e); setAssignModalOpen(true); }}>
                                          + Add New Course
                                        </button>
                                      </div>

                                      {assignedCourses.length === 0 ? (
                                        <div style={{ padding: "40px 0", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px dashed var(--border)" }}>
                                          <div style={{ color: "var(--muted)", fontSize: 14 }}>No courses assigned to this workforce member.</div>
                                          <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => { setSelectedEmployeeAssign(e); setAssignModalOpen(true); }}>Assign First Course</button>
                                        </div>
                                      ) : (
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                                          {assignedCourses.map((c, ci) => {
                                            const isDone = ci < e.completed;
                                            const isOverdue = !isDone && ci >= (assignedCourses.length - e.overdue);
                                            const accentColor = isDone ? "var(--green)" : isOverdue ? "var(--red)" : "var(--amber)";
                                            return (
                                              <div key={c.id} style={{
                                                display: "flex", alignItems: "center", gap: 16,
                                                padding: "16px 20px",
                                                background: "var(--navy2)",
                                                borderRadius: 12,
                                                border: `1px solid ${isDone ? "rgba(0,196,140,0.15)" : isOverdue ? "rgba(255,77,106,0.15)" : "rgba(255,179,64,0.15)"}`,
                                                transition: "all 0.2s"
                                              }}>
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: accentColor, boxShadow: `0 0 10px ${accentColor}` }} />
                                                <div style={{ flex: 1 }}>
                                                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--warm)" }}>{c.title}</div>
                                                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{c.category} · {c.freq} Requirement · {c.duration} min</div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                                  <span className={`badge-pill ${isDone ? "badge-green" : isOverdue ? "badge-red" : "badge-amber"}`} style={{ fontSize: 10, minWidth: 100, justifyContent: "center" }}>
                                                    {isDone ? "COMPLETE" : isOverdue ? "OVERDUE" : "IN PROGRESS"}
                                                  </span>
                                                  <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 11, border: "1px solid var(--border)" }}
                                                    onClick={() => setAssignTraining(prev => ({ ...prev, [e.id]: (prev[e.id] || []).filter(id => id !== c.id) }))}>
                                                    ✕ Remove
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── REPORTS ── */}
            {view === "reports" && (() => {
              const totalStaff = EMPLOYEES.length;
              const atRisk = EMPLOYEES.filter(e => e.overdue > 0).length;
              const avgCompletion = overallCompliance;
              const totalOverdue = EMPLOYEES.reduce((s, e) => s + e.overdue, 0);
              const catBreakdown = ["Florida", "Federal", "Role-Specific"].map(cat => ({
                label: cat,
                count: COURSES.filter(c => c.category === cat).length,
                completion: Math.round(COURSES.filter(c => c.category === cat).reduce((s, c) => s + c.completionRate, 0) / Math.max(1, COURSES.filter(c => c.category === cat).length))
              }));
              const worstCourses = [...COURSES].sort((a, b) => b.quizFailRate - a.quizFailRate).slice(0, 6);
              const maxDeptComp = Math.max(...DEPARTMENTS.map(d => d.compliance));
              return (
                <div className="reports-view fade-in">
                  {/* ── AUDIT SECTION SELECTOR MODAL ── */}
                  {auditModalOpen && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setAuditModalOpen(false)}>
                      <div style={{ background: "var(--navy2)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 560, boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 800, color: "var(--warm)" }}>⬇ AHCA Audit Report — Export Options</div>
                            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Select sections to include. Charts are auto-selected per data type.</div>
                          </div>
                          <button className="btn btn-ghost" style={{ padding: "5px 10px" }} onClick={() => setAuditModalOpen(false)}>✕</button>
                        </div>
                        <div style={{ padding: "20px 28px" }}>
                          <div style={{ fontSize: 10, color: "var(--teal)", fontFamily: "var(--font-mono)", marginBottom: 14, letterSpacing: 1 }}>REPORT SECTIONS</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[
                              { key: "execSummary", label: "Executive Summary", sub: "AI-written narrative overview of compliance status", chart: "📝 Narrative" },
                              { key: "deptCompliance", label: "Department Compliance Overview", sub: "AHCA readiness by department", chart: "📊 Bar Chart" },
                              { key: "ahcaCourses", label: "AHCA Surveyed Course Completion", sub: "Surveyed course status and citation mapping", chart: "📋 Table + Bar" },
                              { key: "atRiskEmployees", label: "At-Risk Employee Analysis", sub: "Staff with overdue training and risk classification", chart: "⚠️ Table" },
                              { key: "quizPerformance", label: "Quiz Failure Rate Analysis", sub: "Courses with highest fail rates — content gap indicators", chart: "📊 Bar Chart" },
                              { key: "categoryDist", label: "Course Category Distribution", sub: "Florida / Federal / Role-Specific breakdown", chart: "🥧 Pie Chart" },
                              { key: "employeeProgress", label: "Full Employee Training Progress", sub: "All staff completion details (adds pages)", chart: "📋 Full Table" },
                              { key: "regulatoryCitations", label: "Regulatory Citations Appendix", sub: "F-Tags, Florida Statutes, and AHCA rule references", chart: "📝 Appendix" },
                            ].map(({ key, label, sub, chart }) => (
                              <label key={key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: auditSections[key] ? "rgba(0,212,200,0.07)" : "var(--navy3)", borderRadius: 8, border: `1px solid ${auditSections[key] ? "var(--teal3)" : "var(--border)"}`, cursor: "pointer" }}>
                                <input type="checkbox" checked={auditSections[key]} onChange={e => setAuditSections(p => ({ ...p, [key]: e.target.checked }))} style={{ accentColor: "var(--teal)", width: 16, height: 16, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--warm)" }}>{label}</div>
                                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sub}</div>
                                </div>
                                <span style={{ fontSize: 10, color: "var(--teal)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{chart}</span>
                              </label>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setAuditModalOpen(false); generateAuditPDF(); }}>
                              ⬇ Generate & Print PDF
                            </button>
                            <button className="btn btn-ghost" onClick={() => setAuditModalOpen(false)}>Cancel</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, color: "var(--warm)", marginBottom: 4 }}>Compliance Reports & Statistics</h3>
                      <p style={{ fontSize: 13, color: "var(--muted)" }}>Live analytics across {totalStaff} staff, {COURSES.length} courses, and {DEPARTMENTS.length} departments · {agency.name}</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn btn-primary" onClick={() => setAuditModalOpen(true)}>⬇ AHCA Audit Export (PDF)</button>
                      <button className="btn btn-outline" onClick={() => {
                        const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
                        const row = (...cols) => cols.map(esc).join(",");
                        const blank = "\r\n";

                        const sections = [
                          // ─ Section 1: Employee Training Summary
                          row("SECTION 1: EMPLOYEE TRAINING SUMMARY") + "\r\n" +
                          row("Employee", "Department", "Role", "Employment Type", "Completed", "Total Assigned", "Completion %", "Overdue Items", "Last Activity", "Risk Level") + "\r\n" +
                          EMPLOYEES.map(e => row(
                            e.name, e.dept, e.role, e.type,
                            e.completed, e.total,
                            Math.round(e.completed / e.total * 100) + "%",
                            e.overdue,
                            e.lastActivity,
                            e.overdue >= 4 ? "HIGH" : e.overdue > 0 ? "MEDIUM" : "OK"
                          )).join("\r\n"),

                          // ─ Section 2: Department Compliance
                          row("SECTION 2: DEPARTMENT COMPLIANCE") + "\r\n" +
                          row("Department", "Staff Count", "Compliance %", "Overdue Items", "AHCA Status", "Survey Risk") + "\r\n" +
                          DEPARTMENTS.map(d => row(
                            d.name, d.staff,
                            d.compliance + "%",
                            d.overdue,
                            d.compliance >= 85 ? "Audit Ready" : "Action Needed",
                            d.compliance >= 85 ? "Low" : d.compliance >= 75 ? "Moderate" : "High"
                          )).join("\r\n"),

                          // ─ Section 3: AHCA Surveyed Courses
                          row("SECTION 3: AHCA SURVEYED COURSE COMPLETION") + "\r\n" +
                          row("Course Title", "Citation", "Category", "Frequency", "Duration (min)", "Completion Rate %", "Quiz Fail Rate %", "Rating", "Audit Status") + "\r\n" +
                          COURSES.filter(c => c.surveyed).map(c => row(
                            c.title, c.citation, c.category, c.freq, c.duration,
                            c.completionRate + "%", c.quizFailRate + "%", c.rating,
                            c.completionRate >= 85 ? "Ready" : "Needs Action"
                          )).join("\r\n"),

                          // ─ Section 4: Full Course Catalog
                          row("SECTION 4: FULL COURSE CATALOG") + "\r\n" +
                          row("ID", "Course Title", "Category", "Frequency", "Duration (min)", "Role", "Completion %", "Quiz Fail %", "Rating", "AHCA Surveyed", "Citation") + "\r\n" +
                          COURSES.map(c => row(
                            c.id, c.title, c.category, c.freq, c.duration, c.role,
                            c.completionRate + "%", c.quizFailRate + "%", c.rating,
                            c.surveyed ? "Yes" : "No", c.citation || ""
                          )).join("\r\n"),
                        ];

                        const csv = sections.join("\r\n" + blank + "\r\n");
                        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `ComplianceIQ_Export_${agency.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}>⬇ CSV Export</button>

                    </div>
                  </div>

                  {/* KPI Cards */}
                  {/* ── HEALTH SCORE + KPI GLANCE ── */}
                  <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                    {/* Big health score */}
                    <div className="card" style={{ minWidth: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: 8 }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: 1, marginBottom: 4 }}>COMPLIANCE SCORE</div>
                      <RingChart pct={avgCompletion} size={110} color={avgCompletion >= 85 ? "green" : avgCompletion >= 70 ? "teal" : "amber"} />
                      <div style={{ fontSize: 12, color: avgCompletion >= 85 ? "var(--green)" : "var(--amber)", fontWeight: 700 }}>
                        {avgCompletion >= 85 ? "✓ AHCA Ready" : "⚠ Below Threshold"}
                      </div>
                    </div>

                    {/* KPI tiles */}
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                      {[
                        { label: "Total Staff", value: totalStaff, color: "var(--teal)", icon: "⊙" },
                        { label: "Certificates Issued", value: "2,847", color: "var(--green)", icon: "⊛" },
                        { label: "At-Risk Staff", value: atRisk, color: atRisk > 3 ? "var(--red)" : "var(--amber)", icon: "⚠" },
                        { label: "Overdue Items", value: totalOverdue, color: totalOverdue > 10 ? "var(--red)" : "var(--amber)", icon: "⊟" },
                        { label: "AHCA-Ready Depts", value: `${ahcaReadyCount}/${DEPARTMENTS.length}`, color: ahcaReadyCount === DEPARTMENTS.length ? "var(--green)" : "var(--amber)", icon: "◈" },
                        { label: "Courses Available", value: COURSES.length, color: "var(--teal)", icon: "⊞" },
                      ].map((k, i) => (
                        <div key={i} className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ fontSize: 18, color: k.color }}>{k.icon}</div>
                          <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--font-head)", color: k.color, lineHeight: 1 }}>{k.value}</div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: 0.5 }}>{k.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── ACCORDION SECTIONS ── */}
                  {[
                    {
                      key: "dept",
                      title: "Department Compliance",
                      icon: "⊙",
                      summary: (() => {
                        const worst = [...DEPARTMENTS].sort((a, b) => a.compliance - b.compliance)[0];
                        const best = [...DEPARTMENTS].sort((a, b) => b.compliance - a.compliance)[0];
                        return `${ahcaReadyCount}/${DEPARTMENTS.length} departments AHCA-ready — Best: ${best.name} (${best.compliance}%) · Needs attention: ${worst.name} (${worst.compliance}%)`;
                      })(),
                      badge: ahcaReadyCount < DEPARTMENTS.length ? { text: `${DEPARTMENTS.length - ahcaReadyCount} below threshold`, cls: "badge-amber" } : { text: "All ready", cls: "badge-green" },
                      detail: (
                        <div style={{ padding: "0 0 4px" }}>
                          {DEPARTMENTS.map(d => {
                            const bc = d.compliance >= 90 ? "var(--green)" : d.compliance >= 75 ? "var(--teal)" : "var(--amber)";
                            return (
                              <div key={d.name} style={{ marginBottom: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warm)" }}>{d.name}</span>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {d.overdue > 0 && <span className="badge-pill badge-red" style={{ fontSize: 9 }}>{d.overdue} overdue</span>}
                                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: bc }}>{d.compliance}%</span>
                                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{d.staff} staff</span>
                                    {d.compliance >= 85 ? <span className="badge-pill badge-green" style={{ fontSize: 9 }}>✓</span> : <span className="badge-pill badge-amber" style={{ fontSize: 9 }}>⚠</span>}
                                  </div>
                                </div>
                                <div style={{ height: 8, background: "var(--navy3)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                                  <div style={{ height: "100%", width: `${d.compliance}%`, background: bc, borderRadius: 4 }} />
                                  <div style={{ position: "absolute", top: 0, bottom: 0, left: "85%", width: 2, background: "rgba(255,255,255,0.25)" }} />
                                </div>
                              </div>
                            );
                          })}
                          <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                            <div style={{ width: 2, height: 12, background: "rgba(255,255,255,0.25)" }} /> AHCA 85% threshold
                          </div>
                        </div>
                      )
                    },
                    {
                      key: "risk",
                      title: "At-Risk Employees",
                      icon: "⚠",
                      summary: atRisk === 0 ? "✓ All employees on track — no overdue training items" : `${atRisk} employees have overdue training — ${EMPLOYEES.filter(e => e.overdue >= 4).length} classified HIGH risk`,
                      badge: atRisk === 0 ? { text: "All clear", cls: "badge-green" } : { text: `${atRisk} at risk`, cls: "badge-red" },
                      detail: (
                        <div style={{ overflowX: "auto" }}>
                          <table className="data-table">
                            <thead><tr><th>Employee</th><th>Department</th><th>Overdue</th><th>Completion</th><th>Last Active</th><th>Risk</th></tr></thead>
                            <tbody>
                              {EMPLOYEES.filter(e => e.overdue > 0).sort((a, b) => b.overdue - a.overdue).map(e => (
                                <tr key={e.id}>
                                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.dept}</td>
                                  <td><span className="badge-pill badge-red">{e.overdue} items</span></td>
                                  <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <ProgBar pct={Math.round(e.completed / e.total * 100)} />
                                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", width: 32 }}>{Math.round(e.completed / e.total * 100)}%</span>
                                    </div>
                                  </td>
                                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.lastActivity}</td>
                                  <td><span className={`badge-pill ${e.overdue >= 4 ? "badge-red" : "badge-amber"}`} style={{ fontSize: 9 }}>{e.overdue >= 4 ? "HIGH" : "MEDIUM"}</span></td>
                                </tr>
                              ))}
                              {atRisk === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>✓ No at-risk employees</td></tr>}
                            </tbody>
                          </table>
                        </div>
                      )
                    },
                    {
                      key: "quiz",
                      title: "Quiz Performance",
                      icon: "⊟",
                      summary: (() => {
                        const worst = worstCourses[0];
                        const avgFail = Math.round(COURSES.reduce((s, c) => s + c.quizFailRate, 0) / COURSES.length);
                        return `Avg fail rate: ${avgFail}% · Highest concern: ${worst?.title} at ${worst?.quizFailRate}% fail`;
                      })(),
                      badge: worstCourses[0]?.quizFailRate > 30 ? { text: "Critical course", cls: "badge-red" } : { text: "Monitoring", cls: "badge-amber" },
                      detail: (
                        <div>
                          {worstCourses.map(c => (
                            <div key={c.id} style={{ marginBottom: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: c.quizFailRate > 30 ? "var(--red)" : "var(--amber)", flex: 1, paddingRight: 12 }}>{c.title}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: c.quizFailRate > 30 ? "var(--red)" : "var(--amber)", flexShrink: 0 }}>{c.quizFailRate}% fail</span>
                              </div>
                              <div style={{ height: 6, background: "var(--navy3)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${c.quizFailRate}%`, background: c.quizFailRate > 30 ? "var(--red)" : "var(--amber)", borderRadius: 3 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    },
                    {
                      key: "ahca",
                      title: "AHCA Surveyed Courses",
                      icon: "⊛",
                      summary: (() => {
                        const surveyed = COURSES.filter(c => c.surveyed);
                        const ready = surveyed.filter(c => c.completionRate >= 85).length;
                        const avgComp = Math.round(surveyed.reduce((s, c) => s + c.completionRate, 0) / surveyed.length);
                        return `${surveyed.length} surveyed courses · ${ready} audit-ready · avg completion ${avgComp}%`;
                      })(),
                      badge: (() => { const r = COURSES.filter(c => c.surveyed && c.completionRate >= 85).length; const t = COURSES.filter(c => c.surveyed).length; return r === t ? { text: `${r}/${t} ready`, cls: "badge-green" } : { text: `${r}/${t} ready`, cls: "badge-amber" }; })(),
                      detail: (
                        <div style={{ overflowX: "auto" }}>
                          <table className="data-table">
                            <thead><tr><th>Course</th><th>Citation</th><th>Freq</th><th>Completion</th><th>Quiz Fail</th><th>Status</th></tr></thead>
                            <tbody>
                              {COURSES.filter(c => c.surveyed).map(c => (
                                <tr key={c.id}>
                                  <td style={{ fontWeight: 500, fontSize: 12 }}>{c.title}</td>
                                  <td style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{c.citation}</td>
                                  <td><span className="badge-pill badge-muted" style={{ fontSize: 9 }}>{c.freq}</span></td>
                                  <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <ProgBar pct={c.completionRate} />
                                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: c.completionRate >= 90 ? "var(--green)" : c.completionRate >= 75 ? "var(--teal)" : "var(--amber)", width: 34 }}>{c.completionRate}%</span>
                                    </div>
                                  </td>
                                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: c.quizFailRate > 25 ? "var(--red)" : "var(--muted)" }}>{c.quizFailRate}%</td>
                                  <td>{c.completionRate >= 85 ? <span className="badge-pill badge-green" style={{ fontSize: 9 }}>✓ Ready</span> : <span className="badge-pill badge-amber" style={{ fontSize: 9 }}>Needs Action</span>}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    },
                    {
                      key: "cat",
                      title: "Course Category Distribution",
                      icon: "⊞",
                      summary: catBreakdown.map(c => `${c.label}: ${c.count} courses (${c.completion}% avg)`).join(" · "),
                      badge: { text: `${COURSES.length} total`, cls: "badge-muted" },
                      detail: (
                        <div>
                          {catBreakdown.map((cat, i) => (
                            <div key={cat.label} style={{ marginBottom: 16 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 10, height: 10, borderRadius: 2, background: ["var(--teal)", "var(--amber)", "var(--green)"][i] }} />
                                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warm)" }}>{cat.label}</span>
                                </div>
                                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{cat.count} courses · avg {cat.completion}% completion · ★ {(COURSES.filter(c => c.category === cat.label).reduce((s, c) => s + c.rating, 0) / Math.max(1, cat.count)).toFixed(1)}</span>
                              </div>
                              <div style={{ height: 10, background: "var(--navy3)", borderRadius: 5, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${cat.completion}%`, background: ["var(--teal)", "var(--amber)", "var(--green)"][i], borderRadius: 5 }} />
                              </div>
                            </div>
                          ))}
                          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                            {catBreakdown.map((cat, i) => (
                              <div key={cat.label} style={{ flex: 1, minWidth: 100, background: "var(--navy3)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--border)" }}>
                                <div style={{ fontSize: 22, fontWeight: 900, color: ["var(--teal)", "var(--amber)", "var(--green)"][i], fontFamily: "var(--font-head)" }}>{cat.count}</div>
                                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{cat.label} courses</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                  ].map(section => (
                    <div key={section.key} className="card" style={{ marginBottom: 12, overflow: "hidden" }}>
                      {/* Accordion header — always visible */}
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", cursor: "pointer", userSelect: "none" }}
                        onClick={() => toggleReportSection(section.key)}
                      >
                        <span style={{ fontSize: 16, color: "var(--teal)", flexShrink: 0 }}>{section.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                            <span style={{ fontFamily: "var(--font-head)", fontSize: 14, fontWeight: 700, color: "var(--warm)" }}>{section.title}</span>
                            <span className={`badge-pill ${section.badge.cls}`} style={{ fontSize: 9 }}>{section.badge.text}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{section.summary}</div>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--muted)", transform: expandedReportSections[section.key] ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>▶</span>
                      </div>

                      {/* Expandable detail */}
                      {expandedReportSections[section.key] && (
                        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px" }}>
                          {section.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}



            {view === "agency" && (
              <div className="agency-settings-view fade-in">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
                  {/* LEFT COLUMN: AI Infrastructure */}
                  <div>
                    <div style={{ padding: "12px 16px", background: "rgba(0,212,200,0.05)", borderRadius: 10, border: "1px solid rgba(0,212,200,0.15)", marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>⚡</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)" }}>Neural Core Active</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>Course Builder auto-generates clinical imagery when OpenAI key is set.</div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <span className="card-title">Studio Rendering Quality</span>
                        <span className="badge-pill badge-teal" style={{ fontSize: 9 }}>AI Engine</span>
                      </div>
                      <div className="card-body">
                        {[{ label: "Stability", val: 0.5 }, { label: "Clarity", val: 0.75 }].map(s => (
                          <div key={s.label} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4, color: "var(--muted)" }}>
                              <span>{s.label}</span>
                              <span style={{ color: "var(--teal)", fontFamily: "var(--font-mono)" }}>{s.val}</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.01" defaultValue={s.val} style={{ width: "100%", accentColor: "var(--teal)" }} />
                          </div>
                        ))}
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, fontStyle: "italic" }}>
                          Higher stability reduces hallucination in medical terminology. Clarity affects visual resolution.
                        </p>
                      </div>
                    </div>

                    {/* API Integration Keys */}
                    <div className="card" style={{ marginTop: 20 }}>
                      <div className="card-header"><span className="card-title">API Integration Keys</span></div>
                      <div className="card-body">
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>OpenAI API Key (for Slide generation)</label>
                          <input type="password" value={openAiKey} onChange={e => { setOpenAiKey(e.target.value); localStorage.setItem('ciq_openai_key', e.target.value); }} style={{ width: "100%", background: "var(--navy)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px", color: "var(--warm)", fontSize: 12, fontFamily: "var(--font-mono)" }} placeholder="sk-..." />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>ElevenLabs API Key (for Voice studio)</label>
                          <input type="password" defaultValue={ELEVEN_LABS_KEY} style={{ width: "100%", background: "var(--navy)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px", color: "var(--warm)", fontSize: 12, fontFamily: "var(--font-mono)" }} placeholder="sk-..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Voice Selection & Workforce Tiers */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="card">
                      <div className="card-header"><span className="card-title">⚙ AI Voice Selection</span></div>
                      <div className="card-body">
                        <div className="grid-2" style={{ gap: 10 }}>
                          {VOICES.map(v => (
                            <div key={v.id} onClick={() => setSelectedVoice(v.id)} className={`card ${selectedVoice === v.id ? "active" : ""}`} style={{ padding: 12, cursor: "pointer", border: selectedVoice === v.id ? "2px solid var(--teal)" : "1px solid var(--border)", background: selectedVoice === v.id ? "rgba(0,212,200,0.05)" : "var(--navy3)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${v.color || "var(--teal)"}, var(--navy2))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                  {v.gender === "Male" ? "👤" : "👩"}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warm)" }}>{v.name.split(" ")[0]}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header"><span className="card-title">Florida Workforce Segmentations</span></div>
                      <div className="card-body">
                        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Managing 3 personnel tiers for AHCA/CMS compliance tracking:</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { label: "W-2 Permanent Employees", count: 184, color: "var(--teal)" },
                            { label: "1090 Independent Contractors", count: 42, color: "var(--amber)" },
                            { label: "Registry / Agency Staff", count: 18, color: "var(--muted)" }
                          ].map((s, i) => (
                            <div key={i} style={{ padding: "12px 14px", background: "var(--navy3)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--warm)" }}>{s.label}</span>
                              </div>
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{s.count}</span>
                            </div>
                          ))}
                        </div>
                        <button className="btn btn-outline" style={{ width: "100%", marginTop: 20, justifyContent: "center" }}>+ Add Custom Workforce Tier</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === "agencies" && (
              <div className="agencies-view fade-in">
                {!selectedAgencyPanel ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, color: "var(--warm)" }}>Enterprise Agency Management</h3>
                      <button className="btn btn-primary">+ Add New Agency</button>
                    </div>
                    <div className="grid-3">
                      {agencies.map(a => (
                        <div key={a.id} className="card hover-card" style={{ padding: 20, cursor: "pointer", transition: "transform 0.2s" }} onClick={() => setSelectedAgencyPanel(a)}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: a.logoColor, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy)", fontWeight: 800 }}>{a.short}</div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--warm)" }}>{a.compliance}%</div>
                              <div style={{ fontSize: 9, color: "var(--muted)" }}>COMPLIANCE</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--warm)", marginBottom: 4 }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16 }}>{a.staffCount} Personnel tracked</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span className="badge-pill badge-teal">White-Label</span>
                            <span className="badge-pill badge-muted">Florida Edition</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="agency-detail-view fade-in">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: "16px 20px", background: "var(--navy2)", borderRadius: 12, border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <button className="btn btn-ghost" onClick={() => setSelectedAgencyPanel(null)}>← Back</button>
                        <div style={{ width: 2, height: 24, background: "var(--border)" }} />
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--warm)" }}>{selectedAgencyPanel.name}</div>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn btn-primary" style={{ padding: "8px 24px", fontSize: 14, fontWeight: 700, boxShadow: "0 0 20px var(--teal)" }} onClick={() => { setActiveAgencyId(selectedAgencyPanel.id); setSelectedAgencyPanel(null); setView("dashboard"); }}>
                          ⚡ Manage this agency
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20 }}>
                      <div className="card">
                        <div className="card-header"><span className="card-title">Agency Identity & Branding</span></div>
                        <div className="card-body">
                          <div className="grid-2" style={{ gap: 20 }}>
                            <div>
                              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 8, letterSpacing: 1 }}>AGENCY NAME</label>
                              <input type="text" defaultValue={selectedAgencyPanel.name} style={{ width: "100%", background: "var(--navy)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px", color: "var(--warm)", fontSize: 14 }} />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 8, letterSpacing: 1 }}>PLATFORM BRANDING</label>
                              <input type="text" defaultValue={selectedAgencyPanel.platformBrand} style={{ width: "100%", background: "var(--navy)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px", color: "var(--warm)", fontSize: 14 }} />
                            </div>
                          </div>

                          <div style={{ marginTop: 24 }}>
                            <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 8, letterSpacing: 1 }}>AGENCY TAGLINE / MISSION</label>
                            <input type="text" defaultValue={selectedAgencyPanel.tagline} style={{ width: "100%", background: "var(--navy)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px", color: "var(--warm)", fontSize: 14 }} />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 24, marginTop: 24 }}>
                            <div>
                              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 8, letterSpacing: 1 }}>THEME COLOR</label>
                              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <input type="color" defaultValue={selectedAgencyPanel.logoColor} style={{ width: 44, height: 44, border: "none", background: "none", cursor: "pointer" }} />
                                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--warm)" }}>{selectedAgencyPanel.logoColor}</div>
                              </div>
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 8, letterSpacing: 1 }}>AGENCY LOGO (DARK MODE OPTIMIZED)</label>
                              <div style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: "20px", textAlign: "center", background: "var(--navy)" }}>
                                <div style={{ fontSize: 24, marginBottom: 8 }}>📁</div>
                                <div style={{ fontSize: 11, color: "var(--muted)" }}>Click or drag to update logo (PNG/SVG, max 500kb)</div>
                              </div>
                            </div>
                          </div>

                          <div style={{ marginTop: 32, padding: 16, background: "rgba(0,212,200,0.05)", borderRadius: 10, border: "1px solid var(--teal3)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)" }}>White-Label Platform Active</div>
                                <div style={{ fontSize: 11, color: "var(--muted)" }}>Hide all ComplianceIQ branding and use agency-specific domains.</div>
                              </div>
                              <input type="checkbox" defaultChecked={selectedAgencyPanel.whiteLabel} style={{ width: 40, height: 20 }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-header"><span className="card-title">Compliance Metrics</span></div>
                        <div className="card-body">
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ padding: 16, background: "var(--navy)", borderRadius: 10, border: "1px solid var(--border)" }}>
                              <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 8 }}>OVERALL COMPLIANCE HL</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ fontSize: 32, fontWeight: 900, color: selectedAgencyPanel.compliance > 80 ? "var(--green)" : "var(--amber)" }}>{selectedAgencyPanel.compliance}%</div>
                                <ProgBar pct={selectedAgencyPanel.compliance} />
                              </div>
                            </div>
                            <div className="grid-2" style={{ gap: 12 }}>
                              <div style={{ padding: 12, background: "var(--navy3)", borderRadius: 8, border: "1px solid var(--border)" }}>
                                <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>TOTAL STAFF</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--warm)" }}>{selectedAgencyPanel.staffCount}</div>
                              </div>
                              <div style={{ padding: 12, background: "var(--navy3)", borderRadius: 8, border: "1px solid var(--border)" }}>
                                <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>ACTIVE SURVEYS</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--amber)" }}>2</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {view === "alerts" && (
              <div className="alerts-view fade-in">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, color: "var(--warm)", marginBottom: 4 }}>AHCA Regulatory Monitor</h3>
                    <p style={{ fontSize: 13, color: "var(--muted)" }}>Live feed of Florida & Federal regulatory changes affecting compliance status.</p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-outline" style={{ fontSize: 11 }}>+ Add Custom Source</button>
                    <button className="btn btn-primary" style={{ fontSize: 11 }} onClick={generateBriefingPDF}>Generate Compliance Briefing</button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
                  <div className="card">
                    <div className="card-header"><span className="card-title">Live Regulatory Feed</span></div>
                    <div className="card-body" style={{ padding: 0 }}>
                      {ALERTS.map(alert => (
                        <div key={alert.id} style={{ padding: 20, borderBottom: "1px solid var(--border)", display: "flex", gap: 16 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: alert.severity === "high" ? "rgba(255,77,106,0.1)" : "rgba(255,179,64,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                            {alert.type === "regulation" ? "⚖️" : "📚"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--warm)" }}>{alert.title}</div>
                              <span className={`badge-pill ${alert.severity === "high" ? "badge-red" : "badge-amber"}`} style={{ fontSize: 9 }}>{alert.severity.toUpperCase()} IMPACT</span>
                            </div>
                            <div style={{ fontSize: 13, color: "var(--warm2)", lineHeight: 1.5, marginBottom: 12 }}>{alert.desc}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <div style={{ fontSize: 11, color: "var(--muted)" }}>Source: AHCA Bulletin · {alert.date}</div>
                                <a href={alert.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "var(--teal)", textDecoration: "none", borderBottom: "1px solid transparent" }} onMouseEnter={e => e.target.style.borderBottom = "1px solid var(--teal)"} onMouseLeave={e => e.target.style.borderBottom = "1px solid transparent"}>Visit Source ↗</a>
                              </div>
                              <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => { setView("courses"); setCourseFilter("Flagged"); }}>Review Affected Courses →</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="card" style={{ background: "linear-gradient(135deg, var(--navy2), #1a2744)" }}>
                      <div className="card-header"><span className="card-title">✦ AI Impact Analysis</span></div>
                      <div className="card-body">
                        <div style={{ fontSize: 12, color: "var(--warm2)", lineHeight: 1.6, marginBottom: 16 }}>
                          "Recent updates to <strong>AHCA Rule 59A-3</strong> create a 12% risk gap in your current 'Patient Rights' training module. I recommend injecting a new scenario on e-grievance protocols."
                        </div>
                        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Auto-Draft Revisions</button>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-header"><span className="card-title">Monitored Agencies</span></div>
                      <div className="card-body" style={{ padding: "12px 0" }}>
                        {[
                          { name: "AHCA Florida", url: "https://ahca.myflorida.com/" },
                          { name: "CMS Federal", url: "https://www.cms.gov/" },
                          { name: "OSHA", url: "https://www.osha.gov/" },
                          { name: "HHS Office of Civil Rights", url: "https://www.hhs.gov/ocr/index.html" }
                        ].map((s, i) => (
                          <div key={i} style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                            <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--warm)", textDecoration: "none" }}>{s.name} <span style={{ opacity: 0.5, fontSize: 10 }}>↗</span></a>
                            <span className="badge-pill badge-green" style={{ fontSize: 9 }}>ACTIVE</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === "ai" && (
              <div className="ai-copilot-view fade-in">
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>✦</div>
                  <h3 style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 800, color: "var(--warm)", marginBottom: 8 }}>AI Co-pilot Studio</h3>
                  <p style={{ fontSize: 15, color: "var(--muted)", maxWidth: 500, margin: "0 auto" }}>
                    Your central intelligence for regulatory compliance. Use the Course Builder or Regulatory Monitor to manage your facility with AI agents.
                  </p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
                    <button className="btn btn-primary" onClick={() => setView("alerts")}>Regulatory Monitor</button>
                    <button className="btn btn-outline" onClick={() => setView("agency")}>Platform Settings</button>
                  </div>
                </div>
              </div>
            )}

          </div >
        </main >
      </div >
    </>
  );
}
