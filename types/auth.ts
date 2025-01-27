// types/auth.ts
export interface AuthState {
    user: null | { 
      id: string; 
      name: string; 
      email: string; 
      role: string;
      
      // Optional profile fields
      grade?: string;
      age?: number;
      guardianName?: string;
      phone?: string;
      address?: string;
      bloodGroup?: string;
      emergencyContact?: string;
      studentId?: string;
      joinDate?: string;
    };
    token: string | null;
    error: string | null;
    loading: boolean;
  }
  
  export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    age: string;
    role: 'Student' | 'Teacher' | 'Intern';
    batch?: 'morning' | 'afternoon' | 'Both';
    phone: string;
    emergencyContact: string;
    address: string;
    username: string;
  }