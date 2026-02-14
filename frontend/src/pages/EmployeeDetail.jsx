import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Briefcase,
  Award,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Target,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function EmployeeDetail() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [career, setCareer] = useState(null);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [hipo, setHipo] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [loadingAI, setLoadingAI] = useState({});
  const [attritionResult, setAttritionResult] = useState(null);
  const [attritionError, setAttritionError] = useState('');
  const [careerError, setCareerError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const isHR = user?.role === 'HR_ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isEmployee = user?.role === 'EMPLOYEE';
  const canSeeFull = isHR || isManager;
  const isSelf = isEmployee && user?.employeeId === employeeId;

  useEffect(() => {
    setCareer(null);
    setFeedbackSummary(null);
    setHipo(null);
    setSkillGaps(null);
    setAttritionResult(null);
    setAttritionError('');
    setCareerError('');
    setFeedbackError('');
  }, [employeeId]);

  useEffect(() => {
    api
      .get(`/employees/${employeeId}`)
      .then((e) => {
        setEmployee(e);
        if (e?.roleId) setSelectedRoleId(e.roleId);
      })
      .catch((e) => {
        setError(e.message);
        if (e.status === 403) navigate('/');
      })
      .finally(() => setLoading(false));
  }, [employeeId, navigate]);

  useEffect(() => {
    api.get('/job-roles').then(setRoles).catch(() => setRoles([]));
  }, []);

  const runAttrition = () => {
    if (!canSeeFull) return;
    setAttritionError('');
    setLoadingAI((p) => ({ ...p, attrition: true }));
    api
      .post(`/ai/attrition/${employeeId}`)
      .then((r) => {
        setAttritionResult(r);
        setEmployee((prev) => (prev ? { ...prev, attritionRiskScore: r.score, attritionRiskBand: r.band } : null));
      })
      .catch((e) => setAttritionError(e.message || 'Attrition calculation failed. Is the ML service running?'))
      .finally(() => setLoadingAI((p) => ({ ...p, attrition: false })));
  };

  const runCareer = () => {
    setCareerError('');
    setLoadingAI((p) => ({ ...p, career: true }));
    api
      .get(`/ai/career/${employeeId}`)
      .then(setCareer)
      .catch((e) => setCareerError(e.message || 'Failed to load career recommendations.'))
      .finally(() => setLoadingAI((p) => ({ ...p, career: false })));
  };

  const runFeedback = () => {
    if (!canSeeFull) return;
    setFeedbackError('');
    setLoadingAI((p) => ({ ...p, feedback: true }));
    api
      .get(`/ai/feedback/summary/${employeeId}`)
      .then(setFeedbackSummary)
      .catch((e) => setFeedbackError(e.message || 'Failed to load feedback summary.'))
      .finally(() => setLoadingAI((p) => ({ ...p, feedback: false })));
  };

  const runHipo = () => {
    if (!canSeeFull) return;
    setLoadingAI((p) => ({ ...p, hipo: true }));
    api
      .post(`/ai/hipo/${employeeId}`)
      .then(setHipo)
      .catch(() => { })
      .finally(() => setLoadingAI((p) => ({ ...p, hipo: false })));
  };

  const runSkillGaps = () => {
    if (!selectedRoleId) return;
    setLoadingAI((p) => ({ ...p, gaps: true }));
    api
      .get(`/ai/skills/gaps/${employeeId}?roleId=${encodeURIComponent(selectedRoleId)}`)
      .then(setSkillGaps)
      .catch(() => { })
      .finally(() => setLoadingAI((p) => ({ ...p, gaps: false })));
  };

  if (loading || !employee) {
    return (
      <div className="max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-ink-200 rounded w-48" />
          <div className="card p-8">
            <div className="h-24 bg-ink-100 rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <p className="text-amber-700">{error}</p>
        <Link to="/employees" className="btn-primary mt-4 inline-flex">
          Back to employees
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link
        to="/employees"
        className="inline-flex items-center gap-2 text-ink-600 hover:text-ink-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to employees
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-700 text-2xl font-semibold shrink-0">
            {(employee.name || '?')[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl text-ink-900">{employee.name}</h1>
            <p className="text-ink-500 mt-0.5">{employee.employeeId}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-ink-600">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {employee.email}
              </span>
              {employee.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {employee.location}
                </span>
              )}
              {employee.departmentId && (
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> {employee.departmentId}
                  {employee.roleId && ` · ${employee.roleId}`}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {employee.attritionRiskBand && (
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${employee.attritionRiskBand === 'high'
                    ? 'bg-amber-100 text-amber-800'
                    : employee.attritionRiskBand === 'medium'
                      ? 'bg-ink-200 text-ink-700'
                      : 'bg-sage-100 text-sage-700'
                    }`}
                >
                  {employee.attritionRiskBand} attrition risk
                </span>
              )}
              {employee.highPotentialFlag && (
                <span className="rounded-full px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800">
                  High potential
                </span>
              )}
              <span className="rounded-full px-3 py-1 text-sm font-medium bg-ink-100 text-ink-700">
                {employee.status || 'active'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" /> Performance & skills
          </h2>
          <dl className="space-y-3 text-sm">
            {employee.performanceRating != null && (
              <div>
                <dt className="text-ink-500">Performance rating</dt>
                <dd className="font-medium text-ink-900">{employee.performanceRating}/5</dd>
              </div>
            )}
            {employee.potentialRating != null && (
              <div>
                <dt className="text-ink-500">Potential rating</dt>
                <dd className="font-medium text-ink-900">{employee.potentialRating}/5</dd>
              </div>
            )}
            {employee.engagementScore != null && (
              <div>
                <dt className="text-ink-500">Engagement</dt>
                <dd className="font-medium text-ink-900">{employee.engagementScore}/5</dd>
              </div>
            )}
            {employee.leaveDaysLast12Months != null && (
              <div>
                <dt className="text-ink-500">Leave days (last 12 months)</dt>
                <dd className="font-medium text-ink-900">{employee.leaveDaysLast12Months}</dd>
              </div>
            )}
            {employee.overtimeHoursPerMonth != null && (
              <div>
                <dt className="text-ink-500">Overtime (hours/month)</dt>
                <dd className="font-medium text-ink-900">{employee.overtimeHoursPerMonth}</dd>
              </div>
            )}
            {employee.lastPromotionDate && (
              <div>
                <dt className="text-ink-500">Last promotion</dt>
                <dd className="font-medium text-ink-900">
                  {new Date(employee.lastPromotionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </dd>
              </div>
            )}
            {Array.isArray(employee.skills) && employee.skills.length > 0 && (
              <div>
                <dt className="text-ink-500 mb-2">Skills</dt>
                <dd className="flex flex-wrap gap-2">
                  {employee.skills.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-ink-100 px-2.5 py-1 text-ink-800 text-xs font-medium"
                    >
                      {s.name} L{s.level ?? '-'}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> AI actions
          </h2>
          <div className="space-y-3">
            {canSeeFull && (
              <div>
                <button
                  onClick={runAttrition}
                  disabled={!!loadingAI.attrition}
                  className="btn-secondary w-full justify-start"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {loadingAI.attrition ? 'Computing…' : 'Attrition risk'}
                </button>
                {attritionError && (
                  <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    {attritionError}
                  </div>
                )}
                {attritionResult && (
                  <div className="mt-2 rounded-xl bg-ink-50 p-3 text-sm">
                    <p className="font-medium text-ink-900">
                      Score: {(attritionResult.score * 100).toFixed(0)}% · {attritionResult.band}
                    </p>
                    <p className="text-ink-600 mt-1">{attritionResult.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {canSeeFull && (
              <button
                onClick={() => navigate(`/managers/${employeeId}/assessment`)}
                className="btn-secondary w-full justify-start"
              >
                <Users className="w-4 h-4" />
                Manager Effectiveness
              </button>
            )}
            <div>
              <button
                onClick={runCareer}
                disabled={!!loadingAI.career}
                className="btn-secondary w-full justify-start"
              >
                <BookOpen className="w-4 h-4" />
                {loadingAI.career ? 'Loading…' : 'Career recommendations'}
              </button>
              {careerError && (
                <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  {careerError}
                </div>
              )}
              {career && !careerError && (
                <div className="mt-2 rounded-xl bg-ink-50 p-3 text-sm space-y-2">
                  {career.paths?.length > 0 && (
                    <div>
                      <p className="font-medium text-ink-900">Paths</p>
                      <ul className="list-disc list-inside text-ink-600 mt-1">
                        {career.paths.slice(0, 5).map((p, i) => (
                          <li key={i}>{p.title || p.roleId} — {p.reason || ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {career.learning?.length > 0 && (
                    <div>
                      <p className="font-medium text-ink-900">Learning</p>
                      <ul className="list-disc list-inside text-ink-600 mt-1">
                        {career.learning.slice(0, 5).map((l, i) => (
                          <li key={i}>{l.title || l.itemId} — {l.reason || ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {career.rawText && !(career.paths?.length > 0 || career.learning?.length > 0) && (
                    <p className="text-ink-700 whitespace-pre-wrap">{career.rawText}</p>
                  )}
                  {!(career.paths?.length > 0 || career.learning?.length > 0 || career.rawText) && (
                    <p className="text-ink-500">No specific recommendations returned.</p>
                  )}
                </div>
              )}
            </div>
            {canSeeFull && (
              <div>
                <button
                  onClick={runFeedback}
                  disabled={!!loadingAI.feedback}
                  className="btn-secondary w-full justify-start"
                >
                  <MessageSquare className="w-4 h-4" />
                  {loadingAI.feedback ? 'Loading…' : 'Feedback summary'}
                </button>
                {feedbackError && (
                  <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    {feedbackError}
                  </div>
                )}
                {feedbackSummary && !feedbackError && (
                  <div className="mt-2 rounded-xl bg-ink-50 p-3 text-sm text-ink-700">
                    {feedbackSummary.summary || feedbackSummary.message || 'No summary.'}
                  </div>
                )}
              </div>
            )}
            {canSeeFull && (
              <div>
                <button
                  onClick={runHipo}
                  disabled={!!loadingAI.hipo}
                  className="btn-secondary w-full justify-start"
                >
                  <Target className="w-4 h-4" />
                  {loadingAI.hipo ? 'Evaluating…' : 'High-potential eval'}
                </button>
                {hipo != null && (
                  <div className="mt-2 rounded-xl bg-ink-50 p-3 text-sm">
                    <p className="font-medium text-ink-900">
                      {hipo.highPotential ? 'High potential' : 'Not flagged as high potential'}
                    </p>
                    {hipo.explanation && (
                      <p className="text-ink-600 mt-1">{hipo.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            <div>
              <div className="flex gap-2 mb-2">
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="input flex-1 py-2 text-sm"
                >
                  <option value="">Select target role</option>
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.title} ({r.roleId})
                    </option>
                  ))}
                </select>
                <button
                  onClick={runSkillGaps}
                  disabled={!selectedRoleId || !!loadingAI.gaps}
                  className="btn-secondary shrink-0"
                >
                  {loadingAI.gaps ? '…' : 'Gaps'}
                </button>
              </div>
              {skillGaps && (
                <div className="mt-2 rounded-xl bg-ink-50 p-3 text-sm">
                  <p className="font-medium text-ink-900 mb-2">vs {skillGaps.targetRoleTitle || skillGaps.targetRoleId}</p>
                  {skillGaps.gaps?.length > 0 ? (
                    <ul className="space-y-1.5 text-ink-700">
                      {skillGaps.gaps.filter((g) => g.gap > 0).map((g, i) => (
                        <li key={i}>
                          {g.skill}: L{g.currentLevel} → L{g.requiredLevel} (gap {g.gap})
                        </li>
                      ))}
                      {skillGaps.gaps.every((g) => g.gap === 0) && (
                        <li className="text-sage-700">No gaps — meets requirements.</li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-ink-600">No significant gaps vs target role.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
