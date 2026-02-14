import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import Scenario from './pages/Scenario';
import ManagerAssessment from './pages/ManagerAssessment';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="animate-pulse text-ink-500 font-medium">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/:employeeId" element={<EmployeeDetail />} />
        <Route path="analytics" element={<ProtectedRoute roles={['HR_ADMIN']}><Analytics /></ProtectedRoute>} />
        <Route path="ai" element={<AIInsights />} />
        <Route path="scenario" element={<ProtectedRoute roles={['HR_ADMIN']}><Scenario /></ProtectedRoute>} />
        <Route path="managers/:employeeId/assessment" element={<ManagerAssessment />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}