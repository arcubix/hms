import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Activity,
  Calendar,
  Pill,
  FlaskConical,
  FileText,
  User,
  Clock,
  Download,
  Printer,
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Stethoscope,
  Syringe,
  TestTube,
  Heart,
  Thermometer,
  ClipboardList,
  Receipt,
  CreditCard,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: 'visit' | 'prescription' | 'lab' | 'vitals' | 'diagnosis' | 'procedure' | 'payment' | 'appointment';
  title: string;
  description?: string;
  status?: 'completed' | 'pending' | 'cancelled';
  doctor?: string;
  details?: any;
  icon?: any;
  color?: string;
}

export function PatientTimeline() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const timelineData: TimelineEvent[] = [
    {
      id: '1',
      date: '2024-11-27',
      time: '10:30 AM',
      type: 'visit',
      title: 'OPD Consultation',
      description: 'Regular check-up and follow-up appointment',
      status: 'completed',
      doctor: 'Dr. Talha Ahmed',
      details: {
        token: '5',
        department: 'General Medicine',
        chiefComplaint: 'Fever and body aches for 3 days',
        diagnosis: 'Viral Fever',
        vitals: {
          temperature: '101.2°F',
          bloodPressure: '120/80',
          heartRate: '88 bpm',
          oxygenSaturation: '98%'
        }
      },
      icon: <Stethoscope className="w-5 h-5" />,
      color: 'blue'
    },
    {
      id: '2',
      date: '2024-11-27',
      time: '11:00 AM',
      type: 'prescription',
      title: 'Prescription Issued',
      status: 'completed',
      doctor: 'Dr. Talha Ahmed',
      details: {
        medications: [
          { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Three times daily', duration: '5 days' },
          { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '3 days' },
          { name: 'Vitamin C 1000mg', dosage: '1 tablet', frequency: 'Once daily', duration: '7 days' }
        ],
        instructions: 'Take medications after meals. Rest and maintain hydration.'
      },
      icon: <Pill className="w-5 h-5" />,
      color: 'green'
    },
    {
      id: '3',
      date: '2024-11-27',
      time: '11:15 AM',
      type: 'lab',
      title: 'Lab Tests Ordered',
      status: 'pending',
      doctor: 'Dr. Talha Ahmed',
      details: {
        tests: [
          { name: 'Complete Blood Count (CBC)', status: 'Pending', priority: 'Routine' },
          { name: 'Blood Sugar (Fasting)', status: 'Pending', priority: 'Routine' },
          { name: 'Liver Function Test', status: 'Pending', priority: 'Routine' }
        ],
        specialInstructions: 'Fasting required for 8-10 hours before blood collection'
      },
      icon: <FlaskConical className="w-5 h-5" />,
      color: 'purple'
    },
    {
      id: '4',
      date: '2024-11-20',
      time: '02:45 PM',
      type: 'lab',
      title: 'Lab Results Available',
      status: 'completed',
      doctor: 'Dr. Talha Ahmed',
      details: {
        tests: [
          { name: 'Complete Blood Count', result: 'Normal', range: 'Within normal limits', status: 'normal' },
          { name: 'Hemoglobin', result: '14.5 g/dL', range: '13.5-17.5 g/dL', status: 'normal' },
          { name: 'WBC Count', result: '7,500/μL', range: '4,000-11,000/μL', status: 'normal' },
          { name: 'Platelets', result: '250,000/μL', range: '150,000-450,000/μL', status: 'normal' }
        ]
      },
      icon: <TestTube className="w-5 h-5" />,
      color: 'blue'
    },
    {
      id: '5',
      date: '2024-11-18',
      time: '09:00 AM',
      type: 'appointment',
      title: 'Appointment Scheduled',
      status: 'pending',
      doctor: 'Dr. Talha Ahmed',
      details: {
        token: '1',
        type: 'Follow-up',
        department: 'General Medicine',
        notes: 'Follow-up for previous consultation'
      },
      icon: <Calendar className="w-5 h-5" />,
      color: 'orange'
    },
    {
      id: '6',
      date: '2024-11-15',
      time: '03:30 PM',
      type: 'vitals',
      title: 'Vital Signs Recorded',
      status: 'completed',
      details: {
        temperature: '98.6°F',
        bloodPressure: '118/78 mmHg',
        heartRate: '72 bpm',
        respiratoryRate: '16/min',
        oxygenSaturation: '99%',
        weight: '68 kg',
        height: '175 cm',
        bmi: '22.2',
        trend: {
          bloodPressure: 'stable',
          weight: 'up',
          heartRate: 'stable'
        }
      },
      icon: <Activity className="w-5 h-5" />,
      color: 'teal'
    },
    {
      id: '7',
      date: '2024-11-10',
      time: '11:20 AM',
      type: 'payment',
      title: 'Payment Received',
      status: 'completed',
      details: {
        invoiceId: 'INV-2024-001234',
        amount: 'PKR 3,500',
        method: 'Cash',
        services: [
          { name: 'Consultation Fee', amount: 'PKR 1,500' },
          { name: 'Lab Tests', amount: 'PKR 2,000' }
        ]
      },
      icon: <CreditCard className="w-5 h-5" />,
      color: 'green'
    },
    {
      id: '8',
      date: '2024-11-05',
      time: '10:00 AM',
      type: 'diagnosis',
      title: 'Diagnosis Updated',
      status: 'completed',
      doctor: 'Dr. Talha Ahmed',
      details: {
        primaryDiagnosis: 'Hypertension Stage 1',
        secondaryDiagnosis: 'Vitamin D Deficiency',
        icdCode: 'I10',
        notes: 'Patient advised lifestyle modifications and regular monitoring'
      },
      icon: <ClipboardList className="w-5 h-5" />,
      color: 'red'
    },
    {
      id: '9',
      date: '2024-10-28',
      time: '02:15 PM',
      type: 'procedure',
      title: 'Minor Procedure',
      status: 'completed',
      doctor: 'Dr. Sarah Khan',
      details: {
        procedureName: 'ECG (Electrocardiogram)',
        duration: '15 minutes',
        result: 'Normal sinus rhythm',
        notes: 'No abnormalities detected'
      },
      icon: <Heart className="w-5 h-5" />,
      color: 'pink'
    }
  ];

  const toggleEvent = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const getTypeColor = (type: string, color?: string) => {
    const colors: any = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      teal: 'bg-teal-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500'
    };
    return colors[color || 'blue'] || 'bg-blue-500';
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig: any = {
      completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> },
      pending: { color: 'bg-orange-100 text-orange-800', icon: <Clock className="w-3 h-3" /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" /> }
    };
    
    const config = statusConfig[status || 'completed'];
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {status?.toUpperCase()}
      </Badge>
    );
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const filteredTimeline = timelineData.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const groupedByDate = filteredTimeline.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">Patient Timeline</h3>
                <p className="text-xs text-gray-500">Complete medical history and events</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search timeline events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="visit">Visits</SelectItem>
                <SelectItem value="prescription">Prescriptions</SelectItem>
                <SelectItem value="lab">Lab Tests</SelectItem>
                <SelectItem value="vitals">Vitals</SelectItem>
                <SelectItem value="diagnosis">Diagnosis</SelectItem>
                <SelectItem value="procedure">Procedures</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-600">Total Events</p>
              <p className="text-lg font-medium text-blue-900">{timelineData.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600">Completed</p>
              <p className="text-lg font-medium text-green-900">
                {timelineData.filter(e => e.status === 'completed').length}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-xs text-orange-600">Pending</p>
              <p className="text-lg font-medium text-orange-900">
                {timelineData.filter(e => e.status === 'pending').length}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-xs text-purple-600">Last Visit</p>
              <p className="text-sm font-medium text-purple-900">Nov 27, 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Events */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          {Object.entries(groupedByDate).map(([date, events]) => (
            <div key={date} className="mb-8 last:mb-0">
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Events for this date */}
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full ${getTypeColor(event.type, event.color)} flex items-center justify-center text-white flex-shrink-0`}>
                        {event.icon}
                      </div>
                      {index < events.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-2" />
                      )}
                    </div>

                    {/* Event Card */}
                    <Card className="flex-1 border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                              {event.status && getStatusBadge(event.status)}
                            </div>
                            {event.description && (
                              <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </div>
                              {event.doctor && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {event.doctor}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleEvent(event.id)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="text-xs">
                              {expandedEvents.has(event.id) ? 'Hide' : 'View'} Details
                            </span>
                            <ChevronDown 
                              className={`w-3 h-3 transition-transform ${
                                expandedEvents.has(event.id) ? 'rotate-180' : ''
                              }`}
                            />
                          </Button>
                        </div>

                        {/* Expanded Details */}
                        {expandedEvents.has(event.id) && event.details && (
                          <>
                            <Separator className="my-3" />
                            <div className="space-y-3">
                              {/* Visit Details */}
                              {event.type === 'visit' && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Token Number</p>
                                    <p className="text-sm font-medium text-gray-900">{event.details.token}</p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Department</p>
                                    <p className="text-sm font-medium text-gray-900">{event.details.department}</p>
                                  </div>
                                  <div className="col-span-2 bg-blue-50 p-3 rounded-lg">
                                    <p className="text-xs text-blue-600 mb-1">Chief Complaint</p>
                                    <p className="text-sm text-gray-900">{event.details.chiefComplaint}</p>
                                  </div>
                                  <div className="col-span-2 bg-green-50 p-3 rounded-lg">
                                    <p className="text-xs text-green-600 mb-1">Diagnosis</p>
                                    <p className="text-sm text-gray-900">{event.details.diagnosis}</p>
                                  </div>
                                  {event.details.vitals && (
                                    <div className="col-span-2">
                                      <p className="text-xs text-gray-600 mb-2">Vitals Recorded:</p>
                                      <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(event.details.vitals).map(([key, value]) => (
                                          <div key={key} className="bg-gray-50 p-2 rounded text-center">
                                            <p className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                            <p className="text-sm font-medium text-gray-900">{value as string}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Prescription Details */}
                              {event.type === 'prescription' && (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-600 mb-2">Medications Prescribed:</p>
                                  {event.details.medications.map((med: any, idx: number) => (
                                    <div key={idx} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-gray-900">{med.name}</p>
                                          <p className="text-xs text-gray-600 mt-1">
                                            {med.dosage} • {med.frequency} • {med.duration}
                                          </p>
                                        </div>
                                        <Pill className="w-4 h-4 text-green-600" />
                                      </div>
                                    </div>
                                  ))}
                                  {event.details.instructions && (
                                    <div className="bg-blue-50 p-3 rounded-lg mt-2">
                                      <p className="text-xs text-blue-600 mb-1">Instructions:</p>
                                      <p className="text-sm text-gray-900">{event.details.instructions}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Lab Tests Details */}
                              {event.type === 'lab' && (
                                <div className="space-y-2">
                                  {event.status === 'pending' ? (
                                    <>
                                      <p className="text-xs text-gray-600 mb-2">Tests Ordered:</p>
                                      {event.details.tests.map((test: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                                          <div className="flex items-center gap-3">
                                            <FlaskConical className="w-4 h-4 text-purple-600" />
                                            <div>
                                              <p className="text-sm font-medium text-gray-900">{test.name}</p>
                                              <p className="text-xs text-gray-600">Priority: {test.priority}</p>
                                            </div>
                                          </div>
                                          <Badge className="bg-orange-100 text-orange-800">{test.status}</Badge>
                                        </div>
                                      ))}
                                      {event.details.specialInstructions && (
                                        <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                                          <p className="text-xs text-yellow-700">⚠️ {event.details.specialInstructions}</p>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-xs text-gray-600 mb-2">Test Results:</p>
                                      {event.details.tests.map((test: any, idx: number) => (
                                        <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <p className="text-sm font-medium text-gray-900">{test.name}</p>
                                              <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-600">
                                                  Result: <span className="font-medium text-gray-900">{test.result}</span>
                                                </p>
                                                {test.range && (
                                                  <p className="text-xs text-gray-500">Range: {test.range}</p>
                                                )}
                                              </div>
                                            </div>
                                            {test.status === 'normal' && (
                                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </>
                                  )}
                                </div>
                              )}

                              {/* Vitals Details */}
                              {event.type === 'vitals' && (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                                      <div className="flex items-center justify-center gap-1 mb-1">
                                        <Thermometer className="w-3 h-3 text-blue-600" />
                                        <p className="text-xs text-blue-600">Temperature</p>
                                      </div>
                                      <p className="text-sm font-medium text-gray-900">{event.details.temperature}</p>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg text-center">
                                      <div className="flex items-center justify-center gap-1 mb-1">
                                        <Activity className="w-3 h-3 text-red-600" />
                                        <p className="text-xs text-red-600">Blood Pressure</p>
                                      </div>
                                      <div className="flex items-center justify-center gap-1">
                                        <p className="text-sm font-medium text-gray-900">{event.details.bloodPressure}</p>
                                        {event.details.trend?.bloodPressure && getTrendIcon(event.details.trend.bloodPressure)}
                                      </div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg text-center">
                                      <div className="flex items-center justify-center gap-1 mb-1">
                                        <Heart className="w-3 h-3 text-green-600" />
                                        <p className="text-xs text-green-600">Heart Rate</p>
                                      </div>
                                      <div className="flex items-center justify-center gap-1">
                                        <p className="text-sm font-medium text-gray-900">{event.details.heartRate}</p>
                                        {event.details.trend?.heartRate && getTrendIcon(event.details.trend.heartRate)}
                                      </div>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-purple-600">SpO2</p>
                                      <p className="text-sm font-medium text-gray-900">{event.details.oxygenSaturation}</p>
                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-yellow-600">Weight</p>
                                      <div className="flex items-center justify-center gap-1">
                                        <p className="text-sm font-medium text-gray-900">{event.details.weight}</p>
                                        {event.details.trend?.weight && getTrendIcon(event.details.trend.weight)}
                                      </div>
                                    </div>
                                    <div className="bg-indigo-50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-indigo-600">BMI</p>
                                      <p className="text-sm font-medium text-gray-900">{event.details.bmi}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Payment Details */}
                              {event.type === 'payment' && (
                                <div className="space-y-2">
                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs text-green-600">Invoice ID</p>
                                      <p className="text-sm font-medium text-gray-900">{event.details.invoiceId}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs text-green-600">Payment Method</p>
                                      <p className="text-sm font-medium text-gray-900">{event.details.method}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    {event.details.services.map((service: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <p className="text-xs text-gray-700">{service.name}</p>
                                        <p className="text-xs font-medium text-gray-900">{service.amount}</p>
                                      </div>
                                    ))}
                                    <Separator />
                                    <div className="flex items-center justify-between bg-green-100 p-2 rounded">
                                      <p className="text-sm font-medium text-green-900">Total Amount</p>
                                      <p className="text-sm font-medium text-green-900">{event.details.amount}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Diagnosis Details */}
                              {event.type === 'diagnosis' && (
                                <div className="space-y-2">
                                  <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                                    <p className="text-xs text-red-600 mb-1">Primary Diagnosis</p>
                                    <p className="text-sm font-medium text-gray-900">{event.details.primaryDiagnosis}</p>
                                    <p className="text-xs text-gray-600 mt-1">ICD Code: {event.details.icdCode}</p>
                                  </div>
                                  {event.details.secondaryDiagnosis && (
                                    <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500">
                                      <p className="text-xs text-orange-600 mb-1">Secondary Diagnosis</p>
                                      <p className="text-sm font-medium text-gray-900">{event.details.secondaryDiagnosis}</p>
                                    </div>
                                  )}
                                  {event.details.notes && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <p className="text-xs text-blue-600 mb-1">Clinical Notes</p>
                                      <p className="text-sm text-gray-900">{event.details.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Procedure Details */}
                              {event.type === 'procedure' && (
                                <div className="space-y-2">
                                  <div className="bg-pink-50 p-3 rounded-lg">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-xs text-pink-600 mb-1">Procedure Name</p>
                                        <p className="text-sm font-medium text-gray-900">{event.details.procedureName}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-pink-600 mb-1">Duration</p>
                                        <p className="text-sm font-medium text-gray-900">{event.details.duration}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-xs text-green-600 mb-1">Result</p>
                                    <p className="text-sm text-gray-900">{event.details.result}</p>
                                  </div>
                                  {event.details.notes && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <p className="text-xs text-blue-600 mb-1">Notes</p>
                                      <p className="text-sm text-gray-900">{event.details.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Appointment Details */}
                              {event.type === 'appointment' && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-orange-50 p-3 rounded-lg">
                                    <p className="text-xs text-orange-600 mb-1">Token Number</p>
                                    <p className="text-sm font-medium text-gray-900">{event.details.token}</p>
                                  </div>
                                  <div className="bg-orange-50 p-3 rounded-lg">
                                    <p className="text-xs text-orange-600 mb-1">Type</p>
                                    <p className="text-sm font-medium text-gray-900">{event.details.type}</p>
                                  </div>
                                  <div className="col-span-2 bg-blue-50 p-3 rounded-lg">
                                    <p className="text-xs text-blue-600 mb-1">Department</p>
                                    <p className="text-sm font-medium text-gray-900">{event.details.department}</p>
                                  </div>
                                  {event.details.notes && (
                                    <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                                      <p className="text-xs text-gray-600 mb-1">Notes</p>
                                      <p className="text-sm text-gray-900">{event.details.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredTimeline.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No timeline events found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
