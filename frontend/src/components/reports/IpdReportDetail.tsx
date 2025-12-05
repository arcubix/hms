/**
 * IPD Report Detail Page
 * Displays detailed view of individual IPD reports with data, filters, and export options
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  ArrowLeft,
  Download,
  Printer,
  Filter,
  Calendar,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Bed,
  DollarSign,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  FileText,
  Eye,
  Share2,
  Mail
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

interface ReportDetailProps {
  reportId: string;
  reportName: string;
  onBack: () => void;
}

const COLORS = ['#2F80ED', '#27AE60', '#F2994A', '#9B51E0', '#EB5757', '#6FCF97', '#56CCF2', '#BB6BD9'];

// Map frontend report IDs to backend API endpoints
const REPORT_API_MAP: Record<string, string> = {
  'daily-admission': 'daily-admissions',
  'discharge-summary': 'daily-discharges',
  'alos-report': 'alos',
  'transfer-report': 'transfers',
  'occupancy-report': 'bed-occupancy',
  'bed-turnover': 'bed-turnover',
  'census-report': 'census',
  'revenue-report': 'revenue',
  'collection-report': 'consultant-revenue',
  'billing-summary': 'billing-summary',
  'insurance-claims': 'advance-received',
  'credit-debtors': 'pending-bills',
  'package-wise': 'bill-comparison',
  'discount-concession': 'panel-billing',
  'mortality-report': 'diagnosis-wise',
  'complication-tracking': 'procedure-wise',
  'infection-rate': 'doctor-patient-load',
  'treatment-outcome': 'procedure-wise',
  'adverse-events': 'procedure-wise',
  'critical-care': 'vital-monitoring',
  'readmission-rate': 'census',
  'realtime-occupancy': 'realtime-occupancy',
  'ward-saturation': 'ward-saturation',
  'room-type-usage': 'room-type-usage',
  'bed-allocation': 'bed-allocation',
  'bed-blocking': 'bed-blocking',
  'medication-consumption': 'medication-consumption',
  'high-cost-drugs': 'medication-consumption',
  'ward-inventory': 'medication-consumption',
  'consumables-implants': 'medication-consumption',
  'lab-utilization': 'lab-utilization',
  'delayed-reports': 'delayed-lab-reports',
  'critical-results': 'critical-lab-results',
  'radiology-usage': 'radiology-usage',
  'panel-admissions': 'panel-admissions',
  'panel-billing': 'panel-billing-summary',
  'claim-status': 'claim-status',
  'pre-auth-comparison': 'pre-auth-comparison',
  'patient-complaints': 'nursing-care',
  'audit-trail': 'nursing-care',
  'nabh-compliance': 'nursing-care',
  'code-blue': 'nursing-care',
  'medication-errors': 'medication-chart',
  'consent-tracking': 'nursing-care',
  'nursing-workload': 'nursing-care',
  'staff-efficiency': 'doctor-patient-load',
  'handover-report': 'nursing-care',
  'discharge-summary-status': 'daily-discharges',
  'documentation-quality': 'nursing-care',
  'tat-monitoring': 'nursing-care',
  'dnr-status': 'nursing-care'
};

export default function IpdReportDetail({ reportId, reportName, onBack }: ReportDetailProps) {
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<any>({});
  const [apiCalled, setApiCalled] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch report data from API
  useEffect(() => {
    const fetchReportData = async () => {
      const apiEndpoint = REPORT_API_MAP[reportId];
      if (!apiEndpoint) {
        // Report not mapped - will use dummy data only for unimplementable reports
        setApiCalled(false);
        setApiError(null);
        return;
      }

      setLoading(true);
      setApiError(null);
      setApiCalled(true);
      try {
        const filters: any = {
          date_from: dateFrom,
          date_to: dateTo
        };
        
        if (selectedWard !== 'all') {
          filters.ward_id = parseInt(selectedWard);
        }
        if (selectedDoctor !== 'all') {
          filters.consultant_id = parseInt(selectedDoctor);
        }

        const response = await api.getIPDReport(apiEndpoint, filters);
        setReportData(response.data || []);
        setReportSummary(response.summary || {});
      } catch (error: any) {
        console.error('Error fetching report data:', error);
        setApiError(error?.message || 'Failed to fetch report data');
        // On error, set empty data - don't fall back to dummy data
        setReportData([]);
        setReportSummary({});
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportId, dateFrom, dateTo, selectedWard, selectedDoctor]);

  // Get report configuration based on reportId
  const getReportConfig = () => {
    // Use API data if endpoint exists and API was called, otherwise check if report can use dummy data
    const hasApiEndpoint = !!REPORT_API_MAP[reportId];
    const useApiData = hasApiEndpoint && apiCalled;
    switch (reportId) {
      // PATIENT FLOW & CENSUS REPORTS
      case 'daily-admission':
        return {
          title: 'Daily Admission Report',
          description: 'Detailed breakdown of daily patient admissions',
          type: 'table-chart',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Total Admissions', 'Emergency', 'Planned', 'Transfers', 'Bed Occupancy %'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'discharge-summary':
        return {
          title: 'Discharge Summary Report',
          description: 'Comprehensive patient discharge analysis',
          type: 'table-chart',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Total Discharges', 'Regular', 'DAMA', 'Referred', 'Deaths', 'Avg LOS (days)'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'alos-report':
        return {
          title: 'Average Length of Stay (ALOS) Report',
          description: 'Department-wise patient stay duration analysis',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Department', 'Total Patients', 'Avg LOS (days)', 'Min LOS', 'Max LOS', 'Benchmark'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'census-report':
        return {
          title: 'Midnight Census Report',
          description: 'Daily midnight patient census tracking',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Midnight Census', 'Admissions', 'Discharges', 'Transfers In', 'Transfers Out'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'transfer-report':
        return {
          title: 'Inter-Ward Transfer Report',
          description: 'Patient movement between wards and departments',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Patient', 'From Ward', 'To Ward', 'Reason', 'Authorized By', 'Time'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'readmission-rate':
        return {
          title: 'Readmission Rate Report',
          description: '30-day readmission tracking and analysis',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Patient ID', 'Name', 'First Admission', 'Discharge Date', 'Readmission Date', 'Days Between', 'Diagnosis'],
          summary: useApiData ? reportSummary : {}
        };

      // CLINICAL OUTCOME REPORTS
      case 'mortality-report':
        return {
          title: 'Mortality & Morbidity Report',
          description: 'Patient outcome and mortality tracking',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Patient', 'Age', 'Department', 'Diagnosis', 'Days Admitted', 'Cause of Death'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'complication-tracking':
        return {
          title: 'Post-Operative Complication Report',
          description: 'Surgical complications and adverse events',
          type: 'table-chart',
          data: useApiData ? reportData : [],
          columns: ['Patient', 'Procedure', 'Surgery Date', 'Complication', 'Severity', 'Days Post-Op', 'Status'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'infection-rate':
        return {
          title: 'Hospital-Acquired Infection Rate',
          description: 'HAI surveillance and infection control',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Patient', 'Ward', 'Infection Type', 'Culture Result', 'Days to Onset', 'Treatment'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'treatment-outcome':
        return {
          title: 'Treatment Outcome Report',
          description: 'Patient recovery and treatment effectiveness',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Department', 'Total Patients', 'Improved', 'Stable', 'Deteriorated', 'Success Rate %'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'adverse-events':
        return {
          title: 'Adverse Events Log',
          description: 'Patient safety incidents and near misses',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Event Type', 'Patient', 'Ward', 'Severity', 'Root Cause', 'Action Taken', 'Status'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'critical-care':
        return {
          title: 'Critical Care Outcomes Report',
          description: 'ICU patient outcomes and interventions',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Patient', 'ICU Days', 'Ventilator Days', 'APACHE Score', 'Outcome', 'Mortality Risk %'],
          summary: useApiData ? reportSummary : {}
        };

      // FINANCIAL & REVENUE REPORTS
      case 'revenue-report':
        return {
          title: 'IPD Revenue Report',
          description: 'Comprehensive revenue analysis by department',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Department', 'Total Revenue', 'Bed Charges', 'Services', 'Pharmacy', 'Lab/Radiology', 'Growth %'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'collection-report':
        return {
          title: 'Payment Collection Report',
          description: 'Daily payment collections and outstanding dues',
          type: 'table-chart',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Cash', 'Card', 'Insurance', 'Credit', 'Total Collected', 'Outstanding'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'billing-summary':
        return {
          title: 'Patient-Wise Billing Summary',
          description: 'Detailed billing breakdown per patient',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Patient ID', 'Name', 'Admission Date', 'LOS', 'Total Bill', 'Paid', 'Outstanding', 'Status'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'insurance-claims':
        return {
          title: 'Insurance Claims Report',
          description: 'TPA and insurance claim status tracking',
          type: 'table-chart',
          data: useApiData ? reportData : [],
          columns: ['Claim ID', 'Patient', 'Insurance Provider', 'Claim Amount', 'Approved Amount', 'Status', 'Days Pending'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'credit-debtors':
        return {
          title: 'Credit & Debtors Report',
          description: 'Outstanding dues and credit analysis',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Patient', 'Bill Date', 'Total Amount', 'Paid', 'Outstanding', 'Days Overdue', 'Contact', 'Status'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'package-wise':
        return {
          title: 'Package-Wise Revenue Report',
          description: 'Revenue from treatment packages',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Package Name', 'Department', 'Count', 'Package Rate', 'Total Revenue', 'Avg Discount %'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'discount-concession':
        return {
          title: 'Discount & Concession Report',
          description: 'Discounts and concessions analysis',
          type: 'table-chart',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Patient', 'Bill Amount', 'Discount Type', 'Discount %', 'Discount Amount', 'Approved By'],
          summary: useApiData ? reportSummary : {}
        };

      // BED & ROOM MANAGEMENT REPORTS
      case 'realtime-occupancy':
      case 'occupancy-report':
        return {
          title: 'Real-Time Bed Occupancy Report',
          description: 'Current bed availability across all wards',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Ward Name', 'Total Beds', 'Occupied', 'Available', 'Under Maintenance', 'Occupancy %'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'ward-saturation':
        return {
          title: 'Ward Saturation Report',
          description: 'Ward capacity utilization percentage',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Ward', 'Capacity', 'Current Patients', 'Saturation %', 'Avg Daily Occupancy', 'Peak Time'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'room-type-usage':
        return {
          title: 'Room Type Usage Report',
          description: 'Analysis by room categories',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Room Type', 'Total Rooms', 'Occupied', 'Available', 'Avg LOS', 'Revenue', 'Occupancy %'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'bed-allocation':
        return {
          title: 'Bed Allocation History',
          description: 'Historical bed assignment tracking',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Patient', 'Ward', 'Bed No', 'Allocated By', 'Duration', 'Status', 'Notes'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'bed-blocking':
        return {
          title: 'Bed Blocking Report',
          description: 'Delayed discharges and bed blocking incidents',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Patient', 'Ward', 'Bed', 'Expected Discharge', 'Actual Status', 'Days Delayed', 'Reason', 'Impact'],
          summary: useApiData ? reportSummary : {}
        };

      // PHARMACY & CONSUMABLE REPORTS
      case 'medication-consumption':
        return {
          title: 'Medication Consumption Report',
          description: 'Track drug usage by ward and patient',
          type: 'table-chart',
          data: useApiData ? reportData : [],
          columns: ['Medication', 'Generic Name', 'Ward', 'Quantity Used', 'Unit Cost', 'Total Cost', 'Stock Level'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'high-cost-drugs':
        return {
          title: 'High-Cost Drug Usage Report',
          description: 'Monitor expensive medication utilization',
          type: 'table-chart',
          data: useApiData ? reportData : [],
          columns: ['Drug Name', 'Patient Count', 'Total Units', 'Unit Price', 'Total Value', 'Department', 'Indication'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'ward-inventory':
        return {
          title: 'Ward Inventory Usage Report',
          description: 'Ward-specific pharmacy inventory consumption',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Ward', 'Opening Stock', 'Issued', 'Consumed', 'Returned', 'Closing Stock', 'Value'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'consumables-implants':
        return {
          title: 'Consumables & Implants Usage Report',
          description: 'Track surgical consumables and implant usage',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Item Name', 'Category', 'Patient', 'Procedure', 'Quantity', 'Unit Cost', 'Total Cost', 'Date'],
          summary: useApiData ? reportSummary : {}
        };

      // LABORATORY & RADIOLOGY REPORTS
      case 'lab-utilization':
        return {
          title: 'Lab Test Utilization Summary',
          description: 'Frequency and types of lab tests ordered',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Test Name', 'Department', 'Tests Ordered', 'Tests Completed', 'Avg TAT (hrs)', 'Cost', 'Revenue'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'delayed-reports':
        return {
          title: 'Delayed Lab Reports',
          description: 'Track TAT delays in lab result delivery',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Test ID', 'Patient', 'Test Name', 'Ordered Date', 'Expected', 'Actual', 'Delay (hrs)', 'Reason'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'critical-results':
        return {
          title: 'Critical Lab Results Summary',
          description: 'Monitor critical and panic value reports',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Patient', 'Test', 'Result Value', 'Critical Range', 'Notified To', 'Time to Notify', 'Action'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'radiology-usage':
        return {
          title: 'Radiology Usage Report',
          description: 'Imaging services utilization analysis',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Modality', 'Studies Performed', 'Avg TAT', 'Total Cost', 'Department', 'Utilization %'],
          summary: useApiData ? reportSummary : {}
        };

      // OT REPORTS (Not implemented - no OT tables)
      case 'ot-utilization':
      case 'surgery-roster':
      case 'anesthesia-report':
      case 'surgical-outcome':
      case 'surgery-type-frequency':
        return {
          title: reportName || 'OT Report',
          description: 'This report requires OT/surgery tables which are not available',
          type: 'table',
          data: [],
          columns: [],
          summary: {}
        };

      // NURSING & STAFF REPORTS
      case 'nursing-workload':
        return {
          title: 'Nursing Workload Report',
          description: 'Nurse-to-patient ratios and workload',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Ward', 'Total Patients', 'Nurses on Duty', 'Nurse-Patient Ratio', 'Shift', 'Workload Score'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'staff-efficiency':
        return {
          title: 'Staff Efficiency Report',
          description: 'Doctor and nurse performance metrics',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Staff Name', 'Role', 'Patients Handled', 'Avg Response Time', 'Tasks Completed', 'Efficiency Score'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'handover-report':
        return {
          title: 'Shift Handover Report',
          description: 'Patient handover documentation',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Shift', 'Ward', 'From Staff', 'To Staff', 'Patients', 'Critical Notes', 'Pending Tasks'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'patient-complaints':
        return {
          title: 'Patient Complaints Report',
          description: 'Feedback and grievance tracking',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Patient', 'Ward', 'Complaint Type', 'Severity', 'Assigned To', 'Status', 'Resolution Time'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'code-blue':
        return {
          title: 'Code Blue / Emergency Response Report',
          description: 'Medical emergency alerts and response',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Time', 'Ward', 'Patient', 'Type', 'Response Time', 'Team Members', 'Outcome'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'medication-errors':
        return {
          title: 'Medication Error Report',
          description: 'Track medication administration errors',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Date', 'Patient', 'Medication', 'Error Type', 'Administered By', 'Severity', 'Action Taken', 'Status'],
          summary: useApiData ? reportSummary : {}
        };

      // QUALITY & COMPLIANCE REPORTS
      case 'nabh-compliance':
        return {
          title: 'NABH Compliance Report',
          description: 'Accreditation standards adherence',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Standard', 'Total Criteria', 'Met', 'Partially Met', 'Not Met', 'Compliance %', 'Action Plan'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'audit-trail':
        return {
          title: 'Clinical Audit Trail',
          description: 'System access and activity log',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Date/Time', 'User', 'Role', 'Action', 'Module', 'Patient ID', 'IP Address', 'Status'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'consent-tracking':
        return {
          title: 'Consent Form Tracking',
          description: 'Patient consent documentation',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Patient', 'Consent Type', 'Procedure', 'Obtained Date', 'Obtained By', 'Witness', 'Status', 'Expiry'],
          summary: useApiData ? reportSummary : {}
        };

      // PANEL / INSURANCE REPORTS
      case 'panel-admissions':
        return {
          title: 'Panel Wise Admissions Report',
          description: 'Track admissions by insurance provider',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Panel Name', 'Total Admissions', 'Emergency', 'Planned', 'Avg LOS', 'Active Patients'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'panel-billing':
        return {
          title: 'Panel Wise Billing Summary',
          description: 'Billing breakdown by insurance panels',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Panel Name', 'Total Billing', 'Approved Amount', 'Pending Amount', 'Rejected Amount', 'Collection %'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'claim-status':
        return {
          title: 'Insurance Claim Status Report',
          description: 'Track insurance claim approvals and rejections',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Claim ID', 'Patient', 'Panel', 'Claim Amount', 'Approved Amount', 'Status', 'Submission Date', 'TAT'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'pre-auth-comparison':
        return {
          title: 'Pre-Authorization vs Final Bill',
          description: 'Compare approved amounts vs actual billing',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Patient', 'Panel', 'Pre-Auth Amount', 'Final Bill', 'Variance', 'Variance %', 'Status', 'Reason'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'discharge-summary-status':
        return {
          title: 'Discharge Summary Status',
          description: 'Completion status of discharge summaries',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Patient', 'Discharge Date', 'Summary Status', 'Prepared By', 'Days Pending', 'Approved By', 'Delivered'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'documentation-quality':
        return {
          title: 'Documentation Quality Report',
          description: 'Medical records completeness audit',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Patient', 'Admission Date', 'Required Docs', 'Completed', 'Incomplete', 'Quality Score %', 'Audited By'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'tat-monitoring':
        return {
          title: 'Turnaround Time (TAT) Monitoring',
          description: 'Service delivery time tracking',
          type: 'chart-table',
          data: useApiData ? reportData : [],
          columns: ['Service Type', 'Total Requests', 'Within TAT', 'Delayed', 'Avg TAT', 'Target TAT', 'Compliance %'],
          summary: useApiData ? reportSummary : {}
        };
      
      case 'dnr-status':
        return {
          title: 'DNR (Do Not Resuscitate) Status Report',
          description: 'Patient resuscitation directives',
          type: 'table',
          data: useApiData ? reportData : [],
          columns: ['Patient', 'Age', 'Ward', 'DNR Status', 'Order Date', 'Ordered By', 'Family Consent', 'Review Date'],
          summary: useApiData ? reportSummary : {}
        };

      default:
        return {
          title: reportName,
          description: 'Report details',
          type: 'table',
          data: [],
          columns: [],
          summary: {}
        };
    }
  };

  const reportConfig = getReportConfig();

  const handleExport = (format: string) => {
    console.log(`Exporting report as ${format}`);
    // Implementation for export functionality
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSummaryCards = () => {
    const summary = reportConfig.summary;
    const cards = [];

    Object.entries(summary).forEach(([key, value], index) => {
      cards.push(
        <Card key={key} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {typeof value === 'number' && key.toLowerCase().includes('revenue') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('value') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('paid') || key.toLowerCase().includes('collected')
                    ? `₹${value.toLocaleString()}`
                    : typeof value === 'number' && (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percent') || key.toLowerCase().includes('compliance') || key.toLowerCase().includes('efficiency'))
                    ? `${value}%`
                    : value}
                </p>
              </div>
              {index % 4 === 0 && <TrendingUp className="w-8 h-8 text-green-500" />}
              {index % 4 === 1 && <Users className="w-8 h-8 text-blue-500" />}
              {index % 4 === 2 && <Activity className="w-8 h-8 text-purple-500" />}
              {index % 4 === 3 && <DollarSign className="w-8 h-8 text-orange-500" />}
            </div>
          </CardContent>
        </Card>
      );
    });

    return cards;
  };

  const renderChart = () => {
    if (!reportConfig.data || reportConfig.data.length === 0) {
      // Don't show chart if no data - empty state is handled in renderTable
      return (
        <div className="text-center py-8 text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No data available to display chart</p>
        </div>
      );
    }

    const chartData = reportConfig.data.slice(0, 10);

    if (reportId.includes('revenue') || reportId.includes('collection') || reportId.includes('billing')) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={reportConfig.columns[0].toLowerCase().replace(/ /g, '')} stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
            <Legend />
            <Bar dataKey="value" fill="#2F80ED" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (reportId.includes('occupancy') || reportId.includes('saturation') || reportId.includes('utilization')) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
            <Legend />
            <Bar dataKey="occupied" fill="#2F80ED" name="Occupied" />
            <Bar dataKey="available" fill="#27AE60" name="Available" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (reportId.includes('trend') || reportId.includes('daily') || reportId.includes('census')) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#2F80ED" fill="#2F80ED" fillOpacity={0.3} name="Count" />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#2F80ED" strokeWidth={2} name="Value" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderTable = () => {
    if (!reportConfig.data || reportConfig.data.length === 0) {
      const hasApiEndpoint = !!REPORT_API_MAP[reportId];
      let message = 'No data available for this report';
      let subMessage = '';
      
      if (apiError) {
        message = 'Error loading report data';
        subMessage = apiError;
      } else if (hasApiEndpoint && apiCalled) {
        message = 'No data available for the selected date range';
        subMessage = 'Try adjusting the date filters or check back later';
      } else if (!hasApiEndpoint) {
        message = 'This report is not yet implemented';
        subMessage = 'This report requires additional database tables or features';
      }
      
      return (
        <div className="text-center py-12 text-gray-500">
          {apiError ? (
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          ) : (
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          )}
          <p className="text-lg font-medium mb-2">{message}</p>
          {subMessage && <p className="text-sm text-gray-400">{subMessage}</p>}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {reportConfig.columns.map((column, index) => (
                <TableHead key={index} className="bg-gray-50">{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportConfig.data.map((row: any, rowIndex: number) => (
              <TableRow key={rowIndex} className="hover:bg-gray-50">
                {reportConfig.columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {renderCellContent(row, column, colIndex)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const getDataKeyForColumn = (column: string, row: any): string | null => {
    // Direct match first
    if (row[column] !== undefined) return column;
    
    // Convert column name to camelCase key format
    let camelCase = column
      .replace(/[()%]/g, '')
      .trim()
      .split(/\s+/)
      .map((word, index) => {
        word = word.toLowerCase();
        return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
    
    // Check if camelCase key exists
    if (row[camelCase] !== undefined) return camelCase;
    
    // Try other common formats
    const variations = [
      column.toLowerCase().replace(/[^a-z0-9]/g, ''),
      column.toLowerCase().replace(/\s+/g, '_'),
      column.replace(/\s+/g, ''),
      column.toLowerCase(),
      camelCase + 'Percent',
      camelCase.replace(/percent$/i, '')
    ];
    
    for (const variant of variations) {
      if (row[variant] !== undefined) return variant;
    }
    
    // Try partial matching
    const keys = Object.keys(row);
    const normalizedColumn = column.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // First try exact normalized match
    const exactMatch = keys.find(k => {
      const normalizedKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedKey === normalizedColumn;
    });
    if (exactMatch) return exactMatch;
    
    // Then try partial match
    const partialMatch = keys.find(k => {
      const normalizedKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      // Check if key contains column or column contains key (both ways)
      return normalizedKey.length > 3 && normalizedColumn.length > 3 && 
             (normalizedKey.includes(normalizedColumn) || normalizedColumn.includes(normalizedKey));
    });
    
    return partialMatch || null;
  };

  const renderCellContent = (row: any, column: string, colIndex: number) => {
    const dataKey = getDataKeyForColumn(column, row);
    let value = dataKey ? row[dataKey] : undefined;

    if (value === undefined || value === null) {
      return '-';
    }

    if (column.toLowerCase().includes('status')) {
      return <Badge className={getStatusColor(value)}>{value}</Badge>;
    }

    if (typeof value === 'number' && (column.toLowerCase().includes('amount') || column.toLowerCase().includes('revenue') || column.toLowerCase().includes('cost') || column.toLowerCase().includes('value') || column.toLowerCase().includes('price') || column.toLowerCase().includes('bill') || column.toLowerCase().includes('paid') || column.toLowerCase().includes('outstanding') || column.toLowerCase().includes('rate'))) {
      return `₹${value.toLocaleString()}`;
    }

    if (column.toLowerCase().includes('%') || column.toLowerCase().includes('percent') || (column.toLowerCase().includes('occupancy') && !column.toLowerCase().includes('rate'))) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return `${numValue}%`;
    }

    if (typeof value === 'number' && (column.toLowerCase().includes('days') || column.toLowerCase().includes('duration') || column.toLowerCase().includes('los'))) {
      return typeof value === 'string' ? value : value.toFixed(1);
    }

    return value;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('completed') || statusLower.includes('approved') || statusLower.includes('active') || statusLower.includes('resolved'))
      return 'bg-green-100 text-green-800';
    if (statusLower.includes('pending') || statusLower.includes('in progress'))
      return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('rejected') || statusLower.includes('critical') || statusLower.includes('overdue'))
      return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-gray-900">{reportConfig.title}</h1>
            <p className="text-gray-600 text-sm mt-1">{reportConfig.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button className="bg-[#2F80ED] hover:bg-blue-600" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ward</Label>
              <Select value={selectedWard} onValueChange={setSelectedWard}>
                <SelectTrigger>
                  <SelectValue placeholder="All Wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  <SelectItem value="icu">ICU</SelectItem>
                  <SelectItem value="general">General Ward</SelectItem>
                  <SelectItem value="private">Private Ward</SelectItem>
                  <SelectItem value="ccu">CCU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                  <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
                  <SelectItem value="dr-williams">Dr. Williams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Indicator */}
      {loading && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-[#2F80ED] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading report data...</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderSummaryCards()}
        </div>
      )}

      {/* Chart */}
      {!loading && (reportConfig.type === 'chart-table' || reportConfig.type === 'table-chart') && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#2F80ED]" />
              Visual Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {renderChart()}
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {!loading && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2F80ED]" />
                Detailed Data
              </div>
              <Badge variant="outline">{reportConfig.data?.length || 0} Records</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderTable()}
          </CardContent>
        </Card>
      )}

      {/* Footer Actions */}
      {!loading && (
        <div className="flex items-center justify-between py-4">
          <p className="text-sm text-gray-600">
            Report generated on {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Data Generation Functions
function generateDailyAdmissionData() {
  const data = [];
  const baseAdmissions = [12, 15, 9, 18, 14, 11, 8, 16, 13, 10, 19, 17, 14, 12, 15, 20, 13, 11, 16, 14, 18, 12, 10, 15, 17, 13, 16];
  for (let i = 0; i < 27; i++) {
    const date = new Date(2024, 10, i + 1);
    const total = baseAdmissions[i];
    const emergency = Math.floor(total * 0.4);
    const planned = Math.floor(total * 0.45);
    const transfers = total - emergency - planned;
    const occupancyValue = (78 + (Math.random() * 15 - 5)).toFixed(1);
    data.push({
      date: date.toISOString().split('T')[0],
      totalAdmissions: total,
      emergency: emergency,
      planned: planned,
      transfers: transfers,
      bedOccupancy: occupancyValue,
      occupancy: occupancyValue,
      value: total
    });
  }
  return data;
}

function generateDischargeSummaryData() {
  const data = [];
  const discharges = [10, 13, 8, 16, 12, 9, 7, 14, 11, 9, 17, 15, 12, 10, 13, 18, 11, 10, 14, 12, 16, 10, 8, 13, 15, 11, 14];
  for (let i = 0; i < 27; i++) {
    const date = new Date(2024, 10, i + 1);
    const total = discharges[i];
    const regular = Math.floor(total * 0.88);
    const dama = i % 5 === 0 ? 1 : 0;
    const referred = i % 7 === 0 ? 1 : 0;
    const deaths = i === 7 || i === 18 ? 1 : 0;
    const remaining = total - regular - dama - referred - deaths;
    const losValue = (4.2 + (Math.random() * 2 - 1)).toFixed(1);
    data.push({
      date: date.toISOString().split('T')[0],
      totalDischarges: total,
      regular: regular + remaining,
      dama: dama,
      referred: referred,
      deaths: deaths,
      avgLOS: losValue,
      avgLOSDays: losValue,
      value: total
    });
  }
  return data;
}

function generateALOSData() {
  const departments = [
    { name: 'Cardiology', patients: 48, avgLOS: 5.2, min: 2, max: 18, benchmark: 5.5 },
    { name: 'Orthopedics', patients: 62, avgLOS: 6.8, min: 3, max: 21, benchmark: 7.0 },
    { name: 'General Surgery', patients: 54, avgLOS: 4.5, min: 2, max: 14, benchmark: 4.8 },
    { name: 'Neurology', patients: 38, avgLOS: 7.2, min: 3, max: 25, benchmark: 7.5 },
    { name: 'Pediatrics', patients: 45, avgLOS: 3.8, min: 1, max: 12, benchmark: 4.0 },
    { name: 'ICU', patients: 32, avgLOS: 8.5, min: 2, max: 35, benchmark: 9.0 },
    { name: 'Oncology', patients: 28, avgLOS: 9.3, min: 4, max: 28, benchmark: 9.5 },
    { name: 'Gastroenterology', patients: 41, avgLOS: 4.2, min: 2, max: 15, benchmark: 4.5 },
    { name: 'Pulmonology', patients: 35, avgLOS: 6.5, min: 3, max: 22, benchmark: 6.8 },
    { name: 'Nephrology', patients: 29, avgLOS: 5.8, min: 2, max: 18, benchmark: 6.0 }
  ];
  
  return departments.map(dept => {
    const avgLOSValue = dept.avgLOS.toFixed(1);
    return {
      name: dept.name,
      department: dept.name,
      totalPatients: dept.patients,
      avgLOS: avgLOSValue,
      avgLOSDays: avgLOSValue,
      minLOS: dept.min,
      maxLOS: dept.max,
      benchmark: dept.benchmark.toFixed(1),
      value: dept.avgLOS
    };
  });
}

function generateCensusData() {
  const data = [];
  let currentCensus = 82;
  const censusValues = [82, 85, 83, 89, 87, 84, 80, 88, 86, 84, 91, 89, 86, 83, 85, 92, 87, 85, 88, 86, 90, 84, 81, 86, 89, 85, 87];
  
  for (let i = 0; i < 27; i++) {
    const date = new Date(2024, 10, i + 1);
    currentCensus = censusValues[i];
    const admissions = [12, 15, 9, 18, 14, 11, 8, 16, 13, 10, 19, 17, 14, 12, 15, 20, 13, 11, 16, 14, 18, 12, 10, 15, 17, 13, 16][i];
    const discharges = [10, 13, 8, 16, 12, 9, 7, 14, 11, 9, 17, 15, 12, 10, 13, 18, 11, 10, 14, 12, 16, 10, 8, 13, 15, 11, 14][i];
    
    data.push({
      date: date.toISOString().split('T')[0],
      midnightCensus: currentCensus,
      admissions: admissions,
      discharges: discharges,
      transfersIn: Math.floor(Math.random() * 2) + 1,
      transfersOut: Math.floor(Math.random() * 2) + 1,
      value: currentCensus
    });
  }
  return data;
}

function generateTransferData() {
  const patients = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Reddy', 'Vijay Singh',
    'Kavita Mehta', 'Ravi Gupta', 'Anjali Verma', 'Suresh Nair', 'Deepa Iyer'
  ];
  const wards = ['ICU', 'General Ward A', 'General Ward B', 'CCU', 'Private Ward 1', 'Private Ward 2', 'Pediatrics', 'Maternity'];
  const reasons = [
    'Clinical Improvement - Downgrade from ICU',
    'Deteriorating Condition - Upgrade to ICU',
    'Bed Availability',
    'Specialist Care Required',
    'Patient/Family Request',
    'Post-Surgery Recovery',
    'Infection Control - Isolation',
    'Room Type Change'
  ];
  const doctors = ['Dr. Ramesh Kumar', 'Dr. Sarah Johnson', 'Dr. Anil Kapoor', 'Dr. Priya Desai', 'Dr. Vikram Malhotra'];
  
  return Array.from({ length: 45 }, (_, i) => {
    const fromWard = wards[Math.floor(Math.random() * wards.length)];
    let toWard = wards[Math.floor(Math.random() * wards.length)];
    while (toWard === fromWard) {
      toWard = wards[Math.floor(Math.random() * wards.length)];
    }
    
    return {
      date: `2024-11-${String(Math.floor(i * 0.6) + 1).padStart(2, '0')}`,
      patient: patients[Math.floor(Math.random() * patients.length)],
      fromWard: fromWard,
      toWard: toWard,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      authorizedBy: doctors[Math.floor(Math.random() * doctors.length)],
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
    };
  });
}

function generateReadmissionData() {
  const patients = [
    { id: 'IPD2401', name: 'Rajesh Kumar', age: 68 },
    { id: 'IPD2402', name: 'Meena Sharma', age: 72 },
    { id: 'IPD2403', name: 'Suresh Patel', age: 65 },
    { id: 'IPD2404', name: 'Lakshmi Reddy', age: 58 },
    { id: 'IPD2405', name: 'Ramesh Gupta', age: 61 },
    { id: 'IPD2406', name: 'Savita Nair', age: 70 }
  ];
  
  const diagnoses = [
    { primary: 'Congestive Heart Failure', secondary: 'Acute Exacerbation' },
    { primary: 'COPD', secondary: 'Respiratory Infection' },
    { primary: 'Type 2 Diabetes', secondary: 'Uncontrolled Blood Sugar' },
    { primary: 'Pneumonia', secondary: 'Recurrent Infection' },
    { primary: 'Chronic Kidney Disease', secondary: 'Fluid Overload' },
    { primary: 'Sepsis', secondary: 'UTI' }
  ];
  
  return Array.from({ length: 18 }, (_, i) => {
    const patient = patients[i % patients.length];
    const diagnosis = diagnoses[i % diagnoses.length];
    const firstAdmission = new Date(2024, 9, Math.floor(i * 1.5) + 1);
    const losFirst = 4 + Math.floor(Math.random() * 5);
    const discharge = new Date(firstAdmission.getTime() + losFirst * 24 * 60 * 60 * 1000);
    const daysBetween = i < 6 ? 3 + Math.floor(Math.random() * 4) : 8 + Math.floor(Math.random() * 22);
    const readmission = new Date(discharge.getTime() + daysBetween * 24 * 60 * 60 * 1000);
    
    return {
      patientId: patient.id,
      name: patient.name,
      firstAdmission: firstAdmission.toISOString().split('T')[0],
      dischargeDate: discharge.toISOString().split('T')[0],
      readmissionDate: readmission.toISOString().split('T')[0],
      daysBetween,
      diagnosis: `${diagnosis.primary} - ${diagnosis.secondary}`
    };
  });
}

function generateMortalityData() {
  const cases = [
    { name: 'Ramakant Shukla', age: 78, dept: 'ICU', diagnosis: 'Acute Myocardial Infarction with Cardiogenic Shock', days: 3, cause: 'Cardiac Arrest', date: '2024-11-05' },
    { name: 'Sulochana Devi', age: 82, dept: 'CCU', diagnosis: 'Congestive Heart Failure - NYHA Class IV', days: 8, cause: 'Respiratory Failure', date: '2024-11-12' },
    { name: 'Govind Rao', age: 71, dept: 'Neurology', diagnosis: 'Massive Intracerebral Hemorrhage', days: 2, cause: 'Brain Herniation', date: '2024-11-18' },
    { name: 'Kamala Bai', age: 68, dept: 'Oncology', diagnosis: 'Metastatic Lung Cancer Stage IV', days: 12, cause: 'Respiratory Failure', date: '2024-11-21' },
    { name: 'Vishwanath Reddy', age: 75, dept: 'General Medicine', diagnosis: 'Septic Shock with Multi-organ Dysfunction', days: 5, cause: 'Septic Shock', date: '2024-11-25' }
  ];
  
  return cases.map(c => ({
    date: c.date,
    patient: c.name,
    age: c.age,
    department: c.dept,
    diagnosis: c.diagnosis,
    daysAdmitted: c.days,
    causeOfDeath: c.cause
  }));
}

function generateComplicationData() {
  const complications = [
    { patient: 'Mahesh Kumar', procedure: 'Total Hip Replacement', date: '2024-11-03', complication: 'Surgical Site Infection (SSI)', severity: 'Moderate', days: 5, status: 'Under Treatment' },
    { patient: 'Geeta Sharma', procedure: 'CABG (Coronary Artery Bypass Graft)', date: '2024-11-05', complication: 'Atrial Fibrillation', severity: 'Moderate', days: 3, status: 'Resolved' },
    { patient: 'Ramesh Patel', procedure: 'Laparoscopic Cholecystectomy', date: '2024-11-08', complication: 'Bile Leak', severity: 'Major', days: 2, status: 'Under Treatment' },
    { patient: 'Savitri Devi', procedure: 'Total Knee Replacement', date: '2024-11-10', complication: 'Deep Vein Thrombosis (DVT)', severity: 'Major', days: 7, status: 'Monitoring' },
    { patient: 'Arun Reddy', procedure: 'Appendectomy', date: '2024-11-12', complication: 'Wound Dehiscence', severity: 'Moderate', days: 4, status: 'Resolved' },
    { patient: 'Lakshmi Iyer', procedure: 'Hysterectomy', date: '2024-11-14', complication: 'Post-operative Bleeding', severity: 'Major', days: 1, status: 'Resolved' },
    { patient: 'Sunil Gupta', procedure: 'Spinal Fusion L4-L5', date: '2024-11-15', complication: 'Urinary Retention', severity: 'Minor', days: 2, status: 'Resolved' },
    { patient: 'Meena Nair', procedure: 'Laparoscopic Hernia Repair', date: '2024-11-17', complication: 'Seroma Formation', severity: 'Minor', days: 5, status: 'Monitoring' },
    { patient: 'Rajiv Malhotra', procedure: 'Carotid Endarterectomy', date: '2024-11-19', complication: 'Hypotension', severity: 'Minor', days: 1, status: 'Resolved' },
    { patient: 'Anita Kapoor', procedure: 'Mastectomy', date: '2024-11-20', complication: 'Lymphedema', severity: 'Moderate', days: 6, status: 'Monitoring' },
    { patient: 'Dinesh Kumar', procedure: 'Prostatectomy', date: '2024-11-22', complication: 'Urinary Incontinence', severity: 'Moderate', days: 4, status: 'Under Treatment' },
    { patient: 'Preeti Verma', procedure: 'Caesarean Section', date: '2024-11-24', complication: 'Post-partum Hemorrhage', severity: 'Major', days: 1, status: 'Resolved' }
  ];
  
  return complications;
}

function generateInfectionData() {
  const infections = [
    { date: '2024-11-03', patient: 'Suresh Kumar (IPD2401)', ward: 'ICU', type: 'CAUTI (Catheter-Associated UTI)', culture: 'E. coli (ESBL positive)', days: 5, treatment: 'Meropenem IV + Catheter changed' },
    { date: '2024-11-07', patient: 'Rajani Devi (IPD2408)', ward: 'General Ward A', type: 'SSI (Surgical Site Infection)', culture: 'Staphylococcus aureus (MRSA)', days: 7, treatment: 'Vancomycin IV + Wound debridement' },
    { date: '2024-11-10', patient: 'Mohan Reddy (IPD2415)', ward: 'ICU', type: 'CLABSI (Central Line-Associated BSI)', culture: 'Klebsiella pneumoniae', days: 4, treatment: 'Line removal + Colistin IV' },
    { date: '2024-11-12', patient: 'Kamala Bai (IPD2422)', ward: 'General Ward B', type: 'UTI (Urinary Tract Infection)', culture: 'Pseudomonas aeruginosa', days: 6, treatment: 'Piperacillin-Tazobactam IV' },
    { date: '2024-11-15', patient: 'Ravi Shankar (IPD2431)', ward: 'ICU', type: 'VAP (Ventilator-Associated Pneumonia)', culture: 'Acinetobacter baumannii', days: 8, treatment: 'Colistin + Tigecycline IV' },
    { date: '2024-11-18', patient: 'Lata Mehta (IPD2438)', ward: 'Private Ward 1', type: 'SSI (Post C-section)', culture: 'E. coli', days: 4, treatment: 'Ceftriaxone IV + Wound care' },
    { date: '2024-11-22', patient: 'Vijay Singh (IPD2445)', ward: 'CCU', type: 'CAUTI', culture: 'Enterococcus faecalis', days: 5, treatment: 'Linezolid IV + Catheter removal' },
    { date: '2024-11-25', patient: 'Saroj Rani (IPD2452)', ward: 'General Ward A', type: 'Post-operative SSI', culture: 'Staphylococcus epidermidis', days: 6, treatment: 'Cloxacillin IV + Dressing' }
  ];
  
  return infections;
}

function generateTreatmentOutcomeData() {
  const departments = ['Cardiology', 'Orthopedics', 'General Surgery', 'Neurology', 'Pediatrics'];
  
  return departments.map(dept => {
    const total = Math.floor(Math.random() * 50) + 30;
    const improved = Math.floor(total * 0.86);
    const stable = Math.floor(total * 0.10);
    const deteriorated = total - improved - stable;
    
    return {
      name: dept,
      department: dept,
      totalPatients: total,
      improved,
      stable,
      deteriorated,
      successRate: ((improved / total) * 100).toFixed(1),
      value: improved
    };
  });
}

function generateAdverseEventsData() {
  const events = ['Medication Error', 'Patient Fall', 'Wrong Patient ID', 'Pressure Ulcer', 'Equipment Failure'];
  const wards = ['ICU', 'General Ward', 'CCU', 'Private Ward'];
  
  return Array.from({ length: 14 }, (_, i) => ({
    date: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
    eventType: events[Math.floor(Math.random() * events.length)],
    patient: `P00${i + 1}`,
    ward: wards[Math.floor(Math.random() * wards.length)],
    severity: ['Minor', 'Major', 'Critical'][Math.floor(Math.random() * 3)],
    rootCause: 'Under Investigation',
    actionTaken: 'Corrective measures implemented',
    status: ['Open', 'Closed', 'In Review'][Math.floor(Math.random() * 3)]
  }));
}

function generateCriticalCareData() {
  const patients = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Mary Williams'];
  
  return Array.from({ length: 18 }, (_, i) => ({
    patient: patients[Math.floor(Math.random() * patients.length)] + ` #${i + 1}`,
    icuDays: Math.floor(Math.random() * 10) + 2,
    ventilatorDays: Math.floor(Math.random() * 5),
    apacheScore: Math.floor(Math.random() * 20) + 10,
    outcome: ['Discharged', 'Transferred', 'Deceased'][Math.floor(Math.random() * 3)],
    mortalityRisk: (Math.random() * 40 + 10).toFixed(1)
  }));
}

function generateRevenueData() {
  const departments = [
    { name: 'Cardiology', bed: 485000, services: 620000, pharmacy: 285000, lab: 195000, growth: 14.2 },
    { name: 'Orthopedics', bed: 625000, services: 890000, pharmacy: 245000, lab: 165000, growth: 18.5 },
    { name: 'General Surgery', bed: 425000, services: 565000, pharmacy: 215000, lab: 145000, growth: 11.3 },
    { name: 'Neurology', bed: 385000, services: 485000, pharmacy: 195000, lab: 235000, growth: 9.7 },
    { name: 'Pediatrics', bed: 325000, services: 285000, pharmacy: 145000, lab: 95000, growth: 7.8 },
    { name: 'ICU', bed: 785000, services: 425000, pharmacy: 465000, lab: 285000, growth: 15.6 },
    { name: 'Oncology', bed: 565000, services: 685000, pharmacy: 825000, lab: 385000, growth: 22.4 },
    { name: 'Gastroenterology', bed: 345000, services: 425000, pharmacy: 185000, lab: 165000, growth: 10.2 }
  ];
  
  return departments.map(dept => {
    const total = dept.bed + dept.services + dept.pharmacy + dept.lab;
    return {
      name: dept.name,
      department: dept.name,
      totalRevenue: total,
      bedCharges: dept.bed,
      services: dept.services,
      pharmacy: dept.pharmacy,
      labRadiology: dept.lab,
      growth: dept.growth.toFixed(1),
      value: total
    };
  });
}

function generateCollectionData() {
  const data = [];
  const patterns = {
    cash: [45000, 52000, 38000, 61000, 48000, 42000, 35000, 58000, 51000, 44000, 67000, 59000, 49000, 43000, 55000, 72000, 48000, 41000, 57000, 50000, 65000, 46000, 39000, 54000, 62000, 47000, 56000],
    card: [68000, 75000, 62000, 82000, 71000, 65000, 58000, 78000, 73000, 67000, 88000, 81000, 72000, 66000, 77000, 95000, 70000, 64000, 79000, 74000, 86000, 69000, 61000, 76000, 84000, 71000, 80000],
    insurance: [52000, 58000, 48000, 64000, 55000, 50000, 45000, 61000, 56000, 51000, 68000, 63000, 57000, 52000, 60000, 75000, 54000, 49000, 62000, 58000, 67000, 53000, 47000, 59000, 65000, 55000, 63000],
    credit: [15000, 18000, 12000, 22000, 17000, 14000, 10000, 20000, 16000, 13000, 24000, 21000, 18000, 15000, 19000, 28000, 16000, 12000, 21000, 17000, 25000, 15000, 11000, 19000, 23000, 16000, 22000]
  };
  
  for (let i = 0; i < 27; i++) {
    const date = new Date(2024, 10, i + 1);
    const cash = patterns.cash[i];
    const card = patterns.card[i];
    const insurance = patterns.insurance[i];
    const credit = patterns.credit[i];
    
    data.push({
      date: date.toISOString().split('T')[0],
      cash,
      card,
      insurance,
      credit,
      totalCollected: cash + card + insurance + credit,
      outstanding: Math.floor(25000 + (Math.random() * 20000 - 10000)),
      value: cash + card + insurance + credit
    });
  }
  return data;
}

function generateBillingSummaryData() {
  const patients = [
    { id: 'IPD2401', name: 'Ramesh Kumar', admission: '2024-11-02', los: 5, bill: 48500, paid: 48500 },
    { id: 'IPD2402', name: 'Geeta Sharma', admission: '2024-11-03', los: 8, bill: 125000, paid: 125000 },
    { id: 'IPD2403', name: 'Sunil Patel', admission: '2024-11-04', los: 4, bill: 32000, paid: 32000 },
    { id: 'IPD2404', name: 'Lakshmi Reddy', admission: '2024-11-05', los: 12, bill: 285000, paid: 150000 },
    { id: 'IPD2405', name: 'Vijay Singh', admission: '2024-11-06', los: 6, bill: 68000, paid: 68000 },
    { id: 'IPD2406', name: 'Anita Mehta', admission: '2024-11-07', los: 3, bill: 24500, paid: 24500 },
    { id: 'IPD2407', name: 'Rajiv Gupta', admission: '2024-11-08', los: 7, bill: 95000, paid: 50000 },
    { id: 'IPD2408', name: 'Priya Nair', admission: '2024-11-09', los: 10, bill: 165000, paid: 165000 },
    { id: 'IPD2409', name: 'Arun Kapoor', admission: '2024-11-10', los: 5, bill: 54000, paid: 54000 },
    { id: 'IPD2410', name: 'Meena Iyer', admission: '2024-11-11', los: 9, bill: 142000, paid: 142000 },
    { id: 'IPD2411', name: 'Dinesh Verma', admission: '2024-11-12', los: 4, bill: 38500, paid: 20000 },
    { id: 'IPD2412', name: 'Savita Desai', admission: '2024-11-13', los: 6, bill: 72000, paid: 72000 },
    { id: 'IPD2413', name: 'Mahesh Rao', admission: '2024-11-14', los: 11, bill: 198000, paid: 198000 },
    { id: 'IPD2414', name: 'Kavita Joshi', admission: '2024-11-15', los: 3, bill: 28000, paid: 28000 },
    { id: 'IPD2415', name: 'Suresh Malhotra', admission: '2024-11-16', los: 8, bill: 115000, paid: 85000 },
    { id: 'IPD2416', name: 'Rani Kumari', admission: '2024-11-17', los: 5, bill: 62000, paid: 62000 },
    { id: 'IPD2417', name: 'Prakash Sinha', admission: '2024-11-18', los: 7, bill: 89000, paid: 89000 },
    { id: 'IPD2418', name: 'Sunita Bose', admission: '2024-11-19', los: 4, bill: 45000, paid: 45000 },
    { id: 'IPD2419', name: 'Ravi Mishra', admission: '2024-11-20', los: 13, bill: 245000, paid: 100000 },
    { id: 'IPD2420', name: 'Deepa Saxena', admission: '2024-11-21', los: 6, bill: 78000, paid: 78000 }
  ];
  
  return patients.map(p => ({
    patientId: p.id,
    name: p.name,
    admissionDate: p.admission,
    los: p.los,
    totalBill: p.bill,
    paid: p.paid,
    outstanding: p.bill - p.paid,
    status: p.paid >= p.bill ? 'Paid' : 'Pending'
  }));
}

function generateInsuranceClaimsData() {
  const claims = [
    { id: 'CLM24001', patient: 'Ramesh Kumar', provider: 'Star Health Insurance', claim: 125000, approved: 118000, status: 'Approved', days: 0 },
    { id: 'CLM24002', patient: 'Geeta Sharma', provider: 'ICICI Lombard', claim: 285000, approved: 250000, status: 'Approved', days: 0 },
    { id: 'CLM24003', patient: 'Sunil Patel', provider: 'HDFC ERGO', claim: 68000, approved: 0, status: 'Pending', days: 12 },
    { id: 'CLM24004', patient: 'Lakshmi Reddy', provider: 'Max Bupa', claim: 195000, approved: 185000, status: 'Approved', days: 0 },
    { id: 'CLM24005', patient: 'Vijay Singh', provider: 'Religare Health', claim: 142000, approved: 0, status: 'Pending', days: 8 },
    { id: 'CLM24006', patient: 'Anita Mehta', provider: 'Star Health Insurance', claim: 54000, approved: 48000, status: 'Approved', days: 0 },
    { id: 'CLM24007', patient: 'Rajiv Gupta', provider: 'New India Assurance', claim: 325000, approved: 0, status: 'Rejected', days: 0 },
    { id: 'CLM24008', patient: 'Priya Nair', provider: 'Care Health Insurance', claim: 178000, approved: 165000, status: 'Approved', days: 0 },
    { id: 'CLM24009', patient: 'Arun Kapoor', provider: 'ICICI Lombard', claim: 95000, approved: 92000, status: 'Approved', days: 0 },
    { id: 'CLM24010', patient: 'Meena Iyer', provider: 'HDFC ERGO', claim: 245000, approved: 0, status: 'Pending', days: 18 },
    { id: 'CLM24011', patient: 'Dinesh Verma', provider: 'Star Health Insurance', claim: 82000, approved: 75000, status: 'Approved', days: 0 },
    { id: 'CLM24012', patient: 'Savita Desai', provider: 'Max Bupa', claim: 128000, approved: 0, status: 'Pending', days: 5 },
    { id: 'CLM24013', patient: 'Mahesh Rao', provider: 'Bajaj Allianz', claim: 365000, approved: 340000, status: 'Approved', days: 0 },
    { id: 'CLM24014', patient: 'Kavita Joshi', provider: 'ICICI Lombard', claim: 48000, approved: 0, status: 'Rejected', days: 0 },
    { id: 'CLM24015', patient: 'Suresh Malhotra', provider: 'Care Health Insurance', claim: 215000, approved: 0, status: 'Pending', days: 22 },
    { id: 'CLM24016', patient: 'Rani Kumari', provider: 'HDFC ERGO', claim: 98000, approved: 95000, status: 'Approved', days: 0 },
    { id: 'CLM24017', patient: 'Prakash Sinha', provider: 'Star Health Insurance', claim: 152000, approved: 148000, status: 'Approved', days: 0 },
    { id: 'CLM24018', patient: 'Sunita Bose', provider: 'Religare Health', claim: 68000, approved: 0, status: 'Rejected', days: 0 },
    { id: 'CLM24019', patient: 'Ravi Mishra', provider: 'New India Assurance', claim: 425000, approved: 0, status: 'Pending', days: 15 },
    { id: 'CLM24020', patient: 'Deepa Saxena', provider: 'Max Bupa', claim: 118000, approved: 112000, status: 'Approved', days: 0 }
  ];
  
  return claims;
}

function generateCreditDebtorsData() {
  return Array.from({ length: 20 }, (_, i) => {
    const totalAmount = Math.floor(Math.random() * 30000) + 5000;
    const paid = Math.floor(totalAmount * Math.random() * 0.5);
    
    return {
      patient: ['John Doe', 'Jane Smith', 'Robert Johnson'][Math.floor(Math.random() * 3)],
      billDate: `2024-${String(Math.floor(Math.random() * 3) + 8).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      totalAmount,
      paid,
      outstanding: totalAmount - paid,
      daysOverdue: Math.floor(Math.random() * 90),
      contact: '+91-98765-43210',
      status: ['Follow-up', 'Legal Notice', 'Payment Plan'][Math.floor(Math.random() * 3)]
    };
  });
}

function generatePackageRevenueData() {
  const packages = [
    { name: 'Normal Delivery Package', dept: 'Obstetrics & Gynecology', count: 18, rate: 35000, discount: 5.0 },
    { name: 'C-Section Package', dept: 'Obstetrics & Gynecology', count: 12, rate: 65000, discount: 4.5 },
    { name: 'Cataract Surgery Package (Phaco)', dept: 'Ophthalmology', count: 24, rate: 28000, discount: 8.0 },
    { name: 'Total Knee Replacement Package', dept: 'Orthopedics', count: 8, rate: 325000, discount: 3.2 },
    { name: 'Total Hip Replacement Package', dept: 'Orthopedics', count: 6, rate: 350000, discount: 3.5 },
    { name: 'CABG (Bypass Surgery) Package', dept: 'Cardiothoracic Surgery', count: 5, rate: 485000, discount: 2.8 },
    { name: 'Angioplasty (Single Stent) Package', dept: 'Cardiology', count: 14, rate: 185000, discount: 4.0 },
    { name: 'Laparoscopic Cholecystectomy Package', dept: 'General Surgery', count: 16, rate: 68000, discount: 6.5 },
    { name: 'Appendectomy Package', dept: 'General Surgery', count: 11, rate: 42000, discount: 7.0 },
    { name: 'Master Health Checkup', dept: 'Preventive Medicine', count: 32, rate: 8500, discount: 12.0 }
  ];
  
  return packages.map(pkg => ({
    name: pkg.name,
    packageName: pkg.name,
    department: pkg.dept,
    count: pkg.count,
    packageRate: pkg.rate,
    totalRevenue: pkg.count * pkg.rate,
    avgDiscount: pkg.discount.toFixed(1),
    value: pkg.count * pkg.rate
  }));
}

function generateDiscountData() {
  const discounts = [
    { date: '2024-11-02', patient: 'Ramesh Kumar', bill: 48500, type: 'Senior Citizen Discount', percent: 10.0, approved: 'Dr. Rajesh Sharma' },
    { date: '2024-11-03', patient: 'Hospital Staff - Nurse Geeta', bill: 32000, type: 'Staff Discount (50%)', percent: 50.0, approved: 'Admin - HR Head' },
    { date: '2024-11-05', patient: 'Sunil Patel', bill: 125000, type: 'Insurance Co-payment Waiver', percent: 5.0, approved: 'Finance Manager' },
    { date: '2024-11-06', patient: 'Lakshmi Reddy', bill: 285000, type: 'Medical Necessity Discount', percent: 15.0, approved: 'Medical Director' },
    { date: '2024-11-08', patient: 'Vijay Singh', bill: 68000, type: 'Promotional - Health Camp', percent: 20.0, approved: 'Marketing Head' },
    { date: '2024-11-10', patient: 'Anita Mehta', bill: 24500, type: 'Senior Citizen Discount', percent: 10.0, approved: 'Dr. Anil Kapoor' },
    { date: '2024-11-11', patient: 'Rajiv Gupta', bill: 95000, type: 'Emergency Case - Waiver', percent: 12.0, approved: 'Dr. Vikram Singh' },
    { date: '2024-11-13', patient: 'Priya Nair', bill: 165000, type: 'Corporate Tie-up Discount', percent: 8.0, approved: 'Finance Manager' },
    { date: '2024-11-14', patient: 'Hospital Staff - Dr. Arun', bill: 54000, type: 'Staff Discount (50%)', percent: 50.0, approved: 'Admin - HR Head' },
    { date: '2024-11-15', patient: 'Meena Iyer', bill: 142000, type: 'Package Discount', percent: 5.0, approved: 'Marketing Head' },
    { date: '2024-11-17', patient: 'Dinesh Verma', bill: 38500, type: 'Financial Hardship Waiver', percent: 25.0, approved: 'Medical Director' },
    { date: '2024-11-18', patient: 'Savita Desai', bill: 72000, type: 'Senior Citizen Discount', percent: 10.0, approved: 'Dr. Meena Desai' },
    { date: '2024-11-19', patient: 'Mahesh Rao', bill: 198000, type: 'Corporate Tie-up Discount', percent: 8.0, approved: 'Finance Manager' },
    { date: '2024-11-21', patient: 'Kavita Joshi', bill: 28000, type: 'Promotional - Festival Offer', percent: 15.0, approved: 'Marketing Head' },
    { date: '2024-11-22', patient: 'Suresh Malhotra', bill: 115000, type: 'Medical Necessity Discount', percent: 18.0, approved: 'Medical Director' },
    { date: '2024-11-23', patient: 'Rani Kumari', bill: 62000, type: 'Senior Citizen Discount', percent: 10.0, approved: 'Dr. Rajesh Sharma' },
    { date: '2024-11-24', patient: 'Prakash Sinha', bill: 89000, type: 'Emergency Case - Waiver', percent: 10.0, approved: 'Dr. Anil Kapoor' },
    { date: '2024-11-25', patient: 'Sunita Bose', bill: 45000, type: 'Package Discount', percent: 5.0, approved: 'Marketing Head' },
    { date: '2024-11-26', patient: 'Ravi Mishra', bill: 245000, type: 'Financial Hardship Waiver', percent: 30.0, approved: 'Medical Director' },
    { date: '2024-11-27', patient: 'Deepa Saxena', bill: 78000, type: 'Corporate Tie-up Discount', percent: 8.0, approved: 'Finance Manager' }
  ];
  
  return discounts.map(d => ({
    date: d.date,
    patient: d.patient,
    billAmount: d.bill,
    discountType: d.type,
    discountPercent: d.percent.toFixed(1),
    discountAmount: Math.floor(d.bill * d.percent / 100),
    approvedBy: d.approved
  }));
}

function generateOccupancyData() {
  const wards = [
    { name: 'General Ward A (Male)', total: 20, occupied: 18, maintenance: 1 },
    { name: 'General Ward B (Female)', total: 20, occupied: 16, maintenance: 0 },
    { name: 'ICU (Intensive Care Unit)', total: 12, occupied: 11, maintenance: 0 },
    { name: 'CCU (Cardiac Care Unit)', total: 8, occupied: 7, maintenance: 0 },
    { name: 'Private Ward 1', total: 15, occupied: 12, maintenance: 1 },
    { name: 'Private Ward 2', total: 10, occupied: 7, maintenance: 0 },
    { name: 'Pediatrics Ward', total: 12, occupied: 8, maintenance: 0 },
    { name: 'Maternity Ward', total: 10, occupied: 9, maintenance: 0 },
    { name: 'Isolation Ward', total: 6, occupied: 2, maintenance: 0 },
    { name: 'Post-Operative Ward', total: 8, occupied: 6, maintenance: 0 }
  ];
  
  return wards.map(ward => ({
    name: ward.name,
    wardName: ward.name,
    totalBeds: ward.total,
    occupied: ward.occupied,
    available: ward.total - ward.occupied - ward.maintenance,
    underMaintenance: ward.maintenance,
    occupancy: ((ward.occupied / ward.total) * 100).toFixed(1)
  }));
}

function generateWardSaturationData() {
  const wards = [
    { name: 'General Ward A (Male)', capacity: 20, current: 18, avg: 87.5, peak: '10:00-14:00' },
    { name: 'General Ward B (Female)', capacity: 20, current: 16, avg: 82.3, peak: '10:00-14:00' },
    { name: 'ICU (Intensive Care Unit)', capacity: 12, current: 11, avg: 92.8, peak: '00:00-24:00' },
    { name: 'CCU (Cardiac Care Unit)', capacity: 8, current: 7, avg: 88.5, peak: '00:00-24:00' },
    { name: 'Private Ward 1', capacity: 15, current: 12, avg: 78.2, peak: '14:00-18:00' },
    { name: 'Private Ward 2', capacity: 10, current: 7, avg: 72.5, peak: '14:00-18:00' },
    { name: 'Pediatrics Ward', capacity: 12, current: 8, avg: 68.8, peak: '16:00-20:00' },
    { name: 'Maternity Ward', capacity: 10, current: 9, avg: 85.2, peak: '08:00-12:00' },
    { name: 'Isolation Ward', capacity: 6, current: 2, avg: 38.5, peak: 'Variable' },
    { name: 'Post-Operative Ward', capacity: 8, current: 6, avg: 74.2, peak: '12:00-18:00' }
  ];
  
  return wards.map(ward => ({
    name: ward.name,
    ward: ward.name,
    capacity: ward.capacity,
    currentPatients: ward.current,
    saturation: ((ward.current / ward.capacity) * 100).toFixed(1),
    avgDailyOccupancy: ward.avg.toFixed(1),
    peakTime: ward.peak,
    occupied: ward.current,
    available: ward.capacity - ward.current
  }));
}

function generateRoomTypeData() {
  const types = [
    { name: 'Private Deluxe Suite', total: 8, occupied: 6, los: 5.8, rate: 8500 },
    { name: 'Private Single AC', total: 18, occupied: 14, los: 5.2, rate: 4500 },
    { name: 'Semi-Private (2 Beds)', total: 12, occupied: 9, los: 4.8, rate: 2800 },
    { name: 'General Ward (4-6 Beds)', total: 40, occupied: 34, los: 4.5, rate: 1200 },
    { name: 'ICU Beds', total: 12, occupied: 11, los: 8.5, rate: 12000 },
    { name: 'CCU Beds', total: 8, occupied: 7, los: 7.2, rate: 10000 },
    { name: 'Isolation Rooms', total: 6, occupied: 2, los: 6.5, rate: 6000 },
    { name: 'Maternity Suite', total: 10, occupied: 9, los: 3.2, rate: 3500 }
  ];
  
  return types.map(type => {
    const revenue = type.occupied * type.rate * type.los;
    return {
      name: type.name,
      roomType: type.name,
      totalRooms: type.total,
      occupied: type.occupied,
      available: type.total - type.occupied,
      avgLOS: type.los.toFixed(1),
      revenue: Math.round(revenue),
      occupancy: ((type.occupied / type.total) * 100).toFixed(1)
    };
  });
}

function generateBedAllocationData() {
  const allocations = [
    { date: '2024-11-22', patient: 'Ramesh Kumar', ward: 'General Ward A', bed: 'GA-12', allocatedBy: 'Nurse Priya Sharma', duration: 5, status: 'Active', notes: 'Post-operative recovery' },
    { date: '2024-11-21', patient: 'Geeta Devi', ward: 'ICU', bed: 'ICU-8', allocatedBy: 'Nurse Anjali Mehta', duration: 3, status: 'Active', notes: 'Critical care monitoring' },
    { date: '2024-11-23', patient: 'Sunil Patel', ward: 'Private Ward 1', bed: 'PW1-5', allocatedBy: 'Nurse Kavita Joshi', duration: 2, status: 'Active', notes: 'Standard private room' },
    { date: '2024-11-20', patient: 'Lakshmi Reddy', ward: 'CCU', bed: 'CCU-4', allocatedBy: 'Nurse Sunita Rao', duration: 7, status: 'Active', notes: 'Cardiac monitoring' },
    { date: '2024-11-24', patient: 'Vijay Singh', ward: 'General Ward B', bed: 'GB-18', allocatedBy: 'Nurse Meena Nair', duration: 1, status: 'Active', notes: 'Admission today' },
    { date: '2024-11-18', patient: 'Anita Mehta', ward: 'Maternity Ward', bed: 'MAT-7', allocatedBy: 'Nurse Deepa Iyer', duration: 9, status: 'Discharged', notes: 'Post-delivery care' },
    { date: '2024-11-19', patient: 'Rajiv Gupta', ward: 'ICU', bed: 'ICU-3', allocatedBy: 'Nurse Anjali Mehta', duration: 8, status: 'Transferred', notes: 'Transferred to General Ward' },
    { date: '2024-11-23', patient: 'Priya Nair', ward: 'Private Ward 2', bed: 'PW2-8', allocatedBy: 'Nurse Kavita Joshi', duration: 2, status: 'Active', notes: 'Deluxe suite' },
    { date: '2024-11-21', patient: 'Arun Kapoor', ward: 'Post-Op Ward', bed: 'PO-4', allocatedBy: 'Nurse Priya Sharma', duration: 4, status: 'Active', notes: 'Post-surgical care' },
    { date: '2024-11-22', patient: 'Meena Iyer', ward: 'General Ward A', bed: 'GA-25', allocatedBy: 'Nurse Sunita Rao', duration: 3, status: 'Active', notes: 'Standard care' },
    { date: '2024-11-17', patient: 'Dinesh Verma', ward: 'General Ward B', bed: 'GB-8', allocatedBy: 'Nurse Meena Nair', duration: 10, status: 'Discharged', notes: 'Recovery complete' },
    { date: '2024-11-23', patient: 'Savita Desai', ward: 'ICU', bed: 'ICU-11', allocatedBy: 'Nurse Anjali Mehta', duration: 2, status: 'Active', notes: 'Post-surgery monitoring' },
    { date: '2024-11-20', patient: 'Mahesh Rao', ward: 'Private Ward 1', bed: 'PW1-12', allocatedBy: 'Nurse Kavita Joshi', duration: 5, status: 'Active', notes: 'VIP patient' },
    { date: '2024-11-24', patient: 'Kavita Joshi', ward: 'Pediatrics', bed: 'PED-6', allocatedBy: 'Nurse Deepa Iyer', duration: 1, status: 'Active', notes: 'Child patient' },
    { date: '2024-11-19', patient: 'Suresh Malhotra', ward: 'CCU', bed: 'CCU-7', allocatedBy: 'Nurse Sunita Rao', duration: 6, status: 'Active', notes: 'Cardiac rehabilitation' },
    { date: '2024-11-16', patient: 'Rani Kumari', ward: 'General Ward A', bed: 'GA-15', allocatedBy: 'Nurse Priya Sharma', duration: 11, status: 'Discharged', notes: 'Treatment completed' },
    { date: '2024-11-22', patient: 'Prakash Sinha', ward: 'Isolation Ward', bed: 'ISO-2', allocatedBy: 'Nurse Anjali Mehta', duration: 3, status: 'Active', notes: 'Infection control' },
    { date: '2024-11-23', patient: 'Sunita Bose', ward: 'General Ward B', bed: 'GB-22', allocatedBy: 'Nurse Meena Nair', duration: 2, status: 'Active', notes: 'Standard admission' },
    { date: '2024-11-21', patient: 'Ravi Mishra', ward: 'ICU', bed: 'ICU-5', allocatedBy: 'Nurse Anjali Mehta', duration: 4, status: 'Active', notes: 'Critical condition' },
    { date: '2024-11-24', patient: 'Deepa Saxena', ward: 'Maternity Ward', bed: 'MAT-4', allocatedBy: 'Nurse Deepa Iyer', duration: 1, status: 'Active', notes: 'Admitted for delivery' }
  ];
  
  return allocations;
}

function generateBedBlockingData() {
  const blocked = [
    { patient: 'Ramakant Shukla (78 yrs)', ward: 'General Ward A', bed: 'GA-8', expected: '2024-11-20', days: 5, reason: 'Awaiting Nursing Home Placement', impact: 'High' },
    { patient: 'Govind Rao (71 yrs)', ward: 'ICU', bed: 'ICU-6', expected: '2024-11-18', days: 7, reason: 'Family Unable to Take Patient Home', impact: 'Critical' },
    { patient: 'Kamala Bai (68 yrs)', ward: 'General Ward B', bed: 'GB-14', expected: '2024-11-21', days: 4, reason: 'Insurance Claim Approval Pending', impact: 'High' },
    { patient: 'Suresh Patel (65 yrs)', ward: 'Private Ward 1', bed: 'PW1-9', expected: '2024-11-22', days: 3, reason: 'Awaiting Home Care Setup', impact: 'Medium' },
    { patient: 'Lakshmi Reddy (58 yrs)', ward: 'General Ward A', bed: 'GA-22', expected: '2024-11-19', days: 6, reason: 'Financial Clearance Pending', impact: 'High' },
    { patient: 'Vishwanath Reddy (75 yrs)', ward: 'CCU', bed: 'CCU-3', expected: '2024-11-23', days: 2, reason: 'Rehabilitation Facility Not Available', impact: 'Medium' },
    { patient: 'Sulochana Devi (82 yrs)', ward: 'General Ward B', bed: 'GB-19', expected: '2024-11-20', days: 5, reason: 'Social Worker Assessment Pending', impact: 'High' },
    { patient: 'Mahesh Kumar (72 yrs)', ward: 'Post-Op Ward', bed: 'PO-7', expected: '2024-11-24', days: 1, reason: 'Awaiting Physiotherapy Clearance', impact: 'Low' }
  ];
  
  return blocked.map(b => ({
    patient: b.patient,
    ward: b.ward,
    bed: b.bed,
    expectedDischarge: b.expected,
    actualStatus: 'Delayed',
    daysDelayed: b.days,
    reason: b.reason,
    impact: b.impact
  }));
}

function generateMedicationData() {
  const medications = [
    { name: 'Paracetamol 500mg Tab', generic: 'Acetaminophen', ward: 'General Ward A', qty: 1850, unit: 2.50, stock: 'Adequate' },
    { name: 'Amoxicillin 500mg Cap', generic: 'Amoxicillin', ward: 'General Ward B', qty: 680, unit: 12.00, stock: 'Adequate' },
    { name: 'Insulin Glargine 100IU/ml', generic: 'Insulin Glargine', ward: 'General Medicine', qty: 145, unit: 385.00, stock: 'Low' },
    { name: 'Atorvastatin 20mg Tab', generic: 'Atorvastatin', ward: 'Cardiology', qty: 520, unit: 8.50, stock: 'Adequate' },
    { name: 'Metformin 850mg Tab', generic: 'Metformin HCl', ward: 'General Ward A', qty: 980, unit: 3.20, stock: 'Adequate' },
    { name: 'Pantoprazole 40mg Inj', generic: 'Pantoprazole', ward: 'ICU', qty: 285, unit: 45.00, stock: 'Adequate' },
    { name: 'Ceftriaxone 1g Inj', generic: 'Ceftriaxone Sodium', ward: 'ICU', qty: 425, unit: 68.00, stock: 'Low' },
    { name: 'Enoxaparin 40mg Inj', generic: 'Enoxaparin Sodium', ward: 'CCU', qty: 195, unit: 185.00, stock: 'Adequate' },
    { name: 'Tramadol 50mg Inj', generic: 'Tramadol HCl', ward: 'Post-Op Ward', qty: 340, unit: 22.00, stock: 'Adequate' },
    { name: 'Furosemide 40mg Tab', generic: 'Furosemide', ward: 'CCU', qty: 465, unit: 5.50, stock: 'Adequate' },
    { name: 'Ondansetron 4mg Inj', generic: 'Ondansetron HCl', ward: 'Chemotherapy', qty: 225, unit: 38.00, stock: 'Low' },
    { name: 'Aspirin 75mg Tab', generic: 'Acetylsalicylic Acid', ward: 'Cardiology', qty: 820, unit: 1.80, stock: 'Adequate' }
  ];
  
  return medications.map(med => ({
    name: med.name,
    medication: med.name,
    genericName: med.generic,
    ward: med.ward,
    quantityUsed: med.qty,
    unitCost: med.unit,
    totalCost: Math.round(med.qty * med.unit),
    stockLevel: med.stock,
    value: Math.round(med.qty * med.unit)
  }));
}

function generateHighCostDrugsData() {
  const drugs = ['Pembrolizumab', 'Trastuzumab', 'Rituximab', 'Bevacizumab', 'Infliximab'];
  const departments = ['Oncology', 'Oncology', 'Hematology', 'Oncology', 'Gastroenterology'];
  
  return drugs.map((drug, i) => ({
    name: drug,
    drugName: drug,
    patientCount: Math.floor(Math.random() * 10) + 3,
    totalUnits: Math.floor(Math.random() * 50) + 10,
    unitPrice: Math.floor(Math.random() * 50000) + 80000,
    totalValue: Math.floor(Math.random() * 500000) + 200000,
    department: departments[i],
    indication: ['Lung Cancer', 'Breast Cancer', 'Lymphoma', 'Colorectal Cancer', 'Crohn\'s Disease'][i],
    value: Math.floor(Math.random() * 500000) + 200000
  }));
}

function generateWardInventoryData() {
  const wards = ['General Ward A', 'ICU', 'CCU', 'Private Ward', 'Pediatrics'];
  
  return wards.map(ward => ({
    name: ward,
    ward,
    openingStock: Math.floor(Math.random() * 50000) + 30000,
    issued: Math.floor(Math.random() * 10000) + 5000,
    consumed: Math.floor(Math.random() * 8000) + 4000,
    returned: Math.floor(Math.random() * 2000) + 500,
    closingStock: Math.floor(Math.random() * 45000) + 25000,
    value: Math.floor(Math.random() * 45000) + 25000
  }));
}

function generateConsumablesData() {
  const items = ['Surgical Gloves', 'IV Cannula', 'Syringes 5ml', 'Gauze Pads', 'Surgical Masks'];
  const procedures = ['General Surgery', 'IV Therapy', 'Medication Admin', 'Wound Dressing', 'Patient Care'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    itemName: items[Math.floor(Math.random() * items.length)],
    category: ['Consumable', 'Implant'][Math.floor(Math.random() * 2)],
    patient: `P00${Math.floor(Math.random() * 100) + 1}`,
    procedure: procedures[Math.floor(Math.random() * procedures.length)],
    quantity: Math.floor(Math.random() * 10) + 1,
    unitCost: Math.floor(Math.random() * 500) + 50,
    totalCost: Math.floor(Math.random() * 5000) + 500,
    date: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`
  }));
}

function generateLabUtilizationData() {
  const tests = [
    { name: 'Complete Blood Count (CBC)', dept: 'General Medicine', ordered: 485, completed: 478, tat: 2.3, cost: 350 },
    { name: 'Lipid Profile', dept: 'Cardiology', ordered: 285, completed: 282, tat: 4.5, cost: 650 },
    { name: 'Liver Function Test (LFT)', dept: 'Gastroenterology', ordered: 325, completed: 320, tat: 3.8, cost: 550 },
    { name: 'Kidney Function Test (KFT)', dept: 'Nephrology', ordered: 298, completed: 295, tat: 3.2, cost: 500 },
    { name: 'Blood Glucose (Fasting)', dept: 'Endocrinology', ordered: 425, completed: 425, tat: 1.5, cost: 120 },
    { name: 'Thyroid Profile (T3, T4, TSH)', dept: 'Endocrinology', ordered: 185, completed: 182, tat: 6.2, cost: 850 },
    { name: 'HbA1c', dept: 'Endocrinology', ordered: 245, completed: 242, tat: 5.5, cost: 680 },
    { name: 'Serum Electrolytes', dept: 'ICU', ordered: 385, completed: 385, tat: 2.8, cost: 450 },
    { name: 'Coagulation Profile (PT/INR)', dept: 'Hematology', ordered: 265, completed: 263, tat: 3.5, cost: 420 },
    { name: 'Urine Routine & Microscopy', dept: 'General Medicine', ordered: 395, completed: 392, tat: 2.1, cost: 180 },
    { name: 'Blood Culture & Sensitivity', dept: 'ICU', ordered: 125, completed: 118, tat: 48.5, cost: 1200 },
    { name: 'Troponin I (Cardiac Marker)', dept: 'Cardiology', ordered: 145, completed: 145, tat: 1.2, cost: 950 }
  ];
  
  return tests.map(test => {
    const revenue = test.completed * test.cost;
    return {
      name: test.name,
      testName: test.name,
      department: test.dept,
      testsOrdered: test.ordered,
      testsCompleted: test.completed,
      avgTAT: test.tat.toFixed(1),
      cost: test.cost,
      revenue: revenue,
      value: revenue
    };
  });
}

function generateDelayedReportsData() {
  const tests = ['MRI Brain', 'CT Scan Abdomen', 'Culture Report', 'Biopsy Result', 'Genetic Test'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    testId: `TEST${String(i + 1).padStart(5, '0')}`,
    patient: `P00${Math.floor(Math.random() * 100) + 1}`,
    testName: tests[Math.floor(Math.random() * tests.length)],
    orderedDate: `2024-11-${String(Math.floor(Math.random() * 25) + 1).padStart(2, '0')}`,
    expected: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
    actual: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
    delay: Math.floor(Math.random() * 24) + 2,
    reason: ['Equipment Issue', 'Staffing', 'Sample Issue', 'High Volume'][Math.floor(Math.random() * 4)]
  }));
}

