import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  RefreshCw, 
  Users,
  Clock,
  TrendingUp,
  Banknote,
  CreditCard,
  Shield,
  Wallet,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export function CashierDashboard() {
  const [shiftStarted, setShiftStarted] = useState(false);
  const [shiftStartTime] = useState(new Date().toLocaleTimeString());

  const todayStats = {
    totalSales: 2450.75,
    transactions: 28,
    customers: 24,
    avgTransaction: 87.53,
    refunds: 2,
    refundAmount: 45.60
  };

  const paymentBreakdown = [
    { method: 'Cash', amount: 1200.50, transactions: 15, color: 'bg-green-500' },
    { method: 'Card', amount: 850.25, transactions: 8, color: 'bg-blue-500' },
    { method: 'Insurance', amount: 300.00, transactions: 3, color: 'bg-purple-500' },
    { method: 'Wallet', amount: 100.00, transactions: 2, color: 'bg-yellow-500' }
  ];

  const recentTransactions = [
    {
      id: 'TXN028',
      time: '14:45',
      customer: 'John Smith',
      amount: 45.50,
      method: 'Card',
      items: 3
    },
    {
      id: 'TXN027',
      time: '14:30',
      customer: 'Emily Davis',
      amount: 12.75,
      method: 'Cash',
      items: 1
    },
    {
      id: 'TXN026',
      time: '14:15',
      customer: 'Michael Brown',
      amount: 78.25,
      method: 'Insurance',
      items: 5
    },
    {
      id: 'TXN025',
      time: '14:00',
      customer: 'Sarah Wilson',
      amount: 24.80,
      method: 'Wallet',
      items: 2
    }
  ];

  const quickActions = [
    { icon: ShoppingCart, label: 'New Sale', action: 'pos', color: 'bg-blue-500' },
    { icon: RefreshCw, label: 'Returns', action: 'return', color: 'bg-orange-500' },
    { icon: Users, label: 'Customer Lookup', action: 'customer', color: 'bg-green-500' },
    { icon: Clock, label: 'Shift Report', action: 'report', color: 'bg-purple-500' }
  ];

  const handleShiftToggle = () => {
    setShiftStarted(!shiftStarted);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash': return <Banknote className="w-4 h-4" />;
      case 'Card': return <CreditCard className="w-4 h-4" />;
      case 'Insurance': return <Shield className="w-4 h-4" />;
      case 'Wallet': return <Wallet className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Cash': return 'bg-green-100 text-green-800';
      case 'Card': return 'bg-blue-100 text-blue-800';
      case 'Insurance': return 'bg-purple-100 text-purple-800';
      case 'Wallet': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Shift Status */}
      <Card className={`border-0 shadow-sm border-l-4 ${shiftStarted ? 'border-green-500' : 'border-red-500'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${shiftStarted ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-sm text-gray-900">
                  Shift Status: <span className={shiftStarted ? 'text-green-600' : 'text-red-600'}>
                    {shiftStarted ? 'Active' : 'Inactive'}
                  </span>
                </p>
                {shiftStarted && (
                  <p className="text-xs text-gray-600">Started at {shiftStartTime}</p>
                )}
              </div>
            </div>
            <Button 
              onClick={handleShiftToggle}
              className={shiftStarted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
            >
              {shiftStarted ? 'End Shift' : 'Start Shift'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex flex-col gap-3 h-24 hover:shadow-md transition-shadow"
                disabled={!shiftStarted}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color} text-white`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <p className="text-2xl text-gray-900">${todayStats.totalSales}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+15.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transactions</p>
                <p className="text-2xl text-gray-900">{todayStats.transactions}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customers</p>
                <p className="text-2xl text-gray-900">{todayStats.customers}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-600">+12.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Transaction</p>
                <p className="text-2xl text-gray-900">${todayStats.avgTransaction}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-600">+5.7%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment Methods Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentBreakdown.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payment.color} text-white`}>
                      {getPaymentMethodIcon(payment.method)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{payment.method}</p>
                      <p className="text-xs text-gray-600">{payment.transactions} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">${payment.amount}</p>
                    <p className="text-xs text-gray-600">
                      {((payment.amount / todayStats.totalSales) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Recent Transactions
            </CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{transaction.customer}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{transaction.time}</span>
                        <span>•</span>
                        <span>{transaction.items} items</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">${transaction.amount}</p>
                    <Badge className={getPaymentMethodColor(transaction.method)}>
                      {transaction.method}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm border-l-4 border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-5 h-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm text-yellow-800">Cash drawer reconciliation needed</span>
                <Button size="sm" variant="outline">Review</Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm text-yellow-800">2 refund requests pending approval</span>
                <Button size="sm" variant="outline">Process</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Refunds processed:</span>
                <span className="text-gray-900">{todayStats.refunds} (-${todayStats.refundAmount})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Error transactions:</span>
                <span className="text-gray-900">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer satisfaction:</span>
                <span className="text-green-600">98.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}