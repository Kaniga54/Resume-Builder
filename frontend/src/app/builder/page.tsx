'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, ResumeBuilderData, ResumeExperience, ResumeEducation, ResumeProject } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { ExecutiveTemplate, ModernTemplate, MinimalistTemplate } from '@/components/templates';
import { 
  Save, Download, Plus, Trash2, Layout, FileText, 
  ChevronLeft, Sparkles, Loader2, ArrowRight, CheckCircle2 
} from 'lucide-react';

export default function Builder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Builder form state
  const [data, setData] = useState<ResumeBuilderData>({
    name: '',
    title: '',
    email: '',
    phone: '',
    website: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    selectedTemplate: 'modern'
  });

  // Temporary skill input helper
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    // Auth Guard
    if (!api.getCurrentUser()) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const builderDetails = await api.getBuilderData();
        setData(builderDetails);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch your saved resume details.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Form handlers
  const handlePersonalChange = (field: keyof ResumeBuilderData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Experience Handlers
  const handleAddExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', location: '', dates: '', description: '' }]
    }));
  };

  const handleExperienceChange = (index: number, field: keyof ResumeExperience, value: string) => {
    const updated = [...data.experience];
    updated[index] = { ...updated[index], [field]: value };
    setData(prev => ({ ...prev, experience: updated }));
  };

  const handleRemoveExperience = (index: number) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  // Education Handlers
  const handleAddEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', dates: '', grade: '' }]
    }));
  };

  const handleEducationChange = (index: number, field: keyof ResumeEducation, value: string) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    setData(prev => ({ ...prev, education: updated }));
  };

  const handleRemoveEducation = (index: number) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Project Handlers
  const handleAddProject = () => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', link: '' }]
    }));
  };

  const handleProjectChange = (index: number, field: keyof ResumeProject, value: string) => {
    const updated = [...data.projects];
    updated[index] = { ...updated[index], [field]: value };
    setData(prev => ({ ...prev, projects: updated }));
  };

  const handleRemoveProject = (index: number) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Skills Handlers
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      setData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Save details to DB
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      await api.saveBuilderData(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save resume builder details.');
    } finally {
      setSaving(false);
    }
  };

  // Print PDF trigger
  const handlePrint = () => {
    window.print();
  };

  const renderActiveTemplate = () => {
    switch (data.selectedTemplate) {
      case 'classic':
        return <ExecutiveTemplate data={data} />;
      case 'minimal':
        return <MinimalistTemplate data={data} />;
      case 'modern':
      default:
        return <ModernTemplate data={data} />;
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col bg-[#080C10]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
          <span className="text-sm text-gray-400 font-medium">Opening your workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080C10] overflow-x-hidden print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Editor & Preview Workspace Container */}
      <main className="flex-1 flex flex-col lg:flex-row print:block">
        
        {/* LEFT PANEL: Editor Forms (hide in print) */}
        <div className="w-full lg:w-[45%] border-r border-white/5 bg-[#0C121A]/40 p-6 overflow-y-auto max-h-[calc(100vh-4rem)] print:hidden space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Progress</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              Resume Workspace
            </h1>
            <p className="text-xs text-gray-400 mt-1">Design, edit details, and export templates directly.</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Selector of Active Template */}
          <div className="glass-card p-4 space-y-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Choose layout style</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'modern', label: 'Modern (Tech)' },
                { id: 'classic', label: 'Executive' },
                { id: 'minimal', label: 'Minimalist' }
              ].map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handlePersonalChange('selectedTemplate', tpl.id)}
                  className={`rounded-lg py-2 text-xs font-bold transition-all border ${
                    data.selectedTemplate === tpl.id 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Section: Personal Details */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => handlePersonalChange('name', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40"
                  placeholder="John Doe"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Professional Title</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={e => handlePersonalChange('title', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40"
                  placeholder="Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={e => handlePersonalChange('email', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={e => handlePersonalChange('phone', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40"
                  placeholder="+1 (555) 019-99"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Portfolio or LinkedIn URL</label>
                <input
                  type="text"
                  value={data.website}
                  onChange={e => handlePersonalChange('website', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40"
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>
          </div>

          {/* Form Section: Summary */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2">Professional Summary</h3>
            <textarea
              rows={4}
              value={data.summary}
              onChange={e => handlePersonalChange('summary', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white outline-none focus:border-emerald-500/40"
              placeholder="Write a concise overview of your background, years of experience, and primary value proposition..."
            />
          </div>

          {/* Form Section: Work Experience */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Work Experience</h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Job
              </button>
            </div>
            
            {data.experience.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic text-center py-4">No work history items added yet.</p>
            ) : (
              <div className="space-y-4 divide-y divide-white/5">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-3 pt-3 first:pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Position #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={e => handleExperienceChange(idx, 'company', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Role / Designation</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={e => handleExperienceChange(idx, 'role', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={e => handleExperienceChange(idx, 'location', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="Remote / Chennai"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Dates Employed</label>
                        <input
                          type="text"
                          value={exp.dates}
                          onChange={e => handleExperienceChange(idx, 'dates', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="Jan 2024 - Present"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Role Description / Achievements</label>
                        <textarea
                          rows={3}
                          value={exp.description}
                          onChange={e => handleExperienceChange(idx, 'description', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="- Built API backend handling 10k requests/min.&#10;- Optimized database queries improving latency by 20%."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Section: Projects */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Projects</h3>
              <button
                type="button"
                onClick={handleAddProject}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Project
              </button>
            </div>
            
            {data.projects.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic text-center py-4">No project items added yet.</p>
            ) : (
              <div className="space-y-4 divide-y divide-white/5">
                {data.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-3 pt-3 first:pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Project #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={e => handleProjectChange(idx, 'name', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="VitaCV Analyzer"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Project Link (Optional)</label>
                        <input
                          type="text"
                          value={proj.link}
                          onChange={e => handleProjectChange(idx, 'link', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="github.com/user/project"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Project Description</label>
                        <input
                          type="text"
                          value={proj.description}
                          onChange={e => handleProjectChange(idx, 'description', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="Describe the technologies used and what the project accomplishes..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Section: Education */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Education</h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add School
              </button>
            </div>
            
            {data.education.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic text-center py-4">No education details added yet.</p>
            ) : (
              <div className="space-y-4 divide-y divide-white/5">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="space-y-3 pt-3 first:pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Degree #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">School / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={e => handleEducationChange(idx, 'school', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="Anna University"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Degree / Course</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={e => handleEducationChange(idx, 'degree', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="B.E. Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Year / Dates</label>
                        <input
                          type="text"
                          value={edu.dates}
                          onChange={e => handleEducationChange(idx, 'dates', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="2020 - 2024"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Grade / CGPA</label>
                        <input
                          type="text"
                          value={edu.grade}
                          onChange={e => handleEducationChange(idx, 'grade', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          placeholder="8.5 CGPA"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Section: Skills */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2">Skills & Competencies</h3>
            
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40"
                placeholder="Type skill (e.g. React.js) and press Enter"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-4 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
              >
                Add
              </button>
            </form>

            {data.skills.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic text-center py-2">No skills tags added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-gray-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-500 hover:text-red-400 text-[10px]"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Live preview window layout */}
        <div className="flex-1 bg-[#090D13] p-8 flex justify-center items-start overflow-y-auto max-h-[calc(100vh-4rem)] print:p-0 print:overflow-visible print:max-h-none">
          <div 
            className="print-area w-[794px] min-h-[1123px] bg-white text-black shadow-2xl origin-top transition-transform scale-[0.7] md:scale-[0.8] lg:scale-[0.9] xl:scale-100 print:scale-100 print:shadow-none"
            style={{ minWidth: '794px' }}
          >
            {renderActiveTemplate()}
          </div>
        </div>

      </main>
    </div>
  );
}
