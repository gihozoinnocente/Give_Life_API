import pool from '../config/database';

export type EarnedBadge = {
  key: string;
  title: string;
  description: string;
  earnedAt: Date;
  meta?: any;
};

export type BadgeProgress = {
  key: string;
  title: string;
  description: string;
  current: number;
  target: number;
  percent: number;
};

export class BadgeService {
  // Compute earned and in-progress badges from real data
  async computeProgress(donorId: string): Promise<{ earned: EarnedBadge[]; inProgress: BadgeProgress[] }> {
    // donations summary
    const donationsRes = await pool.query(
      `SELECT COUNT(*)::int as donation_count, COALESCE(SUM(units),0)::int as total_units
       FROM donations WHERE donor_id = $1 AND status = 'completed'`,
      [donorId]
    );
    const donationCount = donationsRes.rows[0]?.donation_count || 0;
    const totalUnits = donationsRes.rows[0]?.total_units || 0;

    // donor blood group
    const dp = await pool.query(`SELECT blood_group FROM donor_profiles WHERE user_id = $1`, [donorId]);
    const bloodGroup: string | null = dp.rows[0]?.blood_group || null;

    // monthly streak (count consecutive months with >=1 donation)
    const streakRes = await pool.query(
      `WITH months AS (
         SELECT DISTINCT date_trunc('month', date) AS m
         FROM donations
         WHERE donor_id = $1 AND status = 'completed'
         ORDER BY m DESC
       )
       SELECT COALESCE(
         (SELECT COUNT(1) FROM (
            SELECT m, lag(m) OVER (ORDER BY m DESC) AS prev
            FROM months
         ) t WHERE prev IS NULL OR t.prev = t.m + interval '1 month'), 0) AS streak`,
      [donorId]
    );
    const streak = streakRes.rows[0]?.streak || 0;

    const earned: EarnedBadge[] = [];
    const inProgress: BadgeProgress[] = [];

    const pushTier = (key: string, title: string, desc: string, current: number, target: number) => {
      if (current >= target) {
        earned.push({ key, title, description: desc, earnedAt: new Date() });
      } else {
        inProgress.push({ key, title, description: desc, current, target, percent: Math.min(100, Math.round((current / target) * 100)) });
      }
    };

    // Core tiers by donation count
    pushTier('donation_1', 'Beginner Donor', 'Complete 1 donation', donationCount, 1);
    pushTier('donation_5', 'Lifesaver', 'Complete 5 donations', donationCount, 5);
    pushTier('donation_10', 'Hero', 'Complete 10 donations', donationCount, 10);
    pushTier('donation_20', 'Champion', 'Complete 20 donations', donationCount, 20);

    // Impact by total units
    pushTier('impact_5', 'Bronze Impact', 'Donate 5 total units', totalUnits, 5);
    pushTier('impact_15', 'Silver Impact', 'Donate 15 total units', totalUnits, 15);
    pushTier('impact_30', 'Gold Impact', 'Donate 30 total units', totalUnits, 30);

    // Consistency streaks
    pushTier('streak_3', '3-Month Streak', 'Donate in 3 consecutive months', streak, 3);
    pushTier('streak_6', '6-Month Streak', 'Donate in 6 consecutive months', streak, 6);

    // Rarity badges
    if (bloodGroup === 'O-') {
      pushTier('rare_on_5', 'O- Champion', 'O- donor with 5+ donations', donationCount, 5);
    } else if (bloodGroup === 'AB+') {
      pushTier('rare_abp_5', 'AB+ Ally', 'AB+ donor with 5+ donations', donationCount, 5);
    }

    return { earned, inProgress };
  }

  // Return keys of already awarded badges
  private async getAwardedKeys(donorId: string): Promise<Set<string>> {
    const r = await pool.query(`SELECT badge_key FROM donor_badges WHERE donor_id = $1`, [donorId]);
    return new Set(r.rows.map((row: any) => row.badge_key as string));
  }

  // Insert any new badges and return those newly awarded (with earnedAt)
  async awardNewBadges(donorId: string): Promise<EarnedBadge[]> {
    const { earned } = await this.computeProgress(donorId);
    const existing = await this.getAwardedKeys(donorId);
    const newlyAwarded: EarnedBadge[] = [];

    for (const b of earned) {
      if (!existing.has(b.key)) {
        const res = await pool.query(
          `INSERT INTO donor_badges (donor_id, badge_key, earned_at, meta)
           VALUES ($1, $2, NOW(), $3)
           ON CONFLICT (donor_id, badge_key) DO NOTHING
           RETURNING earned_at`,
          [donorId, b.key, JSON.stringify({ title: b.title, description: b.description })]
        );
        const earnedAt = res.rows[0]?.earned_at ? new Date(res.rows[0].earned_at) : new Date();
        newlyAwarded.push({ ...b, earnedAt });
      }
    }

    return newlyAwarded;
  }
}
