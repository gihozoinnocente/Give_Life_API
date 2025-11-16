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
    this.optInDonor = this.optInDonor.bind(this);
    this.getHospitalDonors = this.getHospitalDonors.bind(this);
    this.getRecognition = this.getRecognition.bind(this);
    this.getHealthRecords = this.getHealthRecords.bind(this);
    this.createHealthRecord = this.createHealthRecord.bind(this);
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

  // Donor opt-in via signed token link
  async optInDonor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hospitalId } = req.params;
      const token = (req.query.token as string) || '';
      const result = await this.hospitalService.recordDonorOptIn(hospitalId, token);
      res.status(200).json({
        status: 'success',
        message: 'You have been listed as an available donor for this hospital',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  }

  // Get donors who opted-in for a hospital
  async getHospitalDonors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const donors = await this.hospitalService.getHospitalDonors(id);
      res.status(200).json({
        status: 'success',
        message: 'Hospital donors retrieved successfully',
        data: donors,
      });
    } catch (error) {
      next(error);
    }
  }

  // Recognition aggregates for a hospital
  async getRecognition(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.hospitalService.getRecognitionStats(id);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  // Get health records for a hospital
  async getHealthRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const donorId = (req.query.donorId as string) || undefined;
      const records = await this.hospitalService.getHealthRecords(id, donorId);
      res.status(200).json({ status: 'success', data: records });
    } catch (error) {
      next(error);
    }
  }

  // Create a new health record for a donor at this hospital
  async createHealthRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const record = await this.hospitalService.createHealthRecord(id, req.body);
      res.status(201).json({ status: 'success', data: record });
    } catch (error) {
      next(error);
    }
  }
}
