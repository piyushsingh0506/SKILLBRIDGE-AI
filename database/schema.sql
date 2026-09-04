-- =====================================================================
-- Academia-Industry Connect Database Schema (PostgreSQL)
-- Smart India Hackathon Problem Statement 26044
-- Ministry of Ayush / All India Institute of Ayurveda
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    college VARCHAR(255) DEFAULT '',
    course VARCHAR(255) DEFAULT '',
    branch VARCHAR(255) DEFAULT '',
    graduation_year INTEGER DEFAULT 2026,
    career_interest VARCHAR(255) DEFAULT '',
    preferred_roles TEXT DEFAULT '',
    preferred_locations TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    cgpa FLOAT DEFAULT 8.0,
    placement_ready BOOLEAN DEFAULT FALSE,
    resume_url VARCHAR(500),
    profile_completion FLOAT DEFAULT 70.0,
    overall_skill_score FLOAT DEFAULT 72.0,
    technical_score FLOAT DEFAULT 75.0,
    soft_score FLOAT DEFAULT 70.0,
    placement_readiness_score FLOAT DEFAULT 68.0,
    target_career_role_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS industries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry_type VARCHAR(255) DEFAULT 'Technology',
    company_size VARCHAR(100) DEFAULT '50-200',
    location VARCHAR(255) DEFAULT 'New Delhi',
    website VARCHAR(500) DEFAULT '',
    description TEXT DEFAULT '',
    verified BOOLEAN DEFAULT TRUE,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academicians (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) DEFAULT 'Computer Science',
    designation VARCHAR(255) DEFAULT 'Associate Professor',
    specialization VARCHAR(255) DEFAULT '',
    bio TEXT DEFAULT '',
    research_areas TEXT DEFAULT '',
    experience_years INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS institutions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    institution_type VARCHAR(255) DEFAULT 'University',
    location VARCHAR(255) DEFAULT 'New Delhi',
    website VARCHAR(500) DEFAULT '',
    established_year INTEGER DEFAULT 1990,
    accreditation VARCHAR(100) DEFAULT 'NAAC A++ / NIRF Top 20',
    contact_person VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) DEFAULT 'Technical',
    description TEXT DEFAULT '',
    demand_level VARCHAR(50) DEFAULT 'High',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_skills (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) DEFAULT 'Intermediate',
    score FLOAT DEFAULT 70.0,
    verified BOOLEAN DEFAULT FALSE,
    source VARCHAR(50) DEFAULT 'Self'
);

CREATE TABLE IF NOT EXISTS career_roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) DEFAULT 'Software',
    description TEXT DEFAULT '',
    average_salary VARCHAR(100) DEFAULT '₹8-16 LPA',
    growth_rate VARCHAR(50) DEFAULT '+24% YoY',
    required_education VARCHAR(255) DEFAULT 'B.Tech / BAMS / MCA / M.Sc'
);

CREATE TABLE IF NOT EXISTS career_role_skills (
    id SERIAL PRIMARY KEY,
    career_role_id INTEGER NOT NULL REFERENCES career_roles(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    importance VARCHAR(50) DEFAULT 'Required',
    weight FLOAT DEFAULT 1.0,
    priority VARCHAR(50) DEFAULT 'High'
);

CREATE TABLE IF NOT EXISTS skill_assessments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Technical',
    description TEXT DEFAULT '',
    duration_minutes INTEGER DEFAULT 20,
    total_questions INTEGER DEFAULT 10
);

