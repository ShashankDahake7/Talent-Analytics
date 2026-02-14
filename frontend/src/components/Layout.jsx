import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, BarChart3, Sparkles, GitBranch, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function buildNav(isHR, isEmployee, employeeId) {
  const base = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    isEmployee && employeeId
      ? { to: `/employees/${employeeId}`, label: 'My profile', icon: Users }
      : { to: '/employees', label: 'Employees', icon: Users },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, hrOnly: true },
    { to: '/ai', label: 'AI Insights', icon: Sparkles },
    { to: '/scenario', label: 'Scenario', icon: GitBranch, hrOnly: true },
  ];
  return base.filter(Boolean);
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHR = user?.role === 'HR_ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';
  const nav = buildNav(isHR, isEmployee, user?.employeeId);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-ink-50">
      <aside className="w-64 flex flex-col bg-white border-r border-ink-100 shrink-0">
        <div className="p-6 border-b border-ink-100">
          <h1 className="font-serif text-2xl text-ink-900">Talent</h1>
          <p className="text-sm text-ink-500 mt-0.5">Analytics</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.filter((item) => !item.hrOnly || isHR).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-sage-100 text-sage-800' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-ink-100">
          <div className="flex flex-col gap-0.5 rounded-xl px-4 py-2.5 bg-ink-50">
            <span className="text-xs font-medium text-ink-500 uppercase tracking-wider">{user?.role}</span>
            <span className="text-sm text-ink-700 truncate">{user?.email}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <motion.div
          key={location?.pathname || '/'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}