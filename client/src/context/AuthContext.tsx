import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'General Manager' | 'Inventory Manager' | 'E-Wallet Recorder' | 'Inventory Transaction Manager';

interface User {
  id: number;
  empId: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  isCheckedIn: boolean;
  checkIn: (user: User) => void;
  checkOut: () => void;
  hasAccess: (page: 'inventory' | 'ewallet' | 'employees' | 'settings' | 'about') => boolean;
  hasAccessToEmployeeSection: (section: 'staff' | 'attendance' | 'payroll') => boolean; // ADD THIS LINE
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Restore session from sessionStorage on mount
    try {
      const stored = sessionStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      sessionStorage.removeItem('currentUser');
      return null;
    }
  });

  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(() => {
    // Restore check-in status from sessionStorage
    const stored = sessionStorage.getItem('isCheckedIn');
    return stored === 'true';
  });

  useEffect(() => {
    // Persist to sessionStorage whenever user changes
    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    // Persist check-in status to sessionStorage
    sessionStorage.setItem('isCheckedIn', String(isCheckedIn));
  }, [isCheckedIn]);

  const checkIn = (user: User) => {
    setCurrentUser(user);
    setIsCheckedIn(true); // THIS WAS MISSING!
  };

  const checkOut = () => {
    setCurrentUser(null);
    setIsCheckedIn(false); // THIS WAS MISSING!
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isCheckedIn');
  };

  const hasAccess = (page: 'inventory' | 'ewallet' | 'employees' | 'settings' | 'about'): boolean => {
    if (!currentUser) return false;

    const { role } = currentUser;

    // General Manager has access to everything
    if (role === 'General Manager') return true;

    // About is accessible to everyone
    if (page === 'about') return true;

    // Settings is only for General Manager
    if (page === 'settings') return false;

    // Employees page is accessible to all
    if (page === 'employees') return true;

    // Role-specific access
    switch (role) {
      case 'Inventory Manager':
        return page === 'inventory';
      
      case 'E-Wallet Recorder':
        return page === 'ewallet';
      
      case 'Inventory Transaction Manager':
        return page === 'inventory' || page === 'ewallet';
      
      default:
        return false;
    }
  };

  const hasAccessToEmployeeSection = (section: 'staff' | 'attendance' | 'payroll'): boolean => {
    if (!currentUser) return false;

    const { role } = currentUser;

    // General Manager has access to all sections
    if (role === 'General Manager') return true;

    // Inventory Manager can only access Attendance
    if (role === 'Inventory Manager') {
      return section === 'attendance';
    }

    // Other roles have full access to employees sections
    return true;
  };

  return (
    <AuthContext.Provider value={{ currentUser, isCheckedIn, checkIn, checkOut, hasAccess, hasAccessToEmployeeSection }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};