function generateCriticalResultsData() {
  const tests = ['Troponin I', 'Potassium', 'INR', 'Glucose', 'Platelet Count'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    date: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
    patient: `P00${Math.floor(Math.random() * 100) + 1}`,
    test: tests[Math.floor(Math.random() * tests.length)],
    resultValue: (Math.random() * 10 + 5).toFixed(2),
    criticalRange: '>10 or <2',
    notifiedTo: 'Dr. ' + ['Smith', 'Johnson', 'Williams'][Math.floor(Math.random() * 3)],
    timeToNotify: Math.floor(Math.random() * 30) + 5,
    action: 'Immediate intervention initiated'
  }));
}

function generateRadiologyData() {
  const modalities = ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography'];
  const departments = ['Orthopedics', 'Neurology', 'Neurosurgery', 'Obstetrics', 'Oncology'];
  
  return modalities.map((modality, i) => ({
    name: modality,
    modality,
    studiesPerformed: Math.floor(Math.random() * 150) + 50,
    avgTAT: (Math.random() * 3 + 1).toFixed(1),
    totalCost: Math.floor(Math.random() * 200000) + 100000,
    department: departments[i],
    utilization: (Math.random() * 30 + 60).toFixed(1),
    value: Math.floor(Math.random() * 150) + 50,
    occupied: Math.floor(Math.random() * 100) + 40,
    available: Math.floor(Math.random() * 60) + 10
  }));
}

