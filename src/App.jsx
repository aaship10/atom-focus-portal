import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import EmployeeDashboard from './pages/EmployeeDashboard';
import GoalCreationForm from './pages/GoalCreationForm';
import ManagerDashboard from './pages/ManagerDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './App.css'

function Navigation() {
  const location = useLocation();
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-xl flex gap-4 text-sm font-medium border border-gray-200">
      <Link to="/" className={`hover:text-primary ${location.pathname === '/' ? 'text-primary font-bold' : 'text-gray-500'}`}>Employee Dashboard</Link>
      <Link to="/manager" className={`hover:text-primary ${location.pathname === '/manager' ? 'text-primary font-bold' : 'text-gray-500'}`}>Manager Dashboard</Link>
      <Link to="/create-goal" className={`hover:text-primary ${location.pathname === '/create-goal' ? 'text-primary font-bold' : 'text-gray-500'}`}>Goal Creation</Link>
      <Link to="/login" className={`hover:text-primary ${location.pathname === '/login' ? 'text-primary font-bold' : 'text-gray-500'}`}>Login</Link>
      <Link to="/signup" className={`hover:text-primary ${location.pathname === '/signup' ? 'text-primary font-bold' : 'text-gray-500'}`}>Signup</Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="relative">
        <Navigation />
        <Routes>
          <Route path="/" element={<EmployeeDashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/create-goal" element={<GoalCreationForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
