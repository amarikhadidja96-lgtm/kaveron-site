import React, { useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminGuard = ({ children, onNavigate }) => {
  const { isAdmin, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      onNavigate?.('/admin/login');
    }
  }, [isAdmin, isLoading, onNavigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#00FF88]/20 border-t-[#00FF88] animate-spin mb-4" />
        <span className="font-mono text-xs text-[#00FF88] tracking-widest uppercase">
          Verifying Admin Access...
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;