function generateOTUtilizationData() {
  const ots = [
    { name: 'OT 1 (General Surgery)', total: 12, surgery: 9.5, procedures: 24, revenue: 685000 },
    { name: 'OT 2 (Orthopedics)', total: 12, surgery: 10.2, procedures: 18, revenue: 945000 },
    { name: 'OT 3 (Cardiothoracic)', total: 10, surgery: 8.5, procedures: 8, revenue: 1285000 },
    { name: 'OT 4 (Neurosurgery)', total: 10, surgery: 7.8, procedures: 6, revenue: 1145000 },
    { name: 'OT 5 (ENT & Ophthalmology)', total: 8, surgery: 6.5, procedures: 28, revenue: 425000 },
    { name: 'OT 6 (Obstetrics & Gynecology)', total: 12, surgery: 8.8, procedures: 22, revenue: 565000 }
  ];
  
  return ots.map(ot => ({
    name: ot.name,
    otNumber: ot.name,
    totalHours: ot.total,
    surgeryHours: ot.surgery,
    idleTime: (ot.total - ot.surgery).toFixed(1),
    procedures: ot.procedures,
    utilization: ((ot.surgery / ot.total) * 100).toFixed(1),
    revenue: ot.revenue,
    value: ot.surgery,
    occupied: ot.surgery,
    available: ot.total - ot.surgery
  }));
}

