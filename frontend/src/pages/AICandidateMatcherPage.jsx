import React, { useState, useEffect } from 'react';
import { industryService, applicationService } from '../services/api';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { 
  Target, Search, Filter, CheckCircle2, XCircle, 
  Eye, Mail, Video, Award, FolderGit2, Sparkles, User 
} from 'lucide-react';

const AICandidateMatcherPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [selectedCand, setSelectedCand] = useState(null);
  const [contactSuccess, setContactSuccess] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await industryService.getRankedCandidates({
        skill_filter: skillFilter || undefined,
        branch_filter: branchFilter !== 'All' ? branchFilter : undefined
      });
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [branchFilter]);

  const handleContactCandidate = (cand) => {
    setContactSuccess(`Invitation & interview schedule link sent to ${cand.email}!`);
    setTimeout(() => setContactSuccess(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-1">
          <Target className="w-4 h-4" />
          <span>7-Factor Weighted Compatibility Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-display">AI Candidate Recommendations</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Pre-assessed scholars scored dynamically across Technical (40%), Soft (10%), Academic (15%), Certifications (10%), Projects (10%), Interest (10%), and Location (5%)
        </p>
      </div>

      {contactSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{contactSuccess}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter candidates by required skill (e.g. Python, GCP, React, SQL)..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCandidates()}
            className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-white bg-slate-900"
          >
            <option value="All">All Disciplines</option>
            <option value="Analytics">Healthcare Data Analytics</option>
            <option value="Computer">Computer Science & AI</option>
            <option value="Dravyaguna">Ayurvedic Pharmacology / BAMS</option>
          </select>
          <button
            onClick={fetchCandidates}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Candidates Table / Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Computing 7-factor candidate scores & ranking pool...</div>
      ) : (
        <div className="space-y-4">
          {candidates.map((cand, idx) => (
            <div
              key={cand.student_id}
              className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/40 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Candidate Info */}
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={cand.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cand.full_name}`}
                      alt={cand.full_name}
                      className="w-14 h-14 rounded-2xl bg-slate-800 ring-2 ring-emerald-500/40 p-0.5"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-emerald-400 text-[10px] font-extrabold flex items-center justify-center border border-slate-700">
                      #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-white">{cand.full_name}</h2>
                      {cand.placement_ready && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Placement Ready
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 font-medium">
                      {cand.college} • {cand.branch}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {cand.course} • Class of {cand.graduation_year} • <strong>{cand.cgpa} CGPA</strong>
                    </p>

                    {/* Top Skills */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {cand.top_skills?.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-emerald-300 font-semibold border border-slate-700">
                          {s}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-400 self-center ml-1">
                        • {cand.projects_count} Projects • {cand.certifications_count} Certifications
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Compatibility Score & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <MatchScoreBadge score={cand.compatibility_score} size="md" />

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedCand(cand)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Breakdown</span>
                    </button>

                    <a
                      href={`/portfolio/${cand.user_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 border border-emerald-500/30"
                    >
                      Portfolio
                    </a>

                    <button
                      onClick={() => handleContactCandidate(cand)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:from-ayush-400 flex items-center space-x-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate 7-Factor Inspection Modal */}
      {selectedCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedCand.full_name}</h3>
                <p className="text-xs text-slate-400">7-Factor AI Match Score Breakdown</p>
              </div>
              <button
                onClick={() => setSelectedCand(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Technical Skills (40%)', val: selectedCand.technical_match, color: 'from-emerald-500 to-teal-400' },
                { label: 'Academic & CGPA (15%)', val: selectedCand.qualification_match, color: 'from-indigo-500 to-purple-400' },
                { label: 'Verified Certifications (10%)', val: selectedCand.certifications_match, color: 'from-amber-500 to-yellow-400' },
                { label: 'Projects & Practical Experience (10%)', val: selectedCand.projects_match, color: 'from-cyan-500 to-blue-400' },
                { label: 'Soft Skills & Communication (10%)', val: selectedCand.soft_match, color: 'from-pink-500 to-rose-400' },
                { label: 'Career Interest Alignment (10%)', val: selectedCand.interest_match, color: 'from-violet-500 to-indigo-400' },
                { label: 'Location & Work-Mode Preference (5%)', val: selectedCand.location_match, color: 'from-emerald-400 to-teal-300' }
              ].map((f, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>{f.label}</span>
                    <span className="font-extrabold text-white">{Math.round(f.val)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${f.color}`} style={{ width: `${f.val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => {
                  handleContactCandidate(selectedCand);
                  setSelectedCand(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs"
              >
                Send Interview Invitation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AICandidateMatcherPage;
