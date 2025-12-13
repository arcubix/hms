import React from 'react';
import { PaymentDialog } from './PaymentDialog';

interface AdvancePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  currentAdvanceBalance?: number;
  onSuccess?: () => void;
}

export function AdvancePaymentDialog({
  open,
  onOpenChange,
  patientId,
  currentAdvanceBalance = 0,
  onSuccess,
}: AdvancePaymentDialogProps) {
  return (
    <PaymentDialog
      open={open}
      onOpenChange={onOpenChange}
      patientId={patientId}
      billType="advance"
      advanceBalance={currentAdvanceBalance}
      onSuccess={onSuccess}
    />
  );
}

