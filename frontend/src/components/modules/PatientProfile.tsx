import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft,
  Phone, 
  Mail, 
  Edit,
  Download,
  Share2,
  User,
  FileText,
  Calendar,
  DollarSign,
  Stethoscope,
  Users,
  Activity,
  FolderOpen,
  Pill,
  ClipboardList,
  CreditCard,
  ExternalLink,
  Plus,
  Receipt,
  CalendarPlus,
  Coins,
  UserPlus,
  Heart,
  Folder,
  MessagesSquare,
  FileEdit,
  Printer
} from 'lucide-react';

interface PatientProfileProps {
  patientId: string;
  onBack: () => void;
  onAddHealthRecord?: () => void;
}

export function PatientProfile({ patientId, onBack, onAddHealthRecord }: PatientProfileProps) {
  // Mock patient data
  const patient = {
    id: 'HW ID 000010760963',
    name: 'Test Khan',
    age: '22 YEARS, 1 MONTHS, 4 DAYS OLD',
    gender: 'MALE',
    dateOfBirth: '2002-09-20',
    phone: '+92 3331235697',
    email: 'test.khan@email.com',
    address: '123 Main Street, Karachi, Pakistan',
    bloodType: 'A+',
    height: '175 cm',
    weight: '68 kg',
    status: 'Active',
    registrationDate: '2020-05-12',
    primaryDoctor: 'Dr. Michael Chen',
    emergencyContact: {
      name: 'Sarah Khan',
      relation: 'Mother',
      phone: '+92 3331235698'
    }
  };

  const medicalHistory = [
    {
      type: 'OPD',
      count: 4,
      label: 'Total',
      appointments: [
        { date: '27/11/2024', description: 'Appointment with Talha on', token: '5', status: 'Checked' },
        { date: '18/11/2024', description: 'Appointment with Talha on', token: '1', status: 'Pending' },
        { date: '27/08/2024', description: 'Appointment with Talha on', token: '1', status: 'Pending' },
        { date: '13/08/2024', description: 'Appointment with Talha on', token: '2', status: 'Checked' }
      ]
    }
  ];

  const healthRecords = [];
  const recentFiles = [];
  const familyHistory = [];
  const lastInvoice = null;
  const treatmentPlan = null;

  const sidebarActions = [
    { icon: <Edit className="w-4 h-4" />, label: 'Edit Profile', action: () => {} },
    { icon: <Receipt className="w-4 h-4" />, label: 'Add Invoice', action: () => {} },
    { icon: <CalendarPlus className="w-4 h-4" />, label: 'Add Appointment', action: () => {} },
    { icon: <Coins className="w-4 h-4" />, label: 'Add Token', action: () => {} },
    { icon: <Users className="w-4 h-4" />, label: 'Patient Family History', action: () => {} },
    { icon: <FileText className="w-4 h-4" />, label: 'Add Medical History', action: () => {} },
    { icon: <Activity className="w-4 h-4" />, label: 'Add Health Record', action: () => onAddHealthRecord?.() },
    { icon: <FolderOpen className="w-4 h-4" />, label: 'Add File', action: () => {} }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl text-gray-900">Patient Profile</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Patient Info & Actions */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Patient Card */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg text-gray-900 mb-1">{patient.name}</h3>
                <p className="text-xs text-gray-600 mb-3">
                  {patient.gender} | {patient.age}
                </p>
                
                <Separator className="my-3" />
                
                <div className="w-full space-y-2 text-left">
                  <div className="text-xs text-gray-600">Hospital ID</div>
                  <div className="text-sm text-gray-900 break-all">{patient.id}</div>
                  
                  <div className="text-xs text-gray-600 mt-3">Contact</div>
                  <div className="text-sm text-gray-900">{patient.phone}</div>
                </div>

                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  ADD PAYMENTS
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="space-y-1">
                {sidebarActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="text-gray-500">{action.icon}</div>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Medical History & Files */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          {/* Medical History */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  MEDICAL HISTORY
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {medicalHistory.map((history, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-900">{history.type}</span>
                    <span className="text-sm text-gray-600">{history.count} {history.label}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {history.appointments.map((apt, aptIdx) => (
                      <div key={aptIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {apt.description} {apt.date} Token - {apt.token}
                          </p>
                        </div>
                        <Badge 
                          className={
                            apt.status === 'Checked' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {apt.status === 'Checked' ? 'CHECKED' : 'PENDING'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-right pt-2">
                    <Button variant="link" className="text-blue-600 p-0 h-auto">
                      View all
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Files */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">RECENT FILES</CardTitle>
            </CardHeader>
            <CardContent>
              {recentFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No files found</p>
                  <Button className="mt-4 bg-blue-500 hover:bg-blue-600" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Family History */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">PATIENT FAMILY HISTORY</CardTitle>
            </CardHeader>
            <CardContent>
              {familyHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No patient family history has been added yet.</p>
                  <Button className="mt-4 bg-blue-500 hover:bg-blue-600" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Family History
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {familyHistory.map((history: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900">{history.condition}</p>
                      <p className="text-xs text-gray-500">{history.relation}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Health Records & Other Info */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Health Records */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">HEALTH RECORDS</CardTitle>
                <Button variant="link" className="text-blue-600 p-0 h-auto text-xs">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {healthRecords.length === 0 ? (
                <div className="text-center py-6">
                  <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No health records available</p>
                  <Button className="mt-3 bg-blue-500 hover:bg-blue-600" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Record
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {healthRecords.map((record: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                      <p className="text-gray-900">{record.type}</p>
                      <p className="text-gray-500">{record.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Last Invoice */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">LAST INVOICE</CardTitle>
            </CardHeader>
            <CardContent>
              {!lastInvoice ? (
                <div className="text-center py-6">
                  <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No invoice has been added yet.</p>
                  <Button className="mt-3 bg-blue-500 hover:bg-blue-600" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Create Invoice
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Invoice ID:</span>
                    <span className="text-sm text-gray-900">{lastInvoice}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Treatment Plan */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">TREATMENT PLAN</CardTitle>
            </CardHeader>
            <CardContent>
              {!treatmentPlan ? (
                <div className="text-center py-6">
                  <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Not Available</p>
                  <Button className="mt-3 bg-blue-500 hover:bg-blue-600" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Plan
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-gray-900">
                  {treatmentPlan}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Details Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">PATIENT DETAILS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">Blood Type</p>
                <p className="text-sm text-gray-900">{patient.bloodType}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-600">Date of Birth</p>
                <p className="text-sm text-gray-900">
                  {new Date(patient.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-600">Height</p>
                <p className="text-sm text-gray-900">{patient.height}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-600">Weight</p>
                <p className="text-sm text-gray-900">{patient.weight}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-600">Email</p>
                <p className="text-sm text-gray-900 break-all">{patient.email}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-600">Address</p>
                <p className="text-sm text-gray-900">{patient.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">EMERGENCY CONTACT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">Name</p>
                <p className="text-sm text-gray-900">{patient.emergencyContact.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-600">Relation</p>
                <p className="text-sm text-gray-900">{patient.emergencyContact.relation}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-600">Phone</p>
                <p className="text-sm text-gray-900">{patient.emergencyContact.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <Button
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Messages"
        >
          <MessagesSquare className="w-5 h-5" />
        </Button>
        <Button
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Edit"
        >
          <FileEdit className="w-5 h-5" />
        </Button>
        <Button
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Appointments"
        >
          <Calendar className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
