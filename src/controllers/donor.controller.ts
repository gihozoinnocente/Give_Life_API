import { Request, Response, NextFunction } from 'express';
import { DonorService } from '../services/donor.service';
import { DonorSearchFilters } from '../types';

export class DonorController {
  private donorService: DonorService;

  constructor() {
    this.donorService = new DonorService();
    // Bind methods to ensure correct 'this' context
    this.getAllDonors = this.getAllDonors.bind(this);
    this.getDonorById = this.getDonorById.bind(this);
    this.searchDonors = this.searchDonors.bind(this);
    this.getDonorsByBloodGroup = this.getDonorsByBloodGroup.bind(this);
  }

  // Get all donors
  async getAllDonors(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donors = await this.donorService.getAllDonors();
      
      res.status(200).json({
        status: 'success',
        message: 'Retrieved all donors',
        data: donors,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get donor by ID
  async getDonorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const donor = await this.donorService.getDonorById(id);
      
      res.status(200).json({
        status: 'success',
        message: `Retrieved donor with ID: ${id}`,
        data: donor,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Donor not found') {
        res.status(404).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  // Search donors with filters
  async searchDonors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: DonorSearchFilters = {
        bloodGroup: req.query.bloodGroup as any,
        district: req.query.district as string,
        state: req.query.state as string,
        minAge: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
        maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
      };

      const donors = await this.donorService.searchDonors(filters);
      
      res.status(200).json({
        status: 'success',
        message: 'Donors retrieved successfully',
        data: donors,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get donors by blood group
  async getDonorsByBloodGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bloodGroup } = req.params;
      const donors = await this.donorService.getDonorsByBloodGroup(bloodGroup as any);
      
      res.status(200).json({
        status: 'success',
        message: `Retrieved donors with blood group: ${bloodGroup}`,
        data: donors,
      });
    } catch (error) {
      next(error);
    }
  }
}