CREATE TABLE IF NOT EXISTS assessment_questions (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES skill_assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_option VARCHAR(10) NOT NULL,
    skill_name VARCHAR(100) DEFAULT '',
    difficulty VARCHAR(50) DEFAULT 'Medium',
    explanation TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS assessment_results (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_id INTEGER NOT NULL REFERENCES skill_assessments(id) ON DELETE CASCADE,
    score FLOAT DEFAULT 0.0,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    category_breakdown TEXT DEFAULT '{}',
    answers_json TEXT DEFAULT '{}',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    tech_stack TEXT DEFAULT '',
    github_url VARCHAR(500) DEFAULT '',
    live_url VARCHAR(500) DEFAULT '',
    start_date VARCHAR(50) DEFAULT '',
    end_date VARCHAR(50) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) DEFAULT '',
    issue_date VARCHAR(50) DEFAULT '',
    expiry_date VARCHAR(50) DEFAULT '',
    credential_url VARCHAR(500) DEFAULT '',
    verified BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(255) DEFAULT 'SWAYAM / NPTEL / Coursera',
    description TEXT DEFAULT '',
    category VARCHAR(100) DEFAULT 'Technical',
    level VARCHAR(50) DEFAULT 'Beginner',
    duration_hours INTEGER DEFAULT 20,
    rating FLOAT DEFAULT 4.8,
    url VARCHAR(500) DEFAULT 'https://swayam.gov.in',
    image_url VARCHAR(500) DEFAULT '',
    mapped_skill VARCHAR(100) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS internships (
    id SERIAL PRIMARY KEY,
    industry_id INTEGER NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    required_skills TEXT DEFAULT '',
    preferred_skills TEXT DEFAULT '',
    stipend VARCHAR(100) DEFAULT '₹20,000/month',
    duration_months INTEGER DEFAULT 3,
    location VARCHAR(255) DEFAULT 'New Delhi / Remote',
    work_mode VARCHAR(50) DEFAULT 'Hybrid',
    openings INTEGER DEFAULT 3,
    deadline VARCHAR(50) DEFAULT '2026-10-30',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    industry_id INTEGER NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    required_skills TEXT DEFAULT '',
    preferred_skills TEXT DEFAULT '',
    salary_range VARCHAR(100) DEFAULT '₹8 - 14 LPA',
    experience_years VARCHAR(50) DEFAULT '0-2 Years',
    qualification VARCHAR(255) DEFAULT 'B.Tech / BAMS / M.Tech / MCA',
    location VARCHAR(255) DEFAULT 'Bengaluru / Remote',
    job_type VARCHAR(50) DEFAULT 'Full-time',
    work_mode VARCHAR(50) DEFAULT 'Hybrid',
    openings INTEGER DEFAULT 2,
    deadline VARCHAR(50) DEFAULT '2026-11-15',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    opportunity_type VARCHAR(50) DEFAULT 'internship',
    opportunity_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    match_score FLOAT DEFAULT 85.0,
    status VARCHAR(50) DEFAULT 'Applied',
    cover_note TEXT DEFAULT '',
    resume_snapshot TEXT DEFAULT '',
    interview_date VARCHAR(100),
    interview_link VARCHAR(500),
    feedback TEXT DEFAULT '',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_gaps (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    career_role_id INTEGER REFERENCES career_roles(id) ON DELETE CASCADE,
    role_title VARCHAR(255) DEFAULT '',
    missing_skills TEXT DEFAULT '[]',
    weak_skills TEXT DEFAULT '[]',
    strong_skills TEXT DEFAULT '[]',
    gap_score FLOAT DEFAULT 30.0,
    priority_actions TEXT DEFAULT '[]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mentorships (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(255) DEFAULT 'Career Guidance & Skill Roadmapping',
    status VARCHAR(50) DEFAULT 'Pending',
    scheduled_time VARCHAR(100) DEFAULT '2026-09-15 17:00 IST',
    meeting_link VARCHAR(500) DEFAULT 'https://meet.google.com/abc-defg-hij',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS research_collaborations (
    id SERIAL PRIMARY KEY,
    industry_id INTEGER NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    academician_id INTEGER NOT NULL REFERENCES academicians(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    domain VARCHAR(255) DEFAULT 'AI in Ayurveda & Clinical Automation',
    budget VARCHAR(100) DEFAULT '₹15,00,000',
    status VARCHAR(50) DEFAULT 'Open',
    duration_months INTEGER DEFAULT 12,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'alert',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    file_name VARCHAR(255) DEFAULT 'resume.pdf',
    file_text TEXT DEFAULT '',
    parsed_skills TEXT DEFAULT '[]',
    parsed_experience TEXT DEFAULT '',
    parsed_education TEXT DEFAULT '',
    ats_score FLOAT DEFAULT 78.0,
    feedback TEXT DEFAULT '[]',
    target_role VARCHAR(255) DEFAULT 'Data Analyst',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
