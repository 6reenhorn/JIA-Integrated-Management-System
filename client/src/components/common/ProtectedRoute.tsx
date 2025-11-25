import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  page: 'inventory' | 'ewallet' | 'employees' | 'settings' | 'about';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, page }) => {
  const { currentUser, hasAccess } = useAuth();

  if (!currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!hasAccess(page)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};