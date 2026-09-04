import React, { useState, useEffect } from 'react';
import { collabService } from '../services/api';
import { 
  Building2, PlusCircle, CheckCircle2, DollarSign, Calendar, 
  Award, ArrowRight, ShieldCheck, Sparkles 
} from 'lucide-react';

const ResearchCollaborationPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    domain: 'Ayush & Clinical AI',
    budget: '₹20,00,000',
    duration_months: 18
  });

  const fetchProjects = async () => {
    try {
      const res = await collabService.getResearchProjects();
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await collabService.createResearchProject(form);
      setShowModal(false);
      setForm({ title: '', description: '', domain: 'Ayush & Clinical AI', budget: '₹20,00,000', duration_months: 18 });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display">Industry-Academia R&D Collaborations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Joint scientific research, clinical trial automation, and government-backed innovation grants
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition flex items-center space-x-1"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Proposal</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading research collaborations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {p.domain}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    p.status === 'In Progress' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{p.description}</p>
                
                <div className="text-xs text-slate-400 space-y-1 mb-4">
                  <div>Industry Partner: <strong className="text-white">{p.industry_name}</strong></div>
                  <div>Faculty Principal Investigator: <strong className="text-white">{p.academician_name}</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-emerald-400 block">{p.budget}</span>
                  <span className="text-[10px] text-slate-400">{p.duration_months} Months Timeline</span>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700">
                  Project Dossier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proposal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSubmit} className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-700 bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-white">Submit New R&D Research Proposal</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Proposal Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. AI-Assisted Phytochemical Fingerprinting and QC"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Research Domain</label>
              <input
                type="text"
                required
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="Ayush & Clinical AI / Bioinformatics"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Proposal Summary & Objectives</label>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detail the scientific methodology, equipment required, and expected patent/publication milestones..."
                className="w-full glass-input rounded-xl p-2.5 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Budget</label>
                <input
                  type="text"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Months)</label>
                <input
                  type="number"
                  value={form.duration_months}
                  onChange={(e) => setForm({ ...form, duration_months: parseInt(e.target.value) })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Publish Proposal
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default ResearchCollaborationPage;
