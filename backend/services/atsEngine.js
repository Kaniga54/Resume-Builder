/**
 * ATS Resume Scoring Engine
 */

const STANDARD_SECTIONS = [
  { name: 'Work Experience', keywords: ['experience', 'work experience', 'employment history', 'professional experience', 'career history'] },
  { name: 'Education', keywords: ['education', 'academic background', 'academic history', 'degrees', 'university', 'college'] },
  { name: 'Skills', keywords: ['skills', 'core competencies', 'technical skills', 'skills & expertise', 'technologies', 'proficiencies'] },
  { name: 'Projects', keywords: ['projects', 'academic projects', 'personal projects', 'key projects', 'selected projects'] },
  { name: 'Summary / Objective', keywords: ['summary', 'professional summary', 'objective', 'career objective', 'about me', 'profile'] },
  { name: 'Certifications', keywords: ['certifications', 'licenses', 'courses', 'accreditations'] }
];

const CONTACT_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  phone: /(\+?\d{1,4}[\s-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
  linkedin: /linkedin\.com\/in\/[a-zA-Z0-9-_]+/i,
  github: /github\.com\/[a-zA-Z0-9-_]+/i
};

// Common action verbs in resumes to check impact
const ACTION_VERBS = [
  'led', 'managed', 'developed', 'designed', 'built', 'created', 'implemented', 'achieved', 
  'increased', 'decreased', 'optimized', 'improved', 'spearheaded', 'orchestrated', 'authored',
  'engineered', 'automated', 'streamlined', 'delivered', 'formulated', 'facilitated', 'executed'
];

// Helper to extract keywords from text (removes common stopwords, lowercases, keeps words > 3 chars)
function extractKeywords(text) {
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

export function analyzeResume(resumeText, jobDescription = '') {
  const normalizedText = resumeText.toLowerCase();
  const suggestions = [];

  // 1. SECTIONS SCORE
  let sectionsFound = [];
  let sectionsMissing = [];
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

  // 2. CONTACT SCORE
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

  // 3. FORMATTING SCORE
  let formattingScore = 100;
  const wordCount = resumeText.split(/\s+/).length;

  if (wordCount < 200) {
    formattingScore -= 30;
    suggestions.push({
      category: 'Formatting',
      message: `Your resume is extremely short (${wordCount} words). Add more details to showcase your achievements.`,
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
  const verbDensity = actionVerbsFound.length;

  if (verbDensity < 4) {
    formattingScore -= 15;
    suggestions.push({
      category: 'Formatting',
      message: 'Low usage of strong action verbs (e.g., "led", "optimized", "implemented"). Bullet points should begin with action words.',
      severity: 'medium'
    });
  }

  // Check for email address placeholders or formatting issues
  if (normalizedText.includes('your-email') || normalizedText.includes('email@example.com')) {
    formattingScore -= 20;
    suggestions.push({
      category: 'Formatting',
      message: 'Placeholder text detected (e.g., "your-email"). Ensure all template content is fully customized.',
      severity: 'high'
    });
  }

  formattingScore = Math.max(0, Math.round(formattingScore));

  // 4. KEYWORDS MATCH SCORE
  let keywordsScore = 0;
  let missingKeywords = [];

  if (jobDescription && jobDescription.trim().length > 10) {
    const resumeWords = new Set(extractKeywords(resumeText));
    const jobWords = extractKeywords(jobDescription);

    // Get unique keywords from Job Description
    const uniqueJobKeywords = Array.from(new Set(jobWords));
    let matchCount = 0;

    uniqueJobKeywords.forEach(word => {
      if (resumeWords.has(word)) {
        matchCount++;
      } else {
        // Keep track of missing keywords (limit to 10 prominent ones)
        if (missingKeywords.length < 12) {
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
    // If no JD is provided, base keyword rating is based on standard technical terms density
    const industryTerms = ['javascript', 'python', 'react', 'node', 'java', 'sql', 'git', 'agile', 'cloud', 'aws', 'docker', 'api', 'database', 'project', 'management', 'development', 'software', 'design'];
    const termsFound = industryTerms.filter(term => normalizedText.includes(term));
    keywordsScore = Math.round((termsFound.length / industryTerms.length) * 100);
    // scale to a reasonable range
    keywordsScore = Math.min(100, Math.max(40, keywordsScore));
    suggestions.push({
      category: 'Keywords',
      message: 'Upload a specific Job Description to get custom keyword-matching score.',
      severity: 'low'
    });
  }

  // OVERALL ATS SCORE
  // Weight distribution: Keywords (40%), Sections (25%), Formatting (20%), Contact (15%)
  let overallScore = Math.round(
    (keywordsScore * 0.40) +
    (sectionsScore * 0.25) +
    (formattingScore * 0.20) +
    (contactScore * 0.15)
  );

  return {
    score: overallScore,
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
