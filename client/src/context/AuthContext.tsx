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
  checkIn: (user: User) => void;
  checkOut: () => void;
  hasAccess: (page: 'inventory' | 'ewallet' | 'employees' | 'settings' | 'about') => boolean;
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
      sessionStorage.removeItem('currentUser'); // Clear corrupted data
      return null;
    }
  });

  useEffect(() => {
    // Persist to sessionStorage whenever user changes
    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const checkIn = (user: User) => {
    setCurrentUser(user);
  };

  const checkOut = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const hasAccess = (page: 'inventory' | 'ewallet' | 'employees' | 'settings' | 'about'): boolean => {
    if (!currentUser) return false;

    const { role } = currentUser;

    // General Manager has access to everything
    if (role === 'General Manager') return true;

    // Settings and About are only for General Manager
    if (page === 'settings' || page === 'about') return false;

    // Employees page is accessible to all (for attendance)
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

  return (
    <AuthContext.Provider value={{ currentUser, checkIn, checkOut, hasAccess }}>
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