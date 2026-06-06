process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
const { registerSchema, loginSchema } = require('../../src/validators/auth.validator');
const { createClaimSchema } = require('../../src/validators/claim.validator');

describe('auth validators', () => {
  it('accepts a valid registration', () => {
    const r = registerSchema.safeParse({
      name: 'Ayesha Khan', email: 'a@gasta.gov', phone: '+923001234567',
      cnic: '42101-1234567-8', password: 'Secret123',
    });
    expect(r.success).toBe(true);
  });

  it('rejects a weak password (no number)', () => {
    const r = registerSchema.safeParse({
      name: 'A B', email: 'a@gasta.gov', phone: '+923001234567',
      cnic: '42101-1234567-8', password: 'onlyletters',
    });
    expect(r.success).toBe(false);
  });

  it('rejects an invalid email on login', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
  });
});

describe('claim validator', () => {
  it('coerces amount string to a positive number', () => {
    const r = createClaimSchema.safeParse({ category: 'MEDICAL', title: 'Hospital bill', amount: '45000' });
    expect(r.success).toBe(true);
    expect(r.data.amount).toBe(45000);
  });

  it('rejects an unknown category', () => {
    const r = createClaimSchema.safeParse({ category: 'INVALID', title: 'X', amount: '10' });
    expect(r.success).toBe(false);
  });

  it('rejects a non-positive amount', () => {
    const r = createClaimSchema.safeParse({ category: 'MEDICAL', title: 'X', amount: '-5' });
    expect(r.success).toBe(false);
  });
});
