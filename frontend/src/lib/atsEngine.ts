/**
 * Client-Side ATS (Applicant Tracking System) Scoring Engine
 * Analyzes resume structure, keywords alignment, contact validity, and formatting rules.
 */

export interface Suggestion {
  category: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ATSResult {
  score: number;
  breakdown: {
    keywords: number;
    sections: number;
    formatting: number;
    contact: number;
  };
  sectionsFound: string[];
  sectionsMissing: string[];
  suggestions: Suggestion[];
}

const STANDARD_SECTIONS = [
  { name: 'Education', keywords: ['education', 'academic', 'degree', 'university', 'college', 'bachelor', 'master', 'b.tech', 'b.e', 'school'] },
  { name: 'Work Experience', keywords: ['experience', 'employment', 'work history', 'internship', 'professional experience', 'job history', 'career'] },
  { name: 'Skills', keywords: ['skills', 'technologies', 'technical skills', 'core competencies', 'proficiencies', 'tools', 'languages'] },
  { name: 'Projects', keywords: ['projects', 'personal projects', 'academic projects', 'portfolio work', 'key projects'] },
  { name: 'Summary', keywords: ['summary', 'profile', 'objective', 'about me', 'professional summary', 'executive summary'] },
  { name: 'Certifications', keywords: ['certifications', 'certificates', 'licenses', 'courses', 'accreditations', 'achievements'] }
];

const CONTACT_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  phone: /(?:(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5})/,
  linkedin: /(linkedin\.com\/in\/[a-zA-Z0-9_-]+|linkedin)/i,
  github: /(github\.com\/[a-zA-Z0-9_-]+|github|portfolio|vercel\.app|netlify\.app)/i
};

const ACTION_VERBS = [
  'spearheaded', 'developed', 'architected', 'led', 'designed', 'optimized',
  'implemented', 'engineered', 'created', 'built', 'managed', 'orchestrated',
  'reduced', 'increased', 'accelerated', 'transformed', 'delivered', 'automated'
];

