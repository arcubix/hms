import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft,
  Upload,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  FolderOpen,
  Plus,
  X,
  Clock
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface PatientFilesProps {
  patientId: string;
  patientName: string;
  onBack: () => void;
}

export function PatientFiles({ patientId, patientName, onBack }: PatientFilesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  // Mock files data
  const files = [
    {
      id: 'F001',
      name: 'Blood_Test_Results_Jan2024.pdf',
      type: 'Lab Report',
      category: 'pdf',
      size: '2.4 MB',
      uploadedBy: 'Dr. Michael Chen',
      uploadedDate: '2024-01-15',
      department: 'Laboratory'
    },
    {
      id: 'F002',
      name: 'X-Ray_Chest_Dec2023.jpg',
      type: 'Radiology',
      category: 'image',
      size: '5.1 MB',
      uploadedBy: 'Dr. Sarah Williams',
      uploadedDate: '2023-12-20',
      department: 'Radiology'
    },
    {
      id: 'F003',
      name: 'Prescription_Nov2023.pdf',
      type: 'Prescription',
      category: 'pdf',
      size: '156 KB',
      uploadedBy: 'Dr. Michael Chen',
      uploadedDate: '2023-11-15',
      department: 'Outpatient'
    },
    {
      id: 'F004',
      name: 'ECG_Report_Oct2023.pdf',
      type: 'Cardiology',
      category: 'pdf',
      size: '890 KB',
      uploadedBy: 'Dr. Robert Johnson',
      uploadedDate: '2023-10-10',
      department: 'Cardiology'
    },
    {
      id: 'F005',
      name: 'Insurance_Card.jpg',
      type: 'Insurance',
      category: 'image',
      size: '1.2 MB',
      uploadedBy: 'Admin Staff',
      uploadedDate: '2023-05-12',
      department: 'Administration'
    }
  ];

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-600" />;
      case 'image':
        return <Image className="w-8 h-8 text-blue-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
      default:
        return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lab Report':
        return 'bg-purple-100 text-purple-800';
      case 'Radiology':
        return 'bg-blue-100 text-blue-800';
      case 'Prescription':
        return 'bg-green-100 text-green-800';
      case 'Cardiology':
        return 'bg-red-100 text-red-800';
      case 'Insurance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl text-gray-900">Patient Files</h1>
            <p className="text-sm text-gray-600">{patientName} • ID: {patientId}</p>
          </div>
        </div>
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => setIsUploading(!isUploading)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>

      {/* Upload Form */}
      {isUploading && (
        <Card className="border-0 shadow-sm border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upload New File</span>
              <Button variant="ghost" size="sm" onClick={() => setIsUploading(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>File</Label>
                <div className="mt-2 flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Document Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab">Lab Report</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="rad">Radiology</SelectItem>
                      <SelectItem value="card">Cardiology</SelectItem>
                      <SelectItem value="opd">Outpatient</SelectItem>
                      <SelectItem value="ipd">Inpatient</SelectItem>
                      <SelectItem value="admin">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea placeholder="Add any notes or description about this file..." rows={3} />
              </div>

              <div className="flex gap-2">
                <Button className="bg-green-500 hover:bg-green-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <Button variant="outline" onClick={() => setIsUploading(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Files</p>
                <p className="text-2xl text-gray-900">{files.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Lab Reports</p>
                <p className="text-2xl text-gray-900">1</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Images</p>
                <p className="text-2xl text-gray-900">2</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Size</p>
                <p className="text-2xl text-gray-900">9.7 MB</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <File className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search files by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className={filterType === 'all' ? 'bg-blue-500' : ''}
              >
                All Files
              </Button>
              <Button
                variant={filterType === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('pdf')}
                className={filterType === 'pdf' ? 'bg-red-500' : ''}
              >
                PDFs
              </Button>
              <Button
                variant={filterType === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('image')}
                className={filterType === 'image' ? 'bg-blue-500' : ''}
              >
                Images
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>All Files ({filteredFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.category)}
                      <div>
                        <p className="text-sm text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">ID: {file.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(file.type)}>
                      {file.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{file.size}</TableCell>
                  <TableCell className="text-sm text-gray-600">{file.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <User className="w-3 h-3" />
                      {file.uploadedBy}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {new Date(file.uploadedDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-blue-50 hover:text-blue-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-green-50 hover:text-green-600"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {files.slice(0, 3).map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">File uploaded: {file.name}</p>
                  <p className="text-xs text-gray-600">By {file.uploadedBy} • {file.department}</p>
                </div>
                <span className="text-xs text-gray-500">{new Date(file.uploadedDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
