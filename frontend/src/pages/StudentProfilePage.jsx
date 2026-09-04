import React, { useState, useEffect } from 'react';
import { studentService } from '../services/api';
import { 
  UserCheck, Plus, Trash2, Globe, Github, Award, CheckCircle2, 
  FolderGit2, FileCheck, Save, Sparkles, AlertCircle 
} from 'lucide-react';

const StudentProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Modals for adding items
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ skill_name: '', proficiency_level: 'Intermediate', score: 75, category: 'Technical' });

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', tech_stack: '', github_url: '', live_url: '', start_date: '2026-01', end_date: '2026-05' });

  const [showCertModal, setShowCertModal] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', issuer: '', issue_date: '2026-02', credential_url: '' });

  const loadProfile = async () => {
    try {
      const res = await studentService.getProfile();
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await studentService.updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        college: profile.college,
        course: profile.course,
        branch: profile.branch,
        graduation_year: profile.graduation_year,
        career_interest: profile.career_interest,
        preferred_locations: profile.preferred_locations,
        bio: profile.bio,
        cgpa: profile.cgpa
      });
      setMsg('Profile updated successfully!');
      loadProfile();
    } catch (err) {
      console.error(err);
      setMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await studentService.addSkill(newSkill);
      setShowSkillModal(false);
      setNewSkill({ skill_name: '', proficiency_level: 'Intermediate', score: 75, category: 'Technical' });
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await studentService.deleteSkill(id);
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await studentService.addProject(newProject);
      setShowProjectModal(false);
      setNewProject({ title: '', description: '', tech_stack: '', github_url: '', live_url: '', start_date: '2026-01', end_date: '2026-05' });
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await studentService.deleteProject(id);
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    try {
      await studentService.addCertification(newCert);
      setShowCertModal(false);
      setNewCert({ title: '', issuer: '', issue_date: '2026-02', credential_url: '' });
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCert = async (id) => {
    try {
      await studentService.deleteCertification(id);
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading student profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display">Student Profile & Portfolio</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your academic credentials, verified skills, and portfolio projects</p>
        </div>
        <a
          href={`/portfolio/${profile?.user_id || 1}`}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5 transition"
        >
          <Globe className="w-4 h-4" />
          <span>View Public Portfolio</span>
        </a>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleProfileSave} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Personal & Academic Details</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={profile?.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <input
              type="email"
              disabled
              value={profile?.email || ''}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs opacity-60 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
            <input
              type="tel"
              value={profile?.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">College / University</label>
            <input
              type="text"
              value={profile?.college || ''}
              onChange={(e) => setProfile({ ...profile, college: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Course & Branch</label>
            <input
              type="text"
              value={profile?.branch || ''}
              onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">CGPA (out of 10)</label>
            <input
              type="number"
              step="0.1"
              value={profile?.cgpa || 8.0}
              onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Career Role</label>
            <input
              type="text"
              value={profile?.career_interest || ''}
              onChange={(e) => setProfile({ ...profile, career_interest: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Locations</label>
            <input
              type="text"
              value={profile?.preferred_locations || ''}
              onChange={(e) => setProfile({ ...profile, preferred_locations: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Bio</label>
          <textarea
            rows={3}
            value={profile?.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full glass-input rounded-xl px-3 py-2 text-xs"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Skills Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Skills & Verified Competencies</h2>
            <p className="text-xs text-slate-400">Add technical and soft skills to improve AI opportunity matching</p>
          </div>
          <button
            onClick={() => setShowSkillModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold transition flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {profile?.skills?.map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-white">{s.name}</span>
                  {s.verified && <CheckCircle2 className="w-3 h-3 text-emerald-400" title="Verified by Assessment" />}
                </div>
                <span className="text-[10px] text-slate-400">{s.proficiency_level} • Score: {s.score}%</span>
              </div>
              <button
                onClick={() => handleDeleteSkill(s.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Featured Projects</h2>
            <p className="text-xs text-slate-400">Showcase your hands-on development and research projects</p>
          </div>
          <button
            onClick={() => setShowProjectModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-xs font-bold transition flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="space-y-3">
          {profile?.projects?.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{p.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{p.description}</p>
                <div className="text-[11px] text-emerald-400 font-semibold mt-2">Tech: {p.tech_stack}</div>
                <div className="flex items-center space-x-3 mt-2 text-xs">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center space-x-1">
                      <Github className="w-3.5 h-3.5" />
                      <span>Code Repository</span>
                    </a>
                  )}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteProject(p.id)}
                className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Certifications & Credentials</h2>
            <p className="text-xs text-slate-400">Industry & government verified certifications (NPTEL, SWAYAM, Coursera)</p>
          </div>
          <button
            onClick={() => setShowCertModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold transition flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certification</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile?.certifications?.map((c) => (
            <div key={c.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-1">
                  <span>{c.title}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-400">{c.issuer} • Issued {c.issue_date}</div>
              </div>
              <button
                onClick={() => handleDeleteCert(c.id)}
                className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddSkill} className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 bg-slate-900">
            <h3 className="text-sm font-bold text-white mb-4">Add Skill to Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, SQL, AYUSH Informatics"
                  value={newSkill.skill_name}
                  onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proficiency Level</label>
                <select
                  value={newSkill.proficiency_level}
                  onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                >
                  <option value="Beginner">Beginner (50%)</option>
                  <option value="Intermediate">Intermediate (75%)</option>
                  <option value="Advanced">Advanced (88%)</option>
                  <option value="Expert">Expert (95%)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-5">
              <button
                type="button"
                onClick={() => setShowSkillModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Save Skill
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddProject} className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-700 bg-slate-900 space-y-3">
            <h3 className="text-sm font-bold text-white mb-2">Add Portfolio Project</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Clinical Trial Predictive Analytics Portal"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                required
                placeholder="Describe project problem, methodology, and outcome..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tech Stack</label>
              <input
                type="text"
                required
                placeholder="Python, FastAPI, Scikit-Learn, React"
                value={newProject.tech_stack}
                onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={newProject.github_url}
                  onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Live URL</label>
                <input
                  type="url"
                  placeholder="https://myproject.demo"
                  value={newProject.live_url}
                  onChange={(e) => setNewProject({ ...newProject, live_url: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-bold text-xs"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddCert} className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 bg-slate-900 space-y-3">
            <h3 className="text-sm font-bold text-white mb-2">Add Certification</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Certification Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Certified AyurInformatics Specialist"
                value={newCert.title}
                onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issuing Body</label>
              <input
                type="text"
                required
                placeholder="All India Institute of Ayurveda / NPTEL / SWAYAM"
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Credential Link (Optional)</label>
              <input
                type="url"
                placeholder="https://nptel.ac.in/verify/..."
                value={newCert.credential_url}
                onChange={(e) => setNewCert({ ...newCert, credential_url: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Save Certification
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default StudentProfilePage;
