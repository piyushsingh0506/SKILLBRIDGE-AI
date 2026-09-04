import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collabService } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  GraduationCap, Building2, BookOpen, Users, PlusCircle, 
  Sparkles, Award, ArrowRight, Video, Calendar, FileText 
} from 'lucide-react';

const AcademicianDashboard = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collabRes, mentorRes] = await Promise.all([
          collabService.getResearchProjects().catch(() => ({ data: [] })),
          collabService.getMentorships().catch(() => ({ data: [] }))
        ]);
        setCollaborations(collabRes.data);
        setMentorships(mentorRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-emerald-950/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Faculty Research & Mentorship Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Academician Innovation Hub
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Drive industry-sponsored R&D grants, participate in advanced Faculty Development Programs (FDPs), and mentor scholars in AyurInformatics.
          </p>
        </div>

        <Link
          to="/academician/collaborations"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition flex items-center space-x-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New R&D Proposal</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Active R&D Projects"
          value={collaborations.length || 4}
          color="amber"
          icon={Building2}
        />
        <StatCard
          title="Total Research Grants"
          value="₹60 Lakhs"
          color="emerald"
          icon={Award}
          trend="+15% YoY"
        />
        <StatCard
          title="Mentees Guided"
          value={mentorships.length ? `${mentorships.length + 8}` : "12"}
          color="indigo"
          icon={Users}
        />
        <StatCard
          title="Industry FDPs Enrolled"
          value="3"
          color="cyan"
          icon={BookOpen}
        />
      </div>

      {/* Research Collaborations Overview */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Active Industry-Academia R&D Projects</h2>
            <p className="text-xs text-slate-400">Collaborative research ventures sponsored by healthcare and tech partners</p>
          </div>
          <Link to="/academician/collaborations" className="text-xs text-ayush-400 font-bold hover:underline">
            View All Projects
          </Link>
        </div>

        <div className="space-y-3">
          {collaborations.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {c.domain} • Partner: {c.industry_name}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{c.description}</p>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">{c.budget}</span>
                  <span className="text-[10px] text-slate-400">{c.duration_months} Months</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  c.status === 'In Progress' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Mentorship Requests */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Student Mentorship Inquiries</h2>
          <Link to="/academician/mentorship" className="text-xs text-ayush-400 font-bold hover:underline">
            Manage Mentees
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80">
          {mentorships.slice(0, 3).map((m) => (
            <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white">{m.mentee_name}</div>
                <div className="text-[11px] text-slate-300 font-medium">{m.topic}</div>
                <div className="text-[10px] text-slate-500">Scheduled: {m.scheduled_time || 'Pending schedule'}</div>
              </div>

              {m.meeting_link && (
                <a
                  href={m.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-purple-500 text-white text-xs font-bold flex items-center space-x-1 self-start sm:self-auto"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Session</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AcademicianDashboard;
