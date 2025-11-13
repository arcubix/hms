import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Printer,
  Copy,
  Eye,
  FileText,
  Activity,
  Thermometer,
  Heart,
  Weight,
  Droplet,
  Wind
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface VitalRecord {
  pulseHeartRate: string;
  temperature: string;
  bloodPressure: string;
  respiratoryRate: string;
  bloodSugar: string;
  weight: string;
}

interface HealthRecordEntry {
  id: string;
  mrn: string;
  patientName: string;
  addedBy: string;
  createdAt: string;
  addedAt: string;
  vitals: VitalRecord;
  complaints?: string;
  diagnosis?: string;
  prescription?: string;
  labTests?: string[];
}

const mockHealthRecords: HealthRecordEntry[] = [
  {
    id: '1',
    mrn: '100451',
    patientName: 'Saqib',
    addedBy: 'Azan Medical',
    createdAt: '05 November, 2024',
    addedAt: '06/11/2024 - 04:33PM',
    vitals: {
      pulseHeartRate: '122',
      temperature: '98',
      bloodPressure: '120',
      respiratoryRate: '900',
      bloodSugar: '120',
      weight: '90 kg'
    },
    complaints: 'Fever, headache, body pain',
    diagnosis: 'Viral infection',
    prescription: 'Paracetamol 500mg, Rest'
  },
  {
    id: '2',
    mrn: '100451',
    patientName: 'Saqib',
    addedBy: 'Inaam',
    createdAt: '02 April, 2024',
    addedAt: '02/04/2024 - 11:20PM',
    vitals: {
      pulseHeartRate: '115',
      temperature: '97.5',
      bloodPressure: '118/78',
      respiratoryRate: '18',
      bloodSugar: '105',
      weight: '89 kg'
    },
    complaints: 'Regular checkup',
    diagnosis: 'Healthy',
    prescription: 'Continue regular exercise'
  },
  {
    id: '3',
    mrn: '100451',
    patientName: 'Saqib',
    addedBy: 'Dr. Sarah Williams',
    createdAt: '15 January, 2024',
    addedAt: '15/01/2024 - 09:15AM',
    vitals: {
      pulseHeartRate: '118',
      temperature: '98.2',
      bloodPressure: '122/80',
      respiratoryRate: '16',
      bloodSugar: '110',
      weight: '88 kg'
    },
    complaints: 'Follow-up visit',
    diagnosis: 'Recovering well',
    prescription: 'Continue medication'
  }
];

export function HealthRecords() {
  const [searchQuery, setSearchQuery] = useState('Saqib');
  const [dateRange, setDateRange] = useState('11/11/2025 - 11/11/2025');
  const [expandedRecords, setExpandedRecords] = useState<string[]>(['1']);
  const [records] = useState<HealthRecordEntry[]>(mockHealthRecords);

  const toggleRecord = (recordId: string) => {
    setExpandedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const filteredRecords = records.filter(record => 
    record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.mrn.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl text-gray-900 mb-6">Health Records</h1>
        
        {/* Search and Filter Section */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient name or MRN..."
                className="pl-10 h-12 border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="w-80">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="Select date range"
                className="pl-10 h-12 border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-7">
            <Button className="h-12 bg-blue-600 hover:bg-blue-700 px-6 rounded-lg shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Health Record
            </Button>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="p-6 space-y-4">
        {filteredRecords.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No health records found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              Displaying all {filteredRecords.length} health record{filteredRecords.length !== 1 ? 's' : ''}
            </p>
            
            {filteredRecords.map((record) => (
              <Card key={record.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Record Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-sm text-gray-600">MRN</span>
                          <span className="ml-2 font-medium text-gray-900">{record.mrn}</span>
                          <span className="mx-2 text-gray-400">|</span>
                          <span className="text-sm text-gray-600">Patient:</span>
                          <span className="ml-2 font-medium text-gray-900">{record.patientName}</span>
                        </div>
                        
                        <div className="h-6 w-px bg-gray-300" />
                        
                        <div>
                          <span className="text-sm text-gray-600">Added By:</span>
                          <span className="ml-2 text-gray-900">{record.addedBy}</span>
                        </div>

                        <div className="h-6 w-px bg-gray-300" />
                        
                        <div>
                          <span className="text-sm text-gray-600">Created at:</span>
                          <span className="ml-2 text-gray-900">{record.createdAt}</span>
                        </div>

                        <div className="h-6 w-px bg-gray-300" />
                        
                        <div>
                          <span className="text-sm text-gray-600">Added at:</span>
                          <span className="ml-2 text-gray-900">{record.addedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Copy className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Printer className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                        
                        <div className="w-px h-6 bg-gray-300 mx-2" />
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => toggleRecord(record.id)}
                        >
                          {expandedRecords.includes(record.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <Collapsible 
                    open={expandedRecords.includes(record.id)}
                  >
                    <CollapsibleContent>
                      <div className="p-6">
                        {/* Vitals Section */}
                        <div className="mb-6">
                          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Vitals
                          </h3>
                          
                          <div className="grid grid-cols-6 gap-4">
                            {/* Pulse/Heart Rate */}
                            <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="w-4 h-4 text-red-600" />
                                <span className="text-xs text-gray-600 uppercase">Pulse/Heart Rate</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{record.vitals.pulseHeartRate}</p>
                              <p className="text-xs text-gray-500 mt-1">bpm</p>
                            </div>

                            {/* Temperature */}
                            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Thermometer className="w-4 h-4 text-orange-600" />
                                <span className="text-xs text-gray-600 uppercase">Temperature</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{record.vitals.temperature}</p>
                              <p className="text-xs text-gray-500 mt-1">°F</p>
                            </div>

                            {/* Blood Pressure */}
                            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-blue-600" />
                                <span className="text-xs text-gray-600 uppercase">Blood Pressure</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{record.vitals.bloodPressure}</p>
                              <p className="text-xs text-gray-500 mt-1">mmHg</p>
                            </div>

                            {/* Respiratory Rate */}
                            <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Wind className="w-4 h-4 text-cyan-600" />
                                <span className="text-xs text-gray-600 uppercase">Respiratory Rate</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{record.vitals.respiratoryRate}</p>
                              <p className="text-xs text-gray-500 mt-1">breaths/min</p>
                            </div>

                            {/* Blood Sugar */}
                            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Droplet className="w-4 h-4 text-purple-600" />
                                <span className="text-xs text-gray-600 uppercase">Blood Sugar</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{record.vitals.bloodSugar}</p>
                              <p className="text-xs text-gray-500 mt-1">mg/dL</p>
                            </div>

                            {/* Weight */}
                            <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Weight className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-gray-600 uppercase">Weight</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{record.vitals.weight.split(' ')[0]}</p>
                              <p className="text-xs text-gray-500 mt-1">kg</p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        {(record.complaints || record.diagnosis || record.prescription) && (
                          <div className="grid grid-cols-3 gap-6">
                            {record.complaints && (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Chief Complaints</h4>
                                <p className="text-sm text-gray-700">{record.complaints}</p>
                              </div>
                            )}
                            
                            {record.diagnosis && (
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Diagnosis</h4>
                                <p className="text-sm text-gray-700">{record.diagnosis}</p>
                              </div>
                            )}
                            
                            {record.prescription && (
                              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Prescription</h4>
                                <p className="text-sm text-gray-700">{record.prescription}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={className} {...props}>{children}</label>;
}
