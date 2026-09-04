import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/api';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { 
  Send, Users, CheckCircle2, XCircle, Calendar, Video, 
  MessageSquare, ChevronRight, Filter, Search, Globe 
} from 'lucide-react';

const ManageApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ date: '2026-09-22 11:00 AM IST', link: 'https://meet.google.com/talent-interview-room', feedback: 'Shortlisted for preliminary technical & clinical competency round.' });

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getIndustryApplications();
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleUpdateStatus = async (id, status, details = {}) => {
    try {
      await applicationService.updateStatus(id, {
        status: status,
        interview_date: details.date || null,
        interview_link: details.link || null,
        feedback: details.feedback || `Candidate moved to stage: ${status}`
      });
      setSelectedApp(null);
      fetchApps();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = applications.filter((a) => {
    if (stageFilter !== 'All' && a.status !== stageFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">Candidate Recruitment Pipeline</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage applicant stages, schedule virtual interviews, and dispatch placement offers
        </p>
      </div>

      {/* Stage Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map((stage) => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              stageFilter === stage
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading applicant pipeline...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No applications in this stage</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-base font-bold text-white">{app.student_name}</h3>
                  <span className="text-xs text-slate-400 font-medium">({app.student_college})</span>
                  <MatchScoreBadge score={app.match_score} size="sm" />
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Applying for: <strong className="text-indigo-400">{app.opportunity_title}</strong>
                </div>
                {app.cover_note && (
                  <p className="text-xs text-slate-400 mt-1.5 italic line-clamp-1">
                    "{app.cover_note}"
                  </p>
                )}
                {app.interview_date && (
                  <div className="mt-2 text-xs text-purple-300 flex items-center space-x-2 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Interview: {app.interview_date}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/portfolio/${app.student_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center space-x-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </a>

                {app.status === 'Applied' && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-xs font-bold transition"
                  >
                    Shortlist
                  </button>
                )}

                {app.status === 'Shortlisted' && (
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Schedule Interview</span>
                  </button>
                )}

                {app.status === 'Interview' && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'Selected', { feedback: 'Selected for hiring / internship role!' })}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold transition"
                  >
                    Select & Hire
                  </button>
                )}

                {app.status !== 'Rejected' && app.status !== 'Selected' && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'Rejected', { feedback: 'Thank you for applying. We are pursuing candidates with specific domain skillsets.' })}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-white">Schedule Candidate Interview</h3>
            <p className="text-xs text-slate-400">Candidate: {selectedApp.student_name}</p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Interview Date & Time</label>
              <input
                type="text"
                value={interviewForm.date}
                onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Video Meeting Link</label>
              <input
                type="url"
                value={interviewForm.link}
                onChange={(e) => setInterviewForm({ ...interviewForm, link: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Interview Instructions</label>
              <textarea
                rows={2}
                value={interviewForm.feedback}
                onChange={(e) => setInterviewForm({ ...interviewForm, feedback: e.target.value })}
                className="w-full glass-input rounded-xl p-2.5 text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedApp.id, 'Interview', interviewForm)}
                className="px-5 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs"
              >
                Confirm & Notify Candidate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageApplicationsPage;
