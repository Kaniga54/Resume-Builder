import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ShieldCheck, Cpu, Zap, Award, CheckCircle, FileCheck2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#080C10] overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] radial-glow-1 pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] radial-glow-2 pointer-events-none rounded-full" />

      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Cpu className="h-3.5 w-3.5" />
            <span>Powered by GPT-4o-mini & Rule-Based ATS Parser</span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-tight">
            Analyze Your Resume for <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ATS Optimization</span> Instantly
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            VitaCV scans your resume against core applicant tracking rules, scores formatting alignment, extracts keywords, and uses AI to recommend critical changes that land interviews.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="glow-btn rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:opacity-95"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-gray-200 hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Graphic Placeholder Mockup */}
          <div className="mt-16 relative mx-auto max-w-4xl glass-card border border-white/10 p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-red-500/80" />
                <span className="h-3.5 w-3.5 rounded-full bg-yellow-500/80" />
                <span className="h-3.5 w-3.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-gray-500 font-semibold tracking-wider font-mono">VITACV_ANALYSIS_CONSOLE</span>
              <div className="w-14" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="glass-card border-emerald-500/10 p-5 bg-white/[0.01]">
                <span className="text-xs text-gray-400 font-semibold">Overall ATS Score</span>
                <div className="mt-4 flex items-center justify-between">
                  <div className="relative h-20 w-20 flex items-center justify-center">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="34" className="stroke-white/5 fill-transparent" strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" className="stroke-emerald-500 fill-transparent" strokeWidth="6" strokeDasharray="213" strokeDashoffset="42" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xl font-bold text-white">82%</span>
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">Excellent</span>
                    <p className="mt-1 text-xs text-gray-500">Ready to apply</p>
                  </div>
                </div>
              </div>

              <div className="glass-card border-white/5 p-5 md:col-span-2 bg-white/[0.01] flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-semibold">Missing Core Keywords</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Docker', 'Kubernetes', 'Redux Store', 'CI/CD Pipeline', 'Unit Testing', 'AWS Cloud'].map((kw) => (
                    <span key={kw} className="rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-xs text-red-400 flex items-center gap-1.5">
                      <Zap className="h-3 w-3" />
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-500">Incorporating these missing keywords raises your match score by up to +18%.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="w-full bg-[#06080C] border-t border-white/5 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white">Features Designed for Job Seekers</h2>
              <p className="mt-4 text-gray-400">Avoid the corporate resume black hole. VitaCV validates files using similar structures standard applicant tracking software runs.</p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="glass-card p-8 bg-white/[0.01] hover:border-emerald-500/20 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">ATS Rule Scanner</h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                  Checks for font issues, missing contact detail categories, and basic resume outline structure (education, skills, work experience).
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-8 bg-white/[0.01] hover:border-cyan-500/20 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Keyword Matching</h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                  Compares text terms against paste-in job requirements, providing feedback on exactly which terms are present and which are missing.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-8 bg-white/[0.01] hover:border-emerald-500/20 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">AI Advice Assistant</h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                  Uses GPT-4o-mini to detail action items. Suggests sentence phrasing changes and structural corrections directly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-[#06080C] py-8 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} VitaCV Resume Builder & ATS Score Analyzer. All rights reserved.</p>
      </footer>
    </div>
  );
}
