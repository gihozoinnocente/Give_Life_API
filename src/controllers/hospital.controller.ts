import { Request, Response, NextFunction } from 'express';
import { HospitalService } from '../services/hospital.service';

export class HospitalController {
  private hospitalService: HospitalService;

  constructor() {
    this.hospitalService = new HospitalService();
    // Bind methods
    this.getAllHospitals = this.getAllHospitals.bind(this);
    this.getHospitalById = this.getHospitalById.bind(this);
    this.searchHospitals = this.searchHospitals.bind(this);
  }

  // Get all hospitals
  async getAllHospitals(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hospitals = await this.hospitalService.getAllHospitals();
      
      res.status(200).json({
        status: 'success',
        message: 'Retrieved all hospitals',
        data: hospitals,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get hospital by ID
  async getHospitalById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const hospital = await this.hospitalService.getHospitalById(id);
      
      res.status(200).json({
        status: 'success',
        message: `Retrieved hospital with ID: ${id}`,
        data: hospital,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Hospital not found') {
        res.status(404).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  // Search hospitals
  async searchHospitals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchTerm = req.query.search as string;
      const hospitals = await this.hospitalService.searchHospitals(searchTerm);
      
      res.status(200).json({
        status: 'success',
        message: 'Hospitals retrieved successfully',
        data: hospitals,
      });
    } catch (error) {
      next(error);
    }
  }
}
