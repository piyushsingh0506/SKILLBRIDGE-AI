import os
import sys

# Ensure backend path is on sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from app.database.database import SessionLocal, engine, Base
from app.database.models import (
    User,
    Industry,
    Institution,
    Partnership,
    CampusDrive,
    Application,
    Skill,
    CareerRequiredSkill,
    AssessmentQuestion,
    Opportunity,
    OpportunitySkill,
    Student,
    StudentSkill
)
from app.core.security import hash_password


def seed_database():
    print("Creating tables if not present...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Skills
        skills_data = [
            "Python Programming",
            "Machine Learning",
            "Deep Learning",
            "SQL & Database Design",
            "FastAPI & REST APIs",
            "React.js & Frontend",
            "Data Analysis & Pandas",
            "Cloud Computing (AWS/GCP)",
            "Docker & Containerization",
            "Git & Version Control",
            "Data Structures & Algorithms",
            "Natural Language Processing (NLP)"
        ]

        skill_map = {}
        for s_name in skills_data:
            existing = db.query(Skill).filter(Skill.name == s_name).first()
            if not existing:
                skill_obj = Skill(name=s_name)
                db.add(skill_obj)
                db.flush()
                skill_map[s_name] = skill_obj
            else:
                skill_map[s_name] = existing
        db.commit()
        print(f"[+] Seeded {len(skill_map)} Skills.")

        # 2. Seed Career Required Skills
        career_goals = {
            "AI Engineer": [
                ("Python Programming", 85.0),
                ("Machine Learning", 80.0),
                ("Deep Learning", 75.0),
                ("Natural Language Processing (NLP)", 70.0),
                ("FastAPI & REST APIs", 65.0),
                ("Docker & Containerization", 60.0)
            ],
            "Data Scientist": [
                ("Python Programming", 80.0),
                ("Data Analysis & Pandas", 85.0),
                ("SQL & Database Design", 80.0),
                ("Machine Learning", 75.0),
                ("Data Structures & Algorithms", 70.0)
            ],
            "Full Stack Developer": [
                ("Python Programming", 75.0),
                ("FastAPI & REST APIs", 85.0),
                ("React.js & Frontend", 85.0),
                ("SQL & Database Design", 75.0),
                ("Git & Version Control", 80.0),
                ("Docker & Containerization", 65.0)
            ],
            "Cloud & DevOps Engineer": [
                ("Cloud Computing (AWS/GCP)", 85.0),
                ("Docker & Containerization", 85.0),
                ("Python Programming", 70.0),
                ("Git & Version Control", 80.0),
                ("FastAPI & REST APIs", 60.0)
            ]
        }

        for career, req_skills in career_goals.items():
            for skill_name, req_level in req_skills:
                skill_obj = skill_map.get(skill_name)
                if not skill_obj:
                    continue
                existing = db.query(CareerRequiredSkill).filter(
                    CareerRequiredSkill.career_goal == career,
                    CareerRequiredSkill.skill_id == skill_obj.id
                ).first()
                if not existing:
                    crs = CareerRequiredSkill(
                        career_goal=career,
                        skill_id=skill_obj.id,
                        required_level=req_level
                    )
                    db.add(crs)
        db.commit()
        print("[+] Seeded Career Required Skill benchmarks.")

        # 3. Seed Assessment Questions
        questions_data = [
            # Python
            {
                "skill": "Python Programming",
                "question": "Which data structure in Python is mutable and ordered?",
                "option_a": "Tuple",
                "option_b": "List",
                "option_c": "Set",
                "option_d": "FrozenSet",
                "correct_answer": "B"
            },
            {
                "skill": "Python Programming",
                "question": "What is the purpose of Python's GIL (Global Interpreter Lock)?",
                "option_a": "To speed up multi-threaded CPU-bound programs",
                "option_b": "To ensure only one thread executes Python bytecode at a time",
                "option_c": "To compile Python code to machine code",
                "option_d": "To encrypt memory allocations",
                "correct_answer": "B"
            },
            # Machine Learning
            {
                "skill": "Machine Learning",
                "question": "Which evaluation metric is most appropriate for heavily imbalanced binary classification?",
                "option_a": "Accuracy",
                "option_b": "F1-Score / PR-AUC",
                "option_c": "Mean Squared Error",
                "option_d": "R-squared",
                "correct_answer": "B"
            },
            {
                "skill": "Machine Learning",
                "question": "What technique is used to combat overfitting in decision tree models?",
                "option_a": "Pruning and setting max_depth",
                "option_b": "Increasing the number of features arbitrarily",
                "option_c": "Removing the validation set",
                "option_d": "Standardizing target labels",
                "correct_answer": "A"
            },
            # SQL
            {
                "skill": "SQL & Database Design",
                "question": "Which SQL clause is used to filter records after performing a GROUP BY aggregation?",
                "option_a": "WHERE",
                "option_b": "ORDER BY",
                "option_c": "HAVING",
                "option_d": "LIMIT",
                "correct_answer": "C"
            },
            # FastAPI
            {
                "skill": "FastAPI & REST APIs",
                "question": "In FastAPI, what library is used under the hood for request data validation and serialization?",
                "option_a": "Django ORM",
                "option_b": "Pydantic",
                "option_c": "Flask-WTF",
                "option_d": "Marshmallow",
                "correct_answer": "B"
            },
            # React
            {
                "skill": "React.js & Frontend",
                "question": "Which hook is used in React to manage side effects such as data fetching and DOM mutations?",
                "option_a": "useState",
                "option_b": "useEffect",
                "option_c": "useContext",
                "option_d": "useCallback",
                "correct_answer": "B"
            },
            # Cloud
            {
                "skill": "Cloud Computing (AWS/GCP)",
                "question": "Which AWS compute service provides serverless event-driven execution without provisioning virtual machines?",
                "option_a": "Amazon EC2",
                "option_b": "Amazon Lambda",
                "option_c": "Amazon RDS",
                "option_d": "Amazon EBS",
                "correct_answer": "B"
            },
            # Docker
            {
                "skill": "Docker & Containerization",
                "question": "Which Docker instruction specifies the parent image from which the new container image builds?",
                "option_a": "RUN",
                "option_b": "FROM",
                "option_c": "COPY",
                "option_d": "EXPOSE",
                "correct_answer": "B"
            }
        ]

        for q in questions_data:
            skill_obj = skill_map.get(q["skill"])
            if not skill_obj:
                continue
            existing = db.query(AssessmentQuestion).filter(
                AssessmentQuestion.question == q["question"]
            ).first()
            if not existing:
                q_obj = AssessmentQuestion(
                    skill_id=skill_obj.id,
                    question=q["question"],
                    option_a=q["option_a"],
                    option_b=q["option_b"],
                    option_c=q["option_c"],
                    option_d=q["option_d"],
                    correct_answer=q["correct_answer"]
                )
                db.add(q_obj)
        db.commit()
        print("[+] Seeded Assessment Questions.")

        # 4. Seed Demo Industry & Opportunities
        industry_user = db.query(User).filter(User.email == "hr@techcorp.com").first()
        if not industry_user:
            industry_user = User(
                name="TechCorp Solutions",
                email="hr@techcorp.com",
                password=hash_password("password123"),
                role="industry",
                is_active=True
            )
            db.add(industry_user)
            db.flush()

            industry_profile = Industry(
                user_id=industry_user.id,
                company_name="TechCorp AI Labs",
                industry_type="Artificial Intelligence & Software",
                location="Bengaluru, India"
            )
            db.add(industry_profile)
            db.flush()

            # Create sample opportunities
            opp1 = Opportunity(
                industry_id=industry_profile.id,
                title="AI & Machine Learning Intern",
                description="Join our advanced applied AI team building intelligent agents, LLM integrations, and computer vision pipelines.",
                location="Bengaluru / Remote",
                opportunity_type="Internship"
            )
            db.add(opp1)
            db.flush()

            opp2 = Opportunity(
                industry_id=industry_profile.id,
                title="Junior Full Stack Engineer",
                description="Work across modern frontend frameworks (React/HTML5) and high-performance Python FastAPI microservices.",
                location="Hyderabad / Hybrid",
                opportunity_type="Full-time"
            )
            db.add(opp2)
            db.flush()

            # Add required skills
            if "Python Programming" in skill_map:
                db.add(OpportunitySkill(opportunity_id=opp1.id, skill_id=skill_map["Python Programming"].id, required_level=80.0))
            if "Machine Learning" in skill_map:
                db.add(OpportunitySkill(opportunity_id=opp1.id, skill_id=skill_map["Machine Learning"].id, required_level=75.0))
            if "FastAPI & REST APIs" in skill_map:
                db.add(OpportunitySkill(opportunity_id=opp2.id, skill_id=skill_map["FastAPI & REST APIs"].id, required_level=80.0))
            if "React.js & Frontend" in skill_map:
                db.add(OpportunitySkill(opportunity_id=opp2.id, skill_id=skill_map["React.js & Frontend"].id, required_level=75.0))

            db.commit()
            print("[+] Seeded Demo Industry & Opportunities.")

        # 5. Seed Demo Student
        demo_student_user = db.query(User).filter(User.email == "student@skillbridge.ai").first()
        if not demo_student_user:
            demo_student_user = User(
                name="Rahul Sharma",
                email="student@skillbridge.ai",
                password=hash_password("student123"),
                role="student",
                is_active=True
            )
            db.add(demo_student_user)
            db.flush()

        student_profile = db.query(Student).filter(Student.user_id == demo_student_user.id).first()
        if not student_profile:
            student_profile = Student(
                user_id=demo_student_user.id,
                college="National Institute of Technology",
                degree="B.Tech",
                branch="Computer Science & Engineering",
                graduation_year=2026,
                career_goal="AI Engineer"
            )
            db.add(student_profile)
            db.flush()

        demo_skills = [
            ("Python Programming", 85.0),
            ("Machine Learning", 65.0),
            ("SQL & Database Design", 70.0),
            ("FastAPI & REST APIs", 60.0)
        ]
        for skill_name, score in demo_skills:
            if skill_name in skill_map:
                sk_id = skill_map[skill_name].id
                existing_st_skill = db.query(StudentSkill).filter(
                    StudentSkill.student_id == student_profile.id,
                    StudentSkill.skill_id == sk_id
                ).first()
                if not existing_st_skill:
                    db.add(StudentSkill(student_id=student_profile.id, skill_id=sk_id, score=score))

        # 6. Seed Demo Institution
        inst_user = db.query(User).filter(User.email == "institution@skillbridge.ai").first()
        if not inst_user:
            inst_user = User(
                name="National Institute of Technology",
                email="institution@skillbridge.ai",
                password=hash_password("password123"),
                role="institution",
                is_active=True
            )
            db.add(inst_user)
            db.flush()

        inst_profile = db.query(Institution).filter(Institution.user_id == inst_user.id).first()
        if not inst_profile:
            inst_profile = Institution(
                user_id=inst_user.id,
                institution_name="National Institute of Technology",
                location="Bengaluru / New Delhi, India",
                website="https://nit.ac.in",
                contact_email="placements@nit.ac.in",
                accreditation="NAAC A++ Autonomous Institute",
                code="NIT-2026"
            )
            db.add(inst_profile)
            db.flush()
            db.commit()
            print("[+] Seeded Demo Institution (email: institution@skillbridge.ai / pwd: password123).")

        # 7. Seed Active MOUs / Partnerships between TechCorp & NIT
        ind_user_obj = db.query(User).filter(User.email == "hr@techcorp.com").first()
        if ind_user_obj:
            ind_prof = db.query(Industry).filter(Industry.user_id == ind_user_obj.id).first()
            if ind_prof and inst_profile:
                existing_mou = db.query(Partnership).filter(
                    Partnership.institution_id == inst_profile.id,
                    Partnership.industry_id == ind_prof.id
                ).first()
                if not existing_mou:
                    p1 = Partnership(
                        institution_id=inst_profile.id,
                        industry_id=ind_prof.id,
                        title="AI & Cloud Excellence Centre MOU",
                        partnership_type="MOU & Research",
                        description="Joint faculty development, student incubation, specialized AI electives, and priority campus hiring pipeline.",
                        status="Active",
                        established_date="Jan 2026",
                        initiated_by="industry"
                    )
                    p2 = Partnership(
                        institution_id=inst_profile.id,
                        industry_id=ind_prof.id,
                        title="Direct Industry Internship & Mentorship Program",
                        partnership_type="Internship Program",
                        description="Structured 6-month pre-placement internship training for final year Computer Science students.",
                        status="Active",
                        established_date="Feb 2026",
                        initiated_by="institution"
                    )
                    db.add(p1)
                    db.add(p2)
                    db.commit()
                    print("[+] Seeded Industry-Academia Partnerships & MOUs.")

                # 8. Seed Campus Drives
                existing_drive = db.query(CampusDrive).filter(CampusDrive.industry_id == ind_prof.id).first()
                if not existing_drive:
                    d1 = CampusDrive(
                        industry_id=ind_prof.id,
                        institution_id=inst_profile.id,
                        title="Annual AI & Cloud Campus Placement Drive 2026",
                        job_role="AI & Machine Learning Engineer",
                        package_or_stipend="₹14 - 18 LPA",
                        eligibility_criteria="B.Tech CS/IT with min 70% skill proficiency",
                        event_date="March 25, 2026",
                        mode="On-Campus",
                        status="Upcoming"
                    )
                    d2 = CampusDrive(
                        industry_id=ind_prof.id,
                        institution_id=inst_profile.id,
                        title="Graduate Full Stack Internship Drive",
                        job_role="Full Stack Trainee",
                        package_or_stipend="₹40,000 / month stipend",
                        eligibility_criteria="3rd & 4th year Engineering students",
                        event_date="April 10, 2026",
                        mode="Hybrid",
                        status="Upcoming"
                    )
                    db.add(d1)
                    db.add(d2)
                    db.commit()
                    print("[+] Seeded Campus Placement Drives.")

                # 9. Seed Student Application for Candidate Review Pipeline
                if student_profile:
                    opp = db.query(Opportunity).filter(Opportunity.industry_id == ind_prof.id).first()
                    if opp:
                        existing_app = db.query(Application).filter(
                            Application.student_id == student_profile.id,
                            Application.opportunity_id == opp.id
                        ).first()
                        if not existing_app:
                            app_obj = Application(
                                student_id=student_profile.id,
                                opportunity_id=opp.id,
                                status="Applied"
                            )
                            db.add(app_obj)
                            db.commit()
                            print("[+] Seeded sample Student Application for Industry Review.")

        print("[SUCCESS] Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
