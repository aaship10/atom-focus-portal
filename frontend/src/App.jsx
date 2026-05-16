import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import GoalCreation from './pages/employee/GoalCreation';
import MyGoals from './pages/employee/MyGoals';
import EmployeeQuarterlyCheckIn from './pages/employee/QuarterlyCheckIn';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import TeamList from './pages/manager/TeamList';
import GoalReview from './pages/manager/GoalReview';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// Navigation Components
import { LeftSidebar } from './components/navigation/Sidebar';

import './App.css'

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const token = localStorage.getItem('token');
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) return <>{children}</>;

  const payload = parseJwt(token);
  const role = payload?.role || 'Employee';

  return (
    <div className="min-h-screen bg-[#F0F0F3] flex">
      <LeftSidebar 
        role={role} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="p-container-padding max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function RootRedirect() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  
  const payload = parseJwt(token);
  const role = payload?.role || 'Employee';
  
  if (role === 'Manager') return <Navigate to="/manager/dashboard" />;
  if (role === 'Admin') return <Navigate to="/admin/dashboard" />;
  return <Navigate to="/employee/dashboard" />;
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/goals/create" element={<GoalCreation />} />
          <Route path="/employee/goals/my-goals" element={<MyGoals />} />
          <Route path="/employee/check-ins" element={<EmployeeQuarterlyCheckIn />} />

          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/team" element={<TeamList />} />
          <Route path="/manager/goals/review/:employeeId" element={<GoalReview />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Root Redirect Logic */}
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
