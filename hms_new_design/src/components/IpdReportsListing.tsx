import React, { useState } from 'react';
import IpdReportDetail from './reports/IpdReportDetail';
import { 
  Search, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Bed, 
  Pill, 
  FlaskConical, 
  Scissors, 
  Shield, 
  ClipboardCheck,
  Calendar,
  User,
  Building2,
  Users,
  Download,
  Filter
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
}

interface ReportCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  reports: Report[];
}

export default function IpdReportsListing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPanel, setSelectedPanel] = useState('');
  const [selectedReport, setSelectedReport] = useState<{ id: string; name: string } | null>(null);

  const reportCategories: ReportCategory[] = [
    {
      id: 'admission-discharge',
      title: 'Admission & Discharge Reports',
      icon: <FileText className="w-5 h-5" />,
      color: '#2F80ED',
      reports: [
        { id: 'daily-admission', name: 'Daily Admissions Report', description: 'Track all patient admissions for the selected period' },
        { id: 'discharge-summary', name: 'Daily Discharges Report', description: 'Monitor patient discharges and outcomes' },
        { id: 'alos-report', name: 'ALOS (Average Length of Stay)', description: 'Calculate average stay duration by ward or consultant' },
        { id: 'transfer-report', name: 'Transfers In/Out', description: 'Track inter-ward and inter-hospital transfers' },
        { id: 'occupancy-report', name: 'Bed Occupancy Report', description: 'Real-time and historical bed utilization metrics' },
        { id: 'bed-turnover', name: 'Bed Turnover Rate', description: 'Analyze bed efficiency and turnover statistics' },
        { id: 'census-report', name: 'Patient Census (Ward-Wise / Consultant-Wise)', description: 'Comprehensive patient count by department or doctor' }
      ]
    },
    {
      id: 'billing-finance',
      title: 'Billing & Finance Reports',
      icon: <DollarSign className="w-5 h-5" />,
      color: '#27AE60',
      reports: [
        { id: 'revenue-report', name: 'IPD Revenue Summary', description: 'Total revenue generated from inpatient services' },
        { id: 'collection-report', name: 'Consultant Wise Revenue', description: 'Revenue breakdown by attending physician' },
        { id: 'billing-summary', name: 'Department Wise Billing Summary', description: 'Billing analysis across hospital departments' },
        { id: 'insurance-claims', name: 'Advance Received Report', description: 'Track advance payments from patients' },
        { id: 'credit-debtors', name: 'Pending Bills / Outstanding Dues', description: 'Monitor unpaid bills and collection status' },
        { id: 'package-wise', name: 'Final Bill vs Estimate Comparison', description: 'Compare estimated vs actual billing amounts' },
        { id: 'discount-concession', name: 'Panel / Insurance Billing Summary', description: 'Insurance and corporate billing overview' }
      ]
    },
    {
      id: 'clinical-medical',
      title: 'Clinical & Medical Reports',
      icon: <Activity className="w-5 h-5" />,
      color: '#9B59B6',
      reports: [
        { id: 'mortality-report', name: 'Diagnosis Wise Report', description: 'Patient distribution by diagnosis codes' },
        { id: 'complication-tracking', name: 'Procedure Wise Report', description: 'Track procedures performed during IPD stay' },
        { id: 'infection-rate', name: 'Doctor Wise Patient Load', description: 'Analyze patient distribution across doctors' },
        { id: 'treatment-outcome', name: 'Surgery Summary', description: 'Comprehensive surgical procedures overview' },
        { id: 'adverse-events', name: 'Medication Chart Report', description: 'Detailed medication administration records' },
        { id: 'critical-care', name: 'Vital Monitoring Summary', description: 'Patient vital signs tracking and trends' },
        { id: 'readmission-rate', name: 'Nursing Care Summary', description: 'Nursing interventions and care documentation' }
      ]
    },
    {
      id: 'bed-room',
      title: 'Bed & Room Management Reports',
      icon: <Bed className="w-5 h-5" />,
      color: '#E67E22',
      reports: [
        { id: 'realtime-occupancy', name: 'Real-Time Bed Occupancy', description: 'Current bed availability across all wards' },
        { id: 'ward-saturation', name: 'Ward Saturation Report', description: 'Ward capacity utilization percentage' },
        { id: 'room-type-usage', name: 'Room Type Usage Report', description: 'Analysis by room categories (Private, Semi-Private, General)' },
        { id: 'bed-allocation', name: 'Bed Allocation History', description: 'Historical bed assignment tracking' },
        { id: 'bed-blocking', name: 'Bed Blocking Report', description: 'Identify delayed discharges and bed blocking incidents' }
      ]
    },
    {
      id: 'pharmacy-consumable',
      title: 'Pharmacy & Consumable Reports',
      icon: <Pill className="w-5 h-5" />,
      color: '#1ABC9C',
      reports: [
        { id: 'medication-consumption', name: 'Medication Consumption Report', description: 'Track drug usage by ward and patient' },
        { id: 'high-cost-drugs', name: 'High-Cost Drug Usage', description: 'Monitor expensive medication utilization' },
        { id: 'ward-inventory', name: 'Ward Inventory Usage', description: 'Ward-specific pharmacy inventory consumption' },
        { id: 'consumables-implants', name: 'Consumables & Implants Usage', description: 'Track surgical consumables and implant usage' }
      ]
    },
    {
      id: 'lab-radiology',
      title: 'Laboratory & Radiology Reports',
      icon: <FlaskConical className="w-5 h-5" />,
      color: '#3498DB',
      reports: [
        { id: 'lab-utilization', name: 'Lab Test Utilization Summary', description: 'Frequency and types of lab tests ordered' },
        { id: 'delayed-reports', name: 'Delayed Lab Reports', description: 'Track TAT delays in lab result delivery' },
        { id: 'critical-results', name: 'Critical Lab Results Summary', description: 'Monitor critical and panic value reports' },
        { id: 'radiology-usage', name: 'Radiology Usage Report (MRI, CT, USG, X-Ray)', description: 'Imaging services utilization analysis' }
      ]
    },
    {
      id: 'ot-reports',
      title: 'OT (Operation Theatre) Reports',
      icon: <Scissors className="w-5 h-5" />,
      color: '#E74C3C',
      reports: [
        { id: 'surgery-roster', name: 'Surgery Schedule vs Performed', description: 'Compare planned vs completed surgeries' },
        { id: 'surgical-outcome', name: 'Surgeon Wise Summary', description: 'Surgical volume by surgeon' },
        { id: 'surgery-type-frequency', name: 'Surgery Type Frequency', description: 'Most common surgical procedures' },
        { id: 'ot-utilization', name: 'OT Utilization Rate', description: 'Operation theatre efficiency metrics' },
        { id: 'anesthesia-report', name: 'Anesthesia Type Usage', description: 'Anesthesia methods and distribution' }
      ]
    },
    {
      id: 'panel-insurance',
      title: 'Panel / Insurance Reports',
      icon: <Shield className="w-5 h-5" />,
      color: '#F39C12',
      reports: [
        { id: 'panel-admissions', name: 'Panel Wise Admissions', description: 'Track admissions by insurance provider' },
        { id: 'panel-billing', name: 'Panel Wise Billing Summary', description: 'Billing breakdown by insurance panels' },
        { id: 'claim-status', name: 'Claim Status Report', description: 'Track insurance claim approvals and rejections' },
        { id: 'pre-auth-comparison', name: 'Pre-Authorization vs Final Bill', description: 'Compare approved amounts vs actual billing' }
      ]
    },
    {
      id: 'compliance-audit',
      title: 'Compliance & Audit Reports',
      icon: <ClipboardCheck className="w-5 h-5" />,
      color: '#95A5A6',
      reports: [
        { id: 'patient-complaints', name: 'Patient Feedback Summary', description: 'Patient satisfaction scores and comments' },
        { id: 'audit-trail', name: 'Clinical Audit Summary', description: 'Quality assurance and clinical compliance metrics' },
        { id: 'nabh-compliance', name: 'Infection Control Report', description: 'Hospital-acquired infection tracking' },
        { id: 'code-blue', name: 'Incident & Risk Report', description: 'Safety incidents and near-miss events' },
        { id: 'medication-errors', name: 'Mortality & Morbidity Report', description: 'Clinical outcomes and adverse events tracking' },
        { id: 'consent-tracking', name: 'Consent Form Tracking', description: 'Patient consent documentation' }
      ]
    }
  ];

  const filteredCategories = reportCategories.map(category => ({
    ...category,
    reports: category.reports.filter(report =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.reports.length > 0);

  const handleReportClick = (reportId: string, reportName: string) => {
    setSelectedReport({ id: reportId, name: reportName });
  };

  const handleBackToListing = () => {
    setSelectedReport(null);
  };

  // If a report is selected, show the detail page
  if (selectedReport) {
    return (
      <IpdReportDetail
        reportId={selectedReport.id}
        reportName={selectedReport.name}
        onBack={handleBackToListing}
      />
    );
  }

  return (
    <div className="w-full p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-gray-900 mb-2">IPD Reports</h1>
              <p className="text-gray-600">Comprehensive inpatient department reporting and analytics</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-[#2670d4] transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Export All
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Bar */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent outline-none appearance-none bg-white transition-all"
                >
                  <option value="">Select Date Range</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Consultant Filter */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedConsultant}
                  onChange={(e) => setSelectedConsultant(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent outline-none appearance-none bg-white transition-all"
                >
                  <option value="">All Consultants</option>
                  <option value="dr-smith">Dr. Smith</option>
                  <option value="dr-johnson">Dr. Johnson</option>
                  <option value="dr-williams">Dr. Williams</option>
                  <option value="dr-brown">Dr. Brown</option>
                </select>
              </div>

              {/* Ward Filter */}
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent outline-none appearance-none bg-white transition-all"
                >
                  <option value="">All Wards</option>
                  <option value="icu">ICU</option>
                  <option value="general">General Ward</option>
                  <option value="private">Private Rooms</option>
                  <option value="pediatric">Pediatric Ward</option>
                  <option value="maternity">Maternity Ward</option>
                </select>
              </div>

              {/* Panel Filter - Moved to new row on mobile, spans 1 col on desktop */}
              <div className="relative lg:col-start-1">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedPanel}
                  onChange={(e) => setSelectedPanel(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent outline-none appearance-none bg-white transition-all"
                >
                  <option value="">All Panels</option>
                  <option value="cash">Cash Patients</option>
                  <option value="insurance-a">Insurance Provider A</option>
                  <option value="insurance-b">Insurance Provider B</option>
                  <option value="corporate">Corporate Panels</option>
                  <option value="government">Government Schemes</option>
                </select>
              </div>

              {/* Active Filters Count */}
              <div className="lg:col-span-4 flex items-center gap-2">
                {(selectedDate || selectedConsultant || selectedWard || selectedPanel) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">
                      {[selectedDate, selectedConsultant, selectedWard, selectedPanel].filter(Boolean).length} filter(s) active
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDate('');
                        setSelectedConsultant('');
                        setSelectedWard('');
                        setSelectedPanel('');
                      }}
                      className="text-sm text-[#2F80ED] hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Report Categories */}
        <div className="space-y-6">
          {filteredCategories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Category Header */}
                <div 
                  className="px-6 py-4 border-b border-gray-100 flex items-center gap-3"
                  style={{ borderLeft: `4px solid ${category.color}` }}
                >
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${category.color}15`, color: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-gray-900">{category.title}</h2>
                    <p className="text-sm text-gray-500">{category.reports.length} report(s) available</p>
                  </div>
                </div>

                {/* Reports List */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.reports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => handleReportClick(report.id, report.name)}
                        className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#2F80ED] hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-[#2F80ED] transition-colors flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 mb-1 group-hover:text-[#2F80ED] transition-colors">
                            {report.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <Download className="w-5 h-5 text-gray-400 group-hover:text-[#2F80ED] transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-gray-900 mb-1">{reportCategories.length}</div>
              <p className="text-sm text-gray-600">Report Categories</p>
            </div>
            <div className="text-center">
              <div className="text-gray-900 mb-1">
                {reportCategories.reduce((sum, cat) => sum + cat.reports.length, 0)}
              </div>
              <p className="text-sm text-gray-600">Total Reports</p>
            </div>
            <div className="text-center">
              <div className="text-gray-900 mb-1">{filteredCategories.length}</div>
              <p className="text-sm text-gray-600">Filtered Categories</p>
            </div>
            <div className="text-center">
              <div className="text-gray-900 mb-1">
                {filteredCategories.reduce((sum, cat) => sum + cat.reports.length, 0)}
              </div>
              <p className="text-sm text-gray-600">Matching Reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
