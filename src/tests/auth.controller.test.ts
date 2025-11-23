import { AuthController } from '../controllers/auth.controller';

// Mocks for AuthService methods
const mockRegisterDonor = jest.fn();
const mockRegisterHospital = jest.fn();
const mockRegisterAdmin = jest.fn();
const mockRegisterRBC = jest.fn();
const mockRegisterMinistry = jest.fn();
const mockLogin = jest.fn();
const mockGetUserProfile = jest.fn();
const mockUpdateUserProfile = jest.fn();

jest.mock('../services/auth.service', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    registerDonor: mockRegisterDonor,
    registerHospital: mockRegisterHospital,
    registerAdmin: mockRegisterAdmin,
    registerRBC: mockRegisterRBC,
    registerMinistry: mockRegisterMinistry,
    login: mockLogin,
    getUserProfile: mockGetUserProfile,
    updateUserProfile: mockUpdateUserProfile,
  })),
}));

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createNext = () => jest.fn();

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController();
  });

  describe('registerDonor', () => {
    it('returns 400 when required fields are missing', async () => {
      const req: any = { body: { email: 'test@example.com' } };
      const res = createRes();
      const next = createNext();

      await controller.registerDonor(req, res as any, next as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error' })
      );
      expect(mockRegisterDonor).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 201 on successful registration', async () => {
      const req: any = {
        body: {
          email: 'test@example.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
          address: '123 Street',
          age: 30,
          bloodGroup: 'O+',
          district: 'District',
          state: 'State',
          pinCode: '00000',
        },
      };
      const res = createRes();
      const next = createNext();
      const result = { id: 'donor-id' };
      mockRegisterDonor.mockResolvedValueOnce(result);

      await controller.registerDonor(req, res as any, next as any);

      expect(mockRegisterDonor).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'success', data: result })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 409 when email already registered', async () => {
      const req: any = {
        body: {
          email: 'test@example.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
          address: '123 Street',
          age: 30,
          bloodGroup: 'O+',
          district: 'District',
          state: 'State',
          pinCode: '00000',
        },
      };
      const res = createRes();
      const next = createNext();
      mockRegisterDonor.mockRejectedValueOnce(new Error('Email already registered'));

      await controller.registerDonor(req, res as any, next as any);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error', message: 'Email already registered' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next on unexpected error', async () => {
      const req: any = {
        body: {
          email: 'test@example.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
          address: '123 Street',
          age: 30,
          bloodGroup: 'O+',
          district: 'District',
          state: 'State',
          pinCode: '00000',
        },
      };
      const res = createRes();
      const next = createNext();
      const error = new Error('Unexpected error');
      mockRegisterDonor.mockRejectedValueOnce(error);

      await controller.registerDonor(req, res as any, next as any);

      expect(res.status).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('returns 400 when email or password is missing', async () => {
      const req: any = { body: { email: 'test@example.com' } };
      const res = createRes();
      const next = createNext();

      await controller.login(req, res as any, next as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error' })
      );
      expect(mockLogin).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 200 on successful login', async () => {
      const req: any = { body: { email: 'test@example.com', password: 'password' } };
      const res = createRes();
      const next = createNext();
      const result = { token: 'jwt-token' };
      mockLogin.mockResolvedValueOnce(result);

      await controller.login(req, res as any, next as any);

      expect(mockLogin).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'success', data: result })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 for invalid credentials or deactivated account', async () => {
      const req: any = { body: { email: 'test@example.com', password: 'password' } };
      const res = createRes();
      const next = createNext();
      mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));

      await controller.login(req, res as any, next as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error', message: 'Invalid email or password' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when account is deactivated', async () => {
      const req: any = { body: { email: 'test@example.com', password: 'password' } };
      const res = createRes();
      const next = createNext();
      mockLogin.mockRejectedValueOnce(new Error('Account is deactivated'));

      await controller.login(req, res as any, next as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error', message: 'Account is deactivated' })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('returns 401 when user is not authenticated', async () => {
      const req: any = { user: undefined };
      const res = createRes();
      const next = createNext();

      await controller.getProfile(req, res as any, next as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error', message: 'Authentication required' })
      );
      expect(mockGetUserProfile).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 200 with profile when authenticated', async () => {
      const req: any = { user: { userId: 'user-id', role: 'donor' } };
      const res = createRes();
      const next = createNext();
      const profile = { id: 'user-id', role: 'donor' };
      mockGetUserProfile.mockResolvedValueOnce(profile);

      await controller.getProfile(req, res as any, next as any);

      expect(mockGetUserProfile).toHaveBeenCalledWith('user-id', 'donor');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'success', data: profile })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next on service error', async () => {
      const req: any = { user: { userId: 'user-id', role: 'donor' } };
      const res = createRes();
      const next = createNext();
      const error = new Error('Service failed');
      mockGetUserProfile.mockRejectedValueOnce(error);

      await controller.getProfile(req, res as any, next as any);

      expect(res.status).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProfile', () => {
    it('returns 401 when user is not authenticated', async () => {
      const req: any = { user: undefined, body: { firstName: 'New' } };
      const res = createRes();
      const next = createNext();

      await controller.updateProfile(req, res as any, next as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error', message: 'Authentication required' })
      );
      expect(mockUpdateUserProfile).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 200 with updated profile when authenticated', async () => {
      const req: any = { user: { userId: 'user-id', role: 'donor' }, body: { firstName: 'New' } };
      const res = createRes();
      const next = createNext();
      const updatedProfile = { id: 'user-id', role: 'donor', firstName: 'New' };
      mockUpdateUserProfile.mockResolvedValueOnce(updatedProfile);

      await controller.updateProfile(req, res as any, next as any);

      expect(mockUpdateUserProfile).toHaveBeenCalledWith('user-id', 'donor', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'success', data: updatedProfile })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next on service error', async () => {
      const req: any = { user: { userId: 'user-id', role: 'donor' }, body: { firstName: 'New' } };
      const res = createRes();
      const next = createNext();
      const error = new Error('Update failed');
      mockUpdateUserProfile.mockRejectedValueOnce(error);

      await controller.updateProfile(req, res as any, next as any);

      expect(res.status).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
