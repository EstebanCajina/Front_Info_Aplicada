// ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  // Verifica si el token está presente en localStorage
  const token = localStorage.getItem('accessToken');
  
  return token ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
