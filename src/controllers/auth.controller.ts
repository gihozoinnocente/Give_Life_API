import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import {
  DonorRegistrationDTO,
  HospitalRegistrationDTO,
  AdminRegistrationDTO,
  RBCRegistrationDTO,
  MinistryRegistrationDTO,
  LoginDTO,
} from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
    // Bind methods to ensure correct 'this' context
    this.registerDonor = this.registerDonor.bind(this);
    this.registerHospital = this.registerHospital.bind(this);
    this.registerAdmin = this.registerAdmin.bind(this);
    this.registerRBC = this.registerRBC.bind(this);
    this.registerMinistry = this.registerMinistry.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  // Register Donor
  async registerDonor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: DonorRegistrationDTO = req.body;

      // Validate required fields
      const requiredFields = [
        'email',
        'password',
        'firstName',
        'lastName',
        'phoneNumber',
        'address',
        'age',
        'bloodGroup',
        'district',
        'state',
        'pinCode',
      ];

      const missingFields = requiredFields.filter((field) => !data[field as keyof DonorRegistrationDTO]);

      if (missingFields.length > 0) {
        res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
        return;
      }

      const result = await this.authService.registerDonor(data);

      res.status(201).json({
        status: 'success',
        message: 'Donor registered successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  // Register Hospital
  async registerHospital(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: HospitalRegistrationDTO = req.body;

      // Validate required fields
      const requiredFields = [
        'email',
        'password',
        'hospitalName',
        'address',
        'headOfHospital',
        'phoneNumber',
      ];

      const missingFields = requiredFields.filter((field) => !data[field as keyof HospitalRegistrationDTO]);

      if (missingFields.length > 0) {
        res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
        return;
      }

      const result = await this.authService.registerHospital(data);

      res.status(201).json({
        status: 'success',
        message: 'Hospital registered successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  // Register Admin
  async registerAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: AdminRegistrationDTO = req.body;

      // Validate required fields
      const requiredFields = [
        'email',
        'password',
        'firstName',
        'lastName',
        'phoneNumber',
      ];

      const missingFields = requiredFields.filter((field) => !data[field as keyof AdminRegistrationDTO]);

      if (missingFields.length > 0) {
        res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
        return;
      }

      const result = await this.authService.registerAdmin(data);

      res.status(201).json({
        status: 'success',
        message: 'Admin registered successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  // Register RBC
  async registerRBC(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: RBCRegistrationDTO = req.body;

      // Validate required fields
      const requiredFields = [
        'email',
        'password',
        'officeName',
        'contactPerson',
        'phoneNumber',
        'address',
      ];

      const missingFields = requiredFields.filter((field) => !data[field as keyof RBCRegistrationDTO]);

      if (missingFields.length > 0) {
        res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
        return;
      }

      const result = await this.authService.registerRBC(data);

      res.status(201).json({
        status: 'success',
        message: 'RBC registered successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  // Register Ministry
  async registerMinistry(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: MinistryRegistrationDTO = req.body;

      // Validate required fields
      const requiredFields = [
        'email',
        'password',
        'departmentName',
        'contactPerson',
        'phoneNumber',
        'address',
      ];

      const missingFields = requiredFields.filter((field) => !data[field as keyof MinistryRegistrationDTO]);

      if (missingFields.length > 0) {
        res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
        return;
      }

      const result = await this.authService.registerMinistry(data);

      res.status(201).json({
        status: 'success',
        message: 'Ministry registered successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  // Login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginDTO = req.body;

      // Validate required fields
      if (!data.email || !data.password) {
        res.status(400).json({
          status: 'error',
          message: 'Email and password are required',
        });
        return;
      }

      const result = await this.authService.login(data);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'Invalid email or password' ||
          error.message === 'Account is deactivated')
      ) {
        res.status(401).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  // Get user profile
  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
        return;
      }

      const profile = await this.authService.getUserProfile(
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        status: 'success',
        message: 'Profile retrieved successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}
