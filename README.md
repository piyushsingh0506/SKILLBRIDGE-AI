# 🚀 SkillBridge AI

## AI-Powered Skill Mapping & Academia–Industry Connect

> **From Skills to Opportunities — One Connected Ecosystem**

🌐 **Live Demo:** [SkillBridge AI](https://skillbridge-ai-nu-cyan.vercel.app)

---

## 📌 About the Project

SkillBridge AI is an AI-powered platform designed to bridge the gap between students' academic skills and industry requirements.

The platform analyzes a student's current skills against the skills required for a selected career and identifies:

- Strong skills
- Missing skills and skill gaps
- Skill-match scores
- Personalized skill improvement recommendations
- Career readiness insights

The goal is to help students understand which skills they need to improve to better align with their desired career paths.

---

## 🎯 Problem Statement

There is a gap between the skills students develop during their academic journey and the skills required by industries.

### Problems for Students
- Lack of awareness about industry-required skills.
- Difficulty identifying personal skill gaps.
- Lack of personalized career guidance.
- Uncertainty about which skills to improve.

### Problems for Educational Institutions
- Difficulty identifying common skill gaps among students.
- Lack of data-driven training decisions.
- Difficulty aligning training programs with industry requirements.

### Problems for Industry
- Changing skill requirements.
- Difficulty identifying industry-ready talent.
- Skill mismatches between candidates and job roles.

---

## 💡 Proposed Solution

SkillBridge AI provides a centralized platform for skill mapping and analysis.

The system:

1. Registers students.
2. Creates student profiles.
3. Collects students' existing skills.
4. Defines career-specific required skills.
5. Compares current skills with required career skills.
6. Identifies skill gaps.
7. Calculates skill-match or readiness scores.
8. Provides personalized recommendations.
9. Helps institutions understand training needs.

---

## 🔄 System Workflow

```text
Student Registration
        ↓
Student Login
        ↓
Student Profile
        ↓
Select Career Goal
        ↓
Skill Assessment / Skill Input
        ↓
AI-Based Skill Mapping
        ↓
Compare Current Skills
with Required Career Skills
        ↓
Skill Gap Analysis
        ↓
Calculate Skill-Match Score
        ↓
Personalized Recommendations
        ↓
Improved Career Readiness
```

---

## ✨ Key Features

### 👨‍🎓 Student Module
- Student registration and login.
- Student profile management.
- Skill input and assessment.
- Career goal selection.
- Skill-gap analysis.
- Skill-match score.
- Personalized skill improvement recommendations.

### 🧠 AI Skill Mapping
- Compares student skills with career requirements.
- Identifies matched skills.
- Detects missing skills.
- Calculates skill-match scores.
- Supports data-driven career guidance.

### 🏫 Institution Support
- Helps identify common student skill gaps.
- Supports planning of training programs.
- Helps align academic learning with industry needs.

### 🏢 Industry Alignment
- Defines required skills for career roles.
- Highlights competencies students may need to develop.
- Supports better alignment between education and employment.

---

## 🧮 Skill-Match Calculation

A simple skill coverage score can be calculated using:

**Skill Match Score = (Matched Required Skills / Total Required Skills) × 100**

### Example

Suppose a Data Analyst role requires 10 skills, and a student has 6 of those skills.

```text
Required Skills: 10
Matched Skills:  6
Missing Skills:  4

Skill Match Score = (6 / 10) × 100

Skill Match Score = 60%
```

This score represents skill coverage, not a guarantee of employment or job readiness.

---

## 🛠️ Technology Stack

The following technologies are suitable for this project. Adjust this section to match the technologies actually used in your implementation.

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript / React |
| Backend | Python / FastAPI / Streamlit, depending on implementation |
| Database | SQLite / MySQL, depending on configuration |
| Skill Matching | TF-IDF and Cosine Similarity |
| Deployment | Vercel |
| Version Control | Git and GitHub |

---

## 🏗️ System Architecture

```text
        Student
           |
           v
    Web Application
           |
           v
    User Authentication
           |
           v
    Student Skill Profile
           |
           v
    Skill Mapping Engine
           |
           v
    Career Skill Requirements
           |
           v
     Skill Gap Analysis
           |
           v
    Match Score and Results
           |
           v
 Personalized Recommendations
```

---

## 📊 Expected Outcomes

- Better awareness of industry-required skills.
- Clear identification of skill gaps.
- Personalized learning priorities.
- Improved alignment between academic learning and industry needs.
- Data-driven institutional training decisions.

---

## 🚀 Live Application

Try the deployed application:

### 👉 [Open SkillBridge AI](https://skillbridge-ai-nu-cyan.vercel.app)

---

## 💻 Run Locally

Follow these steps if your repository contains the relevant source code and configuration files.

### 1. Clone the Repository

```bash
git clone https://github.com/piyushsingh0506/SKILLBRIDGE-AI.git
```

### 2. Open the Project Folder

```bash
cd SKILLBRIDGE-AI
```

### 3. Install Dependencies

For a Node.js frontend:

```bash
npm install
```

For a Python backend, activate your virtual environment and install the dependencies listed in the project's `requirements.txt`:

```bash
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Linux / macOS:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Start the Application

Use the command corresponding to your actual project configuration.

For a Vite frontend:

```bash
npm run dev
```

For a Streamlit application:

```bash
streamlit run app.py
```

For a FastAPI backend:

```bash
uvicorn app.main:app --reload
```

These commands are alternatives for different project structures; they are not necessarily all required. Consult the repository's configuration and README for the correct entry points.

---

## 🔮 Future Enhancements

- Resume-based skill extraction.
- Personalized learning roadmaps.
- Skill assessments and quizzes.
- Integration with online learning platforms.
- Institution-level analytics.
- Industry skill requirement updates.
- Internship and placement recommendations.
- Progress tracking and skill improvement reports.

---

## 🌟 Advantages

- Easy identification of missing skills.
- Career-focused recommendations.
- Better awareness of industry expectations.
- Support for data-driven educational planning.
- Potential to scale across different career domains.

---

## 👨‍💻 Developer

**Piyush Singh**

- GitHub: [piyushsingh0506](https://github.com/piyushsingh0506)
- LinkedIn: [Piyush Singh](https://linkedin.com/in/piyush-singh-4b5816328)

---

## 📄 License

This project can be distributed under the MIT License if you choose to include an MIT license in the repository. Add a `LICENSE` file before claiming that the project is licensed under MIT.

---

⭐ **If you find SkillBridge AI useful, consider starring the repository on GitHub.**
