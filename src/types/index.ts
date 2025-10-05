// Define your types and interfaces here

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bloodType: BloodType;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}
