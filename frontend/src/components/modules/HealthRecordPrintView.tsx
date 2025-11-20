import { Button } from '../ui/button';
import { ArrowLeft, Printer } from 'lucide-react';

interface VitalRecord {
  pulseHeartRate: string;
  temperature: string;
  bloodPressure: string;
  respiratoryRate: string;
  bloodSugar: string;
  weight: string;
  height?: string;
  bmi?: string;
  oxygenSaturation?: string;
  bodySurfaceArea?: string;
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
  prescriptionText?: string;
  labTests?: string[];
}

interface HealthRecordPrintViewProps {
  record: HealthRecordEntry;
  onBack: () => void;
}

export function HealthRecordPrintView({ record, onBack }: HealthRecordPrintViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Print Header - Hidden when printing */}
      <div className="print:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Print Content - A4 Size */}
      <div className="max-w-4xl mx-auto p-8 bg-white print:p-8" style={{ minHeight: '297mm' }}>
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HEALTH RECORD</h1>
          <p className="text-sm text-gray-600">Medical Prescription & Consultation Report</p>
        </div>

        {/* Patient Information */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Patient Information</p>
            <p className="text-sm text-gray-900"><strong>Name:</strong> {record.patientName}</p>
            <p className="text-sm text-gray-900"><strong>MRN:</strong> {record.mrn}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Consultation Details</p>
            <p className="text-sm text-gray-900"><strong>Date:</strong> {record.createdAt}</p>
            <p className="text-sm text-gray-900"><strong>Time:</strong> {record.addedAt}</p>
            <p className="text-sm text-gray-900"><strong>Doctor:</strong> {record.addedBy}</p>
          </div>
        </div>

        {/* Vitals Section */}
        <div className="mb-6 border border-gray-300 p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">VITAL SIGNS</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Pulse/Heart Rate:</span>
              <span className="ml-2 text-gray-900">{record.vitals.pulseHeartRate} bpm</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Temperature:</span>
              <span className="ml-2 text-gray-900">{record.vitals.temperature} °F</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Blood Pressure:</span>
              <span className="ml-2 text-gray-900">{record.vitals.bloodPressure} mmHg</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Respiratory Rate:</span>
              <span className="ml-2 text-gray-900">{record.vitals.respiratoryRate} breaths/min</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Blood Sugar:</span>
              <span className="ml-2 text-gray-900">{record.vitals.bloodSugar} mg/dL</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Weight:</span>
              <span className="ml-2 text-gray-900">{record.vitals.weight}</span>
            </div>
            {record.vitals.height && (
              <div>
                <span className="font-semibold text-gray-700">Height:</span>
                <span className="ml-2 text-gray-900">{record.vitals.height}</span>
              </div>
            )}
            {record.vitals.bmi && (
              <div>
                <span className="font-semibold text-gray-700">BMI:</span>
                <span className="ml-2 text-gray-900">{record.vitals.bmi}</span>
              </div>
            )}
            {record.vitals.oxygenSaturation && (
              <div>
                <span className="font-semibold text-gray-700">Oxygen Saturation:</span>
                <span className="ml-2 text-gray-900">{record.vitals.oxygenSaturation}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Chief Complaint */}
        {record.complaints && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-2">CHIEF COMPLAINT</h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{record.complaints}</p>
          </div>
        )}

        {/* Diagnosis */}
        {record.diagnosis && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-2">DIAGNOSIS</h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{record.diagnosis}</p>
          </div>
        )}

        {/* Prescription */}
        {record.prescriptionText && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-2">PRESCRIPTION</h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{record.prescriptionText}</p>
          </div>
        )}

        {/* Lab Tests */}
        {record.labTests && record.labTests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-2">LABORATORY TESTS</h2>
            <ul className="list-disc list-inside text-sm text-gray-900">
              {record.labTests.map((test, index) => (
                <li key={index}>{test}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-800">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-semibold text-gray-900 border-b border-gray-400 pb-1 mb-2" style={{ width: '200px' }}>
                Doctor's Signature
              </p>
              <p className="text-xs text-gray-600">{record.addedBy}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Date: {record.createdAt}</p>
              <p className="text-xs text-gray-600">Time: {record.addedAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-8 {
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}

