import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import pool from '../config/database';
import { CreatePostDTO, CreateEventDTO } from '../types';

export class CommunityController {
  /**
   * Get all community posts
   */
  async getAllPosts(req: Request, res: Response): Promise<void> {
    try {
      const { type, limit = 50 } = req.query;

      let query = `
        SELECT p.*, 
               dp.first_name || ' ' || dp.last_name as author_name,
               dp.blood_group as author_blood_type
        FROM community_posts p
        LEFT JOIN donor_profiles dp ON p.author_id = dp.user_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (type) {
        query += ` AND p.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex}`;
      params.push(limit);

      const result = await pool.query(query, params);

      res.status(200).json({
        status: 'success',
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch posts',
      });
    }
  }

  /**
   * Create a new post
   */
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const postData: CreatePostDTO = req.body;
      const id = randomUUID();

      const result = await pool.query(
        `INSERT INTO community_posts (id, author_id, content, type, likes, comments, image, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [
          id,
          postData.authorId,
          postData.content,
          postData.type,
          0,
          0,
          postData.image || null,
        ]
      );

      res.status(201).json({
        status: 'success',
        message: 'Post created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create post',
      });
    }
  }

  /**
   * Like a post
   */
  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE community_posts 
         SET likes = likes + 1, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Post not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error liking post:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to like post',
      });
    }
  }

  /**
   * Get all events
   */
  async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const { upcoming } = req.query;

      let query = `SELECT * FROM events WHERE 1=1`;
      const params: any[] = [];

      if (upcoming === 'true') {
        query += ` AND date >= CURRENT_DATE`;
      }

      query += ` ORDER BY date ASC`;

      const result = await pool.query(query, params);

      res.status(200).json({
        status: 'success',
        data: result.rows,
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch events',
      });
    }
  }

  /**
   * Create a new event
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData: CreateEventDTO = req.body;
      const id = randomUUID();

      const result = await pool.query(
        `INSERT INTO events (id, title, description, date, time, location, organizer, attendees, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [
          id,
          eventData.title,
          eventData.description,
          eventData.date,
          eventData.time,
          eventData.location,
          eventData.organizer,
          0,
        ]
      );

      res.status(201).json({
        status: 'success',
        message: 'Event created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create event',
      });
    }
  }

  /**
   * Join an event
   */
  async joinEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE events 
         SET attendees = attendees + 1, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Event not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'Successfully joined event',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error joining event:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to join event',
      });
    }
  }

  /**
   * Get community statistics
   */
  async getCommunityStats(_req: Request, res: Response): Promise<void> {
    try {
      const donorsResult = await pool.query(
        `SELECT COUNT(*) as total_members FROM donor_profiles`
      );

      const donationsResult = await pool.query(
        `SELECT 
          COUNT(*) as total_donations,
          SUM(impact) as lives_impacted
         FROM donations 
         WHERE status = 'completed'`
      );

      const activeDonorsResult = await pool.query(
        `SELECT COUNT(DISTINCT donor_id) as active_donors
         FROM donations
         WHERE date >= CURRENT_DATE - INTERVAL '6 months'`
      );

      res.status(200).json({
        status: 'success',
        data: {
          totalMembers: parseInt(donorsResult.rows[0].total_members) || 0,
          activeDonors: parseInt(activeDonorsResult.rows[0].active_donors) || 0,
          totalDonations: parseInt(donationsResult.rows[0].total_donations) || 0,
          livesImpacted: parseInt(donationsResult.rows[0].lives_impacted) || 0,
        },
      });
    } catch (error) {
      console.error('Error fetching community stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch community statistics',
      });
    }
  }

  /**
   * Get top donors leaderboard
   */
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const result = await pool.query(
        `SELECT 
          dp.user_id,
          dp.first_name || ' ' || dp.last_name as name,
          dp.blood_group as blood_type,
          COUNT(d.id) as donations,
          COUNT(d.id) * 100 as points
         FROM donor_profiles dp
         LEFT JOIN donations d ON dp.user_id = d.donor_id AND d.status = 'completed'
         GROUP BY dp.user_id, dp.first_name, dp.last_name, dp.blood_group
         ORDER BY donations DESC
         LIMIT $1`,
        [limit]
      );

      res.status(200).json({
        status: 'success',
        data: result.rows.map((row: any, index: number) => ({
          rank: index + 1,
          ...row,
        })),
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch leaderboard',
      });
    }
  }
}
