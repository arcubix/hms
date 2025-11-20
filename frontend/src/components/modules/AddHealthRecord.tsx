import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { api, Patient, Medicine, LabTest, RadiologyTest, CreatePrescriptionData, PrescriptionMedicine, PrescriptionLabTest, PrescriptionRadiologyTest, Doctor } from '../../services/api';
import { User } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  ArrowLeft,
  Search,
  Plus,
  Calendar,
  FileText,
  Stethoscope,
  Activity,
  FlaskConical,
  Scan,
  ClipboardList,
  Copy,
  Eye,
  Edit2,
  Trash2,
  X,
  UserPlus,
  AlertCircle,
  Pill,
  Sparkles,
  Save,
  Printer,
  ChevronRight,
  CalendarDays,
  Clock,
  User as UserIcon,
  Syringe,
  TestTube,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

interface AddHealthRecordProps {
  patientId?: string;
  patientName?: string;
  prescriptionId?: string; // For edit/view mode
  mode?: 'add' | 'edit' | 'view'; // Mode: add (default), edit, or view
  onBack: () => void;
  onEdit?: () => void; // Callback for edit button in view mode
  isFromAdmin?: boolean; // Indicates if called from admin dashboard
}

interface Medication {
  id: string;
  medicine_id?: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface VitalsData {
  pulseHeartRate: string;
  temperature: string;
  bloodPressure: string;
  diastolicBloodPressure: string;
  respiratoryRate: string;
  bloodSugar: string;
  weight: string;
  height: string;
  bmi: string;
  oxygenSaturation: string;
  bodySurfaceArea: string;
}

export function AddHealthRecord({ patientId, patientName = 'Test Khan', prescriptionId, mode = 'add', onBack, onEdit, isFromAdmin = false }: AddHealthRecordProps) {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  
  // Debug: Log when component receives isFromAdmin prop
  useEffect(() => {
    console.log('AddHealthRecord - isFromAdmin:', isFromAdmin, 'mode:', mode, 'prescriptionId:', prescriptionId);
  }, [isFromAdmin, mode, prescriptionId]);
  
  const [activeTab, setActiveTab] = useState('prescription');
  const [expansionMode, setExpansionMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(patientName);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch patient data when component loads
  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  // Fetch prescription data when in edit or view mode
  useEffect(() => {
    if (prescriptionId && (mode === 'edit' || mode === 'view')) {
      loadPrescriptionData();
    }
  }, [prescriptionId, mode]);

  // Fetch lab tests when component loads
  useEffect(() => {
    loadLabTests();
  }, []);

  // Fetch radiology tests when component loads
  useEffect(() => {
    loadRadiologyTests();
  }, []);

  // Fetch doctors when from admin
  useEffect(() => {
    if (isFromAdmin) {
      console.log('Loading doctors for admin...');
      loadDoctors();
    }
  }, [isFromAdmin]);

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      // Load all doctors, not just available ones, so admin can select any doctor
      const doctorsData = await api.getDoctors();
      console.log('Loaded doctors:', doctorsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setSaveError('Failed to load doctors. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadPatientData = async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      const patientData = await api.getPatient(patientId);
      setPatient(patientData);
      setSelectedPatient(patientData.name);
    } catch (error) {
      console.error('Error loading patient data:', error);
      // Fallback to props if API fails
      setPatient({
        id: parseInt(patientId) || 0,
        patient_id: patientId,
        name: patientName,
        age: 0,
        gender: 'Other' as 'Male' | 'Female' | 'Other',
        phone: '',
        status: 'Active',
        created_at: ''
      } as Patient);
    } finally {
      setLoading(false);
    }
  };

  // Use patient data or fallback to props
  const patientInfo = patient || {
    id: patientId ? parseInt(patientId) : 0,
    patient_id: patientId || '',
    name: patientName,
    age: 0,
    gender: 'Other' as 'Male' | 'Female' | 'Other',
    phone: '',
    status: 'Active',
    created_at: ''
  } as Patient;

  const loadPrescriptionData = async () => {
    if (!prescriptionId) return;
    
    try {
      setLoading(true);
      console.log('Loading prescription data for ID:', prescriptionId);
      const prescription = await api.getPrescription(prescriptionId);
      console.log('Loaded prescription:', prescription);
      
      // Populate form with prescription data
      if (prescription) {
        // Set form data
        setFormData({
          complaint: prescription.chief_complaint || '',
          diagnosis: prescription.diagnosis || '',
          examination: prescription.clinical_notes || '',
          clinicalNotes: prescription.clinical_notes || '',
          advice: prescription.advice || '',
          followUpDate: prescription.follow_up_date || '',
          recommendedFollowUpDate: prescription.follow_up_date || '',
          improvement: '',
          investigation: prescription.investigation || ''
        });

        // Set vitals
        setVitals({
          pulseHeartRate: prescription.vitals_pulse?.toString() || '',
          temperature: prescription.vitals_temperature?.toString() || '',
          bloodPressure: prescription.vitals_blood_pressure || '',
          diastolicBloodPressure: '',
          respiratoryRate: prescription.vitals_respiratory_rate?.toString() || '',
          bloodSugar: prescription.vitals_blood_sugar || '',
          weight: prescription.vitals_weight || '',
          height: prescription.vitals_height || '',
          bmi: prescription.vitals_bmi || '',
          oxygenSaturation: prescription.vitals_oxygen_saturation?.toString() || '',
          bodySurfaceArea: prescription.vitals_body_surface_area || ''
        });

        // Set medications
        if (prescription.medicines && prescription.medicines.length > 0) {
          const meds = prescription.medicines.map((med, index) => ({
            id: `med-${Date.now()}-${index}`,
            medicine_id: med.medicine_id,
            name: med.medicine_name || '',
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            duration: med.duration || '',
            instructions: med.instructions || ''
          }));
          console.log('Setting medications:', meds);
          setMedications(meds);
        } else {
          setMedications([]);
        }

        // Set lab tests
        if (prescription.lab_tests && prescription.lab_tests.length > 0) {
          const labTestIds = prescription.lab_tests
            .map(test => test.lab_test_id?.toString() || test.id?.toString() || '')
            .filter(id => id !== '');
          console.log('Setting lab tests:', labTestIds);
          setSelectedLabTests(labTestIds);
        } else {
          setSelectedLabTests([]);
        }

        // Set radiology data
        if (prescription.radiology_tests && Array.isArray(prescription.radiology_tests) && prescription.radiology_tests.length > 0) {
          const testIds = prescription.radiology_tests
            .map(test => test.radiology_test_id?.toString() || test.id?.toString() || '')
            .filter(id => id !== '');
          console.log('Setting radiology tests:', testIds);
          setSelectedRadiologyTests(testIds);
          
          // Set body part and indication from first test (or use a common field if available)
          const firstTest = prescription.radiology_tests[0];
          setRadiologyBodyPart(firstTest.body_part || '');
          setRadiologyIndication(firstTest.indication || '');
        } else {
          setSelectedRadiologyTests([]);
          setRadiologyBodyPart('');
          setRadiologyIndication('');
        }

        // Set selected doctor if from admin
        if (isFromAdmin && prescription.doctor_id) {
          setSelectedDoctorId(prescription.doctor_id);
        }
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      setSaveError('Failed to load prescription data');
    } finally {
      setLoading(false);
    }
  };

  const loadLabTests = async () => {
    try {
      setLabTestsLoading(true);
      const tests = await api.getLabTests({ status: 'Active' });
      setAllLabTests(tests);
    } catch (error) {
      console.error('Error loading lab tests:', error);
    } finally {
      setLabTestsLoading(false);
    }
  };

  const loadRadiologyTests = async () => {
    try {
      setRadiologyTestsLoading(true);
      const tests = await api.getRadiologyTests({ status: 'Active' });
      setAllRadiologyTests(tests);
    } catch (error) {
      console.error('Error loading radiology tests:', error);
    } finally {
      setRadiologyTestsLoading(false);
    }
  };

  // Get unique categories/specimen types from lab tests
  const getSpecimenTypes = () => {
    const categories = new Set<string>();
    allLabTests.forEach(test => {
      if (test.category) {
        categories.add(test.category);
      } else if (test.test_type) {
        categories.add(test.test_type);
      }
    });
    return Array.from(categories).sort();
  };

  // Filter lab tests by selected specimen type/category
  const getFilteredLabTests = () => {
    if (selectedSpecimenType === 'All' || !selectedSpecimenType) {
      return allLabTests;
    }
    return allLabTests.filter(test => 
      test.category === selectedSpecimenType || test.test_type === selectedSpecimenType
    );
  };

  // Handle lab test selection
  const handleLabTestSelect = (test: LabTest) => {
    if (isViewMode) return;
    const testId = test.id.toString();
    if (!selectedLabTests.includes(testId)) {
      setSelectedLabTests([...selectedLabTests, testId]);
    } else {
      setSelectedLabTests(selectedLabTests.filter(t => t !== testId));
    }
  };

  // Check if lab test is selected
  const isLabTestSelected = (testId: number) => {
    return selectedLabTests.includes(testId.toString());
  };

  const [formData, setFormData] = useState({
    complaint: '',
    examination: '',
    diagnosis: '',
    clinicalNotes: '',
    advice: '',
    investigation: '',
    followUpDate: '',
    improvement: '',
    recommendedFollowUpDate: ''
  });

  const [vitalsSubTab, setVitalsSubTab] = useState('details');

  const [vitals, setVitals] = useState<VitalsData>({
    pulseHeartRate: '',
    temperature: '',
    bloodPressure: '',
    diastolicBloodPressure: '',
    respiratoryRate: '',
    bloodSugar: '',
    weight: '',
    height: '',
    bmi: '',
    oxygenSaturation: '',
    bodySurfaceArea: ''
  });

  const [medications, setMedications] = useState<Medication[]>([]);

  const [labTests, setLabTests] = useState<string[]>([]);
  const [selectedRadiologyTests, setSelectedRadiologyTests] = useState<string[]>([]); // Array of test IDs
  const [allRadiologyTests, setAllRadiologyTests] = useState<RadiologyTest[]>([]);
  const [radiologyTestsLoading, setRadiologyTestsLoading] = useState(false);
  const [radiologyBodyPart, setRadiologyBodyPart] = useState('');
  const [radiologyIndication, setRadiologyIndication] = useState('');
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
  const [searchMultiple, setSearchMultiple] = useState('All');
  const [labOrderFilter, setLabOrderFilter] = useState('');
  const [priority, setPriority] = useState('');
  
  // Lab tests from API
  const [allLabTests, setAllLabTests] = useState<LabTest[]>([]);
  const [labTestsLoading, setLabTestsLoading] = useState(false);
  const [selectedSpecimenType, setSelectedSpecimenType] = useState<string>('All');
  
  // Save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Doctor selection (for admin)
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  
  // Medicine search states
  const [medicineSearchTerm, setMedicineSearchTerm] = useState<{ [key: string]: string }>({});
  const [medicineSearchResults, setMedicineSearchResults] = useState<{ [key: string]: Medicine[] }>({});
  const [showMedicineDropdown, setShowMedicineDropdown] = useState<{ [key: string]: boolean }>({});

  const handleInputChange = (field: string, value: string) => {
    if (isViewMode) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVitalsChange = (field: keyof VitalsData, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const addMedication = () => {
    const newMed: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    setMedications([...medications, newMed]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const updateMedication = (id: string, field: keyof Medication, value: string | number) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleMedicineSearch = async (medicationId: string, searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setMedicineSearchResults({ ...medicineSearchResults, [medicationId]: [] });
      setShowMedicineDropdown({ ...showMedicineDropdown, [medicationId]: false });
      return;
    }

    try {
      const results = await api.getMedicines({ search: searchTerm });
      setMedicineSearchResults({ ...medicineSearchResults, [medicationId]: results });
      setShowMedicineDropdown({ ...showMedicineDropdown, [medicationId]: true });
    } catch (error) {
      console.error('Error searching medicines:', error);
      setMedicineSearchResults({ ...medicineSearchResults, [medicationId]: [] });
    }
  };

  const selectMedicine = (medicationId: string, medicine: Medicine) => {
    // Update both name and medicine_id in a single state update using functional update
    setMedications(prevMedications => 
      prevMedications.map(med => 
        med.id === medicationId 
          ? { ...med, name: medicine.name, medicine_id: medicine.id }
          : med
      )
    );
    setMedicineSearchTerm(prev => ({ ...prev, [medicationId]: medicine.name }));
    setShowMedicineDropdown(prev => ({ ...prev, [medicationId]: false }));
  };

  const handleSave = async (saveAsDraft = false) => {
    if (!patientId) {
      setSaveError('Patient ID is required');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      // Get current user from localStorage
      const savedUser = localStorage.getItem('hms-user');
      if (!savedUser) {
        throw new Error('User not found. Please login again.');
      }
      const user: User = JSON.parse(savedUser);
      
      // Get doctor ID
      let doctorId: number;
      
      if (isFromAdmin) {
        // When from admin, use selected doctor
        if (!selectedDoctorId || selectedDoctorId === 0) {
          throw new Error('Please select a doctor');
        }
        doctorId = selectedDoctorId;
      } else {
        // When from doctor dashboard, use session doctor ID
        doctorId = user.doctor?.id || (typeof user.id === 'number' ? user.id : parseInt(user.id.toString()));
        if (!doctorId || doctorId === 0) {
          throw new Error('Doctor/User ID not found');
        }
      }

      // Ensure patient data is loaded
      let actualPatient: Patient | null = patient;
      if (!actualPatient || !actualPatient.id) {
        if (patientId) {
          actualPatient = await api.getPatient(patientId);
          setPatient(actualPatient);
        }
      }

      if (!actualPatient || !actualPatient.id) {
        throw new Error('Patient data not found. Please ensure the patient exists.');
      }

      // Prepare medications for API
      const prescriptionMedicines: PrescriptionMedicine[] = medications
        .filter(med => med.name.trim() !== '')
        .map(med => ({
          medicine_id: med.medicine_id,
          medicine_name: med.name,
          dosage: med.dosage || undefined,
          frequency: med.frequency || undefined,
          duration: med.duration || undefined,
          instructions: med.instructions || undefined
        }));

      // Prepare lab tests for API
      const prescriptionLabTests: PrescriptionLabTest[] = selectedLabTests
        .map(testId => {
          const test = allLabTests.find(t => t.id.toString() === testId);
          return test ? {
            lab_test_id: test.id,
            test_name: test.test_name,
            test_type: test.test_type || undefined,
            priority: (priority === 'urgent' ? 'Urgent' : priority === 'stat' ? 'Emergency' : 'Normal') as 'Normal' | 'Urgent' | 'Emergency'
          } : null;
        })
        .filter((test): test is PrescriptionLabTest => test !== null);

      // Prepare radiology tests for API
      const prescriptionRadiologyTests: PrescriptionRadiologyTest[] = selectedRadiologyTests
        .map(testId => {
          const test = allRadiologyTests.find(t => t.id.toString() === testId);
          return test ? {
            radiology_test_id: test.id,
            test_name: test.test_name,
            test_type: test.test_type || undefined,
            body_part: radiologyBodyPart || undefined,
            indication: radiologyIndication || undefined,
            priority: (priority === 'urgent' ? 'Urgent' : priority === 'stat' ? 'Emergency' : 'Normal') as 'Normal' | 'Urgent' | 'Emergency'
          } : null;
        })
        .filter((test): test is PrescriptionRadiologyTest => test !== null);

      // Prepare prescription/health record data
      const prescriptionData: CreatePrescriptionData = {
        patient_id: actualPatient.id,
        doctor_id: doctorId,
        chief_complaint: formData.complaint || undefined,
        diagnosis: formData.diagnosis || undefined,
        clinical_notes: formData.clinicalNotes || formData.examination || undefined,
        advice: formData.advice || undefined,
        follow_up_date: formData.followUpDate || formData.recommendedFollowUpDate || undefined,
        medicines: prescriptionMedicines.length > 0 ? prescriptionMedicines : undefined,
        lab_tests: prescriptionLabTests.length > 0 ? prescriptionLabTests : undefined,
        status: saveAsDraft ? 'Draft' : 'Active',
        // Add vitals data
        vitals_pulse: vitals.pulseHeartRate ? parseInt(vitals.pulseHeartRate) : undefined,
        vitals_temperature: vitals.temperature ? parseFloat(vitals.temperature) : undefined,
        vitals_blood_pressure: vitals.bloodPressure || undefined,
        vitals_respiratory_rate: vitals.respiratoryRate ? parseInt(vitals.respiratoryRate) : undefined,
        vitals_blood_sugar: vitals.bloodSugar || undefined,
        vitals_weight: vitals.weight || undefined,
        vitals_height: vitals.height || undefined,
        vitals_bmi: vitals.bmi || undefined,
        vitals_oxygen_saturation: vitals.oxygenSaturation ? parseInt(vitals.oxygenSaturation) : undefined,
        vitals_body_surface_area: vitals.bodySurfaceArea || undefined,
        radiology_tests: prescriptionRadiologyTests.length > 0 ? prescriptionRadiologyTests : undefined,
        investigation: formData.investigation || undefined,
      };

      // Save or update prescription/health record
      if (isEditMode && prescriptionId) {
        // Update existing prescription
        await api.updatePrescription(prescriptionId, prescriptionData);
        setSaveSuccess(true);
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        // Create new prescription
        const createdPrescription = await api.createPrescription(prescriptionData);
        setSaveSuccess(true);
        setTimeout(() => {
          onBack();
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('Error saving health record:', error);
      setSaveError(error.message || 'Failed to save health record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPrint = async () => {
    await handleSave(false);
    // Wait a bit for save to complete, then print
    setTimeout(() => {
    window.print();
    }, 500);
  };

  // Show loading state while fetching prescription data
  if (loading && (isEditMode || isViewMode) && prescriptionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading health record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <h1 className="text-lg text-gray-900">
                  {isViewMode ? 'View Health Record' : isEditMode ? 'Edit Health Record' : 'Add Health Record'}
                </h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {patientInfo.patient_id || patientInfo.id}
                </Badge>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserIcon className="w-4 h-4" />
                  <span className="font-medium">{patientInfo.name}</span>
                  {patientInfo.gender && (
                    <>
                  <span>•</span>
                      <span>{patientInfo.gender}</span>
                    </>
                  )}
                  {patientInfo.age > 0 && (
                    <>
                  <span>•</span>
                      <span>{patientInfo.age} years</span>
                    </>
                  )}
                  {patientInfo.phone && (
                    <>
                  <span>•</span>
                      <span>📞 {patientInfo.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View All Records
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy Last
              </Button>
            </div>
          </div>

          {/* Patient Search & Date */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search patient..."
                className="pl-10"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>

            {/* Doctor Selection (only for admin) */}
            {isFromAdmin && (
              <div className="w-64 min-w-[256px]">
                <label className="text-xs text-gray-600 mb-1 block">Select Doctor *</label>
                <Select
                  value={selectedDoctorId?.toString() || ''}
                  onValueChange={(value) => setSelectedDoctorId(parseInt(value))}
                  disabled={loadingDoctors || doctors.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : doctors.length === 0 ? "No doctors available" : "Select Doctor *"} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No doctors available</div>
                    ) : (
                      doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                            <span>{doctor.name}</span>
                            {doctor.specialty && (
                              <span className="text-xs text-gray-500">({doctor.specialty})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{new Date().toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {/* Note: Allergies would need to be added to Patient interface or fetched separately */}
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Form */}
          <div className="col-span-12 lg:col-span-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                {/* Tab Navigation */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between">
                      <TabsList className="bg-gray-100">
                        <TabsTrigger value="prescription" className="flex items-center gap-2">
                          <Pill className="w-4 h-4" />
                          Prescription
                        </TabsTrigger>
                        <TabsTrigger value="vitals" className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Vitals
                        </TabsTrigger>
                        <TabsTrigger value="lab" className="flex items-center gap-2">
                          <FlaskConical className="w-4 h-4" />
                          Lab Order
                        </TabsTrigger>
                        <TabsTrigger value="radiology" className="flex items-center gap-2">
                          <Scan className="w-4 h-4" />
                          Radiology
                        </TabsTrigger>
                        <TabsTrigger value="investigation" className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4" />
                          Investigation
                        </TabsTrigger>
                      </TabsList>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Expansion Mode</span>
                        <Switch checked={expansionMode} onCheckedChange={setExpansionMode} />
                      </div>
                    </div>

                    {/* Prescription Tab */}
                    <TabsContent value="prescription" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900">Medical History</h3>

                        {/* Chief Complaint */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-700">Chief Complaint *</label>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Assist
                            </Button>
                          </div>
                          <Textarea
                            value={formData.complaint}
                            onChange={(e) => handleInputChange('complaint', e.target.value)}
                            placeholder="Describe the patient's main complaint..."
                            className="min-h-[100px] resize-none"
                            disabled={isViewMode}
                            readOnly={isViewMode}
                          />
                        </div>

                        {/* Physical Examination */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-700">Physical Examination</label>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Assist
                            </Button>
                          </div>
                          <Textarea
                            value={formData.examination}
                            onChange={(e) => handleInputChange('examination', e.target.value)}
                            placeholder="Enter examination findings..."
                            className="min-h-[100px] resize-none"
                          />
                        </div>

                        {/* Diagnosis */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-700">Diagnosis *</label>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Assist
                            </Button>
                          </div>
                          <Textarea
                            value={formData.diagnosis}
                            onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                            placeholder="Enter diagnosis..."
                            className="min-h-[100px] resize-none"
                            disabled={isViewMode}
                            readOnly={isViewMode}
                          />
                        </div>

                        {/* Clinical Notes */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-700">Clinical Notes</label>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Assist
                            </Button>
                          </div>
                          <Textarea
                            value={formData.clinicalNotes}
                            onChange={(e) => handleInputChange('clinicalNotes', e.target.value)}
                            placeholder="Additional clinical notes..."
                            className="min-h-[80px] resize-none"
                            disabled={isViewMode}
                            readOnly={isViewMode}
                          />
                        </div>

                        {/* Advice/Recommendations */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-700">Advice & Recommendations</label>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Assist
                            </Button>
                          </div>
                          <Textarea
                            value={formData.advice}
                            onChange={(e) => handleInputChange('advice', e.target.value)}
                            placeholder="Lifestyle recommendations, diet advice, etc..."
                            className="min-h-[80px] resize-none"
                            disabled={isViewMode}
                            readOnly={isViewMode}
                          />
                        </div>

                        <Separator />

                        {/* Medications Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-900">Prescription Medications</h4>
                            <Button 
                              onClick={addMedication} 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={isViewMode}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Medication
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {medications.map((med, index) => (
                              <Card key={med.id} className="border border-gray-200">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">Medication {index + 1}</span>
                                    {!isViewMode && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMedication(med.id)}
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                      <label className="text-xs text-gray-600 mb-1 block">Drug Name *</label>
                                      <div className="relative">
                                      <Input
                                          value={medicineSearchTerm[med.id] || med.name}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            updateMedication(med.id, 'name', value);
                                            setMedicineSearchTerm({ ...medicineSearchTerm, [med.id]: value });
                                            handleMedicineSearch(med.id, value);
                                          }}
                                          onFocus={() => {
                                            if (medicineSearchTerm[med.id] || med.name) {
                                              handleMedicineSearch(med.id, medicineSearchTerm[med.id] || med.name);
                                            }
                                          }}
                                          onBlur={() => {
                                            // Delay to allow click on dropdown item
                                            setTimeout(() => {
                                              setShowMedicineDropdown({ ...showMedicineDropdown, [med.id]: false });
                                            }, 200);
                                          }}
                                          placeholder="Search or type medicine name..."
                                        />
                                        {showMedicineDropdown[med.id] && medicineSearchResults[med.id] && medicineSearchResults[med.id].length > 0 && (
                                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {medicineSearchResults[med.id].map((medicine) => (
                                              <div
                                                key={medicine.id}
                                                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                                onMouseDown={(e) => {
                                                  e.preventDefault();
                                                  selectMedicine(med.id, medicine);
                                                }}
                                              >
                                                <div className="font-medium text-sm">{medicine.name}</div>
                                                {medicine.generic_name && (
                                                  <div className="text-xs text-gray-500">Generic: {medicine.generic_name}</div>
                                                )}
                                                {medicine.strength && (
                                                  <div className="text-xs text-gray-500">Strength: {medicine.strength}</div>
                                                )}
                                                <div className="text-xs text-gray-400">Code: {medicine.medicine_code}</div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      {med.medicine_id && (
                                        <Badge variant="outline" className="mt-1 text-xs">
                                          From Inventory
                                        </Badge>
                                      )}
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600 mb-1 block">Dosage</label>
                                      <Input
                                        value={med.dosage}
                                        onChange={(e) => !isViewMode && updateMedication(med.id, 'dosage', e.target.value)}
                                        placeholder="e.g., 500mg"
                                        disabled={isViewMode}
                                        readOnly={isViewMode}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600 mb-1 block">Frequency</label>
                                      <Select
                                        value={med.frequency}
                                        onValueChange={(value) => !isViewMode && updateMedication(med.id, 'frequency', value)}
                                        disabled={isViewMode}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Once daily">Once daily</SelectItem>
                                          <SelectItem value="Twice daily">Twice daily</SelectItem>
                                          <SelectItem value="Three times daily">Three times daily</SelectItem>
                                          <SelectItem value="Four times daily">Four times daily</SelectItem>
                                          <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                                          <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                                          <SelectItem value="As needed">As needed</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600 mb-1 block">Duration</label>
                                      <Input
                                        value={med.duration}
                                        onChange={(e) => !isViewMode && updateMedication(med.id, 'duration', e.target.value)}
                                        placeholder="e.g., 7 days"
                                        disabled={isViewMode}
                                        readOnly={isViewMode}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600 mb-1 block">Instructions</label>
                                      <Input
                                        value={med.instructions}
                                        onChange={(e) => !isViewMode && updateMedication(med.id, 'instructions', e.target.value)}
                                        placeholder="e.g., After meals"
                                        disabled={isViewMode}
                                        readOnly={isViewMode}
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Follow-up */}
                        <div>
                          <label className="text-sm text-gray-700 mb-2 block">Follow-up Date</label>
                          <Input
                            type="date"
                            value={formData.followUpDate}
                            onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                            className="max-w-xs"
                            disabled={isViewMode}
                            readOnly={isViewMode}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Vitals Tab */}
                    <TabsContent value="vitals" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        {/* Details and Charts Sub-tabs */}
                        <div className="flex items-center gap-4 border-b border-gray-200">
                          <button
                            onClick={() => setVitalsSubTab('details')}
                            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                              vitalsSubTab === 'details'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Details
                          </button>
                          <button
                            onClick={() => setVitalsSubTab('charts')}
                            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                              vitalsSubTab === 'charts'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Charts
                          </button>
                        </div>

                        {vitalsSubTab === 'details' ? (
                          <div className="space-y-6">
                            {/* Row 1 */}
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Pulse heart rate</label>
                                <Input
                                  type="number"
                                  value={vitals.pulseHeartRate}
                                  onChange={(e) => handleVitalsChange('pulseHeartRate', e.target.value)}
                                  placeholder=""
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">
                                  Temperature <span className="text-blue-600">°C To °F</span>
                                </label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={vitals.temperature}
                                  onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                                  placeholder=""
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Blood pressure</label>
                                <Input
                                  value={vitals.bloodPressure}
                                  onChange={(e) => handleVitalsChange('bloodPressure', e.target.value)}
                                  placeholder=""
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Diastolic Blood Pressure</label>
                                <Input
                                  value={vitals.diastolicBloodPressure}
                                  onChange={(e) => handleVitalsChange('diastolicBloodPressure', e.target.value)}
                                  placeholder=""
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Respiratory rate</label>
                                <Input
                                  type="number"
                                  value={vitals.respiratoryRate}
                                  onChange={(e) => handleVitalsChange('respiratoryRate', e.target.value)}
                                  placeholder=""
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Blood sugar</label>
                                <Input
                                  type="number"
                                  value={vitals.bloodSugar}
                                  onChange={(e) => handleVitalsChange('bloodSugar', e.target.value)}
                                  placeholder=""
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">
                                  Weight <span className="text-gray-500">is kg e.g 76</span>
                                </label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={vitals.weight}
                                  onChange={(e) => handleVitalsChange('weight', e.target.value)}
                                  placeholder=""
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">
                                  Height <span className="text-blue-600">Feet To Cm</span>
                                </label>
                                <Input
                                  type="number"
                                  value={vitals.height}
                                  onChange={(e) => handleVitalsChange('height', e.target.value)}
                                  placeholder=""
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Body Mass Index (BMI)</label>
                                <Input
                                  value={vitals.bmi}
                                  onChange={(e) => handleVitalsChange('bmi', e.target.value)}
                                  placeholder=""
                                  className="bg-gray-50"
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Oxygen Saturation</label>
                                <Input
                                  type="number"
                                  value={vitals.oxygenSaturation}
                                  onChange={(e) => handleVitalsChange('oxygenSaturation', e.target.value)}
                                  placeholder=""
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Body Surface Area (BSA)</label>
                                <Input
                                  value={vitals.bodySurfaceArea}
                                  onChange={(e) => handleVitalsChange('bodySurfaceArea', e.target.value)}
                                  placeholder=""
                                  className="bg-gray-50"
                                  disabled={isViewMode}
                                  readOnly={isViewMode}
                                />
                              </div>
                            </div>

                            {/* Note */}
                            <p className="text-xs text-gray-500">
                              Note: Vitals can be edited from Preferences-&gt;Health Record template
                            </p>

                            <Separator />

                            {/* Improvement and Follow-up */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Improvement</label>
                                <Select
                                  value={formData.improvement}
                                  onValueChange={(value) => handleInputChange('improvement', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Improvement" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="improved">Improved</SelectItem>
                                    <SelectItem value="stable">Stable</SelectItem>
                                    <SelectItem value="worsened">Worsened</SelectItem>
                                    <SelectItem value="no-change">No Change</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Recommended Follow-up Appointment Date</label>
                                <Input
                                  type="date"
                                  value={formData.recommendedFollowUpDate}
                                  onChange={(e) => handleInputChange('recommendedFollowUpDate', e.target.value)}
                                />
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="py-12 text-center">
                            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Charts view coming soon</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Lab Order Tab */}
                    <TabsContent value="lab" className="mt-6 space-y-4">
                      <div className="space-y-4">
                        {/* Top Filter Row */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-sm text-gray-700 mb-2 block">Search Multiple</label>
                            <Select value={searchMultiple} onValueChange={setSearchMultiple} disabled={isViewMode}>
                              <SelectTrigger>
                                <SelectValue placeholder="All" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="Blood">Blood</SelectItem>
                                <SelectItem value="Urine">Urine</SelectItem>
                                <SelectItem value="Serum">Serum</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-700 mb-2 block">Select Lab Orders</label>
                            <Select value={labOrderFilter} onValueChange={setLabOrderFilter} disabled={isViewMode}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Lab Orders" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="routine">Routine Tests</SelectItem>
                                <SelectItem value="urgent">Urgent Tests</SelectItem>
                                <SelectItem value="custom">Custom Tests</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-700 mb-2 block">Select Priority</label>
                            <Select value={priority} onValueChange={setPriority} disabled={isViewMode}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="routine">Routine</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="stat">STAT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Selected Tests */}
                        {selectedLabTests.length > 0 && (
                          <div className="border border-gray-200 rounded-lg p-3">
                            <div className="flex flex-wrap gap-2">
                              {selectedLabTests.map((testId) => {
                                const test = allLabTests.find(t => t.id.toString() === testId);
                                return test ? (
                                <Badge
                                    key={testId}
                                  variant="secondary"
                                  className="bg-gray-100 text-gray-700 px-3 py-1 flex items-center gap-2"
                                >
                                    {test.test_name}
                                    {!isViewMode && (
                                  <button
                                        onClick={() => setSelectedLabTests(selectedLabTests.filter(t => t !== testId))}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                    )}
                                </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Main Lab Tests Section */}
                        <div className="grid grid-cols-12 gap-4">
                          {/* Left Sidebar - Specimen Types */}
                          <div className="col-span-3 space-y-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900">Categories</h4>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  className="rounded"
                                  checked={getFilteredLabTests().length > 0 && getFilteredLabTests().every(test => isLabTestSelected(test.id))}
                                  onChange={(e) => {
                                    if (isViewMode) return;
                                    if (e.target.checked) {
                                      const allTestIds = getFilteredLabTests().map(test => test.id.toString());
                                      setSelectedLabTests([...new Set([...selectedLabTests, ...allTestIds])]);
                                    } else {
                                      const filteredTestIds = getFilteredLabTests().map(test => test.id.toString());
                                      setSelectedLabTests(selectedLabTests.filter(id => !filteredTestIds.includes(id)));
                                    }
                                  }}
                                  disabled={isViewMode}
                                />
                                <span className="text-xs text-blue-600">Select All</span>
                              </div>
                            </div>
                            
                            {labTestsLoading ? (
                              <div className="text-sm text-gray-500 py-4">Loading categories...</div>
                            ) : (
                              <>
                                <button
                                  onClick={() => !isViewMode && setSelectedSpecimenType('All')}
                                  disabled={isViewMode}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                    selectedSpecimenType === 'All' 
                                      ? 'bg-blue-100 text-blue-700 font-medium' 
                                      : 'text-gray-700 hover:bg-gray-100'
                                  } ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  All
                                </button>
                                {getSpecimenTypes().map((specimen) => (
                              <button
                                key={specimen}
                                    onClick={() => !isViewMode && setSelectedSpecimenType(specimen)}
                                    disabled={isViewMode}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                      selectedSpecimenType === specimen 
                                        ? 'bg-blue-100 text-blue-700 font-medium' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                    } ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {specimen}
                              </button>
                            ))}
                              </>
                            )}
                          </div>

                          {/* Right Side - Test Buttons */}
                          <div className="col-span-9 border-l border-gray-200 pl-4">
                            {labTestsLoading ? (
                              <div className="text-center py-12 text-gray-500">Loading lab tests...</div>
                            ) : getFilteredLabTests().length === 0 ? (
                              <div className="text-center py-12 text-gray-500">No lab tests found</div>
                            ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {getFilteredLabTests().map((test) => (
                                  <Button
                                    key={test.id}
                                    className={`w-full justify-start text-sm h-9 ${
                                      isLabTestSelected(test.id)
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } ${isViewMode ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    onClick={() => !isViewMode && handleLabTestSelect(test)}
                                    disabled={isViewMode}
                                  >
                                    {test.test_name}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Radiology Tab */}
                    <TabsContent value="radiology" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">Radiology/Imaging Tests</h3>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Test
                          </Button>
                        </div>

                        {radiologyTestsLoading ? (
                          <div className="text-center py-12 text-gray-500">Loading radiology tests...</div>
                        ) : allRadiologyTests.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">No radiology tests available</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {allRadiologyTests.map((test) => (
                              <label key={test.id} className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 ${isViewMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input 
                                  type="checkbox" 
                                  className="rounded"
                                  checked={selectedRadiologyTests.includes(test.id.toString())}
                                  onChange={(e) => {
                                    if (isViewMode) return;
                                    if (e.target.checked) {
                                      setSelectedRadiologyTests([...selectedRadiologyTests, test.id.toString()]);
                                    } else {
                                      setSelectedRadiologyTests(selectedRadiologyTests.filter(t => t !== test.id.toString()));
                                    }
                                  }}
                                  disabled={isViewMode}
                                />
                                <span className="text-sm text-gray-700">{test.test_name}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        <div>
                          <label className="text-sm text-gray-700 mb-2 block">Body Part/Region</label>
                          <Input 
                            placeholder="e.g., Chest, Abdomen, Brain"
                            value={radiologyBodyPart}
                            onChange={(e) => !isViewMode && setRadiologyBodyPart(e.target.value)}
                            disabled={isViewMode}
                            readOnly={isViewMode}
                          />
                        </div>

                        <div>
                          <label className="text-sm text-gray-700 mb-2 block">Clinical Indication</label>
                          <Textarea
                            placeholder="Reason for imaging..."
                            className="min-h-[80px] resize-none"
                            value={radiologyIndication}
                            onChange={(e) => !isViewMode && setRadiologyIndication(e.target.value)}
                            disabled={isViewMode}
                            readOnly={isViewMode}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Investigation Tab */}
                    <TabsContent value="investigation" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900">Additional Investigations</h3>

                        <div>
                          <label className="text-sm text-gray-700 mb-2 block">Investigation Details</label>
                          <Textarea
                            value={formData.investigation}
                            onChange={(e) => handleInputChange('investigation', e.target.value)}
                            placeholder="Enter any additional investigation details..."
                            className="min-h-[120px] resize-none"
                            disabled={isViewMode}
                            readOnly={isViewMode}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Summary */}
          <div className="col-span-12 lg:col-span-4">
            <Card className="border-0 shadow-sm sticky top-24">
              <CardHeader className="pb-3 border-b border-gray-200">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Summary</span>
                  <Badge variant="outline" className="text-xs">Draft</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-4 space-y-4">
                    {/* Patient Info */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase">Patient Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID:</span>
                          <span className="text-gray-900">{patientInfo.patient_id || patientInfo.id}</span>
                        </div>
                        {patientInfo.blood_group && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Blood Type:</span>
                            <span className="text-gray-900">{patientInfo.blood_group}</span>
                        </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Medications Summary */}
                    {medications.length > 0 && (
                      <>
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-gray-500 uppercase flex items-center justify-between">
                            <span>Medications ({medications.length})</span>
                            <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                              View All
                            </Button>
                          </h4>
                          <div className="space-y-2">
                            {medications.slice(0, 3).map((med) => (
                              <div key={med.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{med.name || 'Unnamed medication'}</p>
                                    {med.dosage && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        {med.dosage} • {med.frequency || 'Frequency not set'}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeMedication(med.id)}>
                                      <Trash2 className="w-3 h-3 text-red-600" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Vitals Summary */}
                    {Object.values(vitals).some(v => v) && (
                      <>
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-gray-500 uppercase">Vital Signs</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {vitals.temperature && (
                              <div className="p-2 bg-gray-50 rounded">
                                <span className="text-gray-600">Temp:</span>
                                <span className="text-gray-900 ml-1">{vitals.temperature}°C</span>
                              </div>
                            )}
                            {vitals.bloodPressure && (
                              <div className="p-2 bg-gray-50 rounded">
                                <span className="text-gray-600">BP:</span>
                                <span className="text-gray-900 ml-1">{vitals.bloodPressure}</span>
                              </div>
                            )}
                            {vitals.pulseHeartRate && (
                              <div className="p-2 bg-gray-50 rounded">
                                <span className="text-gray-600">Pulse:</span>
                                <span className="text-gray-900 ml-1">{vitals.pulseHeartRate} bpm</span>
                              </div>
                            )}
                            {vitals.oxygenSaturation && (
                              <div className="p-2 bg-gray-50 rounded">
                                <span className="text-gray-600">SpO2:</span>
                                <span className="text-gray-900 ml-1">{vitals.oxygenSaturation}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase">Quick Actions</h4>
                      <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start text-sm h-9" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Add Template
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm h-9" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy from Previous
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm h-9" size="sm">
                          <Printer className="w-4 h-4 mr-2" />
                          Print Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Button variant="outline" onClick={onBack}>
              {isViewMode ? 'Back' : 'Cancel'}
            </Button>
            <div className="flex items-center gap-3">
              {saveError && (
                <div className="text-sm text-red-600 mr-4">{saveError}</div>
              )}
              {saveSuccess && (
                <div className="text-sm text-green-600 mr-4">
                  {isEditMode ? 'Health record updated successfully!' : 'Health record saved successfully!'}
                </div>
              )}
              {isViewMode ? (
                <>
                  <Button 
                    onClick={() => {
                      // Switch to edit mode
                      if (onEdit) {
                        onEdit();
                      } else {
                        onBack();
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => window.print()} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSave(true)}
                    disabled={saving}
                  >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
                  <Button 
                    onClick={handleSaveAndPrint} 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={saving}
                  >
                <Printer className="w-4 h-4 mr-2" />
                Save & Print
              </Button>
                  <Button 
                    onClick={() => handleSave(false)} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={saving}
                  >
                <Save className="w-4 h-4 mr-2" />
                    {saving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Health Record' : 'Save Health Record')}
              </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
