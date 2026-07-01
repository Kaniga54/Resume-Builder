'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, AnalysisDetails, Suggestion } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { 
  ChevronLeft, AlertCircle, FileText, CheckCircle2, 
  XCircle, Award, LayoutGrid, FileSearch, Sparkles, 
  Printer, History, Brain, Info, AlertTriangle 
} from 'lucide-react';

export default function Results() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<AnalysisDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'ai' | 'sections' | 'source'>('ai');

  useEffect(() => {
    // Auth Guard
    if (!api.getCurrentUser()) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await api.getAnalysisDetails(id);
        setData(result);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to retrieve analysis details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const getScoreClassification = (score: number) => {
    if (score >= 80) return { label: 'ATS Ready', desc: 'Excellent layout and keyword coverage.', color: 'text-emerald-400', border: 'border-emerald-500/20 bg-emerald-500/5' };
    if (score >= 60) return { label: 'Needs Optimization', desc: 'Good baseline, but missing details.', color: 'text-yellow-400', border: 'border-yellow-500/20 bg-yellow-500/5' };
    return { label: 'Critical Review', desc: 'High risk of failure. Immediate changes recommended.', color: 'text-red-400', border: 'border-red-500/20 bg-red-500/5' };
  };

  const getSeverityBadge = (severity: Suggestion['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/10 border-red-500/25 text-red-400';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400';
      case 'low':
        return 'bg-blue-500/10 border-blue-500/25 text-blue-400';
      default:
        return 'bg-gray-500/10 border-gray-500/25 text-gray-400';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col bg-[#080C10]">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
          {/* Skeleton Header */}
          <div className="h-6 w-32 shimmer rounded-lg" />
          <div className="h-10 w-96 shimmer rounded-lg" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Big Card Skeleton */}
            <div className="glass-card p-8 h-80 shimmer" />
            {/* Right Cards Skeletons */}
            <div className="lg:col-span-2 glass-card p-8 h-80 shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="relative min-h-screen flex flex-col bg-[#080C10]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white">Analysis Failed</h2>
          <p className="mt-2 text-sm text-gray-400">{error || 'Unable to retrieve analysis details.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  const classification = getScoreClassification(data.score);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080C10] overflow-hidden print:bg-white print:text-black">
      {/* Background Gradients (hide in print) */}
      <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] radial-glow-1 pointer-events-none rounded-full print:hidden" />

      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb (hide in print) */}
        <div className="flex items-center justify-between gap-4 mb-8 print:hidden">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 h-9 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Main Document Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Score Gauges */}
          <div className="flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overall compliance score</span>
              
              {/* Radial Score Gauge */}
              <div className="relative h-44 w-44 flex items-center justify-center mt-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="76" 
                    className="stroke-white/5 fill-transparent" 
                    strokeWidth="10" 
                  />
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="76" 
                    className="stroke-emerald-500 fill-transparent animate-gauge" 
                    strokeWidth="10" 
                    strokeDasharray="477" 
                    strokeDashoffset={477 - (477 * data.score) / 100}
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white">{data.score}%</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Weighted score</span>
                </div>
              </div>

              <div className={`mt-6 w-full rounded-xl border p-4 ${classification.border}`}>
                <span className={`text-base font-bold ${classification.color}`}>{classification.label}</span>
                <p className="mt-1 text-xs text-gray-400 leading-normal">{classification.desc}</p>
              </div>
            </div>

            {/* Sub-scores Breakdowns */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Evaluation Breakdown</h3>
              <div className="space-y-4">
                {[
                  { name: 'Keyword Alignment', score: data.breakdown.keywords, color: 'from-blue-500 to-cyan-500' },
                  { name: 'Sections Structuring', score: data.breakdown.sections, color: 'from-emerald-500 to-teal-500' },
                  { name: 'Formatting Checks', score: data.breakdown.formatting, color: 'from-yellow-500 to-amber-500' },
                  { name: 'Contact Validity', score: data.breakdown.contact, color: 'from-purple-500 to-indigo-500' }
                ].map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-400">{item.name}</span>
                      <span className="text-white">{item.score}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tabs, Suggestions, Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Metadata Info Card */}
            <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-snug">{data.filename}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Scanned on {new Date(data.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {data.jobDescription && (
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 border border-white/5 bg-white/5 rounded-lg px-2.5 py-1.5">
                  <FileSearch className="h-3.5 w-3.5 text-cyan-400" />
                  <span>JD Match Enabled</span>
                </div>
              )}
            </div>

            {/* Tab Switches (hide in print) */}
            <div className="flex border-b border-white/5 print:hidden">
              {[
                { id: 'ai', label: 'AI Optimization Recommendations', icon: Brain },
                { id: 'sections', label: 'Outline Integrity', icon: LayoutGrid },
                { id: 'source', label: 'Resume Text Source', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 border-b-2 px-5 pb-3.5 text-sm font-semibold transition-all ${
                      activeTab === tab.id 
                        ? 'border-emerald-500 text-emerald-400 font-bold' 
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1">
              
              {/* Tab 1: AI Suggestions */}
              {activeTab === 'ai' && (
                <div className="space-y-4">
                  {data.suggestions.length > 0 ? (
                    data.suggestions.map((sug, i) => (
                      <div key={i} className="glass-card p-5 border border-white/5 bg-white/[0.005] flex items-start gap-4">
                        <div className="mt-1 shrink-0">
                          {sug.severity === 'high' ? (
                            <AlertTriangle className="h-5.5 w-5.5 text-red-400" />
                          ) : (
                            <Info className="h-5.5 w-5.5 text-yellow-400" />
                          )}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{sug.category}</span>
                            <span className={`inline-flex rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getSeverityBadge(sug.severity)}`}>
                              {sug.severity} priority
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{sug.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-12 glass-card">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                      <h3 className="mt-4 font-bold text-white">Flawless Audit!</h3>
                      <p className="mt-1 text-sm text-gray-400">Our engine did not find any optimization opportunities.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Sections found vs missing */}
              {activeTab === 'sections' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Found Card */}
                  <div className="glass-card p-6 bg-emerald-500/[0.005]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-3.5 mb-4">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                      <span>Parsed Sections ({data.sectionsFound.length})</span>
                    </h3>
                    {data.sectionsFound.length > 0 ? (
                      <ul className="space-y-3">
                        {data.sectionsFound.map(sec => (
                          <li key={sec} className="flex items-center gap-2.5 text-sm text-gray-300 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            {sec}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">No outline sections parsed successfully.</p>
                    )}
                  </div>

                  {/* Missing Card */}
                  <div className="glass-card p-6 bg-red-500/[0.005]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-3.5 mb-4">
                      <XCircle className="h-4.5 w-4.5 text-red-400" />
                      <span>Missing Sections ({data.sectionsMissing.length})</span>
                    </h3>
                    {data.sectionsMissing.length > 0 ? (
                      <ul className="space-y-3">
                        {data.sectionsMissing.map(sec => (
                          <li key={sec} className="flex items-center gap-2.5 text-sm text-gray-300 font-medium">
                            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                            {sec}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-400 font-semibold">Perfect structure! All core sections found.</p>
                    )}
                  </div>

                </div>
              )}

              {/* Tab 3: Text source view */}
              {activeTab === 'source' && (
                <div className="glass-card p-6 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Extracted resume text buffer</h3>
                    <div className="max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-black/45 p-4 text-xs font-mono text-gray-400 whitespace-pre-wrap leading-relaxed">
                      {data.resumeText}
                    </div>
                  </div>

                  {data.jobDescription && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Target job requirements text</h3>
                      <div className="max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-black/45 p-4 text-xs font-mono text-gray-400 whitespace-pre-wrap leading-relaxed">
                        {data.jobDescription}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
