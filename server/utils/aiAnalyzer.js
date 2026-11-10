export async function analyzeWithGemini(resumeText, jobDescription, ats) {
  if (!process.env.GEMINI_API_KEY) return { summary: 'AI suggestions are unavailable until GEMINI_API_KEY is configured.', recommendations: [], bulletImprovements: [] };
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = `You are a resume coach. Analyze the resume against the job description. Return only valid JSON with keys summary (string), recommendations (array of strings), and bulletImprovements (array of objects with original and improved strings). Be truthful; do not invent experience. Mention these ATS details: score ${ats.score}, matched ${ats.matchedKeywords.join(', ') || 'none'}, missing ${ats.missingKeywords.join(', ') || 'none'}.\n\nRESUME:\n${resumeText.slice(0, 18000)}\n\nJOB DESCRIPTION:\n${jobDescription.slice(0, 10000)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.3 } })
  });
  if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);
  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
  if (!raw) throw new Error('Gemini returned an empty response');
  return JSON.parse(raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
}
