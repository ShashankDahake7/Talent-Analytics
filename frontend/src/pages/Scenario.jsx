import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Users, Loader2, AlertCircle, Filter } from 'lucide-react';
import { api } from '../lib/api';

export default function Scenario() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [riskFilter, setRiskFilter] = useState('high');

  useEffect(() => {
    api
      .get('/employees')
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!riskFilter || riskFilter === 'all') {
      return employees;
    }
    return employees.filter((emp) => emp.attritionRiskBand === riskFilter);
  }, [employees, riskFilter]);

  useEffect(() => {
    const validSelected = selected.filter((id) =>
      filteredEmployees.some((emp) => emp.employeeId === id)
    );
    if (validSelected.length !== selected.length) {
      setSelected(validSelected);
    }
  }, [riskFilter, filteredEmployees]);

  const toggle = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const getRiskBadgeClass = (band) => {
    if (!band) return 'bg-ink-200 text-ink-700';
    if (band === 'high') return 'bg-red-100 text-red-800';
    if (band === 'medium') return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  const runScenario = async () => {
    if (selected.length === 0) return;
    setRunning(true);
    setResult(null);
    setError('');
    try {
      const res = await api.post('/scenario/attrition', { employeeIds: selected });
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="font-serif text-3xl text-ink-900 mb-2">Scenario planning</h1>
        <p className="text-ink-500 mb-8">What-if attrition impact</p>
        <div className="card p-12 animate-pulse">
          <div className="h-8 bg-ink-200 rounded w-1/3 mb-6" />
          <div className="h-48 bg-ink-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-ink-900">Scenario planning</h1>
        <p className="text-ink-500 mt-1">What-if attrition impact</p>
      </div>

      {error && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 px-4 py-3 text-sm mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-8"
      >
        <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" /> Select employees (assume they leave)
        </h2>
        <p className="text-sm text-ink-500 mb-4">
          Choose employees to simulate attrition. We'll summarize impact by department and suggest mitigations.
        </p>
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter by risk:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['high', 'medium', 'low', 'all'].map((risk) => (
              <button
                key={risk}
                onClick={() => setRiskFilter(risk)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${riskFilter === risk
                    ? risk === 'high'
                      ? 'bg-red-100 text-red-800 border-2 border-red-300'
                      : risk === 'medium'
                        ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                        : risk === 'low'
                          ? 'bg-green-100 text-green-800 border-2 border-green-300'
                          : 'bg-ink-200 text-ink-800 border-2 border-ink-300'
                    : 'bg-ink-50 text-ink-600 border-2 border-transparent hover:bg-ink-100'
                  }`}
              >
                {risk.charAt(0).toUpperCase() + risk.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-xs text-ink-500 ml-auto">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} shown
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto rounded-xl border border-ink-100 divide-y divide-ink-100">
          {filteredEmployees.length === 0 ? (
            <p className="p-6 text-center text-ink-500">
              No employees found with {riskFilter === 'all' ? 'any' : riskFilter} attrition risk.
            </p>
          ) : (
            filteredEmployees.map((emp) => (
              <label
                key={emp.employeeId}
                className="flex items-center gap-4 p-4 hover:bg-ink-50/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(emp.employeeId)}
                  onChange={() => toggle(emp.employeeId)}
                  className="rounded border-ink-300 text-sage-600 focus:ring-sage-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink-900 truncate">{emp.name}</p>
                    {emp.attritionRiskBand && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskBadgeClass(
                          emp.attritionRiskBand
                        )}`}
                      >
                        {emp.attritionRiskBand} risk
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-500 truncate">
                    {emp.employeeId} · {emp.departmentId || '—'} · {emp.roleId || '—'}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>
        <button
          onClick={runScenario}
          disabled={running || selected.length === 0}
          className="btn-primary mt-4"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Running scenario…
            </>
          ) : (
            <>
              <GitBranch className="w-4 h-4" /> Run scenario ({selected.length} selected)
            </>
          )}
        </button>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-ink-900 mb-4">Impact</h2>
          <p className="text-ink-600 mb-4">
            <span className="font-medium text-ink-900">{result.totalAtRisk}</span> employees at risk.
          </p>
          {result.impactByDepartment && Object.keys(result.impactByDepartment).length > 0 && (
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-ink-700">By department</p>
              <ul className="space-y-2">
                {Object.entries(result.impactByDepartment).map(([dept, data]) => (
                  <li key={dept} className="rounded-xl bg-ink-50 p-4">
                    <p className="font-medium text-ink-900">{dept} — {data.count} leaving</p>
                    {data.names?.length > 0 && (
                      <p className="text-sm text-ink-600 mt-1">{data.names.join(', ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.explanation && (
            <div className="rounded-xl bg-sage-50 border border-sage-200 p-4 text-sm text-ink-700">
              <p className="font-medium text-sage-800 mb-2">Summary &amp; recommendations</p>
              <p className="whitespace-pre-wrap">{result.explanation}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
