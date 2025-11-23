import { HospitalController } from '../controllers/hospital.controller';

const mockGetAllHospitals = jest.fn();
const mockGetHospitalById = jest.fn();
const mockSearchHospitals = jest.fn();
const mockRecordDonorOptIn = jest.fn();
const mockGetHospitalDonors = jest.fn();
const mockGetRecognitionStats = jest.fn();
const mockGetHealthRecords = jest.fn();
const mockCreateHealthRecord = jest.fn();

jest.mock('../services/hospital.service', () => ({
  HospitalService: jest.fn().mockImplementation(() => ({
    getAllHospitals: mockGetAllHospitals,
    getHospitalById: mockGetHospitalById,
    searchHospitals: mockSearchHospitals,
    recordDonorOptIn: mockRecordDonorOptIn,
    getHospitalDonors: mockGetHospitalDonors,
    getRecognitionStats: mockGetRecognitionStats,
    getHealthRecords: mockGetHealthRecords,
    createHealthRecord: mockCreateHealthRecord,
  })),
}));

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createNext = () => jest.fn();

describe('HospitalController', () => {
  let controller: HospitalController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new HospitalController();
  });

  it('getAllHospitals returns 200 with hospitals', async () => {
    const hospitals = [{ id: '1' }];
    mockGetAllHospitals.mockResolvedValueOnce(hospitals);

    const req: any = {};
    const res = createRes();
    const next = createNext();

    await controller.getAllHospitals(req, res as any, next as any);

    expect(mockGetAllHospitals).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: hospitals })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('getHospitalById returns 200 when found', async () => {
    const hospital = { id: '1' };
    mockGetHospitalById.mockResolvedValueOnce(hospital);

    const req: any = { params: { id: '1' } };
    const res = createRes();
    const next = createNext();

    await controller.getHospitalById(req, res as any, next as any);

    expect(mockGetHospitalById).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: hospital })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('getHospitalById returns 404 when not found', async () => {
    mockGetHospitalById.mockRejectedValueOnce(new Error('Hospital not found'));

    const req: any = { params: { id: 'missing' } };
    const res = createRes();
    const next = createNext();

    await controller.getHospitalById(req, res as any, next as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'Hospital not found' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('searchHospitals forwards search term and returns 200', async () => {
    const hospitals = [{ id: '1' }];
    mockSearchHospitals.mockResolvedValueOnce(hospitals);

    const req: any = { query: { search: 'City' } };
    const res = createRes();
    const next = createNext();

    await controller.searchHospitals(req, res as any, next as any);

    expect(mockSearchHospitals).toHaveBeenCalledWith('City');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: hospitals })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('optInDonor returns 200 on success', async () => {
    const result = { success: true };
    mockRecordDonorOptIn.mockResolvedValueOnce(result);

    const req: any = { params: { hospitalId: 'h1' }, query: { token: 'token' } };
    const res = createRes();
    const next = createNext();

    await controller.optInDonor(req, res as any, next as any);

    expect(mockRecordDonorOptIn).toHaveBeenCalledWith('h1', 'token');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: result })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('optInDonor returns 400 on error', async () => {
    mockRecordDonorOptIn.mockRejectedValueOnce(new Error('Invalid token'));

    const req: any = { params: { hospitalId: 'h1' }, query: { token: 'bad' } };
    const res = createRes();
    const next = createNext();

    await controller.optInDonor(req, res as any, next as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'Invalid token' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('getHospitalDonors returns 200 with donors', async () => {
    const donors = [{ id: '1' }];
    mockGetHospitalDonors.mockResolvedValueOnce(donors);

    const req: any = { params: { id: 'h1' } };
    const res = createRes();
    const next = createNext();

    await controller.getHospitalDonors(req, res as any, next as any);

    expect(mockGetHospitalDonors).toHaveBeenCalledWith('h1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: donors })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('getRecognition returns 200 with stats', async () => {
    const stats = { total: 10 };
    mockGetRecognitionStats.mockResolvedValueOnce(stats);

    const req: any = { params: { id: 'h1' } };
    const res = createRes();
    const next = createNext();

    await controller.getRecognition(req, res as any, next as any);

    expect(mockGetRecognitionStats).toHaveBeenCalledWith('h1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: stats })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('getHealthRecords returns 200 with records', async () => {
    const records = [{ id: '1' }];
    mockGetHealthRecords.mockResolvedValueOnce(records);

    const req: any = { params: { id: 'h1' }, query: { donorId: 'd1' } };
    const res = createRes();
    const next = createNext();

    await controller.getHealthRecords(req, res as any, next as any);

    expect(mockGetHealthRecords).toHaveBeenCalledWith('h1', 'd1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: records })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('createHealthRecord returns 201 with record', async () => {
    const record = { id: '1' };
    mockCreateHealthRecord.mockResolvedValueOnce(record);

    const req: any = { params: { id: 'h1' }, body: { donorId: 'd1' } };
    const res = createRes();
    const next = createNext();

    await controller.createHealthRecord(req, res as any, next as any);

    expect(mockCreateHealthRecord).toHaveBeenCalledWith('h1', req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: record })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
