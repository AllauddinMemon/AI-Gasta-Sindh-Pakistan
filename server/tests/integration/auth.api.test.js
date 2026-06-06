/**
 * API integration test for the auth + rate-limit + validation pipeline.
 * Prisma is mocked so the test runs without a live database.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

// Mock the shared Prisma client BEFORE the app is required.
jest.mock('../../src/config/prisma', () => ({
  user: {
    findFirst: jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      id: 'u1', name: 'Test', email: 't@gasta.gov', phone: '1', cnic: '2',
      role: 'TEACHER', passwordHash: 'x',
    }),
  },
}));

const request = require('supertest');
const app = require('../../src/app');

describe('Auth API', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('rejects registration with invalid payload (400 + details)', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('registers a valid teacher and returns tokens (no passwordHash leaked)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Teacher', email: 't@gasta.gov', phone: '+923001234567',
      cnic: '42101-1234567-8', password: 'Secret123',
    });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('blocks protected routes without a token (401)', async () => {
    const res = await request(app).get('/api/claims');
    expect(res.status).toBe(401);
  });
});
