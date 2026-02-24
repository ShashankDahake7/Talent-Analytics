import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Dashboard() {
  const { user, isHR } = useAuth();
  const [headcount, setHeadcount] = useState([]);
  const [attrition, setAttrition] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isHR) {
      setLoading(false);
      return;
    }
    Promise.all([api.get('/analytics/headcount').catch(() => []), api.get('/analytics/attrition-risk').catch(() => [])])
      .then(([h, a]) => {
        setHeadcount(Array.isArray(h) ? h : []);
        setAttrition(Array.isArray(a) ? a : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isHR]);

  const totalHeadcount = headcount.reduce((s, x) => s + (x.headcount || 0), 0);
  const highRisk = attrition.find((x) => x._id === 'high');
  const highCount = highRisk?.count ?? 0;

  const filterName = (email) => email.split('@')[0];

  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-ink-900">Dashboard</h1>
        <p className="text-ink-500 mt-1">Welcome back, {user?.name || filterName(user?.email)}</p>
      </div>

      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-ink-200 rounded w-1/3 mb-4" />
              <div className="h-10 bg-ink-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && isHR && (
        <>
          {error && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 text-ink-500 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Total headcount</span>
              </div>
              <p className="text-3xl font-semibold text-ink-900">{totalHeadcount}</p>
              <p className="text-sm text-ink-500 mt-1">Active employees</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 text-ink-500 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Departments</span>
              </div>
              <p className="text-3xl font-semibold text-ink-900">{headcount.length}</p>
              <p className="text-sm text-ink-500 mt-1">With active staff</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 text-ink-500 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">High attrition risk</span>
              </div>
              <p className="text-3xl font-semibold text-ink-900">{highCount}</p>
              <p className="text-sm text-ink-500 mt-1">Employees to watch</p>
            </motion.div>
          </div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isHR ? 0.4 : 0.1 }}
        className="card p-6"
      >
        <h2 className="font-semibold text-ink-900 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-4">
          {user?.role === 'EMPLOYEE' && user?.employeeId ? (
            <Link
              to={`/employees/${user.employeeId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-sage-100 text-sage-800 px-4 py-3 text-sm font-medium hover:bg-sage-200 transition-colors"
            >
              My profile <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/employees"
              className="inline-flex items-center gap-2 rounded-xl bg-sage-100 text-sage-800 px-4 py-3 text-sm font-medium hover:bg-sage-200 transition-colors"
            >
              View employees <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            to="/ai"
            className="inline-flex items-center gap-2 rounded-xl bg-ink-100 text-ink-800 px-4 py-3 text-sm font-medium hover:bg-ink-200 transition-colors"
          >
            AI Insights <ArrowRight className="w-4 h-4" />
          </Link>
          {isHR && (
            <>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-xl bg-ink-100 text-ink-800 px-4 py-3 text-sm font-medium hover:bg-ink-200 transition-colors"
              >
                Analytics <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/scenario"
                className="inline-flex items-center gap-2 rounded-xl bg-ink-100 text-ink-800 px-4 py-3 text-sm font-medium hover:bg-ink-200 transition-colors"
              >
                Scenario planning <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
