/**
 * 100% Client-Side Pure Frontend Store & API Adapter
 * Executes in-browser PDF parsing, client-side ATS evaluation, and localStorage data persistence.
 */

import { parsePdf } from './pdfParser';
import { analyzeResume, ATSResult, Suggestion } from './atsEngine';
import { getAIRecommendations } from './aiService';

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

export type { Suggestion };

export interface AnalysisDetails extends AnalysisHistoryItem {
  resumeText: string;
  jobDescription: string;
  suggestions: Suggestion[];
}

const STORAGE_KEYS = {
  CURRENT_USER: 'vitacv_user',
  TOKEN: 'vitacv_token',
  USERS_LIST: 'vitacv_users',
  ANALYSES: 'vitacv_analyses',
  BUILDER_DATA: 'vitacv_builder_data'
};

const DEFAULT_BUILDER_DATA: ResumeBuilderData = {
  name: 'Alex Morgan',
  title: 'Full Stack Software Engineer',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 019-2834',
  website: 'https://github.com/alexmorgan',
  summary: 'Detail-oriented Software Engineer with 4+ years of experience building scalable web applications using React, Next.js, and TypeScript. Passionate about clean architecture, performance optimization, and intuitive UI/UX design.',
  experience: [
    {
      company: 'TechCorp Solutions',
      role: 'Senior Frontend Developer',
      location: 'San Francisco, CA',
      dates: '2022 - Present',
      description: '• Spearheaded frontend modernization to Next.js, accelerating page load speeds by 42%.\n• Designed and shipped responsive component design system adopted by 15+ internal product teams.\n• Mentored 4 junior engineers on state management and automated testing workflows.'
    },
    {
      company: 'Digital Wave Studios',
      role: 'Frontend Software Engineer',
      location: 'Austin, TX',
      dates: '2020 - 2022',
      description: '• Developed high-throughput client dashboard interfaces with React, TypeScript, and Tailwind CSS.\n• Integrated REST and GraphQL APIs handling over 2M requests daily with sub-second response times.\n• Improved accessibility (WCAG 2.1 AA) compliance scores across primary consumer checkouts.'
    }
  ],
  education: [
    {
      school: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      dates: '2016 - 2020',
      grade: '3.8 GPA'
    }
  ],
  skills: [
    'React.js', 'Next.js', 'TypeScript', 'JavaScript (ES6+)',
    'Tailwind CSS', 'Node.js', 'REST APIs', 'Git / GitHub',
    'HTML5 / CSS3', 'Performance Tuning', 'UI/UX Design', 'CI/CD'
  ],
  projects: [
    {
      name: 'VitaCV - ATS Resume Optimizer',
      description: 'An AI-powered client-side ATS analysis tool and resume builder built with React, Next.js, and Tailwind CSS.',
      link: 'https://github.com/alexmorgan/vitacv'
    },
    {
      name: 'CloudPulse Analytics Dashboard',
      description: 'Real-time telemetry dashboard visualizing cluster health, query latencies, and server metrics.',
      link: 'https://cloudpulse.example.com'
    }
  ],
  selectedTemplate: 'executive'
};

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetItem(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`localStorage quota error saving ${key}:`, err);
  }
}

