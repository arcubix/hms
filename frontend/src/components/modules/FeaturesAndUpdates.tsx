import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  X,
  Search,
  Sparkles,
  Zap,
  Bug,
  TrendingUp,
  Shield,
  Palette,
  Download,
  Star,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  Rocket,
  Heart,
  Users,
  Activity,
  Filter,
  Calendar,
  Package,
  Code,
  Cpu,
  Database,
  Globe,
  Lock,
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
  Bell
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface Update {
  id: string;
  version: string;
  date: string;
  type: 'feature' | 'improvement' | 'bugfix' | 'security' | 'performance';
  category: string;
  title: string;
  description: string;
  highlights?: string[];
  icon: any;
  isNew?: boolean;
  isPriority?: boolean;
}

const updates: Update[] = [
  {
    id: '1',
    version: '3.5.0',
    date: '2025-11-24',
    type: 'feature',
    category: 'Support',
    title: 'Advanced Support Ticket System',
    description: 'Complete ticketing system with real-time comments, detailed views, and comprehensive tracking. Manage support requests efficiently with priority levels and status tracking.',
    highlights: [
      'Create and track support tickets',
      'Add comments and collaborate in real-time',
      'Filter by status, priority, and module',
      'Detailed ticket view with activity timeline',
      'Quick actions from listing page'
    ],
    icon: MessageSquare,
    isNew: true,
    isPriority: true
  },
  {
    id: '2',
    version: '3.5.0',
    date: '2025-11-24',
    type: 'feature',
    category: 'Audit & Compliance',
    title: 'Enterprise Audit Log System',
    description: 'Track all system activities with comprehensive audit logging. Advanced filtering, user tracking, and export capabilities for compliance and security monitoring.',
    highlights: [
      'Real-time activity tracking',
      'Advanced filtering by user, action, and date',
      'Export audit logs to CSV',
      'IP address tracking',
      'Color-coded action types',
      'Pagination and search functionality'
    ],
    icon: Activity,
    isNew: true,
    isPriority: true
  },
  {
    id: '3',
    version: '3.5.0',
    date: '2025-11-24',
    type: 'feature',
    category: 'Team',
    title: 'Software Team Contacts Directory',
    description: 'Access complete contact information for all software team members. Search, filter by department, and connect with technical support easily.',
    highlights: [
      '8 team members with complete details',
      'Search and filter by department',
      'Direct contact links (email, phone, WhatsApp)',
      'Department-based organization',
      'Professional profile cards'
    ],
    icon: Users,
    isNew: true
  },
  {
    id: '4',
    version: '3.4.0',
    date: '2025-11-20',
    type: 'feature',
    category: 'Customization',
    title: 'Priority Modules System',
    description: 'Customize your navigation bar with the 4 modules you use most. Each role can set their preferred quick-access modules for improved productivity.',
    highlights: [
      'Select your 4 most-used modules',
      'Role-based module recommendations',
      'Drag and drop interface',
      'Instant navigation bar updates',
      'Save preferences per user'
    ],
    icon: Settings,
    isNew: false
  },
  {
    id: '5',
    version: '3.4.0',
    date: '2025-11-18',
    type: 'feature',
    category: 'Pharmacy',
    title: 'Advanced Pharmacy POS System',
    description: 'Complete Point-of-Sale system with barcode scanning, FIFO batch management, multiple payment methods, and real-time inventory sync.',
    highlights: [
      'Barcode scanning support',
      'FIFO batch expiry management',
      'Multiple payment methods (Cash, Card, UPI)',
      'Real-time inventory updates',
      'Comprehensive sales reports'
    ],
    icon: Package,
    isNew: false
  },
  {
    id: '6',
    version: '3.3.0',
    date: '2025-11-15',
    type: 'feature',
    category: 'Emergency',
    title: 'Emergency Duty Roster Management',
    description: 'Manage emergency department staff schedules with shift patterns, on-call tracking, and automated notifications.',
    highlights: [
      'Weekly/Monthly roster views',
      'Shift pattern management',
      'On-call doctor tracking',
      'Automated shift reminders',
      'Conflict detection'
    ],
    icon: Bell,
    isNew: false
  },
  {
    id: '7',
    version: '3.3.0',
    date: '2025-11-12',
    type: 'improvement',
    category: 'Performance',
    title: 'Database Query Optimization',
    description: 'Improved database performance with optimized queries, indexing, and caching strategies. 40% faster load times across all modules.',
    highlights: [
      '40% faster page load times',
      'Optimized database indexes',
      'Smart query caching',
      'Reduced server response time',
      'Better handling of large datasets'
    ],
    icon: Database,
    isNew: false
  },
  {
    id: '8',
    version: '3.2.0',
    date: '2025-11-08',
    type: 'feature',
    category: 'Analytics',
    title: 'AI-Powered Evaluation Dashboard',
    description: 'Intelligent analytics with predictive insights, trend analysis, and automated recommendations for hospital operations.',
    highlights: [
      'Predictive patient flow analysis',
      'Revenue forecasting',
      'Resource utilization insights',
      'Automated performance alerts',
      'Custom dashboard widgets'
    ],
    icon: BarChart3,
    isNew: false
  },
  {
    id: '9',
    version: '3.2.0',
    date: '2025-11-05',
    type: 'security',
    category: 'Security',
    title: 'Enhanced Security Protocols',
    description: 'Implemented advanced security measures including two-factor authentication, session management, and encryption improvements.',
    highlights: [
      'Two-factor authentication (2FA)',
      'Enhanced password policies',
      'Session timeout management',
      'IP-based access control',
      'Audit trail for security events'
    ],
    icon: Shield,
    isPriority: true
  },
  {
    id: '10',
    version: '3.1.0',
    date: '2025-11-01',
    type: 'feature',
    category: 'Laboratory',
    title: 'Laboratory Information System',
    description: 'Complete lab management with test ordering, result tracking, sample management, and integration with external analyzers.',
    highlights: [
      'Digital test ordering',
      'Sample barcode tracking',
      'Result verification workflow',
      'Analyzer integration',
      'Quality control management'
    ],
    icon: FileText,
    isNew: false
  },
  {
    id: '11',
    version: '3.1.0',
    date: '2025-10-28',
    type: 'feature',
    category: 'Radiology',
    title: 'Radiology Information System (RIS)',
    description: 'Comprehensive radiology module with modality worklist, DICOM support, and report generation.',
    highlights: [
      'Modality worklist management',
      'DICOM image viewing',
      'Structured reporting',
      'Study scheduling',
      'Radiologist assignment'
    ],
    icon: Activity,
    isNew: false
  },
  {
    id: '12',
    version: '3.0.0',
    date: '2025-10-25',
    type: 'improvement',
    category: 'UI/UX',
    title: 'Modern UI Redesign',
    description: 'Complete user interface overhaul with modern design system, improved accessibility, and responsive layouts.',
    highlights: [
      'Clean, modern interface',
      'Improved accessibility (WCAG 2.1)',
      'Mobile-responsive design',
      'Dark mode support',
      'Faster navigation'
    ],
    icon: Palette,
    isNew: false
  },
  {
    id: '13',
    version: '2.9.0',
    date: '2025-10-20',
    type: 'bugfix',
    category: 'Bug Fixes',
    title: 'Patient Registration Fixes',
    description: 'Fixed multiple issues with patient registration form validation and data submission.',
    highlights: [
      'Fixed form validation errors',
      'Resolved duplicate entry issues',
      'Improved error messages',
      'Better data sanitization',
      'Performance improvements'
    ],
    icon: Bug,
    isNew: false
  },
  {
    id: '14',
    version: '2.9.0',
    date: '2025-10-18',
    type: 'performance',
    category: 'Performance',
    title: 'API Response Time Optimization',
    description: 'Optimized API endpoints for faster response times and better handling of concurrent requests.',
    highlights: [
      '60% faster API responses',
      'Better concurrent request handling',
      'Reduced server load',
      'Improved caching strategies',
      'Load balancing improvements'
    ],
    icon: Zap,
    isNew: false
  }
];

