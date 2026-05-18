import React from 'react';
import { Navigate } from 'react-router-dom';

export default function TeamList() {
  return <Navigate to="/manager/dashboard" replace />;
}
