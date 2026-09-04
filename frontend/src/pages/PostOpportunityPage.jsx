import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunityService } from '../services/api';
import { 
  Briefcase, PlusCircle, CheckCircle2, ArrowRight, DollarSign, 
  MapPin, Clock, Users, Calendar 
} from 'lucide-react';

const PostOpportunityPage = ({ defaultType = 'internship' }) => {
  const navigate = useNavigate();
  const [oppType, setOppType] = useState(defaultType);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    preferred_skills: '',
    stipend: '₹25,000/month',
    salary_range: '₹10 - 16 LPA',
    duration_months: 6,
    experience_years: '0-2 Years',
    qualification: 'B.Tech / BAMS / MCA',
    location: 'New Delhi / Remote',
    work_mode: 'Hybrid',
    job_type: 'Full-time',
    openings: 3,
    deadline: '2026-11-30'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (oppType === 'internship') {
        await opportunityService.createInternship({
          title: form.title,
          description: form.description,
          required_skills: form.required_skills,
          preferred_skills: form.preferred_skills,
          stipend: form.stipend,
          duration_months: parseInt(form.duration_months),
          location: form.location,
          work_mode: form.work_mode,
          openings: parseInt(form.openings),
          deadline: form.deadline
        });
      } else {
        await opportunityService.createJob({
          title: form.title,
          description: form.description,
          required_skills: form.required_skills,
          preferred_skills: form.preferred_skills,
          salary_range: form.salary_range,
          experience_years: form.experience_years,
          qualification: form.qualification,
          location: form.location,
          job_type: form.job_type,
          work_mode: form.work_mode,
          openings: parseInt(form.openings),
          deadline: form.deadline
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/industry/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">
          Post {oppType === 'internship' ? 'Internship' : 'Job Opportunity'}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Define competency criteria for automated AI candidate matching and talent pipeline indexing
        </p>
      </div>

      {/* Type Toggle */}
      <div className="flex rounded-xl glass-panel p-1 border border-slate-800 max-w-xs">
        <button
          type="button"
          onClick={() => setOppType('internship')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
            oppType === 'internship' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Internship
        </button>
        <button
          type="button"
          onClick={() => setOppType('job')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
            oppType === 'job' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Full-Time Job
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Opportunity published successfully! Indexed into AI candidate matching pool.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Position / Role Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Clinical Data Analyst / Ayurvedic ML Engineer"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Role Description & Responsibilities</label>
          <textarea
            rows={4}
            required
            placeholder="Outline the core responsibilities, clinical trial scope, tech stack, and learning outcomes..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full glass-input rounded-xl p-3 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Required Skills (Comma-separated)
            </label>
            <input
              type="text"
              required
              placeholder="Python, SQL, Power BI, GCP Trials"
              value={form.required_skills}
              onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Preferred Skills (Optional)
            </label>
            <input
              type="text"
              placeholder="React, Docker, AYUSH Informatics"
              value={form.preferred_skills}
              onChange={(e) => setForm({ ...form, preferred_skills: e.target.value })}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {oppType === 'internship' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Stipend</label>
              <input
                type="text"
                value={form.stipend}
                onChange={(e) => setForm({ ...form, stipend: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Annual Salary Range</label>
              <input
                type="text"
                value={form.salary_range}
                onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Mode</label>
            <select
              value={form.work_mode}
              onChange={(e) => setForm({ ...form, work_mode: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
            >
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Open Positions</label>
            <input
              type="number"
              min="1"
              value={form.openings}
              onChange={(e) => setForm({ ...form, openings: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Application Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/industry/dashboard')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || success}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Publishing...' : 'Publish Opportunity'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default PostOpportunityPage;