function generateSurgeryRosterData() {
  const surgeries = [
    { date: '2024-11-25', ot: 'OT 1', time: '08:00', patient: 'Ramesh Kumar (IPD2445)', procedure: 'Laparoscopic Appendectomy', surgeon: 'Dr. Rajesh Sharma', anesthetist: 'Dr. Anita Rao', duration: '1.5 hrs', status: 'Completed' },
    { date: '2024-11-25', ot: 'OT 2', time: '08:30', patient: 'Geeta Devi (IPD2448)', procedure: 'Total Knee Replacement (Right)', surgeon: 'Dr. Vikram Singh', anesthetist: 'Dr. Suresh Kumar', duration: '3.2 hrs', status: 'Completed' },
    { date: '2024-11-25', ot: 'OT 3', time: '09:00', patient: 'Mohan Reddy (IPD2450)', procedure: 'CABG (3 Vessel)', surgeon: 'Dr. Anil Kapoor', anesthetist: 'Dr. Priya Mehta', duration: '5.5 hrs', status: 'Completed' },
    { date: '2024-11-25', ot: 'OT 1', time: '11:00', patient: 'Sunita Sharma (IPD2452)', procedure: 'Laparoscopic Cholecystectomy', surgeon: 'Dr. Rajesh Sharma', anesthetist: 'Dr. Anita Rao', duration: '1.8 hrs', status: 'Completed' },
    { date: '2024-11-25', ot: 'OT 4', time: '10:00', patient: 'Ravi Gupta (IPD2455)', procedure: 'Craniotomy for Tumor Excision', surgeon: 'Dr. Deepak Malhotra', anesthetist: 'Dr. Kavita Joshi', duration: '6.0 hrs', status: 'In Progress' },
    { date: '2024-11-26', ot: 'OT 2', time: '08:00', patient: 'Anjali Patel (IPD2458)', procedure: 'Total Hip Replacement (Left)', surgeon: 'Dr. Vikram Singh', anesthetist: 'Dr. Suresh Kumar', duration: '3.0 hrs', status: 'Scheduled' },
    { date: '2024-11-26', ot: 'OT 5', time: '09:00', patient: 'Preeti Verma (IPD2460)', procedure: 'Tonsillectomy', surgeon: 'Dr. Sanjay Nair', anesthetist: 'Dr. Anita Rao', duration: '1.0 hrs', status: 'Scheduled' },
    { date: '2024-11-26', ot: 'OT 6', time: '10:00', patient: 'Lakshmi Iyer (IPD2462)', procedure: 'Caesarean Section (Emergency)', surgeon: 'Dr. Meena Desai', anesthetist: 'Dr. Priya Mehta', duration: '1.5 hrs', status: 'Scheduled' },
    { date: '2024-11-26', ot: 'OT 1', time: '14:00', patient: 'Dinesh Kumar (IPD2465)', procedure: 'Inguinal Hernia Repair', surgeon: 'Dr. Rajesh Sharma', anesthetist: 'Dr. Anita Rao', duration: '2.0 hrs', status: 'Scheduled' },
    { date: '2024-11-26', ot: 'OT 3', time: '09:00', patient: 'Prakash Sinha (IPD2468)', procedure: 'Valve Replacement (Aortic)', surgeon: 'Dr. Anil Kapoor', anesthetist: 'Dr. Kavita Joshi', duration: '6.5 hrs', status: 'Scheduled' },
    { date: '2024-11-27', ot: 'OT 5', time: '08:00', patient: 'Kavita Mehta (IPD2470)', procedure: 'Cataract Surgery (Phacoemulsification)', surgeon: 'Dr. Sanjay Nair', anesthetist: 'Dr. Suresh Kumar', duration: '0.8 hrs', status: 'Scheduled' },
    { date: '2024-11-27', ot: 'OT 6', time: '08:30', patient: 'Savita Rani (IPD2472)', procedure: 'Hysterectomy (Laparoscopic)', surgeon: 'Dr. Meena Desai', anesthetist: 'Dr. Priya Mehta', duration: '2.5 hrs', status: 'Scheduled' },
    { date: '2024-11-27', ot: 'OT 2', time: '09:00', patient: 'Mahesh Joshi (IPD2475)', procedure: 'ACL Reconstruction', surgeon: 'Dr. Vikram Singh', anesthetist: 'Dr. Anita Rao', duration: '2.8 hrs', status: 'Scheduled' },
    { date: '2024-11-27', ot: 'OT 1', time: '10:00', patient: 'Rajiv Saxena (IPD2478)', procedure: 'Colectomy (Partial)', surgeon: 'Dr. Rajesh Sharma', anesthetist: 'Dr. Suresh Kumar', duration: '4.0 hrs', status: 'Scheduled' },
    { date: '2024-11-27', ot: 'OT 4', time: '08:00', patient: 'Deepa Mishra (IPD2480)', procedure: 'Lumbar Laminectomy', surgeon: 'Dr. Deepak Malhotra', anesthetist: 'Dr. Kavita Joshi', duration: '3.5 hrs', status: 'Scheduled' }
  ];
  
  return surgeries;
}

