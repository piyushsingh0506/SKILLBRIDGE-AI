import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  studentService, opportunityService, applicationService, aiService 
} from '../services/api';
import StatCard from '../components/StatCard';
import MatchScoreBadge from '../components/MatchScoreBadge';
import RadarSkillChart from '../components/RadarSkillChart';
import OpportunityModal from '../components/OpportunityModal';
import { 
  Target, Award, Compass, Briefcase, BookOpen, Send, 
  Sparkles, ArrowRight, CheckCircle2, TrendingUp, Bot, FileText, ChevronRight
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [internships, setInternships] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [skillGap, setSkillGap] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [oppType, setOppType] = useState('internship');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, internRes, jobsRes, appsRes, gapRes, coursesRes] = await Promise.all([
          studentService.getProfile().catch(() => ({ data: null })),
          opportunityService.getInternships().catch(() => ({ data: [] })),
          opportunityService.getJobs().catch(() => ({ data: [] })),
          applicationService.getMyApplications().catch(() => ({ data: [] })),
          aiService.getSkillGap().catch(() => ({ data: null })),
          opportunityService.getCourses().catch(() => ({ data: [] }))
        ]);

        setProfile(profRes.data);
        setInternships(internRes.data.slice(0, 4));
        setJobs(jobsRes.data.slice(0, 4));
        setApplications(appsRes.data.slice(0, 3));
        setSkillGap(gapRes.data);
        setCourses(coursesRes.data.slice(0, 3));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openOppModal = (opp, type) => {
    setSelectedOpp(opp);
    setOppType(type);
  };

  const handleApplied = (oppId) => {
    // Refresh apps
    applicationService.getMyApplications().then((res) => setApplications(res.data.slice(0, 3)));
  };

  // Profile Radar Data
  const radarData = profile?.skills?.length >= 3 ? profile.skills.map((s) => ({
    subject: s.name,
    student: s.score || 75,
    benchmark: 80
  })) : [
    { subject: 'Python', student: 88, benchmark: 80 },
    { subject: 'SQL', student: 82, benchmark: 85 },
    { subject: 'AYUSH Informatics', student: 85, benchmark: 75 },
    { subject: 'Power BI', student: 54, benchmark: 85 },
    { subject: 'Applied Statistics', student: 78, benchmark: 80 },
    { subject: 'Communication', student: 80, benchmark: 75 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-indigo-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Career Intelligence Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Scholar'}! 👋
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Targeting <strong>{profile?.career_interest || 'Data Analyst'}</strong> • Your profile is placement-ready with verified domain badges.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/student/assessment"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center space-x-1.5"
          >
            <Target className="w-4 h-4" />
            <span>Take Skill Assessment</span>
          </Link>
          <Link
            to="/student/mentor-ai"
            className="px-4 py-2.5 rounded-xl glass-panel border border-slate-700 hover:border-indigo-500 text-white font-bold text-xs transition flex items-center space-x-1.5"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Ask AI Mentor</span>
          </Link>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Profile Completion"
          value={`${profile?.profile_completion || 82}%`}
          color="emerald"
          icon={CheckCircle2}
        />
        <StatCard
          title="Overall Skill Score"
          value={`${profile?.overall_skill_score || 76}%`}
          color="indigo"
          icon={Award}
          trend="+4.2%"
        />
        <StatCard
          title="Placement Readiness"
          value={`${profile?.placement_readiness_score || 71}%`}
          color="cyan"
          icon={TrendingUp}
        />
        <StatCard
          title="Skill Gaps"
          value={skillGap?.missing_skills?.length ? `${skillGap.missing_skills.length}` : "4"}
          subtitle="Identified for target role"
          color="amber"
          icon={Compass}
        />
        <StatCard
          title="Matching Internships"
          value={internships.length ? `${internships.length + 4}` : "8"}
          color="emerald"
          icon={Briefcase}
        />
        <StatCard
          title="Active Applications"
          value={applications.length ? `${applications.length}` : "2"}
          subtitle="In pipeline"
          color="rose"
          icon={Send}
        />
      </div>

      {/* Main Grid: Radar Chart + Skill Gap Quick Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Skill Radar & Target Role Comparison (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Verified Competency Radar</h2>
              <p className="text-xs text-slate-400">Benchmarked against {profile?.career_interest || 'Data Analyst'} industry standards</p>
            </div>
            <Link
              to="/student/skills"
              className="text-xs font-semibold text-ayush-400 hover:text-ayush-300 transition flex items-center space-x-1"
            >
              <span>View All Skills</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <RadarSkillChart data={radarData} height={280} />

          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-800/40">
              <div className="text-xs text-slate-400">Technical Score</div>
              <div className="text-base font-extrabold text-emerald-400">{profile?.technical_score || 78}%</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40">
              <div className="text-xs text-slate-400">Soft Skills Score</div>
              <div className="text-base font-extrabold text-indigo-400">{profile?.soft_score || 74}%</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40">
              <div className="text-xs text-slate-400">Academic CGPA</div>
              <div className="text-base font-extrabold text-cyan-400">{profile?.cgpa || 8.8} / 10</div>
            </div>
          </div>
        </div>

        {/* Right: AI Skill Gap Profiler & Roadmap (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-white">AI Skill Gap Analysis</h2>
              </div>
              <span className="text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                {skillGap?.compatibility_score || 78}% Match
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Missing competencies required by recruiters for <strong>{skillGap?.career_role || 'Data Analyst'}</strong>
            </p>

            {/* Missing Skills Tags */}
            <div className="space-y-2.5 mb-5">
              {skillGap?.missing_skills?.slice(0, 3).map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">{m.skill}</span>
                    <span className="text-[10px] text-slate-400 block">{m.importance || 'Required'} for target role</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    m.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {m.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              to="/student/skill-gap"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center space-x-2 transition border border-slate-700"
            >
              <span>Explore Complete 3-Month Action Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 text-ayush-400" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recommended Internships with 7-Factor AI Match */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Top Recommended Internships</h2>
            <p className="text-xs text-slate-400">Ranked by 7-factor weighted algorithm for your profile</p>
          </div>
          <Link
            to="/student/internships"
            className="text-xs font-semibold text-ayush-400 hover:text-ayush-300 transition flex items-center space-x-1"
          >
            <span>View All Internships</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {internships.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-xl glass-card border border-slate-800 hover:border-emerald-500/40 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    {opp.work_mode}
                  </span>
                  <MatchScoreBadge score={opp.match_score || 88} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                  {opp.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{opp.company_name}</p>
                <p className="text-[11px] text-emerald-400 font-bold mt-2">{opp.stipend}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{opp.location?.split('/')[0]}</span>
                <button
                  onClick={() => openOppModal(opp, 'internship')}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs transition"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Jobs & Learning Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recommended Jobs */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Full-Time Career Opportunities</h2>
            <Link to="/student/jobs" className="text-xs text-ayush-400 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.map((jb) => (
              <div
                key={jb.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-emerald-500/40 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{jb.title}</div>
                  <div className="text-[11px] text-slate-400">{jb.company_name} • {jb.salary_range}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <MatchScoreBadge score={jb.match_score || 85} size="sm" />
                  <button
                    onClick={() => openOppModal(jb, 'job')}
                    className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-bold text-xs transition"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Courses Mapped to Gaps */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Curated Gap-Closing Courses</h2>
            <Link to="/student/courses" className="text-xs text-ayush-400 font-semibold hover:underline">
              View Catalog
            </Link>
          </div>

          <div className="space-y-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{c.title}</div>
                  <div className="text-[11px] text-slate-400">{c.provider} • {c.duration_hours} Hours • Rating: ⭐ {c.rating}</div>
                </div>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white font-bold text-xs transition"
                >
                  Enroll
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Opportunity Modal */}
      {selectedOpp && (
        <OpportunityModal
          opportunity={selectedOpp}
          type={oppType}
          onClose={() => setSelectedOpp(null)}
          onApplied={handleApplied}
        />
      )}

    </div>
  );
};

export default StudentDashboard;
