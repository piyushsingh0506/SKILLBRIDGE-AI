import React from 'react';
import { 
  GraduationCap, Briefcase, Building, ShieldCheck, 
  Sparkles, ArrowRight, CheckCircle2 
} from 'lucide-react';

const QuickLoginModal = ({ onSelectDemo, onClose }) => {
  const demoProfiles = [
    {
      role: 'student',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@aiia.gov.in',
      password: 'password123',
      title: 'B.Tech & AyurInformatics Scholar',
      org: 'All India Institute of Ayurveda',
      icon: GraduationCap,
      badge: 'Student Portal',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400'
    },
    {
      role: 'industry',
      name: 'Dabur AyurTech India',
      email: 'hr@dabur-ayurtech.com',
      password: 'password123',
      title: 'Head of Talent Acquisition & AI Labs',
      org: 'Dabur Healthcare & AI Labs',
      icon: Briefcase,
      badge: 'Industry Portal',
      color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-400'
    },
    {
      role: 'academician',
      name: 'Dr. Rajesh Verma',
      email: 'dr.rajesh.verma@aiia.gov.in',
      password: 'password123',
      title: 'Professor & Head of Ayurvedic Informatics',
      org: 'All India Institute of Ayurveda',
      icon: GraduationCap,
      badge: 'Academician Portal',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400'
    },
    {
      role: 'institution',
      name: 'All India Institute of Ayurveda',
      email: 'admin@aiia.ac.in',
      password: 'password123',
      title: 'Dean of Academic Affairs & Training',
      org: 'Ministry of Ayush, Govt. of India',
      icon: Building,
      badge: 'Institution Dashboard',
      color: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/40 text-cyan-400'
    },
    {
      role: 'admin',
      name: 'Super Administrator',
      email: 'admin@academia-industry.gov.in',
      password: 'password123',
      title: 'CTO & Platform Governance',
      org: 'Smart India Hackathon 2026',
      icon: ShieldCheck,
      badge: 'Super Admin Portal',
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/40 text-rose-400'
    }
  ];

  return (
    <div className="p-4 sm:p-6 rounded-2xl glass-panel border border-slate-700/80 max-w-2xl w-full mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">1-Click Hackathon Demo Login</h3>
            <p className="text-xs text-slate-400">Select any stakeholder to experience their specialized dashboard instantly</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {demoProfiles.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.role}
              onClick={() => onSelectDemo(p.email, p.password)}
              className={`p-3.5 rounded-xl text-left bg-gradient-to-br ${p.color} border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700">
                    {p.badge}
                  </span>
                  <Icon className="w-4 h-4 opacity-80 group-hover:scale-110 transition" />
                </div>
                <div className="mt-2 text-sm font-bold text-white group-hover:text-emerald-300 transition">
                  {p.name}
                </div>
                <div className="text-[11px] text-slate-300">{p.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{p.org}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-300 group-hover:text-white">
                <span>Login as {p.role}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickLoginModal;
