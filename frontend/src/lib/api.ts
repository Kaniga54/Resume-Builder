const isClient = typeof window !== 'undefined';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (isClient && window.location.hostname !== 'localhost'
    ? `${window.location.origin}/api/backend`
    : 'http://localhost:5000/api');

// Helper to get auth headers
function getHeaders(isMultipart = false) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vitacv_token') : null;
  const headers: Record<string, string> = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ResumeExperience {
  company: string;
  role: string;
  location: string;
  dates: string;
  description: string;
}

export interface ResumeEducation {
  school: string;
  degree: string;
  dates: string;
  grade: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  link: string;
}

export interface ResumeBuilderData {
  name: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  selectedTemplate: string;
}

export interface AnalysisHistoryItem {
  id: string;
  filename: string;
  score: number;
  breakdown: {
    keywords: number;
    formatting: number;
    sections: number;
    contact: number;
  };
  sectionsFound: string[];
  sectionsMissing: string[];
  createdAt: string;
}

export interface Suggestion {
  category: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AnalysisDetails extends AnalysisHistoryItem {
  resumeText: string;
  jobDescription: string;
  suggestions: Suggestion[];
}

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login.');
    }
    
    const data: AuthResponse = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('vitacv_token', data.token);
      localStorage.setItem('vitacv_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register.');
    }
    
    const data: AuthResponse = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('vitacv_token', data.token);
      localStorage.setItem('vitacv_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vitacv_token');
      localStorage.removeItem('vitacv_user');
    }
  },

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('vitacv_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vitacv_token');
    }
    return null;
  },

  // Resumes
  async analyzeResume(file: File, jobDescription: string): Promise<AnalysisDetails> {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    const res = await fetch(`${API_BASE_URL}/resumes/analyze`, {
      method: 'POST',
      headers: getHeaders(true), // Content-Type is set automatically by the browser for FormData
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to analyze resume.');
    }

    return await res.json();
  },

  async getHistory(): Promise<AnalysisHistoryItem[]> {
    const res = await fetch(`${API_BASE_URL}/resumes/history`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch history.');
    }

    return await res.json();
  },

  async getAnalysisDetails(id: string): Promise<AnalysisDetails> {
    const res = await fetch(`${API_BASE_URL}/resumes/analysis/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch analysis details.');
    }

    return await res.json();
  },

  // Resume Builder details
  async getBuilderData(): Promise<ResumeBuilderData> {
    const res = await fetch(`${API_BASE_URL}/resumes/builder`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to load builder details.');
    }

    return await res.json();
  },

  async saveBuilderData(data: ResumeBuilderData): Promise<ResumeBuilderData> {
    const res = await fetch(`${API_BASE_URL}/resumes/builder`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save builder details.');
    }

    return await res.json();
  }
};
