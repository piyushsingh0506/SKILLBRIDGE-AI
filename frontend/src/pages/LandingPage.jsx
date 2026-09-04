import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, GraduationCap, Briefcase, Building, ShieldCheck, 
  ArrowRight, CheckCircle2, Target, Compass, BookOpen, Send, 
  Bot, Layers, ChevronRight, Play, Star, Users, Award, TrendingUp 
} from 'lucide-react';
import QuickLoginModal from '../components/QuickLoginModal';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const LandingPage = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectDemo = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      login(res.data.access_token, {
        id: res.data.user_id,
        email: res.data.email,
        role: res.data.role,
        full_name: res.data.full_name
      });
      // Navigate to correct portal
      navigate(`/${res.data.role}/dashboard`);
    } catch (err) {
      console.error(err);
    }
  };

  const stakeholders = [
    {
      role: 'Student',
      icon: GraduationCap,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      title: 'Students & Scholars',
      desc: 'Verify skills with AI assessments, analyze skill gaps against target roles, scan resumes for ATS scores, and match with top internships.',
      features: ['AI Skill Gap Radar', 'Resume ATS Scanner', '1-Click Match & Apply', 'AI Career Mentor Chat']
    },
    {
      role: 'Industry',
      icon: Briefcase,
      color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-400',
      title: 'Industry & Recruiters',
      desc: 'Discover pre-assessed candidates ranked by 7-factor weighted AI matching. Post opportunities, schedule interviews, and sponsor R&D.',
      features: ['7-Factor Candidate Matcher', '1-Click Pipeline Management', 'Live Project Sponsorship', 'Direct Faculty Consultancy']
    },
    {
      role: 'Academician',
      icon: Users,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      title: 'Faculty & Academicians',
      desc: 'Access industrial FDPs, joint R&D grants, guest lecture invitations, and mentor next-gen students in health informatics and computing.',
      features: ['Joint Research Collaborations', 'Faculty Development Programs', 'Mentorship Supervision', 'Consultancy Proposals']
    },
    {
      role: 'Institution',
      icon: Building,
      color: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30 text-cyan-400',
      title: 'Institutions & Universities',
      desc: 'Track student skill benchmarking, placement readiness analytics, curriculum gaps against real industry demand, and centralized recruiting.',
      features: ['Skill Gap Distribution Heatmaps', 'Industry Skill Demand Insights', 'Department Benchmarks', 'Placement Analytics']
    }
  ];

  const workflowSteps = [
    { num: '01', name: 'Assess', desc: 'Interactive AI assessment quizzes verify student capabilities in Tech, Ayush, and Aptitude.' },
    { num: '02', name: 'Analyze', desc: 'Identifies strong, weak, and missing competencies vs target industry career benchmarks.' },
    { num: '03', name: 'Learn', desc: 'Recommends curated courses (SWAYAM / NPTEL / Coursera) mapped directly to missing gaps.' },
    { num: '04', name: 'Match', desc: 'Multi-factor algorithm computes real-time compatibility score (e.g. 91% Skill Match).' },
    { num: '05', name: 'Apply', desc: '1-click seamless applications with tailored resume snapshots and portfolio links.' },
    { num: '06', name: 'Track', desc: 'Transparent recruitment pipeline stages: Applied -> Shortlisted -> Interview -> Selected.' },
    { num: '07', name: 'Collaborate', desc: 'Facilitates joint R&D, FDPs, live projects, and faculty mentorship with industries.' },
    { num: '08', name: 'Get Placed', desc: 'Data-driven hiring converting skill readiness into high-impact career opportunities.' }
  ];

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* SIH Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Smart India Hackathon 2026 • Problem Statement 26044</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white max-w-5xl mx-auto leading-tight">
            From Skills to Opportunities — <br />
            <span className="gradient-text">One Connected Ecosystem.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Centralized AI-powered skill mapping, learning, internships, and placement platform 
            connecting <strong>Students, Institutions, Academicians, and Industries</strong> under 
            the Ministry of Ayush & All India Institute of Ayurveda.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 hover:to-emerald-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setShowDemoModal(true)}
              className="px-7 py-3.5 rounded-xl glass-panel border border-slate-700 hover:border-emerald-500/50 text-white font-bold text-sm transition-all hover:bg-slate-800/80 flex items-center space-x-2 shadow-lg"
            >
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Explore 1-Click Demo Portals</span>
            </button>
          </div>

          {/* Demo Modal Trigger */}
          {showDemoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
              <div className="relative w-full max-w-2xl">
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="absolute -top-10 right-0 text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕ Close
                </button>
                <QuickLoginModal onSelectDemo={handleSelectDemo} onClose={() => setShowDemoModal(false)} />
              </div>
            </div>
          )}

          {/* Live Platform Counter Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl glass-card text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">34+</div>
              <div className="text-xs text-slate-400 mt-1">Verified Users & Profiles</div>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-display">94%</div>
              <div className="text-xs text-slate-400 mt-1">AI Match Precision</div>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-display">40+</div>
              <div className="text-xs text-slate-400 mt-1">Internships & Jobs</div>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">35+</div>
              <div className="text-xs text-slate-400 mt-1">Skill Benchmarks</div>
            </div>
          </div>

        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-20 relative border-t border-slate-800/80 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Multi-Stakeholder Architecture</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One Unified Ecosystem for Four Key Pillars
            </h3>
            <p className="text-sm text-slate-400 mt-3">
              Tailored workspaces engineered specifically for Student careers, Industry talent acquisition, Faculty research, and Institutional oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stakeholders.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.role}
                  className={`p-6 rounded-2xl bg-gradient-to-b ${s.color} glass-panel border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between`}
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{s.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{s.desc}</p>
                  </div>

                  <div>
                    <div className="pt-3 border-t border-slate-800/80 space-y-1.5 mb-4">
                      {s.features.map((f, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-[11px] text-slate-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/register"
                      className="w-full py-2 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-white border border-slate-700 flex items-center justify-center space-x-1 transition group"
                    >
                      <span>Join as {s.role}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8-Step Lifecycle Workflow */}
      <section className="py-20 relative border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Connected Lifecycle</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Assess → Analyze → Learn → Match → Apply → Track → Collaborate → Placement
            </h3>
            <p className="text-sm text-slate-400 mt-3">
              A continuous feedback loop turning academic potential into industry-ready capability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step) => (
              <div
                key={step.num}
                className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/40 transition group"
              >
                <div className="text-2xl font-extrabold text-emerald-400 font-display mb-2 group-hover:scale-110 transition">
                  {step.num}
                </div>
                <h4 className="text-base font-bold text-white mb-1.5">{step.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-20 relative border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-4">
                <Bot className="w-3.5 h-3.5" />
                <span>Proprietary AI/ML Pipeline</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                7-Factor Compatibility Matching & Real-Time Skill Gap Profiling
              </h3>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Our intelligent subsystem does not rely on simple keyword search. It evaluates technical skills (40%), soft skills (10%), academic qualification (15%), verified certifications (10%), projects (10%), career interest (10%), and location alignment (5%).
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-xl glass-panel">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Dynamic Skill Gap Detection</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Categorizes skills into Strong, Weak, and Missing with High/Medium/Low priority tags.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl glass-panel">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Resume ATS Scanner & Feedback</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Upload PDF resumes to calculate ATS compatibility score and extract missing industry keywords.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl glass-panel">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Context-Aware AI Career Mentor</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Answers student queries with personalized 3-month roadmaps using their real profile data.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated AI Interface Card */}
            <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 shadow-2xl bg-slate-900/90 relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-white">AI Matching Engine Live Result</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  91% Compatibility
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs font-bold text-slate-200">Target Role: Ayurvedic Healthcare Data Analyst</div>
                  <div className="text-[11px] text-slate-400">Company: Dabur AyurTech India</div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Technical Skills (40% weight)</span>
                      <span className="text-emerald-400 font-bold">92%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Academic & CGPA (15% weight)</span>
                      <span className="text-indigo-400 font-bold">88%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-400" style={{ width: '88%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Projects & Experience (10% weight)</span>
                      <span className="text-cyan-400 font-bold">95%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400" style={{ width: '95%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  <strong>AI Recommendation:</strong> Candidate is placement-ready. Verified in Python, SQL, and AYUSH Health Informatics.
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs">
              AI
            </div>
            <div>
              <span className="text-white font-bold">Academia–Industry Connect</span>
              <p className="text-[11px] text-slate-500">Smart India Hackathon 2026 • Ministry of Ayush</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
            <button onClick={() => setShowDemoModal(true)} className="hover:text-emerald-400 transition">Demo Switcher</button>
            <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-white transition">API Swagger Docs</a>
          </div>

          <div className="text-[11px] text-slate-500">
            © 2026 Academia–Industry Connect Platform. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
