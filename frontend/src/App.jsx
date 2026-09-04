import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicPortfolioPage from './pages/PublicPortfolioPage';

// Student Portal Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentProfilePage from './pages/StudentProfilePage';
import SkillAssessmentPage from './pages/SkillAssessmentPage';
import SkillGapAnalysisPage from './pages/SkillGapAnalysisPage';
import CareerRecommendationsPage from './pages/CareerRecommendationsPage';
import InternshipsPage from './pages/InternshipsPage';
import JobsPage from './pages/JobsPage';
import ApplicationsTrackerPage from './pages/ApplicationsTrackerPage';
import CoursesLearningPage from './pages/CoursesLearningPage';
import ResumeAIPage from './pages/ResumeAIPage';
import AIMentorPage from './pages/AIMentorPage';
import MentorshipsPage from './pages/MentorshipsPage';

// Industry Portal Pages
import IndustryDashboard from './pages/IndustryDashboard';
import AICandidateMatcherPage from './pages/AICandidateMatcherPage';
import PostOpportunityPage from './pages/PostOpportunityPage';
import ManageApplicationsPage from './pages/ManageApplicationsPage';
import ResearchCollaborationPage from './pages/ResearchCollaborationPage';

// Academician Portal Pages
import AcademicianDashboard from './pages/AcademicianDashboard';

// Institution Portal Pages
import InstitutionDashboard from './pages/InstitutionDashboard';
import StudentRegistryPage from './pages/StudentRegistryPage';

// Super Admin Pages
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/portfolio/:id" element={<PublicPortfolioPage />} />

        {/* Student Portal Protected Routes */}
        <Route element={<DashboardLayout allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/assessment" element={<SkillAssessmentPage />} />
          <Route path="/student/skills" element={<StudentProfilePage />} />
          <Route path="/student/skill-gap" element={<SkillGapAnalysisPage />} />
          <Route path="/student/career-recommendations" element={<CareerRecommendationsPage />} />
          <Route path="/student/courses" element={<CoursesLearningPage />} />
          <Route path="/student/internships" element={<InternshipsPage />} />
          <Route path="/student/jobs" element={<JobsPage />} />
          <Route path="/student/applications" element={<ApplicationsTrackerPage />} />
          <Route path="/student/projects" element={<StudentProfilePage />} />
          <Route path="/student/certifications" element={<StudentProfilePage />} />
          <Route path="/student/resume-ai" element={<ResumeAIPage />} />
          <Route path="/student/mentor-ai" element={<AIMentorPage />} />
          <Route path="/student/mentorship" element={<MentorshipsPage />} />
        </Route>

        {/* Industry Portal Protected Routes */}
        <Route element={<DashboardLayout allowedRoles={['industry']} />}>
          <Route path="/industry/dashboard" element={<IndustryDashboard />} />
          <Route path="/industry/candidates" element={<AICandidateMatcherPage />} />
          <Route path="/industry/post-internship" element={<PostOpportunityPage defaultType="internship" />} />
          <Route path="/industry/post-job" element={<PostOpportunityPage defaultType="job" />} />
          <Route path="/industry/applications" element={<ManageApplicationsPage />} />
          <Route path="/industry/collaborations" element={<ResearchCollaborationPage />} />
          <Route path="/industry/mentorship" element={<MentorshipsPage />} />
        </Route>

        {/* Academician Portal Protected Routes */}
        <Route element={<DashboardLayout allowedRoles={['academician']} />}>
          <Route path="/academician/dashboard" element={<AcademicianDashboard />} />
          <Route path="/academician/profile" element={<StudentProfilePage />} />
          <Route path="/academician/training" element={<CoursesLearningPage />} />
          <Route path="/academician/collaborations" element={<ResearchCollaborationPage />} />
          <Route path="/academician/mentorship" element={<MentorshipsPage />} />
        </Route>

        {/* Institution Portal Protected Routes */}
        <Route element={<DashboardLayout allowedRoles={['institution']} />}>
          <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
          <Route path="/institution/departments" element={<InstitutionDashboard />} />
          <Route path="/institution/industry-demand" element={<InstitutionDashboard />} />
          <Route path="/institution/students" element={<StudentRegistryPage />} />
        </Route>

        {/* Super Admin Protected Routes */}
        <Route element={<DashboardLayout allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/skills" element={<AdminDashboard />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
