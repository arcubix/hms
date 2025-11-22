/**
 * Message Recipients Configuration Component
 * 
 * Configure which staff members receive specific message notifications:
 * - Doctors (Appointment SMS, OPD SMS, Schedule, Courtesy messages)
 * - Staff (Schedule notifications)
 * - Admin (Schedule and Day End Reports)
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Users, Info, CheckCircle, XCircle, Save, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function MessageRecipientsConfig() {
  const handleSave = (type: string) => {
    toast.success(`${type} notification settings saved successfully!`);
  };

  const handleSelectAll = (type: string) => {
    toast.info(`All ${type} notifications selected`);
  };

  const handleClearAll = (type: string) => {
    toast.info(`All ${type} notifications cleared`);
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
                    {[
                      { name: 'Dr Abhilash', appointmentSms: false, opdSms: false, appointmentEmail: true, scheduleSms: false, scheduleEmail: true, courtesyMsg: false },
                      { name: 'Dr Abdul aziz', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Ahmad khanzada', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Anitha Gandhi', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'DR Asim Iqbal', appointmentSms: true, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr balkris sam', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Gurdarshna Duggal', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Faheemul Haq', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Hadi shaheer hussain', appointmentSms: true, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Imran umer', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Irfan zafar', appointmentSms: true, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Jawed Akhtar Kakar', appointmentSms: true, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr M Imranhabib', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr M Ismail Baloch', appointmentSms: true, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Muhammad Khusaini billaili', appointmentSms: false, opdSms: false, appointmentEmail: true, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr mayam alihssan', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Kamran', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Shoaib Shah', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Salma shaikh', appointmentSms: true, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'dr saraab gulshan', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Dr Suhail Anwar', appointmentSms: true, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'umair', appointmentSms: false, opdSms: true, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'Muha', appointmentSms: false, opdSms: false, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false },
                      { name: 'John', appointmentSms: true, opdSms: true, appointmentEmail: false, scheduleSms: false, scheduleEmail: false, courtesyMsg: false }
                    ].map((doctor, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={doctor.appointmentSms}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={doctor.opdSms}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={doctor.appointmentEmail}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={doctor.scheduleSms}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={doctor.scheduleEmail}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={doctor.courtesyMsg}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave('Doctor')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </TabsContent>

            {/* STAFF TAB */}
            <TabsContent value="staff" className="space-y-4 mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-900 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Configure which staff members receive schedule notifications via SMS and Email
                </p>
              </div>

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
                    {[
                      { name: 'AFZANA CARVALH', scheduleSms: true, scheduleEmail: false },
                      { name: 'ISRAR TALLEST', scheduleSms: true, scheduleEmail: false },
                      { name: 'MYBIN', scheduleSms: true, scheduleEmail: false },
                      { name: 'SHAHABA IFTNT', scheduleSms: true, scheduleEmail: false }
                    ].map((staff, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={staff.scheduleSms}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={staff.scheduleEmail}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSave('Staff')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </TabsContent>

            {/* ADMIN TAB */}
            <TabsContent value="admin" className="space-y-4 mt-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-900 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Configure which administrators receive schedule notifications and day-end reports
                </p>
              </div>

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
                    {[
                      { name: 'Admin Form (Medical Complex)', scheduleSms: false, scheduleEmail: true, dayEndReport: true },
                      { name: 'Mahira', scheduleSms: false, scheduleEmail: true, dayEndReport: false }
                    ].map((admin, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{admin.name}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={admin.scheduleSms}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={admin.scheduleEmail}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              defaultChecked={admin.dayEndReport}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleSave('Admin')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
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
