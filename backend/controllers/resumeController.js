import { db } from '../db.js';
import { parsePdf } from '../services/pdfParser.js';
import { analyzeResume } from '../services/atsEngine.js';
import { getAIRecommendations } from '../services/aiService.js';

export async function analyzeResumeFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume PDF file.' });
    }

    const { jobDescription = '' } = req.body;
    const filename = req.file.originalname;

    console.log(`Parsing PDF file: ${filename}...`);
    const parsedText = await parsePdf(req.file.buffer);

    if (!parsedText || parsedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the PDF. Ensure it contains selectable text rather than images.' });
    }

    console.log('Running ATS algorithm scoring...');
    const atsResult = analyzeResume(parsedText, jobDescription);

    console.log('Retrieving AI suggestions...');
    const aiSuggestions = await getAIRecommendations(parsedText, jobDescription);

    // Combine rules-based suggestions with AI-based suggestions
    // Filter duplicates or near-duplicates based on lowercase text similarity
    const combinedSuggestions = [...atsResult.suggestions];
    const existingMessages = new Set(combinedSuggestions.map(s => s.message.toLowerCase().trim()));

    aiSuggestions.forEach(aiSug => {
      if (!existingMessages.has(aiSug.message.toLowerCase().trim())) {
        combinedSuggestions.push({
          category: aiSug.category || 'Content',
          message: aiSug.message,
          severity: aiSug.severity || 'medium'
        });
        existingMessages.add(aiSug.message.toLowerCase().trim());
      }
    });

    // Save result to Database
    const analysisData = {
      userId: req.userId,
      filename,
      score: atsResult.score,
      breakdown: atsResult.breakdown,
      sectionsFound: atsResult.sectionsFound,
      sectionsMissing: atsResult.sectionsMissing,
      suggestions: combinedSuggestions,
      resumeText: parsedText,
      jobDescription
    };

    console.log('Saving resume analysis details...');
    const savedAnalysis = await db.saveAnalysis(analysisData);

    res.status(201).json(savedAnalysis);
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: error.message || 'Server error during resume analysis.' });
  }
}

export async function getHistory(req, res) {
  try {
    const history = await db.getHistoryByUserId(req.userId);
    res.status(200).json(history);
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ error: 'Server error retrieving analysis history.' });
  }
}

export async function getAnalysisDetails(req, res) {
  try {
    const analysisId = req.params.id;
    const analysis = await db.getAnalysisById(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }

    // Verify ownership
    const analysisUserId = analysis.userId.toString();
    if (analysisUserId !== req.userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this analysis.' });
    }

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Fetch analysis details error:', error);
    res.status(500).json({ error: 'Server error retrieving analysis details.' });
  }
}
