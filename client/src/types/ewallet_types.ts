export interface StatCardProps {
  title: string;
  amount: string;
  subtitle: string;
  bgColor?: string;
  textColor?: string;
  subtitleColor?: string;
}

export interface SummaryCardProps {
  title: string;
  data: Array<{ label: string; value: string }>;
}

export interface RecordCardProps {
  title: string;
  count: string;
}

export interface TransactionItem {
  type: string;
  date: string;
  amount: string;
  isPositive: boolean;
}

export interface RecentTransactionsProps {
  title: string;
  transactions: TransactionItem[];
}

// E-Wallet Record Interfaces
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

export interface JuanPayRecord {
  id: string;
  amount: number;
  serviceCharge: number;
  transactionType: 'Bill Payment' | 'Transfer' | 'Remittance';
  chargeMOP: 'Cash' | 'JuanPay';
  referenceNumber: string;
  date: string;
}

// E-Wallet specific data interfaces
export interface GCashData {
  balance: string;
  totalCashIn: string;
  totalCashOut: string;
  serviceCharges: string;
  netAmount: string;
  transactions: TransactionItem[];
  records: {
    total: string;
    cashIn: string;
    cashOut: string;
    pending: string;
  };
}

export interface PayMayaData {
  balance: string;
  totalCashIn: string;
  totalCashOut: string;
  serviceCharges: string;
  netAmount: string;
  transactions: TransactionItem[];
  records: {
    total: string;
    loadWallet: string;
    purchases: string;
    pending: string;
  };
}

export interface JuanPayData {
  balance: string;
  totalBeginning: string;
  totalEnding: string;
  serviceCharges: string;
  totalSales: string;
  averagePerRecord: string;
  transactions: TransactionItem[];
  records: {
    total: string;
    billPayments: string;
    remittances: string;
    transfers: string;
  };
}

export interface OverviewStats {
  totalBalance: string;
  gcashNet: string;
  juanPay: string;
  todaysRecord: string;
}