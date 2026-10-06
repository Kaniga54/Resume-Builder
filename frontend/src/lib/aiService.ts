/**
 * Client-Side AI Recommendation & Optimizer Service
 * Generates actionable resume suggestions using smart NLP heuristics, with optional direct Gemini AI integration.
 */

import { Suggestion } from './atsEngine';

export async function getAIRecommendations(resumeText: string, jobDescription = '', geminiApiKey?: string): Promise<Suggestion[]> {
  // If a Gemini API key is provided, attempt direct AI generation
  if (geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      const aiSuggestions = await fetchGeminiRecommendations(resumeText, jobDescription, geminiApiKey);
      if (aiSuggestions.length > 0) return aiSuggestions;
    } catch (e) {
      console.warn('Gemini AI call failed, falling back to smart heuristic engine:', e);
    }
  }

  // Built-in Smart Heuristic AI Engine
  return generateHeuristicRecommendations(resumeText, jobDescription);
}

function generateHeuristicRecommendations(resumeText: string, jobDescription: string): Suggestion[] {
  const normalizedText = resumeText.toLowerCase();
  const suggestions: Suggestion[] = [];

  // Check bullet point format
  if (!resumeText.includes('•') && !resumeText.includes('*') && !resumeText.includes('- ')) {
    suggestions.push({
      category: 'Formatting',
      message: 'Format your work experience achievements as clean bullet points rather than dense paragraphs. Recruiters skim resumes in 6 seconds.',
      severity: 'high'
    });
  }

  // Check quantified impact
  const numbers = resumeText.match(/\b\d+(%|\d+|\s*million|\s*thousand|\s*k|\s*m)\b/g);
  if (!numbers || numbers.length < 3) {
    suggestions.push({
      category: 'Impact',
      message: 'Quantify your achievements! Include metrics and percentages (e.g., "Increased sales by 15%", "Cut page load time by 40%").',
      severity: 'high'
    });
  }

  // Job description matching
  if (jobDescription && jobDescription.trim().length > 5) {
    const jdLower = jobDescription.toLowerCase();
    const techWords = [
      { term: 'react', name: 'React.js' },
      { term: 'typescript', name: 'TypeScript' },
      { term: 'node', name: 'Node.js' },
      { term: 'aws', name: 'AWS Cloud' },
      { term: 'docker', name: 'Docker / Containers' },
      { term: 'python', name: 'Python' },
      { term: 'sql', name: 'SQL Databases' },
      { term: 'tailwind', name: 'Tailwind CSS' },
      { term: 'next', name: 'Next.js' }
    ];

    const missingTech: string[] = [];
    techWords.forEach(({ term, name }) => {
      if (jdLower.includes(term) && !normalizedText.includes(term)) {
        missingTech.push(name);
      }
    });

    if (missingTech.length > 0) {
      suggestions.push({
        category: 'Keywords',
        message: `The job description mentions: ${missingTech.join(', ')}. If you have experience in these, ensure they are highlighted in your skills or projects.`,
        severity: 'high'
      });
    }
  }

  // Content quality checks
  suggestions.push({
    category: 'Content',
    message: 'Remove generic descriptions like "hard worker" or "team player". Focus instead on demonstrating these qualities through tangible deliverables.',
    severity: 'medium'
  });

  suggestions.push({
    category: 'Formatting',
    message: 'Use reverse-chronological order for your experiences. Put your most recent and relevant position at the top.',
    severity: 'medium'
  });

  suggestions.push({
    category: 'Impact',
    message: 'Ensure your experience points explain not just what you did, but the business value or outcome of your actions.',
    severity: 'medium'
  });

  return suggestions;
}

/**
 * Optional Direct Client-Side Google Gemini API Connector
 */
async function fetchGeminiRecommendations(resumeText: string, jobDescription: string, apiKey: string): Promise<Suggestion[]> {
  const prompt = `Analyze this resume against the target job description and return JSON only:
Resume: ${resumeText.slice(0, 4000)}
Job: ${jobDescription.slice(0, 2000)}

Output exact JSON schema:
{"suggestions": [{"category": "Keywords"|"Content"|"Impact"|"Formatting", "message": "string", "severity": "high"|"medium"|"low"}]}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return [];
  const parsed = JSON.parse(text);
  return Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
}
