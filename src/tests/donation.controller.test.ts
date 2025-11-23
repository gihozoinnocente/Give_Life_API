import { DonationController } from '../controllers/donation.controller';
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

jest.mock('../services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendMail: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake-jwt-token'),
}));

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('DonationController', () => {
  let controller: DonationController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DonationController();
  });

  it('getDonorDonations returns 200 with rows', async () => {
    const rows = [{ id: 'd1' }];
    mockQuery.mockResolvedValueOnce({ rows });

    const req: any = { params: { donorId: 'donor-1' } };
    const res = createRes();

    await controller.getDonorDonations(req, res as any);

    expect(mockQuery).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: rows })
    );
  });

  it('getHospitalDonations returns 200 with rows', async () => {
    const rows = [{ id: 'd1' }];
    mockQuery.mockResolvedValueOnce({ rows });

    const req: any = { params: { hospitalId: 'h1' } };
    const res = createRes();

    await controller.getHospitalDonations(req, res as any);

    expect(mockQuery).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('createDonation returns 201 on success', async () => {
    const row = { id: 'd1' };
    mockQuery.mockResolvedValueOnce({ rows: [row] });

    const req: any = {
      body: {
        donorId: 'donor-1',
        hospitalId: 'h1',
        date: '2024-01-01',
        bloodType: 'O+',
        units: 2,
      },
    };
    const res = createRes();

    await controller.createDonation(req, res as any);

    expect(mockQuery).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: row })
    );
  });

  it('getDonorStats returns 200 with computed stats when no donations', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        total_donations: null,
        total_units: null,
        lives_impacted: null,
        last_donation: null,
      }],
    });

    const req: any = { params: { donorId: 'donor-1' } };
    const res = createRes();

    await controller.getDonorStats(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        data: expect.objectContaining({ totalDonations: 0, nextEligible: 'Eligible now' }),
      })
    );
  });

  it('getDonationById returns 404 when not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const req: any = { params: { id: 'missing' } };
    const res = createRes();

    await controller.getDonationById(req, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'Donation not found' })
    );
  });

  it('getDonationById returns 200 when found', async () => {
    const row = { id: 'd1' };
    mockQuery.mockResolvedValueOnce({ rows: [row] });

    const req: any = { params: { id: 'd1' } };
    const res = createRes();

    await controller.getDonationById(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: row })
    );
  });

  it('updateDonationStatus returns 404 when donation not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const req: any = { params: { id: 'missing' }, body: { status: 'pending' } };
    const res = createRes();

    await controller.updateDonationStatus(req, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'Donation not found' })
    );
  });

  it('updateDonationStatus returns 200 when updated (no email path)', async () => {
    const beforeRow = { id: 'd1', donor_id: 'u1', hospital_id: 'h1', status: 'pending' };
    const updatedRow = { ...beforeRow, status: 'completed' };

    mockQuery
      .mockResolvedValueOnce({ rows: [beforeRow] }) // select current
      .mockResolvedValueOnce({ rows: [updatedRow] }) // update
      .mockResolvedValueOnce({ rows: [{ rows: 1 }] }) // membership (non-empty to skip email branch)
    ;

    const req: any = { params: { id: 'd1' }, body: { status: 'completed' }, protocol: 'http', get: () => 'localhost' };
    const res = createRes();

    await controller.updateDonationStatus(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: updatedRow })
    );
  });
});
