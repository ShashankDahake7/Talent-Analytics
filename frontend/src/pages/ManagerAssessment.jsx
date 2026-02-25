import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
    ArrowLeft,
    User,
    Users,
    Award,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Zap,
} from 'lucide-react';

export default function ManagerAssessment() {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    useAuth(); // ensures user is authenticated

    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIntervention, setActiveIntervention] = useState(null);

    useEffect(() => {
        fetchAssessment();
    }, [employeeId]);

    const fetchAssessment = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/managers/${employeeId}/assessment`);
            setAssessment(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-ink-500">Loading Assessment...</div>;

    if (error && (error.includes('no direct reports') || error.includes('not found'))) {
        return (
            <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 bg-ink-100 rounded-full flex items-center justify-center mx-auto text-ink-400">
                    <User size={32} />
                </div>
                <h2 className="text-xl font-bold text-ink-900">Not a People Manager</h2>
                <p className="text-ink-600">
                    This employee does not have any direct reports assigned in the system, so we cannot calculate a manager effectiveness score.
                </p>
                <button
                    onClick={() => navigate('/employees')}
                    className="px-4 py-2 bg-ink-900 text-white rounded-lg hover:bg-ink-800 transition-colors"
                >
                    Back to Employee List
                </button>
            </div>
        );
    }

    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!assessment) return <div className="p-8 text-center">No assessment found.</div>;

    const currentScore =
        activeIntervention !== null
            ? assessment.suggestedInterventions[activeIntervention].predictedScore
            : assessment.overallScore;

    const isSimulating = activeIntervention !== null;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-ink-100 rounded-lg text-ink-500 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-ink-900">Manager Effectiveness Assessment</h1>
                    <p className="text-ink-500">AI-driven analysis of leadership impact and team health</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Score & Metrics */}
                <div className="space-y-6">
                    {/* Main Score Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-ink-100 text-center relative overflow-hidden">
                        <h2 className="text-lg font-semibold text-ink-700 mb-4">Effectiveness Score</h2>
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    className="stroke-ink-100"
                                    strokeWidth="12"
                                    fill="none"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    className={`transition-all duration-1000 ease-out ${currentScore >= 70
                                        ? 'stroke-green-500'
                                        : currentScore >= 50
                                            ? 'stroke-yellow-500'
                                            : 'stroke-red-500'
                                        }`}
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 88}
                                    strokeDashoffset={2 * Math.PI * 88 * (1 - currentScore / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-5xl font-bold text-ink-900">{currentScore}</span>
                                <span className="text-sm text-ink-400">/ 100</span>
                            </div>
                        </div>

                        {isSimulating && (
                            <div className="mt-4 p-3 bg-violet-50 text-violet-700 rounded-lg text-sm animate-pulse">
                                Simulated Score based on intervention
                            </div>
                        )}
                    </div>

                    {/* Key Metrics */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-ink-100 space-y-4">
                        <h3 className="font-semibold text-ink-900">Team Metrics</h3>
                        <div className="flex items-center justify-between p-3 bg-ink-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Users size={20} className="text-blue-500" />
                                <span className="text-ink-600">Team Size</span>
                            </div>
                            <span className="font-bold text-ink-900">{assessment.metrics.teamSize}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-ink-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Award size={20} className="text-green-500" />
                                <span className="text-ink-600">Avg Performance</span>
                            </div>
                            <span className="font-bold text-ink-900">
                                {assessment.metrics.averagePerformance.toFixed(1)}/5
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-ink-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <TrendingUp size={20} className="text-violet-500" />
                                <span className="text-ink-600">Retention Rate</span>
                            </div>
                            <span className="font-bold text-ink-900">
                                {assessment.metrics.retentionRate.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Middle Column: Analysis & Factors */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Analysis */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-ink-100">
                        <div className="flex items-center space-x-2 mb-4">
                            <Zap className="text-yellow-500 fill-current" size={24} />
                            <h2 className="text-xl font-bold text-ink-900">AI Analysis</h2>
                        </div>
                        <p className="text-ink-600 leading-relaxed bg-gradient-to-r from-ink-50 to-white p-4 rounded-xl border border-ink-50">
                            {assessment.aiAnalysis}
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h3 className="font-semibold text-green-700 mb-3 flex items-center">
                                    <CheckCircle size={18} className="mr-2" /> Top Strengths
                                </h3>
                                <ul className="space-y-2">
                                    {assessment.factors.positive.map((factor, i) => (
                                        <li key={i} className="flex items-start text-sm text-ink-600 bg-green-50 p-3 rounded-lg">
                                            <span className="mr-2 text-green-500">•</span>
                                            {factor}
                                        </li>
                                    ))}
                                    {assessment.factors.positive.length === 0 && (
                                        <li className="text-sm text-ink-400 italic">No major strengths identified yet.</li>
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-700 mb-3 flex items-center">
                                    <XCircle size={18} className="mr-2" /> Risk Factors
                                </h3>
                                <ul className="space-y-2">
                                    {assessment.factors.negative.map((factor, i) => (
                                        <li key={i} className="flex items-start text-sm text-ink-600 bg-red-50 p-3 rounded-lg">
                                            <span className="mr-2 text-red-500">•</span>
                                            {factor}
                                        </li>
                                    ))}
                                    {assessment.factors.negative.length === 0 && (
                                        <li className="text-sm text-ink-400 italic">No major risks identified.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Intervention Simulator */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-ink-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-ink-900">What-If Intervention Simulator</h2>
                                <p className="text-sm text-ink-500">
                                    Select an action to see its predicted impact on the effectiveness score.
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveIntervention(null)}
                                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${!isSimulating
                                    ? 'bg-ink-900 text-white shadow-md'
                                    : 'bg-white text-ink-500 border border-ink-200 hover:bg-ink-50'
                                    }`}
                            >
                                Current State
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {assessment.suggestedInterventions.map((intervention, index) => {
                                const diff = intervention.predictedScore - assessment.overallScore;
                                const isActive = activeIntervention === index;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setActiveIntervention(isActive ? null : index)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${isActive
                                            ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                                            : 'border-ink-200 hover:border-violet-300 hover:bg-ink-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className={`font-semibold ${isActive ? 'text-violet-900' : 'text-ink-900'}`}>
                                                    {intervention.action}
                                                </h4>
                                                <p className={`text-sm mt-1 ${isActive ? 'text-violet-700' : 'text-ink-500'}`}>
                                                    {intervention.explanation}
                                                </p>
                                            </div>
                                            <div className="text-right pl-4">
                                                <div className="text-sm text-ink-400">Projected Score</div>
                                                <div className={`text-2xl font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {intervention.predictedScore}
                                                    <span className="text-sm font-medium ml-1">
                                                        ({diff > 0 ? '+' : ''}{diff})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                            {assessment.suggestedInterventions.length === 0 && (
                                <div className="p-4 text-center text-ink-400 italic border border-dashed border-ink-200 rounded-lg">
                                    No automated interventions suggested for this profile.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
