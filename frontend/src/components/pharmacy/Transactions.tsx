/**
 * Transactions Component
 * Features: Combined Sales History and Returns/Refunds in a tabbed interface
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Receipt, RotateCcw } from 'lucide-react';
import { SalesHistory } from './SalesHistory';
import { RefundProcessing } from './RefundProcessing';

interface TransactionsProps {
  defaultTab?: 'sales' | 'returns';
}

export function Transactions({ defaultTab = 'sales' }: TransactionsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">
            <Receipt className="w-4 h-4 mr-2" />
            Sales History
          </TabsTrigger>
          <TabsTrigger value="returns">
            <RotateCcw className="w-4 h-4 mr-2" />
            Returns & Refunds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <SalesHistory />
        </TabsContent>

        <TabsContent value="returns" className="mt-6">
          <RefundProcessing />
        </TabsContent>
      </Tabs>
    </div>
  );
}

