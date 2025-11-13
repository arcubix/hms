import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Search, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Package,
  Calendar,
  Filter,
  Download,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { api, StockMovement, StockMovementSummary, Medicine } from '../../services/api';

export function StockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<StockMovementSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  
  // Filters
  const [medicineFilter, setMedicineFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMovements();
    loadMedicines();
    loadSummary();
  }, [medicineFilter, typeFilter, startDate, endDate]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (medicineFilter !== 'All') {
        filters.medicine_id = parseInt(medicineFilter);
      }
      if (typeFilter !== 'All') {
        filters.movement_type = typeFilter;
      }
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      filters.limit = 500;
      
      const data = await api.getStockMovements(filters);
      setMovements(data);
    } catch (error: any) {
      console.error('Failed to load movements:', error);
      toast.error('Failed to load stock movements');
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

  const loadSummary = async () => {
    try {
      const medicineId = medicineFilter !== 'All' ? parseInt(medicineFilter) : undefined;
      const data = await api.getStockMovementsSummary(medicineId, startDate || undefined, endDate || undefined);
      setSummary(data);
    } catch (error: any) {
      console.error('Failed to load summary:', error);
    }
  };

  const getMovementIcon = (type: string, quantity: number) => {
    if (quantity > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const variants: Record<string, string> = {
      'Sale': 'bg-red-100 text-red-800',
      'Purchase': 'bg-green-100 text-green-800',
      'Adjustment': 'bg-yellow-100 text-yellow-800',
      'Refund': 'bg-blue-100 text-blue-800',
      'Transfer': 'bg-purple-100 text-purple-800',
      'Expiry': 'bg-orange-100 text-orange-800'
    };
    return variants[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredMovements = movements.filter(mov => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        mov.medicine_name?.toLowerCase().includes(query) ||
        mov.movement_type.toLowerCase().includes(query) ||
        mov.reference_type?.toLowerCase().includes(query) ||
        mov.notes?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Medicine', 'Type', 'Quantity', 'Stock Before', 'Stock After', 'Reference', 'Notes', 'Created By'];
    const rows = filteredMovements.map(mov => [
      new Date(mov.created_at).toLocaleString(),
      mov.medicine_name || '',
      mov.movement_type,
      mov.quantity.toString(),
      mov.stock_before?.toString() || '',
      mov.stock_after?.toString() || '',
      mov.reference_type ? `${mov.reference_type} #${mov.reference_id}` : '',
      mov.notes || '',
      mov.created_by_name || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-movements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Stock movements exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Movements Audit</h1>
          <p className="text-gray-600 mt-1">Complete audit trail of all stock transactions</p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      {summary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((item) => (
            <Card key={item.movement_type}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{item.movement_type}</p>
                    <p className="text-2xl font-bold mt-1">{item.movement_count}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-green-600">+{item.total_in}</span>
                      <span className="text-red-600">-{item.total_out}</span>
                    </div>
                  </div>
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Label>Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search movements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Medicine</Label>
              <Select value={medicineFilter} onValueChange={setMedicineFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Medicines</SelectItem>
                  {medicines.map(med => (
                    <SelectItem key={med.id} value={med.id.toString()}>
                      {med.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Sale">Sale</SelectItem>
                  <SelectItem value="Purchase">Purchase</SelectItem>
                  <SelectItem value="Adjustment">Adjustment</SelectItem>
                  <SelectItem value="Refund">Refund</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                  <SelectItem value="Expiry">Expiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={loadMovements} className="mt-6">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movements ({filteredMovements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No movements found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Stock Before</TableHead>
                    <TableHead className="text-right">Stock After</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Created By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(mov.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(mov.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{mov.medicine_name}</div>
                          {mov.medicine_code && (
                            <div className="text-xs text-gray-500">{mov.medicine_code}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(mov.movement_type, mov.quantity)}
                          <Badge className={getMovementBadge(mov.movement_type)}>
                            {mov.movement_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={mov.quantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {mov.stock_before !== undefined ? mov.stock_before : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {mov.stock_after !== undefined ? mov.stock_after : '-'}
                      </TableCell>
                      <TableCell>
                        {mov.reference_type && mov.reference_id ? (
                          <span className="text-sm">
                            {mov.reference_type} #{mov.reference_id}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {mov.notes || <span className="text-gray-400">-</span>}
                      </TableCell>
                      <TableCell>
                        {mov.created_by_name || <span className="text-gray-400">-</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

