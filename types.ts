
export interface LocationHierarchy {
  division: string;
  district: string;
  upazila: string;
  village: string; // Optional or text input
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Category {
  POLICE = 'Police',
  HOSPITAL = 'Hospital',
  HOTEL = 'Hotel',
  BANK = 'Bank',
  SCHOOL = 'School/College',
  RESTAURANT = 'Restaurant',
  FIRE_SERVICE = 'Fire Service',
  BLOOD_DONATION = 'Blood Donation',
  LAWYER = 'Lawyer',
  EVENT_MANAGEMENT = 'Event Management',
  TOURIST_SPOT = 'Tourist Spot',
  GOVT_OFFICE = 'Govt Office',
  SUPERSHOP = 'Supershop',
  PHOTOGRAPHER = 'Photographer',
  HOTLINE = 'Hotline',
  BUS_STAND = 'Bus Stand',
  OTHER = 'Other'
}

export interface CategoryField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel';
  required: boolean;
  placeholder?: string;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  icon: string;
  fields: CategoryField[]; // Dynamic fields specific to this category
  isSystem?: boolean; // If true, cannot be deleted (e.g. core categories)
}

export interface ServiceEntry {
  id: string;
  name: string;
  category: string; // Changed from enum to string to support dynamic categories
  description: string;
  phone: string;
  address: LocationHierarchy;
  location?: { lat: number; lng: number }; // Optional coords
  status: ServiceStatus;
  submittedBy: string; // User UID (Secure)
  submitterName?: string; // Display Name (Readable)
  submittedAt: number; // Timestamp
  likes: number;
  views?: number; // Track page views
  tags: string[];
  dynamicData?: Record<string, any>; // Stores values for dynamic fields
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'user' | 'admin';
}

export interface UserDocument extends UserProfile {
  photoURL?: string;
  createdAt: number;
  isBanned: boolean;
  lastLogin: number;
}

export interface ReportDocument {
  id: string;
  serviceId: string;
  serviceName: string;
  reason: string;
  details: string;
  reportedBy?: string; // Optional (can be anonymous)
  reportedAt: number;
}

export interface NotificationDocument {
  id: string;
  userId: string; // 'ALL' or specific UID
  title: string;
  message: string;
  isRead: boolean;
  createdAt: number;
  link?: string;
}

export interface BlogDocument {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  createdAt: number;
  imageUrl?: string;
  views?: number; // Track reads
}