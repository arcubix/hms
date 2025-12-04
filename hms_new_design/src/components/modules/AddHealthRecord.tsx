import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  User,
  Syringe,
  TestTube,
  Image as ImageIcon,
  UserCheck,
  MoreVertical
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface AddHealthRecordProps {
  patientId?: string;
  patientName?: string;
  onBack: () => void;
}

interface Medication {
  id: string;
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

export function AddHealthRecord({ patientId, patientName = 'Test Khan', onBack }: AddHealthRecordProps) {
  const [activeTab, setActiveTab] = useState('prescription');
  const [expansionMode, setExpansionMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(patientName);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateTab, setTemplateTab] = useState('treatment');
  const [summaryTab, setSummaryTab] = useState('drugs');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateFormData, setTemplateFormData] = useState({
    templateName: '',
    medicalHistory: '',
    complaint: '',
    examination: '',
    diagnosis: '',
    clinicalNotes: '',
    advice: '',
    investigation: '',
    medications: [
      { name: '', duration: '1', dose: '2', route: 'oral', frequency: 'once', instructions: 'before-breakfast' }
    ]
  });

  const patient = {
    id: '100004',
    name: 'Test Khan',
    gender: 'Male',
    age: '22 years, 1 months, 4 days old',
    phone: '3331235697',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Aspirin']
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
  const [eyeSightSubTab, setEyeSightSubTab] = useState('details');
  
  const [disposition, setDisposition] = useState({
    type: '',
    note: '',
    referDoctor: '',
    improvement: '',
    followUpDate: ''
  });

  const [eyeSight, setEyeSight] = useState({
    visualAcuity: {
      right: { unaided: '', ih: '' },
      left: { unaided: '', ih: '' }
    },
    iop: {
      right: { right: '', pd: '' },
      left: { right: '', pd: '' }
    },
    prescription: {
      right: {
        distance: { sph: '', cyl: '', axis: '', va: '' },
        near: { sph: '', cyl: '', axis: '', va: '' },
        intermediate: { sph: '', cyl: '', axis: '', va: '' }
      },
      left: {
        distance: { sph: '', cyl: '', axis: '', va: '' },
        near: { sph: '', cyl: '', axis: '', va: '' },
        intermediate: { sph: '', cyl: '', axis: '', va: '' }
      }
    },
    iolCalculation: {
      right: { r1: '', k2: '', ac: '', iolPower: '', al: '', sd: '' },
      left: { r1: '', k2: '', ac: '', iolPower: '', al: '', sd: '' }
    },
    remarks: ''
  });

  // Helper function to safely update eyeSight nested state
  const updateEyeSight = (path: string[], value: string) => {
    setEyeSight(prev => {
      const newState = { ...prev };
      let current: any = newState;
      
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return newState;
    });
  };

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

  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'ABC tab 33 mg',
      dosage: '33mg',
      frequency: 'Twice daily',
      duration: '7 days',
      instructions: 'Take after meals'
    },
    {
      id: '2',
      name: 'Panadol cap 2 ml',
      dosage: '2ml',
      frequency: 'Three times daily',
      duration: '5 days',
      instructions: 'Take with water'
    }
  ]);

  const [labTests, setLabTests] = useState<string[]>([]);
  const [radiologyTests, setRadiologyTests] = useState<string[]>([]);
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>(['montoux test (test)', 'colour', 'liquification time', 'color (semen)', 'motility', 'parasite', 'volume (semen)', 'rbc (semen)', 'result', 'viscosity', 'culture (semen)', 'total sperm count', 'ph (semen)', 'antibiotic sensitivity (semen)']);
  const [searchMultiple, setSearchMultiple] = useState('All');
  const [labOrderFilter, setLabOrderFilter] = useState('');
  const [priority, setPriority] = useState('');

  const handleInputChange = (field: string, value: string) => {
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

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleSave = () => {
    console.log('Saving health record...', { formData, vitals, medications, labTests, radiologyTests });
    // Save logic here
  };

  const handleSaveAndPrint = () => {
    handleSave();
    window.print();
  };

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
                <h1 className="text-lg text-gray-900">Add Health Record</h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {patient.id}
                </Badge>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{patient.name}</span>
                  <span>•</span>
                  <span>{patient.gender}</span>
                  <span>•</span>
                  <span>{patient.age}</span>
                  <span>•</span>
                  <span>📞 {patient.phone}</span>
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
          <div className="flex items-center gap-3">
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
        {patient.allergies.length > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm text-red-900">
                    <span className="font-medium">Allergies Alert:</span> {patient.allergies.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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
                        <TabsTrigger value="disposition" className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          Disposition
                        </TabsTrigger>
                        <TabsTrigger value="eyesight" className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Eye Sight
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
                          />
                        </div>

                        <Separator />

                        {/* Medications Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-900">Prescription Medications</h4>
                            <Button onClick={addMedication} size="sm" className="bg-blue-600 hover:bg-blue-700">
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
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMedication(med.id)}
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                      <label className="text-xs text-gray-600 mb-1 block">Drug Name *</label>
                                      <Input
                                        value={med.name}
                                        onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                                        placeholder="Enter medication name"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600 mb-1 block">Dosage</label>
                                      <Input
                                        value={med.dosage}
                                        onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                                        placeholder="e.g., 500mg"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600 mb-1 block">Frequency</label>
                                      <Select
                                        value={med.frequency}
                                        onValueChange={(value) => updateMedication(med.id, 'frequency', value)}
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
                                        onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                                        placeholder="e.g., 7 days"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600 mb-1 block">Instructions</label>
                                      <Input
                                        value={med.instructions}
                                        onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                                        placeholder="e.g., After meals"
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
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Blood pressure</label>
                                <Input
                                  value={vitals.bloodPressure}
                                  onChange={(e) => handleVitalsChange('bloodPressure', e.target.value)}
                                  placeholder=""
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Diastolic Blood Pressure</label>
                                <Input
                                  value={vitals.diastolicBloodPressure}
                                  onChange={(e) => handleVitalsChange('diastolicBloodPressure', e.target.value)}
                                  placeholder=""
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
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Blood sugar</label>
                                <Input
                                  type="number"
                                  value={vitals.bloodSugar}
                                  onChange={(e) => handleVitalsChange('bloodSugar', e.target.value)}
                                  placeholder=""
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
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Oxygen Saturation</label>
                                <Input
                                  type="number"
                                  value={vitals.oxygenSaturation}
                                  onChange={(e) => handleVitalsChange('oxygenSaturation', e.target.value)}
                                  placeholder=""
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Body Surface Area (BSA)</label>
                                <Input
                                  value={vitals.bodySurfaceArea}
                                  onChange={(e) => handleVitalsChange('bodySurfaceArea', e.target.value)}
                                  placeholder=""
                                  className="bg-gray-50"
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

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4">
                              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                <FileText className="w-4 h-4 mr-2" />
                                Print Settings
                              </Button>
                              <div className="flex gap-2">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save & Print
                                </Button>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
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

                    {/* Disposition Tab */}
                    <TabsContent value="disposition" className="mt-6 space-y-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-700 mb-2 block">Disposition Type</label>
                            <Select
                              value={disposition.type}
                              onValueChange={(value) => setDisposition({ ...disposition, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Refer to another doctor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="refer-doctor">Refer to another doctor</SelectItem>
                                <SelectItem value="discharge">Discharge</SelectItem>
                                <SelectItem value="admit">Admit</SelectItem>
                                <SelectItem value="transfer">Transfer</SelectItem>
                                <SelectItem value="follow-up">Follow-up</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-700 mb-2 block">Select Doctor</label>
                            <Select
                              value={disposition.referDoctor}
                              onValueChange={(value) => setDisposition({ ...disposition, referDoctor: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Dr Adeel Arif" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dr-adeel">Dr Adeel Arif</SelectItem>
                                <SelectItem value="dr-sarah">Dr Sarah Ahmed</SelectItem>
                                <SelectItem value="dr-khan">Dr Khan</SelectItem>
                                <SelectItem value="dr-ali">Dr Ali Hassan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-700 mb-2 block">Disposition Note</label>
                          <Textarea
                            value={disposition.note}
                            onChange={(e) => setDisposition({ ...disposition, note: e.target.value })}
                            placeholder="testtest"
                            className="min-h-[100px]"
                          />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-700 mb-2 block">Improvement</label>
                            <Select
                              value={disposition.improvement}
                              onValueChange={(value) => setDisposition({ ...disposition, improvement: value })}
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
                              value={disposition.followUpDate}
                              onChange={(e) => setDisposition({ ...disposition, followUpDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                            <FileText className="w-4 h-4 mr-2" />
                            Print Settings
                          </Button>
                          <div className="flex gap-2">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Save className="w-4 h-4 mr-2" />
                              Save & Print
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Eye Sight Tab */}
                    <TabsContent value="eyesight" className="mt-6 space-y-6">
                      <div className="space-y-6">
                        {/* Details and Eye Exam Sub-tabs */}
                        <div className="flex items-center gap-4 border-b border-gray-200">
                          <button
                            onClick={() => setEyeSightSubTab('details')}
                            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                              eyeSightSubTab === 'details'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Details
                          </button>
                          <button
                            onClick={() => setEyeSightSubTab('eyeexam')}
                            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                              eyeSightSubTab === 'eyeexam'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Eye Exam
                          </button>
                        </div>

                        {eyeSightSubTab === 'details' ? (
                          <div className="space-y-6">
                            {/* Visual Acuity Section */}
                            <div>
                              <div className="bg-gray-200 p-2 mb-2">
                                <h3 className="text-sm uppercase">VISUAL ACUITY</h3>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="bg-gray-100 p-2 mb-2 text-center">
                                    <span className="text-sm">RIGHT</span>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm text-gray-700 mb-1 block">Unaided / Present</label>
                                      <Input
                                        value={eyeSight.visualAcuity.right.unaided || ''}
                                        onChange={(e) => updateEyeSight(['visualAcuity', 'right', 'unaided'], e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm text-gray-700 mb-1 block">IH</label>
                                      <Input
                                        value={eyeSight.visualAcuity.right.ih || ''}
                                        onChange={(e) => updateEyeSight(['visualAcuity', 'right', 'ih'], e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="bg-gray-100 p-2 mb-2 text-center">
                                    <span className="text-sm">LEFT</span>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm text-gray-700 mb-1 block">Unaided / Present</label>
                                      <Input
                                        value={eyeSight.visualAcuity.left.unaided || ''}
                                        onChange={(e) => updateEyeSight(['visualAcuity', 'left', 'unaided'], e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm text-gray-700 mb-1 block">IH</label>
                                      <Input
                                        value={eyeSight.visualAcuity.left.ih || ''}
                                        onChange={(e) => updateEyeSight(['visualAcuity', 'left', 'ih'], e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* IOP Section */}
                            <div>
                              <div className="bg-gray-200 p-2 mb-2">
                                <h3 className="text-sm uppercase">IOP</h3>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="bg-gray-100 p-2 mb-2 text-center">
                                    <span className="text-sm">RIGHT</span>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm text-gray-700 mb-1 block">Right</label>
                                      <Input
                                        value={eyeSight.iop.right.right || ''}
                                        onChange={(e) => updateEyeSight(['iop', 'right', 'right'], e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm text-gray-700 mb-1 block">PD</label>
                                      <Input
                                        value={eyeSight.iop.right.pd || ''}
                                        onChange={(e) => updateEyeSight(['iop', 'right', 'pd'], e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="bg-gray-100 p-2 mb-2 text-center">
                                    <span className="text-sm">LEFT</span>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm text-gray-700 mb-1 block">Right</label>
                                      <Input
                                        value={eyeSight.iop.left.right || ''}
                                        onChange={(e) => updateEyeSight(['iop', 'left', 'right'], e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm text-gray-700 mb-1 block">PD</label>
                                      <Input
                                        value={eyeSight.iop.left.pd || ''}
                                        onChange={(e) => updateEyeSight(['iop', 'left', 'pd'], e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Prescription Section */}
                            <div>
                              <div className="bg-gray-200 p-2 mb-2">
                                <h3 className="text-sm uppercase">PRESCRIPTION</h3>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                {/* Right Eye Prescription */}
                                <div>
                                  <div className="bg-gray-100 p-2 mb-2 text-center">
                                    <span className="text-sm">RIGHT</span>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-4 gap-2">
                                      <div className="col-span-4">
                                        <label className="text-sm text-gray-600 mb-1 block">Distance</label>
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">SPH</label>
                                        <Input
                                          value={eyeSight.prescription.right.distance.sph || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'distance', 'sph'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">CYL</label>
                                        <Input
                                          value={eyeSight.prescription.right.distance.cyl || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'distance', 'cyl'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">AXIS</label>
                                        <Input
                                          value={eyeSight.prescription.right.distance.axis || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'distance', 'axis'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">VA</label>
                                        <Input
                                          value={eyeSight.prescription.right.distance.va || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'distance', 'va'], e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2">
                                      <div className="col-span-4">
                                        <label className="text-sm text-gray-600 mb-1 block">Near</label>
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.right.near.sph || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'near', 'sph'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.right.near.cyl || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'near', 'cyl'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.right.near.axis || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'near', 'axis'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.right.near.va || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'near', 'va'], e.target.value)}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                      <div className="col-span-4">
                                        <label className="text-sm text-gray-600 mb-1 block">Intermediate</label>
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.right.intermediate.sph || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'intermediate', 'sph'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.right.intermediate.cyl || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'intermediate', 'cyl'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.right.intermediate.axis || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'intermediate', 'axis'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.right.intermediate.va || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'right', 'intermediate', 'va'], e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Left Eye Prescription */}
                                <div>
                                  <div className="bg-gray-100 p-2 mb-2 text-center">
                                    <span className="text-sm">LEFT</span>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-4 gap-2">
                                      <div className="col-span-4">
                                        <label className="text-sm text-gray-600 mb-1 block">Distance</label>
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">SPH</label>
                                        <Input
                                          value={eyeSight.prescription.left.distance.sph || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'distance', 'sph'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">CYL</label>
                                        <Input
                                          value={eyeSight.prescription.left.distance.cyl || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'distance', 'cyl'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">AXIS</label>
                                        <Input
                                          value={eyeSight.prescription.left.distance.axis || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'distance', 'axis'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">VA</label>
                                        <Input
                                          value={eyeSight.prescription.left.distance.va || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'distance', 'va'], e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2">
                                      <div className="col-span-4">
                                        <label className="text-sm text-gray-600 mb-1 block">Near</label>
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.left.near.sph || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'near', 'sph'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.left.near.cyl || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'near', 'cyl'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.left.near.axis || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'near', 'axis'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.left.near.va || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'near', 'va'], e.target.value)}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                      <div className="col-span-4">
                                        <label className="text-sm text-gray-600 mb-1 block">Intermediate</label>
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.left.intermediate.sph || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'intermediate', 'sph'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.left.intermediate.cyl || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'intermediate', 'cyl'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.left.intermediate.axis || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'intermediate', 'axis'], e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Input
                                          value={eyeSight.prescription.left.intermediate.va || ''}
                                          onChange={(e) => updateEyeSight(['prescription', 'left', 'intermediate', 'va'], e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* IOL Calculation Section */}
                            <div>
                              <div className="bg-gray-200 p-2 mb-2">
                                <h3 className="text-sm uppercase">IOL CALCULATION</h3>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="grid grid-cols-6 gap-2 mb-2">
                                    <div className="text-xs text-gray-500 text-center">R1</div>
                                    <div className="text-xs text-gray-500 text-center">K2</div>
                                    <div className="text-xs text-gray-500 text-center">AC</div>
                                    <div className="text-xs text-gray-500 text-center">IOL POWER</div>
                                    <div className="text-xs text-gray-500 text-center">AL</div>
                                    <div className="text-xs text-gray-500 text-center">S/D</div>
                                  </div>
                                  <div className="grid grid-cols-6 gap-2">
                                    <Input
                                      value={eyeSight.iolCalculation.right.r1}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'right', 'r1'], e.target.value)}
                                    />
                                    <Input
                                      value={eyeSight.iolCalculation.right.k2}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'right', 'k2'], e.target.value)}
                                    />
                                    <Input
                                      value={eyeSight.iolCalculation.right.ac}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'right', 'ac'], e.target.value)}
                                    />
                                    <Input
                                      value={eyeSight.iolCalculation.right.iolPower}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'right', 'iolPower'], e.target.value)}
                                    />
                                    <Input
                                      value={eyeSight.iolCalculation.right.al}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'right', 'al'], e.target.value)}
                                    />
                                    <Input
                                      value={eyeSight.iolCalculation.right.sd}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'right', 'sd'], e.target.value)}
                                    />
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">Right</div>
                                </div>
                                <div>
                                  <div className="grid grid-cols-6 gap-2 mb-2">
                                    <div className="text-xs text-gray-500 text-center">R1</div>
                                    <div className="text-xs text-gray-500 text-center">K2</div>
                                    <div className="text-xs text-gray-500 text-center">AC</div>
                                    <div className="text-xs text-gray-500 text-center">IOL POWER</div>
                                    <div className="text-xs text-gray-500 text-center">AL</div>
                                    <div className="text-xs text-gray-500 text-center">S/D</div>
                                  </div>
                                  <div className="grid grid-cols-6 gap-2">
                                    <Input
                                      value={eyeSight.iolCalculation.left.r1}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'left', 'r1'], e.target.value)}
                                    />
                                    <Input
                                      value={eyeSight.iolCalculation.left.k2}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'left', 'k2'], e.target.value)}
                                    />
                                    <Input
                                      value={eyeSight.iolCalculation.left.ac}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'left', 'ac'], e.target.value)}
                                    />
                                    <Input
                                      value={eyeSight.iolCalculation.left.iolPower}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'left', 'iolPower'], e.target.value)}
                                    />
                                    <Input
                                      value={eyeSight.iolCalculation.left.al}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'left', 'al'], e.target.value)}
                                    />
                                    <Input
                                      value={eyeSight.iolCalculation.left.sd}
                                      onChange={(e) => updateEyeSight(['iolCalculation', 'left', 'sd'], e.target.value)}
                                    />
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">Left</div>
                                </div>
                              </div>
                            </div>

                            {/* Remarks */}
                            <div>
                              <label className="text-sm text-gray-700 mb-2 block">Remarks</label>
                              <Textarea
                                value={eyeSight.remarks}
                                onChange={(e) => setEyeSight({ ...eyeSight, remarks: e.target.value })}
                                className="min-h-[60px]"
                              />
                            </div>

                            {/* Add Eye Card Button */}
                            <div>
                              <Button className="bg-blue-600 hover:bg-blue-700">
                                ADD EYE CARD
                              </Button>
                              <p className="text-xs text-gray-500 mt-2">
                                To Print Eye card separately, Please click on the glasses icon from the listing page of health record
                              </p>
                            </div>

                            <Separator />

                            {/* Improvement and Follow-up */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm text-gray-700 mb-2 block">Improvement</label>
                                <Select>
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
                                <Input type="date" />
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4">
                              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                <FileText className="w-4 h-4 mr-2" />
                                Print Settings
                              </Button>
                              <div className="flex gap-2">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save & Print
                                </Button>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-12 text-center">
                            <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Eye exam view coming soon</p>
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
                            <Select value={searchMultiple} onValueChange={setSearchMultiple}>
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
                            <Select value={labOrderFilter} onValueChange={setLabOrderFilter}>
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
                            <Select value={priority} onValueChange={setPriority}>
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
                              {selectedLabTests.map((test) => (
                                <Badge
                                  key={test}
                                  variant="secondary"
                                  className="bg-gray-100 text-gray-700 px-3 py-1 flex items-center gap-2"
                                >
                                  {test}
                                  <button
                                    onClick={() => setSelectedLabTests(selectedLabTests.filter(t => t !== test))}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Main Lab Tests Section */}
                        <div className="grid grid-cols-12 gap-4">
                          {/* Left Sidebar - Specimen Types */}
                          <div className="col-span-3 space-y-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900">Blood</h4>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded" />
                                <span className="text-xs text-blue-600">Select All</span>
                              </div>
                            </div>
                            
                            {['Urine', 'Serum', 'Semen', 'Stool', 'Monitous', 'CSF', 'Tissue', 'Scrap', 'Aortic Fluid', 'Bronchoscopy Lavage (BAL)', 'Gastric Lavage (GAL)', 'Knee Joint Fluid', 'Peritoneal Fluid'].map((specimen) => (
                              <button
                                key={specimen}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                              >
                                {specimen}
                              </button>
                            ))}
                          </div>

                          {/* Right Side - Test Buttons in 3 Columns */}
                          <div className="col-span-9 border-l border-gray-200 pl-4">
                            <div className="flex items-center justify-end mb-3">
                              <Button variant="link" className="text-blue-600 p-0 h-auto">
                                Edit
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                              {/* Column 1 */}
                              <div className="space-y-2">
                                {['AFB Stain (Semen)', 'Colour', 'Liquification time', 'Motility', 'pH (Semen)', 'Result', 'Viscosity'].map((test) => (
                                  <Button
                                    key={test}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start text-sm h-9"
                                    onClick={() => {
                                      if (!selectedLabTests.includes(test.toLowerCase())) {
                                        setSelectedLabTests([...selectedLabTests, test.toLowerCase()]);
                                      }
                                    }}
                                  >
                                    {test}
                                  </Button>
                                ))}
                              </div>

                              {/* Column 2 */}
                              <div className="space-y-2">
                                {['Antibiotic Sensitivity (Semen)', 'Culture (Semen)', 'Liquification time (Semen)', 'Motility (Semen)', 'Pus Cells (Semen)', 'Total Count', 'Viscosity'].map((test) => (
                                  <Button
                                    key={test}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start text-sm h-9"
                                    onClick={() => {
                                      if (!selectedLabTests.includes(test.toLowerCase())) {
                                        setSelectedLabTests([...selectedLabTests, test.toLowerCase()]);
                                      }
                                    }}
                                  >
                                    {test}
                                  </Button>
                                ))}
                              </div>

                              {/* Column 3 */}
                              <div className="space-y-2">
                                {['Color (Semen)', 'Gram Stain (Semen)', 'Morphology', 'Parasite', 'RBC (Semen)', 'Total Semen Count', 'Volume (Semen)'].map((test) => (
                                  <Button
                                    key={test}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start text-sm h-9"
                                    onClick={() => {
                                      if (!selectedLabTests.includes(test.toLowerCase())) {
                                        setSelectedLabTests([...selectedLabTests, test.toLowerCase()]);
                                      }
                                    }}
                                  >
                                    {test}
                                  </Button>
                                ))}
                              </div>
                            </div>
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

                        <div className="grid grid-cols-2 gap-3">
                          {['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'ECG', 'Mammography'].map((test) => (
                            <label key={test} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm text-gray-700">{test}</span>
                            </label>
                          ))}
                        </div>

                        <div>
                          <label className="text-sm text-gray-700 mb-2 block">Body Part/Region</label>
                          <Input placeholder="e.g., Chest, Abdomen, Brain" />
                        </div>

                        <div>
                          <label className="text-sm text-gray-700 mb-2 block">Clinical Indication</label>
                          <Textarea
                            placeholder="Reason for imaging..."
                            className="min-h-[80px] resize-none"
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Summary</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setShowTemplateModal(true)}
                  >
                    <Plus className="w-4 h-4 text-blue-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 space-y-4">
                  {/* Template Selector */}
                  <div>
                    <label className="text-xs text-gray-600 mb-2 block">Select Template</label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Consultation</SelectItem>
                        <SelectItem value="followup">Follow-up Visit</SelectItem>
                        <SelectItem value="emergency">Emergency Care</SelectItem>
                        <SelectItem value="pediatric">Pediatric Care</SelectItem>
                        <SelectItem value="custom">Custom Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Summary Tabs */}
                  <Tabs value={summaryTab} onValueChange={setSummaryTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3 h-auto gap-1 bg-gray-100 p-1">
                      <TabsTrigger value="drugs" className="text-xs px-2 py-1.5">
                        Drugs
                      </TabsTrigger>
                      <TabsTrigger value="templates" className="text-xs px-2 py-1.5">
                        Templates
                      </TabsTrigger>
                      <TabsTrigger value="medication" className="text-xs px-2 py-1.5">
                        Medication
                      </TabsTrigger>
                    </TabsList>
                    <TabsList className="w-full grid grid-cols-3 h-auto gap-1 bg-gray-100 p-1 mt-2">
                      <TabsTrigger value="frequency" className="text-xs px-2 py-1.5">
                        Frequency
                      </TabsTrigger>
                      <TabsTrigger value="instructions" className="text-xs px-2 py-1.5">
                        Instructions
                      </TabsTrigger>
                      <TabsTrigger value="laborder" className="text-xs px-2 py-1.5">
                        Lab Order
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab Contents */}
                    <div className="mt-4">
                      <TabsContent value="drugs" className="mt-0">
                        <ScrollArea className="h-[calc(100vh-520px)]">
                          <div className="space-y-3 pr-3">
                            {medications.length > 0 ? (
                              <>
                                {/* Patient Info Card */}
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Patient ID:</span>
                                      <span className="font-medium text-gray-900">{patient.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Blood Type:</span>
                                      <span className="font-medium text-gray-900">{patient.bloodType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Age:</span>
                                      <span className="font-medium text-gray-900">22 years</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Medications List */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-medium text-gray-700">
                                      Prescribed Drugs ({medications.length})
                                    </h4>
                                    <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                                      View All
                                    </Button>
                                  </div>
                                  
                                  {medications.map((med, index) => (
                                    <div 
                                      key={med.id} 
                                      className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start gap-2">
                                            <span className="text-xs font-medium text-blue-900 mt-0.5">
                                              {index + 1}.
                                            </span>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                {med.name || 'Unnamed medication'}
                                              </p>
                                              {med.dosage && (
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                  {med.dosage}
                                                </p>
                                              )}
                                              {med.frequency && (
                                                <p className="text-xs text-blue-700 mt-0.5 font-medium">
                                                  {med.frequency}
                                                </p>
                                              )}
                                              {med.duration && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                  Duration: {med.duration}
                                                </p>
                                              )}
                                              {med.instructions && (
                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                  {med.instructions}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 w-7 p-0 hover:bg-blue-200"
                                          >
                                            <Edit2 className="w-3.5 h-3.5 text-blue-700" />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 w-7 p-0 hover:bg-red-100" 
                                            onClick={() => removeMedication(med.id)}
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Vitals Summary if available */}
                                {Object.values(vitals).some(v => v) && (
                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <h5 className="text-xs font-medium text-green-900 mb-2">Vital Signs</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      {vitals.temperature && (
                                        <div className="text-xs">
                                          <span className="text-gray-600">Temp:</span>
                                          <span className="text-gray-900 ml-1 font-medium">{vitals.temperature}°C</span>
                                        </div>
                                      )}
                                      {vitals.bloodPressure && (
                                        <div className="text-xs">
                                          <span className="text-gray-600">BP:</span>
                                          <span className="text-gray-900 ml-1 font-medium">{vitals.bloodPressure}</span>
                                        </div>
                                      )}
                                      {vitals.pulseHeartRate && (
                                        <div className="text-xs">
                                          <span className="text-gray-600">Pulse:</span>
                                          <span className="text-gray-900 ml-1 font-medium">{vitals.pulseHeartRate}</span>
                                        </div>
                                      )}
                                      {vitals.oxygenSaturation && (
                                        <div className="text-xs">
                                          <span className="text-gray-600">SpO2:</span>
                                          <span className="text-gray-900 ml-1 font-medium">{vitals.oxygenSaturation}%</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="py-12 text-center">
                                <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No medications added yet</p>
                                <Button 
                                  size="sm" 
                                  className="mt-3 bg-blue-600 hover:bg-blue-700"
                                  onClick={addMedication}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add First Medication
                                </Button>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="templates" className="mt-0">
                        <div className="py-12 text-center">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 mb-1">There are no templates to show</p>
                          <p className="text-xs text-gray-400 mb-4">Create custom templates for faster documentation</p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowTemplateModal(true)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Create Template
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="medication" className="mt-0">
                        <ScrollArea className="h-[calc(100vh-520px)]">
                          <div className="space-y-2 pr-3">
                            {medications.length > 0 ? (
                              medications.map((med) => (
                                <div key={med.id} className="p-3 border border-gray-200 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{med.name || 'Unnamed'}</p>
                                      <p className="text-xs text-gray-500 mt-1">{med.dosage}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {med.frequency || 'N/A'}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="py-8 text-center">
                                <p className="text-sm text-gray-500">No medications</p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="frequency" className="mt-0">
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-xs font-medium text-gray-700 mb-2">Frequency Summary</h5>
                            <div className="space-y-1.5">
                              {medications.filter(m => m.frequency).length > 0 ? (
                                medications.filter(m => m.frequency).map((med) => (
                                  <div key={med.id} className="flex justify-between text-xs">
                                    <span className="text-gray-600 truncate flex-1">{med.name}</span>
                                    <span className="text-gray-900 font-medium ml-2">{med.frequency}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-500">No frequency data</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="instructions" className="mt-0">
                        <ScrollArea className="h-[calc(100vh-520px)]">
                          <div className="space-y-2 pr-3">
                            {medications.filter(m => m.instructions).length > 0 ? (
                              medications.filter(m => m.instructions).map((med) => (
                                <div key={med.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                  <p className="text-sm font-medium text-gray-900 mb-1">{med.name}</p>
                                  <p className="text-xs text-gray-600 italic">{med.instructions}</p>
                                </div>
                              ))
                            ) : (
                              <div className="py-8 text-center">
                                <p className="text-sm text-gray-500">No special instructions</p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="laborder" className="mt-0">
                        <div className="space-y-3">
                          {selectedLabTests.length > 0 ? (
                            <>
                              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                <h5 className="text-xs font-medium text-purple-900 mb-2">
                                  Lab Tests Ordered ({selectedLabTests.length})
                                </h5>
                                <div className="space-y-1">
                                  {selectedLabTests.slice(0, 5).map((test, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-purple-600" />
                                      <span className="text-xs text-gray-700">{test}</span>
                                    </div>
                                  ))}
                                  {selectedLabTests.length > 5 && (
                                    <Button variant="link" className="h-auto p-0 text-xs text-purple-600 mt-2">
                                      +{selectedLabTests.length - 5} more tests
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="py-8 text-center">
                              <TestTube className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No lab orders</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-200 space-y-2">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-10"
                    onClick={() => setShowTemplateModal(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Add Template
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="h-9">
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Copy Previous
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <Printer className="w-3.5 h-3.5 mr-1.5" />
                      Print Preview
                    </Button>
                  </div>
                </div>
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
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button onClick={handleSaveAndPrint} className="bg-green-600 hover:bg-green-700">
                <Printer className="w-4 h-4 mr-2" />
                Save & Print
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Health Record
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add File Button */}
      <div className="fixed bottom-24 right-8 z-10">
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg h-12 px-6">
          <Plus className="w-5 h-5 mr-2" />
          Add File
        </Button>
      </div>

      {/* Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Template</DialogTitle>
            <DialogDescription>
              Create a custom template for faster health record documentation
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={templateTab} onValueChange={setTemplateTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-gray-100">
              <TabsTrigger value="treatment">Treatment</TabsTrigger>
              <TabsTrigger value="medication">Medication</TabsTrigger>
              <TabsTrigger value="laborder">Lab Order</TabsTrigger>
              <TabsTrigger value="radiology">Radiology Order</TabsTrigger>
            </TabsList>

            <TabsContent value="treatment" className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Template Name *</label>
                <Input
                  value={templateFormData.templateName}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, templateName: e.target.value })}
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block">Medical History</label>
                <Textarea
                  value={templateFormData.medicalHistory}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, medicalHistory: e.target.value })}
                  placeholder="Enter medical history template"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block">Complaint</label>
                <Textarea
                  value={templateFormData.complaint}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, complaint: e.target.value })}
                  placeholder="Enter complaint template"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block">Examination</label>
                <Textarea
                  value={templateFormData.examination}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, examination: e.target.value })}
                  placeholder="Enter examination template"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block">Diagnosis</label>
                <Textarea
                  value={templateFormData.diagnosis}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, diagnosis: e.target.value })}
                  placeholder="Enter diagnosis template"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block">Clinical Notes</label>
                <Textarea
                  value={templateFormData.clinicalNotes}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, clinicalNotes: e.target.value })}
                  placeholder="Enter clinical notes template"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block">Advice</label>
                <Textarea
                  value={templateFormData.advice}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, advice: e.target.value })}
                  placeholder="Enter advice template"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block">Investigation</label>
                <Textarea
                  value={templateFormData.investigation}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, investigation: e.target.value })}
                  placeholder="Enter investigation template"
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    console.log('Saving template...', templateFormData);
                    setShowTemplateModal(false);
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="medication" className="mt-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Template Name</label>
                  <Input
                    value={templateFormData.templateName}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, templateName: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>

                <div className="space-y-3">
                  {templateFormData.medications.map((med, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-12">
                        <label className="text-sm text-gray-700 mb-1 block">Name</label>
                        <Input
                          value={med.name}
                          onChange={(e) => {
                            const newMeds = [...templateFormData.medications];
                            newMeds[index].name = e.target.value;
                            setTemplateFormData({ ...templateFormData, medications: newMeds });
                          }}
                          placeholder="e.g., panadol"
                        />
                      </div>
                      
                      <div className="col-span-3">
                        <label className="text-sm text-gray-700 mb-1 block">Duration</label>
                        <Select
                          value={med.duration}
                          onValueChange={(value) => {
                            const newMeds = [...templateFormData.medications];
                            newMeds[index].duration = value;
                            setTemplateFormData({ ...templateFormData, medications: newMeds });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="1" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 day</SelectItem>
                            <SelectItem value="3">3 days</SelectItem>
                            <SelectItem value="5">5 days</SelectItem>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-sm text-gray-700 mb-1 block">Dose</label>
                        <Select
                          value={med.dose}
                          onValueChange={(value) => {
                            const newMeds = [...templateFormData.medications];
                            newMeds[index].dose = value;
                            setTemplateFormData({ ...templateFormData, medications: newMeds });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="2" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.5">0.5</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-sm text-gray-700 mb-1 block">Route</label>
                        <Select
                          value={med.route}
                          onValueChange={(value) => {
                            const newMeds = [...templateFormData.medications];
                            newMeds[index].route = value;
                            setTemplateFormData({ ...templateFormData, medications: newMeds });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Oral" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oral">Oral</SelectItem>
                            <SelectItem value="iv">IV</SelectItem>
                            <SelectItem value="im">IM</SelectItem>
                            <SelectItem value="sc">SC</SelectItem>
                            <SelectItem value="topical">Topical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-sm text-gray-700 mb-1 block">Frequency</label>
                        <Select
                          value={med.frequency}
                          onValueChange={(value) => {
                            const newMeds = [...templateFormData.medications];
                            newMeds[index].frequency = value;
                            setTemplateFormData({ ...templateFormData, medications: newMeds });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Only Once" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Only Once</SelectItem>
                            <SelectItem value="daily">Once Daily</SelectItem>
                            <SelectItem value="bd">Twice Daily (BD)</SelectItem>
                            <SelectItem value="tds">Three Times Daily (TDS)</SelectItem>
                            <SelectItem value="qid">Four Times Daily (QID)</SelectItem>
                            <SelectItem value="prn">As Needed (PRN)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-sm text-gray-700 mb-1 block">Instructions</label>
                        <div className="flex gap-1">
                          <Select
                            value={med.instructions}
                            onValueChange={(value) => {
                              const newMeds = [...templateFormData.medications];
                              newMeds[index].instructions = value;
                              setTemplateFormData({ ...templateFormData, medications: newMeds });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Before Breakfast" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="before-breakfast">Before Breakfast</SelectItem>
                              <SelectItem value="after-breakfast">After Breakfast</SelectItem>
                              <SelectItem value="before-lunch">Before Lunch</SelectItem>
                              <SelectItem value="after-lunch">After Lunch</SelectItem>
                              <SelectItem value="before-dinner">Before Dinner</SelectItem>
                              <SelectItem value="after-dinner">After Dinner</SelectItem>
                              <SelectItem value="with-food">With Food</SelectItem>
                              <SelectItem value="empty-stomach">Empty Stomach</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 flex-shrink-0"
                            onClick={() => {
                              const newMeds = templateFormData.medications.filter((_, i) => i !== index);
                              setTemplateFormData({ ...templateFormData, medications: newMeds });
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-auto"
                    onClick={() => {
                      setTemplateFormData({
                        ...templateFormData,
                        medications: [
                          ...templateFormData.medications,
                          { name: '', duration: '1', dose: '2', route: 'oral', frequency: 'once', instructions: 'before-breakfast' }
                        ]
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Drug
                  </Button>
                </div>

                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Medical Notes</label>
                  <Textarea
                    placeholder="Enter medical notes..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Save
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="laborder" className="mt-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Template Name</label>
                  <Input
                    value={templateFormData.templateName}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, templateName: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Search Multiple Lab Test</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="hematology">Hematology</SelectItem>
                      <SelectItem value="biochemistry">Biochemistry</SelectItem>
                      <SelectItem value="microbiology">Microbiology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Select Lab Orders"
                    className="pl-10"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Select All</span>
                  </label>
                </div>

                <ScrollArea className="h-[400px] border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      'Absolute Eosinophil Count', 'Absolute Eosinophil Count', 'AFB Stain (Blood)',
                      'Agglutinine Count', 'Anti-Treponemal (Qualitative)', 'Anti-Treponemal Turbidimetry',
                      'Antibody-Sensitivity (Blood)', 'APTT (Control) (Blood)', 'APTT (Test) (Blood)',
                      'Blood Foam', 'Basophil', 'Basophil (Blood)',
                      'Blood Cell', 'Blood Group (Relative)', 'Blood Group Screening Test',
                      'Blood Group', 'Blood Sugar Random', 'Biopsi Sugar Testing',
                      'Blood Group (Relative)', 'CSF', 'Blood Routine test',
                      'Blood Sugar P.P', 'CBC', 'CRT Test',
                      'Calcium', 'Chloride', 'CK-MB',
                      'Complete Test (Direct)', 'Complete Test (Indirect)', 'Cross Match',
                      'Cross Match (Direct)', 'Cross Match (Indirect)', 'Culture (Blood)',
                      'D-dimer', 'Eosinophil', 'Eosinophil (Blood)',
                      'EGFR', 'ESR (Blood)', 'Fasting Blood Sugar',
                      'GGPS', 'GST', 'Gram Stain (Blood)',
                      'Glucose (Casual)', 'Haemoglobin', 'Haemoglobin (Blood)',
                      'Haemoglobin (Relative)', 'HB-Electrophoresis', 'HBsAg',
                      'HBsAG', 'HBeAg (Blood)', 'HBeAg (L-ELISA)',
                      'HCG Urine', 'HCV (Blood)', 'HCV ELISA',
                      'HIV (Blood)', 'HIV ELISA (Blood)', 'HIV CD4 (Blood)',
                      'HIV Tridot', 'HPLC', 'Hypersegmented Polymorphs (HSP)',
                      'INR', 'Lymphocyte', 'Lymphocytes (Blood)',
                      'M.P (ICT)', 'Malaria (Ag)', 'Malaria Parasites (Blood) RDT',
                      'MCH', 'MCHC', 'MCV',
                      'Monocyte', 'Monocyte (Blood)', 'Neutrophil',
                      'Non-Johnsalive', 'Nucleated RBC', 'Packed Cell Volume (PCV)',
                      'Percent Blood Group', 'Platelets', 'PCV (Blood)',
                      'Platelet Count', 'Platelets (Adequate)', 'Polygram',
                      'Post Blood Sugar (30 mins)', 'Post Blood Sugar (2 hrs-post)', 'Post-Breakfast Time (Blood) (Blood)',
                      'PS for mfg microfilaria', 'PS for RBC Stippling', 'PT',
                      'RA Factor - Qualitative', 'Reticulocyte count', 'RBC count',
                      'Test1', 'Test2', 'TBi (g/dl) ICT',
                      'Total Leucocyte Count (Blood)', 'Trickling Test', 'Total Leucocyte Count',
                      'VDRL Rapid', 'VDRL/TPHA (Blood)', 'VRDL+L, Quantitative'
                    ].map((test, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm p-2 hover:bg-gray-50 rounded">
                        <input type="checkbox" className="rounded" />
                        <span className="text-gray-700">{test}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Save
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="radiology" className="mt-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Template Name</label>
                  <Input
                    value={templateFormData.templateName}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, templateName: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Select Radiology Orders</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select radiology orders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xray">X-Ray</SelectItem>
                      <SelectItem value="ct">CT Scan</SelectItem>
                      <SelectItem value="mri">MRI</SelectItem>
                      <SelectItem value="ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="mammography">Mammography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <label className="text-sm text-gray-700 mb-2 block">Select Priority</label>
                  <div className="relative">
                    <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="stat">STAT</SelectItem>
                        <SelectItem value="asap">ASAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Select All</span>
                  </label>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Save
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}