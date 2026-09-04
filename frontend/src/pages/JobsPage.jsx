import React, { useState, useEffect } from 'react';
import { opportunityService } from '../services/api';
import MatchScoreBadge from '../components/MatchScoreBadge';
import OpportunityModal from '../components/OpportunityModal';
import { 
  Briefcase, Search, MapPin, DollarSign, Filter, Building2, ChevronRight, CheckCircle2 
} from 'lucide-react';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [selectedOpp, setSelectedOpp] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await opportunityService.getJobs({
        search: search || undefined,
        work_mode: workMode !== 'All' ? workMode : undefined
      });
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workMode]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">Full-Time Career Opportunities</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Verified industry placements matched to your verified skillset and academic credentials
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by job title, skills, or hiring partner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-white bg-slate-900"
          >
            <option value="All">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
          <button
            onClick={fetchJobs}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading job postings...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{job.company_name}</span>
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{job.location}</span>
                      </span>
                    </div>
                  </div>
                  <MatchScoreBadge score={job.match_score || 82} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition mb-1.5">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {job.required_skills?.split(',').slice(0, 3).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-indigo-400 block">{job.salary_range}</span>
                  <span className="text-[10px] text-slate-400">{job.job_type} • {job.work_mode}</span>
                </div>
                <button
                  onClick={() => setSelectedOpp(job)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white font-bold text-xs transition"
                >
                  View & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOpp && (
        <OpportunityModal
          opportunity={selectedOpp}
          type="job"
          onClose={() => setSelectedOpp(null)}
        />
      )}

    </div>
  );
};

export default JobsPage;
