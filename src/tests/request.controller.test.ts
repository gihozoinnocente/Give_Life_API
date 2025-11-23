import { RequestController } from '../controllers/request.controller';
import db from '../config/database';

jest.mock('../config/database', () => {
  const mockResult = { rows: [], rowCount: 0 };
  const mockQuery = jest.fn().mockResolvedValue(mockResult);

  return {
    __esModule: true,
    default: { query: mockQuery },
    query: mockQuery,
  };
});

const mockQuery = (db as any).query as jest.Mock;

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('RequestController', () => {
  let controller: RequestController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new RequestController();
  });

  it('getAllRequests builds filters and returns 200', async () => {
    const rows = [{ id: '1' }];
    mockQuery.mockResolvedValueOnce({ rows });

    const req: any = { query: { status: 'active', urgency: 'urgent', bloodType: 'O+' } };
    const res = createRes();

    await controller.getAllRequests(req, res as any);

    expect(mockQuery).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: rows })
    );
  });

  it('getHospitalRequests returns 200', async () => {
    const rows = [{ id: '1' }];
    mockQuery.mockResolvedValueOnce({ rows });

    const req: any = { params: { hospitalId: 'h1' }, query: { status: 'active' } };
    const res = createRes();

    await controller.getHospitalRequests(req, res as any);

    expect(mockQuery).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('createRequest returns 400 when hospital profile missing', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const req: any = { body: { hospitalId: 'h1' } };
    const res = createRes();

    await controller.createRequest(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' })
    );
  });

  it('createRequest validates required fields and creates request', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ hospital_name: 'H1', address: 'Addr' }] }) // hospital profile
      .mockResolvedValueOnce({ rows: [{ id: '1' }] }); // insert

    const req: any = {
      body: {
        hospitalId: 'h1',
        bloodType: 'O+',
        unitsNeeded: '2',
        urgency: 'critical',
        contactPerson: 'John',
        contactPhone: '123',
        expiryDate: '2024-01-01',
      },
    };
    const res = createRes();

    await controller.createRequest(req, res as any);

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success' })
    );
  });

  it('updateRequest returns 404 when not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const req: any = { params: { id: 'missing' }, body: { status: 'closed' } };
    const res = createRes();

    await controller.updateRequest(req, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'Blood request not found' })
    );
  });

  it('updateRequest returns 200 when updated', async () => {
    const row = { id: '1' };
    mockQuery.mockResolvedValueOnce({ rows: [row] });

    const req: any = { params: { id: '1' }, body: { status: 'closed' } };
    const res = createRes();

    await controller.updateRequest(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: row })
    );
  });

  it('getRequestById returns 404 when not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const req: any = { params: { id: 'missing' } };
    const res = createRes();

    await controller.getRequestById(req, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'Blood request not found' })
    );
  });

  it('getRequestById returns 200 when found', async () => {
    const row = { id: '1' };
    mockQuery.mockResolvedValueOnce({ rows: [row] });

    const req: any = { params: { id: '1' } };
    const res = createRes();

    await controller.getRequestById(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: row })
    );
  });

  it('deleteRequest returns 404 when not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const req: any = { params: { id: 'missing' } };
    const res = createRes();

    await controller.deleteRequest(req, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'Blood request not found' })
    );
  });

  it('deleteRequest returns 200 when deleted', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: '1' }] });

    const req: any = { params: { id: '1' } };
    const res = createRes();

    await controller.deleteRequest(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success' })
    );
  });

  it('getUrgentRequestsForDonor returns 404 when donor missing', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const req: any = { params: { donorId: 'd1' } };
    const res = createRes();

    await controller.getUrgentRequestsForDonor(req, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'Donor not found' })
    );
  });

  it('getUrgentRequestsForDonor returns 200 with matching requests', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ blood_group: 'O+' }] }) // donor
      .mockResolvedValueOnce({ rows: [{ id: '1' }] }); // requests

    const req: any = { params: { donorId: 'd1' } };
    const res = createRes();

    await controller.getUrgentRequestsForDonor(req, res as any);

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success' })
    );
  });
});
