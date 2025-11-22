/**
 * Emergency History Detail Component
 * Shows complete patient visit details with PDF export
 */

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  X,
  Download,
  Printer,
  Calendar,
  Clock,
  User,
  FileText,
  Activity,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Building2,
  UserCircle,
  Phone,
  Mail,
  MapPin,
  Heart,
  Thermometer,
  Droplets,
  Syringe,
  TestTube,
  Scan,
  Pill
} from 'lucide-react';
import { toast } from 'sonner';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface HistoryDetailProps {
  record: any;
  onClose: () => void;
}

export function EmergencyHistoryDetail({ record, onClose }: HistoryDetailProps) {
  
  const generatePDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFillColor(47, 128, 237);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('Emergency Department Visit Report', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 25, { align: 'center' });

      yPosition = 45;
      doc.setTextColor(0, 0, 0);

      // Patient Information Section
      doc.setFillColor(240, 248, 255);
      doc.rect(10, yPosition, pageWidth - 20, 50, 'F');
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Patient Information', 15, yPosition + 8);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      yPosition += 15;
      
      doc.text(`Patient Name: ${record.patientName}`, 15, yPosition);
      doc.text(`UHID: ${record.uhid}`, 120, yPosition);
      yPosition += 7;
      
      doc.text(`ER Number: ${record.erNumber}`, 15, yPosition);
      doc.text(`Visit Date: ${record.visitDate}`, 120, yPosition);
      yPosition += 7;
      
      doc.text(`Age: 45 Years`, 15, yPosition);
      doc.text(`Gender: Male`, 120, yPosition);
      yPosition += 7;
      
      doc.text(`Contact: +1-555-0199`, 15, yPosition);
      doc.text(`Email: patient@email.com`, 120, yPosition);
      
      yPosition += 15;

      // Visit Details Section
      doc.setFillColor(255, 250, 240);
      doc.rect(10, yPosition, pageWidth - 20, 45, 'F');
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Visit Details', 15, yPosition + 8);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      yPosition += 15;
      
      doc.text(`Attending Physician: ${record.doctor}`, 15, yPosition);
      doc.text(`Duration: ${record.duration}`, 120, yPosition);
      yPosition += 7;
      
      doc.text(`Arrival Time: 08:30 AM`, 15, yPosition);
      doc.text(`Discharge Time: ${record.duration ? '01:00 PM' : 'N/A'}`, 120, yPosition);
      yPosition += 7;
      
      doc.text(`Disposition: ${record.disposition}`, 15, yPosition);
      
      yPosition += 15;

      // Clinical Assessment Section
      doc.setFillColor(255, 240, 245);
      doc.rect(10, yPosition, pageWidth - 20, 50, 'F');
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Clinical Assessment', 15, yPosition + 8);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      yPosition += 15;
      
      doc.text('Chief Complaint:', 15, yPosition);
      yPosition += 5;
      const complaintLines = doc.splitTextToSize(record.chiefComplaint, pageWidth - 30);
      doc.text(complaintLines, 15, yPosition);
      yPosition += complaintLines.length * 5 + 5;
      
      doc.text('Diagnosis:', 15, yPosition);
      yPosition += 5;
      const diagnosisLines = doc.splitTextToSize(record.diagnosis, pageWidth - 30);
      doc.text(diagnosisLines, 15, yPosition);
      
      yPosition += diagnosisLines.length * 5 + 10;

      // Treatment Section
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(240, 255, 240);
      doc.rect(10, yPosition, pageWidth - 20, 40, 'F');
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Treatment Provided', 15, yPosition + 8);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      yPosition += 15;
      
      const treatmentLines = doc.splitTextToSize(record.treatment, pageWidth - 30);
      doc.text(treatmentLines, 15, yPosition);
      
      yPosition += treatmentLines.length * 5 + 15;

      // Vital Signs Table
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Vital Signs', 15, yPosition);
      yPosition += 5;

      doc.autoTable({
        startY: yPosition,
        head: [['Parameter', 'Value', 'Status']],
        body: [
          ['Blood Pressure', '120/80 mmHg', 'Normal'],
          ['Heart Rate', '72 bpm', 'Normal'],
          ['Temperature', '98.6°F', 'Normal'],
          ['SpO2', '98%', 'Normal'],
          ['Respiratory Rate', '16/min', 'Normal']
        ],
        theme: 'grid',
        headStyles: { fillColor: [47, 128, 237] },
        margin: { left: 15, right: 15 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Lab Tests Table
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Laboratory Tests', 15, yPosition);
      yPosition += 5;

      doc.autoTable({
        startY: yPosition,
        head: [['Test', 'Result', 'Reference Range', 'Status']],
        body: [
          ['Complete Blood Count', 'Normal', 'Normal Range', 'Normal'],
          ['Cardiac Enzymes', 'Elevated', '0-0.04 ng/mL', 'Abnormal'],
          ['Electrolytes', 'Normal', 'Normal Range', 'Normal']
        ],
        theme: 'grid',
        headStyles: { fillColor: [47, 128, 237] },
        margin: { left: 15, right: 15 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Medications Table
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Medications Administered', 15, yPosition);
      yPosition += 5;

      doc.autoTable({
        startY: yPosition,
        head: [['Medication', 'Dose', 'Route', 'Time']],
        body: [
          ['Aspirin', '325 mg', 'Oral', '08:45 AM'],
          ['Morphine', '5 mg', 'IV', '09:00 AM'],
          ['Ondansetron', '4 mg', 'IV', '09:15 AM']
        ],
        theme: 'grid',
        headStyles: { fillColor: [47, 128, 237] },
        margin: { left: 15, right: 15 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Procedures
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(255, 248, 240);
      doc.rect(10, yPosition, pageWidth - 20, 30, 'F');
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Procedures Performed', 15, yPosition + 8);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      yPosition += 15;
      doc.text('• ECG (12-lead)', 20, yPosition);
      yPosition += 6;
      doc.text('• Chest X-Ray', 20, yPosition);
      yPosition += 6;
      doc.text('• IV Line Placement', 20, yPosition);

      // Footer on each page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          'Hospital Management System - Emergency Department',
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      // Save PDF
      doc.save(`Emergency_Visit_${record.erNumber}_${record.patientName.replace(/\s+/g, '_')}.pdf`);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Emergency Visit Details</h2>
            <p className="text-sm text-gray-600 mt-1">Complete visit record for {record.patientName}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generatePDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="font-semibold text-gray-900 mt-1">{record.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">UHID</p>
                    <p className="font-semibold text-blue-700 mt-1">{record.uhid}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ER Number</p>
                    <p className="font-semibold text-purple-700 mt-1">{record.erNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age / Gender</p>
                    <p className="font-semibold text-gray-900 mt-1">45 Years / Male</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-semibold text-gray-900 mt-1">+1-555-0199</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900 mt-1 text-xs">patient@email.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visit Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Visit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Visit Date</p>
                    <p className="font-semibold text-gray-900 mt-1">{record.visitDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Arrival Time</p>
                    <p className="font-semibold text-gray-900 mt-1">08:30 AM</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-orange-700 mt-1">{record.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Attending Doctor</p>
                    <p className="font-semibold text-gray-900 mt-1">{record.doctor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Disposition</p>
                    <Badge className="mt-1 bg-green-100 text-green-800">{record.disposition}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Triage Level</p>
                    <Badge className="mt-1 bg-red-100 text-red-800">ESI Level 2</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Assessment */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-100">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-red-600" />
                  Clinical Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Chief Complaint</p>
                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <p className="text-gray-900">{record.chiefComplaint}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Diagnosis</p>
                  <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <p className="text-gray-900 font-semibold">{record.diagnosis}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Treatment Provided</p>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-gray-900">{record.treatment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-100">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-600" />
                  Vital Signs (On Arrival)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Blood Pressure</p>
                    <p className="text-xl font-bold text-red-700">120/80</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">Normal</Badge>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Heart Rate</p>
                    <p className="text-xl font-bold text-blue-700">72 bpm</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">Normal</Badge>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Temperature</p>
                    <p className="text-xl font-bold text-orange-700">98.6°F</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">Normal</Badge>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">SpO2</p>
                    <p className="text-xl font-bold text-green-700">98%</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">Normal</Badge>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Resp. Rate</p>
                    <p className="text-xl font-bold text-purple-700">16/min</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">Normal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Laboratory Tests */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-indigo-600" />
                  Laboratory Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Complete Blood Count (CBC)</p>
                      <p className="text-sm text-gray-600">Normal range</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Cardiac Enzymes (Troponin)</p>
                      <p className="text-sm text-gray-600">Elevated - 0.08 ng/mL</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Abnormal</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Electrolyte Panel</p>
                      <p className="text-sm text-gray-600">Within normal limits</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-yellow-600" />
                  Medications Administered
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Aspirin</p>
                      <p className="text-sm text-gray-600">325 mg • Oral • 08:45 AM</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Administered</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Morphine</p>
                      <p className="text-sm text-gray-600">5 mg • IV • 09:00 AM</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Administered</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Ondansetron</p>
                      <p className="text-sm text-gray-600">4 mg • IV • 09:15 AM</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Administered</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Procedures */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-600" />
                  Procedures Performed
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 text-cyan-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">ECG (12-lead)</p>
                      <p className="text-sm text-gray-600">Performed at 08:50 AM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Scan className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Chest X-Ray</p>
                      <p className="text-sm text-gray-600">Performed at 09:30 AM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Syringe className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">IV Line Placement</p>
                      <p className="text-sm text-gray-600">Performed at 08:45 AM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}