import React, { useState, useEffect } from 'react';
import { aiService } from '../services/api';
import { 
  Zap, TrendingUp, DollarSign, CheckCircle2, XCircle, 
  ArrowRight, Compass, Sparkles 
} from 'lucide-react';
import MatchScoreBadge from '../components/MatchScoreBadge';

const CareerRecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await aiService.getCareerRecommendations();
        setRecommendations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-1">
          <Zap className="w-4 h-4" />
          <span>AI Career Prediction Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-display">Recommended Career Trajectories</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ranked career paths based on your verified skills, academic profile, and industry demand
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Analyzing career trajectory vectors & market compatibility...
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div
              key={rec.role_id || idx}
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {rec.category}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Top AI Recommendation
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                    {rec.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1 justify-end">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{rec.average_salary}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1 justify-end mt-0.5">
                      <TrendingUp className="w-3 h-3 text-indigo-400" />
                      <span>{rec.growth_rate}</span>
                    </div>
                  </div>
                  <MatchScoreBadge score={rec.compatibility_score} size="md" />
                </div>
              </div>

              {/* Skills Overlap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Matching Skills You Possess ({rec.matching_skills?.length || 0})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.matching_skills?.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-xs font-medium border border-emerald-500/25">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Critical Skills to Acquire ({rec.missing_skills?.length || 0})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.missing_skills?.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 text-xs font-medium border border-rose-500/25">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Roadmap */}
              {rec.roadmap && (
                <div className="pt-3 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Fast-Track Transition Steps</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {rec.roadmap.map((step, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-medium">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CareerRecommendationsPage;
