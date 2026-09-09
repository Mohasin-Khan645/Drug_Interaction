'use strict';

const config = require('../../config');

/**
 * Providers only ever receive an already-grounded context built from verified
 * evidence. They must never be given the authority to create safety rules.
 */
class AIProvider {
  // eslint-disable-next-line no-unused-vars
  async complete({ system, context, question }) {
    throw new Error('complete() must be implemented by an AI provider');
  }
}

/**
 * Deterministic provider used in development and tests: it restates the
 * supplied verified context and adds nothing of its own.
 */
class TemplateAIProvider extends AIProvider {
  constructor() {
    super();
    this.name = 'template';
  }

   
  async complete({ context, question }) {
    const lines = context.findings.map(
      (finding) =>
        `- ${finding.severity} ${finding.category}: ${finding.title}. ${finding.description}` +
        (finding.management ? ` Suggested management per source: ${finding.management}` : '')
    );
    const evidenceLines = context.evidence.map(
      (doc) => `- ${doc.sourceName}: ${doc.title}${doc.reference ? ` (${doc.reference})` : ''}`
    );
    return {
      text: [
        `Question: ${question}`,
        '',
        'Verified findings used to answer:',
        ...lines,
        '',
        'Evidence referenced:',
        ...evidenceLines,
        '',
        'This explanation summarises existing verified findings only. It is not a diagnosis, prescription, or dosage recommendation.',
      ].join('\n'),
      provider: this.name,
    };
  }
}

const registry = new Map([
  ['template', () => new TemplateAIProvider()],
  ['null', () => new TemplateAIProvider()],
]);

const registerAIProvider = (name, factory) => registry.set(name, factory);

const getAIProvider = (name = config.ai.provider) => {
  const factory = registry.get(name);
  if (!factory) throw new Error(`Unknown AI provider: ${name}`);
  return factory();
};

module.exports = { AIProvider, TemplateAIProvider, getAIProvider, registerAIProvider };
