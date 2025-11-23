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

describe('Health and base routes', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Welcome to Give Life Website');
  });

  it('GET /health should return health status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Give Life API is running');
  });
});
