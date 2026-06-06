const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(120),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Invalid phone number').max(20),
  cnic: z.string().min(8, 'Invalid CNIC/ID').max(20),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'refreshToken is required'),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
