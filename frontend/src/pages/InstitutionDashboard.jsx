import React, { useState, useEffect } from 'react';
import { institutionService } from '../services/api';
import StatCard from '../components/StatCard';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { 
  Building, Users, Award, TrendingUp, BarChart3, 
  Layers, CheckCircle2, Sparkles, Filter 
} from 'lucide-react';

const InstitutionDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    institutionService.getAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#38BDF8'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-indigo-950/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Institutional Quality & Placement Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Institutional Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time student skill assessment monitoring, curriculum gap detection vs industry demand, and centralized placement analytics.
          </p>
        </div>

        <a
          href="/institution/students"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition flex items-center space-x-1.5"
        >
          <Users className="w-4 h-4" />
          <span>Inspect Student Registry</span>
        </a>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Students"
          value={data?.total_students || 34}
          color="cyan"
          icon={Users}
        />
        <StatCard
          title="Skill Assessment Completion"
          value={`${data?.assessment_completion_rate || 84.5}%`}
          color="emerald"
          icon={CheckCircle2}
          trend="+8.2%"
        />
        <StatCard
          title="Avg Institutional Skill Score"
          value={`${data?.average_skill_score || 76.2}%`}
          color="indigo"
          icon={Award}
        />
        <StatCard
          title="Placement-Ready Candidates"
          value={data?.placement_ready_students || 24}
          subtitle="Meets all industry benchmarks"
          color="amber"
          icon={TrendingUp}
        />
      </div>

      {/* Chart Row 1: Top Demanded Skills vs Student Proficiency & Skill Gap Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Demanded Skills vs Proficiency (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Industry Skill Demand vs Student Proficiency
              </h2>
              <p className="text-xs text-slate-400">Comparing real-time recruiter requirements with verified campus scores</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.top_demanded_skills || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar name="Industry Demand Index" dataKey="industry_demand" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar name="Campus Avg Score" dataKey="student_proficiency" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Gap Distribution (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            Curriculum Skill Gap Distribution
          </h2>
          <p className="text-xs text-slate-400 mb-4">Percentage of student cohort lacking target competence</p>

          <div className="space-y-3">
            {data?.skill_gap_distribution?.map((g, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-white">{g.category}</span>
                  <span className={`font-extrabold ${g.priority === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {g.gap_percentage}% Gap ({g.priority} Priority)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${g.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${g.gap_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Chart Row 2: Placement Trend & Hiring Sectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Placement Progression Trend (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            Recruitment & Placement Growth Trend
          </h2>
          <p className="text-xs text-slate-400 mb-4">Monthly shortlisting and final job selections across institutions</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.placement_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" name="Shortlisted" dataKey="shortlisted" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" name="Final Placements" dataKey="placed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Hiring Sectors (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Recruiter Sector Distribution
            </h2>
            <p className="text-xs text-slate-400 mb-2">Dominant industry domains hiring on platform</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.industry_hiring_sectors || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(data?.industry_hiring_sectors || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            {(data?.industry_hiring_sectors || []).map((entry, index) => (
              <div key={index} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-300 font-medium truncate">{entry.name}: <strong>{entry.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default InstitutionDashboard;
