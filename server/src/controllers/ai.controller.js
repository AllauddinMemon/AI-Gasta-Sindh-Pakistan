const catchAsync = require('../utils/catchAsync');
const aiService = require('../services/ai.service');

const chat = catchAsync(async (req, res) => {
  const { message, history } = req.body;
  const reply = await aiService.chat(message, history);
  res.json({ success: true, reply });
});

const docs = catchAsync(async (req, res) => {
  const documents = aiService.requiredDocuments(req.params.category);
  res.json({ success: true, documents });
});

module.exports = { chat, docs };
