import React, { useState, useEffect } from 'react';
import { opportunityService } from '../services/api';
import MatchScoreBadge from '../components/MatchScoreBadge';
import OpportunityModal from '../components/OpportunityModal';
import { 
  Briefcase, Search, MapPin, Clock, DollarSign, Filter, Building2, ChevronRight 
} from 'lucide-react';

const InternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [selectedOpp, setSelectedOpp] = useState(null);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await opportunityService.getInternships({
        search: search || undefined,
        work_mode: workMode !== 'All' ? workMode : undefined
      });
      setInternships(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [workMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInternships();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">Internship Opportunities</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Explore curated industrial training & internships with real-time 7-factor AI compatibility match scoring
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by role, skills (e.g. Python, GCP, Ayush), or company..."
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
            onClick={fetchInternships}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Internships Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading internships & computing compatibility scores...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internships.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{opp.company_name}</span>
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{opp.location}</span>
                      </span>
                    </div>
                  </div>
                  <MatchScoreBadge score={opp.match_score || 85} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition mb-1.5">
                  {opp.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {opp.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {opp.required_skills?.split(',').slice(0, 3).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-emerald-400 block">{opp.stipend}</span>
                  <span className="text-[10px] text-slate-400">{opp.duration_months} Months • {opp.work_mode}</span>
                </div>
                <button
                  onClick={() => setSelectedOpp(opp)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs transition"
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
          type="internship"
          onClose={() => setSelectedOpp(null)}
        />
      )}

    </div>
  );
};

export default InternshipsPage;
