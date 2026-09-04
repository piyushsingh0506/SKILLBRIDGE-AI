import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, UserCheck, Target, Award, Compass, BookOpen,
  Briefcase, Send, FolderGit2, FileCheck, FileText, Bot, Users,
  Globe, Settings, PlusCircle, Building2, TrendingUp, BarChart3,
  Layers, ShieldAlert, Zap, Search, BookmarkCheck, CheckSquare
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: UserCheck },
    { to: '/student/assessment', label: 'AI Skill Assessment', icon: Target, badge: 'Live AI' },
    { to: '/student/skills', label: 'My Skills & Radar', icon: Award },
    { to: '/student/skill-gap', label: 'Skill Gap Analysis', icon: Compass, badge: 'Core AI' },
    { to: '/student/career-recommendations', label: 'Career Trajectories', icon: Zap },
    { to: '/student/courses', label: 'Learning Recommendations', icon: BookOpen },
    { to: '/student/internships', label: 'Internships', icon: Briefcase },
    { to: '/student/jobs', label: 'Job Opportunities', icon: Search },
    { to: '/student/applications', label: 'Application Tracker', icon: Send },
    { to: '/student/projects', label: 'Projects Showcase', icon: FolderGit2 },
    { to: '/student/certifications', label: 'Certifications', icon: FileCheck },
    { to: '/student/resume-ai', label: 'Resume AI (ATS)', icon: FileText, badge: 'ATS' },
    { to: '/student/mentor-ai', label: 'AI Career Mentor', icon: Bot, badge: 'Chat' },
    { to: '/student/mentorship', label: 'Faculty & Industry Mentors', icon: Users },
    { to: `/portfolio/${user?.id || 1}`, label: 'Digital Skill Portfolio', icon: Globe }
  ];

  const industryLinks = [
    { to: '/industry/dashboard', label: 'Talent Dashboard', icon: LayoutDashboard },
    { to: '/industry/candidates', label: 'AI Candidate Matcher', icon: Target, badge: '7-Factor' },
    { to: '/industry/post-internship', label: 'Post Internship', icon: PlusCircle },
    { to: '/industry/post-job', label: 'Post Full-time Job', icon: PlusCircle },
    { to: '/industry/applications', label: 'Applicant Pipeline', icon: Send },
    { to: '/industry/collaborations', label: 'R&D Collaboration', icon: Building2 },
    { to: '/industry/mentorship', label: 'Mentorship Programs', icon: Users }
  ];

  const academicianLinks = [
    { to: '/academician/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { to: '/academician/profile', label: 'Academic Profile', icon: UserCheck },
    { to: '/academician/training', label: 'Industrial Training & FDP', icon: BookOpen },
    { to: '/academician/collaborations', label: 'Research & Consultancy', icon: Building2 },
    { to: '/academician/mentorship', label: 'Student Mentorship', icon: Users }
  ];

  const institutionLinks = [
    { to: '/institution/dashboard', label: 'Executive Analytics', icon: BarChart3 },
    { to: '/institution/departments', label: 'Department Benchmarks', icon: Layers },
    { to: '/institution/industry-demand', label: 'Industry Skill Demand', icon: TrendingUp },
    { to: '/institution/students', label: 'Student Registry', icon: Users }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'System Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Governance', icon: ShieldAlert },
    { to: '/admin/skills', label: 'Skill Taxonomy Editor', icon: Award }
  ];

  let links = studentLinks;
  if (role === 'industry') links = industryLinks;
  else if (role === 'academician') links = academicianLinks;
  else if (role === 'institution') links = institutionLinks;
  else if (role === 'admin') links = adminLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 glass-panel border-r border-slate-800/80 bg-slate-950/95 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {role.toUpperCase()} PORTAL
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
                  <span className="truncate">{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between bg-slate-900/40">
          <div>
            <span className="text-white font-semibold">Smart Automation</span>
            <p className="text-[10px] text-slate-400">SIH 2026 • Ayush Dept</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
