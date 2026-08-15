import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b111e] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm tracking-wide animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
