import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/api';
import { 
  Send, Clock, CheckCircle2, Video, Calendar, AlertCircle, 
  Building2, MessageSquare, ChevronRight, Sparkles 
} from 'lucide-react';
import MatchScoreBadge from '../components/MatchScoreBadge';

const ApplicationsTrackerPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await applicationService.getMyApplications();
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Applied':
        return { color: 'bg-blue-500/15 text-blue-300 border-blue-500/30', step: 1 };
      case 'Under Review':
        return { color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', step: 2 };
      case 'Shortlisted':
        return { color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', step: 3 };
      case 'Interview':
        return { color: 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse', step: 4 };
      case 'Selected':
        return { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', step: 5 };
      case 'Rejected':
        return { color: 'bg-rose-500/15 text-rose-300 border-rose-500/30', step: 0 };
      default:
        return { color: 'bg-slate-500/15 text-slate-300 border-slate-500/30', step: 1 };
    }
  };

  const stages = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">My Applications Tracker</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time status tracking for all your submitted internship and job applications
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading application pipeline...</div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800">
          <Send className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No active applications found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Explore matching internships or jobs to apply with 1-click.</p>
          <a
            href="/student/internships"
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center space-x-1"
          >
            <span>Explore Opportunities</span>
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const badge = getStatusBadge(app.status);
            return (
              <div
                key={app.id}
                className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/30 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">{app.opportunity_title}</h2>
                      <p className="text-xs text-slate-400">
                        {app.company_name} • Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MatchScoreBadge score={app.match_score || 85} size="sm" />
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* Pipeline Progress Indicator */}
                {app.status !== 'Rejected' && (
                  <div className="py-4">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0" />
                      {stages.map((stage, idx) => {
                        const isDone = badge.step >= idx + 1;
                        const isCurrent = app.status === stage;
                        return (
                          <div key={stage} className="flex flex-col items-center relative z-10">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                              isDone ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className={`text-[10px] mt-1 font-semibold ${
                              isCurrent ? 'text-emerald-400 font-bold' : isDone ? 'text-slate-200' : 'text-slate-500'
                            }`}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Interview Notice / Feedback */}
                {app.interview_date && (
                  <div className="p-3.5 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span><strong>Interview Scheduled:</strong> {app.interview_date}</span>
                    </div>
                    {app.interview_link && (
                      <a
                        href={app.interview_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-purple-500 text-white font-bold text-xs flex items-center space-x-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meeting</span>
                      </a>
                    )}
                  </div>
                )}

                {app.feedback && (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 flex items-start space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-white">Recruiter Feedback: </span>
                      {app.feedback}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default ApplicationsTrackerPage;
