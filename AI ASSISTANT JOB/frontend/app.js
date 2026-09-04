/**
 * SkillBridge AI - Core Application Controller
 * Handles SPA navigation, views, forms, assessments, and real-time backend synchronization.
 */

import { Api, API_CONFIG } from './api.js';

// Application State
const state = {
    currentUser: null,
    currentView: 'landing',
    availableSkills: [],
    studentSkills: [],
    studentProfile: null,
    opportunities: [],
    assessmentQuestions: [],
    currentQuizIndex: 0,
    userAnswers: {},
    isBackendOnline: false
};

// ==========================================================================
// Toast Notification Engine
// ==========================================================================

export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span style="font-size: 1.1rem;">${icon}</span>
        <div style="flex: 1; font-size: 0.9rem;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px) scale(0.95)';
        setTimeout(() => toast.remove(), 250);
    }, 4000);
}

// ==========================================================================
// Modal Manager
// ==========================================================================

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function initModalListeners() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-close-modal');
            closeModal(target);
        });
    });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.classList.remove('active');
            }
        });
    });
}

// ==========================================================================
// Backend Status Watchdog
// ==========================================================================

async function checkBackendStatus() {
    const dot = document.getElementById('backend-status-dot');
    const text = document.getElementById('backend-status-text');

    if (!dot || !text) return;

    dot.className = 'status-indicator checking';
    text.textContent = 'Connecting...';

    try {
        const res = await Api.checkHealth();
        if (res && res.status === 'healthy') {
            state.isBackendOnline = true;
            dot.className = 'status-indicator online';
            text.textContent = 'FastAPI Online';
        } else {
            throw new Error();
        }
    } catch {
        state.isBackendOnline = false;
        dot.className = 'status-indicator';
        text.textContent = 'Backend Offline';
    }
}

// ==========================================================================
// View Routing & Navigation
// ==========================================================================

export function switchView(viewName) {
    state.currentView = viewName;

    // Update section display
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update sidebar active link
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Auto load view data
    if (viewName === 'dashboard') loadDashboardData();
    if (viewName === 'profile') loadProfileData();
    if (viewName === 'skills') loadSkillsData();
    if (viewName === 'skill-gap') loadSkillGapData();
    if (viewName === 'assessments') resetAndInitAssessmentView();
    if (viewName === 'opportunities') loadOpportunitiesData();
}

function updateAuthUI() {
    const guestActions = document.getElementById('guest-actions');
    const userActions = document.getElementById('user-actions');
    const userNavName = document.getElementById('user-nav-name');
    const userNavRole = document.getElementById('user-nav-role');
    const userAvatar = document.getElementById('user-avatar-text');
    const sidebar = document.getElementById('app-sidebar');

    if (state.currentUser) {
        if (guestActions) guestActions.style.display = 'none';
        if (userActions) userActions.style.display = 'flex';
        if (sidebar) sidebar.style.display = 'flex';

        if (userNavName) userNavName.textContent = state.currentUser.name;
        if (userNavRole) userNavRole.textContent = state.currentUser.role;
        if (userAvatar) userAvatar.textContent = state.currentUser.name.charAt(0).toUpperCase();

        const dashName = document.getElementById('dash-user-name');
        if (dashName) dashName.textContent = state.currentUser.name.split(' ')[0];

        // If on landing, switch to dashboard
        if (state.currentView === 'landing') {
            switchView('dashboard');
        }
    } else {
        if (guestActions) guestActions.style.display = 'flex';
        if (userActions) userActions.style.display = 'none';
        switchView('landing');
    }
}

// ==========================================================================
// Dashboard Controller
// ==========================================================================

