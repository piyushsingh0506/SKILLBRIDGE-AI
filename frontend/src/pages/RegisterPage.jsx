import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { 
  Sparkles, GraduationCap, Briefcase, Building, Users, 
  Mail, Lock, User, Phone, BookOpen, AlertCircle, CheckCircle2, ArrowRight 
} from 'lucide-react';

const RegisterPage = () => {
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Student Fields
  const [studentForm, setStudentForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    college: 'All India Institute of Ayurveda',
    course: 'B.Tech / BAMS',
    branch: 'Healthcare Data Analytics',
    graduation_year: 2026,
    career_interest: 'Data Analyst'
  });

  // Industry Fields
  const [industryForm, setIndustryForm] = useState({
    company_name: '',
    email: '',
    password: '',
    industry_type: 'Ayush & HealthTech',
    company_size: '50-200 employees',
    location: 'New Delhi / Remote',
    website: '',
    description: ''
  });

  // Academician Fields
  const [acadForm, setAcadForm] = useState({
    name: '',
    email: '',
    password: '',
    institution: 'All India Institute of Ayurveda',
    department: 'Ayurvedic Informatics',
    designation: 'Associate Professor',
    phone: '',
    specialization: 'Clinical AI & Pharmacology'
  });

  // Institution Fields
  const [instForm, setInstForm] = useState({
    institution_name: '',
    email: '',
    password: '',
    institution_type: 'Autonomous Apex Institute',
    location: 'Sarita Vihar, New Delhi',
    website: '',
    contact_person: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (role === 'student') {
        res = await authService.registerStudent(studentForm);
      } else if (role === 'industry') {
        res = await authService.registerIndustry(industryForm);
      } else if (role === 'academician') {
        res = await authService.registerAcademician(acadForm);
      } else if (role === 'institution') {
        res = await authService.registerInstitution(instForm);
      }

      if (res?.data?.access_token) {
        login(res.data.access_token, {
          id: res.data.user_id,
          email: res.data.email,
          role: res.data.role,
          full_name: res.data.full_name
        });
        navigate(`/${res.data.role}/dashboard`);
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Please check form fields.');
    } finally {
      setLoading(false);
    }
  };

  const roleTabs = [
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-emerald-400 border-emerald-500' },
    { id: 'industry', label: 'Industry', icon: Briefcase, color: 'text-indigo-400 border-indigo-500' },
    { id: 'academician', label: 'Academician', icon: Users, color: 'text-amber-400 border-amber-500' },
    { id: 'institution', label: 'Institution', icon: Building, color: 'text-cyan-400 border-cyan-500' }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ayush-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <span className="font-display font-extrabold text-2xl text-white">
            Academia<span className="text-ayush-400">–Industry</span> Connect
          </span>
        </Link>
        <p className="text-xs text-slate-400 mt-1">Create your specialized stakeholder account</p>
      </div>

      <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-900/90">
        
        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {roleTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = role === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRole(tab.id)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 text-white shadow-md'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'opacity-70'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. STUDENT REGISTRATION FORM */}
          {role === 'student' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.full_name}
                    onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="rahul@university.edu"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">College / University</label>
                <input
                  type="text"
                  required
                  value={studentForm.college}
                  onChange={(e) => setStudentForm({ ...studentForm, college: e.target.value })}
                  placeholder="All India Institute of Ayurveda / DTU"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course</label>
                  <input
                    type="text"
                    required
                    value={studentForm.course}
                    onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                    placeholder="B.Tech / BAMS"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch / Dept</label>
                  <input
                    type="text"
                    required
                    value={studentForm.branch}
                    onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })}
                    placeholder="Data Analytics / AI"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    required
                    value={studentForm.graduation_year}
                    onChange={(e) => setStudentForm({ ...studentForm, graduation_year: parseInt(e.target.value) })}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Career Interest / Target Role</label>
                <select
                  value={studentForm.career_interest}
                  onChange={(e) => setStudentForm({ ...studentForm, career_interest: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
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
            </>
          )}

          {/* 2. INDUSTRY REGISTRATION FORM */}
          {role === 'industry' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={industryForm.company_name}
                  onChange={(e) => setIndustryForm({ ...industryForm, company_name: e.target.value })}
                  placeholder="e.g. Dabur Healthcare Labs"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={industryForm.email}
                    onChange={(e) => setIndustryForm({ ...industryForm, email: e.target.value })}
                    placeholder="recruitment@company.com"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={industryForm.password}
                    onChange={(e) => setIndustryForm({ ...industryForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Type</label>
                  <input
                    type="text"
                    required
                    value={industryForm.industry_type}
                    onChange={(e) => setIndustryForm({ ...industryForm, industry_type: e.target.value })}
                    placeholder="Ayush & HealthTech / AI"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Size</label>
                  <input
                    type="text"
                    value={industryForm.company_size}
                    onChange={(e) => setIndustryForm({ ...industryForm, company_size: e.target.value })}
                    placeholder="50-200 / 1000+ employees"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Headquarters</label>
                <input
                  type="text"
                  required
                  value={industryForm.location}
                  onChange={(e) => setIndustryForm({ ...industryForm, location: e.target.value })}
                  placeholder="New Delhi, Bengaluru, Remote"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </>
          )}

          {/* 3. ACADEMICIAN REGISTRATION FORM */}
          {role === 'academician' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name & Title</label>
                  <input
                    type="text"
                    required
                    value={acadForm.name}
                    onChange={(e) => setAcadForm({ ...acadForm, name: e.target.value })}
                    placeholder="Dr. Rajesh Verma"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={acadForm.email}
                    onChange={(e) => setAcadForm({ ...acadForm, email: e.target.value })}
                    placeholder="dr.rajesh@aiia.gov.in"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={acadForm.password}
                    onChange={(e) => setAcadForm({ ...acadForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={acadForm.designation}
                    onChange={(e) => setAcadForm({ ...acadForm, designation: e.target.value })}
                    placeholder="Professor / Head of Dept"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={acadForm.institution}
                  onChange={(e) => setAcadForm({ ...acadForm, institution: e.target.value })}
                  placeholder="All India Institute of Ayurveda"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={acadForm.department}
                  onChange={(e) => setAcadForm({ ...acadForm, department: e.target.value })}
                  placeholder="Ayurvedic Informatics & Dravyaguna"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </>
          )}

          {/* 4. INSTITUTION REGISTRATION FORM */}
          {role === 'institution' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={instForm.institution_name}
                  onChange={(e) => setInstForm({ ...instForm, institution_name: e.target.value })}
                  placeholder="All India Institute of Ayurveda"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={instForm.email}
                    onChange={(e) => setInstForm({ ...instForm, email: e.target.value })}
                    placeholder="admin@aiia.ac.in"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={instForm.password}
                    onChange={(e) => setInstForm({ ...instForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Institution Type</label>
                  <input
                    type="text"
                    required
                    value={instForm.institution_type}
                    onChange={(e) => setInstForm({ ...instForm, institution_type: e.target.value })}
                    placeholder="Autonomous Apex Institute / University"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={instForm.location}
                    onChange={(e) => setInstForm({ ...instForm, location: e.target.value })}
                    placeholder="New Delhi, India"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : `Register as ${role.toUpperCase()}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-ayush-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>

    </div>
  );
};

export default RegisterPage;