function generateAnesthesiaData() {
  const procedures = ['Appendectomy', 'Hip Replacement', 'C-Section', 'Cardiac Surgery', 'Neurosurgery'];
  const anesthesiaTypes = ['General', 'Spinal', 'Epidural', 'Local', 'Regional'];
  const anesthetists = ['Dr. Wilson', 'Dr. Moore', 'Dr. Taylor', 'Dr. Anderson'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    patient: `P00${Math.floor(Math.random() * 100) + 1}`,
    procedure: procedures[Math.floor(Math.random() * procedures.length)],
    anesthesiaType: anesthesiaTypes[Math.floor(Math.random() * anesthesiaTypes.length)],
    duration: Math.floor(Math.random() * 4) + 1,
    anesthetist: anesthetists[Math.floor(Math.random() * anesthetists.length)],
    complications: ['None', 'Minor', 'None'][Math.floor(Math.random() * 3)],
    asaScore: Math.floor(Math.random() * 4) + 1
  }));
}

function generateSurgicalOutcomeData() {
  const procedures = ['General Surgery', 'Orthopedic Surgery', 'Cardiac Surgery', 'Neurosurgery', 'GI Surgery'];
  
  return procedures.map(proc => {
    const total = Math.floor(Math.random() * 25) + 15;
    const successful = Math.floor(total * 0.94);
    const complications = Math.floor(total * 0.05);
    
    return {
      name: proc,
      procedureType: proc,
      totalCases: total,
      successful,
      complications,
      mortality: total - successful - complications,
      avgLOS: (Math.random() * 3 + 4).toFixed(1),
      successRate: ((successful / total) * 100).toFixed(1),
      value: successful
    };
  });
}

