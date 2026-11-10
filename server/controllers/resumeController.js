import pdf from 'pdf-parse';
import Resume from '../models/Resume.js';
import { calculateATSScore } from '../utils/atsScore.js';
import { analyzeWithGemini } from '../utils/aiAnalyzer.js';

export async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Choose a PDF resume to upload' });
  try {
    const parsed = await pdf(req.file.buffer);
    const text = parsed.text?.trim();
    if (!text) return res.status(422).json({ error: 'No readable text found in this PDF' });
    res.json({ text, fileName: req.file.originalname });
  } catch {
    res.status(422).json({ error: 'Could not read this PDF. Please try another file.' });
  }
}

export async function analyzeResume(req, res, next) {
  try {
    const { resumeText, jobDescription, fileName } = req.body || {};
    if (typeof resumeText !== 'string' || resumeText.trim().length < 20 || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
      return res.status(400).json({ error: 'Resume text and job description must each contain at least 20 characters' });
    }
    const score = calculateATSScore(resumeText, jobDescription);
    let suggestions;
    try { suggestions = await analyzeWithGemini(resumeText, jobDescription, score); }
    catch (error) {
      console.error('Gemini analysis failed:', error.message);
      suggestions = { summary: 'AI suggestions could not be generated. Your keyword score is still available.', recommendations: [], bulletImprovements: [] };
    }
    const saved = await Resume.create({ user: req.userId, fileName: typeof fileName === 'string' ? fileName.slice(0, 255) : 'Resume', resumeText, jobDescription, score: score.score, matchedKeywords: score.matchedKeywords, missingKeywords: score.missingKeywords, suggestions });
    res.json({ success: true, analysis: { id: saved.id, score: score.score, matchedKeywords: score.matchedKeywords, missingKeywords: score.missingKeywords, suggestions, createdAt: saved.createdAt } });
  } catch (error) { next(error); }
}

export async function listResumes(req, res, next) {
  try {
    const resumes = await Resume.find({ user: req.userId }).select('-resumeText -jobDescription').sort({ createdAt: -1 }).limit(50);
    res.json({ resumes });
  } catch (error) { next(error); }
}
