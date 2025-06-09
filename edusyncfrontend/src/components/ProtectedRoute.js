
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';  // import from the correct location


const ProtectedRoute = ({ children, role }) => {
  
  const isAuthenticate = localStorage.getItem('token')?true:false


  return isAuthenticate ? children : <Navigate to="/" replace /> ;

};

export default ProtectedRoute;