function generateSurgeryTypeFrequencyData() {
  const surgeryTypes = [
    { type: 'Appendectomy', frequency: 45, duration: 75, successRate: 98.2, complications: 2, cost: 45000 },
    { type: 'Cesarean Section', frequency: 38, duration: 90, successRate: 97.4, complications: 3, cost: 65000 },
    { type: 'Hip Replacement', frequency: 28, duration: 180, successRate: 94.6, complications: 5, cost: 285000 },
    { type: 'Knee Arthroscopy', frequency: 34, duration: 60, successRate: 96.8, complications: 2, cost: 95000 },
    { type: 'Hernia Repair', frequency: 31, duration: 85, successRate: 97.1, complications: 2, cost: 55000 },
    { type: 'Cholecystectomy', frequency: 26, duration: 95, successRate: 96.2, complications: 3, cost: 75000 },
    { type: 'Coronary Bypass', frequency: 18, duration: 240, successRate: 91.7, complications: 8, cost: 425000 },
    { type: 'Hysterectomy', frequency: 22, duration: 120, successRate: 95.5, complications: 4, cost: 110000 },
    { type: 'Cataract Surgery', frequency: 52, duration: 30, successRate: 99.0, complications: 1, cost: 35000 },
    { type: 'Tonsillectomy', frequency: 29, duration: 45, successRate: 98.6, complications: 1, cost: 28000 },
    { type: 'Spinal Fusion', frequency: 15, duration: 210, successRate: 92.0, complications: 6, cost: 380000 },
    { type: 'Mastectomy', frequency: 12, duration: 150, successRate: 93.3, complications: 5, cost: 195000 }
  ];
  
  return surgeryTypes.map(surgery => ({
    name: surgery.type,
    procedureType: surgery.type,
    frequency: surgery.frequency,
    avgDuration: surgery.duration,
    successRate: surgery.successRate,
    complications: surgery.complications,
    avgCost: surgery.cost,
    value: surgery.frequency
  }));
}

