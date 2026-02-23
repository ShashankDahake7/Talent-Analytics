import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../lib/api';

export default function Analytics() {
  const [headcount, setHeadcount] = useState([]);
  const [attrition, setAttrition] = useState([]);
  const [forecast, setForecast] = useState({ history: [], forecast: [] });
  const [dept, setDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/analytics/headcount').catch(() => []),
      api.get('/analytics/attrition-risk').catch(() => []),
    ])
      .then(([h, a]) => {
        setHeadcount(Array.isArray(h) ? h : []);
        setAttrition(Array.isArray(a) ? a : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get(`/analytics/attrition-forecast${dept ? `?departmentId=${encodeURIComponent(dept)}` : ''}`)
      .catch(() => ({ history: [], forecast: [] }))
      .then((f) => setForecast(Array.isArray(f) ? { history: [], forecast: [] } : f));
  }, [dept]);

  const departments = useMemo(
    () => headcount.map((x) => x._id).filter(Boolean).sort(),
    [headcount]
  );

  const headcountData = headcount.map((x) => ({ name: x._id || 'Unknown', count: x.headcount || 0 }));
  const attritionData = attrition
    .filter((x) => x._id !== null && x._id !== undefined)
    .map((x) => ({ name: x._id, count: x.count || 0 }));
  const forecastHistory = (forecast.history || []).map((s) => ({
    period: s.date ? new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : '',
    headcount: s.headcount,
    exits: s.exits,
  }));
  const forecastFuture = (forecast.forecast || []).map((f, i) => ({
    period: `+${f.period}`,
    projectedHeadcount: f.projectedHeadcount,
    expectedExits: f.expectedExits,
  }));

  if (loading) {
    return (
      <div className="max-w-5xl">
        <h1 className="font-serif text-3xl text-ink-900 mb-2">Analytics</h1>
        <p className="text-ink-500 mb-8">Workforce metrics and forecasts</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-6 h-80 animate-pulse" />
          <div className="card p-6 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Analytics</h1>
          <p className="text-ink-500 mt-1">Workforce metrics and attrition forecasts</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-ink-500 whitespace-nowrap">Forecast dept:</label>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="input w-auto min-w-[160px]"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-ink-900 mb-4">Headcount by department</h2>
          {headcountData.length === 0 ? (
            <p className="text-ink-500 text-sm py-12 text-center">No data</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={headcountData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e2" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#737066" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#737066" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e4e2' }}
                    formatter={(v) => [v, 'Headcount']}
                  />
                  <Bar dataKey="count" fill="#5f7a58" radius={[4, 4, 0, 0]} name="Headcount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-ink-900 mb-4">Attrition risk distribution</h2>
          {attritionData.length === 0 ? (
            <p className="text-ink-500 text-sm py-12 text-center">No data</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attritionData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e2" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#737066" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#737066" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e4e2' }}
                    formatter={(v) => [v, 'Employees']}
                  />
                  <Bar dataKey="count" fill="#b3b0a9" radius={[4, 4, 0, 0]} name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="font-semibold text-ink-900 mb-4">Attrition forecast</h2>
        {forecastHistory.length === 0 && forecastFuture.length === 0 ? (
          <p className="text-ink-500 text-sm py-12 text-center">No snapshot or forecast data</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[...forecastHistory, ...forecastFuture]}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e2" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#737066" />
                <YAxis tick={{ fontSize: 12 }} stroke="#737066" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e4e2' }} />
                <Legend />
                <Line type="monotone" dataKey="headcount" stroke="#5f7a58" strokeWidth={2} name="Headcount" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="projectedHeadcount" stroke="#a8ba9a" strokeDasharray="4 4" strokeWidth={2} name="Projected headcount" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="exits" stroke="#d1cfcb" strokeWidth={2} name="Exits" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expectedExits" stroke="#b3b0a9" strokeDasharray="4 4" strokeWidth={2} name="Expected exits" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
}