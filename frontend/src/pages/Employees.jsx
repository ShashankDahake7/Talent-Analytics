import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Employees() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('');

  const isHR = user?.role === 'HR_ADMIN';
  const isManager = user?.role === 'MANAGER';
  const canList = isHR || isManager;

  useEffect(() => {
    if (!canList) {
      setLoading(false);
      return;
    }
    const params = new URLSearchParams();
    if (dept) params.set('departmentId', dept);
    if (status) params.set('status', status);
    api
      .get(`/employees?${params}`)
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [canList, dept, status]);

  const filtered = list.filter((e) => {
    if (!q.trim()) return true;
    const k = q.toLowerCase();
    return (
      (e.name || '').toLowerCase().includes(k) ||
      (e.email || '').toLowerCase().includes(k) ||
      (e.employeeId || '').toLowerCase().includes(k)
    );
  });

  if (!canList) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl text-ink-900">Employees</h1>
        <p className="text-ink-500 mt-2">You don’t have access to the employee list.</p>
        {user?.employeeId && (
          <Link
            to={`/employees/${user.employeeId}`}
            className="btn-primary mt-4 inline-flex"
          >
            View my profile
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Employees</h1>
          <p className="text-ink-500 mt-1">Browse and manage workforce</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, ID…"
            className="input pl-10"
          />
        </div>
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="input w-auto min-w-[140px]"
        >
          <option value="">All departments</option>
          <option value="ENG">ENG</option>
          <option value="HR">HR</option>
          <option value="FIN">FIN</option>
          <option value="OPS">OPS</option>
          <option value="MKT">MKT</option>
          <option value="DSG">DSG</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input w-auto min-w-[140px]"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="resigned">Resigned</option>
          <option value="on_notice">On notice</option>
        </select>
      </div>

      {loading ? (
        <div className="card divide-y divide-ink-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6 flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-ink-200" />
              <div className="flex-1">
                <div className="h-5 bg-ink-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-ink-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center text-ink-500"
              >
                No employees match your filters.
              </motion.p>
            ) : (
              filtered.map((emp, i) => (
                <motion.div
                  key={emp.employeeId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-6 border-b border-ink-100 last:border-0 hover:bg-ink-50/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 font-semibold">
                    {(emp.name || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-900 truncate">{emp.name}</p>
                    <p className="text-sm text-ink-500 truncate">{emp.email} · {emp.employeeId}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {emp.attritionRiskBand && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          emp.attritionRiskBand === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : emp.attritionRiskBand === 'medium'
                            ? 'bg-ink-200 text-ink-700'
                            : 'bg-sage-100 text-sage-700'
                        }`}
                      >
                        {emp.attritionRiskBand} risk
                      </span>
                    )}
                    <Link
                      to={`/employees/${emp.employeeId}`}
                      className="btn-ghost py-2"
                    >
                      View <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
