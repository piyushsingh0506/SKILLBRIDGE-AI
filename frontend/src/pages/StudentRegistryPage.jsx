import React, { useState, useEffect } from 'react';
import { institutionService } from '../services/api';
import { 
  Users, Search, Filter, CheckCircle2, Award, 
  ChevronRight, Globe, AlertCircle 
} from 'lucide-react';

const StudentRegistryPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('All');
  const [placementStatus, setPlacementStatus] = useState('All');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await institutionService.getStudents({
        department: department !== 'All' ? department : undefined,
        placement_status: placementStatus !== 'All' ? placementStatus : undefined
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department, placementStatus]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">Institutional Student Registry</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Monitor verified academic performance, skill assessments, and recruitment readiness across departments
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="glass-input rounded-xl px-3 py-1.5 text-xs font-semibold text-white bg-slate-900"
            >
              <option value="All">All Departments</option>
              <option value="Analytics">Healthcare Data Analytics</option>
              <option value="Computer">Computer Science & AI</option>
              <option value="Dravyaguna">Ayurvedic Pharmacology / BAMS</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Placement Status</label>
            <select
              value={placementStatus}
              onChange={(e) => setPlacementStatus(e.target.value)}
              className="glass-input rounded-xl px-3 py-1.5 text-xs font-semibold text-white bg-slate-900"
            >
              <option value="All">All Statuses</option>
              <option value="Ready">Placement-Ready</option>
              <option value="Needs Training">Needs Skill Training</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading student registry...</div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Discipline</th>
                  <th className="p-4">Academic CGPA</th>
                  <th className="p-4">Skill Score</th>
                  <th className="p-4">Placement Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.full_name}`}
                          alt={s.full_name}
                          className="w-8 h-8 rounded-full bg-slate-800 ring-1 ring-emerald-500/30"
                        />
                        <div>
                          <div className="font-bold text-white">{s.full_name}</div>
                          <div className="text-[11px] text-slate-400">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{s.branch}</td>
                    <td className="p-4 text-slate-200 font-bold">{s.cgpa} / 10</td>
                    <td className="p-4">
                      <span className="font-extrabold text-emerald-400">{s.overall_skill_score}%</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        s.placement_ready
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {s.placement_ready ? 'Ready' : 'In Training'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={`/portfolio/${s.user_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 border border-emerald-500/30 inline-flex items-center space-x-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Portfolio</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentRegistryPage;
