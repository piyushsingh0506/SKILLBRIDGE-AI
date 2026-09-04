/**
 * SkillBridge AI - API Client Module
 * Handles all HTTP communication with FastAPI backend, token management,
 * error handling, and demo mode fallbacks.
 */

const API_BASE_KEY = "skillbridge_api_base";
const TOKEN_KEY = "skillbridge_jwt_token";
const USER_KEY = "skillbridge_user_data";

export const API_CONFIG = {
    // Default to origin when running FastAPI or localhost:8000
    getBaseUrl: () => localStorage.getItem(API_BASE_KEY) || (window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:8000"),
    setBaseUrl: (url) => {
        let clean = url.trim().replace(/\/+$/, "");
        localStorage.setItem(API_BASE_KEY, clean);
    },
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
    clearToken: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
    getUser: () => {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY));
        } catch {
            return null;
        }
    },
    setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user))
};

/**
 * Universal fetch wrapper with authorization & JSON handling
 */
async function request(endpoint, options = {}) {
    const baseUrl = API_CONFIG.getBaseUrl();
    const token = API_CONFIG.getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token && !headers["Authorization"]) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    const url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized
        if (response.status === 401) {
            console.warn("Session expired or unauthorized request to:", endpoint);
            // If expired on protected route, trigger event
            window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }

        const contentType = response.headers.get("content-type");
        let data = null;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            let errorMsg = "An error occurred";
            if (data && typeof data === "object") {
                errorMsg = data.detail || data.message || JSON.stringify(data);
            } else if (typeof data === "string") {
                errorMsg = data;
            }
            throw new Error(errorMsg);
        }

        return data;
    } catch (err) {
        // Enhance network failure message
        if (err.name === "TypeError" && err.message.includes("fetch")) {
            throw new Error(`Cannot connect to backend at ${baseUrl}. Ensure FastAPI is running!`);
        }
        throw err;
    }
}

/**
 * SkillBridge API Services
 */
export const Api = {
    // Health Check
    async checkHealth() {
        return request("/health", { method: "GET" });
    },

    // Auth
    auth: {
        async register({ name, email, password, role }) {
            return request("/auth/register", {
                method: "POST",
                body: JSON.stringify({ name, email, password, role })
            });
        },

        async login(email, password) {
            // FastAPI OAuth2PasswordRequestForm expects urlencoded form data
            const baseUrl = API_CONFIG.getBaseUrl();
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const res = await fetch(`${baseUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || "Invalid login credentials");
            }

            if (data.access_token) {
                API_CONFIG.setToken(data.access_token);
            }
            return data;
        },

        async getMe() {
            const user = await request("/auth/me", { method: "GET" });
            API_CONFIG.setUser(user);
            return user;
        },

        logout() {
            API_CONFIG.clearToken();
            window.dispatchEvent(new CustomEvent("auth:logout"));
        }
    },

    // Student Profile & Skills
    student: {
        async getProfile() {
            return request("/students/profile", { method: "GET" });
        },

        async createProfile(profileData) {
            return request("/students/profile", {
                method: "POST",
                body: JSON.stringify(profileData)
            });
        },

        async updateProfile(profileData) {
            return request("/students/profile", {
                method: "PUT",
                body: JSON.stringify(profileData)
            });
        },

        async getAvailableSkills() {
            return request("/students/available-skills", { method: "GET" });
        },

        async getSkills() {
            return request("/students/skills", { method: "GET" });
        },

        async addSkill(skill_id, score) {
            return request("/students/skills", {
                method: "POST",
                body: JSON.stringify({ skill_id: Number(skill_id), score: Number(score) })
            });
        },

        async updateSkill(skill_id, score) {
            return request(`/students/skills/${skill_id}`, {
                method: "PUT",
                body: JSON.stringify({ score: Number(score) })
            });
        },

        async deleteSkill(skill_id) {
            return request(`/students/skills/${skill_id}`, {
                method: "DELETE"
            });
        },

        async getDashboard() {
            return request("/students/dashboard", { method: "GET" });
        }
    },

    // AI Skill Gap Analysis
    skillGap: {
        async getAnalysis() {
            return request("/skill-gap/analysis", { method: "GET" });
        }
    },

    // Assessments
    assessments: {
        async getQuestions() {
            return request("/assessments/questions", { method: "GET" });
        },

        async submit(career_goal, answers) {
            return request("/assessments/submit", {
                method: "POST",
                body: JSON.stringify({
                    career_goal,
                    answers
                })
            });
        }
    },

    // Opportunities
    opportunities: {
        async getAll() {
            return request("/opportunities/", { method: "GET" });
        },

        async getById(id) {
            return request(`/opportunities/${id}`, { method: "GET" });
        },

        async create(opportunityData) {
            return request("/opportunities/", {
                method: "POST",
                body: JSON.stringify(opportunityData)
            });
        },

        async addRequiredSkill(opportunityId, skill_id, required_level) {
            return request(`/opportunities/${opportunityId}/skills`, {
                method: "POST",
                body: JSON.stringify({
                    skill_id: Number(skill_id),
                    required_level: Number(required_level)
                })
            });
        }
    },

    // Industry-Academia Connect Hub
    connect: {
        async getPartnerships() {
            return request("/connect/partnerships", { method: "GET" });
        },
        async createPartnership(data) {
            return request("/connect/partnerships", {
                method: "POST",
                body: JSON.stringify(data)
            });
        },
        async updatePartnershipStatus(id, status) {
            return request(`/connect/partnerships/${id}/status`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });
        },
        async getCampusDrives() {
            return request("/connect/campus-drives", { method: "GET" });
        },
        async createCampusDrive(data) {
            return request("/connect/campus-drives", {
                method: "POST",
                body: JSON.stringify(data)
            });
        },
        async getIndustriesDirectory() {
            return request("/connect/directories/industries", { method: "GET" });
        },
        async getInstitutionsDirectory() {
            return request("/connect/directories/institutions", { method: "GET" });
        }
    },

    // Institution Suite
    institution: {
        async getProfile() {
            return request("/institutions/profile", { method: "GET" });
        },
        async updateProfile(data) {
            return request("/institutions/profile", {
                method: "PUT",
                body: JSON.stringify(data)
            });
        },
        async getAnalytics() {
            return request("/institutions/analytics", { method: "GET" });
        },
        async getStudents() {
            return request("/institutions/students", { method: "GET" });
        }
    },

    // Industry Suite
    industry: {
        async getProfile() {
            return request("/industry/profile", { method: "GET" });
        },
        async getApplications() {
            return request("/industry/applications", { method: "GET" });
        },
        async updateApplicationStatus(id, status) {
            return request(`/industry/applications/${id}/status`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });
        },
        async getTalentPool(params = {}) {
            const query = new URLSearchParams();
            if (params.career_goal) query.append("career_goal", params.career_goal);
            if (params.college) query.append("college", params.college);
            if (params.min_score) query.append("min_score", params.min_score);
            return request(`/industry/talent-pool?${query.toString()}`, { method: "GET" });
        }
    }
};
