import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { studentService } from '../services/api';
import RadarSkillChart from '../components/RadarSkillChart';
import { 
  Sparkles, CheckCircle2, Award, FolderGit2, FileCheck, 
  Globe, Github, Share2, Building2, User 
} from 'lucide-react';

const PublicPortfolioPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    studentService.getPublicPortfolio(id || 1)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading verified digital skill portfolio...</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-xs text-slate-400">Portfolio record not found.</div>;
  }

  const radarData = data.skills?.length >= 3 ? data.skills.map((s) => ({
    subject: s.name,
    student: s.score || 80,
    benchmark: 75
  })) : [
    { subject: 'Python', student: 88, benchmark: 80 },
    { subject: 'SQL', student: 82, benchmark: 85 },
    { subject: 'AYUSH Informatics', student: 85, benchmark: 75 },
    { subject: 'GCP Trials', student: 76, benchmark: 80 }
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-indigo-950/40 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.full_name}`}
              alt={data.full_name}
              className="w-20 h-20 rounded-2xl bg-slate-800 ring-2 ring-emerald-500/50 p-1"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-white">{data.full_name}</h1>
                <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified by AIIA</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                {data.course} • {data.branch}
              </p>
              <p className="text-[11px] text-slate-400">
                {data.college} • Class of {data.graduation_year}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copied ? 'Link Copied!' : 'Share Portfolio'}</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Overall Skill Score</span>
              <span className="text-xl font-extrabold text-emerald-400">{data.overall_skill_score}%</span>
            </div>
          </div>
        </div>

        {data.bio && (
          <p className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed italic">
            "{data.bio}"
          </p>
        )}
      </div>

      {/* Verified Skills & Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Verified Skills List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Verified Competency Badges</span>
          </h2>

          <div className="space-y-2">
            {data.skills?.map((s, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>{s.name}</span>
                    {s.verified && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400">{s.category} • {s.level}</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                  {s.score}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Radar */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Competency Radar</h2>
            <p className="text-[11px] text-slate-400">Institutional validation against target industry standards</p>
          </div>
          <RadarSkillChart data={radarData} height={230} />
        </div>

      </div>

      {/* Featured Projects */}
      {data.projects?.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>Portfolio Projects</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.projects.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">{p.title}</h3>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{p.description}</p>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-2">Tech: {p.tech_stack}</div>
                </div>

                <div className="flex items-center space-x-3 mt-3 pt-2 border-t border-slate-800/80 text-xs">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center space-x-1">
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Demo</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Certifications */}
      {data.certifications?.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>Verified Credentials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.certifications.map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>{c.title}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-400">{c.issuer} • {c.issue_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicPortfolioPage;
