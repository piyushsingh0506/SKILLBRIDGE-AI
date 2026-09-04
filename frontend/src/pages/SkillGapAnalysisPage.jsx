import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiService } from '../services/api';
import { 
  Compass, Target, CheckCircle2, AlertTriangle, XCircle, 
  BookOpen, ArrowRight, Sparkles, ChevronRight, Layers, Award 
} from 'lucide-react';

const SkillGapAnalysisPage = () => {
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const roles = [
    'Data Analyst',
    'Data Scientist',
    'ML Engineer',
    'Full Stack Developer',
    'Backend Developer',
    'Ayurvedic Health Informatics Specialist',
    'Clinical Data Analyst (Ayush & Biotech)',
    'Herbal Drug Standardization Scientist',
    'Cloud & DevOps Engineer',
    'Product Manager (HealthTech / SaaS)'
  ];

  const fetchGapAnalysis = async (role) => {
    setLoading(true);
    try {
      const res = await aiService.getSkillGap(role);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapAnalysis(targetRole);
  }, [targetRole]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>Core AI Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-display">AI Skill Gap Analysis & Profiler</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify exact missing skills, weak competencies, and customized roadmaps for target industry roles
          </p>
        </div>

        {/* Target Role Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Career Role</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="glass-input rounded-xl px-3.5 py-2 text-xs font-bold text-white bg-slate-900 border-slate-700"
          >
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Running AI skill mapping & gap detection pipeline...
        </div>
      ) : (
        <>
          {/* Compatibility Banner */}
          <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-emerald-950/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-extrabold text-xl text-amber-400 font-display">
                {data?.compatibility_score || 78}%
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Compatibility with {targetRole}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Based on verified assessments, projects, and self-reported competencies.
                </p>
              </div>
            </div>

            <Link
              to="/student/courses"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bridge Missing Gaps</span>
            </Link>
          </div>

          {/* 3-Column Skill Breakdown Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Strong Skills */}
            <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/10">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Strong Skills ({data?.strong_skills?.length || 0})</h3>
              </div>

              <div className="space-y-2.5">
                {data?.strong_skills?.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{s.skill}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">{s.importance || 'Required'}</div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20">
                      {s.score}%
                    </span>
                  </div>
                ))}
                {data?.strong_skills?.length === 0 && (
                  <p className="text-xs text-slate-500 py-4 text-center">No strong skills detected yet.</p>
                )}
              </div>
            </div>

            {/* 2. Weak / Needs Improvement Skills */}
            <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 bg-amber-950/10">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Needs Boost ({data?.weak_skills?.length || 0})</h3>
              </div>

              <div className="space-y-2.5">
                {data?.weak_skills?.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{s.skill}</div>
                      <div className="text-[10px] text-amber-400">Target: {s.target_score}%</div>
                    </div>
                    <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/20">
                      {s.score}%
                    </span>
                  </div>
                ))}
                {data?.weak_skills?.length === 0 && (
                  <p className="text-xs text-slate-500 py-4 text-center">No weak skills flagged.</p>
                )}
              </div>
            </div>

            {/* 3. Missing Skills */}
            <div className="p-5 rounded-2xl glass-panel border border-rose-500/30 bg-rose-950/10">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-rose-500/20">
                <XCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Missing Gaps ({data?.missing_skills?.length || 0})</h3>
              </div>

              <div className="space-y-2.5">
                {data?.missing_skills?.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{s.skill}</div>
                      <div className="text-[10px] text-slate-400">{s.importance} • Target: 80%</div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30">
                      {s.priority} Priority
                    </span>
                  </div>
                ))}
                {data?.missing_skills?.length === 0 && (
                  <p className="text-xs text-slate-500 py-4 text-center">No missing skills! You meet all requirements.</p>
                )}
              </div>
            </div>

          </div>

          {/* AI Action Plan & Learning Roadmap */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Personalized AI Action Roadmap</span>
            </h3>

            <div className="space-y-3">
              {data?.action_plan?.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Courses Mapped to Missing Gaps */}
          {data?.recommended_courses?.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recommended Courses Mapped to Your Gaps
                </h3>
                <Link to="/student/courses" className="text-xs text-ayush-400 font-semibold hover:underline">
                  View Full Catalog
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.recommended_courses.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl glass-card border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800">
                        Bridges {c.mapped_skill || 'Skill'}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-2 line-clamp-2">{c.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{c.provider} • {c.duration_hours}h</p>
                    </div>

                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 w-full py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-xs font-bold transition flex items-center justify-center space-x-1"
                    >
                      <span>Start Learning</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </>
      )}

    </div>
  );
};

export default SkillGapAnalysisPage;
