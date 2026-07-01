/**
 * AI Recommendation Service (OpenAI Integration with Local Mock Fallback)
 */

export async function getAIRecommendations(resumeText, jobDescription = '') {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_OPENAI_API_KEY') {
    console.log('OpenAI API Key not configured. Using Mock AI engine fallback.');
    return generateMockAIRecommendations(resumeText, jobDescription);
  }

  try {
    const prompt = `
You are an expert resume consultant and ATS specialist. Analyze the resume text below and compare it against the job description (if provided).
Provide highly actionable recommendations for improvement.

Resume Text:
${resumeText.substring(0, 6000)}

Job Description:
${jobDescription ? jobDescription.substring(0, 3000) : 'None provided.'}

Provide your feedback in a JSON array format. Do not return any other text, markdown wrapper (like \`\`\`json), or explanations. Just return a raw valid JSON object matching the following structure:
{
  "suggestions": [
    {
      "category": "Keywords" | "Content" | "Impact" | "Formatting",
      "message": "Specific actionable suggestion on what to add, edit or remove. Be detailed.",
      "severity": "high" | "medium" | "low"
    }
  ]
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API responded with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsed = JSON.parse(resultText);

    if (parsed && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions;
    }
    return [];
  } catch (error) {
    console.error('Error fetching OpenAI recommendations:', error);
    // Return mock recommendations on failure so user experience isn't broken
    return generateMockAIRecommendations(resumeText, jobDescription);
  }
}

function generateMockAIRecommendations(resumeText, jobDescription) {
  // Simple heuristic recommendations
  const normalizedText = resumeText.toLowerCase();
  const suggestions = [];

  // Check for bullet points
  if (!resumeText.includes('•') && !resumeText.includes('*') && !resumeText.includes('- ')) {
    suggestions.push({
      category: 'Formatting',
      message: 'Format your work experience achievements as clean bullet points rather than paragraphs. Recruiters skim resumes in 6 seconds.',
      severity: 'high'
    });
  }

  // Check for quantify achievements
  const numbers = resumeText.match(/\b\d+(%|\d+|\s*million|\s*thousand|\s*k|\s*m)\b/g);
  if (!numbers || numbers.length < 3) {
    suggestions.push({
      category: 'Impact',
      message: 'Quantify your achievements! Try to include metrics, percentages, or concrete figures (e.g., "Increased sales by 15%", "Managed a team of 4").',
      severity: 'high'
    });
  }

  // Check section details
  if (jobDescription && jobDescription.trim().length > 5) {
    const jdLower = jobDescription.toLowerCase();
    
    // Check for standard modern tech terms if in job desc and missing in resume
    const techWords = [
      { term: 'react', name: 'React.js' },
      { term: 'typescript', name: 'TypeScript' },
      { term: 'node', name: 'Node.js' },
      { term: 'aws', name: 'AWS (Amazon Web Services)' },
      { term: 'docker', name: 'Docker' },
      { term: 'kubernetes', name: 'Kubernetes' },
      { term: 'python', name: 'Python' },
      { term: 'sql', name: 'SQL Databases' }
    ];

    const missingTech = [];
    techWords.forEach(({ term, name }) => {
      if (jdLower.includes(term) && !normalizedText.includes(term)) {
        missingTech.push(name);
      }
    });

    if (missingTech.length > 0) {
      suggestions.push({
        category: 'Keywords',
        message: `The job description mentions: ${missingTech.join(', ')}. If you have experience in these, ensure they are listed in your skills section.`,
        severity: 'high'
      });
    }
  }

  // Always append some standard high-quality advice
  suggestions.push({
    category: 'Content',
    message: 'Remove generic descriptions like "hard worker" or "team player". Focus instead on demonstrating these qualities through projects and accomplishments.',
    severity: 'medium'
  });

  suggestions.push({
    category: 'Formatting',
    message: 'Use a reverse-chronological order for your experiences. Put your most recent and relevant position at the top.',
    severity: 'medium'
  });

  suggestions.push({
    category: 'Impact',
    message: 'Ensure your experience points explain not just what you did, but the business value or outcome of your actions.',
    severity: 'medium'
  });

  return suggestions;
}
