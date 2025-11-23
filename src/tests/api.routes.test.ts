import request from 'supertest';
import app from '../app';

jest.mock('../config/database', () => {
  const mockResult = { rows: [], rowCount: 0 };
  const mockQuery = jest.fn().mockResolvedValue(mockResult);

  return {
    __esModule: true,
    default: { query: mockQuery },
    query: mockQuery,
    getClient: jest.fn().mockResolvedValue({
      query: mockQuery,
      release: jest.fn(),
    }),
  };
});

jest.mock('../middleware/auth.middleware', () => ({
  authenticateToken: (_req: any, _res: any, next: any) => {
    if (!_req.user) {
      _req.user = { userId: 'test-user', role: 'admin' };
    }
    next();
  },
  authorizeRoles: () => (_req: any, _res: any, next: any) => {
    next();
  },
  optionalAuth: (_req: any, _res: any, next: any) => {
    next();
  },
}));

jest.mock('../services/badge.service', () => ({
  BadgeService: jest.fn().mockImplementation(() => ({
    computeProgress: jest.fn().mockResolvedValue([]),
    awardNewBadges: jest.fn().mockResolvedValue([]),
  })),
}));

jest.mock('../services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendMail: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('API route smoke tests', () => {
  it('GET /api should return API info', async () => {
    const res = await request(app).get('/api');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('endpoints');
  });

  it('GET /api/donors should return donors list (possibly empty)', async () => {
    const res = await request(app).get('/api/donors');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/hospitals should return hospitals list (possibly empty)', async () => {
    const res = await request(app).get('/api/hospitals');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/appointments/hospitals should return hospitals for appointments', async () => {
    const res = await request(app).get('/api/appointments/hospitals');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/donations/donor/:donorId should return donation list or empty', async () => {
    const res = await request(app).get('/api/donations/donor/test-donor');

    expect([200, 404]).toContain(res.status);
  });

  it('GET /api/inventory/hospital/:hospitalId should return inventory or not found', async () => {
    const res = await request(app).get('/api/inventory/hospital/test-hospital');

    expect([200, 404]).toContain(res.status);
  });

  it('GET /api/requests should return requests list (possibly empty)', async () => {
    const res = await request(app).get('/api/requests');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/community/posts should return community posts (possibly empty)', async () => {
    const res = await request(app).get('/api/community/posts');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/notifications/blood-requests/active should return active blood requests', async () => {
    const res = await request(app).get('/api/notifications/blood-requests/active');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/analytics/hospital/:hospitalId/stats should return analytics or error', async () => {
    const res = await request(app).get('/api/analytics/hospital/test-hospital/stats');

    expect([200, 404]).toContain(res.status);
  });

  it('GET /api/admin/hospitals should be reachable for admin user', async () => {
    const res = await request(app)
      .get('/api/admin/hospitals')
      .set('Authorization', 'Bearer fake-token');

    expect([200, 401, 403]).toContain(res.status);
  });
});
