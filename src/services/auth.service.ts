import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import {
  UserRole,
  DonorRegistrationDTO,
  HospitalRegistrationDTO,
  AdminRegistrationDTO,
  RBCRegistrationDTO,
  MinistryRegistrationDTO,
  LoginDTO,
  AuthResponse,
  JWTPayload,
} from '../types';

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  }

  // Generate JWT token
  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Verify password
  private async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Check if email already exists
  private async emailExists(email: string): Promise<boolean> {
    const result = await query('SELECT id FROM users WHERE email = $1', [
      email,
    ]);
    return result.rows.length > 0;
  }

  // Register Donor
  async registerDonor(data: DonorRegistrationDTO): Promise<AuthResponse> {
    // Check if email already exists
    if (await this.emailExists(data.email)) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Start transaction
    await query('BEGIN', []);

    try {
      // Insert user
      const userResult = await query(
        `INSERT INTO users (email, password, role) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, role`,
        [data.email, hashedPassword, UserRole.DONOR]
      );

      const user = userResult.rows[0];

      // Insert donor profile
      await query(
        `INSERT INTO donor_profiles 
         (user_id, first_name, last_name, phone_number, address, age, blood_group, 
          district, state, pin_code, last_donation_month, last_donation_year) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          user.id,
          data.firstName,
          data.lastName,
          data.phoneNumber,
          data.address,
          data.age,
          data.bloodGroup,
          data.district,
          data.state,
          data.pinCode,
          data.lastDonationMonth || null,
          data.lastDonationYear || null,
        ]
      );

      await query('COMMIT', []);

      // Generate token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      await query('ROLLBACK', []);
      throw error;
    }
  }

  // Register Hospital
  async registerHospital(
    data: HospitalRegistrationDTO
  ): Promise<AuthResponse> {
    if (await this.emailExists(data.email)) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await this.hashPassword(data.password);

    try {
      await query('BEGIN', []);

      const userResult = await query(
        `INSERT INTO users (email, password, role) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, role`,
        [data.email, hashedPassword, UserRole.HOSPITAL]
      );

      const user = userResult.rows[0];

      await query(
        `INSERT INTO hospital_profiles 
         (user_id, hospital_name, address, head_of_hospital, phone_number, district, state, pin_code) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user.id,
          data.hospitalName,
          data.address,
          data.headOfHospital,
          data.phoneNumber,
          data.district || null,
          data.state || null,
          data.pinCode || null,
        ]
      );

      await query('COMMIT', []);

      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      await query('ROLLBACK', []);
      throw error;
    }
  }

  // Register Admin
  async registerAdmin(data: AdminRegistrationDTO): Promise<AuthResponse> {
    if (await this.emailExists(data.email)) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await this.hashPassword(data.password);

    try {
      await query('BEGIN', []);

      const userResult = await query(
        `INSERT INTO users (email, password, role) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, role`,
        [data.email, hashedPassword, UserRole.ADMIN]
      );

      const user = userResult.rows[0];

      await query(
        `INSERT INTO admin_profiles 
         (user_id, first_name, last_name, phone_number) 
         VALUES ($1, $2, $3, $4)`,
        [user.id, data.firstName, data.lastName, data.phoneNumber]
      );

      await query('COMMIT', []);

      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      await query('ROLLBACK', []);
      throw error;
    }
  }

  // Register RBC
  async registerRBC(data: RBCRegistrationDTO): Promise<AuthResponse> {
    if (await this.emailExists(data.email)) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await this.hashPassword(data.password);

    try {
      await query('BEGIN', []);

      const userResult = await query(
        `INSERT INTO users (email, password, role) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, role`,
        [data.email, hashedPassword, UserRole.RBC]
      );

      const user = userResult.rows[0];

      await query(
        `INSERT INTO rbc_profiles 
         (user_id, office_name, contact_person, phone_number, address) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          data.officeName,
          data.contactPerson,
          data.phoneNumber,
          data.address,
        ]
      );

      await query('COMMIT', []);

      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      await query('ROLLBACK', []);
      throw error;
    }
  }

  // Register Ministry
  async registerMinistry(
    data: MinistryRegistrationDTO
  ): Promise<AuthResponse> {
    if (await this.emailExists(data.email)) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await this.hashPassword(data.password);

    try {
      await query('BEGIN', []);

      const userResult = await query(
        `INSERT INTO users (email, password, role) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, role`,
        [data.email, hashedPassword, UserRole.MINISTRY]
      );

      const user = userResult.rows[0];

      await query(
        `INSERT INTO ministry_profiles 
         (user_id, department_name, contact_person, phone_number, address) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          data.departmentName,
          data.contactPerson,
          data.phoneNumber,
          data.address,
        ]
      );

      await query('COMMIT', []);

      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      await query('ROLLBACK', []);
      throw error;
    }
  }

  // Login
  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const result = await query(
      'SELECT id, email, password, role, is_active FROM users WHERE email = $1',
      [data.email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Get full user profile
    const fullProfile = await this.getUserProfile(user.id, user.role);

    return {
      user: fullProfile,
      token,
    };
  }

  // Get user profile by ID
  async getUserProfile(userId: string, role: UserRole): Promise<any> {
    let profileQuery = '';

    switch (role) {
      case UserRole.DONOR:
        profileQuery = `
          SELECT u.id, u.email, u.role, u.is_active, u.created_at,
                 dp.first_name, dp.last_name, dp.phone_number, dp.address, 
                 dp.age, dp.blood_group, dp.district, dp.state, dp.pin_code,
                 dp.last_donation_month, dp.last_donation_year
          FROM users u
          JOIN donor_profiles dp ON u.id = dp.user_id
          WHERE u.id = $1
        `;
        break;
      case UserRole.HOSPITAL:
        profileQuery = `
          SELECT u.id, u.email, u.role, u.is_active, u.created_at,
                 hp.hospital_name, hp.address, hp.head_of_hospital, hp.phone_number,
                 hp.district, hp.state, hp.pin_code
          FROM users u
          JOIN hospital_profiles hp ON u.id = hp.user_id
          WHERE u.id = $1
        `;
        break;
      case UserRole.ADMIN:
        profileQuery = `
          SELECT u.id, u.email, u.role, u.is_active, u.created_at,
                 ap.first_name, ap.last_name, ap.phone_number
          FROM users u
          JOIN admin_profiles ap ON u.id = ap.user_id
          WHERE u.id = $1
        `;
        break;
      case UserRole.RBC:
        profileQuery = `
          SELECT u.id, u.email, u.role, u.is_active, u.created_at,
                 rp.office_name, rp.contact_person, rp.phone_number, rp.address
          FROM users u
          JOIN rbc_profiles rp ON u.id = rp.user_id
          WHERE u.id = $1
        `;
        break;
      case UserRole.MINISTRY:
        profileQuery = `
          SELECT u.id, u.email, u.role, u.is_active, u.created_at,
                 mp.department_name, mp.contact_person, mp.phone_number, mp.address
          FROM users u
          JOIN ministry_profiles mp ON u.id = mp.user_id
          WHERE u.id = $1
        `;
        break;
      default:
        throw new Error('Invalid user role');
    }

    const result = await query(profileQuery, [userId]);

    if (result.rows.length === 0) {
      throw new Error('User profile not found');
    }

    const profile = result.rows[0];

    // Convert snake_case to camelCase for frontend
    const formattedProfile: any = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      isActive: profile.is_active,
      createdAt: profile.created_at,
    };

    // Add role-specific fields
    if (role === UserRole.DONOR) {
      formattedProfile.firstName = profile.first_name;
      formattedProfile.lastName = profile.last_name;
      formattedProfile.phoneNumber = profile.phone_number;
      formattedProfile.address = profile.address;
      formattedProfile.age = profile.age;
      formattedProfile.bloodGroup = profile.blood_group;
      formattedProfile.district = profile.district;
      formattedProfile.state = profile.state;
      formattedProfile.pinCode = profile.pin_code;
      formattedProfile.lastDonationMonth = profile.last_donation_month;
      formattedProfile.lastDonationYear = profile.last_donation_year;
    } else if (role === UserRole.HOSPITAL) {
      formattedProfile.hospitalName = profile.hospital_name;
      formattedProfile.address = profile.address;
      formattedProfile.headOfHospital = profile.head_of_hospital;
      formattedProfile.phoneNumber = profile.phone_number;
      formattedProfile.district = profile.district;
      formattedProfile.state = profile.state;
      formattedProfile.pinCode = profile.pin_code;
    } else if (role === UserRole.ADMIN) {
      formattedProfile.firstName = profile.first_name;
      formattedProfile.lastName = profile.last_name;
      formattedProfile.phoneNumber = profile.phone_number;
    } else if (role === UserRole.RBC) {
      formattedProfile.officeName = profile.office_name;
      formattedProfile.contactPerson = profile.contact_person;
      formattedProfile.phoneNumber = profile.phone_number;
      formattedProfile.address = profile.address;
    } else if (role === UserRole.MINISTRY) {
      formattedProfile.departmentName = profile.department_name;
      formattedProfile.contactPerson = profile.contact_person;
      formattedProfile.phoneNumber = profile.phone_number;
      formattedProfile.address = profile.address;
    }

    return formattedProfile;
  }

  // Update user profile
  async updateUserProfile(
    userId: string,
    role: UserRole,
    updateData: any
  ): Promise<any> {
    let updateQuery = '';
    const params: any[] = [userId];
    let paramIndex = 2;

    switch (role) {
      case UserRole.DONOR:
        const donorFields: string[] = [];
        if (updateData.firstName) {
          donorFields.push(`first_name = $${paramIndex++}`);
          params.push(updateData.firstName);
        }
        if (updateData.lastName) {
          donorFields.push(`last_name = $${paramIndex++}`);
          params.push(updateData.lastName);
        }
        if (updateData.phoneNumber) {
          donorFields.push(`phone_number = $${paramIndex++}`);
          params.push(updateData.phoneNumber);
        }
        if (updateData.address) {
          donorFields.push(`address = $${paramIndex++}`);
          params.push(updateData.address);
        }
        if (updateData.age) {
          donorFields.push(`age = $${paramIndex++}`);
          params.push(updateData.age);
        }
        if (updateData.bloodGroup) {
          donorFields.push(`blood_group = $${paramIndex++}`);
          params.push(updateData.bloodGroup);
        }
        if (updateData.district) {
          donorFields.push(`district = $${paramIndex++}`);
          params.push(updateData.district);
        }
        if (updateData.state) {
          donorFields.push(`state = $${paramIndex++}`);
          params.push(updateData.state);
        }
        if (updateData.pinCode) {
          donorFields.push(`pin_code = $${paramIndex++}`);
          params.push(updateData.pinCode);
        }
        if (updateData.lastDonationMonth) {
          donorFields.push(`last_donation_month = $${paramIndex++}`);
          params.push(updateData.lastDonationMonth);
        }
        if (updateData.lastDonationYear) {
          donorFields.push(`last_donation_year = $${paramIndex++}`);
          params.push(updateData.lastDonationYear);
        }

        if (donorFields.length > 0) {
          updateQuery = `UPDATE donor_profiles SET ${donorFields.join(', ')} WHERE user_id = $1`;
          await query(updateQuery, params);
        }
        break;

      case UserRole.HOSPITAL:
        const hospitalFields: string[] = [];
        if (updateData.hospitalName) {
          hospitalFields.push(`hospital_name = $${paramIndex++}`);
          params.push(updateData.hospitalName);
        }
        if (updateData.address) {
          hospitalFields.push(`address = $${paramIndex++}`);
          params.push(updateData.address);
        }
        if (updateData.headOfHospital) {
          hospitalFields.push(`head_of_hospital = $${paramIndex++}`);
          params.push(updateData.headOfHospital);
        }
        if (updateData.phoneNumber) {
          hospitalFields.push(`phone_number = $${paramIndex++}`);
          params.push(updateData.phoneNumber);
        }
        if (updateData.district) {
          hospitalFields.push(`district = $${paramIndex++}`);
          params.push(updateData.district);
        }
        if (updateData.state) {
          hospitalFields.push(`state = $${paramIndex++}`);
          params.push(updateData.state);
        }
        if (updateData.pinCode) {
          hospitalFields.push(`pin_code = $${paramIndex++}`);
          params.push(updateData.pinCode);
        }

        if (hospitalFields.length > 0) {
          updateQuery = `UPDATE hospital_profiles SET ${hospitalFields.join(', ')} WHERE user_id = $1`;
          await query(updateQuery, params);
        }
        break;

      default:
        throw new Error('Profile update not supported for this user role');
    }

    // Return updated profile
    return this.getUserProfile(userId, role);
  }
}
