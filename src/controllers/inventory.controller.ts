import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import pool from '../config/database';
import { UpdateInventoryDTO, BloodType } from '../types';

export class InventoryController {
  /**
   * Get blood inventory for a hospital
   */
  async getHospitalInventory(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;

      const result = await pool.query(
        `SELECT * FROM blood_inventory 
         WHERE hospital_id = $1 
         ORDER BY blood_type`,
        [hospitalId]
      );

      res.status(200).json({
        status: 'success',
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch inventory',
      });
    }
  }

  /**
   * Update blood inventory
   */
  async updateInventory(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;
      const updateData: UpdateInventoryDTO = req.body;

      // Check if inventory record exists
      const checkResult = await pool.query(
        `SELECT * FROM blood_inventory 
         WHERE hospital_id = $1 AND blood_type = $2`,
        [hospitalId, updateData.bloodType]
      );

      let result;
      if (checkResult.rows.length === 0) {
        // Create new inventory record
        const id = randomUUID();
        const units = updateData.operation === 'add' ? updateData.units : 0;
        
        result = await pool.query(
          `INSERT INTO blood_inventory (id, hospital_id, blood_type, units, critical_level, status, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           RETURNING *`,
          [id, hospitalId, updateData.bloodType, units, 20, this.calculateStatus(units, 20)]
        );
      } else {
        // Update existing inventory
        const currentUnits = checkResult.rows[0].units;
        const criticalLevel = checkResult.rows[0].critical_level;
        
        let newUnits = currentUnits;
        if (updateData.operation === 'add') {
          newUnits = currentUnits + updateData.units;
        } else if (updateData.operation === 'subtract') {
          newUnits = Math.max(0, currentUnits - updateData.units);
        }

        const status = this.calculateStatus(newUnits, criticalLevel);

        result = await pool.query(
          `UPDATE blood_inventory 
           SET units = $1, status = $2, last_updated = NOW()
           WHERE hospital_id = $3 AND blood_type = $4
           RETURNING *`,
          [newUnits, status, hospitalId, updateData.bloodType]
        );
      }

      res.status(200).json({
        status: 'success',
        message: 'Inventory updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update inventory',
      });
    }
  }

  /**
   * Initialize inventory for a hospital (all blood types)
   */
  async initializeInventory(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;

      const bloodTypes: BloodType[] = [
        BloodType.A_POSITIVE, BloodType.A_NEGATIVE,
        BloodType.B_POSITIVE, BloodType.B_NEGATIVE,
        BloodType.AB_POSITIVE, BloodType.AB_NEGATIVE,
        BloodType.O_POSITIVE, BloodType.O_NEGATIVE
      ];

      const inventoryRecords = [];

      for (const bloodType of bloodTypes) {
        const id = randomUUID();
        const result = await pool.query(
          `INSERT INTO blood_inventory (id, hospital_id, blood_type, units, critical_level, status, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (hospital_id, blood_type) DO NOTHING
           RETURNING *`,
          [id, hospitalId, bloodType, 0, 20, 'critical']
        );
        
        if (result.rows.length > 0) {
          inventoryRecords.push(result.rows[0]);
        }
      }

      res.status(201).json({
        status: 'success',
        message: 'Inventory initialized successfully',
        data: inventoryRecords,
      });
    } catch (error) {
      console.error('Error initializing inventory:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to initialize inventory',
      });
    }
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;

      const result = await pool.query(
        `SELECT 
          SUM(units) as total_units,
          COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical_count,
          COUNT(CASE WHEN status = 'low' THEN 1 END) as low_count,
          COUNT(CASE WHEN status = 'good' THEN 1 END) as good_count
         FROM blood_inventory
         WHERE hospital_id = $1`,
        [hospitalId]
      );

      res.status(200).json({
        status: 'success',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch inventory statistics',
      });
    }
  }

  /**
   * Helper method to calculate inventory status
   */
  private calculateStatus(units: number, criticalLevel: number): 'good' | 'low' | 'critical' {
    if (units < criticalLevel) {
      return 'critical';
    } else if (units < criticalLevel * 1.5) {
      return 'low';
    } else {
      return 'good';
    }
  }
}
