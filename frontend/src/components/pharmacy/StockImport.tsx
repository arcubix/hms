/**
 * Stock Import Component
 * Features: CSV/Excel import with template download, validation, and error handling
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

export function StockImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    total: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
        toast.error('Please select a CSV or Excel file');
        return;
      }
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await api.downloadStockImportTemplate();
      toast.success('Template downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download template');
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setImporting(true);
      const result = await api.importStock(file);
      setImportResult(result);
      
      if (result.errors.length === 0) {
        toast.success(`Successfully imported ${result.imported} stock entries`);
      } else {
        toast.warning(`Imported ${result.imported} of ${result.total} entries. ${result.errors.length} errors occurred.`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to import stock');
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Stock Import</h2>
        <p className="text-gray-600">Import stock data from CSV or Excel file</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Stock</CardTitle>
          <CardDescription>
            Upload a CSV or Excel file to bulk import stock entries. Download the template to see the required format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <div className="flex-1">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="mt-1"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">{file.name}</span>
                <Badge variant="outline">{(file.size / 1024).toFixed(2)} KB</Badge>
              </div>
            )}
          </div>

          {file && (
            <div className="flex items-center gap-2">
              <Button onClick={handleImport} disabled={importing}>
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Stock
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={reset}>
                Clear
              </Button>
            </div>
          )}

          {importResult && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Imported: {importResult.imported} of {importResult.total}</span>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium mb-2 text-red-600">Errors ({importResult.errors.length}):</p>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {importResult.errors.map((error, idx) => (
                          <div key={idx} className="text-sm text-red-600 flex items-start gap-2">
                            <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">File Format Requirements:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>CSV or Excel format (.csv, .xlsx, .xls)</li>
              <li>First row should be headers (will be skipped)</li>
              <li>Required columns: Medicine Code, Batch Number, Expiry Date, Quantity, Cost Price, Selling Price</li>
              <li>Optional columns: Location, Manufacture Date</li>
              <li>Date format: YYYY-MM-DD</li>
              <li>Numeric values should not contain currency symbols</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Sample Data Format:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Code</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Manufacture Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>MED000001</TableCell>
                  <TableCell>BATCH001</TableCell>
                  <TableCell>2025-12-31</TableCell>
                  <TableCell>100</TableCell>
                  <TableCell>5.00</TableCell>
                  <TableCell>10.00</TableCell>
                  <TableCell>Shelf A-1</TableCell>
                  <TableCell>2024-01-01</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

