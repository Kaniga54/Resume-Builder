'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { 
  Upload, FileText, AlertCircle, Trash2, Cpu, 
  ChevronLeft, Loader2, FileCheck2, Sparkles 
} from 'lucide-react';

export default function Analyze() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  const loadingTexts = [
    'Uploading document file safely...',
    'Extracting text layout & structure...',
    'Matching keyword alignments...',
    'Running ATS criteria validations...',
    'Acquiring AI recommendations...',
    'Generating report visualizations...'
  ];

  useEffect(() => {
    // Auth Guard
    if (!api.getCurrentUser()) {
      router.push('/login');
    }
  }, [router]);

  // Handle Loading step rotations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF resume files are supported at this time.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Resume file size exceeds the 5MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose or upload a resume file first.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await api.analyzeResume(file, jobDescription);
      router.push(`/results/${result.id}`);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('token') || msg.includes('denied') || msg.includes('Access') || msg.includes('expired')) {
        api.logout();
        router.push('/login');
        return;
      }
      setError(msg || 'An error occurred during resume analysis. Please try again.');
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080C10] overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] radial-glow-2 pointer-events-none rounded-full" />

      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="glass-card flex flex-col items-center justify-center p-16 text-center border-emerald-500/10 min-h-[500px]">
            <div className="relative flex items-center justify-center h-24 w-24">
              <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-emerald-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-b-2 border-r-2 border-cyan-500 animate-spin [animation-direction:reverse]" />
              <Cpu className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="mt-8 text-xl font-bold text-white tracking-wide">Processing Document</h3>
            <p className="mt-3 text-sm text-gray-400 max-w-sm font-medium animate-pulse">
              {loadingTexts[loadingStep]}
            </p>
            <div className="w-48 bg-white/5 h-1.5 rounded-full overflow-hidden mt-8">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000 ease-out" 
                style={{ width: `${((loadingStep + 1) / loadingTexts.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-emerald-400" />
                Scan & Optimize
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Upload your resume PDF and paste the target job description below.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Resume Upload Drag Drop Box */}
            <div className="glass-card p-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Upload Resume (PDF only)
              </label>

              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerSelectFile}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 bg-white/[0.005] ${
                    dragging 
                      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' 
                      : 'border-white/10 hover:border-emerald-500/35 hover:bg-white/[0.01]'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                  <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-gray-400 mb-4">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-white">Drag & drop your resume PDF here</p>
                  <p className="text-xs text-gray-500 mt-2">or click to browse from local files (Max 5MB)</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white max-w-md truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Job Description Textbox */}
            <div className="glass-card p-6">
              <label htmlFor="job-description" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Job Description (Optional, recommended for keyword match)
              </label>
              <textarea
                id="job-description"
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here to check key skills matching, tech terms density, and keyword alignment scores..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-emerald-500/40 focus:bg-white/[0.07] focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file}
              className="glow-btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-4 text-sm font-bold text-white shadow-lg transition-all hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <FileCheck2 className="h-5 w-5" />
              <span>Begin Compliance Scan</span>
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
