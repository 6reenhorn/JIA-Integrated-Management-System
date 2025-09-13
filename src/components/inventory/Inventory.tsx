import React from 'react';
import DashboardCard from '../view/DashboardCard';

const Inventory: React.FC = () => (
  <div className="space-y-6">
    <DashboardCard title="Inventory Management">
      <p className="text-gray-600">
        Manage your inventory items, stock levels, and product information.
      </p>
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-500">Features:</div>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Track stock levels</li>
          <li>Add new products</li>
          <li>Update product information</li>
          <li>Monitor low stock alerts</li>
        </ul>
      </div>
    </DashboardCard>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DashboardCard title="Stock Overview">
        <p className="text-gray-600">Current stock statistics and levels</p>
      </DashboardCard>
      <DashboardCard title="Recent Activity">
        <p className="text-gray-600">Latest inventory updates and changes</p>
      </DashboardCard>
    </div>
  </div>
);

export default Inventory;