interface FeaturesAndUpdatesProps {
  onClose?: () => void;
}

export function FeaturesAndUpdates({ onClose }: FeaturesAndUpdatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter updates
  const filteredUpdates = updates.filter(update => {
    const matchesSearch = 
      update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || update.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-blue-100 text-blue-700';
      case 'improvement':
        return 'bg-green-100 text-green-700';
      case 'bugfix':
        return 'bg-red-100 text-red-700';
      case 'security':
        return 'bg-purple-100 text-purple-700';
      case 'performance':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-4 h-4" />;
      case 'improvement':
        return <TrendingUp className="w-4 h-4" />;
      case 'bugfix':
        return <Bug className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Get latest version
  const latestVersion = updates[0]?.version || '3.5.0';
  const newFeaturesCount = updates.filter(u => u.isNew).length;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-50 overflow-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900 flex items-center gap-2">
                  What's New
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    v{latestVersion}
                  </Badge>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Discover the latest features, improvements, and updates
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Download className="w-4 h-4 mr-2" />
                Download Release Notes
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">New Features</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{newFeaturesCount}</p>
                </div>
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Improvements</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {updates.filter(u => u.type === 'improvement').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Security Updates</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {updates.filter(u => u.type === 'security').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Performance</p>
                  <p className="text-3xl font-bold text-orange-900 mt-1">
                    {updates.filter(u => u.type === 'performance').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search updates by title, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={setSelectedType}>
          <TabsList className="bg-white border shadow-sm p-1 h-auto">
            <TabsTrigger value="all" className="gap-2 px-6 py-3">
              <Globe className="w-4 h-4" />
              All Updates
              <Badge variant="secondary" className="ml-2">{updates.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="feature" className="gap-2 px-6 py-3">
              <Sparkles className="w-4 h-4" />
              Features
              <Badge variant="secondary" className="ml-2">
                {updates.filter(u => u.type === 'feature').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="improvement" className="gap-2 px-6 py-3">
              <TrendingUp className="w-4 h-4" />
              Improvements
              <Badge variant="secondary" className="ml-2">
                {updates.filter(u => u.type === 'improvement').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 px-6 py-3">
              <Shield className="w-4 h-4" />
              Security
              <Badge variant="secondary" className="ml-2">
                {updates.filter(u => u.type === 'security').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="bugfix" className="gap-2 px-6 py-3">
              <Bug className="w-4 h-4" />
              Bug Fixes
              <Badge variant="secondary" className="ml-2">
                {updates.filter(u => u.type === 'bugfix').length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Updates Timeline */}
        <div className="space-y-6">
          {filteredUpdates.map((update, index) => (
            <Card 
              key={update.id} 
              className={`
                group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden
                ${update.isNew ? 'ring-2 ring-blue-500 shadow-xl' : 'shadow-md'}
                ${update.isPriority ? 'bg-gradient-to-r from-purple-50 to-blue-50' : 'bg-white'}
              `}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg
                    ${update.type === 'feature' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
                    ${update.type === 'improvement' ? 'bg-gradient-to-br from-green-500 to-green-600' : ''}
                    ${update.type === 'bugfix' ? 'bg-gradient-to-br from-red-500 to-red-600' : ''}
                    ${update.type === 'security' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : ''}
                    ${update.type === 'performance' ? 'bg-gradient-to-br from-orange-500 to-orange-600' : ''}
                  `}>
                    <update.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {update.isNew && (
                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              NEW
                            </Badge>
                          )}
                          {update.isPriority && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                              <Zap className="w-3 h-3 mr-1" />
                              PRIORITY
                            </Badge>
                          )}
                          <Badge className={getTypeColor(update.type)}>
                            {getTypeIcon(update.type)}
                            <span className="ml-1 capitalize">{update.type}</span>
                          </Badge>
                          <Badge variant="outline" className="text-gray-600">
                            {update.category}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {update.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {update.description}
                        </p>

                        {/* Highlights */}
                        {update.highlights && update.highlights.length > 0 && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              Key Highlights
                            </p>
                            <ul className="space-y-2">
                              {update.highlights.map((highlight, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{update.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>Version {update.version}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        Learn More
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredUpdates.length === 0 && (
          <Card className="p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No updates found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </Card>
        )}

        {/* Footer CTA */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white shadow-2xl">
          <CardContent className="p-8 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-white" />
            <h3 className="text-2xl font-semibold mb-2">Love these updates?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              We're constantly improving MediCare HMS based on your feedback. Have a feature request or suggestion?
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Feedback
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Star className="w-4 h-4 mr-2" />
                Rate This Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
