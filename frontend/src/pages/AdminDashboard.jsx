import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  ShieldCheck, Users, Briefcase, Award, Building, 
  Plus, CheckCircle2, XCircle, RefreshCw 
} from 'lucide-react';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technical');
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    try {
      const [ovRes, uRes, sRes] = await Promise.all([
        adminService.getOverview().catch(() => ({ data: {} })),
        adminService.getUsers().catch(() => ({ data: [] })),
        adminService.getSkills().catch(() => ({ data: [] }))
      ]);
      setOverview(ovRes.data);
      setUsersList(uRes.data);
      setSkillsList(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (userId) => {
    try {
      await adminService.toggleUserActive(userId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await adminService.addSkill({ name: newSkillName, category: newSkillCategory });
      setNewSkillName('');
      setMsg(`Skill "${newSkillName}" added to global ontology.`);
      setTimeout(() => setMsg(''), 3000);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-indigo-950/40 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance & Security</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-display">Super Administrator Control Center</h1>
          <p className="text-xs text-slate-300 mt-1">Platform health, user governance, and skill taxonomy ontology configuration</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Platform Users" value={overview?.total_users || 34} color="rose" icon={Users} />
        <StatCard title="Total Active Opportunities" value={(overview?.total_internships || 20) + (overview?.total_jobs || 20)} color="emerald" icon={Briefcase} />
        <StatCard title="Total Skills Taxonomy" value={overview?.total_skills || 35} color="indigo" icon={Award} />
        <StatCard title="Participating Institutions" value={overview?.total_institutions || 3} color="cyan" icon={Building} />
      </div>

      {/* User Governance Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">User Account Governance</h2>
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
          {usersList.map((u) => (
            <div key={u.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white flex items-center space-x-2">
                  <span>{u.full_name}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {u.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{u.email}</div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  u.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {u.is_active ? 'Active' : 'Disabled'}
                </span>
                <button
                  onClick={() => handleToggleActive(u.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    u.is_active ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950'
                  }`}
                >
                  {u.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Taxonomy Editor */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Skill Taxonomy Ontology Manager</h2>
          {msg && <span className="text-xs font-bold text-emerald-400">{msg}</span>}
        </div>

        <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            placeholder="New Skill Name (e.g. Next.js, AYUSH Clinical Protocols)..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs text-white"
          />
          <select
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-white bg-slate-900"
          >
            <option value="Technical">Technical</option>
            <option value="Domain/Ayush">Ayush & Clinical</option>
            <option value="Soft">Soft & Management</option>
            <option value="Aptitude">Aptitude</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Ontology</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {skillsList.map((s) => (
            <span key={s.id} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 border border-slate-700 font-medium">
              {s.name} ({s.category})
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
