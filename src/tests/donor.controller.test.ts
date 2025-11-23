import { DonorController } from '../controllers/donor.controller';

const mockGetAllDonors = jest.fn();
const mockGetDonorById = jest.fn();
const mockSearchDonors = jest.fn();
const mockGetDonorsByBloodGroup = jest.fn();
const mockComputeProgress = jest.fn();
const mockAwardNewBadges = jest.fn();

jest.mock('../services/donor.service', () => ({
  DonorService: jest.fn().mockImplementation(() => ({
    getAllDonors: mockGetAllDonors,
    getDonorById: mockGetDonorById,
    searchDonors: mockSearchDonors,
    getDonorsByBloodGroup: mockGetDonorsByBloodGroup,
  })),
}));

jest.mock('../services/badge.service', () => ({
  BadgeService: jest.fn().mockImplementation(() => ({
    computeProgress: mockComputeProgress,
    awardNewBadges: mockAwardNewBadges,
  })),
}));

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createNext = () => jest.fn();

describe('DonorController', () => {
  let controller: DonorController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DonorController();
  });

  it('getAllDonors returns 200 with donors', async () => {
    const donors = [{ id: '1' }];
    mockGetAllDonors.mockResolvedValueOnce(donors);

    const req: any = {};
    const res = createRes();
    const next = createNext();

    await controller.getAllDonors(req, res as any, next as any);

    expect(mockGetAllDonors).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: donors })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('getDonorById returns 200 when donor found', async () => {
    const donor = { id: '1' };
    mockGetDonorById.mockResolvedValueOnce(donor);

    const req: any = { params: { id: '1' } };
    const res = createRes();
    const next = createNext();

    await controller.getDonorById(req, res as any, next as any);

    expect(mockGetDonorById).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: donor })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('getDonorById returns 404 when donor not found', async () => {
    mockGetDonorById.mockRejectedValueOnce(new Error('Donor not found'));

    const req: any = { params: { id: 'missing' } };
    const res = createRes();
    const next = createNext();

    await controller.getDonorById(req, res as any, next as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'Donor not found' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('searchDonors passes filters and returns 200', async () => {
    const donors = [{ id: '1' }];
    mockSearchDonors.mockResolvedValueOnce(donors);

    const req: any = {
      query: {
        bloodGroup: 'O+',
        district: 'District',
        state: 'State',
        minAge: '18',
        maxAge: '65',
      },
    };
    const res = createRes();
    const next = createNext();

    await controller.searchDonors(req, res as any, next as any);

    expect(mockSearchDonors).toHaveBeenCalledWith({
      bloodGroup: 'O+',
      district: 'District',
      state: 'State',
      minAge: 18,
      maxAge: 65,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: donors })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('getDonorsByBloodGroup forwards param and returns 200', async () => {
    const donors = [{ id: '1' }];
    mockGetDonorsByBloodGroup.mockResolvedValueOnce(donors);

    const req: any = { params: { bloodGroup: 'A+' } };
    const res = createRes();
    const next = createNext();

    await controller.getDonorsByBloodGroup(req, res as any, next as any);

    expect(mockGetDonorsByBloodGroup).toHaveBeenCalledWith('A+');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: donors })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('getBadges returns 200 with badge data', async () => {
    const badges = [{ key: 'badge' }];
    mockComputeProgress.mockResolvedValueOnce(badges);

    const req: any = { params: { donorId: '1' } };
    const res = createRes();
    const next = createNext();

    await controller.getBadges(req, res as any, next as any);

    expect(mockComputeProgress).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: badges })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('recomputeBadges returns 200 with awarded badges', async () => {
    const awarded = [{ key: 'badge' }];
    mockAwardNewBadges.mockResolvedValueOnce(awarded);

    const req: any = { params: { donorId: '1' } };
    const res = createRes();
    const next = createNext();

    await controller.recomputeBadges(req, res as any, next as any);

    expect(mockAwardNewBadges).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: { awarded } })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
