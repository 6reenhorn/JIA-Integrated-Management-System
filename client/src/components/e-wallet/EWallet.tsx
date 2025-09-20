import React from 'react';
import DashboardCard from '../view/DashboardCard';

const EWallet: React.FC = () => (
  <div className="space-y-6">
    <DashboardCard title="E-Wallet">
      <p className="text-gray-600">
        Monitor wallet balance, transactions, and payment history.
      </p>
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-500">Wallet Features:</div>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Balance tracking</li>
          <li>Transaction history</li>
          <li>Payment processing</li>
          <li>Fund transfers</li>
        </ul>
      </div>
    </DashboardCard>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DashboardCard title="Current Balance">
        <p className="text-gray-600">Available funds and balance</p>
      </DashboardCard>
      <DashboardCard title="Recent Transactions">
        <p className="text-gray-600">Latest payment activities</p>
      </DashboardCard>
    </div>
    
    <DashboardCard title="Transaction Analytics" className="min-h-[200px]">
      <p className="text-gray-600">Spending patterns and financial insights</p>
    </DashboardCard>
  </div>
);

export default EWallet;