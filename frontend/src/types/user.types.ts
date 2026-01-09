export interface User {
  id: string | number; // Can be string from backend or number
  firstName: string;
  lastName: string;
  name: string; // Full name
  email: string;
  role?: string;
  avatar?: string;
  credits?: number;
  [key: string]: any;
}
