'use strict';

const { generatePairs, orderedPairKey } = require('../../src/services/safety/pairs');

describe('pair generation', () => {
  it.each([
    [0, 0],
    [1, 0],
    [2, 1],
    [3, 3],
    [5, 10],
  ])('produces N(N-1)/2 pairs for %i medications', (count, expected) => {
    const items = Array.from({ length: count }, (_, index) => `drug-${index}`);
    expect(generatePairs(items)).toHaveLength(expected);
  });

  it('never pairs an item with itself', () => {
    const pairs = generatePairs(['a', 'b', 'c']);
    expect(pairs.every(([left, right]) => left !== right)).toBe(true);
  });

  it('treats A+B and B+A as the same pair', () => {
    expect(orderedPairKey('b', 'a')).toBe(orderedPairKey('a', 'b'));
  });
});
