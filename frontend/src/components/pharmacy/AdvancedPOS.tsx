/**
 * Advanced Point of Sale (POS) System for Pharmacy Management
 * 
 * Features:
 * - Fast product search with live filtering
 * - Barcode scanning support
 * - Grid and list view modes
 * - Category-based filtering
 * - Real-time cart management with quantity controls
 * - Individual and global discount support
 * - Prescription tracking for controlled medicines
 * - Multiple payment methods (Cash, Card, Insurance)
 * - Advanced cash calculator with quick amount buttons
 * - Change calculation
 * - Customer management
 * - Keyboard shortcuts (F1-F12)
 * - Stock validation
 * - GST/Tax calculation (14%)
 * - Hold and resume sales
 * - Print receipts
 * - Toast notifications for user feedback
 * 
 * Keyboard Shortcuts:
 * F1  - Focus search bar
 * F2  - Clear cart
 * F3  - Customer info
 * F9  - Hold sale
 * F12 - Process payment
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  DollarSign,
  Percent,
  Printer,
  Save,
  RotateCcw,
  Grid3x3,
  List,
  Clock,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Receipt,
  FileText,
  Pill,
  Package,
  AlertCircle,
  TrendingUp,
  Calculator,
  Wallet,
  Building,
  Hash,
  Tag,
  Keyboard,
  Info,
  Layers,
  Play,
  RefreshCw,
  Ban,
  Search as SearchIcon,
  Calendar,
  Edit,
  Shield,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { api, MedicineWithStock, CreateSaleData, Patient } from '../../services/api';

interface Medicine {
  id: string | number;
  name: string;
  genericName?: string;
  strength?: string;
  form?: string;
  category?: string;
  price: number;
  stock: number;
  available_stock?: number;
  barcode?: string;
  image?: string;
  requiresPrescription?: boolean;
  selling_price?: number;
}

interface CartItem {
  medicine: Medicine;
  quantity: number;
  discount: number;
  subtotal: number;
}

interface Customer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: 'walk-in' | 'registered' | 'insurance';
}

interface HeldBill {
  id: string;
  billNumber: string;
  customer: Customer;
  cart: CartItem[];
  globalDiscount: number;
  prescriptionNumber: string;
  timestamp: Date;
  total: number;
  reservedStock?: Map<number, number>; // Store reservation info
}

export function AdvancedPOS() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]); // Store all medicines
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({
    name: 'Walk-in Customer',
    phone: '',
    type: 'walk-in'
  });
  const [patient, setPatient] = useState<Patient | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'insurance'>('cash');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [prescriptionNumber, setPrescriptionNumber] = useState('');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [isHeldBillsOpen, setIsHeldBillsOpen] = useState(false);
  const [processingSale, setProcessingSale] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState<string | null>(null);
  const [reservedStock, setReservedStock] = useState<Map<number, number>>(new Map()); // medicine_id -> reserved quantity
  
  // Split Payment State
  const [useSplitPayment, setUseSplitPayment] = useState(false);
  const [splitPayments, setSplitPayments] = useState<Array<{payment_method: 'Cash' | 'Card' | 'Insurance' | 'Credit' | 'Wallet'; amount: number; reference_number?: string}>>([]);
  
  // Void Transaction State
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
  const [voidSaleId, setVoidSaleId] = useState<number | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidType, setVoidType] = useState<'Error' | 'Customer Request' | 'System Error' | 'Fraud' | 'Other'>('Other');
  
  // Transaction Lookup State
  const [isLookupMode, setIsLookupMode] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [lookedUpSale, setLookedUpSale] = useState<any>(null);
  const [isLookupDialogOpen, setIsLookupDialogOpen] = useState(false);
  const [lookupInvoiceNumber, setLookupInvoiceNumber] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  
  // Return/Refund State
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [returnSale, setReturnSale] = useState<any>(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState<Set<number>>(new Set());
  const [returnReason, setReturnReason] = useState('');
  const [returnToStock, setReturnToStock] = useState(true);
  const [processingReturn, setProcessingReturn] = useState(false);
  
  // Shift State
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [shiftOpeningCash, setShiftOpeningCash] = useState('');
  const [isShiftClosingSummaryOpen, setIsShiftClosingSummaryOpen] = useState(false);
  const [shiftClosingSummary, setShiftClosingSummary] = useState<any>(null);
  const [isCloseShiftDialogOpen, setIsCloseShiftDialogOpen] = useState(false);
  const [actualCashInput, setActualCashInput] = useState('');
  const [shiftCashSales, setShiftCashSales] = useState<number>(0);
  const [loadingShiftSales, setLoadingShiftSales] = useState(false);
  
  // Price Override State
  const [isPriceOverrideDialogOpen, setIsPriceOverrideDialogOpen] = useState(false);
  const [overrideItem, setOverrideItem] = useState<CartItem | null>(null);
  const [overridePrice, setOverridePrice] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  // Load current shift on mount
  useEffect(() => {
    const loadCurrentShift = async () => {
      try {
        // Try to get current shift
        const shift = await api.getCurrentShift();
        if (shift) {
          setCurrentShift(shift);
        }
      } catch (error) {
        // No open shift - that's okay
        console.log('No open shift');
      }
    };
    
    loadCurrentShift();
  }, []);

  // Load all medicines on mount
  useEffect(() => {
    const loadAllMedicines = async () => {
      try {
        setLoading(true);
        
        // Load all active medicines
        const allMedicinesData = await api.getMedicines({ status: 'Active' });
        
        // Load all stock to get available quantities and prices
        const stockData = await api.getPharmacyStock({ status: 'Active', limit: 1000 });
        
        // Create a map of medicine_id -> total available stock and latest selling price
        const stockMap = new Map<number, { stock: number; price: number }>();
        stockData.forEach(stock => {
          const available = stock.quantity - stock.reserved_quantity;
          if (stockMap.has(stock.medicine_id)) {
            const existing = stockMap.get(stock.medicine_id)!;
            existing.stock += available;
            // Use the latest selling price
            if (stock.selling_price > existing.price) {
              existing.price = stock.selling_price;
            }
          } else {
            stockMap.set(stock.medicine_id, {
              stock: available,
              price: stock.selling_price
            });
          }
        });

        // Combine medicines with stock data
        const medicinesWithStock: Medicine[] = allMedicinesData.map(med => {
          const stockInfo = stockMap.get(med.id) || { stock: 0, price: 0 };
          const price = Number(stockInfo.price) || 0;
          const stock = Number(stockInfo.stock) || 0;
          return {
            id: med.id,
            name: med.name,
            genericName: med.generic_name,
            strength: med.strength,
            form: med.unit,
            category: med.category || 'Uncategorized',
            price: price,
            stock: stock,
            available_stock: stock,
            barcode: '',
            requiresPrescription: med.requires_prescription || false,
            selling_price: price
          };
        });

        // Filter to only show medicines with stock > 0
        const availableMedicines = medicinesWithStock.filter(med => med.stock > 0);
        
        setAllMedicines(availableMedicines);
        setMedicines(availableMedicines);

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(availableMedicines.map(m => m.category).filter(Boolean)));
        setCategories(['All', ...uniqueCategories]);
      } catch (error: any) {
        console.error('Failed to load medicines:', error);
        toast.error('Failed to load medicines');
      } finally {
        setLoading(false);
      }
    };

    loadAllMedicines();
  }, []);

  // Filter medicines based on search and category
  useEffect(() => {
    let filtered = [...allMedicines];

    // Apply search filter
    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(med => 
        med.name.toLowerCase().includes(query) ||
        med.genericName?.toLowerCase().includes(query) ||
        med.barcode?.includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(med => med.category === selectedCategory);
    }

    setMedicines(filtered);
  }, [searchQuery, selectedCategory, allMedicines]);

  // Handle barcode scanning
  useEffect(() => {
    const handleBarcodeScan = async () => {
      if (barcodeInput.length >= 8) {
        try {
          const stock = await api.getStockByBarcode(barcodeInput);
          if (stock) {
            const medicine = await api.getMedicine(stock.medicine_id.toString());
            const med: Medicine = {
              id: medicine.id,
              name: medicine.name,
              genericName: medicine.generic_name,
              strength: medicine.strength,
              form: medicine.unit,
              category: medicine.category,
              price: stock.selling_price,
              stock: stock.quantity - stock.reserved_quantity,
              available_stock: stock.quantity - stock.reserved_quantity,
              barcode: barcodeInput,
              requiresPrescription: medicine.requires_prescription || false,
              selling_price: stock.selling_price
            };
            addToCart(med);
            setBarcodeInput('');
          }
        } catch (error: any) {
          toast.error('Medicine not found for barcode');
          setBarcodeInput('');
        }
      }
    };

    if (barcodeInput) {
      const timer = setTimeout(handleBarcodeScan, 500);
      return () => clearTimeout(timer);
    }
  }, [barcodeInput]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F1 - Focus search
      if (e.key === 'F1') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"], input[placeholder*="search"], input[type="search"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      // F2 - Clear cart
      if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0 && confirm('Clear cart?')) {
          clearCart();
        }
      }
      // F3 - Open customer dialog
      if (e.key === 'F3') {
        e.preventDefault();
        setIsCustomerDialogOpen(true);
      }
      // F9 - Hold sale
      if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) {
          holdBill();
        } else {
          toast.info('Cart is empty');
        }
      }
      // F12 - Open payment
      if (e.key === 'F12') {
        e.preventDefault();
        if (cart.length > 0) {
          setIsPaymentDialogOpen(true);
        } else {
          toast.info('Cart is empty');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart.length]); // Only depend on cart.length

  // Medicines are already filtered in useEffect
  const filteredMedicines = medicines;

  // Add to cart with auto-reservation
  const addToCart = async (medicine: Medicine) => {
    const availableStock = medicine.available_stock || medicine.stock || 0;
    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    const price = Number(medicine.price) || Number(medicine.selling_price) || 0;
    const medicineId = typeof medicine.id === 'string' ? parseInt(medicine.id) : medicine.id;
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity <= availableStock) {
        // Reserve additional quantity
        try {
          await api.reserveStock(medicineId, 1);
          const currentReserved = reservedStock.get(medicineId) || 0;
          setReservedStock(new Map(reservedStock.set(medicineId, currentReserved + 1)));
          updateQuantity(medicine.id.toString(), newQuantity);
          toast.success(`Increased ${medicine.name} quantity`);
        } catch (error: any) {
          toast.error('Failed to reserve stock: ' + (error.message || 'Unknown error'));
        }
      } else {
        toast.error('Insufficient stock');
      }
    } else {
      if (availableStock > 0) {
        // Reserve stock for new item
        try {
          await api.reserveStock(medicineId, 1);
          const currentReserved = reservedStock.get(medicineId) || 0;
          setReservedStock(new Map(reservedStock.set(medicineId, currentReserved + 1)));
          setCart([...cart, {
            medicine,
            quantity: 1,
            discount: 0,
            subtotal: price
          }]);
          toast.success(`Added ${medicine.name} to cart`);
        } catch (error: any) {
          toast.error('Failed to reserve stock: ' + (error.message || 'Unknown error'));
        }
      } else {
        toast.error('Out of stock');
      }
    }
  };

  // Update quantity with reservation management
  const updateQuantity = async (medicineId: string, newQuantity: number) => {
    const item = cart.find(i => i.medicine.id === medicineId);
    if (!item) return;

    const medId = typeof item.medicine.id === 'string' ? parseInt(item.medicine.id) : item.medicine.id;
    const currentQuantity = item.quantity;
    const quantityDiff = newQuantity - currentQuantity;
    const finalQuantity = Math.max(0, Math.min(newQuantity, item.medicine.stock || item.medicine.available_stock || 0));

    // Update reservation if quantity changed
    if (quantityDiff !== 0 && finalQuantity > 0) {
      try {
        if (quantityDiff > 0) {
          // Reserve more
          await api.reserveStock(medId, quantityDiff);
          const currentReserved = reservedStock.get(medId) || 0;
          setReservedStock(new Map(reservedStock.set(medId, currentReserved + quantityDiff)));
        } else if (quantityDiff < 0) {
          // Release reservation
          await api.releaseStock(medId, Math.abs(quantityDiff));
          const currentReserved = reservedStock.get(medId) || 0;
          const newReserved = Math.max(0, currentReserved - Math.abs(quantityDiff));
          if (newReserved > 0) {
            setReservedStock(new Map(reservedStock.set(medId, newReserved)));
          } else {
            const newMap = new Map(reservedStock);
            newMap.delete(medId);
            setReservedStock(newMap);
          }
        }
      } catch (error: any) {
        console.error('Failed to update reservation:', error);
        toast.error('Failed to update stock reservation');
      }
    }

    // Update cart
    setCart(cart.map(item => {
      if (item.medicine.id === medicineId) {
        const price = Number(item.medicine.price) || Number(item.medicine.selling_price) || 0;
        const discount = Number(item.discount) || 0;
        const subtotal = (price * finalQuantity) * (1 - discount / 100);
        return {
          ...item,
          quantity: finalQuantity,
          subtotal: Number(subtotal.toFixed(2))
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Update item discount
  const updateItemDiscount = (medicineId: string, discount: number) => {
    setCart(cart.map(item => {
      if (item.medicine.id === medicineId) {
        const discountValue = Math.max(0, Math.min(100, Number(discount) || 0));
        const price = Number(item.medicine.price) || Number(item.medicine.selling_price) || 0;
        const quantity = Number(item.quantity) || 0;
        const subtotal = (price * quantity) * (1 - discountValue / 100);
        return {
          ...item,
          discount: discountValue,
          subtotal: Number(subtotal.toFixed(2))
        };
      }
      return item;
    }));
  };

  // Remove from cart and release reservation
  const removeFromCart = async (medicineId: string) => {
    const item = cart.find(c => c.medicine.id === medicineId);
    if (!item) return;

    const medId = typeof item.medicine.id === 'string' ? parseInt(item.medicine.id) : item.medicine.id;
    
    // Release reserved stock
    if (reservedStock.has(medId)) {
      try {
        await api.releaseStock(medId, item.quantity);
        const newMap = new Map(reservedStock);
        newMap.delete(medId);
        setReservedStock(newMap);
      } catch (error: any) {
        console.error('Failed to release reservation:', error);
      }
    }

    setCart(cart.filter(item => item.medicine.id !== medicineId));
    toast.success(`Removed ${item.medicine.name} from cart`);
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const discountAmount = (subtotal * (Number(globalDiscount) || 0)) / 100;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * 0.14; // 14% GST
  const total = taxableAmount + tax;
  const changeAmount = receivedAmount ? parseFloat(receivedAmount) - total : 0;

  // Clear cart and release all reservations
  const clearCart = async () => {
    // Release all reserved stock
    for (const [medId, quantity] of reservedStock.entries()) {
      try {
        await api.releaseStock(medId, quantity);
      } catch (error: any) {
        console.error(`Failed to release reservation for medicine ${medId}:`, error);
      }
    }
    
    setReservedStock(new Map());
    setCart([]);
    setGlobalDiscount(0);
    setReceivedAmount('');
    setPrescriptionNumber('');
    setCustomer({
      name: 'Walk-in Customer',
      phone: '',
      type: 'walk-in'
    });
    toast.success('Cart cleared and reservations released');
  };

  // Hold current bill (keep reservations)
  const holdBill = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const billNumber = `HB-${Date.now().toString().slice(-6)}`;
    const heldBill: HeldBill = {
      id: Date.now().toString(),
      billNumber,
      customer: { ...customer },
      cart: [...cart],
      globalDiscount,
      prescriptionNumber,
      timestamp: new Date(),
      total,
      reservedStock: new Map(reservedStock) // Store current reservations
    };

    // Save held bill (reservations remain active)
    setHeldBills([...heldBills, heldBill]);
    
    // Clear cart UI but keep reservations (they're stored in the held bill)
    setCart([]);
    setGlobalDiscount(0);
    setReceivedAmount('');
    setPrescriptionNumber('');
    setCustomer({
      name: 'Walk-in Customer',
      phone: '',
      type: 'walk-in'
    });
    
    toast.success(`Bill ${billNumber} held successfully`, {
      description: `${heldBill.cart.length} items saved`
    });
  };

  // Load held bill and restore reservations
  const loadHeldBill = async (bill: HeldBill) => {
    if (cart.length > 0) {
      toast.error('Please clear or hold current cart first');
      return;
    }

    try {
      // Restore reservations from stored bill (they should already be reserved)
      // But verify and re-reserve if needed
      if (bill.reservedStock) {
        // Restore the reservation state
        setReservedStock(new Map(bill.reservedStock));
      } else {
        // Legacy: If no stored reservations, reserve now
        const reservationPromises = bill.cart.map(async (item) => {
          const medId = typeof item.medicine.id === 'string' ? parseInt(item.medicine.id) : item.medicine.id;
          try {
            await api.reserveStock(medId, item.quantity);
          } catch (error: any) {
            console.error(`Failed to reserve stock for medicine ${medId}:`, error);
            // Don't throw - continue loading even if some reservations fail
          }
        });
        await Promise.all(reservationPromises);
        
        // Update reserved stock state
        const newReserved = new Map<number, number>();
        bill.cart.forEach(item => {
          const medId = typeof item.medicine.id === 'string' ? parseInt(item.medicine.id) : item.medicine.id;
          newReserved.set(medId, item.quantity);
        });
        setReservedStock(newReserved);
      }

      // Load the bill
      setCart(bill.cart);
      setCustomer(bill.customer);
      setGlobalDiscount(bill.globalDiscount);
      setPrescriptionNumber(bill.prescriptionNumber);
      setHeldBills(heldBills.filter(b => b.id !== bill.id));
      setIsHeldBillsOpen(false);
      toast.success(`Loaded bill ${bill.billNumber}`);
    } catch (error: any) {
      toast.error('Failed to load bill: ' + (error.message || 'Some items may be out of stock'));
    }
  };

  // Delete held bill and release reservations
  const deleteHeldBill = async (billId: string) => {
    const bill = heldBills.find(b => b.id === billId);
    if (bill && bill.reservedStock) {
      // Release all reserved stock for this bill
      for (const [medId, quantity] of bill.reservedStock.entries()) {
        try {
          await api.releaseStock(medId, quantity);
        } catch (error: any) {
          console.error(`Failed to release reservation for medicine ${medId}:`, error);
        }
      }
    }
    
    setHeldBills(heldBills.filter(b => b.id !== billId));
    toast.info('Held bill deleted and reservations released');
  };

  // Print receipt by invoice number
  const printReceiptByInvoice = async (invoiceNumber: string) => {
    try {
      if (!invoiceNumber) {
        toast.error('Invoice number required');
        return;
      }

      // Fetch sale by invoice number
      const sale = await api.getSale(invoiceNumber);
      if (!sale) {
        toast.error('Sale not found for invoice: ' + invoiceNumber);
        return;
      }

      // Convert sale to invoice format
      const invoice = {
        invoice_number: sale.invoice_number,
        sale_date: sale.sale_date,
        customer: {
          name: sale.customer_name,
          phone: sale.customer_phone || 'N/A',
          email: sale.customer_email || 'N/A',
          address: sale.customer_address || 'N/A'
        },
        items: sale.items || [],
        subtotal: sale.subtotal,
        discount_amount: sale.discount_amount,
        tax_amount: sale.tax_amount,
        total_amount: sale.total_amount,
        payment_method: sale.payment_method,
        amount_received: sale.amount_received,
        change_amount: sale.change_amount,
        cashier: sale.cashier_name || 'Cashier'
      };

      printInvoiceHTML(invoice, invoiceNumber);
    } catch (error: any) {
      console.error('Print receipt by invoice error:', error);
      toast.error('Failed to print receipt: ' + (error.message || 'Unknown error'));
    }
  };

  // Print invoice HTML
  const printInvoiceHTML = (invoice: any, invoiceNumber: string) => {
    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print receipt');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNumber || invoice.invoice_number}</title>
          <style>
            @media print {
              @page { margin: 0.5cm; size: 80mm auto; }
              body { margin: 0; padding: 10px; }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              max-width: 300px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 18px;
              font-weight: bold;
            }
            .header p {
              margin: 2px 0;
              font-size: 10px;
            }
            .info {
              margin: 10px 0;
              font-size: 11px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              padding: 5px;
              text-align: left;
              font-size: 11px;
            }
            th {
              border-bottom: 1px solid #000;
            }
            .item-row td {
              border-bottom: 1px dotted #ccc;
            }
            .text-right {
              text-align: right;
            }
            .totals {
              margin-top: 10px;
              border-top: 2px dashed #000;
              padding-top: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px dashed #000;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HOSPITAL PHARMACY</h1>
            <p>123 Medical Street, City</p>
            <p>Phone: +92-XXX-XXXXXXX</p>
            <p>Email: pharmacy@hospital.com</p>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span>Invoice:</span>
              <span><strong>${invoiceNumber || invoice.invoice_number}</strong></span>
            </div>
            <div class="info-row">
              <span>Date:</span>
              <span>${new Date(invoice.sale_date || Date.now()).toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span>Customer:</span>
              <span>${invoice.customer?.name || invoice.customer_name || 'Walk-in'}</span>
            </div>
            ${(invoice.customer?.phone || invoice.customer_phone) ? `
            <div class="info-row">
              <span>Phone:</span>
              <span>${invoice.customer?.phone || invoice.customer_phone}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span>Payment:</span>
              <span>${invoice.payment_method || 'Cash'}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items?.map((item: any) => `
                <tr class="item-row">
                  <td>${item.medicine_name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${Number(item.unit_price || 0).toFixed(2)}</td>
                  <td class="text-right">${Number(item.subtotal || 0).toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>PKR ${Number(invoice.subtotal || 0).toFixed(2)}</span>
            </div>
            ${invoice.discount_amount > 0 ? `
            <div class="info-row">
              <span>Discount:</span>
              <span>-PKR ${Number(invoice.discount_amount || 0).toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span>Tax (${invoice.tax_rate || 14}%):</span>
              <span>PKR ${Number(invoice.tax_amount || 0).toFixed(2)}</span>
            </div>
            <div class="total-row" style="font-size: 14px; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
              <span>TOTAL:</span>
              <span>PKR ${Number(invoice.total_amount || 0).toFixed(2)}</span>
            </div>
            ${invoice.amount_received ? `
            <div class="info-row">
              <span>Received:</span>
              <span>PKR ${Number(invoice.amount_received).toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span>Change:</span>
              <span>PKR ${Number(invoice.amount_received - invoice.total_amount).toFixed(2)}</span>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>For returns, please bring this receipt</p>
            <p>Valid for 7 days from purchase date</p>
          </div>
        </body>
        </html>
      `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    toast.success('Receipt printed');
  };

  // Print receipt
  const printReceipt = async (saleId?: number, invoiceNumber?: string) => {
    try {
      const saleIdToUse = saleId || lastSaleId;
      const invoiceToUse = invoiceNumber || lastInvoiceNumber;
      
      // If we have invoice number but no sale ID, use invoice number method
      if (invoiceToUse && !saleIdToUse) {
        await printReceiptByInvoice(invoiceToUse);
        return;
      }
      
      if (!saleIdToUse) {
        toast.error('No sale to print');
        return;
      }

      // Fetch invoice data
      let invoice;
      try {
        invoice = await api.getSaleInvoice(saleIdToUse);
      } catch (error: any) {
        // Fallback: try to get sale data directly
        console.warn('Invoice endpoint failed, trying sale endpoint:', error);
        const sale = await api.getSale(saleIdToUse);
        // Convert sale to invoice format
        invoice = {
          invoice_number: sale.invoice_number,
          sale_date: sale.sale_date,
          customer: {
            name: sale.customer_name,
            phone: sale.customer_phone || 'N/A',
            email: sale.customer_email || 'N/A',
            address: sale.customer_address || 'N/A'
          },
          items: sale.items || [],
          subtotal: sale.subtotal,
          discount_amount: sale.discount_amount,
          tax_amount: sale.tax_amount,
          total_amount: sale.total_amount,
          payment_method: sale.payment_method,
          amount_received: sale.amount_received,
          change_amount: sale.change_amount,
          cashier: sale.cashier_name || 'Cashier',
          tax_rate: sale.tax_rate || 14
        };
      }
      
      if (!invoice) {
        toast.error('Could not retrieve sale data for printing');
        return;
      }

      printInvoiceHTML(invoice, invoiceToUse || invoice.invoice_number);
    } catch (error: any) {
      console.error('Print error:', error);
      toast.error('Failed to print receipt: ' + (error.message || 'Unknown error'));
    }
  };

  // Save current sale as draft (hold bill)
  const saveCurrentSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    holdBill();
    toast.success('Sale saved as draft');
  };

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Check if shift is open
    if (!currentShift) {
      toast.error('Please open a shift first before processing transactions');
      setIsShiftDialogOpen(true);
      return;
    }

    // Check if shift is for current date
    const shiftDate = new Date(currentShift.start_time).toDateString();
    const today = new Date().toDateString();
    if (shiftDate !== today) {
      toast.error('Current shift is not for today. Please open a new shift.');
      setIsShiftDialogOpen(true);
      return;
    }

    // Check for prescription medicines
    const requiresPrescription = cart.some(item => item.medicine.requiresPrescription);
    if (requiresPrescription && !prescriptionNumber) {
      toast.error('Prescription number required');
      return;
    }

    // Validate split payments if using split payment
    if (useSplitPayment) {
      const totalSplit = splitPayments.reduce((sum, p) => sum + p.amount, 0);
      if (totalSplit < total) {
        toast.error('Split payment total is less than sale total');
        return;
      }
    } else {
      if (paymentMethod === 'cash' && parseFloat(receivedAmount || '0') < total) {
        toast.error('Insufficient amount received');
        return;
      }
    }

    try {
      setProcessingSale(true);
      
      // Prepare sale data
      const saleData: CreateSaleData = {
        customer_name: customer.name,
        customer_phone: customer.phone || undefined,
        customer_email: customer.email || undefined,
        customer_address: customer.address || undefined,
        patient_id: patient?.id,
        prescription_id: prescriptionNumber ? parseInt(prescriptionNumber) : undefined,
        items: cart.map(item => ({
          medicine_id: typeof item.medicine.id === 'string' ? parseInt(item.medicine.id) : item.medicine.id,
          medicine_name: item.medicine.name,
          quantity: item.quantity,
          unit_price: item.medicine.price,
          discount_percentage: item.discount
        })),
        discount_percentage: globalDiscount,
        tax_rate: 14,
        payment_method: paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'card' ? 'Card' : 'Insurance',
        amount_received: paymentMethod === 'cash' && !useSplitPayment ? parseFloat(receivedAmount || '0') : undefined,
        payments: useSplitPayment ? splitPayments : undefined,
        shift_id: currentShift?.id,
        notes: prescriptionNumber ? `Prescription: ${prescriptionNumber}` : undefined
      };

      const saleResponse = await api.createSale(saleData);
      
      // Debug: Log the response to see what we're getting
      console.log('Sale creation response:', saleResponse);
      
      // Handle different response structures
      let saleId: number | null = null;
      let invoiceNumber: string | null = null;
      
      if (saleResponse) {
        // Try different possible property names
        saleId = saleResponse.id || saleResponse.sale_id || (saleResponse as any).ID || null;
        invoiceNumber = saleResponse.invoice_number || (saleResponse as any).invoice_number || null;
      }
      
      // If we have invoice number but not sale ID, fetch sale by invoice number
      if (invoiceNumber && !saleId) {
        try {
          const saleByInvoice = await api.getSale(invoiceNumber);
          if (saleByInvoice) {
            saleId = saleByInvoice.id || saleByInvoice.sale_id || null;
            if (!invoiceNumber && saleByInvoice.invoice_number) {
              invoiceNumber = saleByInvoice.invoice_number;
            }
          }
        } catch (fetchError) {
          console.error('Failed to fetch sale by invoice number:', fetchError);
        }
      }
      
      // If we still don't have sale ID but have invoice, try one more time
      if (invoiceNumber && !saleId) {
        // The invoice number format is INV-YYYYMMDD-####, we can extract it
        console.warn('Sale ID is null, but invoice number exists:', invoiceNumber);
      }
      
      if (invoiceNumber) {
        setLastInvoiceNumber(invoiceNumber);
        toast.success(`Payment processed successfully! Invoice: ${invoiceNumber}`);
      } else {
        toast.error('Sale created but invoice number not found');
      }
      
      if (saleId) {
        setLastSaleId(saleId);
      }
      
      // Release all reservations (stock is now sold, not just reserved)
      setReservedStock(new Map());
      
      // Auto-print receipt after successful payment
      // Use invoice number if available, otherwise use sale ID
      if (invoiceNumber) {
        setTimeout(() => {
          if (saleId) {
            printReceipt(saleId, invoiceNumber!);
          } else {
            // Try to print using invoice number
            printReceiptByInvoice(invoiceNumber!);
          }
        }, 500);
      } else if (saleId) {
        setTimeout(() => {
          printReceipt(saleId!);
        }, 500);
      }
      
      // Clear the cart after successful payment
      setTimeout(() => {
        setCart([]);
        setGlobalDiscount(0);
        setReceivedAmount('');
        setPrescriptionNumber('');
        setIsPaymentDialogOpen(false);
        setUseSplitPayment(false);
        setSplitPayments([]);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setProcessingSale(false);
    }
  };

  // Quick add number buttons for cash
  const addToCash = (amount: number) => {
    const current = parseFloat(receivedAmount || '0');
    setReceivedAmount((current + amount).toString());
  };

  // Lookup mode functions
  const handleLookupClick = async () => {
    setIsLookupMode(true);
    await loadInvoices();
  };

  const loadInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const filters: any = {
        limit: 100, // Load recent 100 invoices
        status: 'Completed'
      };
      if (invoiceSearchTerm) {
        filters.search = invoiceSearchTerm;
      }
      const data = await api.getSales(filters);
      setInvoices(data || []);
    } catch (error: any) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load invoices');
      setInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleGoToSales = () => {
    setIsLookupMode(false);
    setInvoiceSearchTerm('');
    setInvoices([]);
  };

  const handleViewInvoice = async (invoice: any) => {
    try {
      const sale = await api.getSale(invoice.id);
      setLookedUpSale(sale);
      setIsLookupDialogOpen(true);
    } catch (error: any) {
      toast.error('Failed to load invoice details');
    }
  };

  const handleReturnInvoice = async (sale: any) => {
    try {
      // Load full sale details - use id if available, otherwise use invoice_number
      const saleId = sale.id || sale.invoice_number;
      if (!saleId) {
        toast.error('Invalid sale data - missing ID or invoice number');
        return;
      }
      
      const fullSale = await api.getSale(saleId);
      if (!fullSale) {
        toast.error('Failed to load sale details');
        return;
      }
      
      // Ensure the sale has an ID - if not, try to extract it from the response
      if (!fullSale.id) {
        // Try to get ID from the original sale object or use the saleId we passed
        fullSale.id = sale.id || (typeof saleId === 'number' ? saleId : null);
        if (!fullSale.id) {
          toast.error('Sale ID not found in response');
          console.error('Sale object:', fullSale);
          return;
        }
      }
      
      console.log('Return sale loaded:', { id: fullSale.id, invoice_number: fullSale.invoice_number });
      setReturnSale(fullSale);
      setIsReturnMode(true);
      setIsLookupDialogOpen(false);
      
      // Load items into cart for return
      if (fullSale.items && fullSale.items.length > 0) {
        const returnCartItems: CartItem[] = fullSale.items.map((item: any) => {
          // Find the medicine from our medicines list
          const medicine = allMedicines.find(m => 
            m.id === item.medicine_id || 
            m.name === item.medicine_name
          ) || {
            id: item.medicine_id,
            name: item.medicine_name,
            genericName: item.generic_name || '',
            strength: '',
            form: '',
            category: '',
            price: parseFloat(item.unit_price || 0),
            stock: 0,
            available_stock: 0,
            selling_price: parseFloat(item.unit_price || 0)
          } as Medicine;

          return {
            medicine,
            quantity: item.quantity,
            discount: 0,
            subtotal: parseFloat(item.subtotal || 0),
            saleItemId: item.id // Store original sale item ID for refund
          } as CartItem & { saleItemId?: number };
        });
        
        setCart(returnCartItems);
        // Select all items by default
        setSelectedReturnItems(new Set(fullSale.items.map((item: any) => item.id)));
        toast.success('Invoice items loaded for return');
      }
    } catch (error: any) {
      toast.error('Failed to load invoice for return: ' + (error.message || 'Unknown error'));
    }
  };

  const handleProcessReturn = async () => {
    if (!returnSale || selectedReturnItems.size === 0) {
      toast.error('Please select items to return');
      return;
    }

    if (!returnReason.trim()) {
      toast.error('Please provide a return reason');
      return;
    }

    try {
      setProcessingReturn(true);
      
      // Get selected items from original sale items (not cart, to preserve original prices)
      const returnItems = returnSale.items
        .filter((saleItem: any) => selectedReturnItems.has(saleItem.id))
        .map((saleItem: any) => ({
          sale_item_id: saleItem.id,
          medicine_id: typeof saleItem.medicine_id === 'string' ? parseInt(saleItem.medicine_id) : saleItem.medicine_id,
          quantity: parseFloat(saleItem.quantity || 0),
          unit_price: parseFloat(saleItem.unit_price || 0),
          subtotal: parseFloat(saleItem.subtotal || 0),
          return_to_stock: returnToStock ? 1 : 0
        }));

      if (returnItems.length === 0) {
        toast.error('No items selected for return');
        setProcessingReturn(false);
        return;
      }

      // Ensure sale_id is a number
      let saleId: number | null = null;
      
      if (returnSale.id) {
        saleId = typeof returnSale.id === 'string' ? parseInt(returnSale.id) : returnSale.id;
      }
      
      // If still no ID, log for debugging
      if (!saleId || isNaN(saleId)) {
        console.error('Return sale object:', returnSale);
        console.error('Attempted sale ID:', saleId);
        toast.error('Invalid sale ID. Please try again.');
        setProcessingReturn(false);
        return;
      }

      const refundData = {
        sale_id: saleId,
        refund_reason: returnReason,
        payment_method: returnSale.payment_method === 'Cash' ? 'Cash' : 'Original',
        items: returnItems,
        notes: `Return processed for invoice ${returnSale.invoice_number}`
      };

      console.log('Creating refund with data:', refundData);
      await api.createRefund(refundData);
      toast.success('Return processed successfully');
      
      // Reset return state
      setIsReturnMode(false);
      setReturnSale(null);
      setSelectedReturnItems(new Set());
      setReturnReason('');
      setReturnToStock(true);
      setCart([]);
      // Clear reservations if not in return mode
      if (!isReturnMode) {
        for (const [medId, quantity] of reservedStock.entries()) {
          try {
            await api.releaseStock(medId, quantity);
          } catch (error: any) {
            console.error(`Failed to release reservation for medicine ${medId}:`, error);
          }
        }
        setReservedStock(new Map());
      }
      
      // Reload invoices if in lookup mode
      if (isLookupMode) {
        await loadInvoices();
      }
    } catch (error: any) {
      toast.error('Failed to process return: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessingReturn(false);
    }
  };

  const toggleReturnItem = (saleItemId: number) => {
    const newSelected = new Set(selectedReturnItems);
    if (newSelected.has(saleItemId)) {
      newSelected.delete(saleItemId);
    } else {
      newSelected.add(saleItemId);
    }
    setSelectedReturnItems(newSelected);
  };

  // Lookup transaction (for dialog)
  const handleLookupTransaction = async () => {
    if (!lookupInvoiceNumber.trim()) {
      toast.error('Please enter an invoice number');
      return;
    }

    try {
      setLookupLoading(true);
      const sale = await api.getSale(lookupInvoiceNumber);
      setLookedUpSale(sale);
      toast.success('Sale found');
    } catch (error: any) {
      toast.error(error.message || 'Sale not found');
      setLookedUpSale(null);
    } finally {
      setLookupLoading(false);
    }
  };

  // Load invoices when search term changes in lookup mode
  useEffect(() => {
    if (isLookupMode) {
      const debounceTimer = setTimeout(() => {
        loadInvoices();
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceSearchTerm, isLookupMode]);

  // Void transaction
  const handleVoidTransaction = async () => {
    if (!voidSaleId) {
      toast.error('Sale ID required');
      return;
    }

    if (!voidReason.trim()) {
      toast.error('Void reason is required');
      return;
    }

    try {
      await api.voidSale(voidSaleId, {
        void_reason: voidReason,
        void_type: voidType,
        restore_stock: true
      });
      toast.success('Sale voided successfully');
      setIsVoidDialogOpen(false);
      setVoidSaleId(null);
      setVoidReason('');
      setVoidType('Other');
    } catch (error: any) {
      toast.error(error.message || 'Failed to void sale');
    }
  };

  // Open shift
  const handleOpenShift = async () => {
    if (!shiftOpeningCash) {
      toast.error('Opening cash amount is required');
      return;
    }

    try {
      const shift = await api.openShift({
        opening_cash: parseFloat(shiftOpeningCash || '0')
      });
      setCurrentShift(shift);
      setShiftOpeningCash('');
      toast.success('Shift opened successfully');
      setIsShiftDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to open shift');
    }
  };

  // Close shift - open dialog first
  const handleCloseShiftClick = async () => {
    if (!currentShift) return;
    setActualCashInput('');
    setLoadingShiftSales(true);
    setIsCloseShiftDialogOpen(true);
    
    // Fetch cash sales for this shift
    try {
      const sales = await api.getSales({ 
        shift_id: currentShift.id,
        status: 'Completed'
      });
      
      // Calculate cash sales - handle both single payment and split payments
      const cashSales = sales.reduce((sum: number, sale: any) => {
        let cashAmount = 0;
        
        // Check if sale has split payments
        if (sale.payments && Array.isArray(sale.payments) && sale.payments.length > 0) {
          // Sum cash payments from split payments
          cashAmount = sale.payments
            .filter((p: any) => p.payment_method === 'Cash')
            .reduce((paymentSum: number, p: any) => paymentSum + parseFloat(p.amount || 0), 0);
        } else {
          // Single payment method
          if (sale.payment_method === 'Cash') {
            cashAmount = parseFloat(sale.total_amount || 0);
          }
        }
        
        return sum + cashAmount;
      }, 0);
      
      setShiftCashSales(cashSales);
    } catch (error) {
      console.error('Failed to fetch shift sales:', error);
      setShiftCashSales(0);
    } finally {
      setLoadingShiftSales(false);
    }
  };

  // Close shift - confirm and process
  const handleCloseShift = async () => {
    if (!currentShift) return;

    if (!actualCashInput || actualCashInput.trim() === '') {
      toast.error('Please enter actual cash amount');
      return;
    }

    const actualCash = parseFloat(actualCashInput);
    if (isNaN(actualCash) || actualCash < 0) {
      toast.error('Invalid cash amount');
      return;
    }

    try {
      // Close shift with actual cash
      const closedShift = await api.closeShift(currentShift.id, {
        actual_cash: actualCash
      });

      // Set closing summary and show dialog
      console.log('Closed shift data:', closedShift); // Debug log
      setShiftClosingSummary(closedShift);
      setCurrentShift(null);
      setIsShiftDialogOpen(false);
      setIsCloseShiftDialogOpen(false);
      setActualCashInput('');
      // Small delay to ensure state updates
      setTimeout(() => {
        setIsShiftClosingSummaryOpen(true);
      }, 100);
      toast.success('Shift closed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to close shift');
    }
  };

  // Add split payment
  const addSplitPayment = () => {
    setSplitPayments([...splitPayments, { payment_method: 'Cash', amount: 0 }]);
  };

  // Remove split payment
  const removeSplitPayment = (index: number) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  // Update split payment
  const updateSplitPayment = (index: number, field: string, value: any) => {
    const updated = [...splitPayments];
    updated[index] = { ...updated[index], [field]: value };
    setSplitPayments(updated);
  };

  // Calculate split payment total
  const splitPaymentTotal = splitPayments.reduce((sum, p) => sum + p.amount, 0);
  const splitPaymentRemaining = total - splitPaymentTotal;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Point of Sale
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  v2.0
                </Badge>
              </h1>
              <p className="text-sm text-blue-100">Fast & Easy Pharmacy Billing • Press F1 for shortcuts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
            {/* Shift Status */}
            {currentShift ? (
              <>
                <Button 
                  size="sm"
                  onClick={() => setIsShiftDialogOpen(true)}
                  className="!bg-blue-500 hover:!bg-blue-600 !text-white !border-blue-500 border-2 font-semibold"
                  style={{ backgroundColor: '#3b82f6', color: 'white' }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Shift: {currentShift.shift_number?.slice(-4)}
                  <Badge className="ml-2 bg-blue-700 text-white border-0 h-5 px-1.5 rounded-md text-xs">
                    Open
                  </Badge>
                </Button>
                <Button 
                  size="default"
                  onClick={handleCloseShiftClick}
                  className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600 border-2 shadow-xl font-bold px-5 py-2.5 text-base transition-all hover:scale-105"
                  style={{ backgroundColor: '#dc2626', color: 'white' }}
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Close Shift
                </Button>
              </>
            ) : (
              <Button 
                size="sm"
                onClick={() => setIsShiftDialogOpen(true)}
                className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 border-2 font-semibold shadow-md"
                style={{ backgroundColor: '#2563eb', color: 'white' }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Open Shift
              </Button>
            )}
            
            {/* Transaction Lookup */}
            <Button 
              size="sm"
              onClick={handleLookupClick}
              className={`!border-2 font-semibold shadow-md ${
                isLookupMode 
                  ? '!bg-green-600 hover:!bg-green-700 !text-white !border-green-600' 
                  : '!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600'
              }`}
              style={{ 
                backgroundColor: isLookupMode ? '#16a34a' : '#2563eb', 
                color: 'white' 
              }}
            >
              <SearchIcon className="w-4 h-4 mr-2" />
              {isLookupMode ? 'Lookup Mode' : 'Lookup'}
            </Button>
            
            {/* Void Transaction */}
            <Button 
              size="sm"
              onClick={() => {
                if (lastSaleId) {
                  setVoidSaleId(lastSaleId);
                  setIsVoidDialogOpen(true);
                } else {
                  toast.error('No recent sale to void');
                }
              }}
              className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600 font-semibold shadow-md border-2"
              style={{ backgroundColor: '#dc2626', color: 'white' }}
            >
              <Ban className="w-4 h-4 mr-2" />
              Void
            </Button>
            
            {heldBills.length > 0 && (
              <Button 
                size="sm"
                onClick={() => setIsHeldBillsOpen(true)}
                className="relative !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 font-semibold shadow-md border-2"
                style={{ backgroundColor: '#2563eb', color: 'white' }}
              >
                <Layers className="w-4 h-4 mr-2" />
                Held Bills
                <Badge className="ml-2 bg-yellow-500 text-white border-0 h-5 px-1.5">
                  {heldBills.length}
                </Badge>
              </Button>
            )}
            <Button 
              size="sm"
              onClick={() => setIsShortcutsOpen(true)}
              className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 font-semibold shadow-md border-2"
              style={{ backgroundColor: '#2563eb', color: 'white' }}
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Shortcuts
            </Button>
            <Dialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen}>
              <DialogContent className="!max-w-sm !sm:max-w-sm w-[90%] sm:w-[384px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Keyboard className="w-5 h-5" />
                    Keyboard Shortcuts
                  </DialogTitle>
                  <DialogDescription>Speed up your workflow with these shortcuts</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {[
                    { key: 'F1', description: 'Focus search bar' },
                    { key: 'F2', description: 'Clear cart' },
                    { key: 'F3', description: 'Customer info' },
                    { key: 'F9', description: 'Hold sale' },
                    { key: 'F12', description: 'Process payment' },
                    { key: 'Enter', description: 'Add selected item' },
                    { key: 'Esc', description: 'Close dialogs' }
                  ].map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">{shortcut.description}</span>
                      <kbd className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm font-mono text-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <div className="text-right">
              <p className="text-sm text-blue-100">Cashier</p>
              <p className="font-semibold">Ahmed Khan</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Date</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Panel - Products or Invoices */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {isLookupMode ? (
            <>
              {/* Invoice Search and Go to Sales Button */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="Search invoices by invoice number, customer name, or phone..."
                        className="pl-10 h-12 text-lg"
                        value={invoiceSearchTerm}
                        onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    {invoicesLoading && (
                      <div className="flex items-center text-gray-500">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Loading...
                      </div>
                    )}
                    <Button
                      onClick={handleGoToSales}
                      className="!bg-green-600 hover:!bg-green-700 !text-white !border-green-600 border-2 font-semibold shadow-md"
                      style={{ backgroundColor: '#16a34a', color: 'white' }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Go to Sales
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Invoices List */}
              <Card className="border-0 shadow-sm flex-1 overflow-hidden">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    Invoices ({invoices.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-full overflow-y-auto">
                  {invoicesLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Loading invoices...</p>
                      </div>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No invoices found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {invoices.map((invoice) => (
                        <Card
                          key={invoice.id}
                          className="border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold text-gray-900">{invoice.invoice_number}</h3>
                                  <Badge 
                                    variant={invoice.status === 'Voided' ? 'destructive' : 'default'}
                                    className={invoice.status === 'Voided' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                                  >
                                    {invoice.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-500">Customer</p>
                                    <p className="font-medium text-gray-900">{invoice.customer_name || 'Walk-in Customer'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Date</p>
                                    <p className="font-medium text-gray-900">
                                      {new Date(invoice.sale_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Payment</p>
                                    <p className="font-medium text-gray-900">{invoice.payment_method || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="font-bold text-lg text-blue-600">
                                      PKR {parseFloat(invoice.total_amount?.toString() || '0').toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-300 hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Search and Filters */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="Search medicine by name, generic name, or scan barcode..."
                        className="pl-10 h-12 text-lg"
                        value={searchQuery}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchQuery(value);
                          // If it looks like a barcode (numeric, 8+ digits), handle it separately
                          if (/^\d{8,}$/.test(value)) {
                            setBarcodeInput(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          // If Enter pressed and it's a barcode, trigger scan
                          if (e.key === 'Enter' && /^\d{8,}$/.test(searchQuery)) {
                            setBarcodeInput(searchQuery);
                            setSearchQuery('');
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    {loading && (
                      <div className="flex items-center text-gray-500">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Searching...
                      </div>
                    )}
                    <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-10 w-10 p-0"
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-10 w-10 p-0"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="whitespace-nowrap"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Products Grid/List */}
              <Card className="border-0 shadow-sm flex-1 overflow-hidden">
                <CardContent className="p-4 h-full overflow-y-auto">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredMedicines.map((medicine) => (
                    <Card
                      key={medicine.id}
                      className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => addToCart(medicine)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Pill className="w-6 h-6 text-blue-600" />
                          </div>
                          {medicine.requiresPrescription && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Rx
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{medicine.name}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">{medicine.genericName}</p>
                        <p className="text-xs text-gray-500 mb-3">{medicine.form} • {medicine.strength}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xl font-bold text-blue-600">PKR {(Number(medicine.price) || Number(medicine.selling_price) || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Stock: {medicine.stock || medicine.available_stock || 0}</p>
                          </div>
                          <Button 
                            size="sm" 
                            className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 border-2"
                            style={{ backgroundColor: '#2563eb', color: 'white' }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMedicines.map((medicine) => (
                    <Card
                      key={medicine.id}
                      className="border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => addToCart(medicine)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                            <Pill className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">{medicine.name}</h3>
                              {medicine.requiresPrescription && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                  Rx
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{medicine.genericName}</p>
                            <p className="text-xs text-gray-500">{medicine.form} • {medicine.strength} • {medicine.category}</p>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-blue-600">PKR {(Number(medicine.price) || Number(medicine.selling_price) || 0).toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Stock: {medicine.stock || medicine.available_stock || 0}</p>
                          </div>
                          
                          <Button 
                            size="lg" 
                            className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 border-2 h-12 w-12 p-0 flex-shrink-0"
                            style={{ backgroundColor: '#2563eb', color: 'white' }}
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {filteredMedicines.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No medicines found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Right Panel - Cart & Payment */}
        <div className="w-[480px] flex flex-col gap-4">
          {/* Customer Info */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.phone || 'No phone'}</p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => setIsCustomerDialogOpen(true)}
                  className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 font-semibold shadow-md border-2"
                  style={{ backgroundColor: '#2563eb', color: 'white' }}
                >
                  <User className="w-4 h-4 mr-1" />
                  Change
                </Button>
                <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                  <DialogContent className="!max-w-sm !sm:max-w-sm w-[90%] sm:w-[384px]">
                    <DialogHeader>
                      <DialogTitle>Customer Information</DialogTitle>
                      <DialogDescription>Add or select customer details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Customer Type</Label>
                        <Select 
                          value={customer.type} 
                          onValueChange={(v: any) => setCustomer({...customer, type: v})}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                            <SelectItem value="registered">Registered Patient</SelectItem>
                            <SelectItem value="insurance">Insurance Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {customer.type === 'registered' && (
                        <div>
                          <Label>Search Patient</Label>
                          <Input 
                            className="mt-2" 
                            placeholder="Search by name or phone..."
                            onChange={async (e) => {
                              const searchTerm = e.target.value;
                              if (searchTerm.length >= 2) {
                                try {
                                  const patients = await api.getPatients({ search: searchTerm });
                                  if (patients.length > 0) {
                                    const selectedPatient = patients[0];
                                    setPatient(selectedPatient);
                                    setCustomer({
                                      name: selectedPatient.name,
                                      phone: selectedPatient.phone,
                                      email: selectedPatient.email,
                                      address: selectedPatient.address,
                                      type: 'registered'
                                    });
                                  }
                                } catch (error) {
                                  console.error('Failed to search patients:', error);
                                }
                              }
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <Label>Name</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Enter customer name" 
                          value={customer.name}
                          onChange={(e) => setCustomer({...customer, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="+92-XXX-XXXXXXX" 
                          value={customer.phone}
                          onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Email (Optional)</Label>
                        <Input 
                          type="email" 
                          className="mt-2" 
                          placeholder="customer@email.com" 
                          value={customer.email || ''}
                          onChange={(e) => setCustomer({...customer, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Address (Optional)</Label>
                        <Input 
                          className="mt-2" 
                          placeholder="Address" 
                          value={customer.address || ''}
                          onChange={(e) => setCustomer({...customer, address: e.target.value})}
                        />
                      </div>
                      <Button 
                        className="w-full !bg-green-600 hover:!bg-green-700 !text-white !border-green-600 border-2 font-semibold shadow-md" 
                        onClick={() => setIsCustomerDialogOpen(false)}
                        style={{ backgroundColor: '#16a34a', color: 'white' }}
                      >
                        Save Customer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card className={`border-0 shadow-sm flex-1 flex flex-col overflow-hidden ${isReturnMode ? 'border-l-4 border-l-orange-500' : ''}`}>
            <CardHeader className="border-b border-gray-200 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {isReturnMode ? (
                    <>
                      <RotateCcw className="w-5 h-5 text-orange-600" />
                      <span>Return Items ({selectedReturnItems.size} selected)</span>
                      <Badge className="bg-orange-100 text-orange-800 border-0 ml-2">
                        Return Mode
                      </Badge>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                      Cart ({cart.length} items)
                    </>
                  )}
                </CardTitle>
                {cart.length > 0 && !isReturnMode && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={holdBill}
                      className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 border-2 font-semibold shadow-md"
                      style={{ backgroundColor: '#2563eb', color: 'white' }}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Hold
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={clearCart}
                      className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600 border-2 font-semibold shadow-md"
                      style={{ backgroundColor: '#dc2626', color: 'white' }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                )}
                {isReturnMode && (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setIsReturnMode(false);
                      setReturnSale(null);
                      setSelectedReturnItems(new Set());
                      setReturnReason('');
                      setCart([]);
                    }}
                    className="!bg-gray-600 hover:!bg-gray-700 !text-white !border-gray-600 border-2 font-semibold shadow-md"
                    style={{ backgroundColor: '#4b5563', color: 'white' }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel Return
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-1">Cart is empty</p>
                    <p className="text-sm text-gray-400">Add medicines to start billing</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => {
                    const saleItemId = (item as any).saleItemId;
                    const isSelected = saleItemId ? selectedReturnItems.has(saleItemId) : false;
                    
                    return (
                    <div key={item.medicine.id} className={`p-4 hover:bg-gray-50 transition-colors ${isReturnMode && isSelected ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        {isReturnMode && saleItemId && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleReturnItem(saleItemId)}
                            className="mt-1 mr-3 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{item.medicine.name}</h4>
                          <p className="text-xs text-gray-600">{item.medicine.genericName}</p>
                          <p className="text-xs text-gray-500">{item.medicine.form} • {item.medicine.strength}</p>
                          {isReturnMode && returnSale && (
                            <p className="text-xs text-blue-600 mt-1">
                              Invoice: {returnSale.invoice_number}
                            </p>
                          )}
                        </div>
                        {!isReturnMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeFromCart(item.medicine.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.medicine.id, parseInt(e.target.value) || 0)}
                            className="h-8 w-16 text-center border-0 border-x border-gray-300 rounded-none"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="text-sm text-gray-600">×</span>
                        <span className="text-sm font-medium">PKR {(Number(item.medicine.price) || Number(item.medicine.selling_price) || 0).toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Percent className="w-3 h-3 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="Disc%"
                            value={item.discount || ''}
                            onChange={(e) => updateItemDiscount(item.medicine.id, parseFloat(e.target.value) || 0)}
                            className="h-7 w-20 text-sm"
                            min="0"
                            max="100"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setOverrideItem(item);
                              setOverridePrice(item.medicine.price.toString());
                              setIsPriceOverrideDialogOpen(true);
                            }}
                            className="h-7 px-2 text-xs"
                            title="Override price"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-lg font-bold text-blue-600">PKR {(Number(item.subtotal) || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescription */}
          {cart.some(item => item.medicine.requiresPrescription) && (
            <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <Label className="text-sm font-medium text-red-700">Prescription Required</Label>
                </div>
                <Input
                  placeholder="Enter prescription number"
                  value={prescriptionNumber}
                  onChange={(e) => setPrescriptionNumber(e.target.value)}
                  className="h-9"
                />
              </CardContent>
            </Card>
          )}

          {/* Totals */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">PKR {subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Discount:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                    className="h-8 w-20 text-right"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm font-medium text-red-600">PKR {discountAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (14%):</span>
                <span className="font-medium">PKR {tax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-3xl font-bold text-blue-600">PKR {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Mode UI */}
          {isReturnMode && returnSale && (
            <Card className="border-0 shadow-sm border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                  Process Return
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Return Reason *</Label>
                  <Textarea
                    placeholder="Enter reason for return (e.g., Defective item, Wrong item, Customer request)"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="returnToStock"
                    checked={returnToStock}
                    onChange={(e) => setReturnToStock(e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <Label htmlFor="returnToStock" className="text-sm cursor-pointer">
                    Return items to stock
                  </Label>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Selected Items:</span>
                    <span className="font-semibold">{selectedReturnItems.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Return Amount:</span>
                    <span className="font-bold text-orange-600">
                      PKR {(
                        cart
                          .filter(item => {
                            const saleItemId = (item as any).saleItemId;
                            return saleItemId && selectedReturnItems.has(saleItemId);
                          })
                          .reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={handleProcessReturn}
                  disabled={processingReturn || selectedReturnItems.size === 0 || !returnReason.trim()}
                  className="w-full !bg-orange-600 hover:!bg-orange-700 !text-white !border-orange-600 border-2 font-bold shadow-lg disabled:opacity-50"
                  style={{ backgroundColor: '#ea580c', color: 'white' }}
                >
                  {processingReturn ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Process Return
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {!isReturnMode && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="h-14"
              onClick={clearCart}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
            <Button
              size="lg"
              className="h-14 bg-green-600 hover:bg-green-700 text-white shadow-lg"
              disabled={cart.length === 0}
              onClick={() => setIsPaymentDialogOpen(true)}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Pay PKR {total.toFixed(2)}
            </Button>
          </div>
          )}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogContent className="!max-w-sm !sm:max-w-sm max-h-[90vh] overflow-y-auto w-[90%] sm:w-[384px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Process Payment</DialogTitle>
                  <DialogDescription>Complete the transaction</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                  {/* Split Payment Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="split-payment"
                        checked={useSplitPayment}
                        onChange={(e) => {
                          setUseSplitPayment(e.target.checked);
                          if (!e.target.checked) {
                            setSplitPayments([]);
                          } else {
                            setSplitPayments([{ payment_method: 'Cash', amount: 0 }]);
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="split-payment" className="font-semibold cursor-pointer">
                        Split Payment
                      </Label>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Payment Method */}
                  {!useSplitPayment && (
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                          className={`h-20 flex-col gap-2 ${
                            paymentMethod === 'cash' 
                              ? '!bg-green-600 hover:!bg-green-700 !text-white border-2 border-green-500' 
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setPaymentMethod('cash')}
                        >
                          <DollarSign className="w-6 h-6" />
                          Cash
                        </Button>
                        <Button
                          variant={paymentMethod === 'card' ? 'default' : 'outline'}
                          className={`h-20 flex-col gap-2 ${
                            paymentMethod === 'card' 
                              ? '!bg-blue-600 hover:!bg-blue-700 !text-white border-2 border-blue-500' 
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setPaymentMethod('card')}
                        >
                          <CreditCard className="w-6 h-6" />
                          Card
                        </Button>
                        <Button
                          variant={paymentMethod === 'insurance' ? 'default' : 'outline'}
                          className={`h-20 flex-col gap-2 ${
                            paymentMethod === 'insurance' 
                              ? '!bg-purple-600 hover:!bg-purple-700 !text-white border-2 border-purple-500' 
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setPaymentMethod('insurance')}
                        >
                          <Building className="w-6 h-6" />
                          Insurance
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Split Payment UI */}
                  {useSplitPayment && (
                    <div className="space-y-4">
                      <Label className="text-base font-semibold block">Split Payments</Label>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {splitPayments.map((payment, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-center gap-3">
                              <Select
                                value={payment.payment_method}
                                onValueChange={(value: any) => updateSplitPayment(index, 'payment_method', value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Cash">Cash</SelectItem>
                                  <SelectItem value="Card">Card</SelectItem>
                                  <SelectItem value="Insurance">Insurance</SelectItem>
                                  <SelectItem value="Credit">Credit</SelectItem>
                                  <SelectItem value="Wallet">Wallet</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                placeholder="Amount"
                                value={payment.amount || ''}
                                onChange={(e) => updateSplitPayment(index, 'amount', parseFloat(e.target.value) || 0)}
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSplitPayment(index)}
                                className="text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addSplitPayment}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Payment Method
                      </Button>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Total Paid:</span>
                          <span className="font-bold">PKR {splitPaymentTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Remaining:</span>
                          <span className={`font-bold ${splitPaymentRemaining <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            PKR {splitPaymentRemaining.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash Payment */}
                  {!useSplitPayment && paymentMethod === 'cash' && (
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Cash Received</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        className="h-16 text-2xl text-center font-bold mb-3"
                      />
                      
                      {/* Quick Amount Buttons */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[100, 500, 1000, 5000].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            onClick={() => addToCash(amount)}
                            className="h-12"
                          >
                            +{amount}
                          </Button>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <Button
                            key={num}
                            variant="outline"
                            onClick={() => setReceivedAmount(receivedAmount + num.toString())}
                            className="h-14 text-xl font-semibold"
                          >
                            {num}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => setReceivedAmount('')}
                          className="h-14 text-xl font-semibold"
                        >
                          C
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setReceivedAmount(receivedAmount + '0')}
                          className="h-14 text-xl font-semibold"
                        >
                          0
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setReceivedAmount(total.toFixed(2))}
                          className="h-14 text-sm font-semibold"
                        >
                          Exact
                        </Button>
                      </div>

                      {/* Change */}
                      {receivedAmount && changeAmount >= 0 && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">Change:</span>
                            <span className="text-3xl font-bold text-green-600">PKR {changeAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-xl text-blue-600">PKR {total.toFixed(2)}</span>
                    </div>
                    {useSplitPayment ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Paid:</span>
                          <span className="font-medium">PKR {splitPaymentTotal.toFixed(2)}</span>
                        </div>
                        {splitPaymentRemaining <= 0 && (
                          <div className="flex justify-between text-green-600">
                            <span className="font-medium">Change:</span>
                            <span className="font-bold">PKR {Math.abs(splitPaymentRemaining).toFixed(2)}</span>
                          </div>
                        )}
                        {splitPaymentRemaining > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span className="font-medium">Remaining:</span>
                            <span className="font-bold">PKR {splitPaymentRemaining.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      paymentMethod === 'cash' && receivedAmount && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Received:</span>
                            <span className="font-medium">PKR {parseFloat(receivedAmount).toFixed(2)}</span>
                          </div>
                          {changeAmount >= 0 && (
                            <div className="flex justify-between text-green-600">
                              <span className="font-medium">Change:</span>
                              <span className="font-bold">PKR {changeAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )
                    )}
                  </div>

                  {/* Complete Payment Button */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsPaymentDialogOpen(false)}
                      disabled={processingSale}
                      className="border-gray-300 hover:bg-gray-50 font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="lg"
                      className="!bg-green-600 hover:!bg-green-700 !text-white !border-green-600 border-2 font-bold shadow-lg"
                      onClick={processPayment}
                      disabled={processingSale}
                      style={{ backgroundColor: '#16a34a', color: 'white' }}
                    >
                      {processingSale ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Complete Payment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button 
              size="sm" 
              onClick={holdBill} 
              disabled={cart.length === 0}
              className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 border-2 font-semibold shadow-md disabled:opacity-50"
              style={{ backgroundColor: '#2563eb', color: 'white' }}
            >
              <Clock className="w-4 h-4 mr-1" />
              Hold
            </Button>
            <Button 
              size="sm" 
              onClick={saveCurrentSale}
              disabled={cart.length === 0}
              className="!bg-green-600 hover:!bg-green-700 !text-white !border-green-600 border-2 font-semibold shadow-md disabled:opacity-50"
              style={{ backgroundColor: '#16a34a', color: 'white' }}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button 
              size="sm" 
              onClick={() => printReceipt()}
              disabled={!lastSaleId}
              title={lastSaleId ? 'Print last receipt' : 'Complete a sale first'}
              className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 border-2 font-semibold shadow-md disabled:opacity-50"
              style={{ backgroundColor: '#2563eb', color: 'white' }}
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Held Bills Dialog */}
      <Dialog open={isHeldBillsOpen} onOpenChange={setIsHeldBillsOpen}>
        <DialogContent className="!max-w-sm !sm:max-w-sm max-h-[85vh] overflow-y-auto w-[90%] sm:w-[384px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Layers className="w-6 h-6 text-blue-600" />
              Held Bills ({heldBills.length})
            </DialogTitle>
            <DialogDescription>
              Click on any bill to load it back into the cart
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[500px] overflow-y-auto pr-2">
            {heldBills.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-1">No held bills</p>
                <p className="text-sm text-gray-400">Hold a bill to save it for later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {heldBills.map((bill) => (
                  <Card
                    key={bill.id}
                    className="border-2 hover:border-blue-400 transition-all cursor-pointer group"
                    onClick={() => {
                      loadHeldBill(bill).catch(err => console.error('Failed to load bill:', err));
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {bill.billNumber}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {bill.cart.length} items
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              <User className="w-3 h-3 inline mr-1" />
                              {bill.customer.name}
                            </p>
                            <p className="text-gray-600">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {bill.timestamp.toLocaleString()}
                            </p>
                            <p className="font-bold text-blue-600">
                              Total: PKR {bill.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadHeldBill(bill).catch(err => console.error('Failed to load bill:', err));
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHeldBill(bill.id).catch(err => console.error('Failed to delete bill:', err));
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Show cart items preview */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Items:</p>
                        <div className="space-y-1">
                          {bill.cart.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="text-xs text-gray-600 flex justify-between">
                              <span>{item.medicine.name} × {item.quantity}</span>
                              <span className="font-medium">PKR {(Number(item.subtotal) || 0).toFixed(2)}</span>
                            </div>
                          ))}
                          {bill.cart.length > 3 && (
                            <p className="text-xs text-gray-500 italic">
                              +{bill.cart.length - 3} more items...
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Void Transaction Dialog */}
      <Dialog open={isVoidDialogOpen} onOpenChange={setIsVoidDialogOpen}>
        <DialogContent className="!max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="w-5 h-5" />
              Void Transaction
            </DialogTitle>
            <DialogDescription>Void a sale transaction. Stock will be restored.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Sale ID / Invoice Number</Label>
              <Input
                placeholder="Enter sale ID or invoice number"
                value={voidSaleId?.toString() || ''}
                onChange={(e) => setVoidSaleId(e.target.value ? parseInt(e.target.value) : null)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Void Type</Label>
              <Select value={voidType} onValueChange={(v: any) => setVoidType(v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Error">Error</SelectItem>
                  <SelectItem value="Customer Request">Customer Request</SelectItem>
                  <SelectItem value="System Error">System Error</SelectItem>
                  <SelectItem value="Fraud">Fraud</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Void Reason *</Label>
              <Textarea
                placeholder="Enter reason for voiding this transaction"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50 font-semibold"
                onClick={() => {
                  setIsVoidDialogOpen(false);
                  setVoidSaleId(null);
                  setVoidReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white !border-red-600 border-2 font-bold shadow-md disabled:opacity-50"
                onClick={handleVoidTransaction}
                disabled={!voidSaleId || !voidReason.trim()}
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                <Ban className="w-4 h-4 mr-2" />
                Void Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Lookup Dialog */}
      <Dialog open={isLookupDialogOpen} onOpenChange={setIsLookupDialogOpen}>
        <DialogContent className="!max-w-sm !sm:max-w-sm max-h-[90vh] overflow-y-auto w-[90%] sm:w-[384px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SearchIcon className="w-5 h-5" />
              Transaction Lookup
            </DialogTitle>
            <DialogDescription>Search for a sale by invoice number</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter invoice number (e.g., INV-20240115-0001)"
                value={lookupInvoiceNumber}
                onChange={(e) => setLookupInvoiceNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLookupTransaction();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleLookupTransaction} disabled={lookupLoading}>
                {lookupLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <SearchIcon className="w-4 h-4" />
                )}
              </Button>
            </div>

            {lookedUpSale && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Invoice: {lookedUpSale.invoice_number}</span>
                    <Badge variant={lookedUpSale.status === 'Voided' ? 'destructive' : 'default'}>
                      {lookedUpSale.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Date</Label>
                      <p className="font-medium">{new Date(lookedUpSale.sale_date).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Customer</Label>
                      <p className="font-medium">{lookedUpSale.customer_name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Payment Method</Label>
                      <p className="font-medium">{lookedUpSale.payment_method}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Total Amount</Label>
                      <p className="font-medium text-blue-600">PKR {parseFloat(lookedUpSale.total_amount?.toString() || '0').toFixed(2)}</p>
                    </div>
                  </div>

                  {lookedUpSale.items && lookedUpSale.items.length > 0 && (
                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Items</Label>
                      <div className="space-y-2">
                        {lookedUpSale.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                            <span>{item.medicine_name} × {item.quantity}</span>
                            <span className="font-medium">PKR {parseFloat(item.subtotal?.toString() || '0').toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lookedUpSale.payments && lookedUpSale.payments.length > 0 && (
                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Split Payments</Label>
                      <div className="space-y-2">
                        {lookedUpSale.payments.map((payment: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm p-2 bg-blue-50 rounded">
                            <span>{payment.payment_method}</span>
                            <span className="font-medium">PKR {parseFloat(payment.amount?.toString() || '0').toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => printReceiptByInvoice(lookedUpSale.invoice_number)}
                      className="w-full border-blue-300 hover:bg-blue-50"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Reprint Receipt
                    </Button>
                    {lookedUpSale.status !== 'Voided' && lookedUpSale.status !== 'Refunded' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setVoidSaleId(lookedUpSale.id);
                            setIsVoidDialogOpen(true);
                            setIsLookupDialogOpen(false);
                          }}
                          className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white !border-red-600 border-2"
                          style={{ backgroundColor: '#dc2626', color: 'white' }}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Void
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to refund processing or open refund dialog
                            window.location.href = '#refunds';
                            toast.info('Please use the Returns section to process refunds');
                            setIsLookupDialogOpen(false);
                          }}
                          className="flex-1 !bg-orange-600 hover:!bg-orange-700 !text-white !border-orange-600 border-2"
                          style={{ backgroundColor: '#ea580c', color: 'white' }}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Return
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shift Management Dialog */}
      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent className="!max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Shift Management
            </DialogTitle>
            <DialogDescription>
              {currentShift ? 'Manage your current shift' : 'Open a new shift'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentShift ? (
              <>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Shift Number</Label>
                      <p className="font-bold">{currentShift.shift_number}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Status</Label>
                      <Badge className="bg-blue-500">Open</Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Opening Cash</Label>
                      <p className="font-medium">PKR {parseFloat(currentShift.opening_cash || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Started At</Label>
                      <p className="font-medium text-sm">
                        {new Date(currentShift.start_time).toLocaleString()}
                      </p>
                    </div>
                    {currentShift.total_sales !== undefined && (
                      <>
                        <div>
                          <Label className="text-xs text-gray-500">Total Sales</Label>
                          <p className="font-medium">{currentShift.total_sales}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Total Revenue</Label>
                          <p className="font-medium text-blue-600">PKR {parseFloat(currentShift.total_revenue || 0).toFixed(2)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50 font-semibold"
                    onClick={() => setIsShiftDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white !border-red-600 border-2 font-bold shadow-md"
                    onClick={handleCloseShiftClick}
                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                  >
                    Close Shift
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Opening Cash *</Label>
                  <Input
                    type="number"
                    value={shiftOpeningCash}
                    onChange={(e) => setShiftOpeningCash(e.target.value)}
                    className="mt-2"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the starting cash amount for this shift</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50 font-semibold"
                    onClick={() => setIsShiftDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 !bg-green-600 hover:!bg-green-700 !text-white !border-green-600 border-2 font-bold shadow-md disabled:opacity-50"
                    onClick={handleOpenShift}
                    disabled={!shiftOpeningCash}
                    style={{ backgroundColor: '#16a34a', color: 'white' }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Open Shift
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Shift Confirmation Dialog */}
      <Dialog open={isCloseShiftDialogOpen} onOpenChange={setIsCloseShiftDialogOpen}>
        <DialogContent className="!max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Close Shift
            </DialogTitle>
            <DialogDescription>
              Enter the actual cash count to close this shift
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentShift && (
              <>
                {loadingShiftSales ? (
                  <div className="p-4 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">Calculating cash sales...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Shift:</span>
                          <span className="font-bold text-lg">{currentShift.shift_number}</span>
                        </div>
                        <div className="border-t border-blue-200 pt-2 mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Opening Cash:</span>
                            <span className="font-semibold">PKR {parseFloat(currentShift.opening_cash || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cash Sales:</span>
                            <span className="font-semibold text-green-600">+ PKR {shiftCashSales.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between items-center">
                            <span className="text-gray-800 font-bold">Expected Closing Cash:</span>
                            <span className="font-bold text-lg text-blue-700">
                              PKR {(parseFloat(currentShift.opening_cash || 0) + shiftCashSales).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Actual Cash Count *</Label>
                      <Input
                        type="number"
                        value={actualCashInput}
                        onChange={(e) => setActualCashInput(e.target.value)}
                        className="mt-2 text-lg font-semibold"
                        placeholder="0.00"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCloseShift();
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter the actual cash amount counted</p>
                      {actualCashInput && !isNaN(parseFloat(actualCashInput)) && (
                        <div className="mt-2 p-2 rounded-lg bg-gray-50">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Difference:</span>
                            <span className={`font-bold ${
                              parseFloat(actualCashInput) >= (parseFloat(currentShift.opening_cash || 0) + shiftCashSales) 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {parseFloat(actualCashInput) >= (parseFloat(currentShift.opening_cash || 0) + shiftCashSales) ? '+' : ''}
                              PKR {(parseFloat(actualCashInput) - (parseFloat(currentShift.opening_cash || 0) + shiftCashSales)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50 font-semibold"
                    onClick={() => {
                      setIsCloseShiftDialogOpen(false);
                      setActualCashInput('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white !border-red-600 border-2 font-bold shadow-md disabled:opacity-50"
                    onClick={handleCloseShift}
                    disabled={!actualCashInput || actualCashInput.trim() === ''}
                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                  >
                    Close Shift
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shift Closing Summary Dialog */}
      <Dialog open={isShiftClosingSummaryOpen} onOpenChange={setIsShiftClosingSummaryOpen}>
        <DialogContent className="!max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Shift Closing Summary
            </DialogTitle>
            <DialogDescription>Summary of all transactions for this shift</DialogDescription>
          </DialogHeader>
          {shiftClosingSummary && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-gray-500">Shift Number</Label>
                    <p className="font-bold">{shiftClosingSummary.shift_number}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <Badge className="bg-gray-500">Closed</Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Start Time</Label>
                    <p className="font-medium text-sm">
                      {new Date(shiftClosingSummary.start_time).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">End Time</Label>
                    <p className="font-medium text-sm">
                      {new Date(shiftClosingSummary.end_time).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Opening Cash:</span>
                  <span className="font-bold">PKR {parseFloat(shiftClosingSummary.opening_cash || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Sales:</span>
                  <span className="font-bold">{shiftClosingSummary.total_sales || 0}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Total Revenue:</span>
                  <span className="font-bold text-green-600">PKR {parseFloat(shiftClosingSummary.total_revenue || 0).toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Cash Sales</Label>
                    <p className="font-medium">PKR {parseFloat(shiftClosingSummary.cash_sales || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Card Sales</Label>
                    <p className="font-medium">PKR {parseFloat(shiftClosingSummary.card_sales || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Other Sales</Label>
                    <p className="font-medium">PKR {parseFloat(shiftClosingSummary.other_sales || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Expected Cash:</span>
                  <span className="font-bold">PKR {parseFloat(shiftClosingSummary.expected_cash || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Actual Cash:</span>
                  <span className="font-bold">PKR {parseFloat(shiftClosingSummary.actual_cash || 0).toFixed(2)}</span>
                </div>

                <div className={`flex justify-between items-center p-3 rounded-lg ${
                  parseFloat(shiftClosingSummary.difference || 0) >= 0 
                    ? 'bg-green-50' 
                    : 'bg-red-50'
                }`}>
                  <span className="font-medium">Difference:</span>
                  <span className={`font-bold ${
                    parseFloat(shiftClosingSummary.difference || 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {parseFloat(shiftClosingSummary.difference || 0) >= 0 ? '+' : ''}
                    PKR {parseFloat(shiftClosingSummary.difference || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 border-2 font-semibold shadow-md"
                  onClick={() => {
                    setIsShiftClosingSummaryOpen(false);
                    setShiftClosingSummary(null);
                  }}
                  style={{ backgroundColor: '#2563eb', color: 'white' }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Price Override Dialog */}
      <Dialog open={isPriceOverrideDialogOpen} onOpenChange={setIsPriceOverrideDialogOpen}>
        <DialogContent className="!max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Price Override
            </DialogTitle>
            <DialogDescription>
              Request a price override for {overrideItem?.medicine.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {overrideItem && (
              <>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-bold">PKR {overrideItem.medicine.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">New Price:</span>
                    <Input
                      type="number"
                      value={overridePrice}
                      onChange={(e) => setOverridePrice(e.target.value)}
                      className="w-32 h-8 text-right"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label>Reason for Override *</Label>
                  <Input
                    placeholder="Enter reason (e.g., Bulk discount, Special offer)"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Shield className="w-4 h-4" />
                    <span>This request requires manager approval</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50 font-semibold"
                    onClick={() => {
                      setIsPriceOverrideDialogOpen(false);
                      setOverrideItem(null);
                      setOverridePrice('');
                      setOverrideReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 border-2 font-bold shadow-md"
                    style={{ backgroundColor: '#2563eb', color: 'white' }}
                    onClick={async () => {
                      if (!overrideItem || !overridePrice || !overrideReason) {
                        toast.error('Please fill all fields');
                        return;
                      }

                      try {
                        await api.createPriceOverride({
                          medicine_id: typeof overrideItem.medicine.id === 'string' 
                            ? parseInt(overrideItem.medicine.id) 
                            : overrideItem.medicine.id,
                          original_price: overrideItem.medicine.price,
                          override_price: parseFloat(overridePrice),
                          override_reason: overrideReason
                        });
                        toast.success('Price override request submitted. Waiting for approval.');
                        setIsPriceOverrideDialogOpen(false);
                        setOverrideItem(null);
                        setOverridePrice('');
                        setOverrideReason('');
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to create price override request');
                      }
                    }}
                    disabled={!overridePrice || !overrideReason.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md disabled:opacity-50"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Request Override
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