function extractKeywords(text: string): string[] {
  if (!text) return [];
  const stopwords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 
    'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 
    'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 
    'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 
    'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 
    'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 
    'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 
    'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 
    'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 
    'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 
    'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 
    'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 
    'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves'
  ]);

  const cleanText = text.toLowerCase().replace(/[^a-zA-Z0-9\s#+-]/g, ' ');
  const words = cleanText.split(/\s+/);
  return words.filter(word => word.length > 2 && !stopwords.has(word));
}

export function analyzeResume(resumeText: string, jobDescription = ''): ATSResult {
  const normalizedText = resumeText.toLowerCase();
  const suggestions: Suggestion[] = [];

  // 1. SECTIONS SCORE (25% Weight)
  const sectionsFound: string[] = [];
  const sectionsMissing: string[] = [];
  let sectionsScore = 0;

  STANDARD_SECTIONS.forEach(sec => {
    const found = sec.keywords.some(kw => normalizedText.includes(kw));
    if (found) {
      sectionsFound.push(sec.name);
      sectionsScore += (100 / STANDARD_SECTIONS.length);
    } else {
      sectionsMissing.push(sec.name);
      suggestions.push({
        category: 'Sections',
        message: `Missing crucial section: "${sec.name}". Adding this helps ATS parse your resume structure.`,
        severity: sec.name === 'Work Experience' || sec.name === 'Education' || sec.name === 'Skills' ? 'high' : 'medium'
      });
    }
  });
  sectionsScore = Math.min(100, Math.round(sectionsScore));

  // 2. CONTACT SCORE (15% Weight)
  let contactScore = 0;
  const contactInfo = {
    email: CONTACT_PATTERNS.email.test(resumeText),
    phone: CONTACT_PATTERNS.phone.test(resumeText),
    linkedin: CONTACT_PATTERNS.linkedin.test(resumeText),
    github: CONTACT_PATTERNS.github.test(resumeText)
  };

  if (contactInfo.email) contactScore += 35;
  else suggestions.push({ category: 'Contact', message: 'No email address detected. Ensure your email is clearly visible.', severity: 'high' });
  
  if (contactInfo.phone) contactScore += 35;
  else suggestions.push({ category: 'Contact', message: 'No phone number detected. Contact info should include a valid phone number.', severity: 'high' });
  
  if (contactInfo.linkedin) contactScore += 20;
  else suggestions.push({ category: 'Contact', message: 'No LinkedIn URL detected. Professional profiles help recruiters find your online presence.', severity: 'medium' });
  
  if (contactInfo.github) contactScore += 10;
  else suggestions.push({ category: 'Contact', message: 'No GitHub or Portfolio website detected. Linking projects is highly recommended for tech roles.', severity: 'low' });

  contactScore = Math.min(100, contactScore);

  // 3. FORMATTING SCORE (20% Weight)
  let formattingScore = 100;
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

  if (wordCount < 200) {
    formattingScore -= 30;
    suggestions.push({
      category: 'Formatting',
      message: `Your resume is quite short (${wordCount} words). Add more details to showcase your achievements.`,
      severity: 'high'
    });
  } else if (wordCount > 1000) {
    formattingScore -= 20;
    suggestions.push({
      category: 'Formatting',
      message: `Your resume is quite long (${wordCount} words). Try to condense it to 1-2 pages and keep it under 800 words.`,
      severity: 'medium'
    });
  }

  // Check Action Verbs count
  const actionVerbsFound = ACTION_VERBS.filter(verb => normalizedText.includes(verb));
  if (actionVerbsFound.length < 4) {
    formattingScore -= 15;
    suggestions.push({
      category: 'Formatting',
      message: 'Low usage of strong action verbs (e.g., "led", "optimized", "implemented"). Bullet points should begin with action words.',
      severity: 'medium'
    });
  }

  // Check for placeholder text
  if (normalizedText.includes('your-email') || normalizedText.includes('email@example.com') || normalizedText.includes('lorem ipsum')) {
    formattingScore -= 20;
    suggestions.push({
      category: 'Formatting',
      message: 'Placeholder text detected. Ensure all template content is fully customized.',
      severity: 'high'
    });
  }

  formattingScore = Math.max(0, Math.round(formattingScore));

  // 4. KEYWORDS MATCH SCORE (40% Weight)
  let keywordsScore = 0;
  const missingKeywords: string[] = [];

  if (jobDescription && jobDescription.trim().length > 10) {
    const resumeWords = new Set(extractKeywords(resumeText));
    const jobWords = extractKeywords(jobDescription);
    const uniqueJobKeywords = Array.from(new Set(jobWords));
    let matchCount = 0;

    uniqueJobKeywords.forEach(word => {
      if (resumeWords.has(word)) {
        matchCount++;
      } else {
        if (missingKeywords.length < 10) {
          missingKeywords.push(word);
        }
      }
    });

    if (uniqueJobKeywords.length > 0) {
      keywordsScore = Math.round((matchCount / uniqueJobKeywords.length) * 100);
    } else {
      keywordsScore = 50;
    }

    if (keywordsScore < 50) {
      suggestions.push({
        category: 'Keywords',
        message: `Low job description alignment (${keywordsScore}% match). Try incorporating terms like: ${missingKeywords.slice(0, 5).join(', ')}.`,
        severity: 'high'
      });
    } else if (keywordsScore < 75) {
      suggestions.push({
        category: 'Keywords',
        message: `Good keyword coverage, but could be improved. Try adding: ${missingKeywords.slice(0, 4).join(', ')}.`,
        severity: 'medium'
      });
    }
  } else {
    // Standard industry keywords rating
    const industryTerms = ['javascript', 'python', 'react', 'node', 'sql', 'git', 'agile', 'cloud', 'aws', 'docker', 'api', 'database', 'project', 'management', 'development', 'software', 'design'];
    const termsFound = industryTerms.filter(term => normalizedText.includes(term));
    keywordsScore = Math.round((termsFound.length / industryTerms.length) * 100);
    keywordsScore = Math.min(100, Math.max(45, keywordsScore));
    suggestions.push({
      category: 'Keywords',
      message: 'Paste a specific Job Description to evaluate custom keyword density and alignment.',
      severity: 'low'
    });
  }

  // Weighted overall compliance score
  const overallScore = Math.round(
    (keywordsScore * 0.40) +
    (sectionsScore * 0.25) +
    (formattingScore * 0.20) +
    (contactScore * 0.15)
  );

  return {
    score: Math.min(100, Math.max(0, overallScore)),
    breakdown: {
      keywords: keywordsScore,
      sections: sectionsScore,
      formatting: formattingScore,
      contact: contactScore
    },
    sectionsFound,
    sectionsMissing,
    suggestions: suggestions.sort((a, b) => {
      const severityWeights = { high: 3, medium: 2, low: 1 };
      return severityWeights[b.severity] - severityWeights[a.severity];
    })
  };
}