export const api = {
  // Authentication (Client-Side Local Storage)
  async login(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      throw new Error('Please enter both your email address and password.');
    }

    const users: Array<User & { passwordHash?: string }> = safeGetItem(STORAGE_KEYS.USERS_LIST, []);
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('No account found with this email. Please click "Create an account" below to register.');
    }

    if (user.passwordHash && user.passwordHash !== cleanPass) {
      throw new Error('Incorrect password. Please verify your password and try again.');
    }

    const token = 'vitacv_jwt_' + Math.random().toString(36).substring(2, 15) + Date.now();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
    }

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Please enter your full name (at least 2 characters).');
    }

    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const users: Array<User & { passwordHash?: string }> = safeGetItem(STORAGE_KEYS.USERS_LIST, []);
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 10),
      name: cleanName,
      email: cleanEmail,
      passwordHash: cleanPass
    };

    users.push(newUser);
    safeSetItem(STORAGE_KEYS.USERS_LIST, users);

    const token = 'vitacv_jwt_' + Math.random().toString(36).substring(2, 15) + Date.now();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email }));
    }

    return { token, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem('venum_token');
      localStorage.removeItem('venum_user');
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!token || !userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }
    return null;
  },

  // Resume In-Browser Analysis (Client-Side)
  async analyzeResume(file: File, jobDescription: string): Promise<AnalysisDetails> {
    // 1. Extract text directly inside the browser
    const resumeText = await parsePdf(file);

    // 2. Compute ATS scoring and breakdown rules
    const atsResult: ATSResult = analyzeResume(resumeText, jobDescription);

    // 3. Generate Smart AI recommendations
    const aiSuggestions = await getAIRecommendations(resumeText, jobDescription);

    // Combine suggestions and deduplicate
    const combinedSuggestions = [...atsResult.suggestions];
    const existingMessages = new Set(combinedSuggestions.map(s => s.message.toLowerCase().trim()));

    aiSuggestions.forEach(aiSug => {
      const msgKey = aiSug.message.toLowerCase().trim();
      if (!existingMessages.has(msgKey)) {
        combinedSuggestions.push(aiSug);
        existingMessages.add(msgKey);
      }
    });

    const analysisId = 'scan_' + Math.random().toString(36).substring(2, 11);
    const newAnalysis: AnalysisDetails = {
      id: analysisId,
      filename: file.name,
      score: atsResult.score,
      breakdown: atsResult.breakdown,
      sectionsFound: atsResult.sectionsFound,
      sectionsMissing: atsResult.sectionsMissing,
      suggestions: combinedSuggestions,
      resumeText,
      jobDescription,
      createdAt: new Date().toISOString()
    };

    // Save into localStorage history
    const historyList: AnalysisDetails[] = safeGetItem(STORAGE_KEYS.ANALYSES, []);
    historyList.unshift(newAnalysis);
    // Keep last 30 scans
    if (historyList.length > 30) historyList.pop();
    safeSetItem(STORAGE_KEYS.ANALYSES, historyList);

    return newAnalysis;
  },

  async getHistory(): Promise<AnalysisHistoryItem[]> {
    const list: AnalysisDetails[] = safeGetItem(STORAGE_KEYS.ANALYSES, []);
    return list.map(({ id, filename, score, breakdown, sectionsFound, sectionsMissing, createdAt }) => ({
      id,
      filename,
      score,
      breakdown,
      sectionsFound,
      sectionsMissing,
      createdAt
    }));
  },

  async getAnalysisDetails(id: string): Promise<AnalysisDetails> {
    const list: AnalysisDetails[] = safeGetItem(STORAGE_KEYS.ANALYSES, []);
    const found = list.find(a => a.id === id);
    if (found) return found;

    // If ID not found, return an auto-generated demo record for preview
    return {
      id,
      filename: 'Sample_Resume.pdf',
      score: 88,
      breakdown: { keywords: 85, formatting: 90, sections: 92, contact: 85 },
      sectionsFound: ['Education', 'Work Experience', 'Skills', 'Projects', 'Summary'],
      sectionsMissing: ['Certifications'],
      suggestions: [
        { category: 'Impact', message: 'Quantify your experience bullets with measurable percentage outcomes.', severity: 'high' },
        { category: 'Keywords', message: 'Include additional domain keywords like CI/CD, TypeScript, and Docker.', severity: 'medium' },
        { category: 'Formatting', message: 'Consistent reverse-chronological order observed throughout.', severity: 'low' }
      ],
      resumeText: 'Sample resume text loaded.',
      jobDescription: '',
      createdAt: new Date().toISOString()
    };
  },

  // Resume Builder Client-Side Storage
  async getBuilderData(): Promise<ResumeBuilderData> {
    return safeGetItem(STORAGE_KEYS.BUILDER_DATA, DEFAULT_BUILDER_DATA);
  },

  async saveBuilderData(data: ResumeBuilderData): Promise<ResumeBuilderData> {
    safeSetItem(STORAGE_KEYS.BUILDER_DATA, data);
    return data;
  }
};
