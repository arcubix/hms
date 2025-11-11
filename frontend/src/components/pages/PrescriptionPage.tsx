import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Loader2, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Stethoscope,
  Pill,
  FlaskConical,
  AlertCircle,
  Search,
  Printer,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { api, Appointment, PrescriptionMedicine, PrescriptionLabTest, CreatePrescriptionData, User, Medicine, LabTest, Patient } from '../../services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PrescriptionPageProps {
  appointmentId: string;
  patientId: number;
  patientName: string;
  patientPhone?: string;
  onBack: () => void;
  onSuccess?: () => void;
}

export function PrescriptionPage({ 
  appointmentId, 
  patientId, 
  patientName, 
  patientPhone,
  onBack, 
  onSuccess 
}: PrescriptionPageProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [prescriptionNumber, setPrescriptionNumber] = useState<string>('');
  const [showPrintView, setShowPrintView] = useState(false);

  // Form state
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Medicines state
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState<{ [key: number]: string }>({});
  const [medicineSearchResults, setMedicineSearchResults] = useState<{ [key: number]: Medicine[] }>({});
  const [showMedicineDropdown, setShowMedicineDropdown] = useState<{ [key: number]: boolean }>({});

  // Lab tests state
  const [labTests, setLabTests] = useState<PrescriptionLabTest[]>([]);
  const [availableLabTests, setAvailableLabTests] = useState<LabTest[]>([]);
  const [labTestSearchTerm, setLabTestSearchTerm] = useState<{ [key: number]: string }>({});
  const [labTestSearchResults, setLabTestSearchResults] = useState<{ [key: number]: LabTest[] }>({});
  const [showLabTestDropdown, setShowLabTestDropdown] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadPatientData();
    if (appointmentId) {
      loadAppointment();
    } else {
      setLoading(false);
    }
    // Load available medicines and lab tests
    loadAvailableMedicines();
    loadAvailableLabTests();
  }, [appointmentId, patientId]);

  const loadPatientData = async (): Promise<Patient | null> => {
    try {
      if (!patientId || patientId === 0) {
        console.error('Invalid patient ID:', patientId);
        setError('Invalid patient ID. Cannot load patient data.');
        return null;
      }
      const patientData = await api.getPatient(patientId.toString());
      if (patientData && patientData.id) {
        setPatient(patientData);
        return patientData;
      } else {
        console.error('Patient data not found or invalid:', patientData);
        setError('Patient data not found. Please ensure the patient exists.');
        return null;
      }
    } catch (err: any) {
      console.error('Error loading patient:', err);
      setError(err.message || 'Failed to load patient data. Please try again.');
      return null;
    }
  };

  const loadAvailableMedicines = async () => {
    try {
      const data = await api.getMedicines();
      setAvailableMedicines(data);
    } catch (err) {
      console.error('Error loading medicines:', err);
    }
  };

  const loadAvailableLabTests = async () => {
    try {
      const data = await api.getLabTests();
      setAvailableLabTests(data);
    } catch (err) {
      console.error('Error loading lab tests:', err);
    }
  };

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const data = await api.getAppointment(appointmentId);
      setAppointment(data);
      
      // Pre-fill chief complaint from appointment reason
      if (data.reason) {
        setChiefComplaint(data.reason);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = () => {
    const newIndex = medicines.length;
    setMedicines([...medicines, {
      medicine_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: undefined,
      instructions: '',
      timing: ''
    }]);
    setMedicineSearchTerm({ ...medicineSearchTerm, [newIndex]: '' });
    setMedicineSearchResults({ ...medicineSearchResults, [newIndex]: [] });
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof PrescriptionMedicine, value: any) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleMedicineSearch = (index: number, searchTerm: string) => {
    setMedicineSearchTerm({ ...medicineSearchTerm, [index]: searchTerm });
    
    if (searchTerm.trim().length > 0) {
      const filtered = availableMedicines.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.medicine_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setMedicineSearchResults({ ...medicineSearchResults, [index]: filtered });
      setShowMedicineDropdown({ ...showMedicineDropdown, [index]: true });
    } else {
      setMedicineSearchResults({ ...medicineSearchResults, [index]: [] });
      setShowMedicineDropdown({ ...showMedicineDropdown, [index]: false });
    }
  };

  const selectMedicine = (index: number, medicine: Medicine) => {
    const updated = [...medicines];
    updated[index] = {
      ...updated[index],
      medicine_id: medicine.id,
      medicine_name: medicine.name,
      dosage: medicine.strength || updated[index].dosage
    };
    setMedicines(updated);
    setMedicineSearchTerm({ ...medicineSearchTerm, [index]: medicine.name });
    setShowMedicineDropdown({ ...showMedicineDropdown, [index]: false });
  };

  const addLabTest = () => {
    const newIndex = labTests.length;
    setLabTests([...labTests, {
      test_name: '',
      test_type: '',
      instructions: '',
      priority: 'Normal'
    }]);
    setLabTestSearchTerm({ ...labTestSearchTerm, [newIndex]: '' });
    setLabTestSearchResults({ ...labTestSearchResults, [newIndex]: [] });
  };

  const removeLabTest = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  const updateLabTest = (index: number, field: keyof PrescriptionLabTest, value: any) => {
    const updated = [...labTests];
    updated[index] = { ...updated[index], [field]: value };
    setLabTests(updated);
  };

  const handleLabTestSearch = (index: number, searchTerm: string) => {
    setLabTestSearchTerm({ ...labTestSearchTerm, [index]: searchTerm });
    
    if (searchTerm.trim().length > 0) {
      const filtered = availableLabTests.filter(test =>
        test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.test_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.test_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setLabTestSearchResults({ ...labTestSearchResults, [index]: filtered });
      setShowLabTestDropdown({ ...showLabTestDropdown, [index]: true });
    } else {
      setLabTestSearchResults({ ...labTestSearchResults, [index]: [] });
      setShowLabTestDropdown({ ...showLabTestDropdown, [index]: false });
    }
  };

  const selectLabTest = (index: number, test: LabTest) => {
    const updated = [...labTests];
    updated[index] = {
      ...updated[index],
      lab_test_id: test.id,
      test_name: test.test_name,
      test_type: test.test_type || updated[index].test_type,
      instructions: test.preparation_instructions || updated[index].instructions
    };
    setLabTests(updated);
    setLabTestSearchTerm({ ...labTestSearchTerm, [index]: test.test_name });
    setShowLabTestDropdown({ ...showLabTestDropdown, [index]: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Get current user (doctor) from localStorage
      const savedUser = localStorage.getItem('hms-user');
      if (!savedUser) {
        throw new Error('User not found. Please login again.');
      }
      const user: User = JSON.parse(savedUser);
      
      if (!user.doctor?.id) {
        throw new Error('Doctor profile not found');
      }

      // Ensure patient data is loaded
      let actualPatient: Patient | null = patient;
      if (!actualPatient || !actualPatient.id) {
        // Try to load patient data if not already loaded
        if (patientId && patientId !== 0) {
          actualPatient = await loadPatientData();
        }
        
        // Check if we have valid patient data
        if (!actualPatient || !actualPatient.id) {
          throw new Error('Patient data not loaded. Please ensure the patient exists and try again.');
        }
      }

      // Use patient's database ID from loaded patient data
      const actualPatientId = actualPatient.id;
      
      if (!actualPatientId || actualPatientId === 0) {
        throw new Error('Invalid patient ID. Patient ID must be a valid number greater than 0.');
      }

      const prescriptionData: CreatePrescriptionData = {
        appointment_id: appointmentId ? parseInt(appointmentId) : undefined,
        patient_id: actualPatientId,
        doctor_id: user.doctor.id,
        chief_complaint: chiefComplaint || undefined,
        diagnosis: diagnosis || undefined,
        clinical_notes: clinicalNotes || undefined,
        advice: advice || undefined,
        follow_up_date: followUpDate || undefined,
        medicines: medicines.filter(m => m.medicine_name.trim() !== ''),
        lab_tests: labTests.filter(t => t.test_name.trim() !== ''),
        status: 'Active'
      };

      const createdPrescription = await api.createPrescription(prescriptionData);
      setPrescriptionNumber(createdPrescription.prescription_number);
      setSuccess('Prescription created successfully!');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const patientInitials = (patient?.name || patientName).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Get current user (doctor) info
  const savedUser = localStorage.getItem('hms-user');
  const user: User | null = savedUser ? JSON.parse(savedUser) : null;

  const handlePrint = () => {
    window.print();
  };

  // Print View Component
  const PrintView = () => (
    <div className={`${showPrintView ? 'block' : 'hidden'} print:block fixed inset-0 bg-white z-50 p-8 overflow-auto`} style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .print-view, .print-view * {
            visibility: visible;
          }
          .print-view {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          button {
            display: none !important;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
      <div className="mb-4 print:hidden">
        <Button variant="outline" onClick={() => setShowPrintView(false)}>
          <X className="w-4 h-4 mr-2" />
          Close Preview
        </Button>
        <Button className="ml-2" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print Now
        </Button>
      </div>
      <div className="print-view space-y-6">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PRESCRIPTION</h1>
              {prescriptionNumber && (
                <p className="text-sm text-gray-600 mt-1">Prescription No: {prescriptionNumber}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              {appointment && (
                <p className="text-sm text-gray-600 mt-1">
                  Appointment: {new Date(appointment.appointment_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="border-b border-gray-300 pb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Name:</span> {patient?.name || patientName}
            </div>
            <div>
              <span className="font-semibold">Patient ID:</span> {patient?.patient_id || `ID: ${patientId}`}
            </div>
            {patient?.age && (
              <div>
                <span className="font-semibold">Age:</span> {patient.age} years
              </div>
            )}
            {patient?.gender && (
              <div>
                <span className="font-semibold">Gender:</span> {patient.gender}
              </div>
            )}
            {(patient?.phone || patientPhone) && (
              <div>
                <span className="font-semibold">Phone:</span> {patient?.phone || patientPhone}
              </div>
            )}
            {patient?.email && (
              <div>
                <span className="font-semibold">Email:</span> {patient.email}
              </div>
            )}
            {patient?.blood_group && (
              <div>
                <span className="font-semibold">Blood Group:</span> {patient.blood_group}
              </div>
            )}
          </div>
        </div>

        {/* Doctor Information */}
        {user && (
          <div className="border-b border-gray-300 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Prescribed By</h2>
            <div className="text-sm">
              <p className="font-semibold">Dr. {user.name}</p>
              {user.doctor?.specialty && (
                <p className="text-gray-600">{user.doctor.specialty}</p>
              )}
            </div>
          </div>
        )}

        {/* Clinical Information */}
        {(chiefComplaint || diagnosis || clinicalNotes || advice) && (
          <div className="border-b border-gray-300 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Clinical Information</h2>
            {chiefComplaint && (
              <div className="mb-3">
                <p className="text-sm font-semibold mb-1">Chief Complaint:</p>
                <p className="text-sm text-gray-700">{chiefComplaint}</p>
              </div>
            )}
            {diagnosis && (
              <div className="mb-3">
                <p className="text-sm font-semibold mb-1">Diagnosis:</p>
                <p className="text-sm text-gray-700">{diagnosis}</p>
              </div>
            )}
            {clinicalNotes && (
              <div className="mb-3">
                <p className="text-sm font-semibold mb-1">Clinical Notes:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{clinicalNotes}</p>
              </div>
            )}
            {advice && (
              <div>
                <p className="text-sm font-semibold mb-1">Advice:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{advice}</p>
              </div>
            )}
          </div>
        )}

        {/* Medicines */}
        {medicines.filter(m => m.medicine_name.trim() !== '').length > 0 && (
          <div className="border-b border-gray-300 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Medications</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 font-semibold">Medicine</th>
                  <th className="text-left py-2 font-semibold">Dosage</th>
                  <th className="text-left py-2 font-semibold">Frequency</th>
                  <th className="text-left py-2 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {medicines.filter(m => m.medicine_name.trim() !== '').map((medicine, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2">
                      <div className="font-medium">{medicine.medicine_name}</div>
                      {medicine.instructions && (
                        <div className="text-xs text-gray-600 mt-1">{medicine.instructions}</div>
                      )}
                    </td>
                    <td className="py-2">{medicine.dosage || '-'}</td>
                    <td className="py-2">
                      {medicine.frequency || '-'}
                      {medicine.timing && <span className="text-xs text-gray-600"> ({medicine.timing})</span>}
                    </td>
                    <td className="py-2">{medicine.duration || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Lab Tests */}
        {labTests.filter(t => t.test_name.trim() !== '').length > 0 && (
          <div className="border-b border-gray-300 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Lab Tests / Investigations</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 font-semibold">Test Name</th>
                  <th className="text-left py-2 font-semibold">Type</th>
                  <th className="text-left py-2 font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {labTests.filter(t => t.test_name.trim() !== '').map((test, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2">
                      <div className="font-medium">{test.test_name}</div>
                      {test.instructions && (
                        <div className="text-xs text-gray-600 mt-1">{test.instructions}</div>
                      )}
                    </td>
                    <td className="py-2">{test.test_type || '-'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        test.priority === 'Emergency' ? 'bg-red-100 text-red-800' :
                        test.priority === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {test.priority || 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Follow-up */}
        {followUpDate && (
          <div className="border-b border-gray-300 pb-4">
            <p className="text-sm">
              <span className="font-semibold">Follow-up Date:</span>{' '}
              {new Date(followUpDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <div className="flex justify-between items-end">
            <div className="text-sm text-gray-600">
              <p>This is a computer-generated prescription.</p>
              <p className="mt-2">For any queries, please contact the hospital.</p>
            </div>
            <div className="text-right">
              <div className="border-t-2 border-gray-800 pt-2 mt-8 w-48">
                <p className="text-sm font-semibold">Dr. {user?.name || 'Doctor'}</p>
                {user?.doctor?.qualification && (
                  <p className="text-xs text-gray-600">{user.doctor.qualification}</p>
                )}
                {user?.doctor?.specialty && (
                  <p className="text-xs text-gray-600">{user.doctor.specialty}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showPrintView && <PrintView />}
      <div className="p-6 space-y-6 max-w-6xl mx-auto no-print">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Write Prescription</h1>
            <p className="text-gray-600 mt-1">Create prescription for patient</p>
          </div>
        </div>
        {prescriptionNumber && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setShowPrintView(true);
              setTimeout(() => handlePrint(), 100);
            }}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Prescription
          </Button>
        )}
      </div>

      {/* Patient Info Card - Enhanced */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                {patientInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-gray-900">{patient?.name || patientName}</h3>
                {patient?.status && (
                  <Badge className={patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {patient.status}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-xs text-gray-500">Patient ID</span>
                    <p className="font-medium">{patient?.patient_id || `ID: ${patientId}`}</p>
                  </div>
                </div>
                {patient?.age && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-xs text-gray-500">Age / Gender</span>
                      <p className="font-medium">{patient.age} years, {patient.gender}</p>
                    </div>
                  </div>
                )}
                {(patient?.phone || patientPhone) && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-xs text-gray-500">Phone</span>
                      <p className="font-medium">{patient?.phone || patientPhone}</p>
                    </div>
                  </div>
                )}
                {patient?.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-xs text-gray-500">Email</span>
                      <p className="font-medium">{patient.email}</p>
                    </div>
                  </div>
                )}
                {patient?.blood_group && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Stethoscope className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-xs text-gray-500">Blood Group</span>
                      <p className="font-medium">{patient.blood_group}</p>
                    </div>
                  </div>
                )}
                {appointment && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-xs text-gray-500">Appointment Date</span>
                      <p className="font-medium">{new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                )}
                {(patient?.address || patient?.city) && (
                  <div className="flex items-center gap-2 text-gray-700 md:col-span-2 lg:col-span-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-xs text-gray-500">Address</span>
                      <p className="font-medium">
                        {[patient.address, patient.city, patient.state, patient.zip_code].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <Stethoscope className="w-5 h-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Clinical Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              Clinical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chief_complaint">Chief Complaint</Label>
              <Textarea
                id="chief_complaint"
                placeholder="Enter patient's chief complaint..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                placeholder="Enter diagnosis..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="clinical_notes">Clinical Notes / Examination Findings</Label>
              <Textarea
                id="clinical_notes"
                placeholder="Enter clinical examination notes..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="advice">Advice to Patient</Label>
              <Textarea
                id="advice"
                placeholder="Enter advice for the patient..."
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="follow_up_date">Follow-up Date (Optional)</Label>
              <Input
                id="follow_up_date"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Medicines */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-600" />
              Medicines
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addMedicine}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Pill className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No medicines added. Click "Add Medicine" to add prescriptions.</p>
              </div>
            ) : (
              medicines.map((medicine, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Medicine #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedicine(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2 relative">
                      <Label>Medicine Name *</Label>
                      <div className="relative">
                        <Input
                          placeholder="Search or type medicine name..."
                          value={medicineSearchTerm[index] || medicine.medicine_name}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateMedicine(index, 'medicine_name', value);
                            handleMedicineSearch(index, value);
                          }}
                          onFocus={() => {
                            if (medicineSearchTerm[index] || medicine.medicine_name) {
                              handleMedicineSearch(index, medicineSearchTerm[index] || medicine.medicine_name);
                            }
                          }}
                          onBlur={() => {
                            // Delay to allow click on dropdown item
                            setTimeout(() => {
                              setShowMedicineDropdown({ ...showMedicineDropdown, [index]: false });
                            }, 200);
                          }}
                          required
                          className="mt-1"
                        />
                        {showMedicineDropdown[index] && medicineSearchResults[index] && medicineSearchResults[index].length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {medicineSearchResults[index].map((med) => (
                              <div
                                key={med.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectMedicine(index, med);
                                }}
                              >
                                <div className="font-medium text-sm">{med.name}</div>
                                {med.generic_name && (
                                  <div className="text-xs text-gray-500">Generic: {med.generic_name}</div>
                                )}
                                {med.strength && (
                                  <div className="text-xs text-gray-500">Strength: {med.strength}</div>
                                )}
                                <div className="text-xs text-gray-400">Code: {med.medicine_code}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {medicine.medicine_id && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          From Inventory
                        </Badge>
                      )}
                    </div>
                    <div>
                      <Label>Dosage</Label>
                      <Input
                        placeholder="e.g., 500mg, 10ml"
                        value={medicine.dosage || ''}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Frequency</Label>
                      <Select
                        value={medicine.frequency || ''}
                        onValueChange={(value) => updateMedicine(index, 'frequency', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Once daily">Once daily</SelectItem>
                          <SelectItem value="Twice daily">Twice daily</SelectItem>
                          <SelectItem value="Three times daily">Three times daily</SelectItem>
                          <SelectItem value="Four times daily">Four times daily</SelectItem>
                          <SelectItem value="As needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        placeholder="e.g., 7 days, 2 weeks"
                        value={medicine.duration || ''}
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        placeholder="Number of units"
                        value={medicine.quantity || ''}
                        onChange={(e) => updateMedicine(index, 'quantity', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Timing</Label>
                      <Select
                        value={medicine.timing || ''}
                        onValueChange={(value) => updateMedicine(index, 'timing', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Before meals">Before meals</SelectItem>
                          <SelectItem value="After meals">After meals</SelectItem>
                          <SelectItem value="With food">With food</SelectItem>
                          <SelectItem value="Empty stomach">Empty stomach</SelectItem>
                          <SelectItem value="Anytime">Anytime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Special Instructions</Label>
                      <Textarea
                        placeholder="e.g., Take with plenty of water, Avoid alcohol"
                        value={medicine.instructions || ''}
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Lab Tests */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-yellow-600" />
              Lab Tests / Investigations
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLabTest}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lab Test
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {labTests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FlaskConical className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No lab tests added. Click "Add Lab Test" to refer investigations.</p>
              </div>
            ) : (
              labTests.map((test, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Test #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLabTest(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2 relative">
                      <Label>Test Name *</Label>
                      <div className="relative">
                        <Input
                          placeholder="Search or type test name..."
                          value={labTestSearchTerm[index] || test.test_name}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateLabTest(index, 'test_name', value);
                            handleLabTestSearch(index, value);
                          }}
                          onFocus={() => {
                            if (labTestSearchTerm[index] || test.test_name) {
                              handleLabTestSearch(index, labTestSearchTerm[index] || test.test_name);
                            }
                          }}
                          onBlur={() => {
                            // Delay to allow click on dropdown item
                            setTimeout(() => {
                              setShowLabTestDropdown({ ...showLabTestDropdown, [index]: false });
                            }, 200);
                          }}
                          required
                          className="mt-1"
                        />
                        {showLabTestDropdown[index] && labTestSearchResults[index] && labTestSearchResults[index].length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {labTestSearchResults[index].map((labTest) => (
                              <div
                                key={labTest.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectLabTest(index, labTest);
                                }}
                              >
                                <div className="font-medium text-sm">{labTest.test_name}</div>
                                {labTest.test_type && (
                                  <div className="text-xs text-gray-500">Type: {labTest.test_type}</div>
                                )}
                                {labTest.category && (
                                  <div className="text-xs text-gray-500">Category: {labTest.category}</div>
                                )}
                                <div className="text-xs text-gray-400">Code: {labTest.test_code}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {test.lab_test_id && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          From Inventory
                        </Badge>
                      )}
                    </div>
                    <div>
                      <Label>Test Type</Label>
                      <Input
                        placeholder="e.g., Blood Test, Urine Test, X-Ray"
                        value={test.test_type || ''}
                        onChange={(e) => updateLabTest(index, 'test_type', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={test.priority || 'Normal'}
                        onValueChange={(value: 'Normal' | 'Urgent' | 'Emergency') => updateLabTest(index, 'priority', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Special Instructions</Label>
                      <Textarea
                        placeholder="e.g., Fasting required, Collect morning sample"
                        value={test.instructions || ''}
                        onChange={(e) => updateLabTest(index, 'instructions', e.target.value)}
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onBack} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Prescription
              </>
            )}
          </Button>
        </div>
      </form>
      </div>
    </>
  );
}

