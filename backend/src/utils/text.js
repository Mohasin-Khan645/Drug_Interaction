'use strict';

// OCR noise patterns that are safe to strip because they never carry drug identity.
const NOISE_PATTERNS = [
  /\b(sig|rx|qty|quantity|refill[s]?|disp|dispense|take|tabs?|caps?)\b/gi,
  /[|_~^`"'\\]+/g,
  /\s{2,}/g,
];

const cleanText = (raw) => {
  if (typeof raw !== 'string') return '';
  let text = raw.replace(/\r/g, ' ').replace(/\t/g, ' ');
  for (const pattern of NOISE_PATTERNS) {
    text = text.replace(pattern, ' ');
  }
  return text.replace(/\s+/g, ' ').trim();
};

const normalizeCase = (text) => cleanText(text).toLowerCase();

// Strength/dose tokens are kept separately so they never pollute name matching.
const extractDosage = (text) => {
  const match = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|%)/i.exec(text || '');
  return match ? { strength: `${match[1]}${match[2].toLowerCase()}` } : {};
};

const stripDosage = (text) =>
  normalizeCase(text)
    .replace(/\d+(?:\.\d+)?\s*(mg|mcg|g|ml|iu|%)/gi, ' ')
    .replace(/\b(once|twice|thrice|daily|bd|bid|tid|qid|od|hs|prn|po|iv|im)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i += 1) {
    const current = [i + 1];
    for (let j = 0; j < b.length; j += 1) {
      const cost = a[i] === b[j] ? 0 : 1;
      current[j + 1] = Math.min(current[j] + 1, previous[j + 1] + 1, previous[j] + cost);
    }
    previous = current;
  }
  return previous[b.length];
};

const similarity = (a, b) => {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 0 : 1 - levenshtein(a, b) / maxLen;
};

module.exports = { cleanText, normalizeCase, stripDosage, extractDosage, levenshtein, similarity };
