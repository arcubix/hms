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

import { useState, useEffect } from 'react';
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
  Bone,
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
import { toast } from 'sonner';
import { api } from '../../services/api';
import { LineChart as RechartsLineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AddMedicationDialog } from './AddMedicationDialog';
import { AddNoteDialog } from './AddNoteDialog';
import { EditEmergencyPatient } from './EditEmergencyPatient';

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

export function PatientMedicalRecords({ patientId, bedNumber, wardName, patient, onClose }: PatientMedicalRecordsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const [visitData, setVisitData] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [radiologyOrders, setRadiologyOrders] = useState<any[]>([]);
  const [healthPhysical, setHealthPhysical] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [pastVisits, setPastVisits] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  
  // Dialog states
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  
  // Get visit ID from patient prop
  const visitId = patient?.id ? (typeof patient.id === 'string' ? parseInt(patient.id, 10) : patient.id) : null;
  
  // Load patient data
  useEffect(() => {
    if (patient && visitId) {
      loadPatientData();
    } else if (patient) {
      // Use patient data directly if available
      setPatientData(patient);
      setLoading(false);
    }
  }, [patient, visitId]);
  
  const loadPatientData = async () => {
    if (!visitId) return;
    
    setLoading(true);
    try {
      // Load visit details
      const visit = await api.getEmergencyVisit(visitId);
      setVisitData(visit);
      
      // Load patient details if patient_id is available
      const pid = (visit as any).patient_id || (visit as any).patientId;
      if (pid) {
        try {
          const pData = await api.getPatient(pid.toString());
          setPatientData(pData);
        } catch (error) {
          console.error('Failed to load patient:', error);
          // Use patient prop as fallback
          setPatientData(patient);
        }
      } else {
        setPatientData(patient);
      }
      
      // Load all data in parallel
      const [
        vitalsData, 
        medsData, 
        notesData, 
        investigationsData,
        healthPhysicalData,
        timelineData,
        filesData
      ] = await Promise.all([
        api.getEmergencyVitals(visitId).catch(() => []),
        api.getEmergencyMedications(visitId).catch(() => []),
        api.getEmergencyNotes(visitId).catch(() => []),
        api.getEmergencyInvestigations(visitId).catch(() => []),
        api.getEmergencyHealthPhysical(visitId).catch(() => []),
        api.getEmergencyTimeline(visitId).catch(() => []),
        api.getEmergencyPatientFiles(visitId).catch(() => [])
      ]);
      
      // Separate lab and radiology orders
      const labData = investigationsData.filter((inv: any) => inv.investigation_type === 'lab');
      const radiologyData = investigationsData.filter((inv: any) => inv.investigation_type === 'radiology');
      
      setVitals(vitalsData);
      setMedications(medsData);
      setNotes(notesData);
      setLabOrders(labData);
      setRadiologyOrders(radiologyData);
      setHealthPhysical(healthPhysicalData);
      setTimeline(timelineData);
      setFiles(filesData);
      
      // Load past visits if patient ID is available
      const patientDbId = patientData?.id || (visit as any)?.patientId || (visit as any)?.patient_id;
      if (patientDbId) {
        try {
          const pastVisitsData = await api.getEmergencyHistory({ patient_id: patientDbId });
          setPastVisits(pastVisitsData);
        } catch (error) {
          console.error('Failed to load past visits:', error);
        }
      }
    } catch (error: any) {
      console.error('Error loading patient data:', error);
      // Use patient prop as fallback
      setPatientData(patient);
    } finally {
      setLoading(false);
    }
  };

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

      const p = patientData || patient || mockPatient;
      doc.setFontSize(10);
      doc.text(`Name: ${p.name || 'N/A'}`, 15, yPosition);
      doc.text(`UHID: ${p.uhid || p.patient_id || 'N/A'}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Age/Gender: ${p.age || 0} Years / ${p.gender || 'N/A'}`, 15, yPosition);
      doc.text(`Blood Group: ${p.blood_group || p.bloodGroup || 'N/A'}`, 120, yPosition);
      yPosition += 7;
      doc.text(`DOB: ${p.date_of_birth || p.dob || 'N/A'}`, 15, yPosition);
      doc.text(`Marital Status: ${p.maritalStatus || 'N/A'}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Occupation: ${p.occupation || 'N/A'}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Phone: ${p.phone || 'N/A'}`, 15, yPosition);
      doc.text(`Email: ${p.email || 'N/A'}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Address: ${p.address || 'N/A'}`, 15, yPosition);
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
      const ec = patientData?.emergency_contact || patient?.emergencyContact || mockPatient.emergencyContact;
      doc.text(`Name: ${ec?.name || 'N/A'}`, 15, yPosition);
      doc.text(`Relation: ${ec?.relation || 'N/A'}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Phone: ${ec?.phone || 'N/A'}`, 15, yPosition);
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
      const ins = patientData?.insurance || patient?.insurance || mockPatient.insurance;
      doc.text(`Provider: ${ins?.provider || 'N/A'}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Policy Number: ${ins?.policyNumber || 'N/A'}`, 15, yPosition);
      doc.text(`Coverage: ${ins?.coverage || 'N/A'}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Valid Until: ${ins?.validUntil || 'N/A'}`, 15, yPosition);
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
      const v = visitData || patient || {};
      doc.text(`ER Number: ${v.erNumber || v.er_number || 'N/A'}`, 15, yPosition);
      doc.text(`Triage Level: ESI ${v.triageLevel || v.triage_level || 'N/A'}`, 120, yPosition);
      yPosition += 7;
      const admDate = v.admissionDate || v.admission_date || v.arrivalTime || v.arrival_time || 'N/A';
      doc.text(`Admission Date: ${admDate}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Ward: ${wardName || v.ward || v.assignedWard || 'N/A'}`, 15, yPosition);
      doc.text(`Bed Number: ${bedNumber || v.bedNumber || v.bed_number || 'N/A'}`, 120, yPosition);
      yPosition += 7;
      doc.text(`Attending Doctor: ${v.assignedDoctor || v.assigned_doctor || v.attendingDoctor || 'N/A'}`, 15, yPosition);
      doc.text(`Status: ${v.status || v.currentStatus || 'N/A'}`, 120, yPosition);
      yPosition += 10;
      doc.setFontSize(11);
      doc.text('Primary Diagnosis:', 15, yPosition);
      yPosition += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(v.diagnosis || v.chiefComplaint || 'N/A', 15, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 8;
      doc.setFontSize(11);
      doc.text('Chief Complaint:', 15, yPosition);
      yPosition += 6;
      doc.setFontSize(10);
      const complaint = v.chiefComplaint || v.chief_complaint || 'N/A';
      const complaintLines = doc.splitTextToSize(complaint, pageWidth - 30);
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

      // Extract allergies from Health & Physical records
      const allergiesForPDF: any[] = [];
      healthPhysical.forEach((hp) => {
        if (hp.allergies) {
          try {
            const parsed = typeof hp.allergies === 'string' ? JSON.parse(hp.allergies) : hp.allergies;
            if (Array.isArray(parsed)) {
              allergiesForPDF.push(...parsed);
            } else if (typeof parsed === 'object') {
              allergiesForPDF.push(parsed);
            } else if (typeof hp.allergies === 'string' && hp.allergies.trim()) {
              hp.allergies.split(/[,\n]/).forEach((allergy: string) => {
                if (allergy.trim()) {
                  allergiesForPDF.push({ allergen: allergy.trim(), reaction: 'Not specified', severity: 'Moderate' });
                }
              });
            }
          } catch (e) {
            if (hp.allergies.trim()) {
              allergiesForPDF.push({ allergen: hp.allergies, reaction: 'Not specified', severity: 'Moderate' });
            }
          }
        }
      });

      if (allergiesForPDF.length > 0) {
        allergiesForPDF.forEach((allergy) => {
          checkPageBreak(20);
          doc.setFillColor(255, 230, 230);
          doc.rect(15, yPosition, pageWidth - 30, 18, 'F');
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`${allergy.allergen || allergy} (${allergy.severity || 'Moderate'})`, 20, yPosition + 6);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`Reaction: ${allergy.reaction || 'Not specified'}`, 20, yPosition + 12);
          if (allergy.onsetDate) {
            doc.text(`Onset: ${allergy.onsetDate}`, 20, yPosition + 17);
          }
          yPosition += 22;
        });
      } else {
        doc.setFontSize(10);
        doc.text('No allergies recorded', 20, yPosition);
        yPosition += 10;
      }

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
      const lastVital = vitals && vitals.length > 0 ? vitals[0] : null;
      const lastUpdated = lastVital ? new Date(lastVital.recorded_at || lastVital.created_at).toLocaleString() : 'N/A';
      doc.text(`Last Updated: ${lastUpdated}`, pageWidth - 60, yPosition + 6);
      yPosition += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);

      const vitalsData = [
        ['Parameter', 'Value', 'Parameter', 'Value'],
        ['Heart Rate', `${lastVital?.pulse || currentVitals.heartRate || 'N/A'} bpm`, 'Blood Pressure', `${lastVital?.bp || currentVitals.bloodPressure || 'N/A'} mmHg`],
        ['Temperature', `${lastVital?.temp || currentVitals.temperature || 'N/A'}°F`, 'SpO2', `${lastVital?.spo2 || currentVitals.spo2 || 'N/A'}%`],
        ['Respiratory Rate', `${lastVital?.resp || currentVitals.respiratoryRate || 'N/A'}/min`, 'Weight', `${currentVitals.weight || 'N/A'} lbs`],
        ['Height', `${currentVitals.height || 'N/A'} cm`, 'BMI', `${currentVitals.bmi || 'N/A'} kg/m²`]
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

      // Extract medical history from Health & Physical records
      const medicalHistoryForPDF: any[] = [];
      healthPhysical.forEach((hp) => {
        if (hp.past_medical_history) {
          try {
            const parsed = typeof hp.past_medical_history === 'string' ? JSON.parse(hp.past_medical_history) : hp.past_medical_history;
            if (Array.isArray(parsed)) {
              medicalHistoryForPDF.push(...parsed);
            } else if (typeof parsed === 'object') {
              medicalHistoryForPDF.push(parsed);
            } else if (typeof hp.past_medical_history === 'string' && hp.past_medical_history.trim()) {
              hp.past_medical_history.split(/[;\n]/).forEach((condition: string) => {
                if (condition.trim()) {
                  medicalHistoryForPDF.push({ condition: condition.trim(), status: 'Chronic', notes: 'From medical records' });
                }
              });
            }
          } catch (e) {
            if (hp.past_medical_history.trim()) {
              medicalHistoryForPDF.push({ condition: hp.past_medical_history, status: 'Chronic', notes: 'From medical records' });
            }
          }
        }
      });

      if (medicalHistoryForPDF.length > 0) {
        medicalHistoryForPDF.forEach((condition, index) => {
          checkPageBreak(18);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${condition.condition || condition}`, 15, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          yPosition += 5;
          if (condition.diagnosedDate) {
            doc.text(`   Diagnosed: ${condition.diagnosedDate} | Status: ${condition.status || 'Chronic'}`, 15, yPosition);
          } else {
            doc.text(`   Status: ${condition.status || 'Chronic'}`, 15, yPosition);
          }
          yPosition += 5;
          if (condition.notes) {
            doc.text(`   ${condition.notes}`, 15, yPosition);
            yPosition += 8;
          } else {
            yPosition += 5;
          }
        });
      } else {
        doc.setFontSize(10);
        doc.text('No medical history recorded', 15, yPosition);
        yPosition += 10;
      }

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

      const medicationsTableData = medications && medications.length > 0 
        ? medications.map(med => [
            med.medication_name || med.name || 'N/A',
            med.dosage || 'N/A',
            med.route || 'N/A',
            med.frequency || 'N/A',
            med.notes || 'N/A'
          ])
        : [];

      if (medicationsTableData.length > 0) {
        doc.autoTable({
          startY: yPosition,
          head: [['Medication', 'Dosage', 'Route', 'Frequency', 'Notes']],
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
      } else {
        doc.setFontSize(10);
        doc.text('No medications recorded', 15, yPosition);
        yPosition += 10;
      }

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

      const labsForPDF = labOrders && labOrders.length > 0 
        ? labOrders.filter(l => l.investigation_type === 'lab' && l.status === 'completed').map(l => ({
            testName: l.test_name,
            date: new Date(l.ordered_at || l.created_at).toLocaleString(),
            status: l.status,
            results: l.result_value ? [{ parameter: l.test_name, value: l.result_value, unit: '', range: '', status: 'Normal' }] : []
          }))
        : [];

      if (labsForPDF.length > 0) {
        labsForPDF.forEach((lab) => {
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
      } else {
        doc.setFontSize(10);
        doc.text('No lab results available', 15, yPosition);
        yPosition += 10;
      }

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

      const radiologyForPDF = radiologyOrders && radiologyOrders.length > 0
        ? radiologyOrders.map(order => ({
            examType: order.test_name || 'Radiology Exam',
            date: order.ordered_at ? new Date(order.ordered_at).toLocaleString() : 'N/A',
            orderedBy: order.ordered_by_name || 'N/A',
            findings: order.result_value || 'No findings available',
            impression: order.result_value ? 'See findings above' : 'No impression available',
            recommendation: 'N/A'
          }))
        : [];

      if (radiologyForPDF.length > 0) {
        radiologyForPDF.forEach((report) => {
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
      } else {
        doc.setFontSize(10);
        doc.text('No radiology reports available', 15, yPosition);
        yPosition += 10;
      }

      // New Page for Doctor's Notes
      doc.addPage();
      yPosition = 20;

      // Doctor's Notes
      doc.setFillColor(230, 255, 230);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setTextColor(0, 150, 0);
      doc.setFontSize(14);
      doc.text("DOCTOR'S NOTES", 15, yPosition + 6);
      yPosition += 15;

      const notesForPDF = notes && notes.length > 0
        ? notes.map(n => ({
            noteType: n.note_type || 'Doctor Note',
            date: new Date(n.recorded_at || n.created_at).toLocaleString(),
            doctor: n.recorded_by_name || 'N/A',
            noteText: n.note_text || 'N/A'
          }))
        : [];

      if (notesForPDF.length > 0) {
        notesForPDF.forEach((note) => {
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
          // For PDF, show note text directly (not SOAP format)
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${note.noteType} - ${note.date}`, 15, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`By: ${note.doctor}`, 15, yPosition + 5);
          yPosition += 10;
          const noteLines = doc.splitTextToSize(note.noteText, pageWidth - 30);
          doc.text(noteLines, 15, yPosition);
          yPosition += noteLines.length * 4 + 10;
        });
      } else {
        doc.setFontSize(10);
        doc.text('No doctor\'s notes available', 15, yPosition);
        yPosition += 10;
      }

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

      // Aggregate timeline events from multiple sources
      const timelineEventsForPDF: any[] = [];
      
      // Add status history events
      timeline.forEach((event) => {
        timelineEventsForPDF.push({
          time: new Date(event.changed_at || event.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          event: `Status Changed to ${event.new_status || event.status}`,
          type: 'status_change',
          user: event.changed_by_name || 'System'
        });
      });
      
      // Add vital signs events
      vitals.forEach((vital) => {
        timelineEventsForPDF.push({
          time: new Date(vital.recorded_at || vital.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          event: `Vital Signs Recorded - BP: ${vital.bp || 'N/A'}, Pulse: ${vital.pulse || 'N/A'}`,
          type: 'vital_signs',
          user: vital.recorded_by_name || 'Nurse'
        });
      });
      
      // Add medication events
      medications.forEach((med) => {
        timelineEventsForPDF.push({
          time: new Date(med.administered_at || med.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          event: `Medication: ${med.medication_name || med.name || 'N/A'} - ${med.dosage || 'N/A'}`,
          type: 'medication',
          user: med.administered_by_name || 'Nurse'
        });
      });
      
      // Add investigation events
      [...labOrders, ...radiologyOrders].forEach((order) => {
        timelineEventsForPDF.push({
          time: new Date(order.ordered_at || order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          event: `${order.investigation_type === 'radiology' ? 'Radiology' : 'Lab'} Order: ${order.test_name || 'N/A'}`,
          type: 'investigation',
          user: order.ordered_by_name || 'Doctor'
        });
      });
      
      // Add note events
      notes.forEach((note) => {
        timelineEventsForPDF.push({
          time: new Date(note.recorded_at || note.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          event: `Treatment Note Added`,
          type: 'documentation',
          user: note.recorded_by_name || 'Doctor'
        });
      });
      
      // Sort by time
      timelineEventsForPDF.sort((a, b) => {
        const timeA = a.time;
        const timeB = b.time;
        return timeA.localeCompare(timeB);
      });

      const timelineTableData = timelineEventsForPDF.map(item => [
        item.time,
        item.event,
        item.type.toUpperCase().replace('_', ' '),
        item.user
      ]);

      if (timelineTableData.length > 0) {
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
      } else {
        doc.setFontSize(10);
        doc.text('No timeline events recorded', 15, yPosition);
      }

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
      const patientInfo = patientData || patient || mockPatient;
      doc.save(`Medical_Record_${patientInfo.uhid || patientInfo.patient_id || 'N/A'}_${(patientInfo.name || 'Patient').replace(/ /g, '_')}.pdf`);
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
                    {(patientData || patient || mockPatient)?.name || 'Patient'} • {(patientData || patient || mockPatient)?.uhid || (patientData || patient || mockPatient)?.patient_id || 'N/A'} • {wardName || 'N/A'} - {bedNumber || 'N/A'}
                  </p>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-800">
                {(visitData || patient)?.status || (visitData || patient)?.currentStatus || mockPatient.severity}
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Share functionality - copy link to clipboard
                  const url = window.location.href;
                  navigator.clipboard.writeText(url).then(() => {
                    toast.success('Link copied to clipboard!');
                  }).catch(() => {
                    toast.error('Failed to copy link');
                  });
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                size="sm"
                onClick={() => setShowEditPatient(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Update Records
              </Button>
            </div>
          </div>

          {/* Patient Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Age/Gender</p>
              <p className="text-xl font-bold text-blue-700">{(patientData || patient || mockPatient)?.age || 0}Y / {(patientData || patient || mockPatient)?.gender || 'N/A'}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-600 font-medium">Blood Group</p>
              <p className="text-xl font-bold text-red-700">{(patientData || patient || mockPatient)?.blood_group || (patientData || patient || mockPatient)?.bloodGroup || 'N/A'}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium">Admission Date</p>
              <p className="text-sm font-bold text-green-700">{(visitData || patient)?.admissionDate || (visitData || patient)?.arrivalTime || (visitData || patient)?.arrival_time || 'N/A'}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">ER Number</p>
              <p className="text-sm font-bold text-purple-700">{(visitData || patient)?.erNumber || (visitData || patient)?.er_number || 'N/A'}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium">Attending</p>
              <p className="text-sm font-bold text-orange-700">{((visitData || patient)?.assignedDoctor || (visitData || patient)?.attendingDoctor || 'N/A').replace('Dr. ', '')}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-yellow-600 font-medium">Triage Level</p>
              <p className="text-xl font-bold text-yellow-700">ESI {(visitData || patient)?.triageLevel || (visitData || patient)?.triage_level || 'N/A'}</p>
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
                      {((patientData || patient || mockPatient)?.name || 'P').split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-gray-900">{(patientData || patient || mockPatient)?.name || 'Patient'}</h3>
                  <p className="text-sm text-gray-600">{(patientData || patient || mockPatient)?.occupation || 'N/A'}</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Date of Birth</p>
                    <p className="font-medium">{(patientData || patient || mockPatient)?.date_of_birth || (patientData || patient || mockPatient)?.dob || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Marital Status</p>
                    <p className="font-medium">{(patientData || patient || mockPatient)?.maritalStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Phone</p>
                    <p className="font-medium">{(patientData || patient || mockPatient)?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Email</p>
                    <p className="font-medium text-xs">{(patientData || patient || mockPatient)?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Address</p>
                    <p className="font-medium text-xs">{(patientData || patient || mockPatient)?.address || 'N/A'}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-gray-600 text-xs mb-2">Emergency Contact</p>
                  <div className="bg-red-50 p-3 rounded-lg space-y-1">
                    <p className="font-medium text-sm">{((patientData || patient || mockPatient)?.emergency_contact || (patientData || patient || mockPatient)?.emergencyContact || mockPatient.emergencyContact)?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-600">{((patientData || patient || mockPatient)?.emergency_contact || (patientData || patient || mockPatient)?.emergencyContact || mockPatient.emergencyContact)?.relation || 'N/A'}</p>
                    <p className="text-sm font-medium text-red-600">{((patientData || patient || mockPatient)?.emergency_contact || (patientData || patient || mockPatient)?.emergencyContact || mockPatient.emergencyContact)?.phone || 'N/A'}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-gray-600 text-xs mb-2">Insurance Details</p>
                  <div className="bg-green-50 p-3 rounded-lg space-y-1">
                    <p className="font-medium text-sm">{((patientData || patient || mockPatient)?.insurance || mockPatient.insurance)?.provider || 'N/A'}</p>
                    <p className="text-xs text-gray-600">Policy: {((patientData || patient || mockPatient)?.insurance || mockPatient.insurance)?.policyNumber || 'N/A'}</p>
                    <p className="text-xs text-gray-600">Valid until: {((patientData || patient || mockPatient)?.insurance || mockPatient.insurance)?.validUntil || 'N/A'}</p>
                    <Badge className="bg-green-600 text-white mt-1">
                      {((patientData || patient || mockPatient)?.insurance || mockPatient.insurance)?.coverage || 'N/A'}
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
                {(() => {
                  // Extract allergies from Health & Physical records
                  const allergiesList: any[] = [];
                  healthPhysical.forEach((hp) => {
                    if (hp.allergies) {
                      // Parse allergies if it's a string, or use as array
                      try {
                        const parsed = typeof hp.allergies === 'string' ? JSON.parse(hp.allergies) : hp.allergies;
                        if (Array.isArray(parsed)) {
                          allergiesList.push(...parsed);
                        } else if (typeof parsed === 'object') {
                          allergiesList.push(parsed);
                        } else if (typeof hp.allergies === 'string' && hp.allergies.trim()) {
                          // If it's a plain string, split by comma or newline
                          hp.allergies.split(/[,\n]/).forEach((allergy: string) => {
                            if (allergy.trim()) {
                              allergiesList.push({ allergen: allergy.trim(), reaction: 'Not specified', severity: 'Moderate' });
                            }
                          });
                        }
                      } catch (e) {
                        // If not JSON, treat as plain text
                        if (hp.allergies.trim()) {
                          allergiesList.push({ allergen: hp.allergies, reaction: 'Not specified', severity: 'Moderate' });
                        }
                      }
                    }
                  });
                  
                  if (allergiesList.length === 0) {
                    return (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No allergies recorded
                      </div>
                    );
                  }
                  
                  return allergiesList.map((allergy, idx) => (
                    <Alert key={idx} className="border-red-300 bg-white">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <p className="font-medium text-red-800">{allergy.allergen || allergy}</p>
                        <p className="text-xs text-gray-600 mt-1">{allergy.reaction || 'Not specified'}</p>
                        <Badge className={allergy.severity === 'Critical' ? 'bg-red-600 text-white mt-1' : 'bg-orange-600 text-white mt-1'}>
                          {allergy.severity || 'Moderate'}
                        </Badge>
                      </AlertDescription>
                    </Alert>
                  ));
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full min-w-max">
                  <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
                  <TabsTrigger value="vitals" className="whitespace-nowrap">Vitals</TabsTrigger>
                  <TabsTrigger value="medications" className="whitespace-nowrap">Medications</TabsTrigger>
                  <TabsTrigger value="labs" className="whitespace-nowrap">Lab Results</TabsTrigger>
                  <TabsTrigger value="radiology" className="whitespace-nowrap">Radiology</TabsTrigger>
                  <TabsTrigger value="notes" className="whitespace-nowrap">Doctor's Notes</TabsTrigger>
                  <TabsTrigger value="timeline" className="whitespace-nowrap">Timeline</TabsTrigger>
                </TabsList>
              </div>

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
                      <p className="text-xl font-semibold text-gray-900">{(visitData || patient)?.diagnosis || (visitData || patient)?.chiefComplaint || 'N/A'}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Chief Complaint</p>
                      <p className="text-gray-800">{(visitData || patient)?.chiefComplaint || (visitData || patient)?.chief_complaint || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Vital Signs */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Current Vital Signs</CardTitle>
                      <span className="text-xs text-gray-500">
                        {vitals && vitals.length > 0 
                          ? `Last updated: ${new Date(vitals[0].recorded_at || vitals[0].created_at).toLocaleString()}`
                          : 'No vitals recorded'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const lastVital = vitals && vitals.length > 0 ? vitals[0] : null;
                      if (!lastVital) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            No vital signs recorded yet
                          </div>
                        );
                      }
                      const v = lastVital;
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="w-5 h-5 text-red-600" />
                              <span className="text-sm text-gray-600">Heart Rate</span>
                            </div>
                            <p className="text-2xl font-bold text-red-700">{v.pulse || 'N/A'}</p>
                            <p className="text-xs text-gray-600">bpm</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-5 h-5 text-blue-600" />
                              <span className="text-sm text-gray-600">Blood Pressure</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">{v.bp || 'N/A'}</p>
                            <p className="text-xs text-gray-600">mmHg</p>
                          </div>
                          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Thermometer className="w-5 h-5 text-orange-600" />
                              <span className="text-sm text-gray-600">Temperature</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-700">{v.temp || 'N/A'}</p>
                            <p className="text-xs text-gray-600">°F</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplet className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-gray-600">SpO2</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700">{v.spo2 || 'N/A'}</p>
                            <p className="text-xs text-gray-600">%</p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Wind className="w-5 h-5 text-purple-600" />
                              <span className="text-sm text-gray-600">Resp. Rate</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-700">{v.resp || 'N/A'}</p>
                            <p className="text-xs text-gray-600">/min</p>
                          </div>
                          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-5 h-5 text-indigo-600" />
                              <span className="text-sm text-gray-600">Weight</span>
                            </div>
                            <p className="text-2xl font-bold text-indigo-700">{v.weight || 'N/A'}</p>
                            <p className="text-xs text-gray-600">lbs</p>
                          </div>
                          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-5 h-5 text-teal-600" />
                              <span className="text-sm text-gray-600">Height</span>
                            </div>
                            <p className="text-2xl font-bold text-teal-700">{v.height || 'N/A'}</p>
                            <p className="text-xs text-gray-600">cm</p>
                          </div>
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="w-5 h-5 text-yellow-600" />
                              <span className="text-sm text-gray-600">BMI</span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-700">{v.bmi || 'N/A'}</p>
                            <p className="text-xs text-gray-600">kg/m²</p>
                          </div>
                        </div>
                      );
                    })()}
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
                    {(() => {
                      // Extract medical history from Health & Physical records
                      const medicalHistoryList: any[] = [];
                      healthPhysical.forEach((hp) => {
                        if (hp.past_medical_history) {
                          try {
                            const parsed = typeof hp.past_medical_history === 'string' ? JSON.parse(hp.past_medical_history) : hp.past_medical_history;
                            if (Array.isArray(parsed)) {
                              medicalHistoryList.push(...parsed);
                            } else if (typeof parsed === 'object') {
                              medicalHistoryList.push(parsed);
                            } else if (typeof hp.past_medical_history === 'string' && hp.past_medical_history.trim()) {
                              // If it's a plain string, split by newline or semicolon
                              hp.past_medical_history.split(/[;\n]/).forEach((condition: string) => {
                                if (condition.trim()) {
                                  medicalHistoryList.push({ condition: condition.trim(), status: 'Chronic', notes: 'From medical records' });
                                }
                              });
                            }
                          } catch (e) {
                            // If not JSON, treat as plain text
                            if (hp.past_medical_history.trim()) {
                              medicalHistoryList.push({ condition: hp.past_medical_history, status: 'Chronic', notes: 'From medical records' });
                            }
                          }
                        }
                      });
                      
                      if (medicalHistoryList.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            No medical history recorded
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-3">
                          {medicalHistoryList.map((condition, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{condition.condition || condition}</h4>
                                <Badge className="bg-blue-100 text-blue-800">{condition.status || 'Chronic'}</Badge>
                              </div>
                              <div className="text-sm space-y-1">
                                {condition.diagnosedDate && (
                                  <p className="text-gray-600">Diagnosed: {condition.diagnosedDate}</p>
                                )}
                                {condition.notes && (
                                  <p className="text-gray-700">{condition.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
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
                    {pastVisits.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No past emergency visits found
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pastVisits.map((visit) => {
                          const arrivalTime = visit.arrival_time || visit.arrivalTime;
                          const visitDate = arrivalTime ? new Date(arrivalTime).toLocaleDateString() : 'N/A';
                          const dispositionTime = visit.disposition_time;
                          const duration = arrivalTime && dispositionTime 
                            ? `${Math.round((new Date(dispositionTime).getTime() - new Date(arrivalTime).getTime()) / (1000 * 60 * 60))}h ${Math.round(((new Date(dispositionTime).getTime() - new Date(arrivalTime).getTime()) / (1000 * 60)) % 60)}m`
                            : 'N/A';
                          
                          return (
                            <div key={visit.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{visit.er_number || visit.erNumber || 'N/A'}</p>
                                  <p className="text-sm text-gray-600">{visitDate}</p>
                                </div>
                                <Badge className="bg-purple-100 text-purple-800">{duration}</Badge>
                              </div>
                              <div className="text-sm space-y-1">
                                <p><span className="text-gray-600">Complaint:</span> {visit.chief_complaint || visit.chiefComplaint || 'N/A'}</p>
                                <p><span className="text-gray-600">Diagnosis:</span> {visit.primary_diagnosis || visit.diagnosis || visit.chief_complaint || 'N/A'}</p>
                                <p><span className="text-gray-600">Disposition:</span> {visit.disposition || 'N/A'}</p>
                                <p><span className="text-gray-600">Doctor:</span> {visit.doctor_name || visit.doctor || 'N/A'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                    {vitals && vitals.length > 0 ? (
                      <div className="space-y-8">
                        {/* Heart Rate Chart */}
                        <div>
                          <h4 className="font-medium mb-4 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-600" />
                            Heart Rate (bpm)
                          </h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <RechartsLineChart data={vitals.slice(-10).reverse().map((v) => ({
                              time: new Date(v.recorded_at || v.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                              heartRate: v.pulse || 0,
                              bloodPressure: v.bp ? parseInt(v.bp.split('/')[0]) : 0,
                              temperature: v.temp || 0,
                              spo2: v.spo2 || 0,
                              respRate: v.resp || 0
                            }))}>
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
                            <RechartsLineChart data={vitals.slice(-10).reverse().map((v) => ({
                              time: new Date(v.recorded_at || v.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                              bloodPressure: v.bp ? parseInt(v.bp.split('/')[0]) : 0
                            }))}>
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
                            <RechartsLineChart data={vitals.slice(-10).reverse().map((v) => ({
                              time: new Date(v.recorded_at || v.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                              spo2: v.spo2 || 0
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis domain={[85, 100]} />
                              <Tooltip />
                              <Line type="monotone" dataKey="spo2" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a' }} />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        No vital signs data available for charts
                      </div>
                    )}
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
                        {(() => {
                          if (!vitals || vitals.length === 0) {
                            return (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                  No vital signs recorded yet
                                </TableCell>
                              </TableRow>
                            );
                          }
                          
                          const vitalsToShow = vitals.slice(-20).reverse().map((v) => ({
                            time: new Date(v.recorded_at || v.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                            heartRate: v.pulse || 0,
                            bloodPressure: v.bp || 'N/A',
                            temperature: v.temp || 0,
                            spo2: v.spo2 || 0,
                            respRate: v.resp || 0
                          }));
                          
                          return vitalsToShow.map((vital, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{vital.time}</TableCell>
                              <TableCell>{vital.heartRate} bpm</TableCell>
                              <TableCell>{vital.bloodPressure} {typeof vital.bloodPressure === 'string' ? '' : 'mmHg'}</TableCell>
                              <TableCell>{vital.temperature}°F</TableCell>
                              <TableCell>{vital.spo2}%</TableCell>
                              <TableCell>{vital.respRate}/min</TableCell>
                            </TableRow>
                          ));
                        })()}
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
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowAddMedication(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        if (!medications || medications.length === 0) {
                          return (
                            <div className="text-center py-12 text-gray-500">
                              No medications recorded yet
                            </div>
                          );
                        }
                        return medications.map((med, idx) => (
                          <div key={med.id || idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-lg">{med.medication_name || med.name || 'N/A'}</h4>
                                <p className="text-sm text-gray-600">{med.indication || med.notes || 'N/A'}</p>
                              </div>
                              <Badge className={med.status === 'Active' || med.status === 'given' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
                                {med.status || 'N/A'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Dosage</p>
                                <p className="font-medium">{med.dosage || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Route</p>
                                <p className="font-medium">{med.route || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Frequency</p>
                                <p className="font-medium">{med.frequency || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Started</p>
                                <p className="font-medium">{med.administered_at || med.startDate || new Date(med.created_at || '').toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-blue-300">
                              <p className="text-xs text-gray-600">Prescribed by: {med.administered_by_name || med.prescribedBy || 'N/A'}</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lab Results Tab */}
              <TabsContent value="labs" className="space-y-6 mt-6">
                {(() => {
                  const labsToShow = labOrders && labOrders.length > 0 
                    ? labOrders.filter(l => l.investigation_type === 'lab' && l.status === 'completed').map(l => ({
                        id: l.id,
                        testName: l.test_name,
                        date: new Date(l.ordered_at || l.created_at).toLocaleString(),
                        status: l.status,
                        results: l.result_value ? [{ parameter: l.test_name, value: l.result_value, unit: '', range: '', status: 'Normal' }] : []
                      }))
                    : [];
                  
                  if (labsToShow.length === 0) {
                    return (
                      <div className="text-center py-12 text-gray-500">
                        No lab results available yet
                      </div>
                    );
                  }
                  
                  return labsToShow.map((lab) => (
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
                ));
                })()}
              </TabsContent>

              {/* Radiology Tab */}
              <TabsContent value="radiology" className="space-y-6 mt-6">
                {radiologyOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No radiology reports available yet
                  </div>
                ) : (
                  radiologyOrders.map((order) => {
                    const handleViewImages = () => {
                      // Check if there are files associated with this order
                      const relatedFiles = files.filter(f => 
                        f.category === 'Radiology' && 
                        (f.description?.toLowerCase().includes(order.test_name?.toLowerCase() || '') ||
                         f.file_name?.toLowerCase().includes(order.test_name?.toLowerCase() || ''))
                      );
                      
                      if (relatedFiles.length > 0) {
                        // Open files in new tab or show dialog
                        relatedFiles.forEach(file => {
                          window.open(file.file_path, '_blank');
                        });
                        toast.success(`Opening ${relatedFiles.length} file(s)`);
                      } else {
                        toast.info('No images found for this radiology order');
                      }
                    };
                    
                    const handleDownloadReport = () => {
                      if (order.result_file_path) {
                        window.open(order.result_file_path, '_blank');
                        toast.success('Downloading report...');
                      } else if (order.result_value) {
                        // Create a text file with the result
                        const blob = new Blob([order.result_value], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `Radiology_Report_${order.test_name}_${order.id}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        toast.success('Report downloaded');
                      } else {
                        toast.error('No report available to download');
                      }
                    };
                    
                    return (
                      <Card key={order.id}>
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Scan className="w-5 h-5 text-indigo-600" />
                                {order.test_name || 'Radiology Exam'}
                              </CardTitle>
                              <CardDescription>
                                {order.ordered_at ? new Date(order.ordered_at).toLocaleString() : 'N/A'}
                              </CardDescription>
                            </div>
                            <Badge className={
                              order.status === 'completed' ? 'bg-green-600 text-white' :
                              order.status === 'in-progress' ? 'bg-blue-600 text-white' :
                              'bg-yellow-600 text-white'
                            }>
                              {order.status || 'ordered'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Ordered By</p>
                              <p className="font-medium">{order.ordered_by_name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Priority</p>
                              <p className="font-medium">{order.priority || 'Routine'}</p>
                            </div>
                          </div>
                          {order.result_value && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Findings</h4>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-line">
                                  {order.result_value}
                                </p>
                              </div>
                            </>
                          )}
                          {order.status === 'completed' && (
                            <div className="flex gap-2 pt-4">
                              <Button variant="outline" size="sm" onClick={handleViewImages}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Images
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              {/* Doctor's Notes Tab */}
              <TabsContent value="notes" className="space-y-6 mt-6">
                {(() => {
                  const notesToShow = notes && notes.length > 0
                    ? notes.map(n => ({
                        id: n.id,
                        noteType: n.note_type || 'Doctor Note',
                        date: new Date(n.recorded_at || n.created_at).toLocaleString(),
                        doctor: n.recorded_by_name || 'N/A',
                        noteText: n.note_text || 'N/A'
                      }))
                    : [];
                  
                  if (notesToShow.length === 0) {
                    return (
                      <div className="text-center py-12 text-gray-500">
                        No doctor's notes available yet
                      </div>
                    );
                  }
                  
                  return (
                    <>
                      {notesToShow.map((note) => (
                        <Card key={note.id}>
                          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <ClipboardList className="w-5 h-5 text-green-600" />
                                  {note.noteType}
                                </CardTitle>
                                <CardDescription>
                                  {note.doctor} • {note.date}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6 space-y-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Note</h4>
                              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-line">
                                {note.noteText}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => setShowAddNote(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Note
                      </Button>
                    </>
                  );
                })()}
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Treatment Timeline
                    </CardTitle>
                    <CardDescription>Chronological record of all events and interventions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Aggregate timeline events from multiple sources (similar to EmergencyPatientProfile)
                      const timelineEvents: any[] = [];
                      
                      // Add status history events
                      timeline.forEach((event) => {
                        timelineEvents.push({
                          id: `status-${event.id}`,
                          type: 'status_change',
                          timestamp: new Date(event.changed_at || event.created_at),
                          title: `Status Changed to ${event.new_status || event.status}`,
                          description: event.notes || `Status changed from ${event.old_status || 'N/A'} to ${event.new_status || event.status}`,
                          user: event.changed_by_name || 'System',
                          icon: getTimelineIcon('alert'),
                          color: getTimelineColor('alert')
                        });
                      });
                      
                      // Add vital signs events
                      vitals.forEach((vital) => {
                        timelineEvents.push({
                          id: `vital-${vital.id}`,
                          type: 'vital_signs',
                          timestamp: new Date(vital.recorded_at || vital.created_at),
                          title: 'Vital Signs Recorded',
                          description: `BP: ${vital.bp || 'N/A'}, Pulse: ${vital.pulse || 'N/A'}, Temp: ${vital.temp || 'N/A'}°F, SpO2: ${vital.spo2 || 'N/A'}%`,
                          user: vital.recorded_by_name || 'Nurse',
                          icon: getTimelineIcon('investigation'),
                          color: getTimelineColor('investigation')
                        });
                      });
                      
                      // Add medication events
                      medications.forEach((med) => {
                        timelineEvents.push({
                          id: `med-${med.id}`,
                          type: 'medication',
                          timestamp: new Date(med.administered_at || med.created_at),
                          title: 'Medication Administered',
                          description: `${med.medication_name || med.name || 'N/A'} - ${med.dosage || 'N/A'}`,
                          user: med.administered_by_name || 'Nurse',
                          icon: getTimelineIcon('medication'),
                          color: getTimelineColor('medication')
                        });
                      });
                      
                      // Add investigation events
                      [...labOrders, ...radiologyOrders].forEach((order) => {
                        timelineEvents.push({
                          id: `investigation-${order.id}`,
                          type: 'investigation',
                          timestamp: new Date(order.ordered_at || order.created_at),
                          title: `${order.investigation_type === 'radiology' ? 'Radiology' : 'Lab'} Order`,
                          description: `${order.test_name || 'N/A'} - Status: ${order.status || 'ordered'}`,
                          user: order.ordered_by_name || 'Doctor',
                          icon: getTimelineIcon('investigation'),
                          color: getTimelineColor('investigation')
                        });
                      });
                      
                      // Add note events
                      notes.forEach((note) => {
                        timelineEvents.push({
                          id: `note-${note.id}`,
                          type: 'documentation',
                          timestamp: new Date(note.recorded_at || note.created_at),
                          title: 'Treatment Note Added',
                          description: note.note_text?.substring(0, 100) || 'Note recorded',
                          user: note.recorded_by_name || 'Doctor',
                          icon: getTimelineIcon('documentation'),
                          color: getTimelineColor('documentation')
                        });
                      });
                      
                      // Sort by timestamp (newest first)
                      timelineEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                      
                      if (timelineEvents.length === 0) {
                        return (
                          <div className="text-center py-12 text-gray-500">
                            No timeline events recorded yet
                          </div>
                        );
                      }
                      
                      return (
                        <div className="relative">
                          {/* Timeline Line */}
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                          
                          {/* Timeline Items */}
                          <div className="space-y-6">
                            {timelineEvents.map((item) => {
                              const eventDate = item.timestamp;
                              const timeStr = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                              const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              
                              return (
                                <div key={item.id} className="relative pl-14">
                                  {/* Timeline Dot */}
                                  <div className={`absolute left-0 w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${item.color}`}>
                                    {item.icon}
                                  </div>
                                  
                                  {/* Timeline Content */}
                                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-semibold text-gray-900">{timeStr} - {dateStr}</span>
                                      <Badge className={item.color}>
                                        {item.type.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                    <p className="text-gray-900 font-medium mb-1">{item.title}</p>
                                    <p className="text-gray-700 text-sm">{item.description}</p>
                                    <p className="text-xs text-gray-500 mt-2">By: {item.user}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showEditPatient && patient && (
        <EditEmergencyPatient
          patient={patient}
          onClose={() => setShowEditPatient(false)}
          onSave={() => {
            setShowEditPatient(false);
            loadPatientData();
            toast.success('Patient records updated successfully!');
          }}
        />
      )}

      {showAddMedication && visitId && (
        <AddMedicationDialog
          patient={patient}
          visitId={visitId}
          onClose={() => setShowAddMedication(false)}
          onSave={() => {
            setShowAddMedication(false);
            loadPatientData();
            toast.success('Medication added successfully!');
          }}
        />
      )}

      {showAddNote && visitId && (
        <AddNoteDialog
          patient={patient}
          visitId={visitId}
          onClose={() => setShowAddNote(false)}
          onSave={() => {
            setShowAddNote(false);
            loadPatientData();
            toast.success('Note added successfully!');
          }}
        />
      )}
    </div>
  );
}