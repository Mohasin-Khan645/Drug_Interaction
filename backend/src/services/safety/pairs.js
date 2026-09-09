'use strict';

/**
 * Generates the N(N-1)/2 unique unordered pairs for a medication list.
 * Identical drug ids are handled by the duplication engine, not here.
 */
const generatePairs = (items) => {
  const pairs = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      pairs.push([items[i], items[j]]);
    }
  }
  return pairs;
};

const orderedPairKey = (a, b) => (a <= b ? `${a}|${b}` : `${b}|${a}`);

module.exports = { generatePairs, orderedPairKey };
