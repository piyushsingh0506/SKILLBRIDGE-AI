import sys
import os
import json
import datetime

# Add parent directory to path so we can run directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.database.session import SessionLocal, engine, Base
from app.models.models import (
    User, StudentProfile, IndustryProfile, AcademicianProfile, InstitutionProfile,
    Skill, StudentSkill, CareerRole, CareerRoleSkill, Course,
    SkillAssessment, AssessmentQuestion, AssessmentResult, Project, Certification,
    Internship, Job, Application, SkillGap, Mentorship, ResearchCollaboration, Notification
)
from app.core.security import get_password_hash

def seed_database():
    print("[*] Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if database already has seed data
    existing_user_count = db.query(User).count()
    if existing_user_count > 10:
        print(f"[*] Database already seeded with {existing_user_count} users. Skipping redundant seed.")
        db.close()
        return

    print("[*] Seeding fresh dataset for Academia–Industry Connect...")

    # Default password hash for all seed users
    default_pw_hash = get_password_hash("password123")

    # -------------------------------------------------------------
    # 1. SEED SKILLS (35+ comprehensive skills)
    # -------------------------------------------------------------
    skills_data = [
        # Technical & Software
        {"name": "Python", "category": "Technical", "demand_level": "High"},
        {"name": "SQL", "category": "Technical", "demand_level": "High"},
        {"name": "React", "category": "Technical", "demand_level": "High"},
        {"name": "Node.js", "category": "Technical", "demand_level": "High"},
        {"name": "FastAPI", "category": "Technical", "demand_level": "High"},
        {"name": "PostgreSQL", "category": "Technical", "demand_level": "High"},
        {"name": "Docker", "category": "Technical", "demand_level": "High"},
        {"name": "Kubernetes", "category": "Technical", "demand_level": "Medium"},
        {"name": "AWS", "category": "Technical", "demand_level": "High"},
        {"name": "Git & GitHub", "category": "Technical", "demand_level": "High"},
        {"name": "TypeScript", "category": "Technical", "demand_level": "High"},
        {"name": "Tailwind CSS", "category": "Technical", "demand_level": "Medium"},
        {"name": "Linux", "category": "Technical", "demand_level": "Medium"},
        {"name": "REST APIs", "category": "Technical", "demand_level": "High"},
        
        # AI/ML & Data
        {"name": "Machine Learning", "category": "Technical", "demand_level": "High"},
        {"name": "Deep Learning", "category": "Technical", "demand_level": "High"},
        {"name": "Natural Language Processing (NLP)", "category": "Technical", "demand_level": "High"},
        {"name": "Computer Vision", "category": "Technical", "demand_level": "Medium"},
        {"name": "Power BI", "category": "Technical", "demand_level": "High"},
        {"name": "Tableau", "category": "Technical", "demand_level": "Medium"},
        {"name": "Advanced Excel", "category": "Technical", "demand_level": "High"},
        {"name": "Applied Statistics", "category": "Technical", "demand_level": "High"},
        {"name": "Pandas", "category": "Technical", "demand_level": "High"},
        {"name": "Scikit-Learn", "category": "Technical", "demand_level": "High"},
        {"name": "PyTorch", "category": "Technical", "demand_level": "High"},

        # Ayush & Health Informatics (Ministry of Ayush / AIIA domain)
        {"name": "AYUSH Health Informatics", "category": "Domain/Ayush", "demand_level": "High"},
        {"name": "Dravyaguna (Pharmacology)", "category": "Domain/Ayush", "demand_level": "High"},
        {"name": "Herb-Drug Interaction Analysis", "category": "Domain/Ayush", "demand_level": "High"},
        {"name": "Clinical Trials & GCP", "category": "Domain/Ayush", "demand_level": "High"},
        {"name": "Bioinformatics & Genomic Analytics", "category": "Domain/Ayush", "demand_level": "High"},
        {"name": "Phytochemistry & Quality Control", "category": "Domain/Ayush", "demand_level": "High"},
        {"name": "Pharmacovigilance (Ayush)", "category": "Domain/Ayush", "demand_level": "Medium"},
        {"name": "Panchakarma Protocol Analytics", "category": "Domain/Ayush", "demand_level": "Medium"},

        # Soft & Aptitude
        {"name": "Communication Skills", "category": "Soft", "demand_level": "High"},
        {"name": "Problem Solving & Analytical Thinking", "category": "Soft", "demand_level": "High"},
        {"name": "Team Leadership", "category": "Soft", "demand_level": "Medium"},
        {"name": "Agile Project Management", "category": "Soft", "demand_level": "High"},
        {"name": "Critical Thinking", "category": "Soft", "demand_level": "High"},
        {"name": "Quantitative Aptitude", "category": "Aptitude", "demand_level": "High"}
    ]

    skill_objs = {}
    for s in skills_data:
        existing = db.query(Skill).filter(Skill.name == s["name"]).first()
        if not existing:
            obj = Skill(name=s["name"], category=s["category"], demand_level=s["demand_level"])
            db.add(obj)
            db.commit()
            db.refresh(obj)
            skill_objs[s["name"]] = obj
        else:
            skill_objs[s["name"]] = existing

    # -------------------------------------------------------------
    # 2. SEED CAREER ROLES & MAPPINGS
    # -------------------------------------------------------------
    career_roles_data = [
        {
            "title": "Data Analyst",
            "category": "Data & Analytics",
            "description": "Transforms raw institutional and industry data into actionable insights using SQL, Python, and BI dashboards.",
            "average_salary": "₹7-14 LPA",
            "growth_rate": "+28% YoY",
            "required_skills": ["Python", "SQL", "Power BI", "Advanced Excel", "Applied Statistics"]
        },
        {
            "title": "Data Scientist",
            "category": "AI & ML",
            "description": "Develops predictive models and statistical algorithms to analyze healthcare, academic, and consumer data patterns.",
            "average_salary": "₹12-24 LPA",
            "growth_rate": "+35% YoY",
            "required_skills": ["Python", "Machine Learning", "Applied Statistics", "SQL", "Pandas", "Scikit-Learn"]
        },
        {
            "title": "ML Engineer",
            "category": "AI & ML",
            "description": "Deploys machine learning models into robust production architectures using containerization and REST APIs.",
            "average_salary": "₹14-28 LPA",
            "growth_rate": "+42% YoY",
            "required_skills": ["Python", "Machine Learning", "Deep Learning", "PyTorch", "Docker", "REST APIs"]
        },
        {
            "title": "Full Stack Developer",
            "category": "Software Engineering",
            "description": "Builds end-to-end web applications with modern frontend frameworks and scalable backend APIs.",
            "average_salary": "₹8-18 LPA",
            "growth_rate": "+25% YoY",
            "required_skills": ["React", "JavaScript", "Node.js", "SQL", "Git & GitHub"]
        },
        {
            "title": "Backend Developer",
            "category": "Software Engineering",
            "description": "Architects high-performance microservices, database schemas, and secure authentication systems.",
            "average_salary": "₹9-20 LPA",
            "growth_rate": "+24% YoY",
            "required_skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "REST APIs", "Docker"]
        },
        {
            "title": "Ayurvedic Health Informatics Specialist",
            "category": "Ayush & HealthTech",
            "description": "Bridges traditional Ayurvedic clinical wisdom with modern bioinformatics, EHR databases, and AI analytics.",
            "average_salary": "₹8-16 LPA",
            "growth_rate": "+38% YoY",
            "required_skills": ["AYUSH Health Informatics", "Python", "Clinical Trials & GCP", "Dravyaguna (Pharmacology)"]
        },
        {
            "title": "Clinical Data Analyst (Ayush & Biotech)",
            "category": "Ayush & HealthTech",
            "description": "Conducts statistical analysis and Good Clinical Practice (GCP) compliance monitoring for Ayush drug trials.",
            "average_salary": "₹7-15 LPA",
            "growth_rate": "+30% YoY",
            "required_skills": ["Clinical Trials & GCP", "Applied Statistics", "Advanced Excel", "Python", "SQL"]
        },
        {
            "title": "Herbal Drug Standardization Scientist",
            "category": "Ayush & Pharma",
            "description": "Performs phytochemistry fingerprinting, quality assurance, and active ingredient standardization.",
            "average_salary": "₹8-17 LPA",
            "growth_rate": "+26% YoY",
            "required_skills": ["Phytochemistry & Quality Control", "Dravyaguna (Pharmacology)", "Herb-Drug Interaction Analysis"]
        },
        {
            "title": "Cloud & DevOps Engineer",
            "category": "Cloud & Infrastructure",
            "description": "Maintains scalable cloud infrastructure, CI/CD pipelines, and automated monitoring clusters.",
            "average_salary": "₹10-22 LPA",
            "growth_rate": "+32% YoY",
            "required_skills": ["Linux", "Docker", "Kubernetes", "AWS", "Git & GitHub"]
        },
        {
            "title": "Product Manager (HealthTech / SaaS)",
            "category": "Product & Strategy",
            "description": "Leads cross-functional product roadmap execution connecting academic research with industry commercialization.",
            "average_salary": "₹15-30 LPA",
            "growth_rate": "+20% YoY",
            "required_skills": ["Agile Project Management", "Communication Skills", "Power BI", "Problem Solving & Analytical Thinking"]
        }
    ]

    for cr in career_roles_data:
        existing = db.query(CareerRole).filter(CareerRole.title == cr["title"]).first()
        if not existing:
            role_obj = CareerRole(
                title=cr["title"],
                category=cr["category"],
                description=cr["description"],
                average_salary=cr["average_salary"],
                growth_rate=cr["growth_rate"]
            )
            db.add(role_obj)
            db.commit()
            db.refresh(role_obj)
            
            for sk_name in cr["required_skills"]:
                if sk_name in skill_objs:
                    crs = CareerRoleSkill(
                        career_role_id=role_obj.id,
                        skill_id=skill_objs[sk_name].id,
                        importance="Required",
                        priority="High"
                    )
                    db.add(crs)
            db.commit()

    # -------------------------------------------------------------
    # 3. SEED SUPER ADMIN
    # -------------------------------------------------------------
    admin_user = User(
        email="admin@academia-industry.gov.in",
        hashed_password=default_pw_hash,
        role="admin",
        full_name="Platform Super Administrator",
        phone="+91 98765 00000",
        avatar="https://api.dicebear.com/7.x/bottts/svg?seed=SuperAdmin"
    )
    db.add(admin_user)
    db.commit()

    # -------------------------------------------------------------
    # 4. SEED 3 INSTITUTIONS
    # -------------------------------------------------------------
    institutions_data = [
        {
            "email": "admin@aiia.ac.in",
            "name": "All India Institute of Ayurveda (AIIA)",
            "type": "Autonomous Apex Institute (Ministry of Ayush)",
            "location": "Sarita Vihar, New Delhi",
            "contact": "Prof. (Dr.) Tanuja Nesari, Director"
        },
        {
            "email": "dean.academics@dtu.ac.in",
            "name": "Delhi Technological University (DTU)",
            "type": "State University / Tier-1 Engineering",
            "location": "Rohini, New Delhi",
            "contact": "Dr. Rajesh Kumar, Dean Academics"
        },
        {
            "email": "ayurveda@bhu.ac.in",
            "name": "Faculty of Ayurveda, Banaras Hindu University",
            "type": "Central University",
            "location": "Varanasi, Uttar Pradesh",
            "contact": "Prof. P. K. Goswami, Dean"
        }
    ]

    for inst in institutions_data:
        u = User(
            email=inst["email"],
            hashed_password=default_pw_hash,
            role="institution",
            full_name=inst["name"],
            avatar=f"https://api.dicebear.com/7.x/identicon/svg?seed={inst['name'].replace(' ', '')}"
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        
        ip = InstitutionProfile(
            user_id=u.id,
            institution_name=inst["name"],
            institution_type=inst["type"],
            location=inst["location"],
            contact_person=inst["contact"]
        )
        db.add(ip)
        db.commit()

    # -------------------------------------------------------------
    # 5. SEED 5 INDUSTRY PARTNERS
    # -------------------------------------------------------------
    industries_data = [
        {
            "email": "hr@dabur-ayurtech.com",
            "company_name": "Dabur AyurTech India",
            "industry_type": "Ayush & HealthTech",
            "company_size": "5,000+ employees",
            "location": "Kaushambi, Ghaziabad / New Delhi",
            "website": "https://www.dabur.com",
            "description": "Pioneering research in standardized herbal formulations and automated quality control pipelines."
        },
        {
            "email": "careers@patanjalibiolabs.com",
            "company_name": "Patanjali BioLabs & Research",
            "industry_type": "Biotechnology & Herbal Research",
            "company_size": "1,000-5,000 employees",
            "location": "Haridwar, Uttarakhand",
            "website": "https://www.patanjaliresearchfoundation.com",
            "description": "High-throughput drug discovery, genomic studies, and evidence-based Ayurvedic clinical trials."
        },
        {
            "email": "talent@himalayawellness.com",
            "company_name": "Himalaya Wellness LifeSciences",
            "industry_type": "Pharmaceuticals & Consumer Health",
            "company_size": "2,000+ employees",
            "location": "Bengaluru, Karnataka",
            "website": "https://himalayawellness.in",
            "description": "Global leaders in scientifically validated herbal healthcare and wellness solutions."
        },
        {
            "email": "campus@tcs-healthtech.com",
            "company_name": "Tata Consultancy Services (HealthTech AI)",
            "industry_type": "Information Technology & Healthcare AI",
            "company_size": "50,000+ employees",
            "location": "Gurugram / Bengaluru / Remote",
            "website": "https://www.tcs.com",
            "description": "Building next-generation AI platforms, digital twins, and clinical trial management software."
        },
        {
            "email": "recruitment@techmahindra-ai.com",
            "company_name": "TechMahindra Health Innovation Labs",
            "industry_type": "IT & Enterprise Automation",
            "company_size": "10,000+ employees",
            "location": "Noida / Hyderabad / Remote",
            "website": "https://www.techmahindra.com",
            "description": "Specialized in smart automation, computer vision, and healthcare NLP systems."
        }
    ]

    industry_profile_objs = []
    for ind in industries_data:
        u = User(
            email=ind["email"],
            hashed_password=default_pw_hash,
            role="industry",
            full_name=ind["company_name"],
            avatar=f"https://api.dicebear.com/7.x/identicon/svg?seed={ind['company_name'].replace(' ', '')}"
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        
        ip = IndustryProfile(
            user_id=u.id,
            company_name=ind["company_name"],
            industry_type=ind["industry_type"],
            company_size=ind["company_size"],
            location=ind["location"],
            website=ind["website"],
            description=ind["description"],
            verified=True,
            logo_url=u.avatar
        )
        db.add(ip)
        db.commit()
        db.refresh(ip)
        industry_profile_objs.append(ip)

    # -------------------------------------------------------------
    # 6. SEED 5 ACADEMICIANS
    # -------------------------------------------------------------
    academicians_data = [
        {
            "email": "dr.rajesh.verma@aiia.gov.in",
            "name": "Dr. Rajesh Verma",
            "institution": "All India Institute of Ayurveda",
            "department": "Ayurvedic Informatics & Dravyaguna",
            "designation": "Professor & Head of Department",
            "specialization": "Herbal Drug Interaction & Clinical AI",
            "research": "AI in Evidence-Based Ayurveda, Genomic Markers in Prakriti Classification"
        },
        {
            "email": "prof.anita.deshmukh@dtu.ac.in",
            "name": "Prof. Anita Deshmukh",
            "institution": "Delhi Technological University",
            "department": "Computer Science & Engineering",
            "designation": "Professor & AI Lab Director",
            "specialization": "Natural Language Processing & Machine Learning",
            "research": "Biomedical NER, Clinical Document Summarization, Knowledge Graphs"
        },
        {
            "email": "dr.sanjay.tripathi@bhu.ac.in",
            "name": "Dr. Sanjay Tripathi",
            "institution": "Banaras Hindu University",
            "department": "Faculty of Ayurveda (Kayachikitsa)",
            "designation": "Associate Professor",
            "specialization": "Clinical Protocol Standardization & GCP Trials",
            "research": "Integrative Medicine Protocols, Longitudinal Cohort Analytics"
        },
        {
            "email": "dr.meenakshi.sundaram@aiims.edu",
            "name": "Dr. Meenakshi Sundaram",
            "institution": "AIIMS New Delhi",
            "department": "Biostatistics & Health Informatics",
            "designation": "Additional Professor",
            "specialization": "Statistical Modeling in Medical Trials",
            "research": "Survival Analysis, Machine Learning in Epidemiology"
        },
        {
            "email": "prof.vikram.sinha@iitd.ac.in",
            "name": "Prof. Vikram Sinha",
            "institution": "IIT Delhi",
            "department": "School of Biological Sciences & AI",
            "designation": "Professor",
            "specialization": "Bioinformatics & Deep Learning",
            "research": "Protein-Ligand Docking Simulations, Phytochemical Compound Screening"
        }
    ]

    academician_profile_objs = []
    for acad in academicians_data:
        u = User(
            email=acad["email"],
            hashed_password=default_pw_hash,
            role="academician",
            full_name=acad["name"],
            avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={acad['name'].replace(' ', '')}"
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        
        ap = AcademicianProfile(
            user_id=u.id,
            institution_name=acad["institution"],
            department=acad["department"],
            designation=acad["designation"],
            specialization=acad["specialization"],
            research_areas=acad["research"],
            experience_years=14
        )
        db.add(ap)
        db.commit()
        db.refresh(ap)
        academician_profile_objs.append(ap)

    # -------------------------------------------------------------
    # 7. SEED 20+ STUDENTS WITH VARIED SKILL PROFILES
    # -------------------------------------------------------------
    students_data = [
        {
            "email": "aarav.sharma@aiia.gov.in",
            "name": "Aarav Sharma",
            "college": "All India Institute of Ayurveda",
            "course": "B.Tech + Integrated AyurInformatics",
            "branch": "Healthcare Data Analytics",
            "year": 2026,
            "interest": "Data Analyst",
            "cgpa": 8.8,
            "skills": [
                ("Python", 88.0, "Advanced"), ("SQL", 82.0, "Advanced"),
                ("Advanced Excel", 85.0, "Advanced"), ("Applied Statistics", 78.0, "Intermediate"),
                ("AYUSH Health Informatics", 84.0, "Advanced"), ("Clinical Trials & GCP", 76.0, "Intermediate"),
                ("Communication Skills", 80.0, "Advanced")
            ],
            "bio": "Passionate healthcare data analyst bridging Ayurvedic pharmacology with modern statistical analytics."
        },
        {
            "email": "priya.nair@dtu.ac.in",
            "name": "Priya Nair",
            "college": "Delhi Technological University",
            "course": "B.Tech",
            "branch": "Computer Science & AI",
            "year": 2026,
            "interest": "ML Engineer",
            "cgpa": 9.2,
            "skills": [
                ("Python", 94.0, "Expert"), ("Machine Learning", 90.0, "Expert"),
                ("Deep Learning", 86.0, "Advanced"), ("PyTorch", 82.0, "Advanced"),
                ("Docker", 78.0, "Intermediate"), ("Git & GitHub", 90.0, "Expert")
            ],
            "bio": "AI enthusiast specializing in deep learning architectures and high-throughput model deployments."
        },
        {
            "email": "rohit.verma@bhu.ac.in",
            "name": "Rohit Verma",
            "college": "Banaras Hindu University",
            "course": "BAMS / Clinical Informatics",
            "branch": "Dravyaguna & Clinical Pharmacology",
            "year": 2026,
            "interest": "Ayurvedic Health Informatics Specialist",
            "cgpa": 8.4,
            "skills": [
                ("AYUSH Health Informatics", 90.0, "Expert"), ("Dravyaguna (Pharmacology)", 92.0, "Expert"),
                ("Herb-Drug Interaction Analysis", 86.0, "Advanced"), ("Clinical Trials & GCP", 80.0, "Advanced"),
                ("Python", 70.0, "Intermediate")
            ],
            "bio": "Ayurvedic physician and computational researcher dedicated to standardized clinical databases."
        },
        {
            "email": "ananya.iyer@dtu.ac.in",
            "name": "Ananya Iyer",
            "college": "Delhi Technological University",
            "course": "B.Tech",
            "branch": "Information Technology",
            "year": 2026,
            "interest": "Full Stack Developer",
            "cgpa": 8.7,
            "skills": [
                ("React", 90.0, "Expert"), ("JavaScript", 88.0, "Advanced"),
                ("Node.js", 84.0, "Advanced"), ("SQL", 80.0, "Intermediate"),
                ("Tailwind CSS", 85.0, "Advanced"), ("Git & GitHub", 88.0, "Advanced")
            ],
            "bio": "Full-stack developer crafting responsive web interfaces and secure REST APIs."
        },
        {
            "email": "vikram.singh@aiia.gov.in",
            "name": "Vikram Singh",
            "college": "All India Institute of Ayurveda",
            "course": "B.Sc (Hons)",
            "branch": "Biomedical & Ayush Data Science",
            "year": 2026,
            "interest": "Clinical Data Analyst (Ayush & Biotech)",
            "cgpa": 8.5,
            "skills": [
                ("Clinical Trials & GCP", 88.0, "Advanced"), ("Applied Statistics", 82.0, "Advanced"),
                ("Advanced Excel", 90.0, "Expert"), ("SQL", 75.0, "Intermediate"),
                ("Python", 72.0, "Intermediate")
            ],
            "bio": "Clinical trial coordinator and biostatistics specialist focusing on herbal drug safety standards."
        },
        {
            "email": "sneha.kulkarni@dtu.ac.in",
            "name": "Sneha Kulkarni",
            "college": "Delhi Technological University",
            "course": "B.Tech",
            "branch": "Software Engineering",
            "year": 2026,
            "interest": "Backend Developer",
            "cgpa": 8.9,
            "skills": [
                ("Python", 90.0, "Expert"), ("FastAPI", 88.0, "Advanced"),
                ("PostgreSQL", 85.0, "Advanced"), ("Docker", 80.0, "Intermediate"),
                ("REST APIs", 92.0, "Expert")
            ],
            "bio": "Backend architect passionate about asynchronous microservices and relational database optimizations."
        },
        {
            "email": "kavita.patel@bhu.ac.in",
            "name": "Kavita Patel",
            "college": "Banaras Hindu University",
            "course": "BAMS",
            "branch": "Phytochemistry & Quality Control",
            "year": 2026,
            "interest": "Herbal Drug Standardization Scientist",
            "cgpa": 8.6,
            "skills": [
                ("Phytochemistry & Quality Control", 92.0, "Expert"), ("Dravyaguna (Pharmacology)", 88.0, "Advanced"),
                ("Herb-Drug Interaction Analysis", 84.0, "Advanced"), ("Clinical Trials & GCP", 75.0, "Intermediate")
            ],
            "bio": "Phytochemical analyst working on chromatography fingerprinting of standardized herbal extracts."
        },
        {
            "email": "dev.malhotra@dtu.ac.in",
            "name": "Dev Malhotra",
            "college": "Delhi Technological University",
            "course": "B.Tech",
            "branch": "Computer Science",
            "year": 2026,
            "interest": "Cloud & DevOps Engineer",
            "cgpa": 8.3,
            "skills": [
                ("Linux", 88.0, "Advanced"), ("Docker", 86.0, "Advanced"),
                ("Kubernetes", 80.0, "Intermediate"), ("AWS", 82.0, "Advanced"),
                ("Git & GitHub", 88.0, "Advanced")
            ],
            "bio": "DevOps practitioner focusing on automated Kubernetes clusters and cloud infrastructure security."
        },
        {
            "email": "tanya.roy@aiia.gov.in",
            "name": "Tanya Roy",
            "college": "All India Institute of Ayurveda",
            "course": "M.Sc",
            "branch": "Ayurvedic Informatics",
            "year": 2025,
            "interest": "Data Scientist",
            "cgpa": 9.0,
            "skills": [
                ("Python", 92.0, "Expert"), ("Machine Learning", 88.0, "Advanced"),
                ("Natural Language Processing (NLP)", 85.0, "Advanced"), ("SQL", 84.0, "Advanced"),
                ("AYUSH Health Informatics", 80.0, "Intermediate")
            ],
            "bio": "NLP researcher specializing in extraction of clinical entities from classical Ayurvedic manuscripts."
        },
        {
            "email": "arjun.das@dtu.ac.in",
            "name": "Arjun Das",
            "college": "Delhi Technological University",
            "course": "B.Tech",
            "branch": "Computer Science",
            "year": 2026,
            "interest": "Product Manager (HealthTech / SaaS)",
            "cgpa": 8.6,
            "skills": [
                ("Agile Project Management", 88.0, "Advanced"), ("Communication Skills", 90.0, "Expert"),
                ("Power BI", 80.0, "Intermediate"), ("Problem Solving & Analytical Thinking", 86.0, "Advanced")
            ],
            "bio": "Aspiring technical product manager experienced in leading agile university project teams."
        }
    ]

    # Additional 10 students to satisfy 20+ requirement
    extra_students = [
        ("Karan Mehta", "karan.mehta@aiia.gov.in", "All India Institute of Ayurveda", "Data Analyst", 8.2),
        ("Pooja Hegde", "pooja.hegde@dtu.ac.in", "Delhi Technological University", "Full Stack Developer", 8.8),
        ("Manish Gupta", "manish.gupta@bhu.ac.in", "Banaras Hindu University", "Ayurvedic Health Informatics Specialist", 8.1),
        ("Siddharth Rao", "siddharth.rao@dtu.ac.in", "Delhi Technological University", "Data Scientist", 8.9),
        ("Divya Menon", "divya.menon@aiia.gov.in", "All India Institute of Ayurveda", "Clinical Data Analyst (Ayush & Biotech)", 8.5),
        ("Nikhil Joshi", "nikhil.joshi@dtu.ac.in", "Delhi Technological University", "Backend Developer", 8.4),
        ("Rhea Sen", "rhea.sen@bhu.ac.in", "Banaras Hindu University", "Herbal Drug Standardization Scientist", 8.7),
        ("Aditya Kapoor", "aditya.kapoor@dtu.ac.in", "Delhi Technological University", "ML Engineer", 9.1),
        ("Shweta Deshmukh", "shweta.deshmukh@aiia.gov.in", "All India Institute of Ayurveda", "Data Analyst", 8.3),
        ("Harsh Vardhan", "harsh.vardhan@dtu.ac.in", "Delhi Technological University", "Cloud & DevOps Engineer", 8.6)
    ]

    for name, email, coll, interest, cgpa in extra_students:
        students_data.append({
            "email": email,
            "name": name,
            "college": coll,
            "course": "B.Tech / BAMS",
            "branch": "Computer Science & Health Informatics",
            "year": 2026,
            "interest": interest,
            "cgpa": cgpa,
            "skills": [("Python", 80.0, "Intermediate"), ("SQL", 75.0, "Intermediate"), ("Communication Skills", 80.0, "Advanced")],
            "bio": f"Hardworking scholar at {coll} passionate about {interest}."
        })

    student_profile_objs = []
    for s_info in students_data:
        u = User(
            email=s_info["email"],
            hashed_password=default_pw_hash,
            role="student",
            full_name=s_info["name"],
            phone="+91 98111 " + str(10000 + len(student_profile_objs)),
            avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={s_info['name'].replace(' ', '')}"
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        
        avg_score = round(sum(item[1] for item in s_info["skills"]) / len(s_info["skills"]), 1) if s_info["skills"] else 75.0
        
        sp = StudentProfile(
            user_id=u.id,
            college=s_info["college"],
            course=s_info["course"],
            branch=s_info["branch"],
            graduation_year=s_info["year"],
            career_interest=s_info["interest"],
            preferred_roles=s_info["interest"],
            preferred_locations="New Delhi, Bengaluru, Remote",
            bio=s_info["bio"],
            cgpa=s_info["cgpa"],
            placement_ready=(s_info["cgpa"] >= 8.5),
            profile_completion=85.0,
            overall_skill_score=avg_score,
            technical_score=avg_score + 2.0,
            soft_score=80.0,
            placement_readiness_score=round(avg_score * 0.7 + (s_info["cgpa"] * 10) * 0.3, 1),
            target_career_role_id=1
        )
        db.add(sp)
        db.commit()
        db.refresh(sp)
        student_profile_objs.append(sp)

        # Add Skills
        for sk_name, score, level in s_info["skills"]:
            if sk_name in skill_objs:
                st_skill = StudentSkill(
                    student_id=sp.id,
                    skill_id=skill_objs[sk_name].id,
                    proficiency_level=level,
                    score=score,
                    verified=True,
                    source="Assessment"
                )
                db.add(st_skill)
                
        # Add Seed Projects
        p1 = Project(
            student_id=sp.id,
            title="AyurHealth Predictive Analytics Portal",
            description="Engineered an AI-powered clinical parameter analyzer with interactive risk dashboards.",
            tech_stack="Python, FastAPI, SQL, Scikit-Learn",
            github_url="https://github.com/student/ayurhealth-analytics",
            live_url="https://ayurhealth-demo.gov.in",
            start_date="Jan 2026",
            end_date="May 2026"
        )
        db.add(p1)

        # Add Seed Certifications
        c1 = Certification(
            student_id=sp.id,
            title="Certified Healthcare Data Analyst (AIIA-NPTEL)",
            issuer="All India Institute of Ayurveda & SWAYAM",
            issue_date="Feb 2026",
            credential_url="https://nptel.ac.in/verify/AYUR-9921",
            verified=True
        )
        db.add(c1)
        db.commit()

    # -------------------------------------------------------------
    # 8. SEED ASSESSMENTS & QUESTIONS
    # -------------------------------------------------------------
    assessment_1 = SkillAssessment(
        title="Technical & Data Engineering Assessment",
        category="Technical",
        description="Comprehensive 10-question assessment covering Python, SQL, REST APIs, and Applied Statistics.",
        duration_minutes=25,
        total_questions=10
    )
    db.add(assessment_1)

    assessment_2 = SkillAssessment(
        title="AYUSH Health Informatics & Clinical Trials Assessment",
        category="Domain/Ayush",
        description="Evaluates understanding of Good Clinical Practice (GCP), Dravyaguna, and herbal drug standardization.",
        duration_minutes=20,
        total_questions=10
    )
    db.add(assessment_2)

    assessment_3 = SkillAssessment(
        title="Aptitude & Problem Solving Assessment",
        category="Aptitude",
        description="Tests quantitative aptitude, logical reasoning, and critical thinking.",
        duration_minutes=20,
        total_questions=10
    )
    db.add(assessment_3)
    db.commit()

    # Seed Questions for Assessment 1 (Technical)
    tech_questions = [
        {
            "assessment_id": assessment_1.id,
            "question_text": "Which SQL clause is used to filter the results of an aggregate function (e.g., COUNT, AVG)?",
            "option_a": "WHERE", "option_b": "HAVING", "option_c": "GROUP BY", "option_d": "ORDER BY",
            "correct_option": "B", "skill_name": "SQL", "difficulty": "Medium",
            "explanation": "HAVING filters groups created by GROUP BY, while WHERE filters individual rows before aggregation."
        },
        {
            "assessment_id": assessment_1.id,
            "question_text": "In Python, what is the time complexity of looking up a key in a standard dictionary on average?",
            "option_a": "O(1)", "option_b": "O(n)", "option_c": "O(log n)", "option_d": "O(n^2)",
            "correct_option": "A", "skill_name": "Python", "difficulty": "Easy",
            "explanation": "Python dictionaries use hash tables which provide O(1) average lookup time complexity."
        },
        {
            "assessment_id": assessment_1.id,
            "question_text": "Which Pandas function is most suitable for reshaping data from long format to wide format?",
            "option_a": "melt()", "option_b": "pivot() / pivot_table()", "option_c": "concat()", "option_d": "groupby()",
            "correct_option": "B", "skill_name": "Pandas", "difficulty": "Medium",
            "explanation": "pivot() or pivot_table() transforms long-form data into wide tabular format."
        },
        {
            "assessment_id": assessment_1.id,
            "question_text": "In FastAPI, which library provides automatic request body data validation using Python type hints?",
            "option_a": "Marshmallow", "option_b": "Cerberus", "option_c": "Pydantic", "option_d": "Django ORM",
            "correct_option": "C", "skill_name": "FastAPI", "difficulty": "Easy",
            "explanation": "FastAPI leverages Pydantic models for parsing, validation, and schema generation."
        },
        {
            "assessment_id": assessment_1.id,
            "question_text": "Which metric is most resilient against outliers when evaluating central tendency in skewed clinical trial distributions?",
            "option_a": "Mean", "option_b": "Median", "option_c": "Standard Deviation", "option_d": "Variance",
            "correct_option": "B", "skill_name": "Applied Statistics", "difficulty": "Easy",
            "explanation": "The median is a non-parametric statistic unaffected by extreme skewness or outliers."
        },
        {
            "assessment_id": assessment_1.id,
            "question_text": "In Docker, what command is used to build an image from a Dockerfile in the current directory?",
            "option_a": "docker run -b .", "option_b": "docker create .", "option_c": "docker build -t app .", "option_d": "docker init",
            "correct_option": "C", "skill_name": "Docker", "difficulty": "Medium",
            "explanation": "docker build -t <tag_name> . compiles the container image."
        },
        {
            "assessment_id": assessment_1.id,
            "question_text": "Which Scikit-Learn class is designed for linear regression with L2 regularization penalty?",
            "option_a": "Lasso", "option_b": "Ridge", "option_c": "ElasticNet", "option_d": "LogisticRegression",
            "correct_option": "B", "skill_name": "Scikit-Learn", "difficulty": "Medium",
            "explanation": "Ridge regression adds an L2 squared magnitude penalty to the loss function."
        },
        {
            "assessment_id": assessment_1.id,
            "question_text": "In relational databases, what does the 'C' in ACID properties stand for?",
            "option_a": "Concurrency", "option_b": "Consistency", "option_c": "Completeness", "option_d": "Caching",
            "correct_option": "B", "skill_name": "PostgreSQL", "difficulty": "Easy",
            "explanation": "ACID stands for Atomicity, Consistency, Isolation, and Durability."
        }
    ]

    for q in tech_questions:
        aq = AssessmentQuestion(**q)
        db.add(aq)

    # Seed Questions for Assessment 2 (Ayush / Clinical)
    ayush_questions = [
        {
            "assessment_id": assessment_2.id,
            "question_text": "In Ayurvedic pharmacology, what term describes the post-digestive biochemical transformation of a herb or food?",
            "option_a": "Rasa", "option_b": "Guna", "option_c": "Virya", "option_d": "Vipaka",
            "correct_option": "D", "skill_name": "Dravyaguna (Pharmacology)", "difficulty": "Medium",
            "explanation": "Vipaka refers to the ultimate end-product effect and taste transformation after digestion."
        },
        {
            "assessment_id": assessment_2.id,
            "question_text": "What standard international guideline governs the ethical design, conduct, and reporting of human clinical trials?",
            "option_a": "ISO 9001", "option_b": "ICH-GCP (Good Clinical Practice)", "option_c": "IEEE 802.11", "option_d": "W3C Standards",
            "correct_option": "B", "skill_name": "Clinical Trials & GCP", "difficulty": "Easy",
            "explanation": "ICH-GCP is the gold standard for clinical trial safety and protocol compliance worldwide."
        },
        {
            "assessment_id": assessment_2.id,
            "question_text": "Which digital initiative by the Ministry of Ayush provides a centralized portal for evidence-based Ayurvedic research papers and clinical case studies?",
            "option_a": "NAMASTE Portal & Ayush Research Portal", "option_b": "DigiLocker", "option_c": "SWAYAM", "option_d": "e-Sanjeevani",
            "correct_option": "A", "skill_name": "AYUSH Health Informatics", "difficulty": "Medium",
            "explanation": "The NAMASTE Portal and Ayush Research Portal index national morbidity codes and research evidence."
        },
        {
            "assessment_id": assessment_2.id,
            "question_text": "High Performance Thin Layer Chromatography (HPTLC) is predominantly utilized in Ayush drug standardization for:",
            "option_a": "Measuring body mass index", "option_b": "Phytochemical fingerprinting and biomarker quantification", "option_c": "Network latency testing", "option_d": "Patient registration",
            "correct_option": "B", "skill_name": "Phytochemistry & Quality Control", "difficulty": "Medium",
            "explanation": "HPTLC generates chemical fingerprints to ensure botanical purity and active constituent levels."
        }
    ]

    for q in ayush_questions:
        aq = AssessmentQuestion(**q)
        db.add(aq)
    db.commit()

    # -------------------------------------------------------------
    # 9. SEED 20 INTERNSHIPS
    # -------------------------------------------------------------
    internships_data = [
        {
            "industry_id": industry_profile_objs[0].id, # Dabur
            "title": "Ayurvedic Healthcare Data Analyst Intern",
            "description": "Analyze formulation efficacy datasets, clinical parameters, and consumer health trends using Python & Power BI.",
            "required_skills": "Python, SQL, Power BI, Data Analysis",
            "preferred_skills": "AYUSH Health Informatics, Advanced Excel",
            "stipend": "₹25,000/month",
            "duration_months": 6,
            "location": "New Delhi / Hybrid",
            "work_mode": "Hybrid",
            "openings": 4,
            "deadline": "2026-10-31"
        },
        {
            "industry_id": industry_profile_objs[1].id, # Patanjali
            "title": "Clinical Trials & GCP Research Intern",
            "description": "Assist clinical data management team in GCP trial documentation, EHR verification, and patient cohort analytics.",
            "required_skills": "Clinical Trials & GCP, Applied Statistics, Advanced Excel",
            "preferred_skills": "Python, Dravyaguna (Pharmacology)",
            "stipend": "₹22,000/month",
            "duration_months": 4,
            "location": "Haridwar / On-site",
            "work_mode": "On-site",
            "openings": 3,
            "deadline": "2026-11-15"
        },
        {
            "industry_id": industry_profile_objs[2].id, # Himalaya
            "title": "Herbal Drug Standardization & Quality Control Intern",
            "description": "Perform phytochemical marker quantification, stability studies, and digital laboratory database logging.",
            "required_skills": "Phytochemistry & Quality Control, Dravyaguna (Pharmacology), Herb-Drug Interaction Analysis",
            "preferred_skills": "Communication Skills, Advanced Excel",
            "stipend": "₹24,000/month",
            "duration_months": 6,
            "location": "Bengaluru / Hybrid",
            "work_mode": "Hybrid",
            "openings": 2,
            "deadline": "2026-10-25"
        },
        {
            "industry_id": industry_profile_objs[3].id, # TCS
            "title": "AI & Health Informatics Software Intern",
            "description": "Develop predictive ML pipelines and interactive React web dashboards for hospital management ecosystems.",
            "required_skills": "Python, React, FastAPI, SQL",
            "preferred_skills": "Docker, Machine Learning, Git & GitHub",
            "stipend": "₹30,000/month",
            "duration_months": 6,
            "location": "Gurugram / Remote",
            "work_mode": "Remote",
            "openings": 5,
            "deadline": "2026-11-30"
        },
        {
            "industry_id": industry_profile_objs[4].id, # TechMahindra
            "title": "Biomedical NLP & Machine Learning Intern",
            "description": "Train and fine-tune NLP models on healthcare records and classical pharmacopoeia texts.",
            "required_skills": "Python, Machine Learning, Natural Language Processing (NLP)",
            "preferred_skills": "PyTorch, Scikit-Learn, Docker",
            "stipend": "₹28,000/month",
            "duration_months": 6,
            "location": "Noida / Remote",
            "work_mode": "Remote",
            "openings": 3,
            "deadline": "2026-10-20"
        }
    ]

    # Expand to 20 internships
    additional_intern_titles = [
        ("Full Stack Web Development Intern", "React, Node.js, SQL, Tailwind CSS", "₹20,000/month", "Remote", industry_profile_objs[3].id),
        ("Bioinformatics Genomic Analytics Intern", "Bioinformatics & Genomic Analytics, Python, SQL", "₹26,000/month", "Hybrid", industry_profile_objs[1].id),
        ("Pharmacovigilance & Safety Monitoring Intern", "Pharmacovigilance (Ayush), Clinical Trials & GCP, Advanced Excel", "₹20,000/month", "On-site", industry_profile_objs[0].id),
        ("Cloud Infrastructure & DevOps Intern", "Linux, Docker, AWS, Git & GitHub", "₹25,000/month", "Remote", industry_profile_objs[4].id),
        ("Product Management Operations Intern", "Agile Project Management, Communication Skills, Power BI", "₹22,000/month", "Hybrid", industry_profile_objs[2].id),
        ("Computer Vision Health Diagnostic Intern", "Python, Computer Vision, Deep Learning", "₹30,000/month", "Remote", industry_profile_objs[3].id),
        ("Data Visualization & Tableau Intern", "Tableau, SQL, Advanced Excel", "₹20,000/month", "Remote", industry_profile_objs[0].id),
        ("Ayush EHR Database Management Intern", "PostgreSQL, Python, AYUSH Health Informatics", "₹22,000/month", "Hybrid", industry_profile_objs[1].id),
        ("Herbal Formulation AI Modeling Intern", "Python, Machine Learning, Phytochemistry & Quality Control", "₹28,000/month", "Hybrid", industry_profile_objs[2].id),
        ("Backend Systems & API Intern", "Python, FastAPI, Docker, PostgreSQL", "₹25,000/month", "Remote", industry_profile_objs[4].id),
        ("Quality Assurance & Testing Intern", "Python, Git & GitHub, Problem Solving & Analytical Thinking", "₹18,000/month", "Remote", industry_profile_objs[3].id),
        ("Clinical Research Coordinator Intern", "Clinical Trials & GCP, Communication Skills", "₹20,000/month", "On-site", industry_profile_objs[0].id),
        ("Predictive Patient Analytics Intern", "Python, Applied Statistics, Power BI", "₹25,000/month", "Hybrid", industry_profile_objs[1].id),
        ("Ayurvedic Mobile App UI/UX Intern", "React, Tailwind CSS, Communication Skills", "₹20,000/month", "Remote", industry_profile_objs[2].id),
        ("IoT Medical Sensor Data Intern", "Python, Linux, Docker", "₹24,000/month", "Hybrid", industry_profile_objs[4].id)
    ]

    for title, req_sk, stip, mode, ind_id in additional_intern_titles:
        internships_data.append({
            "industry_id": ind_id,
            "title": title,
            "description": f"Exciting opportunity for pre-final/final year scholars to gain hands-on industrial expertise in {title}.",
            "required_skills": req_sk,
            "preferred_skills": "Git & GitHub, Communication Skills",
            "stipend": stip,
            "duration_months": 3,
            "location": "New Delhi / Bengaluru / Remote",
            "work_mode": mode,
            "openings": 2,
            "deadline": "2026-11-30"
        })

    internship_objs = []
    for idata in internships_data:
        in_obj = Internship(**idata)
        db.add(in_obj)
        db.commit()
        db.refresh(in_obj)
        internship_objs.append(in_obj)

    # -------------------------------------------------------------
    # 10. SEED 20 JOBS
    # -------------------------------------------------------------
    jobs_data = [
        {
            "industry_id": industry_profile_objs[0].id,
            "title": "Healthcare Data Analyst",
            "description": "Lead clinical analytics and BI dashboard reporting for new standardized Ayush formulations.",
            "required_skills": "Python, SQL, Power BI, Advanced Excel, Applied Statistics",
            "preferred_skills": "AYUSH Health Informatics, Tableau",
            "salary_range": "₹8 - 14 LPA",
            "experience_years": "0-2 Years",
            "qualification": "B.Tech / BAMS / MCA / M.Sc Data Science",
            "location": "New Delhi / Hybrid",
            "job_type": "Full-time",
            "work_mode": "Hybrid",
            "openings": 3,
            "deadline": "2026-11-20"
        },
        {
            "industry_id": industry_profile_objs[3].id,
            "title": "Machine Learning Engineer (HealthTech AI)",
            "description": "Design, train, and deploy production ML microservices on AWS/Kubernetes for healthcare client platforms.",
            "required_skills": "Python, Machine Learning, Deep Learning, Docker, REST APIs",
            "preferred_skills": "PyTorch, Kubernetes, AWS",
            "salary_range": "₹12 - 20 LPA",
            "experience_years": "0-3 Years",
            "qualification": "B.Tech / M.Tech / MCA",
            "location": "Bengaluru / Remote",
            "job_type": "Full-time",
            "work_mode": "Remote",
            "openings": 4,
            "deadline": "2026-12-05"
        },
        {
            "industry_id": industry_profile_objs[1].id,
            "title": "Ayurvedic Clinical Informatics Specialist",
            "description": "Bridge traditional clinical registries with modern EHR database systems and statistical GCP trial monitoring.",
            "required_skills": "AYUSH Health Informatics, Python, Clinical Trials & GCP, Dravyaguna (Pharmacology)",
            "preferred_skills": "SQL, Advanced Excel",
            "salary_range": "₹9 - 16 LPA",
            "experience_years": "0-2 Years",
            "qualification": "BAMS / B.Tech / MD (Ayurveda)",
            "location": "Haridwar / Hybrid",
            "job_type": "Full-time",
            "work_mode": "Hybrid",
            "openings": 2,
            "deadline": "2026-11-15"
        },
        {
            "industry_id": industry_profile_objs[2].id,
            "title": "Herbal Phytochemistry QC Scientist",
            "description": "Manage phytochemical quality control assays, chromatography fingerprinting, and regulatory documentation.",
            "required_skills": "Phytochemistry & Quality Control, Dravyaguna (Pharmacology), Herb-Drug Interaction Analysis",
            "preferred_skills": "Clinical Trials & GCP, Communication Skills",
            "salary_range": "₹8.5 - 15 LPA",
            "experience_years": "0-2 Years",
            "qualification": "B.Pharm / M.Pharm / BAMS / M.Sc Chemistry",
            "location": "Bengaluru / On-site",
            "job_type": "Full-time",
            "work_mode": "On-site",
            "openings": 3,
            "deadline": "2026-10-30"
        },
        {
            "industry_id": industry_profile_objs[4].id,
            "title": "Full Stack Software Engineer",
            "description": "Architect high-performance web systems using React, TypeScript, FastAPI, and PostgreSQL.",
            "required_skills": "React, Node.js, Python, PostgreSQL, Git & GitHub",
            "preferred_skills": "Tailwind CSS, Docker, AWS",
            "salary_range": "₹10 - 18 LPA",
            "experience_years": "0-3 Years",
            "qualification": "B.Tech / B.E. / MCA",
            "location": "Noida / Remote",
            "job_type": "Full-time",
            "work_mode": "Remote",
            "openings": 5,
            "deadline": "2026-12-15"
        }
    ]

    # Additional jobs to reach 20
    extra_jobs = [
        ("Clinical Research Associate (GCP)", "Clinical Trials & GCP, Applied Statistics, Advanced Excel", "₹7 - 12 LPA", "Hybrid", industry_profile_objs[0].id),
        ("Bioinformatics Scientist", "Bioinformatics & Genomic Analytics, Python, SQL", "₹11 - 19 LPA", "Remote", industry_profile_objs[1].id),
        ("Cloud & DevOps Architect", "Linux, Docker, Kubernetes, AWS, Git & GitHub", "₹14 - 24 LPA", "Remote", industry_profile_objs[3].id),
        ("Data Scientist (Predictive Healthcare)", "Python, Machine Learning, Applied Statistics, SQL", "₹13 - 22 LPA", "Hybrid", industry_profile_objs[4].id),
        ("Technical Product Manager", "Agile Project Management, Communication Skills, Power BI", "₹16 - 28 LPA", "Hybrid", industry_profile_objs[2].id),
        ("Backend Python Engineer", "Python, FastAPI, SQL, PostgreSQL, Docker", "₹9 - 16 LPA", "Remote", industry_profile_objs[3].id),
        ("NLP Research Engineer", "Python, Natural Language Processing (NLP), PyTorch", "₹12 - 22 LPA", "Remote", industry_profile_objs[4].id),
        ("Pharmacovigilance Officer", "Pharmacovigilance (Ayush), Clinical Trials & GCP", "₹7.5 - 13 LPA", "On-site", industry_profile_objs[0].id),
        ("Database Administrator & Architect", "PostgreSQL, SQL, Linux, Docker", "₹10 - 18 LPA", "Hybrid", industry_profile_objs[1].id),
        ("Frontend React Developer", "React, JavaScript, TypeScript, Tailwind CSS", "₹8 - 15 LPA", "Remote", industry_profile_objs[2].id),
        ("Biostatistician", "Applied Statistics, Advanced Excel, Python, SQL", "₹9 - 16 LPA", "Hybrid", industry_profile_objs[3].id),
        ("Ayush Formulations Quality Lead", "Phytochemistry & Quality Control, Dravyaguna (Pharmacology)", "₹10 - 17 LPA", "On-site", industry_profile_objs[0].id),
        ("Computer Vision Engineer", "Python, Computer Vision, Deep Learning", "₹13 - 23 LPA", "Remote", industry_profile_objs[4].id),
        ("Integration & API Specialist", "REST APIs, FastAPI, PostgreSQL, Git & GitHub", "₹9 - 15 LPA", "Remote", industry_profile_objs[1].id),
        ("Agile Scrum Master & Coordinator", "Agile Project Management, Communication Skills, Team Leadership", "₹11 - 18 LPA", "Hybrid", industry_profile_objs[2].id)
    ]

    for title, req_sk, sal, mode, ind_id in extra_jobs:
        jobs_data.append({
            "industry_id": ind_id,
            "title": title,
            "description": f"Permanent full-time role for talented graduates and engineers to join our dynamic team in {title}.",
            "required_skills": req_sk,
            "preferred_skills": "Communication Skills, Problem Solving & Analytical Thinking",
            "salary_range": sal,
            "experience_years": "0-2 Years",
            "qualification": "B.Tech / BAMS / MCA / M.Sc",
            "location": "New Delhi / Bengaluru / Remote",
            "job_type": "Full-time",
            "work_mode": mode,
            "openings": 2,
            "deadline": "2026-12-30"
        })

    job_objs = []
    for jdata in jobs_data:
        j_obj = Job(**jdata)
        db.add(j_obj)
        db.commit()
        db.refresh(j_obj)
        job_objs.append(j_obj)

    # -------------------------------------------------------------
    # 11. SEED 20 COURSES (Mapped to skills)
    # -------------------------------------------------------------
    courses_data = [
        {"title": "Power BI & Business Analytics Masterclass", "provider": "Coursera / Microsoft", "category": "Technical", "duration_hours": 32, "rating": 4.9, "level": "Intermediate", "mapped_skill": "Power BI"},
        {"title": "Python for Data Science and Machine Learning Bootcamp", "provider": "SWAYAM / NPTEL", "category": "Technical", "duration_hours": 40, "rating": 4.8, "level": "Beginner", "mapped_skill": "Python"},
        {"title": "Mastering SQL & Relational Database Design", "provider": "edX / IIT Madras", "category": "Technical", "duration_hours": 28, "rating": 4.9, "level": "Beginner", "mapped_skill": "SQL"},
        {"title": "Good Clinical Practice (GCP) & Clinical Trials Certification", "provider": "AIIA / Ministry of Ayush", "category": "Ayush/Domain", "duration_hours": 20, "rating": 4.9, "level": "Intermediate", "mapped_skill": "Clinical Trials & GCP"},
        {"title": "AYUSH Health Informatics & Digital Registries", "provider": "All India Institute of Ayurveda", "category": "Ayush/Domain", "duration_hours": 30, "rating": 4.9, "level": "Advanced", "mapped_skill": "AYUSH Health Informatics"},
        {"title": "Phytochemistry Fingerprinting & Herbal Standardization", "provider": "BHU / NPTEL", "category": "Ayush/Domain", "duration_hours": 25, "rating": 4.8, "level": "Intermediate", "mapped_skill": "Phytochemistry & Quality Control"},
        {"title": "Applied Statistics & Experimental Design in Python", "provider": "Coursera / Stanford Online", "category": "Technical", "duration_hours": 35, "rating": 4.8, "level": "Intermediate", "mapped_skill": "Applied Statistics"},
        {"title": "Natural Language Processing (NLP) with Transformers", "provider": "DeepLearning.AI", "category": "Technical", "duration_hours": 45, "rating": 4.9, "level": "Advanced", "mapped_skill": "Natural Language Processing (NLP)"},
        {"title": "Full Stack Web Development with React & FastAPI", "provider": "Coursera / Meta", "category": "Technical", "duration_hours": 50, "rating": 4.8, "level": "Intermediate", "mapped_skill": "React"},
        {"title": "Docker & Kubernetes Containerization for Production", "provider": "SWAYAM / IIT Delhi", "category": "Technical", "duration_hours": 30, "rating": 4.7, "level": "Intermediate", "mapped_skill": "Docker"},
        {"title": "Dravyaguna & Computational Herbal Pharmacodynamics", "provider": "All India Institute of Ayurveda", "category": "Ayush/Domain", "duration_hours": 28, "rating": 4.9, "level": "Advanced", "mapped_skill": "Dravyaguna (Pharmacology)"},
        {"title": "Bioinformatics: Sequences, Structures & Genomes", "provider": "edX / UC San Diego", "category": "Ayush/Domain", "duration_hours": 36, "rating": 4.8, "level": "Intermediate", "mapped_skill": "Bioinformatics & Genomic Analytics"},
        {"title": "Pharmacovigilance & Adverse Drug Reaction Reporting (Ayush)", "provider": "Ministry of Ayush", "category": "Ayush/Domain", "duration_hours": 18, "rating": 4.7, "level": "Beginner", "mapped_skill": "Pharmacovigilance (Ayush)"},
        {"title": "Advanced Excel for Business & Clinical Data Analysis", "provider": "SWAYAM", "category": "Technical", "duration_hours": 20, "rating": 4.8, "level": "Beginner", "mapped_skill": "Advanced Excel"},
        {"title": "Tableau Desktop Specialist Certification Prep", "provider": "Coursera", "category": "Technical", "duration_hours": 24, "rating": 4.8, "level": "Intermediate", "mapped_skill": "Tableau"},
        {"title": "AWS Cloud Practitioner & Cloud Architecture", "provider": "AWS Training", "category": "Technical", "duration_hours": 30, "rating": 4.8, "level": "Beginner", "mapped_skill": "AWS"},
        {"title": "Agile & Scrum Project Leadership", "provider": "Coursera / Atlassian", "category": "Soft", "duration_hours": 20, "rating": 4.7, "level": "Beginner", "mapped_skill": "Agile Project Management"},
        {"title": "Executive Business & Scientific Communication", "provider": "NPTEL / IIT Bombay", "category": "Soft", "duration_hours": 16, "rating": 4.9, "level": "Beginner", "mapped_skill": "Communication Skills"},
        {"title": "Deep Learning Specialization with PyTorch", "provider": "DeepLearning.AI", "category": "Technical", "duration_hours": 48, "rating": 4.9, "level": "Advanced", "mapped_skill": "PyTorch"},
        {"title": "FastAPI & Microservices Architecture in Python", "provider": "edX", "category": "Technical", "duration_hours": 26, "rating": 4.8, "level": "Intermediate", "mapped_skill": "FastAPI"}
    ]

    for cdata in courses_data:
        c_obj = Course(
            title=cdata["title"],
            provider=cdata["provider"],
            description=f"Industry-curated certification course designed to bridge critical skill gaps in {cdata['mapped_skill']}.",
            category=cdata["category"],
            duration_hours=cdata["duration_hours"],
            rating=cdata["rating"],
            level=cdata["level"],
            url="https://swayam.gov.in",
            mapped_skill=cdata["mapped_skill"]
        )
        db.add(c_obj)
    db.commit()

    # -------------------------------------------------------------
    # 12. SEED APPLICATIONS (Across various pipeline stages)
    # -------------------------------------------------------------
    app_statuses = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Applied"]
    for i, sp in enumerate(student_profile_objs[:8]):
        status_val = app_statuses[i % len(app_statuses)]
        app1 = Application(
            opportunity_type="internship",
            opportunity_id=internship_objs[i % len(internship_objs)].id,
            student_id=sp.id,
            match_score=88.5 - (i * 2.0),
            status=status_val,
            cover_note=f"I am deeply interested in applying my {sp.career_interest} skillset to your research initiative.",
            interview_date="2026-09-18 11:00 AM IST" if status_val in ["Interview", "Selected"] else None,
            interview_link="https://meet.google.com/connect-interview-room" if status_val in ["Interview", "Selected"] else None,
            feedback="Exceptional technical assessment scores and relevant portfolio projects." if status_val in ["Shortlisted", "Interview", "Selected"] else ""
        )
        db.add(app1)

        app2 = Application(
            opportunity_type="job",
            opportunity_id=job_objs[i % len(job_objs)].id,
            student_id=sp.id,
            match_score=91.0 - (i * 1.5),
            status="Shortlisted" if i % 2 == 0 else "Applied",
            cover_note="Applying with strong academic record and verified domain skills."
        )
        db.add(app2)
    db.commit()

    # -------------------------------------------------------------
    # 13. SEED RESEARCH COLLABORATIONS & MENTORSHIPS
    # -------------------------------------------------------------
    rc1 = ResearchCollaboration(
        industry_id=industry_profile_objs[0].id, # Dabur
        academician_id=academician_profile_objs[0].id, # Dr. Rajesh Verma (AIIA)
        title="AI-Assisted Quality Fingerprinting for Classical Ayurvedic Formulations",
        description="Joint multi-centric research initiative developing ML algorithms for HPTLC chromatography standardization.",
        domain="Ayush & Clinical AI",
        budget="₹25,00,000",
        status="In Progress",
        duration_months=18
    )
    db.add(rc1)

    rc2 = ResearchCollaboration(
        industry_id=industry_profile_objs[3].id, # TCS
        academician_id=academician_profile_objs[1].id, # Prof. Anita Deshmukh (DTU)
        title="Biomedical Large Language Models for Electronic Health Records",
        description="Developing fine-tuned clinical NLP models for automated morbidity extraction and GCP audit trails.",
        domain="Healthcare NLP & AI",
        budget="₹35,00,000",
        status="Open",
        duration_months=24
    )
    db.add(rc2)

    # Mentorship session
    m1 = Mentorship(
        mentor_id=academician_profile_objs[0].user_id,
        mentee_id=student_profile_objs[0].user_id,
        topic="Strategic Career Roadmap: Becoming a Lead Healthcare Data Analyst",
        status="Accepted",
        scheduled_time="2026-09-12 16:30 IST",
        meeting_link="https://meet.google.com/aiia-mentor-room",
        notes="Focus on bridging Power BI and clinical GCP compliance certifications."
    )
    db.add(m1)
    db.commit()

    print("[OK] Seed data populated successfully!")
    print(f"    - Users: {db.query(User).count()}")
    print(f"    - Students: {db.query(StudentProfile).count()}")
    print(f"    - Industries: {db.query(IndustryProfile).count()}")
    print(f"    - Academicians: {db.query(AcademicianProfile).count()}")
    print(f"    - Institutions: {db.query(InstitutionProfile).count()}")
    print(f"    - Skills: {db.query(Skill).count()}")
    print(f"    - Career Roles: {db.query(CareerRole).count()}")
    print(f"    - Internships: {db.query(Internship).count()}")
    print(f"    - Jobs: {db.query(Job).count()}")
    print(f"    - Courses: {db.query(Course).count()}")
    print(f"    - Applications: {db.query(Application).count()}")
    db.close()

if __name__ == "__main__":
    seed_database()
