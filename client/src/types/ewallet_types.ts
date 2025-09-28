export interface SummaryCardProps {
  title: string;
  data: Array<{ label: string; value: string }>;
}

export interface RecordCardProps {
  title: string;
  count: string;
}

export interface GCashRecord {
  id: string;
  amount: number;
  serviceCharge: number;
  transactionType: 'Cash-In' | 'Cash-Out';
  chargeMOP: 'Cash' | 'GCash';
  referenceNumber: string;
  date: string;
}

export interface PayMayaRecord {
  id: string;
  amount: number;
  serviceCharge: number;
  transactionType: 'Cash-In' | 'Cash-Out';
  chargeMOP: 'Cash' | 'PayMaya';
  referenceNumber: string;
  date: string;
}