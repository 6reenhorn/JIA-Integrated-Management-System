import React from 'react';
import Dashboard from '../pages/Dashboard';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Route, Routes, Navigate } from 'react-router-dom';
import Inventory from '../pages/Inventory';
import EWallet from '../pages/EWallet';
import Employees from '../pages/Employees';
import Settings from '../components/support/settings/Settings';
import About from '../components/support/about/About';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/inventory" element={
          <ProtectedRoute page="inventory">
            <Inventory />
          </ProtectedRoute>
        } />
        
        <Route path="/ewallet" element={
          <ProtectedRoute page="ewallet">
            <EWallet />
          </ProtectedRoute>
        } />
        
        <Route path="/employees" element={
          <ProtectedRoute page="employees">
            <Employees />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute page="settings">
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/about" element={
          <ProtectedRoute page="about">
            <About />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

export default App;