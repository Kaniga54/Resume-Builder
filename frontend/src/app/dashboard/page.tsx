'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, AnalysisHistoryItem } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { 
  FileText, Plus, ChevronRight, BarChart2, Calendar, 
  Search, ShieldAlert, Cpu, Sparkles, Loader2, RefreshCw, Award 
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    setError('');
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load resume scan history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Auth Guard
    if (!api.getCurrentUser()) {
      router.push('/login');
      return;
    }
    fetchHistory();
  }, [router]);

  const filteredHistory = history.filter(item => 
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAverageScore = () => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / history.length);
  };

  const getHighestScore = () => {
    if (history.length === 0) return 0;
    return Math.max(...history.map(h => h.score));
  };

  // Helper to color codes
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 60) return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5';
    return 'text-red-400 border-red-500/20 bg-red-500/5';
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col bg-[#080C10]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
          <span className="text-sm text-gray-400 font-medium">Loading your profile dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080C10] overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="mt-1.5 text-sm text-gray-400">
              Manage your scanned documents and track your overall ATS compliance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchHistory(true)}
              disabled={refreshing}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/analyze"
              className="glow-btn flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 h-10 text-sm font-bold text-white shadow-md transition-all hover:opacity-95"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Scan New Resume</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Scans</span>
              <p className="text-3xl font-extrabold text-white mt-1.5">{history.length}</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average ATS Score</span>
              <p className="text-3xl font-extrabold text-white mt-1.5">
                {history.length > 0 ? `${getAverageScore()}%` : 'N/A'}
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart2 className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Highest Score</span>
              <p className="text-3xl font-extrabold text-white mt-1.5">
                {history.length > 0 ? `${getHighestScore()}%` : 'N/A'}
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="h-5.5 w-5.5" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            <ShieldAlert className="h-5.5 w-5.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* History Search/Filter */}
        {history.length > 0 && (
          <div className="relative mb-6">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search by resume name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-emerald-500/40 focus:bg-white/[0.07]"
            />
          </div>
        )}

        {/* History List */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Link
                key={item.id}
                href={`/results/${item.id}`}
                className="glass-card glass-card-hover p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base leading-snug">{item.filename}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>Keywords: {item.breakdown.keywords}%</span>
                      <span>•</span>
                      <span>Formatting: {item.breakdown.formatting}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-white/5 pt-3 sm:pt-0 sm:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-semibold">ATS Score</span>
                    <span className={`inline-flex items-center rounded-lg border px-3 py-1 font-bold text-sm ${getScoreColor(item.score)}`}>
                      {item.score}%
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-600 hidden sm:block" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card text-center p-16 border-dashed border-white/10 bg-white/[0.005]">
            {history.length === 0 ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-white">No Resumes Scanned Yet</h3>
                <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
                  Upload your resume PDF and match it against job criteria to see your scores here.
                </p>
                <div className="mt-8">
                  <Link
                    href="/analyze"
                    className="glow-btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-95"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>Run Your First Scan</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white">No Results Found</h3>
                <p className="mt-2 text-sm text-gray-400">
                  We couldn't find any results matching "{searchQuery}". Try a different name.
                </p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
