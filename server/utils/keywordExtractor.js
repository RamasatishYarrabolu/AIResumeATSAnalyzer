const STOP_WORDS = new Set(('a an and are as at be by for from has have in into is it its of on or our that the their this to with will you your we team work experience required requirements skills ability using').split(' '));

export function extractKeywords(text = '') {
  const tokens = text.toLowerCase().match(/[a-z][a-z+#.]{1,}/g) || [];
  const counts = new Map();
  for (const token of tokens) {
    const clean = token.replace(/[.+#]+$/g, '');
    if (clean.length > 2 && !STOP_WORDS.has(clean)) counts.set(clean, (counts.get(clean) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([word]) => word);
}
