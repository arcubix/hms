/**
 * Message Recipients Configuration Component
 * 
 * Configure which staff members receive specific message notifications:
 * - Doctors (Appointment SMS, OPD SMS, Schedule, Courtesy messages)
 * - Staff (Schedule notifications)
 * - Admin (Schedule and Day End Reports)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Users, Info, CheckCircle, XCircle, Save, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, MessageRecipient } from '../../services/api';

export function MessageRecipientsConfig() {
  const [doctors, setDoctors] = useState<MessageRecipient[]>([]);
  const [staff, setStaff] = useState<MessageRecipient[]>([]);
  const [admins, setAdmins] = useState<MessageRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [localDoctors, setLocalDoctors] = useState<MessageRecipient[]>([]);
  const [localStaff, setLocalStaff] = useState<MessageRecipient[]>([]);
  const [localAdmins, setLocalAdmins] = useState<MessageRecipient[]>([]);

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      setLoading(true);
      const [doctorsData, staffData, adminsData] = await Promise.all([
        api.getMessageRecipients('doctor'),
        api.getMessageRecipients('staff'),
        api.getMessageRecipients('admin')
      ]);
      
      setDoctors(doctorsData);
      setStaff(staffData);
      setAdmins(adminsData);
      setLocalDoctors([...doctorsData]);
      setLocalStaff([...staffData]);
      setLocalAdmins([...adminsData]);
    } catch (error: any) {
      toast.error('Failed to load recipients: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: 'doctor' | 'staff' | 'admin') => {
    try {
      setSaving({ ...saving, [type]: true });
      
      const recipients = type === 'doctor' ? localDoctors : type === 'staff' ? localStaff : localAdmins;
      
      const updates = recipients.map(recipient => ({
        user_id: recipient.user_id,
        user_type: recipient.user_type,
        appointment_sms: recipient.appointment_sms,
        opd_sms: recipient.opd_sms,
        appointment_email: recipient.appointment_email,
        schedule_sms: recipient.schedule_sms,
        schedule_email: recipient.schedule_email,
        courtesy_message: recipient.courtesy_message,
        day_end_report: recipient.day_end_report
      }));
      
      await api.bulkUpdateRecipients(updates);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} notification settings saved successfully!`);
      await loadRecipients(); // Reload to get updated data
    } catch (error: any) {
      toast.error(`Failed to save ${type} settings: ` + (error.message || 'Unknown error'));
    } finally {
      setSaving({ ...saving, [type]: false });
    }
  };

  const handleSelectAll = (type: 'doctor' | 'staff' | 'admin') => {
    const recipients = type === 'doctor' ? localDoctors : type === 'staff' ? localStaff : localAdmins;
    const setRecipients = type === 'doctor' ? setLocalDoctors : type === 'staff' ? setLocalStaff : setLocalAdmins;
    
    const updated = recipients.map(r => ({
      ...r,
      appointment_sms: true,
      opd_sms: true,
      appointment_email: true,
      schedule_sms: true,
      schedule_email: true,
      courtesy_message: true,
      day_end_report: type === 'admin' ? true : r.day_end_report
    }));
    
    setRecipients(updated);
    toast.info(`All ${type} notifications selected`);
  };

  const handleClearAll = (type: 'doctor' | 'staff' | 'admin') => {
    const recipients = type === 'doctor' ? localDoctors : type === 'staff' ? localStaff : localAdmins;
    const setRecipients = type === 'doctor' ? setLocalDoctors : type === 'staff' ? setLocalStaff : setLocalAdmins;
    
    const updated = recipients.map(r => ({
      ...r,
      appointment_sms: false,
      opd_sms: false,
      appointment_email: false,
      schedule_sms: false,
      schedule_email: false,
      courtesy_message: false,
      day_end_report: false
    }));
    
    setRecipients(updated);
    toast.info(`All ${type} notifications cleared`);
  };

  const handleCheckboxChange = (
    type: 'doctor' | 'staff' | 'admin',
    userId: number,
    field: keyof MessageRecipient,
    value: boolean
  ) => {
    const recipients = type === 'doctor' ? localDoctors : type === 'staff' ? localStaff : localAdmins;
    const setRecipients = type === 'doctor' ? setLocalDoctors : type === 'staff' ? setLocalStaff : setLocalAdmins;
    
    const updated = recipients.map(r => 
      r.user_id === userId ? { ...r, [field]: value } : r
    );
    
    setRecipients(updated);
  };

  return (
    <div className="space-y-6">
      {/* Message Recipients Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Message Recipients Configuration
          </CardTitle>
          <CardDescription>Configure which staff members receive specific message notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="doctors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="doctors">Doctors</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {/* DOCTORS TAB */}
            <TabsContent value="doctors" className="space-y-4 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Configure which doctors receive automated messages for appointments, OPD, schedules, and courtesy notifications
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">DOCTOR</TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>APPOINTMENT SMS</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>OPD SMS</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>APPOINTMENT EMAIL</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>SCHEDULE SMS</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>SCHEDULE EMAIL</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>COURTESY MESSAGE</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {localDoctors.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No doctors found
                            </TableCell>
                          </TableRow>
                        ) : (
                          localDoctors.map((doctor) => (
                            <TableRow key={doctor.user_id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{doctor.user_name}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={doctor.appointment_sms}
                                    onChange={(e) => handleCheckboxChange('doctor', doctor.user_id, 'appointment_sms', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={doctor.opd_sms}
                                    onChange={(e) => handleCheckboxChange('doctor', doctor.user_id, 'opd_sms', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={doctor.appointment_email}
                                    onChange={(e) => handleCheckboxChange('doctor', doctor.user_id, 'appointment_email', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={doctor.schedule_sms}
                                    onChange={(e) => handleCheckboxChange('doctor', doctor.user_id, 'schedule_sms', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={doctor.schedule_email}
                                    onChange={(e) => handleCheckboxChange('doctor', doctor.user_id, 'schedule_email', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={doctor.courtesy_message}
                                    onChange={(e) => handleCheckboxChange('doctor', doctor.user_id, 'courtesy_message', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleSelectAll('doctor')}>
                        <CheckCircle className="w-3 h-3 mr-2" />
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleClearAll('doctor')}>
                        <XCircle className="w-3 h-3 mr-2" />
                        Clear All
                      </Button>
                    </div>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700" 
                      onClick={() => handleSave('doctor')}
                      disabled={saving.doctor}
                    >
                      {saving.doctor ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Configuration
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* STAFF TAB */}
            <TabsContent value="staff" className="space-y-4 mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-900 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Configure which staff members receive schedule notifications via SMS and Email
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">STAFF</TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>SCHEDULE SMS</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>SCHEDULE EMAIL</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {localStaff.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                              No staff members found
                            </TableCell>
                          </TableRow>
                        ) : (
                          localStaff.map((staffMember) => (
                            <TableRow key={staffMember.user_id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{staffMember.user_name}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={staffMember.schedule_sms}
                                    onChange={(e) => handleCheckboxChange('staff', staffMember.user_id, 'schedule_sms', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={staffMember.schedule_email}
                                    onChange={(e) => handleCheckboxChange('staff', staffMember.user_id, 'schedule_email', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleSelectAll('staff')}>
                        <CheckCircle className="w-3 h-3 mr-2" />
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleClearAll('staff')}>
                        <XCircle className="w-3 h-3 mr-2" />
                        Clear All
                      </Button>
                    </div>
                    <Button 
                      className="bg-green-600 hover:bg-green-700" 
                      onClick={() => handleSave('staff')}
                      disabled={saving.staff}
                    >
                      {saving.staff ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Configuration
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ADMIN TAB */}
            <TabsContent value="admin" className="space-y-4 mt-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-900 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Configure which administrators receive schedule notifications and day-end reports
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">ADMIN</TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>SCHEDULE SMS</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>SCHEDULE EMAIL</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold">
                            <div className="flex flex-col items-center gap-1">
                              <span>DAY END REPORT</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {localAdmins.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                              No administrators found
                            </TableCell>
                          </TableRow>
                        ) : (
                          localAdmins.map((admin) => (
                            <TableRow key={admin.user_id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{admin.user_name}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={admin.schedule_sms}
                                    onChange={(e) => handleCheckboxChange('admin', admin.user_id, 'schedule_sms', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={admin.schedule_email}
                                    onChange={(e) => handleCheckboxChange('admin', admin.user_id, 'schedule_email', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={admin.day_end_report}
                                    onChange={(e) => handleCheckboxChange('admin', admin.user_id, 'day_end_report', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleSelectAll('admin')}>
                        <CheckCircle className="w-3 h-3 mr-2" />
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleClearAll('admin')}>
                        <XCircle className="w-3 h-3 mr-2" />
                        Clear All
                      </Button>
                    </div>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700" 
                      onClick={() => handleSave('admin')}
                      disabled={saving.admin}
                    >
                      {saving.admin ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Configuration
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification Settings Help */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Message Configuration Guide</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Appointment SMS:</strong> Sent to doctors when new appointments are booked</p>
                <p><strong>OPD SMS:</strong> Daily OPD schedule reminders and updates</p>
                <p><strong>Schedule SMS/Email:</strong> Weekly or daily schedule notifications</p>
                <p><strong>Courtesy Messages:</strong> Thank you and follow-up messages after consultations</p>
                <p><strong>Day End Report:</strong> Daily summary reports sent to administrators</p>
              </div>
              <Button variant="outline" className="mt-4">
                <FileText className="w-4 h-4 mr-2" />
                View Full Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

