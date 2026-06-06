const { z } = require('zod');

const CATEGORIES = ['MEDICAL', 'HOUSING', 'SCHOLARSHIP', 'SUN_QUOTA', 'EMERGENCY'];
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

// multipart/form-data fields arrive as strings; coerce where needed.
const createClaimSchema = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().min(3, 'Title is too short').max(160),
  hospitalName: z.string().max(160).optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  incidentDate: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

const reviewClaimSchema = z.object({
  status: z.enum(STATUSES),
  reviewerNotes: z.string().max(2000).optional().or(z.literal('')),
});

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  history: z
    .array(z.object({ role: z.string(), content: z.string() }))
    .optional()
    .default([]),
});

module.exports = { createClaimSchema, reviewClaimSchema, chatSchema, CATEGORIES, STATUSES };
