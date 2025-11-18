/**
 * Stock Management Component
 * Features: Stock CRUD, batch management, expiry tracking, stock adjustments
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  MapPin,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { api, PharmacyStock, Medicine } from '../../services/api';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '../ui/pagination';

interface StockManagementProps {
  defaultTab?: 'items' | 'expired' | 'low-stock';
}

export function StockManagement({ defaultTab = 'items' }: StockManagementProps) {
  const [stock, setStock] = useState<PharmacyStock[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expiringDays, setExpiringDays] = useState(90);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState<PharmacyStock | null>(null);
  const [expiringStock, setExpiringStock] = useState<PharmacyStock[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    medicine_id: '',
    batch_number: '',
    manufacture_date: '',
    expiry_date: '',
    quantity: '',
    cost_price: '',
    selling_price: '',
    location: '',
    supplier_id: '',
    notes: '',
    requires_prescription: false
  });

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    loadStock();
    loadMedicines();
    loadExpiringStock();
    loadLowStockAlerts();
  }, []);

  useEffect(() => {
    if (activeTab === 'expired') {
      loadExpiringStock();
    } else if (activeTab === 'low-stock') {
      loadLowStockAlerts();
    } else {
      loadStock();
    }
  }, [activeTab]);

  // Reload stock when search term or category changes (only for items tab)
  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (activeTab !== 'items') {
      return; // Only search when on items tab
    }
    
    // Reset to page 1 when search or category changes
    setCurrentPage(1);
    
    const timer = setTimeout(() => {
      loadStock();
    }, 500); // Wait 500ms after user stops typing
    
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, activeTab]);

  const loadStock = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      const data = await api.getPharmacyStock(filters);
      setStock(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load stock');
    } finally {
      setLoading(false);
    }
  };

  const loadMedicines = async () => {
    try {
      const data = await api.getMedicines({ status: 'Active' });
      setMedicines(data);
    } catch (error: any) {
      console.error('Failed to load medicines:', error);
    }
  };

  const loadExpiringStock = async () => {
    try {
      const data = await api.getExpiringStock(expiringDays);
      setExpiringStock(data);
    } catch (error: any) {
      console.error('Failed to load expiring stock:', error);
    }
  };

  const loadLowStockAlerts = async () => {
    try {
      const data = await api.getLowStockAlerts();
      setLowStockAlerts(data);
    } catch (error: any) {
      console.error('Failed to load low stock alerts:', error);
    }
  };

  const handleAddStock = async () => {
    try {
      if (!formData.medicine_id || !formData.batch_number || !formData.expiry_date || !formData.quantity) {
        toast.error('Please fill all required fields');
        return;
      }

      // Create stock
      await api.createStock({
        medicine_id: parseInt(formData.medicine_id),
        batch_number: formData.batch_number,
        manufacture_date: formData.manufacture_date || undefined,
        expiry_date: formData.expiry_date,
        quantity: parseInt(formData.quantity),
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        location: formData.location || undefined,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : undefined,
        notes: formData.notes || undefined
      });

      // Update medicine's requires_prescription if changed
      try {
        await api.updateMedicine(formData.medicine_id, {
          requires_prescription: formData.requires_prescription ? 1 : 0
        });
      } catch (error) {
        console.error('Failed to update medicine requires_prescription:', error);
        // Don't fail the whole operation if medicine update fails
      }

      toast.success('Stock added successfully');
      setShowAddDialog(false);
      resetForm();
      loadStock();
      loadExpiringStock();
      loadLowStockAlerts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add stock');
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedStock) return;

    try {
      // Update stock
      await api.updateStock(selectedStock.id, {
        batch_number: formData.batch_number,
        manufacture_date: formData.manufacture_date || undefined,
        expiry_date: formData.expiry_date,
        quantity: parseInt(formData.quantity),
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        location: formData.location || undefined,
        notes: formData.notes || undefined
      });

      // Update medicine's requires_prescription if changed
      try {
        await api.updateMedicine(formData.medicine_id, {
          requires_prescription: formData.requires_prescription ? 1 : 0
        });
      } catch (error) {
        console.error('Failed to update medicine requires_prescription:', error);
        // Don't fail the whole operation if medicine update fails
      }

      toast.success('Stock updated successfully');
      setShowEditDialog(false);
      setSelectedStock(null);
      resetForm();
      loadStock();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stock');
    }
  };

  const resetForm = () => {
    setFormData({
      medicine_id: '',
      batch_number: '',
      manufacture_date: '',
      expiry_date: '',
      quantity: '',
      cost_price: '',
      selling_price: '',
      location: '',
      supplier_id: '',
      notes: '',
      requires_prescription: false
    });
  };

  const openEditDialog = async (stockItem: PharmacyStock) => {
    setSelectedStock(stockItem);
    
    // Fetch medicine data to get requires_prescription
    let requiresPrescription = false;
    try {
      const medicine = await api.getMedicine(stockItem.medicine_id.toString());
      requiresPrescription = medicine.requires_prescription === true || medicine.requires_prescription === 1 || medicine.requires_prescription === '1';
    } catch (error) {
      console.error('Failed to load medicine data:', error);
    }
    
    setFormData({
      medicine_id: stockItem.medicine_id.toString(),
      batch_number: stockItem.batch_number,
      manufacture_date: stockItem.manufacture_date || '',
      expiry_date: stockItem.expiry_date,
      quantity: stockItem.quantity.toString(),
      cost_price: stockItem.cost_price.toString(),
      selling_price: stockItem.selling_price.toString(),
      location: stockItem.location || '',
      supplier_id: stockItem.supplier_id?.toString() || '',
      notes: stockItem.notes || '',
      requires_prescription: requiresPrescription
    });
    setShowEditDialog(true);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleMarkExpired = async () => {
    if (!confirm('Mark all expired stock batches as expired? This will update their status.')) {
      return;
    }

    try {
      const result = await api.markExpiredStock();
      toast.success(`Marked ${result.updated} stock batches as expired`);
      loadStock();
      loadExpiringStock();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark expired stock');
    }
  };

  const categories = Array.from(new Set(medicines.map(m => m.category).filter(Boolean)));

  // Pagination calculations
  const totalItems = stock.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStock = stock.slice(startIndex, endIndex);

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Always show first page
    pages.push(1);
    
    if (currentPage <= 4) {
      // Near the start: show 1, 2, 3, 4, 5, ..., last
      for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
        pages.push(i);
      }
      if (totalPages > 6) {
        pages.push('ellipsis-end');
      }
    } else if (currentPage >= totalPages - 3) {
      // Near the end: show 1, ..., last-4, last-3, last-2, last-1, last
      if (totalPages > 6) {
        pages.push('ellipsis-start');
      }
      for (let i = Math.max(2, totalPages - 4); i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // In the middle: show 1, ..., current-1, current, current+1, ..., last
      pages.push('ellipsis-start');
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push('ellipsis-end');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Management</h2>
          <p className="text-gray-600">Manage medicine stock, batches, and expiry tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleMarkExpired}>
            <XCircle className="w-4 h-4 mr-2" />
            Mark Expired
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">
            <Package className="w-4 h-4 mr-2" />
            Inventory Items
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Low Stock
          </TabsTrigger>
          <TabsTrigger value="expired">
            <Clock className="w-4 h-4 mr-2" />
            Expired Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stock Inventory</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search stock..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loadStock();
                      }
                    }}
                    className="w-64"
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={loadStock}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : stock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No stock found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStock.map((item) => {
                      const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.medicine_name}</div>
                              {item.generic_name && (
                                <div className="text-sm text-gray-500">{item.generic_name}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.batch_number}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {new Date(item.expiry_date).toLocaleDateString()}
                              {daysUntilExpiry <= 30 && (
                                <Badge variant="destructive" className="text-xs">
                                  {daysUntilExpiry}d
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>Rs. {parseFloat(item.cost_price?.toString() || '0').toFixed(2)}</TableCell>
                          <TableCell>Rs. {parseFloat(item.selling_price?.toString() || '0').toFixed(2)}</TableCell>
                          <TableCell>{item.location || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} items
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              handlePageChange(currentPage - 1);
                            }
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {getPageNumbers().map((page, index) => {
                        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page as number);
                              }}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              handlePageChange(currentPage + 1);
                            }
                          }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expired Items</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={expiringDays}
                    onChange={(e) => setExpiringDays(parseInt(e.target.value) || 90)}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600">days</span>
                  <Button variant="outline" onClick={loadExpiringStock}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Until Expiry</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-500">Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : expiringStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No expiring stock found
                      </TableCell>
                    </TableRow>
                  ) : (
                    expiringStock.map((item) => {
                      const days = getDaysUntilExpiry(item.expiry_date);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.medicine_name}</TableCell>
                          <TableCell>{item.batch_number}</TableCell>
                          <TableCell>{new Date(item.expiry_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={days <= 7 ? 'destructive' : days <= 30 ? 'default' : 'secondary'}>
                              {days} days
                            </Badge>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Available Stock</TableHead>
                    <TableHead>Minimum Stock</TableHead>
                    <TableHead>Reorder Quantity</TableHead>
                    <TableHead>Preferred Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-500">Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : lowStockAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No low stock alerts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    lowStockAlerts.map((alert) => (
                      <TableRow key={alert.medicine_id || alert.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{alert.name || alert.medicine_name}</div>
                            {(alert.generic_name || alert.medicine_generic_name) && (
                              <div className="text-sm text-gray-500">{alert.generic_name || alert.medicine_generic_name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{alert.available_stock || alert.current_stock || 0}</Badge>
                        </TableCell>
                        <TableCell>{alert.minimum_stock || alert.min_stock || 0}</TableCell>
                        <TableCell>{alert.reorder_quantity || (alert.minimum_stock || alert.min_stock || 0) * 2}</TableCell>
                        <TableCell>{alert.preferred_supplier_name || alert.supplier_name || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Stock Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>Add new stock batch for a medicine</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Medicine *</Label>
              <Select 
                value={formData.medicine_id} 
                onValueChange={async (v) => {
                  setFormData({...formData, medicine_id: v});
                  // Load medicine's requires_prescription value
                  try {
                    const medicine = await api.getMedicine(v);
                    const requiresPrescription = medicine.requires_prescription === true || medicine.requires_prescription === 1 || medicine.requires_prescription === '1';
                    setFormData(prev => ({...prev, medicine_id: v, requires_prescription: requiresPrescription}));
                  } catch (error) {
                    console.error('Failed to load medicine data:', error);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select medicine" />
                </SelectTrigger>
                <SelectContent>
                  {medicines.map(med => (
                    <SelectItem key={med.id} value={med.id.toString()}>
                      {med.name} {med.generic_name && `(${med.generic_name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Batch Number *</Label>
              <Input
                value={formData.batch_number}
                onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                placeholder="BATCH001"
              />
            </div>
            <div className="space-y-2">
              <Label>Manufacture Date</Label>
              <Input
                type="date"
                value={formData.manufacture_date}
                onChange={(e) => setFormData({...formData, manufacture_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date *</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                placeholder="100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Shelf A-1"
              />
            </div>
            <div className="space-y-2">
              <Label>Cost Price *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Selling Price *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({...formData, selling_price: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes..."
              />
            </div>
            <div className="space-y-2 col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requires_prescription_add"
                  checked={formData.requires_prescription}
                  onCheckedChange={(checked) => setFormData({...formData, requires_prescription: checked === true})}
                />
                <Label htmlFor="requires_prescription_add" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Requires Prescription</span>
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Check this if this medicine requires a valid prescription to be sold
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddStock}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Stock</DialogTitle>
            <DialogDescription>Update stock batch information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch Number *</Label>
              <Input
                value={formData.batch_number}
                onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Manufacture Date</Label>
              <Input
                type="date"
                value={formData.manufacture_date}
                onChange={(e) => setFormData({...formData, manufacture_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date *</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cost Price *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Selling Price *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({...formData, selling_price: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requires_prescription_edit"
                  checked={formData.requires_prescription}
                  onCheckedChange={(checked) => setFormData({...formData, requires_prescription: checked === true})}
                />
                <Label htmlFor="requires_prescription_edit" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Requires Prescription</span>
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Check this if this medicine requires a valid prescription to be sold
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateStock}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

