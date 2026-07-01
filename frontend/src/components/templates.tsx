import React from 'react';
import { ResumeBuilderData } from '@/lib/api';

interface TemplateProps {
  data: ResumeBuilderData;
}

// 1. EXECUTIVE TEMPLATE (Classic / Corporate)
export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { name, title, email, phone, website, summary, experience, education, skills, projects } = data;

  return (
    <div className="w-full text-black font-serif p-8 bg-white" style={{ fontSize: '12px', lineHeight: '1.5' }}>
      {/* Header */}
      <div className="text-center border-b border-black/20 pb-4 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider">{name || 'Your Full Name'}</h1>
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-700 mt-1">{title || 'Professional Title'}</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-3">
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {website && <span className="underline">{website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-2">Professional Summary</h2>
          <p className="text-justify text-gray-800">{summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-2">Work Experience</h2>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="page-break-inside-avoid">
                <div className="flex justify-between font-bold">
                  <span>{exp.role}</span>
                  <span className="font-normal text-gray-600">{exp.dates}</span>
                </div>
                <div className="flex justify-between text-xs italic text-gray-700 mb-1.5">
                  <span>{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                <p className="text-gray-800 whitespace-pre-line text-justify pl-3 border-l border-gray-200">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-2">Projects</h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx} className="page-break-inside-avoid">
                <div className="flex justify-between font-bold">
                  <span>{proj.name}</span>
                  {proj.link && <span className="font-normal text-xs text-blue-600 underline">{proj.link}</span>}
                </div>
                <p className="text-gray-800 mt-1">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-2">Education</h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between">
                <div>
                  <span className="font-bold">{edu.school}</span>
                  <span className="text-gray-700 italic ml-2">({edu.degree})</span>
                </div>
                <div className="text-right text-xs">
                  <span className="font-semibold text-gray-600">{edu.dates}</span>
                  {edu.grade && <span className="block text-gray-500">GPA/Marks: {edu.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-2">Skills & Expertise</h2>
          <p className="text-gray-800">{skills.join(' • ')}</p>
        </div>
      )}
    </div>
  );
};

// 2. MODERN TEMPLATE (Tech / Creative)
export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { name, title, email, phone, website, summary, experience, education, skills, projects } = data;

  return (
    <div className="w-full text-black font-sans p-8 bg-white flex flex-col gap-6" style={{ fontSize: '12px', lineHeight: '1.4' }}>
      {/* Top Banner */}
      <div className="border-l-4 border-emerald-500 pl-4 py-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">{name || 'Your Full Name'}</h1>
        <p className="text-emerald-600 text-sm font-bold tracking-wide mt-1 uppercase">{title || 'Professional Title'}</p>
        
        {/* Contact Links */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-3 font-medium">
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {website && <span className="text-emerald-600 underline">{website}</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Side: Summary & Experience & Projects (2 Columns) */}
        <div className="col-span-2 flex flex-col gap-6">
          {summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 border-b border-emerald-100 pb-1">Profile</h2>
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {experience && experience.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 border-b border-emerald-100 pb-1">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="page-break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-sm text-gray-900">{exp.role}</h3>
                      <span className="text-xs text-gray-500 font-semibold">{exp.dates}</span>
                    </div>
                    <div className="text-xs text-emerald-600 font-semibold mb-1.5">{exp.company} <span className="text-gray-400">|</span> {exp.location}</div>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed text-justify">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 border-b border-emerald-100 pb-1">Selected Projects</h2>
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={idx} className="page-break-inside-avoid">
                    <div className="flex justify-between items-baseline font-bold">
                      <span className="text-gray-900">{proj.name}</span>
                      {proj.link && <span className="font-normal text-xs text-emerald-600 underline">{proj.link}</span>}
                    </div>
                    <p className="text-gray-700 mt-1 leading-normal">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Skills & Education (1 Column) */}
        <div className="col-span-1 flex flex-col gap-6 border-l border-emerald-50 pl-5">
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 border-b border-emerald-100 pb-1">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span key={skill} className="bg-emerald-50 text-emerald-700 rounded-md px-2 py-0.5 text-[10px] font-bold border border-emerald-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 border-b border-emerald-100 pb-1">Education</h2>
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="page-break-inside-avoid">
                    <h4 className="font-bold text-gray-950 text-xs">{edu.degree}</h4>
                    <p className="text-[11px] text-gray-600 font-semibold">{edu.school}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{edu.dates}</p>
                    {edu.grade && <p className="text-[10px] text-emerald-600 mt-0.5 font-bold">Grade: {edu.grade}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. MINIMALIST TEMPLATE
export const MinimalistTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { name, title, email, phone, website, summary, experience, education, skills, projects } = data;

  return (
    <div className="w-full text-black font-sans p-8 bg-white" style={{ fontSize: '11px', lineHeight: '1.4' }}>
      {/* Header */}
      <div className="flex justify-between items-baseline border-b border-black pb-2.5 mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">{name || 'Your Full Name'}</h1>
          <p className="text-xs font-semibold text-gray-600 mt-0.5">{title || 'Professional Title'}</p>
        </div>
        <div className="text-right text-xs text-gray-600 space-y-0.5">
          {email && <p>{email}</p>}
          {phone && <p>{phone}</p>}
          {website && <p className="underline">{website}</p>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-4">
          <p className="text-justify text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-200 pb-0.5 mb-2.5">Work History</h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="page-break-inside-avoid">
                <div className="flex justify-between font-bold text-xs">
                  <span>{exp.role} <span className="font-normal text-gray-400">at</span> {exp.company}</span>
                  <span className="font-semibold text-gray-500">{exp.dates}</span>
                </div>
                <p className="text-gray-700 mt-1 whitespace-pre-line text-justify leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-200 pb-0.5 mb-2.5">Projects</h2>
          <div className="space-y-2.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="page-break-inside-avoid">
                <div className="flex justify-between font-semibold text-xs">
                  <span>{proj.name}</span>
                  {proj.link && <span className="font-normal text-blue-600 underline">{proj.link}</span>}
                </div>
                <p className="text-gray-700 mt-0.5">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-200 pb-0.5 mb-2.5">Education</h2>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline page-break-inside-avoid">
                <div>
                  <span className="font-bold">{edu.degree}</span>
                  <span className="text-gray-500 ml-1.5">| {edu.school}</span>
                </div>
                <div className="text-right text-gray-500">
                  <span>{edu.dates}</span>
                  {edu.grade && <span className="ml-2 font-semibold">({edu.grade})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-200 pb-0.5 mb-2.5">Expertise</h2>
          <p className="text-gray-700 leading-normal">{skills.join(', ')}</p>
        </div>
      )}
    </div>
  );
};
