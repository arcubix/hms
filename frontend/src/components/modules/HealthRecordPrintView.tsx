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

interface PrescriptionMedicine {
  medicine_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  timing?: string;
  instructions?: string;
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
  prescriptionText?: string;
  labTests?: string[];
  medicines?: PrescriptionMedicine[];
  advice?: string;
  followUpDate?: string;
  patientAddress?: string;
  patientGender?: string;
}

interface HealthRecordPrintViewProps {
  record: HealthRecordEntry;
  onBack: () => void;
}

export function HealthRecordPrintView({ record, onBack }: HealthRecordPrintViewProps) {
  const handlePrint = () => {
    window.print();
  };

  // Format date for display (DD-MMM-YYYY, HH:MM AM/PM)
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${day}-${month}-${year}, ${displayHours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  // Format follow-up date (DD-MM-YYYY)
  const formatFollowUpDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  const prescriptionDateTime = formatDateTime(record.createdAt);
  const patientId = record.mrn || 'N/A';
  const patientGender = record.patientGender || '';
  const patientAddress = record.patientAddress || '';
  const temperature = record.vitals.temperature || '-';
  const bloodPressure = record.vitals.bloodPressure || '-';
  const advice = record.advice || record.diagnosis || '';
  const followUpDate = formatFollowUpDate(record.followUpDate);

  // Format medicine dosage for display
  const formatDosage = (medicine: PrescriptionMedicine) => {
    const parts: string[] = [];
    
    // Extract frequency and timing
    if (medicine.frequency) {
      // Convert frequency to readable format
      let freq = medicine.frequency.toLowerCase();
      if (freq.includes('once')) {
        parts.push('1 Morning');
      } else if (freq.includes('twice')) {
        parts.push('1 Morning, 1 Night');
      } else if (freq.includes('three')) {
        parts.push('1 Morning, 1 Aft, 1 Eve, 1 Night');
      } else if (freq.includes('four')) {
        parts.push('1 Morning, 1 Aft, 1 Eve, 1 Night');
      } else {
        // Try to extract numbers
        const freqMatch = freq.match(/(\d+)/);
        if (freqMatch) {
          const count = parseInt(freqMatch[1]);
          if (count === 1) parts.push('1 Morning');
          else if (count === 2) parts.push('1 Morning, 1 Night');
          else if (count === 3) parts.push('1 Morning, 1 Aft, 1 Night');
          else parts.push(medicine.frequency);
        } else {
          parts.push(medicine.frequency);
        }
      }
    }
    
    // Add timing/instructions
    if (medicine.timing || medicine.instructions) {
      const timing = medicine.timing || medicine.instructions || '';
      if (timing.toLowerCase().includes('before')) {
        parts.push('(Before Food)');
      } else if (timing.toLowerCase().includes('after')) {
        parts.push('(After Food)');
      } else if (timing.toLowerCase().includes('with')) {
        parts.push('(With Food)');
      }
    }
    
    return parts.join(' ');
  };

  // Format duration for display
  const formatDuration = (medicine: PrescriptionMedicine) => {
    if (!medicine.duration) return '-';
    
    // Extract number of days
    const daysMatch = medicine.duration.match(/(\d+)/);
    const days = daysMatch ? daysMatch[1] : '';
    
    if (!days) return medicine.duration;
    
    // Calculate total quantity
    let totalQuantity = 0;
    if (medicine.quantity) {
      totalQuantity = medicine.quantity * parseInt(days);
    } else {
      // Estimate based on frequency
      const freq = medicine.frequency?.toLowerCase() || '';
      let timesPerDay = 1;
      if (freq.includes('twice')) timesPerDay = 2;
      else if (freq.includes('three')) timesPerDay = 3;
      else if (freq.includes('four')) timesPerDay = 4;
      totalQuantity = timesPerDay * parseInt(days);
    }
    
    // Determine unit (Tab/Cap/Syrup etc.)
    const medName = medicine.medicine_name.toLowerCase();
    let unit = 'Tab';
    if (medName.includes('cap') || medName.includes('capsule')) unit = 'Cap';
    else if (medName.includes('syrup') || medName.includes('susp')) unit = 'Bottle';
    else if (medName.includes('inj') || medName.includes('injection')) unit = 'Vial';
    
    return `${days} Days (Tot:${totalQuantity} ${unit})`;
  };

  // Format medicine name with prefix
  const formatMedicineName = (medicine: PrescriptionMedicine) => {
    const name = medicine.medicine_name;
    const nameLower = name.toLowerCase();
    
    // Add prefix based on medicine type
    if (nameLower.includes('tab') || nameLower.startsWith('tab.')) {
      return name.startsWith('TAB.') || name.startsWith('tab.') ? name.toUpperCase() : `TAB. ${name.toUpperCase()}`;
    } else if (nameLower.includes('cap') || nameLower.includes('capsule') || nameLower.startsWith('cap.')) {
      return name.startsWith('CAP.') || name.startsWith('cap.') ? name.toUpperCase() : `CAP. ${name.toUpperCase()}`;
    } else if (nameLower.includes('syrup') || nameLower.includes('susp')) {
      return name.startsWith('SYR.') || name.startsWith('syr.') ? name.toUpperCase() : `SYR. ${name.toUpperCase()}`;
    } else if (nameLower.includes('inj') || nameLower.includes('injection')) {
      return name.startsWith('INJ.') || name.startsWith('inj.') ? name.toUpperCase() : `INJ. ${name.toUpperCase()}`;
    }
    
    // Default to TAB if no prefix
    return name.startsWith('TAB.') || name.startsWith('tab.') ? name.toUpperCase() : `TAB. ${name.toUpperCase()}`;
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

      {/* Print Content - Prescription Format */}
      <div className="max-w-4xl mx-auto p-6 bg-white print:p-6" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', position: 'relative' }}>
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none print:block hidden" style={{ opacity: 0.05, zIndex: 0 }}>
          <div className="text-6xl font-bold text-gray-400" style={{ transform: 'rotate(-45deg)' }}>LOREM IPSUM</div>
        </div>

        {/* Header Section - Doctor and Clinic Info */}
        <div className="flex justify-between items-start mb-3 border-b-2 border-black pb-2 relative" style={{ zIndex: 1 }}>
          {/* Left Side - Doctor Info */}
          <div className="flex-1">
            <h2 className="text-base font-bold text-black mb-0.5" style={{ fontSize: '14px', fontWeight: 'bold' }}>Dr. {record.addedBy}</h2>
            <p className="text-xs text-black mb-0.5" style={{ fontSize: '11px' }}>M.B.B.S., M.D., M.S. | Reg. No: 270988 |</p>
            <p className="text-xs text-black" style={{ fontSize: '11px' }}>Mob. No: 8983390126</p>
          </div>

          {/* Center - Logo placeholder */}
          <div className="flex-shrink-0 mx-3 relative" style={{ zIndex: 1 }}>
            <div className="w-14 h-14 border border-gray-300 flex items-center justify-center bg-white" style={{ border: '1px solid #ccc' }}>
              <span className="text-xs text-gray-400" style={{ fontSize: '9px' }}>LOGO</span>
            </div>
          </div>

          {/* Right Side - Clinic Info */}
          <div className="flex-1 text-right">
            <h2 className="text-base font-bold text-black mb-0.5" style={{ fontSize: '14px', fontWeight: 'bold' }}>Care Clinic</h2>
            <p className="text-xs text-black mb-0.5" style={{ fontSize: '11px' }}>Near Axis Bank, Kothrud, Pune - 411038.</p>
            <p className="text-xs text-black" style={{ fontSize: '11px' }}>Ph: 094233 80390, Timing: 09:00 AM - 02:00 PM | Closed: Thursday</p>
          </div>
        </div>

        {/* Date and Time */}
        <div className="text-right mb-2 relative" style={{ zIndex: 1 }}>
          <p className="text-xs text-black" style={{ fontSize: '11px' }}>Date: {prescriptionDateTime}</p>
        </div>

        {/* Patient Details */}
        <div className="mb-3 relative" style={{ zIndex: 1 }}>
          <div className="flex items-start gap-3">
            {/* Large R (Rx) symbol */}
            <div className="text-5xl font-bold text-black leading-none" style={{ fontFamily: 'serif', fontSize: '48px', lineHeight: '1' }}>R</div>
            
            {/* Patient Info */}
            <div className="flex-1">
              <p className="text-xs text-black mb-0.5" style={{ fontSize: '11px' }}>
                <strong>ID:</strong> {patientId} - {record.patientName.toUpperCase()} ({patientGender || 'M'})
              </p>
              {patientAddress && (
                <p className="text-xs text-black mb-0.5" style={{ fontSize: '11px' }}>
                  <strong>Address:</strong> {patientAddress}
                </p>
              )}
              <p className="text-xs text-black" style={{ fontSize: '11px' }}>
                <strong>Temp (deg):</strong> {temperature}, <strong>BP:</strong> {bloodPressure} mmHg
              </p>
            </div>
          </div>
        </div>

        {/* Prescription Table */}
        {record.medicines && record.medicines.length > 0 ? (
          <div className="mb-3 relative" style={{ zIndex: 1 }}>
            <table className="w-full border-collapse" style={{ border: '1px solid #000', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th className="border border-black px-2 py-1.5 text-left font-bold text-black" style={{ border: '1px solid #000', fontSize: '11px', fontWeight: 'bold' }}>
                    Medicine Name
                  </th>
                  <th className="border border-black px-2 py-1.5 text-left font-bold text-black" style={{ border: '1px solid #000', fontSize: '11px', fontWeight: 'bold' }}>
                    Dosage
                  </th>
                  <th className="border border-black px-2 py-1.5 text-left font-bold text-black" style={{ border: '1px solid #000', fontSize: '11px', fontWeight: 'bold' }}>
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {record.medicines.map((medicine, index) => (
                  <tr key={index}>
                    <td className="border border-black px-2 py-1.5 text-black" style={{ border: '1px solid #000', fontSize: '11px' }}>
                      {formatMedicineName(medicine)}
                    </td>
                    <td className="border border-black px-2 py-1.5 text-black" style={{ border: '1px solid #000', fontSize: '11px' }}>
                      {formatDosage(medicine)}
                    </td>
                    <td className="border border-black px-2 py-1.5 text-black" style={{ border: '1px solid #000', fontSize: '11px' }}>
                      {formatDuration(medicine)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : record.prescriptionText ? (
          <div className="mb-3 relative" style={{ zIndex: 1 }}>
            <p className="text-xs text-black whitespace-pre-wrap" style={{ fontSize: '11px' }}>{record.prescriptionText}</p>
          </div>
        ) : null}

        {/* Advice Section */}
        {advice && (
          <div className="mb-2 relative" style={{ zIndex: 1 }}>
            <p className="text-xs text-black" style={{ fontSize: '11px' }}>
              <strong>Advice Given:</strong> * {advice}
            </p>
          </div>
        )}

        {/* Follow Up */}
        {followUpDate && (
          <div className="mb-3 relative" style={{ zIndex: 1 }}>
            <p className="text-xs text-black" style={{ fontSize: '11px' }}>
              <strong>Follow Up:</strong> {followUpDate}
            </p>
          </div>
        )}

        {/* Charts Section */}
        <div className="mb-4 relative" style={{ zIndex: 1 }}>
          <h3 className="text-xs font-bold text-black mb-2" style={{ fontSize: '11px', fontWeight: 'bold' }}>Charts</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Temperature Chart */}
            <div className="border border-gray-400 p-2 bg-white" style={{ height: '140px', border: '1px solid #666' }}>
              <p className="text-xs font-semibold text-black mb-1" style={{ fontSize: '10px', fontWeight: 'bold' }}>Temperature (Deg C)</p>
              <div className="text-xs text-gray-500 text-center mt-6" style={{ fontSize: '9px' }}>Chart placeholder</div>
            </div>
            {/* Blood Pressure Chart */}
            <div className="border border-gray-400 p-2 bg-white" style={{ height: '140px', border: '1px solid #666' }}>
              <p className="text-xs font-semibold text-black mb-1" style={{ fontSize: '10px', fontWeight: 'bold' }}>Blood Pressure</p>
              <div className="text-xs text-gray-500 text-center mt-6" style={{ fontSize: '9px' }}>Chart placeholder</div>
            </div>
          </div>
        </div>

        {/* Doctor's Signature */}
        <div className="mt-6 flex justify-end relative" style={{ zIndex: 1 }}>
          <div className="text-right">
            <p className="text-xs text-black mb-1" style={{ fontSize: '11px', fontFamily: 'cursive' }}>Signature</p>
            <div className="border-t-2 border-black w-40 mb-1" style={{ borderTop: '2px solid #000', width: '160px' }}></div>
            <p className="text-xs text-black font-semibold" style={{ fontSize: '11px', fontWeight: 'bold' }}>Dr. {record.addedBy} M.B.B.S., M.D., M.S.</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          .print\\:block {
            display: block !important;
          }
          table {
            page-break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
