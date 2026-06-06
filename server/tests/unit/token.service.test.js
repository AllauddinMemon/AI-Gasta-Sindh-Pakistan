process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

const tokenService = require('../../src/services/token.service');

describe('token.service', () => {
  const user = { id: 'user-123', role: 'TEACHER' };

  it('signs and verifies an access token round-trip', () => {
    const token = tokenService.signAccessToken(user);
    const payload = tokenService.verifyAccessToken(token);
    expect(payload.sub).toBe(user.id);
    expect(payload.role).toBe('TEACHER');
  });

  it('rejects an access token verified with the refresh secret', () => {
    const token = tokenService.signAccessToken(user);
    expect(() => tokenService.verifyRefreshToken(token)).toThrow();
  });

  it('rejects a tampered token', () => {
    const token = tokenService.signAccessToken(user) + 'tampered';
    expect(() => tokenService.verifyAccessToken(token)).toThrow();
  });
});
