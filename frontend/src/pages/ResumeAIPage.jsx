import React, { useState } from 'react';
import { aiService } from '../services/api';
import { 
  FileText, UploadCloud, CheckCircle2, AlertTriangle, Sparkles, 
  ArrowRight, FileCheck, Layers, Bot, Award 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ResumeAIPage = () => {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file && !resumeText.trim()) {
      setError('Please upload a PDF file or paste your resume text to analyze.');
      return;
    }
    setError('');
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('target_role', targetRole);
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('resume_text', resumeText);
      }

      const res = await aiService.analyzeResume(formData);
      setResult(res.data);
      if (res.data.ats_score >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to process resume. Ensure valid PDF or text format.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-1">
          <FileText className="w-4 h-4" />
          <span>NLP ATS Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-display">Resume AI & ATS Scanner</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Scan your resume against industry benchmarks, measure ATS match score, and uncover missing keywords
        </p>
      </div>

      {/* Upload Box & Role Selector */}
      <form onSubmit={handleAnalyze} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Job Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-2.5 text-xs font-bold text-white bg-slate-900"
            >
              <option value="Data Analyst">Data Analyst</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="ML Engineer">ML Engineer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Ayurvedic Health Informatics Specialist">Ayurvedic Health Informatics Specialist</option>
              <option value="Clinical Data Analyst (Ayush & Biotech)">Clinical Data Analyst (Ayush & Biotech)</option>
              <option value="Herbal Drug Standardization Scientist">Herbal Drug Standardization Scientist</option>
              <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Upload PDF Resume (Optional)</label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Or Paste Resume Content / Summary
          </label>
          <textarea
            rows={4}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your skills, academic background, projects, and work experience here if no PDF is available..."
            className="w-full glass-input rounded-xl p-3 text-xs"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={analyzing}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{analyzing ? 'Scanning Resume & Keywords...' : 'Run AI ATS Scan'}</span>
        </button>
      </form>

      {/* RESULT DASHBOARD */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          {/* ATS Score Card */}
          <div className="p-6 rounded-3xl glass-panel border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-indigo-950/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-extrabold text-3xl text-emerald-400 font-display shadow-lg shadow-emerald-500/10">
                {result.ats_score}%
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  ATS Score Analysis
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  {result.ats_score >= 80 ? 'Strong ATS Alignment' : 'Moderate Match - Optimization Needed'}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Targeted role: <strong>{result.target_role}</strong> • Experience detected: <strong>{result.experience_years_detected} yr(s)</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block mb-1">Detected Credentials:</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {result.education_detected?.map((e, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Matched Keywords */}
            <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Extracted & Matched Skills ({result.extracted_skills?.length || 0})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {result.extracted_skills?.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Industry Keywords */}
            <div className="p-5 rounded-2xl glass-panel border border-rose-500/30">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Missing Industry Keywords ({result.missing_skills?.length || 0})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_skills?.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    {s}
                  </span>
                ))}
                {result.missing_skills?.length === 0 && (
                  <span className="text-xs text-slate-400">All required skills are present in resume!</span>
                )}
              </div>
            </div>

          </div>

          {/* Suggestions & Action Items */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Actionable ATS Improvements</span>
            </h3>

            <div className="space-y-2.5">
              {result.improvement_suggestions?.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start space-x-2.5 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ResumeAIPage;
