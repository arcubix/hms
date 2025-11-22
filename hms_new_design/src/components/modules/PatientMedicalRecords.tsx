/**
 * Patient Medical Records Component
 * 
 * Comprehensive medical records viewer for emergency ward patients showing:
 * - Patient demographics and admission details
 * - Complete medical history
 * - Current medications and prescriptions
 * - Lab results and investigations
 * - Radiology and imaging reports
 * - Vital signs trends with charts
 * - Doctor's notes and treatment plans
 * - Allergies and alerts
 * - Past emergency visits
 * - Discharge summary
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription } from '../ui/alert';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clipboard,
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Pill,
  Beaker,
  Scan,
  Stethoscope,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  Share2,
  Edit,
  Plus,
  Clock,
  Users,
  FileBarChart,
  Syringe,
  TestTube,
  Brain,
  Bones,
  Microscope,
  Wind,
  Eye,
  ShieldAlert,
  History,
  CalendarDays,
  UserCheck,
  Building2,
  Bed,
  Info,
  AlertTriangle,
  XCircle,
  Target,
  LineChart,
  BarChart3,
  Activity as ActivityIcon,
  Zap
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LineChart as RechartsLineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface PatientMedicalRecordsProps {
  patientId?: string;
  bedNumber?: string;
  wardName?: string;
  patient?: any;
  onClose: () => void;
}

// Mock Patient Data
const mockPatient = {
  // Demographics
  uhid: 'UHID-89456',
  erNumber: 'ER-2024-156',
  name: 'Robert Johnson',
  age: 58,
  gender: 'Male',
  dob: '1966-03-15',
  bloodGroup: 'O+',
  maritalStatus: 'Married',
  occupation: 'Civil Engineer',
  
  // Contact Information
  phone: '+1-555-0234',
  email: 'robert.johnson@email.com',
  address: '456 Oak Street, Springfield, IL 62701',
  emergencyContact: {
    name: 'Sarah Johnson (Wife)',
    relation: 'Spouse',
    phone: '+1-555-0235'
  },
  
  // Current Admission
  admissionDate: '2024-11-21',
  admissionTime: '08:30 AM',
  ward: 'Emergency Ward A',
  bedNumber: 'EA-01',
  diagnosis: 'Acute Myocardial Infarction',
  attendingDoctor: 'Dr. Sarah Mitchell',
  severity: 'Critical',
  triageLevel: 2,
  chiefComplaint: 'Severe chest pain radiating to left arm, shortness of breath',
  
  // Insurance
  insurance: {
    provider: 'BlueCross BlueShield',
    policyNumber: 'BC-789456123',
    validUntil: '2025-12-31',
    coverage: 'Comprehensive'
  }
};

// Vital Signs History (for charts)
const vitalSignsHistory = [
  { time: '08:30', heartRate: 102, bloodPressure: 155, temperature: 98.8, spo2: 90, respRate: 22 },
  { time: '09:00', heartRate: 98, bloodPressure: 148, temperature: 98.7, spo2: 92, respRate: 20 },
  { time: '09:30', heartRate: 95, bloodPressure: 145, temperature: 98.6, spo2: 93, respRate: 19 },
  { time: '10:00', heartRate: 92, bloodPressure: 142, temperature: 98.6, spo2: 94, respRate: 18 },
  { time: '10:30', heartRate: 90, bloodPressure: 140, temperature: 98.6, spo2: 94, respRate: 18 },
  { time: '11:00', heartRate: 88, bloodPressure: 138, temperature: 98.5, spo2: 95, respRate: 17 },
  { time: '11:30', heartRate: 86, bloodPressure: 135, temperature: 98.5, spo2: 96, respRate: 16 }
];

// Current Vital Signs
const currentVitals = {
  heartRate: 88,
  bloodPressure: '140/90',
  temperature: 98.6,
  spo2: 94,
  respiratoryRate: 18,
  weight: 185,
  height: 178,
  bmi: 29.2,
  lastUpdated: '5 mins ago'
};

// Medical History
const medicalHistory = [
  {
    id: '1',
    condition: 'Hypertension',
    diagnosedDate: '2018-05-20',
    status: 'Chronic',
    notes: 'Controlled with medication'
  },
  {
    id: '2',
    condition: 'Type 2 Diabetes Mellitus',
    diagnosedDate: '2019-08-15',
    status: 'Chronic',
    notes: 'HbA1c: 7.2%, Managed with oral hypoglycemics'
  },
  {
    id: '3',
    condition: 'Hyperlipidemia',
    diagnosedDate: '2020-03-10',
    status: 'Chronic',
    notes: 'On statin therapy, LDL: 110 mg/dL'
  },
  {
    id: '4',
    condition: 'Osteoarthritis - Bilateral Knees',
    diagnosedDate: '2021-11-05',
    status: 'Chronic',
    notes: 'Mild, managed conservatively'
  }
];

// Allergies
const allergies = [
  {
    id: '1',
    allergen: 'Penicillin',
    reaction: 'Severe rash, anaphylaxis',
    severity: 'Critical',
    onsetDate: '2010-06-15'
  },
  {
    id: '2',
    allergen: 'Shellfish',
    reaction: 'Hives, swelling',
    severity: 'Moderate',
    onsetDate: '2015-09-20'
  }
];

// Current Medications
const currentMedications = [
  {
    id: '1',
    name: 'Aspirin',
    dosage: '325 mg',
    route: 'Oral',
    frequency: 'Once daily',
    startDate: '2024-11-21',
    prescribedBy: 'Dr. Sarah Mitchell',
    indication: 'Antiplatelet therapy',
    status: 'Active'
  },
  {
    id: '2',
    name: 'Atorvastatin',
    dosage: '80 mg',
    route: 'Oral',
    frequency: 'Once daily at bedtime',
    startDate: '2024-11-21',
    prescribedBy: 'Dr. Sarah Mitchell',
    indication: 'Cholesterol management',
    status: 'Active'
  },
  {
    id: '3',
    name: 'Metoprolol',
    dosage: '50 mg',
    route: 'Oral',
    frequency: 'Twice daily',
    startDate: '2024-11-21',
    prescribedBy: 'Dr. Sarah Mitchell',
    indication: 'Blood pressure control',
    status: 'Active'
  },
  {
    id: '4',
    name: 'Clopidogrel',
    dosage: '75 mg',
    route: 'Oral',
    frequency: 'Once daily',
    startDate: '2024-11-21',
    prescribedBy: 'Dr. Sarah Mitchell',
    indication: 'Antiplatelet therapy',
    status: 'Active'
  },
  {
    id: '5',
    name: 'Nitroglycerin',
    dosage: '0.4 mg',
    route: 'Sublingual',
    frequency: 'As needed for chest pain',
    startDate: '2024-11-21',
    prescribedBy: 'Dr. Sarah Mitchell',
    indication: 'Angina relief',
    status: 'Active'
  },
  {
    id: '6',
    name: 'Enoxaparin',
    dosage: '60 mg',
    route: 'Subcutaneous',
    frequency: 'Twice daily',
    startDate: '2024-11-21',
    prescribedBy: 'Dr. Sarah Mitchell',
    indication: 'Anticoagulation',
    status: 'Active'
  }
];

// Lab Results
const labResults = [
  {
    id: '1',
    testName: 'Complete Blood Count (CBC)',
    date: '2024-11-21 09:00 AM',
    status: 'Completed',
    results: [
      { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '13.5-17.5', status: 'Normal' },
      { parameter: 'WBC Count', value: '11.5', unit: 'x10³/µL', range: '4.5-11.0', status: 'High' },
      { parameter: 'Platelet Count', value: '245', unit: 'x10³/µL', range: '150-400', status: 'Normal' },
      { parameter: 'Hematocrit', value: '42.5', unit: '%', range: '38.8-50.0', status: 'Normal' }
    ]
  },
  {
    id: '2',
    testName: 'Cardiac Markers',
    date: '2024-11-21 09:15 AM',
    status: 'Completed',
    results: [
      { parameter: 'Troponin I', value: '2.8', unit: 'ng/mL', range: '<0.04', status: 'Critical' },
      { parameter: 'CK-MB', value: '28', unit: 'ng/mL', range: '<5', status: 'Critical' },
      { parameter: 'BNP', value: '180', unit: 'pg/mL', range: '<100', status: 'High' }
    ]
  },
  {
    id: '3',
    testName: 'Basic Metabolic Panel',
    date: '2024-11-21 09:00 AM',
    status: 'Completed',
    results: [
      { parameter: 'Sodium', value: '138', unit: 'mEq/L', range: '136-145', status: 'Normal' },
      { parameter: 'Potassium', value: '4.2', unit: 'mEq/L', range: '3.5-5.0', status: 'Normal' },
      { parameter: 'Creatinine', value: '1.1', unit: 'mg/dL', range: '0.7-1.3', status: 'Normal' },
      { parameter: 'Glucose', value: '145', unit: 'mg/dL', range: '70-100', status: 'High' }
    ]
  },
  {
    id: '4',
    testName: 'Lipid Profile',
    date: '2024-11-21 09:00 AM',
    status: 'Completed',
    results: [
      { parameter: 'Total Cholesterol', value: '220', unit: 'mg/dL', range: '<200', status: 'High' },
      { parameter: 'LDL Cholesterol', value: '145', unit: 'mg/dL', range: '<100', status: 'High' },
      { parameter: 'HDL Cholesterol', value: '42', unit: 'mg/dL', range: '>40', status: 'Normal' },
      { parameter: 'Triglycerides', value: '165', unit: 'mg/dL', range: '<150', status: 'High' }
    ]
  },
  {
    id: '5',
    testName: 'Arterial Blood Gas (ABG)',
    date: '2024-11-21 09:30 AM',
    status: 'Completed',
    results: [
      { parameter: 'pH', value: '7.38', unit: '', range: '7.35-7.45', status: 'Normal' },
      { parameter: 'pO2', value: '85', unit: 'mmHg', range: '75-100', status: 'Normal' },
      { parameter: 'pCO2', value: '42', unit: 'mmHg', range: '35-45', status: 'Normal' },
      { parameter: 'HCO3', value: '24', unit: 'mEq/L', range: '22-26', status: 'Normal' }
    ]
  }
];

// Radiology Reports
const radiologyReports = [
  {
    id: '1',
    examType: 'Chest X-Ray (PA & Lateral)',
    date: '2024-11-21 08:45 AM',
    orderedBy: 'Dr. Sarah Mitchell',
    radiologist: 'Dr. Michael Chen',
    status: 'Final Report',
    findings: 'Cardiomegaly noted with cardiothoracic ratio of 0.55. Mild pulmonary vascular congestion. No acute infiltrates or effusions. No pneumothorax.',
    impression: 'Cardiomegaly with mild pulmonary vascular congestion, consistent with congestive heart failure.',
    recommendation: 'Correlation with echocardiography recommended.'
  },
  {
    id: '2',
    examType: '12-Lead ECG',
    date: '2024-11-21 08:35 AM',
    orderedBy: 'Dr. Sarah Mitchell',
    cardiologist: 'Dr. Robert Williams',
    status: 'Interpreted',
    findings: 'Sinus rhythm at 88 bpm. ST-segment elevation in leads II, III, and aVF (2-3 mm). Reciprocal ST depression in leads I and aVL. Q waves in inferior leads.',
    impression: 'Acute inferior wall ST-elevation myocardial infarction (STEMI).',
    recommendation: 'Immediate cardiology consultation. Consider urgent cardiac catheterization.'
  },
  {
    id: '3',
    examType: 'Echocardiography (2D Echo)',
    date: '2024-11-21 10:15 AM',
    orderedBy: 'Dr. Sarah Mitchell',
    cardiologist: 'Dr. Robert Williams',
    status: 'Preliminary',
    findings: 'Left ventricular ejection fraction (LVEF) estimated at 45%. Regional wall motion abnormality in inferior wall. Mild mitral regurgitation. Normal aortic and tricuspid valves.',
    impression: 'Reduced LV systolic function with inferior wall hypokinesis consistent with acute MI. Mild MR.',
    recommendation: 'Cardiac catheterization and consideration for revascularization.'
  }
];

// Doctor's Notes
const doctorsNotes = [
  {
    id: '1',
    date: '2024-11-21 11:45 AM',
    time: '11:45 AM',
    doctor: 'Dr. Sarah Mitchell',
    specialty: 'Emergency Medicine',
    noteType: 'Progress Note',
    subjective: 'Patient reports decreased chest pain after nitroglycerin administration. Still experiencing mild discomfort. Denies shortness of breath at rest.',
    objective: 'VS: BP 140/90, HR 88, RR 18, SpO2 94% on 2L NC. Patient alert and oriented. Cardiac monitor shows sinus rhythm. Lungs clear bilaterally.',
    assessment: 'Acute inferior STEMI with improving symptoms post-medical management. Troponin significantly elevated. Awaiting cardiac catheterization.',
    plan: `1. Continue aspirin, clopidogrel, atorvastatin, metoprolol
2. Maintain on oxygen therapy
3. NPO for catheterization
4. Cardiology consulted - procedure scheduled for 2:00 PM
5. Serial cardiac markers q8h
6. Continuous cardiac monitoring
7. Hold anticoagulation 4 hours pre-procedure`
  },
  {
    id: '2',
    date: '2024-11-21 09:15 AM',
    time: '09:15 AM',
    doctor: 'Dr. Sarah Mitchell',
    specialty: 'Emergency Medicine',
    noteType: 'Initial Assessment',
    subjective: '58M presenting with acute onset severe crushing chest pain radiating to left arm, associated with diaphoresis and dyspnea. Symptoms started ~1 hour ago while at work. 10/10 pain severity.',
    objective: 'VS: BP 155/95, HR 102, RR 22, SpO2 90% on RA, Temp 98.8°F. Patient in moderate distress, diaphoretic. Cardiovascular: S1S2 regular, no murmurs. Lungs: Mild bibasilar crackles.',
    assessment: 'Acute coronary syndrome, likely STEMI based on presentation. High risk patient with multiple cardiac risk factors.',
    plan: `1. STEMI protocol activated
2. ASA 325mg, Clopidogrel 600mg loading dose
3. Nitroglycerin SL, oxygen therapy
4. Stat ECG, cardiac markers, CBC, BMP
5. IV access x2, continuous monitoring
6. Cardiology emergency consultation
7. NPO, prepare for potential catheterization`
  },
  {
    id: '3',
    date: '2024-11-21 08:35 AM',
    time: '08:35 AM',
    doctor: 'Dr. Emily Roberts',
    specialty: 'Emergency Medicine - Triage',
    noteType: 'Triage Note',
    subjective: 'Chief complaint: Severe chest pain. Patient ambulatory, arrived via private vehicle with wife.',
    objective: 'Initial VS: BP 158/98, HR 105, RR 24, SpO2 89% on RA. Patient appears anxious and uncomfortable.',
    assessment: 'ESI Level 2 - High risk chest pain, potential cardiac emergency.',
    plan: 'Immediate room assignment. Notify attending physician. Prepare for rapid assessment and treatment.'
  }
];

// Treatment Timeline
const treatmentTimeline = [
  { time: '08:30 AM', event: 'Patient arrived at Emergency Department', type: 'arrival', user: 'Registration' },
  { time: '08:35 AM', event: 'Triage assessment completed - ESI Level 2', type: 'assessment', user: 'Dr. Emily Roberts' },
  { time: '08:37 AM', event: 'ECG performed - STEMI identified', type: 'investigation', user: 'ECG Tech' },
  { time: '08:40 AM', event: 'STEMI protocol activated', type: 'alert', user: 'Dr. Sarah Mitchell' },
  { time: '08:42 AM', event: 'Aspirin 325mg administered', type: 'medication', user: 'Nurse Johnson' },
  { time: '08:43 AM', event: 'Nitroglycerin 0.4mg SL given', type: 'medication', user: 'Nurse Johnson' },
  { time: '08:45 AM', event: 'IV access established - 18G x2', type: 'procedure', user: 'Nurse Johnson' },
  { time: '08:50 AM', event: 'Blood samples drawn for cardiac markers', type: 'investigation', user: 'Phlebotomist' },
  { time: '09:00 AM', event: 'Clopidogrel 600mg loading dose given', type: 'medication', user: 'Nurse Thompson' },
  { time: '09:15 AM', event: 'Cardiology consultation requested', type: 'consult', user: 'Dr. Sarah Mitchell' },
  { time: '09:30 AM', event: 'Oxygen therapy initiated - 2L via NC', type: 'intervention', user: 'Nurse Thompson' },
  { time: '09:45 AM', event: 'Troponin results: Critical elevation noted', type: 'results', user: 'Lab' },
  { time: '10:00 AM', event: 'Metoprolol 50mg started', type: 'medication', user: 'Nurse Johnson' },
  { time: '10:15 AM', event: 'Echocardiography performed', type: 'investigation', user: 'Cardiology Tech' },
  { time: '10:30 AM', event: 'Atorvastatin 80mg administered', type: 'medication', user: 'Nurse Thompson' },
  { time: '11:00 AM', event: 'Cardiologist evaluation completed', type: 'consult', user: 'Dr. Robert Williams' },
  { time: '11:30 AM', event: 'Cardiac catheterization scheduled for 2:00 PM', type: 'procedure', user: 'Cardiology' },
  { time: '11:45 AM', event: 'Progress note documented', type: 'documentation', user: 'Dr. Sarah Mitchell' }
];

// Past Emergency Visits
const pastVisits = [
  {
    id: '1',
    erNumber: 'ER-2023-4562',
    visitDate: '2023-08-15',
    chiefComplaint: 'Severe headache and dizziness',
    diagnosis: 'Hypertensive urgency',
    treatment: 'BP control with IV medications, observation',
    disposition: 'Discharged with BP medication adjustment',
    doctor: 'Dr. Michael Brown',
    duration: '5h 30m'
  },
  {
    id: '2',
    erNumber: 'ER-2022-9845',
    visitDate: '2022-12-10',
    chiefComplaint: 'Right knee pain after fall',
    diagnosis: 'Contusion right knee, no fracture',
    treatment: 'X-ray, pain management, ice/compression',
    disposition: 'Discharged with analgesics',
    doctor: 'Dr. Emily Davis',
    duration: '3h 15m'
  }
];

export function PatientMedicalRecords({ patientId, bedNumber, wardName, onClose }: PatientMedicalRecordsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // PDF Generation Function
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Header
      doc.setFillColor(47, 128, 237);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('EMERGENCY PATIENT MEDICAL RECORDS', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Hospital Management System', pageWidth / 2, 25, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 32, { align: 'center' });

      yPosition = 50;

      // Patient Information Section
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('PATIENT INFORMATION', 15, yPosition + 6);
      yPosition += 15;

      doc.setFontSize(10);
      doc.text(`Name: ${mockPatient.name}`, 15, yPosition);
      doc.text(`UHID: ${mockPatient.uhid}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Age/Gender: ${mockPatient.age} Years / ${mockPatient.gender}`, 15, yPosition);
      doc.text(`Blood Group: ${mockPatient.bloodGroup}`, 120, yPosition);
      yPosition += 7;
      doc.text(`DOB: ${mockPatient.dob}`, 15, yPosition);
      doc.text(`Marital Status: ${mockPatient.maritalStatus}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Occupation: ${mockPatient.occupation}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Phone: ${mockPatient.phone}`, 15, yPosition);
      doc.text(`Email: ${mockPatient.email}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Address: ${mockPatient.address}`, 15, yPosition);
      yPosition += 10;

      // Emergency Contact
      doc.setFillColor(255, 230, 230);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(139, 0, 0);
      doc.setFontSize(12);
      doc.text('Emergency Contact', 15, yPosition + 6);
      yPosition += 13;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Name: ${mockPatient.emergencyContact.name}`, 15, yPosition);
      doc.text(`Relation: ${mockPatient.emergencyContact.relation}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Phone: ${mockPatient.emergencyContact.phone}`, 15, yPosition);
      yPosition += 12;

      // Insurance Information
      doc.setFillColor(230, 255, 230);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(0, 100, 0);
      doc.setFontSize(12);
      doc.text('Insurance Information', 15, yPosition + 6);
      yPosition += 13;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Provider: ${mockPatient.insurance.provider}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Policy Number: ${mockPatient.insurance.policyNumber}`, 15, yPosition);
      doc.text(`Coverage: ${mockPatient.insurance.coverage}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Valid Until: ${mockPatient.insurance.validUntil}`, 15, yPosition);
      yPosition += 12;

      checkPageBreak(30);

      // Current Admission
      doc.setFillColor(255, 240, 230);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(200, 80, 0);
      doc.setFontSize(14);
      doc.text('CURRENT ADMISSION', 15, yPosition + 6);
      yPosition += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`ER Number: ${mockPatient.erNumber}`, 15, yPosition);
      doc.text(`Triage Level: ESI ${mockPatient.triageLevel}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Admission Date: ${mockPatient.admissionDate} at ${mockPatient.admissionTime}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Ward: ${mockPatient.ward}`, 15, yPosition);
      doc.text(`Bed Number: ${mockPatient.bedNumber}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Attending Doctor: ${mockPatient.attendingDoctor}`, 15, yPosition);
      doc.text(`Severity: ${mockPatient.severity}`, 120, yPosition);
      yPosition += 10;
      doc.setFontSize(11);
      doc.text('Primary Diagnosis:', 15, yPosition);
      yPosition += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(mockPatient.diagnosis, 15, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 8;
      doc.setFontSize(11);
      doc.text('Chief Complaint:', 15, yPosition);
      yPosition += 6;
      doc.setFontSize(10);
      const complaintLines = doc.splitTextToSize(mockPatient.chiefComplaint, pageWidth - 30);
      doc.text(complaintLines, 15, yPosition);
      yPosition += complaintLines.length * 5 + 10;

      checkPageBreak(50);

      // CRITICAL ALERTS - Allergies
      doc.setFillColor(255, 200, 200);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(200, 0, 0);
      doc.setFontSize(14);
      doc.text('⚠ CRITICAL ALLERGIES ALERT', 15, yPosition + 6);
      yPosition += 15;

      allergies.forEach((allergy) => {
        checkPageBreak(20);
        doc.setFillColor(255, 230, 230);
        doc.rect(15, yPosition, pageWidth - 30, 18, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${allergy.allergen} (${allergy.severity})`, 20, yPosition + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Reaction: ${allergy.reaction}`, 20, yPosition + 12);
        doc.text(`Onset: ${allergy.onsetDate}`, 20, yPosition + 17);
        yPosition += 22;
      });

      yPosition += 5;
      checkPageBreak(30);

      // Current Vital Signs
      doc.setFillColor(230, 240, 255);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(0, 80, 200);
      doc.setFontSize(14);
      doc.text('CURRENT VITAL SIGNS', 15, yPosition + 6);
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text(`Last Updated: ${currentVitals.lastUpdated}`, pageWidth - 60, yPosition + 6);
      yPosition += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);

      const vitalsData = [
        ['Parameter', 'Value', 'Parameter', 'Value'],
        ['Heart Rate', `${currentVitals.heartRate} bpm`, 'Blood Pressure', `${currentVitals.bloodPressure} mmHg`],
        ['Temperature', `${currentVitals.temperature}°F`, 'SpO2', `${currentVitals.spo2}%`],
        ['Respiratory Rate', `${currentVitals.respiratoryRate}/min`, 'Weight', `${currentVitals.weight} lbs`],
        ['Height', `${currentVitals.height} cm`, 'BMI', `${currentVitals.bmi} kg/m²`]
      ];

      doc.autoTable({
        startY: yPosition,
        head: [vitalsData[0]],
        body: vitalsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [47, 128, 237], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45 },
          1: { cellWidth: 40 },
          2: { fontStyle: 'bold', cellWidth: 45 },
          3: { cellWidth: 40 }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
      checkPageBreak(30);

      // Past Medical History
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('PAST MEDICAL HISTORY', 15, yPosition + 6);
      yPosition += 15;

      medicalHistory.forEach((condition, index) => {
        checkPageBreak(18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${condition.condition}`, 15, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        yPosition += 5;
        doc.text(`   Diagnosed: ${condition.diagnosedDate} | Status: ${condition.status}`, 15, yPosition);
        yPosition += 5;
        doc.text(`   ${condition.notes}`, 15, yPosition);
        yPosition += 8;
      });

      yPosition += 5;

      // New Page for Medications
      doc.addPage();
      yPosition = 20;

      // Current Medications
      doc.setFillColor(230, 240, 255);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(0, 80, 200);
      doc.setFontSize(14);
      doc.text('CURRENT MEDICATIONS', 15, yPosition + 6);
      yPosition += 15;

      const medicationsTableData = currentMedications.map(med => [
        med.name,
        med.dosage,
        med.route,
        med.frequency,
        med.indication
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Medication', 'Dosage', 'Route', 'Frequency', 'Indication']],
        body: medicationsTableData,
        theme: 'striped',
        headStyles: { fillColor: [47, 128, 237], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 35 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 35 },
          4: { cellWidth: 55 }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // New Page for Lab Results
      doc.addPage();
      yPosition = 20;

      // Laboratory Results
      doc.setFillColor(240, 230, 255);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(100, 0, 200);
      doc.setFontSize(14);
      doc.text('LABORATORY RESULTS', 15, yPosition + 6);
      yPosition += 15;

      labResults.forEach((lab) => {
        checkPageBreak(50);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(lab.testName, 15, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(lab.date, pageWidth - 60, yPosition);
        yPosition += 8;

        const labTableData = lab.results.map(result => [
          result.parameter,
          result.value,
          result.unit,
          result.range,
          result.status
        ]);

        doc.autoTable({
          startY: yPosition,
          head: [['Parameter', 'Value', 'Unit', 'Reference Range', 'Status']],
          body: labTableData,
          theme: 'grid',
          headStyles: { fillColor: [139, 69, 219], textColor: 255, fontSize: 8 },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { fontStyle: 'bold', cellWidth: 25, halign: 'center' },
            2: { cellWidth: 25 },
            3: { cellWidth: 35 },
            4: { cellWidth: 25, halign: 'center' }
          },
          didParseCell: function(data: any) {
            if (data.column.index === 4 && data.cell.section === 'body') {
              const status = data.cell.raw;
              if (status === 'Critical') {
                data.cell.styles.textColor = [255, 0, 0];
                data.cell.styles.fontStyle = 'bold';
              } else if (status === 'High') {
                data.cell.styles.textColor = [255, 140, 0];
                data.cell.styles.fontStyle = 'bold';
              } else if (status === 'Normal') {
                data.cell.styles.textColor = [0, 128, 0];
              }
            }
          }
        });

        yPosition = doc.lastAutoTable.finalY + 8;
      });

      // New Page for Radiology
      doc.addPage();
      yPosition = 20;

      // Radiology Reports
      doc.setFillColor(230, 240, 250);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(0, 100, 150);
      doc.setFontSize(14);
      doc.text('RADIOLOGY & IMAGING REPORTS', 15, yPosition + 6);
      yPosition += 15;

      radiologyReports.forEach((report) => {
        checkPageBreak(60);
        doc.setFillColor(245, 245, 255);
        doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(report.examType, 15, yPosition + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(report.date, pageWidth - 60, yPosition + 6);
        yPosition += 12;

        doc.setFontSize(9);
        doc.text(`Ordered By: ${report.orderedBy}`, 15, yPosition);
        doc.text(`${report.radiologist ? 'Radiologist' : 'Cardiologist'}: ${report.radiologist || report.cardiologist}`, 100, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Findings:', 15, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const findingsLines = doc.splitTextToSize(report.findings, pageWidth - 30);
        doc.text(findingsLines, 15, yPosition);
        yPosition += findingsLines.length * 4 + 5;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Impression:', 15, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const impressionLines = doc.splitTextToSize(report.impression, pageWidth - 30);
        doc.text(impressionLines, 15, yPosition);
        yPosition += impressionLines.length * 4 + 5;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendation:', 15, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const recommendationLines = doc.splitTextToSize(report.recommendation, pageWidth - 30);
        doc.text(recommendationLines, 15, yPosition);
        yPosition += recommendationLines.length * 4 + 10;
      });

      // New Page for Doctor's Notes
      doc.addPage();
      yPosition = 20;

      // Doctor's Notes
      doc.setFillColor(230, 255, 230);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(0, 150, 0);
      doc.setFontSize(14);
      doc.text("DOCTOR'S NOTES (SOAP FORMAT)", 15, yPosition + 6);
      yPosition += 15;

      doctorsNotes.forEach((note) => {
        checkPageBreak(80);
        doc.setFillColor(250, 250, 250);
        doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(note.noteType, 15, yPosition + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`${note.doctor} (${note.specialty}) - ${note.date} at ${note.time}`, 15, yPosition + 11);
        yPosition += 16;

        // Subjective
        doc.setFillColor(230, 240, 255);
        doc.rect(15, yPosition, 8, 5, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('S', 17, yPosition + 4);
        doc.text('SUBJECTIVE:', 25, yPosition + 4);
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const subjectiveLines = doc.splitTextToSize(note.subjective, pageWidth - 35);
        doc.text(subjectiveLines, 18, yPosition);
        yPosition += subjectiveLines.length * 4 + 5;

        // Objective
        doc.setFillColor(240, 230, 255);
        doc.rect(15, yPosition, 8, 5, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('O', 17, yPosition + 4);
        doc.text('OBJECTIVE:', 25, yPosition + 4);
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const objectiveLines = doc.splitTextToSize(note.objective, pageWidth - 35);
        doc.text(objectiveLines, 18, yPosition);
        yPosition += objectiveLines.length * 4 + 5;

        // Assessment
        doc.setFillColor(255, 240, 230);
        doc.rect(15, yPosition, 8, 5, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('A', 17, yPosition + 4);
        doc.text('ASSESSMENT:', 25, yPosition + 4);
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const assessmentLines = doc.splitTextToSize(note.assessment, pageWidth - 35);
        doc.text(assessmentLines, 18, yPosition);
        yPosition += assessmentLines.length * 4 + 5;

        // Plan
        doc.setFillColor(230, 255, 230);
        doc.rect(15, yPosition, 8, 5, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('P', 17, yPosition + 4);
        doc.text('PLAN:', 25, yPosition + 4);
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const planLines = doc.splitTextToSize(note.plan, pageWidth - 35);
        doc.text(planLines, 18, yPosition);
        yPosition += planLines.length * 4 + 10;
      });

      // New Page for Timeline
      doc.addPage();
      yPosition = 20;

      // Treatment Timeline
      doc.setFillColor(255, 240, 200);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(150, 100, 0);
      doc.setFontSize(14);
      doc.text('TREATMENT TIMELINE', 15, yPosition + 6);
      yPosition += 15;

      const timelineTableData = treatmentTimeline.map(item => [
        item.time,
        item.event,
        item.type.toUpperCase(),
        item.user
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Time', 'Event', 'Type', 'By']],
        body: timelineTableData,
        theme: 'striped',
        headStyles: { fillColor: [255, 165, 0], textColor: 0 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 25 },
          1: { cellWidth: 95 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 30 }
        }
      });

      // Footer on last page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
        doc.text('Hospital Management System - Confidential Medical Record', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      doc.save(`Medical_Record_${mockPatient.uhid}_${mockPatient.name.replace(/ /g, '_')}.pdf`);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-green-600 bg-green-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'arrival': return <MapPin className="w-4 h-4" />;
      case 'assessment': return <ClipboardList className="w-4 h-4" />;
      case 'investigation': return <Beaker className="w-4 h-4" />;
      case 'medication': return <Pill className="w-4 h-4" />;
      case 'procedure': return <Stethoscope className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'consult': return <Users className="w-4 h-4" />;
      case 'intervention': return <Activity className="w-4 h-4" />;
      case 'results': return <FileBarChart className="w-4 h-4" />;
      case 'documentation': return <FileText className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-600 border-red-300';
      case 'medication': return 'bg-blue-100 text-blue-600 border-blue-300';
      case 'investigation': return 'bg-purple-100 text-purple-600 border-purple-300';
      case 'procedure': return 'bg-orange-100 text-orange-600 border-orange-300';
      case 'consult': return 'bg-green-100 text-green-600 border-green-300';
      case 'results': return 'bg-yellow-100 text-yellow-600 border-yellow-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Ward
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Medical Records</h1>
                  <p className="text-sm text-gray-600">
                    {mockPatient.name} • {mockPatient.uhid} • {wardName} - {bedNumber}
                  </p>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-800">
                {mockPatient.severity}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generatePDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Update Records
              </Button>
            </div>
          </div>

          {/* Patient Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Age/Gender</p>
              <p className="text-xl font-bold text-blue-700">{mockPatient.age}Y / {mockPatient.gender}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-600 font-medium">Blood Group</p>
              <p className="text-xl font-bold text-red-700">{mockPatient.bloodGroup}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium">Admission Date</p>
              <p className="text-sm font-bold text-green-700">{mockPatient.admissionDate}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">ER Number</p>
              <p className="text-sm font-bold text-purple-700">{mockPatient.erNumber}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium">Attending</p>
              <p className="text-sm font-bold text-orange-700">{mockPatient.attendingDoctor.replace('Dr. ', '')}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-yellow-600 font-medium">Triage Level</p>
              <p className="text-xl font-bold text-yellow-700">ESI {mockPatient.triageLevel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Patient Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-base">Patient Demographics</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-2xl bg-blue-600 text-white">
                      {mockPatient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-gray-900">{mockPatient.name}</h3>
                  <p className="text-sm text-gray-600">{mockPatient.occupation}</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Date of Birth</p>
                    <p className="font-medium">{mockPatient.dob}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Marital Status</p>
                    <p className="font-medium">{mockPatient.maritalStatus}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Phone</p>
                    <p className="font-medium">{mockPatient.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Email</p>
                    <p className="font-medium text-xs">{mockPatient.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Address</p>
                    <p className="font-medium text-xs">{mockPatient.address}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-gray-600 text-xs mb-2">Emergency Contact</p>
                  <div className="bg-red-50 p-3 rounded-lg space-y-1">
                    <p className="font-medium text-sm">{mockPatient.emergencyContact.name}</p>
                    <p className="text-xs text-gray-600">{mockPatient.emergencyContact.relation}</p>
                    <p className="text-sm font-medium text-red-600">{mockPatient.emergencyContact.phone}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-gray-600 text-xs mb-2">Insurance Details</p>
                  <div className="bg-green-50 p-3 rounded-lg space-y-1">
                    <p className="font-medium text-sm">{mockPatient.insurance.provider}</p>
                    <p className="text-xs text-gray-600">Policy: {mockPatient.insurance.policyNumber}</p>
                    <p className="text-xs text-gray-600">Valid until: {mockPatient.insurance.validUntil}</p>
                    <Badge className="bg-green-600 text-white mt-1">
                      {mockPatient.insurance.coverage}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allergies Alert */}
            <Card className="border-2 border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <ShieldAlert className="w-5 h-5" />
                  Allergies Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allergies.map((allergy) => (
                  <Alert key={allergy.id} className="border-red-300 bg-white">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <p className="font-medium text-red-800">{allergy.allergen}</p>
                      <p className="text-xs text-gray-600 mt-1">{allergy.reaction}</p>
                      <Badge className={allergy.severity === 'Critical' ? 'bg-red-600 text-white mt-1' : 'bg-orange-600 text-white mt-1'}>
                        {allergy.severity}
                      </Badge>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="vitals">Vitals</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="labs">Lab Results</TabsTrigger>
                <TabsTrigger value="radiology">Radiology</TabsTrigger>
                <TabsTrigger value="notes">Doctor's Notes</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Current Diagnosis */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Current Diagnosis & Chief Complaint
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Primary Diagnosis</p>
                      <p className="text-xl font-semibold text-gray-900">{mockPatient.diagnosis}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Chief Complaint</p>
                      <p className="text-gray-800">{mockPatient.chiefComplaint}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Vital Signs */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Current Vital Signs</CardTitle>
                      <span className="text-xs text-gray-500">{currentVitals.lastUpdated}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-5 h-5 text-red-600" />
                          <span className="text-sm text-gray-600">Heart Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-red-700">{currentVitals.heartRate}</p>
                        <p className="text-xs text-gray-600">bpm</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600">Blood Pressure</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{currentVitals.bloodPressure}</p>
                        <p className="text-xs text-gray-600">mmHg</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="w-5 h-5 text-orange-600" />
                          <span className="text-sm text-gray-600">Temperature</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">{currentVitals.temperature}</p>
                        <p className="text-xs text-gray-600">°F</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplet className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-600">SpO2</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{currentVitals.spo2}</p>
                        <p className="text-xs text-gray-600">%</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="w-5 h-5 text-purple-600" />
                          <span className="text-sm text-gray-600">Resp. Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">{currentVitals.respiratoryRate}</p>
                        <p className="text-xs text-gray-600">/min</p>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-indigo-600" />
                          <span className="text-sm text-gray-600">Weight</span>
                        </div>
                        <p className="text-2xl font-bold text-indigo-700">{currentVitals.weight}</p>
                        <p className="text-xs text-gray-600">lbs</p>
                      </div>
                      <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-teal-600" />
                          <span className="text-sm text-gray-600">Height</span>
                        </div>
                        <p className="text-2xl font-bold text-teal-700">{currentVitals.height}</p>
                        <p className="text-xs text-gray-600">cm</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm text-gray-600">BMI</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-700">{currentVitals.bmi}</p>
                        <p className="text-xs text-gray-600">kg/m²</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-600" />
                      Past Medical History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {medicalHistory.map((condition) => (
                        <div key={condition.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{condition.condition}</h4>
                            <Badge className="bg-blue-100 text-blue-800">{condition.status}</Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="text-gray-600">Diagnosed: {condition.diagnosedDate}</p>
                            <p className="text-gray-700">{condition.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Past Emergency Visits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5 text-purple-600" />
                      Past Emergency Visits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pastVisits.map((visit) => (
                        <div key={visit.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{visit.erNumber}</p>
                              <p className="text-sm text-gray-600">{visit.visitDate}</p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800">{visit.duration}</Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <p><span className="text-gray-600">Complaint:</span> {visit.chiefComplaint}</p>
                            <p><span className="text-gray-600">Diagnosis:</span> {visit.diagnosis}</p>
                            <p><span className="text-gray-600">Disposition:</span> {visit.disposition}</p>
                            <p><span className="text-gray-600">Doctor:</span> {visit.doctor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vitals Tab */}
              <TabsContent value="vitals" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vital Signs Trend - Today</CardTitle>
                    <CardDescription>Real-time monitoring since admission</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {/* Heart Rate Chart */}
                      <div>
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-600" />
                          Heart Rate (bpm)
                        </h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsLineChart data={vitalSignsHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis domain={[60, 120]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="heartRate" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626' }} />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Blood Pressure Chart */}
                      <div>
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          Blood Pressure (mmHg) - Systolic
                        </h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsLineChart data={vitalSignsHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis domain={[100, 180]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="bloodPressure" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* SpO2 Chart */}
                      <div>
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-green-600" />
                          Oxygen Saturation (%)
                        </h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsLineChart data={vitalSignsHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis domain={[85, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="spo2" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a' }} />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vital Signs Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vital Signs Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>HR</TableHead>
                          <TableHead>BP</TableHead>
                          <TableHead>Temp</TableHead>
                          <TableHead>SpO2</TableHead>
                          <TableHead>RR</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vitalSignsHistory.map((vital, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{vital.time}</TableCell>
                            <TableCell>{vital.heartRate} bpm</TableCell>
                            <TableCell>{vital.bloodPressure} mmHg</TableCell>
                            <TableCell>{vital.temperature}°F</TableCell>
                            <TableCell>{vital.spo2}%</TableCell>
                            <TableCell>{vital.respRate}/min</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medications Tab */}
              <TabsContent value="medications" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="w-5 h-5 text-blue-600" />
                        Current Medications
                      </CardTitle>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentMedications.map((med) => (
                        <div key={med.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">{med.name}</h4>
                              <p className="text-sm text-gray-600">{med.indication}</p>
                            </div>
                            <Badge className="bg-green-600 text-white">{med.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Dosage</p>
                              <p className="font-medium">{med.dosage}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Route</p>
                              <p className="font-medium">{med.route}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Frequency</p>
                              <p className="font-medium">{med.frequency}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Started</p>
                              <p className="font-medium">{med.startDate}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-blue-300">
                            <p className="text-xs text-gray-600">Prescribed by: {med.prescribedBy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lab Results Tab */}
              <TabsContent value="labs" className="space-y-6 mt-6">
                {labResults.map((lab) => (
                  <Card key={lab.id}>
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <TestTube className="w-5 h-5 text-purple-600" />
                            {lab.testName}
                          </CardTitle>
                          <CardDescription>{lab.date}</CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800">{lab.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Parameter</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Reference Range</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lab.results.map((result, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{result.parameter}</TableCell>
                              <TableCell className="font-semibold">{result.value}</TableCell>
                              <TableCell>{result.unit}</TableCell>
                              <TableCell>{result.range}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(result.status)}>
                                  {result.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Radiology Tab */}
              <TabsContent value="radiology" className="space-y-6 mt-6">
                {radiologyReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Scan className="w-5 h-5 text-indigo-600" />
                            {report.examType}
                          </CardTitle>
                          <CardDescription>{report.date}</CardDescription>
                        </div>
                        <Badge className="bg-blue-600 text-white">{report.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Ordered By</p>
                          <p className="font-medium">{report.orderedBy}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            {report.radiologist ? 'Radiologist' : 'Cardiologist'}
                          </p>
                          <p className="font-medium">{report.radiologist || report.cardiologist}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Findings</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{report.findings}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Impression</h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                          {report.impression}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Recommendation</h4>
                        <p className="text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                          {report.recommendation}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Images
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Doctor's Notes Tab */}
              <TabsContent value="notes" className="space-y-6 mt-6">
                {doctorsNotes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-green-600" />
                            {note.noteType}
                          </CardTitle>
                          <CardDescription>
                            {note.doctor} ({note.specialty}) • {note.date} at {note.time}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">S</span>
                          Subjective
                        </h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{note.subjective}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">O</span>
                          Objective
                        </h4>
                        <p className="text-gray-700 bg-purple-50 p-3 rounded-lg">{note.objective}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">A</span>
                          Assessment
                        </h4>
                        <p className="text-gray-700 bg-orange-50 p-3 rounded-lg">{note.assessment}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">P</span>
                          Plan
                        </h4>
                        <div className="text-gray-700 bg-green-50 p-3 rounded-lg whitespace-pre-line">
                          {note.plan}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Note
                </Button>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Treatment Timeline - Today
                    </CardTitle>
                    <CardDescription>Chronological record of all events and interventions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                      
                      {/* Timeline Items */}
                      <div className="space-y-6">
                        {treatmentTimeline.map((item, index) => (
                          <div key={index} className="relative pl-14">
                            {/* Timeline Dot */}
                            <div className={`absolute left-0 w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${getTimelineColor(item.type)}`}>
                              {getTimelineIcon(item.type)}
                            </div>
                            
                            {/* Timeline Content */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">{item.time}</span>
                                <Badge className={getTimelineColor(item.type)}>
                                  {item.type}
                                </Badge>
                              </div>
                              <p className="text-gray-700">{item.event}</p>
                              <p className="text-xs text-gray-500 mt-2">By: {item.user}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}