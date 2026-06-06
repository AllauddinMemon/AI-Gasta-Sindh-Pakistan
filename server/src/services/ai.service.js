/**
 * AI service — abstraction layer over the AI provider.
 *
 * Sensitive business logic (system prompt, document guidance, provider keys)
 * lives here on the backend and is NEVER exposed to the frontend. The client
 * only sends a user message and receives an assistant reply.
 *
 * AI_PROVIDER=mock  -> deterministic rule-based assistant (no key required)
 * AI_PROVIDER=openai-> calls OpenAI Chat Completions
 */
const env = require('../config/env');

const SYSTEM_PROMPT = `You are "GASTA Assistant", a helpful guide for the Government
Secondary Teachers' Association claim platform. You help teachers understand and
file claims across these categories: Medical (hospitalization/medicines), Housing
(rental/allotment), Scholarships (education fund), Sun Quota (merit applications),
and Emergency Fund (urgent assistance).

Always:
- Explain which documents are required for the chosen claim type.
- Guide the user step by step through filling the claim form.
- Be concise, polite and professional (government service tone).
- Never ask for passwords, OTPs or full financial credentials.
If unsure, advise contacting the GASTA welfare office.`;

const REQUIRED_DOCS = {
  medical: ['Hospital bill / invoice', 'Discharge summary', 'Prescription / medicine receipts', 'CNIC copy'],
  housing: ['Rental agreement or allotment letter', 'Rent receipts', 'CNIC copy', 'Salary slip'],
  scholarship: ['Student admission / enrolment proof', 'Fee challan', 'Academic transcript', 'CNIC copy'],
  sun_quota: ['Merit certificate', 'Application form', 'Supporting achievement proofs', 'CNIC copy'],
  emergency: ['Brief incident description', 'Supporting evidence (police/medical report)', 'CNIC copy'],
};

/** Rule-based fallback so the app is fully functional without an API key. */
function mockReply(message) {
  const text = (message || '').toLowerCase();

  for (const [key, docs] of Object.entries(REQUIRED_DOCS)) {
    const label = key.replace('_', ' ');
    if (text.includes(label) || text.includes(key)) {
      return (
        `For a **${label}** claim you'll typically need:\n` +
        docs.map((d) => `• ${d}`).join('\n') +
        `\n\nTo file it: click "New Claim", choose the ${label} category, enter the amount and date, ` +
        `upload the documents above, add any notes (e.g. discharge summary details), then submit. ` +
        `You can track its status (Pending / Approved / Rejected) from your dashboard.`
      );
    }
  }

  if (text.includes('status') || text.includes('track')) {
    return 'You can track every claim on your dashboard. Each claim shows a status badge — Pending, Approved, or Rejected — along with any reviewer notes once an admin processes it.';
  }
  if (text.includes('document') || text.includes('upload')) {
    return 'Each claim category needs specific documents. Tell me which type of claim you want to file (medical, housing, scholarship, sun quota, or emergency) and I will list exactly what to upload.';
  }
  if (text.includes('hello') || text.includes('hi') || text.includes('salam')) {
    return 'Hello! I\'m the GASTA Assistant. I can help you file medical, housing, scholarship, sun quota, or emergency claims and tell you which documents you need. What would you like to do?';
  }

  return 'I can help you file and track claims (medical, housing, scholarship, sun quota, emergency) and explain which documents are required. Which type of claim are you working on?';
}

async function openaiReply(message, history = []) {
  // Lazy-require so the package is only needed when actually used.
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: env.ai.openaiApiKey });

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-8).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || ''),
    })),
    { role: 'user', content: message },
  ];

  const completion = await client.chat.completions.create({
    model: env.ai.openaiModel,
    messages,
    temperature: 0.3,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content?.trim() || mockReply(message);
}

/**
 * Public API. Controllers call only this.
 * @param {string} message
 * @param {Array<{role:string, content:string}>} history
 */
async function chat(message, history = []) {
  if (env.ai.provider === 'openai' && env.ai.openaiApiKey) {
    try {
      return await openaiReply(message, history);
    } catch (e) {
      console.error('[AI] OpenAI call failed, falling back to mock:', e.message);
      return mockReply(message);
    }
  }
  return mockReply(message);
}

function requiredDocuments(category) {
  return REQUIRED_DOCS[String(category || '').toLowerCase()] || [];
}

module.exports = { chat, requiredDocuments, SYSTEM_PROMPT };
