import store from '@/redux/store';
import { AuthState } from './auth';

// Define RootState type based on your Redux store
export type RootState = {
  auth: AuthState;
  // Add other slice states here if you have them
};

// Registration form data type
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
  
  // Optional profile fields
  grade?: string;
  guardianName?: string;
  bloodGroup?: string;
  studentId?: string;
  address?: string;
  age?: number;
  emergencyContact?: string;
}