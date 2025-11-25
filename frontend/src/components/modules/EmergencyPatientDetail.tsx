/**
 * Emergency Patient Detail View
 * Comprehensive view for emergency visit with all workflow features
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { api, EmergencyVisit, EmergencyVitalSign, EmergencyTreatmentNote, EmergencyInvestigationOrder, EmergencyMedication, EmergencyCharge, EmergencyStatusHistory, CreateEmergencyVitalSignData, CreateEmergencyNoteData, CreateEmergencyInvestigationData, CreateEmergencyMedicationData, CreateEmergencyChargeData, CreateIPDAdmissionData } from '../../services/api';
import {
  X,
  Save,
  Plus,
  Edit,
  Clock,
  User,
  Activity,
  FileText,
  FlaskConical,
  Pill,
  DollarSign,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar,
  Stethoscope,
  Bed,
  Home,
  Hospital,
  Building2,
  Send,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EmergencyPatientDetailProps {
  visit: EmergencyVisit;
  onClose: () => void;
  onUpdate: () => void;
}

export function EmergencyPatientDetail({ visit, onClose, onUpdate }: EmergencyPatientDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [vitalsHistory, setVitalsHistory] = useState<EmergencyVitalSign[]>([]);
  const [notes, setNotes] = useState<EmergencyTreatmentNote[]>([]);
  const [investigations, setInvestigations] = useState<EmergencyInvestigationOrder[]>([]);
  const [medications, setMedications] = useState<EmergencyMedication[]>([]);
  const [charges, setCharges] = useState<EmergencyCharge[]>([]);
  const [totalCharges, setTotalCharges] = useState(0);
  const [statusHistory, setStatusHistory] = useState<EmergencyStatusHistory[]>([]);
  
  // Dialog states
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isInvestigationDialogOpen, setIsInvestigationDialogOpen] = useState(false);
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false);
  const [isDispositionDialogOpen, setIsDispositionDialogOpen] = useState(false);
  const [isIPDDialogOpen, setIsIPDDialogOpen] = useState(false);
  
  // Form states
  const [vitalsForm, setVitalsForm] = useState<CreateEmergencyVitalSignData>({});
  const [noteForm, setNoteForm] = useState<CreateEmergencyNoteData>({ note_text: '', note_type: 'observation' });
  const [investigationForm, setInvestigationForm] = useState<CreateEmergencyInvestigationData>({ test_name: '', investigation_type: 'lab', priority: 'normal' });
  const [medicationForm, setMedicationForm] = useState<CreateEmergencyMedicationData>({ medication_name: '', dosage: '', route: 'PO', status: 'given' });
  const [chargeForm, setChargeForm] = useState<CreateEmergencyChargeData>({ item_name: '', charge_type: 'other', unit_price: 0, quantity: 1 });
  const [dispositionForm, setDispositionForm] = useState({
    disposition: 'discharge' as 'discharge' | 'admit-ward' | 'admit-private' | 'transfer' | 'absconded' | 'death',
    disposition_details: '',
    follow_up_required: false,
    follow_up_date: '',
    medications_prescribed: '',
    condition_at_discharge: 'improved' as 'improved' | 'stable' | 'critical' | 'expired'
  });
  const [ipdForm, setIpdForm] = useState<CreateIPDAdmissionData>({ admission_type: 'ward' });

  // Load all data
  useEffect(() => {
    loadAllData();
  }, [visit.id]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [vitals, notesData, investigationsData, medicationsData, chargesData, history] = await Promise.all([
        api.getEmergencyVitals(visit.id),
        api.getEmergencyNotes(visit.id),
        api.getEmergencyInvestigations(visit.id),
        api.getEmergencyMedications(visit.id),
        api.getEmergencyCharges(visit.id),
        api.getEmergencyStatusHistory(visit.id)
      ]);
      
      setVitalsHistory(vitals);
      setNotes(notesData);
      setInvestigations(investigationsData);
      setMedications(medicationsData);
      setCharges(chargesData.charges);
      setTotalCharges(chargesData.total);
      setStatusHistory(history);
    } catch (error: any) {
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordVitals = async () => {
    try {
      await api.recordEmergencyVitals(visit.id, vitalsForm);
      toast.success('Vital signs recorded');
      setIsVitalsDialogOpen(false);
      setVitalsForm({});
      loadAllData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record vital signs');
    }
  };

  const handleAddNote = async () => {
    if (!noteForm.note_text.trim()) {
      toast.error('Note text is required');
      return;
    }
    try {
      await api.addEmergencyNote(visit.id, noteForm);
      toast.success('Treatment note added');
      setIsNoteDialogOpen(false);
      setNoteForm({ note_text: '', note_type: 'observation' });
      loadAllData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add note');
    }
  };

  const handleOrderInvestigation = async () => {
    if (!investigationForm.test_name.trim()) {
      toast.error('Test name is required');
      return;
    }
    try {
      await api.orderEmergencyInvestigation(visit.id, investigationForm);
      toast.success('Investigation ordered');
      setIsInvestigationDialogOpen(false);
      setInvestigationForm({ test_name: '', investigation_type: 'lab', priority: 'normal' });
      loadAllData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to order investigation');
    }
  };

  const handleAdministerMedication = async () => {
    if (!medicationForm.medication_name.trim() || !medicationForm.dosage.trim()) {
      toast.error('Medication name and dosage are required');
      return;
    }
    try {
      await api.administerEmergencyMedication(visit.id, medicationForm);
      toast.success('Medication recorded');
      setIsMedicationDialogOpen(false);
      setMedicationForm({ medication_name: '', dosage: '', route: 'PO', status: 'given' });
      loadAllData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record medication');
    }
  };

  const handleAddCharge = async () => {
    if (!chargeForm.item_name.trim() || !chargeForm.unit_price) {
      toast.error('Item name and unit price are required');
      return;
    }
    try {
      await api.addEmergencyCharge(visit.id, chargeForm);
      toast.success('Charge added');
      setIsChargeDialogOpen(false);
      setChargeForm({ item_name: '', charge_type: 'other', unit_price: 0, quantity: 1 });
      loadAllData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add charge');
    }
  };

  const handleDeleteCharge = async (chargeId: number) => {
    if (!confirm('Are you sure you want to delete this charge?')) return;
    try {
      await api.deleteEmergencyCharge(visit.id, chargeId);
      toast.success('Charge deleted');
      loadAllData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete charge');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await api.updateEmergencyStatus(visit.id, newStatus as any);
      toast.success('Status updated');
      loadAllData();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDisposition = async () => {
    try {
      await api.updateEmergencyDisposition(visit.id, dispositionForm);
      toast.success('Disposition updated');
      setIsDispositionDialogOpen(false);
      loadAllData();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update disposition');
    }
  };

  const handleIPDAdmission = async () => {
    try {
      await api.createIPDAdmissionFromER(visit.id, ipdForm);
      toast.success('IPD admission created');
      setIsIPDDialogOpen(false);
      loadAllData();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create IPD admission');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-gray-100 text-gray-800';
      case 'triaged': return 'bg-blue-100 text-blue-800';
      case 'in-treatment': return 'bg-yellow-100 text-yellow-800';
      case 'awaiting-disposition': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriageColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-500 text-white';
      case 2: return 'bg-orange-500 text-white';
      case 3: return 'bg-yellow-500 text-white';
      case 4: return 'bg-green-500 text-white';
      case 5: return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Prepare vitals chart data
  const vitalsChartData = vitalsHistory
    .slice()
    .reverse()
    .map((v, idx) => ({
      time: idx + 1,
      pulse: v.pulse || 0,
      temp: v.temp || 0,
      spo2: v.spo2 || 0,
      resp: v.resp || 0
    }));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <User className="w-6 h-6" />
                {visit.name} - {visit.erNumber}
              </DialogTitle>
              <DialogDescription>
                {visit.age}Y / {visit.gender} • Arrived: {visit.arrivalTime}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getTriageColor(visit.triageLevel)}>
                ESI {visit.triageLevel}
              </Badge>
              <Badge className={getStatusColor(visit.currentStatus)}>
                {visit.currentStatus.replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="investigations">Investigations</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="disposition">Disposition</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>UHID:</strong> {visit.uhid || 'N/A'}</div>
                  <div><strong>Phone:</strong> {visit.phone || 'N/A'}</div>
                  <div><strong>Email:</strong> {visit.email || 'N/A'}</div>
                  <div><strong>Blood Group:</strong> {visit.bloodGroup || 'N/A'}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visit Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Arrival Mode:</strong> {visit.arrivalMode}</div>
                  <div><strong>Chief Complaint:</strong> {visit.chiefComplaint}</div>
                  {visit.assignedDoctor && (
                    <div><strong>Doctor:</strong> {visit.assignedDoctor}</div>
                  )}
                  {visit.bedNumber && (
                    <div><strong>Bed:</strong> {visit.bedNumber}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Current Vital Signs */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Current Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {(() => {
                  // Get the latest vital sign record - sort by recorded_at descending to get most recent
                  const vitalsArray = Array.isArray(vitalsHistory) ? vitalsHistory : [];
                  const sortedVitals = [...vitalsArray].sort((a, b) => {
                    const dateA = new Date(a.recorded_at || a.created_at || 0).getTime();
                    const dateB = new Date(b.recorded_at || b.created_at || 0).getTime();
                    return dateB - dateA; // Descending order (newest first)
                  });
                  const latestVital = sortedVitals.length > 0 ? sortedVitals[0] : null;
                  
                  return (
                    <>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm text-gray-600">Blood Pressure</span>
                        <span className="font-bold text-red-700">{latestVital?.bp || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm text-gray-600">Pulse Rate</span>
                        <span className="font-bold text-blue-700">{latestVital?.pulse !== undefined && latestVital.pulse !== null ? `${latestVital.pulse} bpm` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <span className="text-sm text-gray-600">Temperature</span>
                        <span className="font-bold text-orange-700">{latestVital?.temp !== undefined && latestVital.temp !== null ? `${latestVital.temp}°F` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm text-gray-600">SpO2</span>
                        <span className="font-bold text-green-700">{latestVital?.spo2 !== undefined && latestVital.spo2 !== null ? `${latestVital.spo2}%` : 'N/A'}</span>
                      </div>
                      {latestVital?.resp !== undefined && latestVital.resp !== null && (
                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                          <span className="text-sm text-gray-600">Respiratory Rate</span>
                          <span className="font-bold text-purple-700">{latestVital.resp} /min</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Status Transitions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {visit.currentStatus === 'registered' && (
                    <Button onClick={() => handleUpdateStatus('triaged')} className="bg-blue-600">
                      Start Triage
                    </Button>
                  )}
                  {visit.currentStatus === 'triaged' && (
                    <Button onClick={() => handleUpdateStatus('in-treatment')} className="bg-yellow-600">
                      Start Treatment
                    </Button>
                  )}
                  {visit.currentStatus === 'in-treatment' && (
                    <Button onClick={() => handleUpdateStatus('awaiting-disposition')} className="bg-orange-600">
                      Complete Treatment
                    </Button>
                  )}
                  {visit.currentStatus === 'awaiting-disposition' && !visit.disposition && (
                    <Button onClick={() => setIsDispositionDialogOpen(true)} className="bg-green-600">
                      Set Disposition
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status History Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statusHistory.map((history, idx) => (
                    <div key={history.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <span className="font-medium">{history.from_status || 'Initial'} → {history.to_status}</span>
                        {history.changed_by_name && (
                          <span className="text-gray-500 ml-2">by {history.changed_by_name}</span>
                        )}
                      </div>
                      <div className="text-gray-500">
                        {new Date(history.changed_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vital Signs Tab */}
          <TabsContent value="vitals" className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle>Vital Signs History</CardTitle>
              <Button onClick={() => setIsVitalsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Record Vitals
              </Button>
            </div>

            {vitalsHistory.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={vitalsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="pulse" stroke="#8884d8" name="Pulse" />
                      <Line type="monotone" dataKey="temp" stroke="#82ca9d" name="Temp" />
                      <Line type="monotone" dataKey="spo2" stroke="#ffc658" name="SpO2" />
                      <Line type="monotone" dataKey="resp" stroke="#ff7300" name="Resp" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Recent Vital Signs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>BP</TableHead>
                      <TableHead>Pulse</TableHead>
                      <TableHead>Temp</TableHead>
                      <TableHead>SpO2</TableHead>
                      <TableHead>Resp</TableHead>
                      <TableHead>Recorded By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vitalsHistory.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{new Date(v.recorded_at).toLocaleString()}</TableCell>
                        <TableCell>{v.bp || '-'}</TableCell>
                        <TableCell>{v.pulse || '-'}</TableCell>
                        <TableCell>{v.temp ? `${v.temp}°F` : '-'}</TableCell>
                        <TableCell>{v.spo2 ? `${v.spo2}%` : '-'}</TableCell>
                        <TableCell>{v.resp || '-'}</TableCell>
                        <TableCell>{v.recorded_by_name || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle>Treatment Notes</CardTitle>
              <Button onClick={() => setIsNoteDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>

            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{note.note_type}</Badge>
                        <span className="text-sm text-gray-500">{note.recorded_by_name || 'Unknown'}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(note.recorded_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.note_text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Investigations Tab */}
          <TabsContent value="investigations" className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle>Investigation Orders</CardTitle>
              <Button onClick={() => setIsInvestigationDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Order Investigation
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ordered By</TableHead>
                      <TableHead>Ordered At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investigations.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>{inv.test_name}</TableCell>
                        <TableCell>{inv.investigation_type}</TableCell>
                        <TableCell>
                          <Badge variant={inv.priority === 'stat' ? 'destructive' : 'outline'}>
                            {inv.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{inv.status}</Badge>
                        </TableCell>
                        <TableCell>{inv.ordered_by_name || '-'}</TableCell>
                        <TableCell>{new Date(inv.ordered_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle>Medication Administration</CardTitle>
              <Button onClick={() => setIsMedicationDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Administer Medication
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Administered By</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((med) => (
                      <TableRow key={med.id}>
                        <TableCell>{med.medication_name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.route}</TableCell>
                        <TableCell>
                          <Badge variant={med.status === 'given' ? 'default' : 'outline'}>
                            {med.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{med.administered_by_name || '-'}</TableCell>
                        <TableCell>
                          {med.administered_at ? new Date(med.administered_at).toLocaleString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle>Billing & Charges</CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-lg font-semibold">
                  Total: ${totalCharges.toFixed(2)}
                </div>
                <Button onClick={() => setIsChargeDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Charge
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell>{charge.item_name}</TableCell>
                        <TableCell>{charge.charge_type}</TableCell>
                        <TableCell>{charge.quantity}</TableCell>
                        <TableCell>${charge.unit_price.toFixed(2)}</TableCell>
                        <TableCell>${charge.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCharge(charge.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disposition Tab */}
          <TabsContent value="disposition" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Disposition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visit.disposition ? (
                  <div>
                    <Badge className="text-lg p-2 mb-4">
                      {visit.disposition.replace('-', ' ').toUpperCase()}
                    </Badge>
                    {visit.dispositionDetails && (
                      <p className="text-sm mb-2">{visit.dispositionDetails}</p>
                    )}
                    {visit.disposition === 'admit-ward' || visit.disposition === 'admit-private' ? (
                      <Button onClick={() => setIsIPDDialogOpen(true)} className="mt-4">
                        View IPD Admission
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">No disposition set yet</p>
                    <Button onClick={() => setIsDispositionDialogOpen(true)}>
                      Set Disposition
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {/* Vital Signs Dialog */}
        <Dialog open={isVitalsDialogOpen} onOpenChange={setIsVitalsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Vital Signs</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blood Pressure</Label>
                  <Input
                    value={vitalsForm.bp || ''}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })}
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <Label>Pulse (bpm)</Label>
                  <Input
                    type="number"
                    value={vitalsForm.pulse || ''}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div>
                  <Label>Temperature (°F)</Label>
                  <Input
                    type="number"
                    value={vitalsForm.temp || ''}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, temp: parseFloat(e.target.value) || undefined })}
                  />
                </div>
                <div>
                  <Label>SpO2 (%)</Label>
                  <Input
                    type="number"
                    value={vitalsForm.spo2 || ''}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div>
                  <Label>Respiratory Rate</Label>
                  <Input
                    type="number"
                    value={vitalsForm.resp || ''}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, resp: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div>
                  <Label>Pain Score (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={vitalsForm.pain_score || ''}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, pain_score: parseInt(e.target.value) || undefined })}
                  />
                </div>
              </div>
              <div>
                <Label>Consciousness Level</Label>
                <Select
                  value={vitalsForm.consciousness_level || ''}
                  onValueChange={(value: any) => setVitalsForm({ ...vitalsForm, consciousness_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alert">Alert</SelectItem>
                    <SelectItem value="Drowsy">Drowsy</SelectItem>
                    <SelectItem value="Confused">Confused</SelectItem>
                    <SelectItem value="Unconscious">Unconscious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={vitalsForm.notes || ''}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVitalsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleRecordVitals}>Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Note Dialog */}
        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Treatment Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Note Type</Label>
                <Select
                  value={noteForm.note_type}
                  onValueChange={(value: any) => setNoteForm({ ...noteForm, note_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observation">Observation</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="nursing">Nursing</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Note Text</Label>
                <Textarea
                  value={noteForm.note_text}
                  onChange={(e) => setNoteForm({ ...noteForm, note_text: e.target.value })}
                  rows={6}
                  placeholder="Enter treatment note..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddNote}>Add Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Investigation Dialog */}
        <Dialog open={isInvestigationDialogOpen} onOpenChange={setIsInvestigationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Investigation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Investigation Type</Label>
                <Select
                  value={investigationForm.investigation_type}
                  onValueChange={(value: any) => setInvestigationForm({ ...investigationForm, investigation_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab">Lab Test</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Test Name *</Label>
                <Input
                  value={investigationForm.test_name}
                  onChange={(e) => setInvestigationForm({ ...investigationForm, test_name: e.target.value })}
                  placeholder="Enter test name"
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={investigationForm.priority}
                  onValueChange={(value: any) => setInvestigationForm({ ...investigationForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={investigationForm.notes || ''}
                  onChange={(e) => setInvestigationForm({ ...investigationForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInvestigationDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleOrderInvestigation}>Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Medication Dialog */}
        <Dialog open={isMedicationDialogOpen} onOpenChange={setIsMedicationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Administer Medication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Medication Name *</Label>
                <Input
                  value={medicationForm.medication_name}
                  onChange={(e) => setMedicationForm({ ...medicationForm, medication_name: e.target.value })}
                  placeholder="Enter medication name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dosage *</Label>
                  <Input
                    value={medicationForm.dosage}
                    onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div>
                  <Label>Route</Label>
                  <Select
                    value={medicationForm.route}
                    onValueChange={(value: any) => setMedicationForm({ ...medicationForm, route: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PO">PO (Oral)</SelectItem>
                      <SelectItem value="IV">IV</SelectItem>
                      <SelectItem value="IM">IM</SelectItem>
                      <SelectItem value="Sublingual">Sublingual</SelectItem>
                      <SelectItem value="Topical">Topical</SelectItem>
                      <SelectItem value="Inhalation">Inhalation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Frequency</Label>
                <Input
                  value={medicationForm.frequency || ''}
                  onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                  placeholder="e.g., Q6H, TID"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={medicationForm.status}
                  onValueChange={(value: any) => setMedicationForm({ ...medicationForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="given">Given</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="refused">Refused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={medicationForm.notes || ''}
                  onChange={(e) => setMedicationForm({ ...medicationForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMedicationDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdministerMedication}>Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Charge Dialog */}
        <Dialog open={isChargeDialogOpen} onOpenChange={setIsChargeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Charge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Charge Type</Label>
                <Select
                  value={chargeForm.charge_type}
                  onValueChange={(value: any) => setChargeForm({ ...chargeForm, charge_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="investigation">Investigation</SelectItem>
                    <SelectItem value="bed">Bed</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Item Name *</Label>
                <Input
                  value={chargeForm.item_name}
                  onChange={(e) => setChargeForm({ ...chargeForm, item_name: e.target.value })}
                  placeholder="Enter item name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={chargeForm.quantity}
                    onChange={(e) => setChargeForm({ ...chargeForm, quantity: parseFloat(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={chargeForm.unit_price}
                    onChange={(e) => setChargeForm({ ...chargeForm, unit_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={chargeForm.notes || ''}
                  onChange={(e) => setChargeForm({ ...chargeForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsChargeDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCharge}>Add Charge</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disposition Dialog */}
        <Dialog open={isDispositionDialogOpen} onOpenChange={setIsDispositionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Set Patient Disposition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Disposition *</Label>
                <Select
                  value={dispositionForm.disposition}
                  onValueChange={(value: any) => setDispositionForm({ ...dispositionForm, disposition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discharge">Discharge Home</SelectItem>
                    <SelectItem value="admit-ward">Admit to Ward</SelectItem>
                    <SelectItem value="admit-private">Admit to Private Room</SelectItem>
                    <SelectItem value="transfer">Transfer/Refer</SelectItem>
                    <SelectItem value="absconded">Absconded</SelectItem>
                    <SelectItem value="death">Death</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Disposition Details</Label>
                <Textarea
                  value={dispositionForm.disposition_details}
                  onChange={(e) => setDispositionForm({ ...dispositionForm, disposition_details: e.target.value })}
                  rows={4}
                  placeholder="Enter disposition details..."
                />
              </div>
              {(dispositionForm.disposition === 'discharge' || dispositionForm.disposition === 'admit-ward' || dispositionForm.disposition === 'admit-private') && (
                <>
                  <div>
                    <Label>Condition at Discharge</Label>
                    <Select
                      value={dispositionForm.condition_at_discharge}
                      onValueChange={(value: any) => setDispositionForm({ ...dispositionForm, condition_at_discharge: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="improved">Improved</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Medications Prescribed</Label>
                    <Textarea
                      value={dispositionForm.medications_prescribed}
                      onChange={(e) => setDispositionForm({ ...dispositionForm, medications_prescribed: e.target.value })}
                      rows={3}
                      placeholder="List prescribed medications..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dispositionForm.follow_up_required}
                      onChange={(e) => setDispositionForm({ ...dispositionForm, follow_up_required: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label>Follow-up Required</Label>
                  </div>
                  {dispositionForm.follow_up_required && (
                    <div>
                      <Label>Follow-up Date</Label>
                      <Input
                        type="date"
                        value={dispositionForm.follow_up_date}
                        onChange={(e) => setDispositionForm({ ...dispositionForm, follow_up_date: e.target.value })}
                      />
                    </div>
                  )}
                </>
              )}
              {(dispositionForm.disposition === 'admit-ward' || dispositionForm.disposition === 'admit-private') && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    After setting disposition, you can create IPD admission from the Disposition tab.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDispositionDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDisposition}>Set Disposition</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* IPD Admission Dialog */}
        <Dialog open={isIPDDialogOpen} onOpenChange={setIsIPDDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create IPD Admission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Admission Type *</Label>
                <Select
                  value={ipdForm.admission_type}
                  onValueChange={(value: any) => setIpdForm({ ...ipdForm, admission_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ward">Ward</SelectItem>
                    <SelectItem value="private">Private Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={ipdForm.notes || ''}
                  onChange={(e) => setIpdForm({ ...ipdForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIPDDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleIPDAdmission}>Create Admission</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