async function loadDashboardData() {
    try {
        // Fetch dashboard stats from FastAPI
        let dash = null;
        try {
            dash = await Api.student.getDashboard();
        } catch {
            dash = null;
        }

        const totalSkillsEl = document.getElementById('stat-total-skills');
        const avgScoreEl = document.getElementById('stat-avg-score');
        const totalAppsEl = document.getElementById('stat-applications');
        const selectedEl = document.getElementById('stat-selected');
        const careerGoalEl = document.getElementById('dash-career-goal');

        if (dash) {
            if (totalSkillsEl) totalSkillsEl.textContent = dash.total_skills;
            if (avgScoreEl) avgScoreEl.textContent = `${dash.average_skill_score}%`;
            if (totalAppsEl) totalAppsEl.textContent = dash.total_applications;
            if (selectedEl) selectedEl.textContent = dash.selected;
            if (careerGoalEl) careerGoalEl.textContent = dash.career_goal || 'Not Set';
        } else {
            // Load from profile and skills if dashboard route throws not found
            await loadProfileData();
            await loadSkillsData();
        }

        // Preview top skills
        renderDashboardSkillsPreview();
        renderDashboardOppsPreview();

    } catch (err) {
        console.error("Dashboard load error:", err);
    }
}

async function renderDashboardSkillsPreview() {
    const previewList = document.getElementById('dash-skills-preview-list');
    if (!previewList) return;

    try {
        const skills = await Api.student.getSkills();
        state.studentSkills = skills;
        const available = await Api.student.getAvailableSkills();
        state.availableSkills = available;

        if (!skills || skills.length === 0) {
            previewList.innerHTML = `
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    No skills mapped yet. Click <a href="#" id="link-add-first-skill">Add Skills</a> to build your matrix.
                </p>
            `;
            document.getElementById('link-add-first-skill')?.addEventListener('click', (e) => {
                e.preventDefault();
                switchView('skills');
            });
            return;
        }

        const skillNameMap = {};
        available.forEach(s => skillNameMap[s.id] = s.name);

        previewList.innerHTML = skills.slice(0, 4).map(s => {
            const name = skillNameMap[s.skill_id] || `Skill #${s.skill_id}`;
            return `
                <div style="margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                        <span style="font-weight: 600;">${name}</span>
                        <span style="color: var(--accent-primary); font-weight: 700;">${s.score}%</span>
                    </div>
                    <div class="skill-progress-bar" style="margin-bottom: 0;">
                        <div class="skill-progress-fill" style="width: ${s.score}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    } catch {
        previewList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Skills preview unavailable</p>`;
    }
}

async function renderDashboardOppsPreview() {
    const previewList = document.getElementById('dash-opps-preview-list');
    if (!previewList) return;

    try {
        const opps = await Api.opportunities.getAll();
        state.opportunities = opps;

        if (!opps || opps.length === 0) {
            previewList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No active opportunities posted yet.</p>`;
            return;
        }

        previewList.innerHTML = opps.slice(0, 3).map(op => `
            <div style="padding: 0.75rem; background: rgba(15, 23, 42, 0.5); border-radius: 10px; margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${op.title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${op.location || 'Remote'}</div>
                </div>
                <span class="opportunity-type-pill" style="font-size: 0.7rem;">${op.opportunity_type}</span>
            </div>
        `).join('');
    } catch {
        previewList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Opportunities preview unavailable</p>`;
    }
}

// ==========================================================================
// Student Profile Controller
// ==========================================================================

async function loadProfileData() {
    try {
        const profile = await Api.student.getProfile();
        state.studentProfile = profile;

        document.getElementById('profile-college').value = profile.college || '';
        document.getElementById('profile-degree').value = profile.degree || '';
        document.getElementById('profile-branch').value = profile.branch || '';
        document.getElementById('profile-grad-year').value = profile.graduation_year || '';
        document.getElementById('profile-career-goal').value = profile.career_goal || '';

        const goalBadge = document.getElementById('dash-career-goal');
        if (goalBadge) goalBadge.textContent = profile.career_goal || 'Not Set';

    } catch (err) {
        console.warn("Profile fetch info:", err.message);
    }
}

async function handleProfileSave(e) {
    e.preventDefault();
    const data = {
        college: document.getElementById('profile-college').value.trim(),
        degree: document.getElementById('profile-degree').value.trim(),
        branch: document.getElementById('profile-branch').value.trim(),
        graduation_year: Number(document.getElementById('profile-grad-year').value),
        career_goal: document.getElementById('profile-career-goal').value
    };

    try {
        if (state.studentProfile) {
            await Api.student.updateProfile(data);
            showToast("Profile updated successfully!", "success");
        } else {
            await Api.student.createProfile(data);
            showToast("Profile created successfully!", "success");
        }
        await loadProfileData();
        switchView('dashboard');
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ==========================================================================
// Skill Matrix Controller
// ==========================================================================

async function loadSkillsData() {
    const grid = document.getElementById('student-skills-grid');
    if (!grid) return;

    try {
        const available = await Api.student.getAvailableSkills();
        state.availableSkills = available;

        // Populate dropdown in Add Skill modal
        const skillSelect = document.getElementById('select-available-skill');
        if (skillSelect) {
            skillSelect.innerHTML = `<option value="">Choose a skill...</option>` +
                available.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }

        const skills = await Api.student.getSkills();
        state.studentSkills = skills;

        const skillNameMap = {};
        available.forEach(s => skillNameMap[s.id] = s.name);

        if (skills.length === 0) {
            grid.innerHTML = `
                <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">⚡</div>
                    <h3>No Skills Added Yet</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Add technical skills to benchmark your profile for jobs and assessments.</p>
                    <button class="btn btn-primary" id="btn-empty-add-skill">+ Add Your First Skill</button>
                </div>
            `;
            document.getElementById('btn-empty-add-skill')?.addEventListener('click', () => openAddSkillModal());
            return;
        }

        grid.innerHTML = skills.map(sk => {
            const name = skillNameMap[sk.skill_id] || `Skill #${sk.skill_id}`;
            let levelLabel = "Beginner";
            if (sk.score >= 80) levelLabel = "Expert";
            else if (sk.score >= 60) levelLabel = "Proficient";
            else if (sk.score >= 40) levelLabel = "Intermediate";

            return `
                <div class="skill-card">
                    <div>
                        <div class="skill-card-top">
                            <span class="skill-name">${name}</span>
                            <span class="skill-score-pill">${sk.score}%</span>
                        </div>
                        <div class="skill-progress-bar">
                            <div class="skill-progress-fill" style="width: ${sk.score}%;"></div>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">
                            Level: <strong style="color: var(--accent-cyan);">${levelLabel}</strong>
                        </div>
                    </div>
                    <div class="skill-card-actions">
                        <button class="btn btn-secondary btn-sm btn-edit-skill" data-id="${sk.id}" data-score="${sk.score}" data-name="${name}">Edit</button>
                        <button class="btn btn-danger btn-sm btn-del-skill" data-id="${sk.id}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        // Attach action buttons
        grid.querySelectorAll('.btn-edit-skill').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const score = btn.dataset.score;
                const name = btn.dataset.name;
                openEditSkillModal(id, score, name);
            });
        });

        grid.querySelectorAll('.btn-del-skill').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm("Are you sure you want to remove this skill?")) {
                    try {
                        await Api.student.deleteSkill(btn.dataset.id);
                        showToast("Skill deleted", "success");
                        loadSkillsData();
                    } catch (err) {
                        showToast(err.message, "error");
                    }
                }
            });
        });

    } catch (err) {
        grid.innerHTML = `<p style="color: var(--accent-rose);">Error loading skills: ${err.message}</p>`;
    }
}

function openAddSkillModal() {
    document.getElementById('skill-modal-title').textContent = 'Add Skill to Profile';
    document.getElementById('edit-skill-id').value = '';
    document.getElementById('group-skill-select').style.display = 'block';
    document.getElementById('select-available-skill').required = true;
    document.getElementById('skill-score-slider').value = 75;
    document.getElementById('skill-score-display').textContent = '75%';
    openModal('modal-skill');
}

function openEditSkillModal(skillId, currentScore, skillName) {
    document.getElementById('skill-modal-title').textContent = `Update ${skillName} Score`;
    document.getElementById('edit-skill-id').value = skillId;
    document.getElementById('group-skill-select').style.display = 'none';
    document.getElementById('select-available-skill').required = false;
    document.getElementById('skill-score-slider').value = currentScore;
    document.getElementById('skill-score-display').textContent = `${currentScore}%`;
    openModal('modal-skill');
}

async function handleSkillFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-skill-id').value;
    const score = Number(document.getElementById('skill-score-slider').value);

    try {
        if (editId) {
            // Update
            await Api.student.updateSkill(editId, score);
            showToast("Skill score updated!", "success");
        } else {
            // Add
            const skillId = document.getElementById('select-available-skill').value;
            if (!skillId) {
                showToast("Please select a skill", "error");
                return;
            }
            await Api.student.addSkill(skillId, score);
            showToast("Skill added to profile!", "success");
        }
        closeModal('modal-skill');
        loadSkillsData();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ==========================================================================
// AI Skill Gap Analysis Controller
// ==========================================================================

async function loadSkillGapData() {
    try {
        const data = await Api.skillGap.getAnalysis();

        // Update radial score gauge
        const score = data.match_score || 0;
        const radialPath = document.getElementById('radial-score-path');
        const radialText = document.getElementById('radial-score-text');
        const targetRoleLabel = document.getElementById('gap-target-role-label');
        const summaryDesc = document.getElementById('gap-summary-desc');

        if (radialPath) radialPath.setAttribute('stroke-dasharray', `${score}, 100`);
        if (radialText) radialText.textContent = `${Math.round(score)}%`;
        if (targetRoleLabel) targetRoleLabel.textContent = `Target: ${data.career_goal}`;

        if (summaryDesc) {
            summaryDesc.innerHTML = `Your overall alignment with standard industry benchmark requirements for <strong>${data.career_goal}</strong> is <strong>${score}%</strong>.`;
        }

        // Counts
        document.getElementById('gap-strong-count').textContent = data.strong_skills ? data.strong_skills.length : 0;
        document.getElementById('gap-deficit-count').textContent = data.skill_gaps ? data.skill_gaps.length : 0;
        document.getElementById('gap-total-req-count').textContent = data.total_required_skills || 0;

        // Render Strong Skills List
        const strongList = document.getElementById('gap-strong-skills-list');
        if (strongList) {
            if (!data.strong_skills || data.strong_skills.length === 0) {
                strongList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No skills currently exceed the benchmark level.</p>`;
            } else {
                strongList.innerHTML = data.strong_skills.map(s => `
                    <div class="gap-item-card">
                        <div class="gap-item-header">
                            <span style="font-weight: 700;">${s.skill_name}</span>
                            <span class="gap-status-badge strong">Strong</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
                            <span>Your Score: <strong style="color: var(--accent-emerald);">${s.student_score}%</strong></span>
                            <span>Required: ${s.required_score}%</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render Deficit Skills List
        const deficitList = document.getElementById('gap-deficit-skills-list');
        if (deficitList) {
            if (!data.skill_gaps || data.skill_gaps.length === 0) {
                deficitList.innerHTML = `<p style="color: var(--accent-emerald); font-size: 0.9rem;">🎉 Amazing! You have met all baseline requirements for this role.</p>`;
            } else {
                deficitList.innerHTML = data.skill_gaps.map(g => `
                    <div class="gap-item-card">
                        <div class="gap-item-header">
                            <span style="font-weight: 700;">${g.skill_name}</span>
                            <span class="gap-status-badge needs-improvement">Deficit: -${g.gap}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
                            <span>Your Score: <strong style="color: var(--accent-rose);">${g.student_score}%</strong></span>
                            <span>Required Benchmark: <strong>${g.required_score}%</strong></span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render Recommendations
        const recList = document.getElementById('gap-recommendations-list');
        if (recList) {
            if (!data.recommendations || data.recommendations.length === 0) {
                recList.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.9rem;">Keep maintaining your current expertise through real-world projects!</p>`;
            } else {
                recList.innerHTML = data.recommendations.map(r => `
                    <div class="recommendation-card">
                        <div class="recommendation-icon">⚡</div>
                        <div style="font-size: 0.95rem; color: var(--text-light);">${r}</div>
                    </div>
                `).join('');
            }
        }

    } catch (err) {
        showToast(err.message, "error");
    }
}

// ==========================================================================
// Assessment & Quiz Controller
// ==========================================================================

function resetAndInitAssessmentView() {
    document.getElementById('quiz-launcher-card').style.display = 'block';
    document.getElementById('quiz-active-interface').style.display = 'none';
    document.getElementById('quiz-result-card').style.display = 'none';
}

async function startQuiz() {
    try {
        const questions = await Api.assessments.getQuestions();
        if (!questions || questions.length === 0) {
            showToast("No assessment questions found in database.", "error");
            return;
        }

        state.assessmentQuestions = questions;
        state.currentQuizIndex = 0;
        state.userAnswers = {};

        document.getElementById('quiz-launcher-card').style.display = 'none';
        document.getElementById('quiz-active-interface').style.display = 'block';
        document.getElementById('quiz-result-card').style.display = 'none';

        const goal = state.studentProfile?.career_goal || "AI Engineer";
        document.getElementById('quiz-career-target-pill').textContent = `Target: ${goal}`;

        renderQuizQuestion();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function renderQuizQuestion() {
    const q = state.assessmentQuestions[state.currentQuizIndex];
    if (!q) return;

    const total = state.assessmentQuestions.length;
    document.getElementById('quiz-step-indicator').textContent = `Question ${state.currentQuizIndex + 1} of ${total}`;
    document.getElementById('quiz-question-text').textContent = q.question;

    const optionsContainer = document.getElementById('quiz-options-container');
    const options = [
        { letter: 'A', text: q.option_a },
        { letter: 'B', text: q.option_b },
        { letter: 'C', text: q.option_c },
        { letter: 'D', text: q.option_d }
    ];

    const currentSelected = state.userAnswers[q.id];

    optionsContainer.innerHTML = options.map(opt => `
        <div class="option-card ${currentSelected === opt.letter ? 'selected' : ''}" data-letter="${opt.letter}">
            <div class="option-badge">${opt.letter}</div>
            <div class="option-content">${opt.text}</div>
        </div>
    `).join('');

    // Attach click handlers
    optionsContainer.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
            const letter = card.dataset.letter;
            state.userAnswers[q.id] = letter;
            renderQuizQuestion();
        });
    });

    // Nav button state
    document.getElementById('btn-quiz-prev').disabled = state.currentQuizIndex === 0;

    const nextBtn = document.getElementById('btn-quiz-next');
    const submitBtn = document.getElementById('btn-quiz-submit');

    if (state.currentQuizIndex === total - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    }
}

async function submitQuizAnswers() {
    const answersList = Object.keys(state.userAnswers).map(qId => ({
        question_id: Number(qId),
        selected_answer: state.userAnswers[qId]
    }));

    if (answersList.length === 0) {
        showToast("Please select answers before submitting!", "error");
        return;
    }

    const career_goal = state.studentProfile?.career_goal || "AI Engineer";

    try {
        const result = await Api.assessments.submit(career_goal, answersList);

        // Show Results
        document.getElementById('quiz-active-interface').style.display = 'none';
        document.getElementById('quiz-result-card').style.display = 'block';

        document.getElementById('quiz-result-score').textContent = `${result.score}%`;
        document.getElementById('quiz-result-fraction').textContent = `${result.correct_answers} of ${result.total_questions} Questions Correct`;

        showToast("Assessment submitted & skill scores updated!", "success");
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ==========================================================================
// Opportunities Controller
// ==========================================================================

async function loadOpportunitiesData() {
    const grid = document.getElementById('opportunities-grid');
    if (!grid) return;

    try {
        const opps = await Api.opportunities.getAll();
        state.opportunities = opps;
        renderOpportunitiesList();
    } catch (err) {
        grid.innerHTML = `<p style="color: var(--accent-rose);">Error loading opportunities: ${err.message}</p>`;
    }
}

function renderOpportunitiesList() {
    const grid = document.getElementById('opportunities-grid');
    if (!grid) return;

    const search = document.getElementById('input-opps-search')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('select-opps-type')?.value || 'ALL';

    const filtered = state.opportunities.filter(op => {
        const matchText = (op.title + ' ' + (op.description || '') + ' ' + (op.location || '')).toLowerCase().includes(search);
        const matchType = typeFilter === 'ALL' || op.opportunity_type === typeFilter;
        return matchText && matchType;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
                <h3>No Matching Opportunities Found</h3>
                <p style="color: var(--text-secondary);">Try changing your search terms or filter selection.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(op => `
        <div class="opportunity-card">
            <div>
                <div class="opportunity-header">
                    <h3 class="opportunity-title">${op.title}</h3>
                    <span class="opportunity-type-pill">${op.opportunity_type}</span>
                </div>
                <div class="opportunity-location">
                    <span>📍</span> <span>${op.location || 'Remote'}</span>
                </div>
                <div class="opportunity-desc">${op.description}</div>
            </div>
            <div class="opportunity-footer">
                <span style="font-size: 0.8rem; color: var(--accent-emerald); font-weight: 600;">✓ Verified Role</span>
                <button class="btn btn-primary btn-sm btn-apply-opp" data-id="${op.id}" data-title="${op.title}">Apply Now</button>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.btn-apply-opp').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast(`Application submitted for "${btn.dataset.title}"!`, "success");
        });
    });
}

// ==========================================================================
// Event Listeners & Initialization
// ==========================================================================

function initAppListeners() {
    initModalListeners();

    // Nav clicks
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (view) switchView(view);
        });
    });

    // Brand click
    document.getElementById('nav-brand')?.addEventListener('click', () => switchView('dashboard'));

    // Swagger API docs link
    document.getElementById('link-api-docs')?.addEventListener('click', () => {
        const baseUrl = API_CONFIG.getBaseUrl();
        window.open(`${baseUrl}/docs`, '_blank');
    });

    // Backend Config Modal Trigger
    document.getElementById('btn-backend-status')?.addEventListener('click', () => {
        document.getElementById('input-api-url').value = API_CONFIG.getBaseUrl();
        openModal('modal-backend-config');
    });

    document.getElementById('btn-save-backend-url')?.addEventListener('click', () => {
        const val = document.getElementById('input-api-url').value;
        if (val) {
            API_CONFIG.setBaseUrl(val);
            closeModal('modal-backend-config');
            checkBackendStatus();
            showToast("Backend API URL updated!", "success");
        }
    });

    // Auth Triggers
    document.getElementById('btn-open-login')?.addEventListener('click', () => {
        document.getElementById('tab-login').click();
        openModal('modal-auth');
    });

    document.getElementById('btn-open-register')?.addEventListener('click', () => {
        document.getElementById('tab-register').click();
        openModal('modal-auth');
    });

    document.getElementById('btn-hero-register')?.addEventListener('click', () => {
        document.getElementById('tab-register').click();
        openModal('modal-auth');
    });

    document.getElementById('btn-logout')?.addEventListener('click', () => {
        Api.auth.logout();
        state.currentUser = null;
        updateAuthUI();
        showToast("Logged out successfully", "info");
    });

    // Demo student one-click login from landing
    document.getElementById('btn-hero-demo-login')?.addEventListener('click', async () => {
        try {
            await Api.auth.login("student@skillbridge.ai", "student123");
            const user = await Api.auth.getMe();
            state.currentUser = user;
            updateAuthUI();
            showToast(`Welcome ${user.name}!`, "success");
        } catch (err) {
            showToast(`Demo login error: ${err.message}. Run seed_data.py to populate demo account!`, "error");
            openModal('modal-auth');
        }
    });

    // Tab buttons in Auth Modal
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    tabLogin?.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
        document.getElementById('auth-modal-title').textContent = 'SkillBridge Sign In';
    });

    tabRegister?.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formLogin.style.display = 'none';
        formRegister.style.display = 'block';
        document.getElementById('auth-modal-title').textContent = 'Create SkillBridge Account';
    });

    // Form Login Submit
    formLogin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            await Api.auth.login(email, password);
            const user = await Api.auth.getMe();
            state.currentUser = user;
            closeModal('modal-auth');
            updateAuthUI();
            showToast(`Welcome back, ${user.name}!`, "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    // Form Register Submit
    formRegister?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;

        try {
            await Api.auth.register({ name, email, password, role });
            showToast("Account created! Logging in...", "success");
            await Api.auth.login(email, password);
            const user = await Api.auth.getMe();
            state.currentUser = user;
            closeModal('modal-auth');
            updateAuthUI();
            showToast(`Welcome to SkillBridge, ${user.name}!`, "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    // Profile Form
    document.getElementById('form-student-profile')?.addEventListener('submit', handleProfileSave);

    // Dashboard Triggers
    document.getElementById('btn-dash-quick-analysis')?.addEventListener('click', () => switchView('skill-gap'));
    document.getElementById('btn-dash-edit-profile')?.addEventListener('click', () => switchView('profile'));
    document.getElementById('btn-dash-view-skills')?.addEventListener('click', () => switchView('skills'));
    document.getElementById('btn-dash-view-opps')?.addEventListener('click', () => switchView('opportunities'));

    // Skills Triggers
    document.getElementById('btn-open-add-skill')?.addEventListener('click', openAddSkillModal);
    document.getElementById('skill-score-slider')?.addEventListener('input', (e) => {
        document.getElementById('skill-score-display').textContent = `${e.target.value}%`;
    });
    document.getElementById('form-add-skill')?.addEventListener('submit', handleSkillFormSubmit);

    // AI Gap Analysis Triggers
    document.getElementById('btn-refresh-gap-analysis')?.addEventListener('click', () => {
        loadSkillGapData();
        showToast("Recalculated AI Skill Gap", "info");
    });

    // Assessment Quiz Triggers
    document.getElementById('btn-start-quiz')?.addEventListener('click', startQuiz);
    document.getElementById('btn-quiz-prev')?.addEventListener('click', () => {
        if (state.currentQuizIndex > 0) {
            state.currentQuizIndex--;
            renderQuizQuestion();
        }
    });
    document.getElementById('btn-quiz-next')?.addEventListener('click', () => {
        if (state.currentQuizIndex < state.assessmentQuestions.length - 1) {
            state.currentQuizIndex++;
            renderQuizQuestion();
        }
    });
    document.getElementById('btn-quiz-submit')?.addEventListener('click', submitQuizAnswers);
    document.getElementById('btn-quiz-retry')?.addEventListener('click', startQuiz);
    document.getElementById('btn-quiz-goto-gap')?.addEventListener('click', () => switchView('skill-gap'));

    // Opportunities Filters
    document.getElementById('input-opps-search')?.addEventListener('input', renderOpportunitiesList);
    document.getElementById('select-opps-type')?.addEventListener('change', renderOpportunitiesList);

    // Industry Opportunity Create Form
    document.getElementById('form-create-opportunity')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            title: document.getElementById('opp-title').value.trim(),
            opportunity_type: document.getElementById('opp-type').value,
            location: document.getElementById('opp-location').value.trim(),
            description: document.getElementById('opp-desc').value.trim()
        };

        try {
            await Api.opportunities.create(data);
            showToast("Opportunity published successfully!", "success");
            e.target.reset();
            switchView('opportunities');
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    // Custom unauthorized listener
    window.addEventListener('auth:unauthorized', () => {
        state.currentUser = null;
        updateAuthUI();
        showToast("Session expired. Please sign in again.", "info");
    });
}

// ==========================================================================
// App Bootstrap
// ==========================================================================

async function init() {
    initAppListeners();
    await checkBackendStatus();

    // Try restoring existing user session
    const token = API_CONFIG.getToken();
    if (token) {
        try {
            const user = await Api.auth.getMe();
            state.currentUser = user;
        } catch {
            API_CONFIG.clearToken();
            state.currentUser = null;
        }
    }

    updateAuthUI();
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
