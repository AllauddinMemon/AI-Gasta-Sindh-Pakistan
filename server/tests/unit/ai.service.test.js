process.env.AI_PROVIDER = 'mock';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
const ai = require('../../src/services/ai.service');

describe('ai.service (mock provider)', () => {
  it('lists required documents for a known category', () => {
    const docs = ai.requiredDocuments('medical');
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(0);
  });

  it('returns guidance text for a medical question', async () => {
    const reply = await ai.chat('What do I need for a medical claim?');
    expect(typeof reply).toBe('string');
    expect(reply.toLowerCase()).toContain('discharge');
  });
});
