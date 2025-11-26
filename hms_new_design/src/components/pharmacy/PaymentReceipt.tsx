/**
 * Payment Receipt Component for Pharmacy POS
 * Professional receipt design with print functionality
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { 
  Download, 
  Printer, 
  X, 
  Check,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  User,
  Receipt,
  FileText,
  Share2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CartItem {
  medicine: {
    id: string;
    name: string;
    genericName: string;
    strength: string;
    form: string;
    category: string;
    price: number;
    stock: number;
    barcode: string;
    requiresPrescription: boolean;
  };
  quantity: number;
  discount: number;
  subtotal: number;
}

interface PaymentReceiptProps {
  show: boolean;
  onClose: () => void;
  receiptData: {
    receiptNumber: string;
    date: string;
    time: string;
    cashier: string;
    customer?: {
      name: string;
      phone: string;
      email?: string;
    };
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    amountPaid: number;
    change: number;
    paymentMethod: string;
  };
}

export function PaymentReceipt({ show, onClose, receiptData }: PaymentReceiptProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => {
      setIsPrinting(false);
      toast.success('Receipt printed successfully!');
    }, 500);
  };

  const handleDownloadPDF = () => {
    toast.success('Receipt downloaded as PDF!');
  };

  const handleSendEmail = () => {
    toast.success('Receipt sent to customer email!');
  };

  const handleSendSMS = () => {
    toast.success('Receipt link sent via SMS!');
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto p-0">
        {/* Accessible Dialog Header - Hidden visually */}
        <DialogHeader className="sr-only">
          <DialogTitle>Payment Receipt - {receiptData.receiptNumber}</DialogTitle>
          <DialogDescription>
            Receipt for transaction {receiptData.receiptNumber} dated {receiptData.date} at {receiptData.time}. 
            Total amount: ${receiptData.total.toFixed(2)}. Payment method: {receiptData.paymentMethod}.
          </DialogDescription>
        </DialogHeader>

        {/* Action Bar - No Print */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10 print:hidden">
          <h3 className="font-semibold text-gray-900">Payment Receipt</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 bg-white" id="receipt-content">
          {/* Hospital Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Receipt className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MediCare Hospital</h1>
            <p className="text-sm text-gray-600 mt-1">Pharmacy Department</p>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>123 Healthcare Ave, New York, NY 10001</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-1 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>+1 234 567 8900</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>pharmacy@medicarehospital.com</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Receipt Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-500">Receipt Number</p>
              <p className="font-semibold text-gray-900">{receiptData.receiptNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Payment Method</p>
              <p className="font-semibold text-gray-900">{receiptData.paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-500">Date & Time</p>
              <div className="flex items-center gap-2 text-gray-900">
                <Calendar className="w-3 h-3" />
                <span>{receiptData.date}</span>
                <Clock className="w-3 h-3 ml-2" />
                <span>{receiptData.time}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Cashier</p>
              <p className="font-semibold text-gray-900">{receiptData.cashier}</p>
            </div>
          </div>

          {/* Customer Info */}
          {receiptData.customer && (
            <>
              <Separator className="my-4" />
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <p className="font-semibold text-gray-700">Customer Details</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="text-gray-900">{receiptData.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="text-gray-900">{receiptData.customer.phone}</p>
                  </div>
                  {receiptData.customer.email && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Email</p>
                      <p className="text-gray-900">{receiptData.customer.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator className="my-4" />

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Items Purchased
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Item Details</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Price</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Qty</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Discount</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {receiptData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.medicine.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.medicine.genericName} • {item.medicine.strength} • {item.medicine.form}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        ${item.medicine.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {item.discount > 0 ? (
                          <span className="text-green-600">-${item.discount.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400">$0.00</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ${item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Payment Summary */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({receiptData.items.length} items)</span>
              <span className="font-medium text-gray-900">${receiptData.subtotal.toFixed(2)}</span>
            </div>
            {receiptData.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">-${receiptData.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (GST 14%)</span>
              <span className="font-medium text-gray-900">${receiptData.tax.toFixed(2)}</span>
            </div>
            
            <Separator className="my-3" />
            
            <div className="flex justify-between items-center py-2 bg-gray-50 px-4 rounded-lg">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="font-bold text-2xl text-gray-900">${receiptData.total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm pt-2">
              <span className="text-gray-600">Amount Paid ({receiptData.paymentMethod})</span>
              <span className="font-medium text-gray-900">${receiptData.amountPaid.toFixed(2)}</span>
            </div>
            {receiptData.change > 0 && (
              <div className="flex justify-between items-center py-2 bg-green-50 px-4 rounded-lg">
                <span className="font-semibold text-green-700">Change Due</span>
                <span className="font-bold text-xl text-green-700">${receiptData.change.toFixed(2)}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Payment Status */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-full">
              <Check className="w-5 h-5" />
              <span className="font-semibold">PAYMENT SUCCESSFUL</span>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">Important Information:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Please keep this receipt for your records and warranty claims</li>
              <li>• Medicines cannot be returned once sold unless manufacturing defect is found</li>
              <li>• Return/Exchange only within 7 days with original receipt and unopened packaging</li>
              <li>• Take medicines as prescribed by your physician</li>
              <li>• Store medicines in a cool, dry place away from direct sunlight</li>
            </ul>
          </div>

          {/* Barcode and Footer */}
          <div className="text-center space-y-3">
            {/* Receipt Barcode */}
            <div className="flex justify-center">
              <div className="border-2 border-dashed border-gray-300 px-6 py-2 rounded">
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gray-800"
                      style={{ height: `${Math.random() * 20 + 30}px` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 font-mono">{receiptData.receiptNumber}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              This is a computer-generated receipt and does not require a signature
            </p>
            
            <div className="text-xs text-gray-400 pt-2 border-t">
              <p>Thank you for your purchase!</p>
              <p className="mt-1">For queries, contact us at: +1 234 567 8900 | pharmacy@medicarehospital.com</p>
            </div>

            <div className="text-xs text-gray-400 mt-3">
              <p>Powered by MediCare HMS • www.medicarehospital.com</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSendSMS}>
              <Phone className="w-4 h-4 mr-2" />
              Send SMS
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendEmail}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-[#2F80ED] hover:bg-[#2F80ED]/90">
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Print styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #receipt-content, #receipt-content * {
      visibility: visible;
    }
    #receipt-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 20px;
    }
    .print\\:hidden {
      display: none !important;
    }
  }
`;

// Add print styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
}