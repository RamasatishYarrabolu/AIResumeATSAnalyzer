import { extractKeywords } from './keywordExtractor.js';

export function calculateATSScore(resumeText, jobDescription) {
  const jd = extractKeywords(jobDescription);
  const resume = new Set(extractKeywords(resumeText));
  const matchedKeywords = jd.filter((word) => resume.has(word));
  const missingKeywords = jd.filter((word) => !resume.has(word));
  const score = jd.length ? Math.round((matchedKeywords.length / jd.length) * 100) : 0;
  return { score, matchedKeywords, missingKeywords };
}