function generateNursingWorkloadData() {
  const workload = [
    { ward: 'General Ward A (Male)', patients: 18, nurses: 4, shift: 'Morning (7AM-3PM)', score: 78 },
    { ward: 'General Ward B (Female)', patients: 16, nurses: 4, shift: 'Morning (7AM-3PM)', score: 72 },
    { ward: 'ICU', patients: 11, nurses: 6, shift: 'Morning (7AM-3PM)', score: 85 },
    { ward: 'CCU', patients: 7, nurses: 4, shift: 'Morning (7AM-3PM)', score: 68 },
    { ward: 'Pediatrics', patients: 8, nurses: 3, shift: 'Morning (7AM-3PM)', score: 62 },
    { ward: 'Private Ward 1', patients: 12, nurses: 3, shift: 'Morning (7AM-3PM)', score: 75 },
    { ward: 'Maternity Ward', patients: 9, nurses: 3, shift: 'Morning (7AM-3PM)', score: 70 },
    { ward: 'ICU', patients: 11, nurses: 5, shift: 'Evening (3PM-11PM)', score: 88 },
    { ward: 'General Ward A (Male)', patients: 18, nurses: 3, shift: 'Evening (3PM-11PM)', score: 92 },
    { ward: 'ICU', patients: 11, nurses: 4, shift: 'Night (11PM-7AM)', score: 95 }
  ];
  
  return workload.map(w => ({
    name: w.ward,
    ward: w.ward,
    totalPatients: w.patients,
    nursesOnDuty: w.nurses,
    nursePatientRatio: `1:${(w.patients / w.nurses).toFixed(1)}`,
    shift: w.shift,
    workloadScore: w.score,
    value: w.patients,
    occupied: w.patients,
    available: w.nurses
  }));
}

function generateStaffEfficiencyData() {
  const staff = [
    { name: 'Dr. Sarah Smith', role: 'Doctor' },
    { name: 'Dr. John Johnson', role: 'Doctor' },
    { name: 'Nurse Mary Williams', role: 'Nurse' },
    { name: 'Nurse Robert Brown', role: 'Nurse' }
  ];
  
  return staff.map(person => ({
    staffName: person.name,
    role: person.role,
    patientsHandled: Math.floor(Math.random() * 30) + 20,
    avgResponseTime: (Math.random() * 10 + 5).toFixed(1),
    tasksCompleted: Math.floor(Math.random() * 50) + 80,
    efficiencyScore: (Math.random() * 20 + 75).toFixed(1)
  }));
}

function generateHandoverData() {
  const wards = ['General Ward A', 'ICU', 'CCU', 'Private Ward'];
  const shifts = ['Morning-Evening', 'Evening-Night', 'Night-Morning'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    date: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
    shift: shifts[Math.floor(Math.random() * shifts.length)],
    ward: wards[Math.floor(Math.random() * wards.length)],
    fromStaff: `Nurse ${['Alice', 'Bob', 'Carol'][Math.floor(Math.random() * 3)]}`,
    toStaff: `Nurse ${['Dave', 'Eve', 'Frank'][Math.floor(Math.random() * 3)]}`,
    patients: Math.floor(Math.random() * 15) + 5,
    criticalNotes: Math.floor(Math.random() * 3),
    pendingTasks: Math.floor(Math.random() * 5)
  }));
}

function generateComplaintsData() {
  const types = ['Service Quality', 'Staff Behavior', 'Billing Issue', 'Facility Issue', 'Medical Care'];
  const wards = ['General Ward', 'ICU', 'Private Ward', 'OPD'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    date: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
    patient: `P00${Math.floor(Math.random() * 100) + 1}`,
    ward: wards[Math.floor(Math.random() * wards.length)],
    complaintType: types[Math.floor(Math.random() * types.length)],
    severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    assignedTo: ['Manager', 'Nurse Head', 'Doctor'][Math.floor(Math.random() * 3)],
    status: ['Resolved', 'Pending', 'In Progress'][Math.floor(Math.random() * 3)],
    resolutionTime: Math.floor(Math.random() * 72) + 12
  }));
}

