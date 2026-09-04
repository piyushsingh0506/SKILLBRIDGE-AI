import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { industryService, applicationService } from '../services/api';
import StatCard from '../components/StatCard';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { 
  Briefcase, Users, PlusCircle, CheckCircle2, Send, 
  Sparkles, TrendingUp, Building2, ChevronRight, Calendar, Video 
} from 'lucide-react';

const IndustryDashboard = () => {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, candRes, appsRes] = await Promise.all([
        industryService.getDashboardStats().catch(() => ({ data: {} })),
        industryService.getRankedCandidates().catch(() => ({ data: [] })),
        applicationService.getIndustryApplications().catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setCandidates(candRes.data.slice(0, 4));
      setApplications(appsRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await applicationService.updateStatus(appId, {
        status: newStatus,
        feedback: `Status changed to ${newStatus} by recruitment team.`
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-emerald-950/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Talent Pipeline Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Industry Talent Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Streamline pre-assessed campus recruitment and R&D collaboration with premier institutes under the Ministry of Ayush.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/industry/post-internship"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Internship</span>
          </Link>
          <Link
            to="/industry/post-job"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Job</span>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Active Internships"
          value={stats?.active_internships || 12}
          color="emerald"
          icon={Briefcase}
        />
        <StatCard
          title="Active Full-Time Jobs"
          value={stats?.active_jobs || 15}
          color="indigo"
          icon={Briefcase}
        />
        <StatCard
          title="Total Candidate Applicants"
          value={stats?.total_applicants || 24}
          color="cyan"
          icon={Users}
        />
        <StatCard
          title="Shortlisted / Interviews"
          value={stats?.shortlisted_candidates || 14}
          color="amber"
          icon={CheckCircle2}
        />
      </div>

      {/* AI Candidate Recommendations Preview */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Top AI-Ranked Candidate Matches</h2>
            <p className="text-xs text-slate-400">Pre-assessed scholars scored via 7-factor weighted algorithm</p>
          </div>
          <Link
            to="/industry/candidates"
            className="text-xs font-semibold text-ayush-400 hover:text-ayush-300 transition flex items-center space-x-1"
          >
            <span>View All Ranked Candidates</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {candidates.map((cand) => (
            <div
              key={cand.student_id}
              className="p-4 rounded-xl glass-card border border-slate-800 hover:border-emerald-500/40 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <img
                    src={cand.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cand.full_name}`}
                    alt={cand.full_name}
                    className="w-10 h-10 rounded-full bg-slate-800 ring-2 ring-emerald-500/30"
                  />
                  <MatchScoreBadge score={cand.compatibility_score} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                  {cand.full_name}
                </h3>
                <p className="text-[11px] text-slate-400 truncate">{cand.college}</p>
                <p className="text-[11px] text-slate-400">{cand.branch} • {cand.cgpa} CGPA</p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {cand.top_skills?.slice(0, 3).map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={`/portfolio/${cand.user_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-400 hover:underline font-bold"
                >
                  Portfolio
                </a>
                <Link
                  to="/industry/candidates"
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs transition"
                >
                  Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications Pipeline Review */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Recent Candidate Applications</h2>
            <p className="text-xs text-slate-400">Review candidate profiles and trigger status updates</p>
          </div>
          <Link
            to="/industry/applications"
            className="text-xs text-ayush-400 font-semibold hover:underline"
          >
            Manage Pipeline
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80">
          {applications.map((app) => (
            <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">{app.student_name}</h3>
                  <span className="text-[11px] text-slate-400">({app.student_college})</span>
                  <MatchScoreBadge score={app.match_score} size="sm" />
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Applied for: <strong className="text-emerald-400">{app.opportunity_title}</strong>
                </div>
                {app.cover_note && (
                  <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                    "{app.cover_note}"
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {app.status}
                </span>

                {app.status === 'Applied' && (
                  <button
                    onClick={() => handleStatusUpdate(app.id, 'Shortlisted')}
                    className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-xs font-bold transition"
                  >
                    Shortlist
                  </button>
                )}

                {app.status === 'Shortlisted' && (
                  <button
                    onClick={() => handleStatusUpdate(app.id, 'Interview')}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Video className="w-3 h-3" />
                    <span>Interview</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default IndustryDashboard;
