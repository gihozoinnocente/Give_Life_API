import { InventoryController } from '../controllers/inventory.controller';
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

describe('InventoryController', () => {
  let controller: InventoryController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new InventoryController();
  });

  it('getHospitalInventory returns 200 with rows', async () => {
    const rows = [{ id: '1' }];
    mockQuery.mockResolvedValueOnce({ rows });

    const req: any = { params: { hospitalId: 'h1' } };
    const res = createRes();

    await controller.getHospitalInventory(req, res as any);

    expect(mockQuery).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: rows })
    );
  });

  it('updateInventory inserts new record when none exists', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // checkResult
      .mockResolvedValueOnce({ rows: [{ id: '1', units: 5, status: 'good' }] }); // insert result

    const req: any = { params: { hospitalId: 'h1' }, body: { bloodType: 'O+', units: 5, operation: 'add' } };
    const res = createRes();

    await controller.updateInventory(req, res as any);

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', message: 'Inventory updated successfully' })
    );
  });

  it('updateInventory updates existing record', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ units: 10, critical_level: 5 }] }) // checkResult
      .mockResolvedValueOnce({ rows: [{ id: '1', units: 15, status: 'good' }] }); // update result

    const req: any = { params: { hospitalId: 'h1' }, body: { bloodType: 'O+', units: 5, operation: 'add' } };
    const res = createRes();

    await controller.updateInventory(req, res as any);

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('initializeInventory returns 201 with records', async () => {
    mockQuery
      .mockResolvedValue({ rows: [{ id: '1' }] });

    const req: any = { params: { hospitalId: 'h1' } };
    const res = createRes();

    await controller.initializeInventory(req, res as any);

    expect(mockQuery).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('getInventoryStats returns 200 with stats', async () => {
    const row = { total_units: 10 };
    mockQuery.mockResolvedValueOnce({ rows: [row] });

    const req: any = { params: { hospitalId: 'h1' } };
    const res = createRes();

    await controller.getInventoryStats(req, res as any);

    expect(mockQuery).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: row })
    );
  });
});