function generateCodeBlueData() {
  const codes = [
    { date: '2024-11-05', time: '02:35', ward: 'General Ward A', patient: 'Ramakant Shukla (IPD2385)', type: 'Cardiac Arrest - VF', response: '1.8 mins', team: 6, outcome: 'ROSC achieved, Transferred to ICU' },
    { date: '2024-11-08', time: '14:20', ward: 'CCU', patient: 'Sulochana Devi (IPD2398)', type: 'Respiratory Arrest', response: '1.2 mins', team: 5, outcome: 'Intubated, Mechanically Ventilated' },
    { date: '2024-11-12', time: '03:15', ward: 'ICU', patient: 'Mohan Reddy (IPD2415)', type: 'Cardiac Arrest - Asystole', response: '0.8 mins', team: 7, outcome: 'CPR for 25 mins, Declared Deceased' },
    { date: '2024-11-15', time: '18:45', ward: 'General Ward B', patient: 'Kamala Bai (IPD2428)', type: 'Severe Hypotension - Septic Shock', response: '2.5 mins', team: 5, outcome: 'Stabilized with Vasopressors, ICU Transfer' },
    { date: '2024-11-18', time: '11:30', ward: 'Pediatrics', patient: 'Aarav Kumar (IPD2436)', type: 'Status Epilepticus', response: '1.5 mins', team: 4, outcome: 'Seizure controlled with IV Lorazepam' },
    { date: '2024-11-21', time: '22:10', ward: 'Private Ward 1', patient: 'Vishwanath Reddy (IPD2445)', type: 'Anaphylactic Shock', response: '2.0 mins', team: 5, outcome: 'Epinephrine given, Stabilized' },
    { date: '2024-11-23', time: '05:50', ward: 'ICU', patient: 'Rajani Devi (IPD2451)', type: 'Cardiac Arrest - PEA', response: '1.0 mins', team: 6, outcome: 'ROSC after 8 mins, Prognosis guarded' },
    { date: '2024-11-26', time: '16:25', ward: 'General Ward A', patient: 'Suresh Patel (IPD2462)', type: 'Respiratory Distress - Acute Asthma', response: '2.2 mins', team: 4, outcome: 'Nebulization, Steroids, Stabilized' }
  ];
  
  return codes;
}

function generateMedicationErrorData() {
  const errors = ['Wrong Dose', 'Wrong Time', 'Wrong Patient', 'Omission', 'Wrong Route'];
  const medications = ['Insulin', 'Warfarin', 'Digoxin', 'Heparin', 'Morphine'];
  
  return Array.from({ length: 6 }, (_, i) => ({
    date: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
    patient: `P00${Math.floor(Math.random() * 100) + 1}`,
    medication: medications[Math.floor(Math.random() * medications.length)],
    errorType: errors[i % errors.length],
    administeredBy: `Nurse ${['Alice', 'Bob', 'Carol'][Math.floor(Math.random() * 3)]}`,
    severity: ['Minor', 'Moderate', 'Major'][Math.floor(Math.random() * 3)],
    actionTaken: 'Incident reported, corrective measures taken',
    status: ['Under Review', 'Closed'][Math.floor(Math.random() * 2)]
  }));
}

function generateNABHComplianceData() {
  const standards = [
    'Patient Safety',
    'Infection Control',
    'Medication Management',
    'Patient Rights',
    'Clinical Care',
    'Quality Management'
  ];
  
  return standards.map(standard => {
    const total = Math.floor(Math.random() * 20) + 30;
    const met = Math.floor(total * (0.85 + Math.random() * 0.12));
    const partial = Math.floor(total * 0.08);
    
    return {
      name: standard,
      standard,
      totalCriteria: total,
      met,
      partiallyMet: partial,
      notMet: total - met - partial,
      compliance: ((met / total) * 100).toFixed(1),
      actionPlan: 'In Progress',
      value: met,
      occupied: met,
      available: total - met
    };
  });
}

function generateAuditTrailData() {
  const actions = ['Patient Record Access', 'Billing Update', 'Prescription Entry', 'Lab Order', 'Discharge Summary'];
  const modules = ['IPD', 'OPD', 'Pharmacy', 'Lab', 'Billing'];
  const users = ['Dr. Smith', 'Nurse Johnson', 'Admin Wilson', 'Dr. Brown'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    dateTime: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')} ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}`,
    user: users[Math.floor(Math.random() * users.length)],
    role: ['Doctor', 'Nurse', 'Admin'][Math.floor(Math.random() * 3)],
    action: actions[Math.floor(Math.random() * actions.length)],
    module: modules[Math.floor(Math.random() * modules.length)],
    patientId: `P00${Math.floor(Math.random() * 100) + 1}`,
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    status: ['Success', 'Success', 'Failed'][Math.floor(Math.random() * 3)]
  }));
}

function generateConsentData() {
  const types = ['Surgery Consent', 'Anesthesia Consent', 'Blood Transfusion', 'High-Risk Procedure', 'Research Participation'];
  const procedures = ['Appendectomy', 'Joint Replacement', 'Blood Transfusion', 'Cardiac Surgery', 'Clinical Trial'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    patient: `P00${Math.floor(Math.random() * 100) + 1}`,
    consentType: types[Math.floor(Math.random() * types.length)],
    procedure: procedures[Math.floor(Math.random() * procedures.length)],
    obtainedDate: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
    obtainedBy: `Dr. ${['Smith', 'Johnson', 'Williams'][Math.floor(Math.random() * 3)]}`,
    witness: `Nurse ${['Alice', 'Bob', 'Carol'][Math.floor(Math.random() * 3)]}`,
    status: ['Valid', 'Pending', 'Expired'][Math.floor(Math.random() * 3)],
    expiry: `2025-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`
  }));
}

function generatePanelAdmissionsData() {
  const panels = [
    { name: 'Star Health Insurance', admissions: 78, emergency: 45, planned: 33, avgLOS: 4.2, active: 18 },
    { name: 'ICICI Lombard', admissions: 65, emergency: 38, planned: 27, avgLOS: 3.8, active: 15 },
    { name: 'HDFC ERGO', admissions: 52, emergency: 28, planned: 24, avgLOS: 4.5, active: 12 },
    { name: 'New India Assurance', admissions: 48, emergency: 32, planned: 16, avgLOS: 3.5, active: 10 },
    { name: 'United India Insurance', admissions: 34, emergency: 18, planned: 16, avgLOS: 4.0, active: 8 },
    { name: 'Reliance General', admissions: 28, emergency: 15, planned: 13, avgLOS: 3.6, active: 6 },
    { name: 'Corporate Panel A', admissions: 42, emergency: 22, planned: 20, avgLOS: 3.2, active: 9 },
    { name: 'Corporate Panel B', admissions: 31, emergency: 18, planned: 13, avgLOS: 3.4, active: 7 },
    { name: 'Government Scheme (CGHS)', admissions: 38, emergency: 25, planned: 13, avgLOS: 5.2, active: 11 },
    { name: 'Ayushman Bharat', admissions: 45, emergency: 35, planned: 10, avgLOS: 4.8, active: 14 },
    { name: 'Cash Patients', admissions: 145, emergency: 89, planned: 56, avgLOS: 3.9, active: 32 }
  ];
  
  return panels.map(panel => ({
    name: panel.name,
    panelName: panel.name,
    totalAdmissions: panel.admissions,
    emergency: panel.emergency,
    planned: panel.planned,
    avgLOS: panel.avgLOS,
    activePatients: panel.active,
    value: panel.admissions
  }));
}

function generatePanelBillingData() {
  const panels = [
    { name: 'Star Health Insurance', billing: 2850000, approved: 2650000, pending: 150000, rejected: 50000 },
    { name: 'ICICI Lombard', billing: 2450000, approved: 2250000, pending: 120000, rejected: 80000 },
    { name: 'HDFC ERGO', billing: 1980000, approved: 1780000, pending: 100000, rejected: 100000 },
    { name: 'New India Assurance', billing: 1650000, approved: 1500000, pending: 80000, rejected: 70000 },
    { name: 'United India Insurance', billing: 1250000, approved: 1100000, pending: 90000, rejected: 60000 },
    { name: 'Reliance General', billing: 980000, approved: 850000, pending: 80000, rejected: 50000 },
    { name: 'Corporate Panel A', billing: 1450000, approved: 1350000, pending: 70000, rejected: 30000 },
    { name: 'Corporate Panel B', billing: 1120000, approved: 980000, pending: 90000, rejected: 50000 },
    { name: 'Government Scheme (CGHS)', billing: 1350000, approved: 1200000, pending: 100000, rejected: 50000 },
    { name: 'Ayushman Bharat', billing: 1580000, approved: 1450000, pending: 80000, rejected: 50000 },
    { name: 'Cash Patients', billing: 4850000, approved: 4750000, pending: 50000, rejected: 50000 }
  ];
  
  return panels.map(panel => ({
    name: panel.name,
    panelName: panel.name,
    totalBilling: panel.billing,
    approvedAmount: panel.approved,
    pendingAmount: panel.pending,
    rejectedAmount: panel.rejected,
    collectionPercent: ((panel.approved / panel.billing) * 100).toFixed(1),
    value: panel.billing
  }));
}

function generateClaimStatusData() {
  const panels = ['Star Health', 'ICICI Lombard', 'HDFC ERGO', 'New India', 'CGHS', 'Ayushman'];
  const statuses = ['Approved', 'Pending', 'Rejected', 'Under Review'];
  const patients = ['Rajesh Kumar', 'Priya Patel', 'Amit Singh', 'Sunita Devi', 'Vikram Shah'];
  
  return Array.from({ length: 30 }, (_, i) => {
    const claimAmt = Math.floor(Math.random() * 100000) + 50000;
    const approvedAmt = Math.floor(claimAmt * (0.7 + Math.random() * 0.3));
    return {
      claimId: `CLM${String(i + 1000).padStart(5, '0')}`,
      patient: patients[Math.floor(Math.random() * patients.length)],
      panel: panels[Math.floor(Math.random() * panels.length)],
      claimAmount: claimAmt,
      approvedAmount: approvedAmt,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      submissionDate: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
      tat: Math.floor(Math.random() * 20) + 5
    };
  });
}

function generatePreAuthComparisonData() {
  const panels = ['Star Health', 'ICICI Lombard', 'HDFC ERGO', 'CGHS'];
  const patients = ['Rajesh Kumar', 'Priya Patel', 'Amit Singh', 'Sunita Devi', 'Vikram Shah', 'Meena Verma'];
  const reasons = ['Additional Tests Required', 'Extended ICU Stay', 'Within Limit', 'Complication Arose', 'Early Discharge'];
  
  return Array.from({ length: 25 }, (_, i) => {
    const preAuth = Math.floor(Math.random() * 150000) + 50000;
    const finalBill = Math.floor(preAuth * (0.8 + Math.random() * 0.4));
    const variance = finalBill - preAuth;
    const variancePercent = ((variance / preAuth) * 100).toFixed(1);
    
    return {
      patient: patients[Math.floor(Math.random() * patients.length)],
      panel: panels[Math.floor(Math.random() * panels.length)],
      preAuthAmount: preAuth,
      finalBill: finalBill,
      variance: variance,
      variancePercent: variancePercent,
      status: variance > 0 ? 'Exceeded' : (variance < -10000 ? 'Under Utilized' : 'Within Range'),
      reason: reasons[Math.floor(Math.random() * reasons.length)]
    };
  });
}

function generateDischargeSummaryStatusData() {
  const patients = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Mary Williams'];
  const statuses = ['Completed', 'Pending', 'In Progress'];
  const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    patient: patients[Math.floor(Math.random() * patients.length)],
    dischargeDate: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
    summaryStatus: statuses[Math.floor(Math.random() * statuses.length)],
    preparedBy: doctors[Math.floor(Math.random() * doctors.length)],
    daysPending: Math.floor(Math.random() * 7),
    approvedBy: doctors[Math.floor(Math.random() * doctors.length)],
    delivered: ['Yes', 'No', 'Pending'][Math.floor(Math.random() * 3)]
  }));
}

function generateDocumentationQualityData() {
  const patients = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Mary Williams'];
  
  return Array.from({ length: 20 }, (_, i) => {
    const required = Math.floor(Math.random() * 5) + 10;
    const completed = Math.floor(required * (0.8 + Math.random() * 0.2));
    
    return {
      patient: patients[Math.floor(Math.random() * patients.length)],
      admissionDate: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
      requiredDocs: required,
      completed,
      incomplete: required - completed,
      qualityScore: ((completed / required) * 100).toFixed(1),
      auditedBy: `Auditor ${Math.floor(Math.random() * 3) + 1}`
    };
  });
}

function generateTATData() {
  const services = ['Lab Reports', 'Radiology Reports', 'Discharge Summary', 'Billing', 'Pharmacy'];
  
  return services.map(service => {
    const total = Math.floor(Math.random() * 200) + 150;
    const withinTAT = Math.floor(total * (0.85 + Math.random() * 0.12));
    
    return {
      name: service,
      serviceType: service,
      totalRequests: total,
      withinTAT,
      delayed: total - withinTAT,
      avgTAT: (Math.random() * 4 + 2).toFixed(1),
      targetTAT: (Math.random() * 2 + 4).toFixed(1),
      compliance: ((withinTAT / total) * 100).toFixed(1),
      value: withinTAT,
      occupied: withinTAT,
      available: total - withinTAT
    };
  });
}

function generateDNRData() {
  const patients = ['John Anderson', 'Mary Wilson', 'Robert Miller', 'Sarah Davis'];
  const wards = ['ICU', 'CCU', 'Palliative Care', 'General Ward'];
  const statuses = ['Full Code', 'DNR - Comfort Care', 'DNR - Medical Intervention Only'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    patient: patients[Math.floor(Math.random() * patients.length)],
    age: Math.floor(Math.random() * 30) + 60,
    ward: wards[Math.floor(Math.random() * wards.length)],
    dnrStatus: statuses[Math.floor(Math.random() * statuses.length)],
    orderDate: `2024-11-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`,
    orderedBy: `Dr. ${['Smith', 'Johnson', 'Williams'][Math.floor(Math.random() * 3)]}`,
    familyConsent: ['Yes', 'No'][Math.floor(Math.random() * 2)],
    reviewDate: `2024-12-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')}`
  }));
}
