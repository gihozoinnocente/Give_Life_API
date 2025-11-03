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

// Notification Types
export enum NotificationUrgency {
  CRITICAL = 'critical',
  URGENT = 'urgent',
  NORMAL = 'normal'
}

export interface BloodRequestNotification {
  id?: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: BloodType;
  unitsNeeded: number;
  urgency: NotificationUrgency;
  patientCondition: string;
  contactPerson: string;
  contactPhone: string;
  location: string;
  additionalNotes?: string;
  expiryDate: Date;
  status: 'active' | 'fulfilled' | 'expired';
  createdAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'blood_request';
  title: string;
  message: string;
  data: BloodRequestNotification;
  isRead: boolean;
  createdAt: Date;
}

// Profile Update DTOs
export interface UpdateDonorProfileDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  age?: number;
  bloodGroup?: BloodType;
  district?: string;
  state?: string;
  pinCode?: string;
  lastDonationMonth?: string;
  lastDonationYear?: string;
}

export interface UpdateHospitalProfileDTO {
  hospitalName?: string;
  address?: string;
  headOfHospital?: string;
  phoneNumber?: string;
}

// Donor Search Filters
export interface DonorSearchFilters {
  bloodGroup?: BloodType;
  district?: string;
  state?: string;
  minAge?: number;
  maxAge?: number;
}

// Donation Record
export interface Donation {
  id: string;
  donorId: string;
  hospitalId: string;
  date: Date;
  bloodType: BloodType;
  units: number;
  status: 'completed' | 'pending' | 'cancelled';
  certificate?: string;
  impact: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDonationDTO {
  donorId: string;
  hospitalId: string;
  date: Date;
  bloodType: BloodType;
  units: number;
}

// Appointment
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum AppointmentType {
  REGULAR = 'regular',
  PLATELET = 'platelet',
  PLASMA = 'plasma',
  URGENT = 'urgent'
}

export interface Appointment {
  id: string;
  donorId: string;
  hospitalId: string;
  date: Date;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentDTO {
  donorId: string;
  hospitalId: string;
  date: Date;
  time: string;
  type: AppointmentType;
  notes?: string;
}

export interface UpdateAppointmentDTO {
  date?: Date;
  time?: string;
  type?: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
}

export interface TimeSlotAvailability {
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  date: string;
  totalSlots: number;
  availableSlots: string[];
  bookedSlots: string[];
  availableCount: number;
  bookedCount: number;
}

export interface HospitalInfo {
  id: string;
  hospital_name: string;
  address: string;
  phone_number: string;
  head_of_hospital: string;
}

// Blood Inventory
export interface BloodInventory {
  id: string;
  hospitalId: string;
  bloodType: BloodType;
  units: number;
  criticalLevel: number;
  status: 'good' | 'low' | 'critical';
  lastUpdated: Date;
}

export interface UpdateInventoryDTO {
  bloodType: BloodType;
  units: number;
  operation: 'add' | 'subtract';
}

// Blood Request
export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled'
}

export interface BloodRequest {
  id: string;
  hospitalId: string;
  patientName: string;
  bloodType: BloodType;
  units: number;
  urgency: NotificationUrgency;
  status: RequestStatus;
  contactPerson: string;
  contactPhone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBloodRequestDTO {
  hospitalId: string;
  patientName: string;
  bloodType: BloodType;
  units: number;
  urgency: NotificationUrgency;
  contactPerson: string;
  contactPhone: string;
  notes?: string;
}

export interface UpdateBloodRequestDTO {
  status?: RequestStatus;
  notes?: string;
}

// Community Post
export enum PostType {
  MILESTONE = 'milestone',
  URGENT = 'urgent',
  CELEBRATION = 'celebration',
  STORY = 'story',
  GENERAL = 'general'
}

export interface CommunityPost {
  id: string;
  authorId: string;
  content: string;
  type: PostType;
  likes: number;
  comments: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostDTO {
  authorId: string;
  content: string;
  type: PostType;
  image?: string;
}

// Event
export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  organizer: string;
}

// Achievement
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'donations' | 'milestones' | 'community' | 'special';
  icon: string;
  points: number;
  requirement: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Log
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata?: any;
  createdAt: Date;
}

// Dashboard Stats
export interface DonorStats {
  totalDonations: number;
  livesImpacted: number;
  nextEligible: string;
  points: number;
  currentStreak: number;
  lastDonation?: Date;
}

export interface HospitalStats {
  totalRequests: number;
  activeRequests: number;
  totalDonors: number;
  bloodUnits: number;
  appointmentsToday: number;
}

// Analytics
export interface BloodTypeDistribution {
  bloodType: BloodType;
  count: number;
  percentage: number;
}

export interface DonationTrend {
  date: string;
  count: number;
}

// Express Request with User
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
