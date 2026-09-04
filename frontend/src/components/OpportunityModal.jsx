import React, { useState } from 'react';
import { 
  X, Briefcase, MapPin, Clock, DollarSign, Users, 
  CheckCircle2, Sparkles, Send, Building2 
} from 'lucide-react';
import MatchScoreBadge from './MatchScoreBadge';
import { applicationService } from '../services/api';

const OpportunityModal = ({ opportunity, type = 'internship', onClose, onApplied }) => {
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!opportunity) return null;

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await applicationService.apply({
        opportunity_type: type,
        opportunity_id: opportunity.id,
        cover_note: coverNote || 'Excited to apply with verified domain competencies.'
      });
      setSuccess(true);
      if (onApplied) onApplied(opportunity.id);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit application. You may have already applied.');
    } finally {
      setSubmitting(false);
    }
  };

  const reqSkills = opportunity.required_skills
    ? opportunity.required_skills.split(',').map((s) => s.trim())
    : [];
  const prefSkills = opportunity.preferred_skills
    ? opportunity.preferred_skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-slate-700 p-6 shadow-2xl bg-slate-900/95">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{opportunity.title}</h2>
              <p className="text-sm font-medium text-emerald-400">{opportunity.company_name || 'Industry Partner'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Match Banner */}
        <div className="my-4">
          <MatchScoreBadge score={opportunity.match_score || 85} size="lg" />
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compensation</span>
            </div>
            <div className="text-xs font-bold text-white truncate">
              {opportunity.stipend || opportunity.salary_range || 'Competitive'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Location</span>
            </div>
            <div className="text-xs font-bold text-white truncate">
              {opportunity.location || 'Remote / Hybrid'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Work Mode</span>
            </div>
            <div className="text-xs font-bold text-white truncate">
              {opportunity.work_mode || 'Hybrid'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Openings</span>
            </div>
            <div className="text-xs font-bold text-white truncate">
              {opportunity.openings || 2} Positions
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Role Overview</h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            {opportunity.description}
          </p>
        </div>

        {/* Skills Breakdown */}
        <div className="mb-6 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {reqSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>

          {prefSkills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preferred Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {prefSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Application Form */}
        <form onSubmit={handleApply} className="pt-4 border-t border-slate-800">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Personalized Note / Statement of Interest (Optional)
            </label>
            <textarea
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight your top projects, verified assessment scores, and why you are the best fit..."
              rows={3}
              className="w-full glass-input rounded-xl p-3 text-xs"
            />
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>Application submitted successfully! Redirecting to tracker...</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit 1-Click Application'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default OpportunityModal;
