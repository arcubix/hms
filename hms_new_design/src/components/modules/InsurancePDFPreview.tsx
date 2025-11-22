/**
 * Insurance Company PDF Preview Component
 * 
 * Displays comprehensive insurance company information in a printable PDF format
 * Including: Basic info, contact details, and complete pricing configuration
 */

import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  X,
  Download,
  Printer,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Shield,
  FileText,
  CheckCircle,
  Stethoscope,
  FlaskConical,
  Target,
  Pill
} from 'lucide-react';

interface ProcedurePrice {
  id: string;
  name: string;
  price: number;
  active: boolean;
  category: 'procedures' | 'laboratory' | 'radiology' | 'pharmacy';
}

interface InsurancePDFPreviewProps {
  insuranceName: string;
  policyPrefix: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  creditAllowance: string;
  discountRate: string;
  status: string;
  contractDate: string;
  procedurePrices: ProcedurePrice[];
  onClose: () => void;
}

export function InsurancePDFPreview({
  insuranceName,
  policyPrefix,
  contactPerson,
  phone,
  email,
  website,
  address,
  creditAllowance,
  discountRate,
  status,
  contractDate,
  procedurePrices,
  onClose
}: InsurancePDFPreviewProps) {

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    alert('PDF download functionality would be implemented here using a library like jsPDF or react-pdf');
  };

  const procedures = procedurePrices.filter(p => p.category === 'procedures' && p.active);
  const laboratory = procedurePrices.filter(p => p.category === 'laboratory' && p.active);
  const radiology = procedurePrices.filter(p => p.category === 'radiology' && p.active);
  const pharmacy = procedurePrices.filter(p => p.category === 'pharmacy' && p.active);

  const totalProcedures = procedures.reduce((sum, p) => sum + p.price, 0);
  const totalLaboratory = laboratory.reduce((sum, p) => sum + p.price, 0);
  const totalRadiology = radiology.reduce((sum, p) => sum + p.price, 0);
  const totalPharmacy = pharmacy.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header - No Print */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 print:hidden">
          <div>
            <h2 className="text-xl font-semibold">Insurance Company Agreement Preview</h2>
            <p className="text-sm text-gray-600">Review and print the complete insurance agreement document</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 bg-white" id="pdf-content">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Document Header */}
            <div className="text-center border-b-2 border-blue-600 pb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Shield className="w-10 h-10 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Insurance Company Agreement</h1>
              </div>
              <p className="text-gray-600">Hospital Management System - Insurance Services Contract</p>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Document ID: INS-{Date.now()}</span>
                </div>
              </div>
            </div>

            {/* Company Overview Card */}
            <Card className="border-2 border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{insuranceName || 'Insurance Company Name'}</h2>
                      <p className="text-sm text-gray-600">Policy Prefix: <span className="font-mono font-semibold">{policyPrefix || 'N/A'}</span></p>
                    </div>
                  </div>
                  <Badge className={status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {status || 'Active'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Contact Person</p>
                        <p className="font-medium text-gray-900">{contactPerson || 'Not Specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</p>
                        <p className="font-medium text-gray-900">{phone || 'Not Specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Email Address</p>
                        <p className="font-medium text-gray-900">{email || 'Not Specified'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Website</p>
                        <p className="font-medium text-gray-900">{website || 'Not Specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                        <p className="font-medium text-gray-900">{address || 'Not Specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Contract Start Date</p>
                        <p className="font-medium text-gray-900">{contractDate || 'Not Specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Terms */}
            <Card className="border-2 border-green-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Financial Terms & Conditions
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-gray-600">Credit Allowance Limit</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700">${creditAllowance || '0'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-gray-600">Discount Rate</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{discountRate || '0'}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-8" />

            {/* Pricing Configuration Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Pricing Configuration</h2>
              <p className="text-gray-600">Complete pricing schedule for all approved services and procedures</p>
            </div>

            {/* Procedures Pricing */}
            {procedures.length > 0 && (
              <div className="page-break-inside-avoid">
                <Card className="border-2 border-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-purple-600" />
                        Medical Procedures
                      </h3>
                      <Badge className="bg-purple-100 text-purple-800">
                        {procedures.length} Procedures • ${totalProcedures.toFixed(2)}
                      </Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-purple-50">
                          <TableHead className="w-16">No.</TableHead>
                          <TableHead>Procedure Name</TableHead>
                          <TableHead className="text-right w-32">Price (USD)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {procedures.map((proc, index) => (
                          <TableRow key={proc.id}>
                            <TableCell className="text-gray-500">{index + 1}</TableCell>
                            <TableCell className="font-medium">{proc.name}</TableCell>
                            <TableCell className="text-right font-semibold">${proc.price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-purple-50 border-t-2 border-purple-200">
                          <TableCell colSpan={2} className="font-bold">Total Procedures</TableCell>
                          <TableCell className="text-right font-bold text-purple-700">${totalProcedures.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Laboratory Tests Pricing */}
            {laboratory.length > 0 && (
              <div className="page-break-inside-avoid">
                <Card className="border-2 border-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-blue-600" />
                        Laboratory Tests
                      </h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {laboratory.length} Tests • ${totalLaboratory.toFixed(2)}
                      </Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-50">
                          <TableHead className="w-16">No.</TableHead>
                          <TableHead>Test Name</TableHead>
                          <TableHead className="text-right w-32">Price (USD)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {laboratory.map((proc, index) => (
                          <TableRow key={proc.id}>
                            <TableCell className="text-gray-500">{index + 1}</TableCell>
                            <TableCell className="font-medium">{proc.name}</TableCell>
                            <TableCell className="text-right font-semibold">${proc.price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-blue-50 border-t-2 border-blue-200">
                          <TableCell colSpan={2} className="font-bold">Total Laboratory Tests</TableCell>
                          <TableCell className="text-right font-bold text-blue-700">${totalLaboratory.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Radiology Imaging Pricing */}
            {radiology.length > 0 && (
              <div className="page-break-inside-avoid">
                <Card className="border-2 border-amber-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-600" />
                        Radiology & Imaging
                      </h3>
                      <Badge className="bg-amber-100 text-amber-800">
                        {radiology.length} Scans • ${totalRadiology.toFixed(2)}
                      </Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-amber-50">
                          <TableHead className="w-16">No.</TableHead>
                          <TableHead>Scan/Imaging Name</TableHead>
                          <TableHead className="text-right w-32">Price (USD)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {radiology.map((proc, index) => (
                          <TableRow key={proc.id}>
                            <TableCell className="text-gray-500">{index + 1}</TableCell>
                            <TableCell className="font-medium">{proc.name}</TableCell>
                            <TableCell className="text-right font-semibold">${proc.price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-amber-50 border-t-2 border-amber-200">
                          <TableCell colSpan={2} className="font-bold">Total Radiology Services</TableCell>
                          <TableCell className="text-right font-bold text-amber-700">${totalRadiology.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pharmacy Medicines Pricing */}
            {pharmacy.length > 0 && (
              <div className="page-break-inside-avoid">
                <Card className="border-2 border-green-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Pill className="w-5 h-5 text-green-600" />
                        Pharmacy Medicines
                      </h3>
                      <Badge className="bg-green-100 text-green-800">
                        {pharmacy.length} Medicines • ${totalPharmacy.toFixed(2)}
                      </Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-green-50">
                          <TableHead className="w-16">No.</TableHead>
                          <TableHead>Medicine Name</TableHead>
                          <TableHead className="text-right w-32">Price (USD)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pharmacy.map((proc, index) => (
                          <TableRow key={proc.id}>
                            <TableCell className="text-gray-500">{index + 1}</TableCell>
                            <TableCell className="font-medium">{proc.name}</TableCell>
                            <TableCell className="text-right font-semibold">${proc.price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-green-50 border-t-2 border-green-200">
                          <TableCell colSpan={2} className="font-bold">Total Pharmacy Items</TableCell>
                          <TableCell className="text-right font-bold text-green-700">${totalPharmacy.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Summary Card */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-center">Summary of Services</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                    <Stethoscope className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Procedures</p>
                    <p className="font-bold text-purple-700">{procedures.length}</p>
                    <p className="text-xs text-gray-500">${totalProcedures.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <FlaskConical className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Laboratory</p>
                    <p className="font-bold text-blue-700">{laboratory.length}</p>
                    <p className="text-xs text-gray-500">${totalLaboratory.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-amber-200">
                    <Target className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Radiology</p>
                    <p className="font-bold text-amber-700">{radiology.length}</p>
                    <p className="text-xs text-gray-500">${totalRadiology.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <Pill className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Pharmacy</p>
                    <p className="font-bold text-green-700">{pharmacy.length}</p>
                    <p className="text-xs text-gray-500">${totalPharmacy.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-600 text-white rounded-lg text-center">
                  <p className="text-sm mb-1">Total Services Covered</p>
                  <p className="text-3xl font-bold">{procedures.length + laboratory.length + radiology.length + pharmacy.length}</p>
                  <p className="text-sm mt-1 opacity-90">Grand Total: ${(totalProcedures + totalLaboratory + totalRadiology + totalPharmacy).toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-6 mt-8 text-center text-sm text-gray-600">
              <p className="mb-2">This document is generated by the Hospital Management System</p>
              <p className="mb-2">For any queries, please contact the finance department</p>
              <p className="font-semibold">© {new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
              <p className="text-xs mt-4 text-gray-500">Document ID: INS-{Date.now()} | Generated: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
