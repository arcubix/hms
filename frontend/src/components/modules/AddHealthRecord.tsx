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
  Image as ImageIcon
} from 'lucide-react';

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
                          <span className="text-gray-900">{patient.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Blood Type:</span>
                          <span className="text-gray-900">{patient.bloodType}</span>
                        </div>
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
    </div>
  );
}
