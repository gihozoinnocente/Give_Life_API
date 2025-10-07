// Define your types and interfaces here

// User Roles
export enum UserRole {
  DONOR = 'donor',
  HOSPITAL = 'hospital',
  ADMIN = 'admin',
  RBC = 'rbc', // Rwanda Biomedical Center
  MINISTRY = 'ministry'
}

// Blood Types
export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

// Base User Interface
export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Donor Profile
export interface DonorProfile {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  age: number;
  bloodGroup: BloodType;
  district: string;
  state: string;
  pinCode: string;
  lastDonationMonth?: string;
  lastDonationYear?: string;
}

// Hospital Profile
export interface HospitalProfile {
  userId: string;
  hospitalName: string;
  address: string;
  headOfHospital: string;
  phoneNumber: string;
}

// Admin Profile
export interface AdminProfile {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

// RBC Profile
export interface RBCProfile {
  userId: string;
  officeName: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
}

// Ministry Profile
export interface MinistryProfile {
  userId: string;
  departmentName: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
}

// Registration DTOs
export interface DonorRegistrationDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  age: number;
  bloodGroup: BloodType;
  district: string;
  state: string;
  pinCode: string;
  lastDonationMonth?: string;
  lastDonationYear?: string;
}

export interface HospitalRegistrationDTO {
  email: string;
  password: string;
  hospitalName: string;
  address: string;
  headOfHospital: string;
  phoneNumber: string;
}

export interface AdminRegistrationDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface RBCRegistrationDTO {
  email: string;
  password: string;
  officeName: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
}

export interface MinistryRegistrationDTO {
  email: string;
  password: string;
  departmentName: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
}

// Login DTO
export interface LoginDTO {
  email: string;
  password: string;
}

// Auth Response
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  token: string;
}

// API Response
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Express Request with User
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
