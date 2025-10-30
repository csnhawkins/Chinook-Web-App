// Core data types based on existing simple-music-app API

// User and Authentication
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'viewer';
  loginTime?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  adminMode: boolean;
}

// Database Connection (matches server.js structure)
export interface DatabaseConnection {
  client: 'mssql' | 'mysql' | 'mysql2' | 'pg' | 'oracledb';
  displayName?: string;
  
  // Properties expected by existing components
  name?: string;
  type?: 'mssql' | 'mysql' | 'postgresql' | 'oracle';
  environment?: 'production' | 'nonproduction' | 'development';
  
  connection?: {
    user?: string;
    password?: string;
    server?: string;
    host?: string;
    database: string;
    port?: number;
    hasPassword?: boolean;
    options?: {
      encrypt?: boolean;
      trustServerCertificate?: boolean;
      instanceName?: string;
      trustedConnection?: boolean;
    };
  };
  // Direct properties (alternative structure)
  user?: string;
  password?: string;
  host?: string;
  database?: string;
  port?: number;
  hasPassword?: boolean;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
    instanceName?: string;
    trustedConnection?: boolean;
  };
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  error?: string;
  details?: any;
}

// Customer Management
export interface Customer {
  CustomerId: number;
  FirstName: string;
  LastName: string;
  Company?: string;
  Address?: string;
  City?: string;
  State?: string;
  Country?: string;
  PostalCode?: string;
  Phone?: string;
  Fax?: string;
  Email: string;
  SupportRepId?: number;
  // Computed fields
  FullName?: string;
}

export interface CustomerSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerResponse {
  customers: Customer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Music Data
export interface Album {
  AlbumId: number;
  Title: string;
  ArtistId: number;
  ArtistName?: string; // Joined from Artist table
}

export interface Artist {
  ArtistId: number;
  Name: string;
  AlbumCount?: number; // Computed field
}

export interface Track {
  TrackId: number;
  Name: string;
  AlbumId?: number;
  MediaTypeId: number;
  GenreId?: number;
  Composer?: string;
  Milliseconds: number;
  Bytes?: number;
  UnitPrice: number;
  // Joined fields
  AlbumTitle?: string;
  ArtistName?: string;
  GenreName?: string;
  MediaTypeName?: string;
}

// Invoice System
export interface Invoice {
  InvoiceId?: number;
  CustomerId: number;
  InvoiceDate: string;
  BillingAddress?: string;
  BillingCity?: string;
  BillingState?: string;
  BillingCountry?: string;
  BillingPostalCode?: string;
  Total: number;
  // Computed/joined fields
  CustomerName?: string;
  ItemCount?: number;
}

export interface InvoiceLine {
  InvoiceLineId?: number;
  InvoiceId?: number;
  TrackId: number;
  UnitPrice: number;
  Quantity: number;
  // Computed fields
  LineTotal?: number;
  TrackName?: string;
  AlbumTitle?: string;
  ArtistName?: string;
}

export interface InvoiceRequest {
  customer: Customer;
  tracks: Array<{
    TrackId: number;
    UnitPrice: number;
    Quantity: number;
  }>;
  billingAddress?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

// Dashboard Analytics
export interface DashboardStats {
  customerCount: number;
  totalRevenue: number;
  recentSalesCount: number;
  topTracksCount: number;
}

export interface RecentSale {
  InvoiceId: number;
  CustomerName: string;
  InvoiceDate: string;
  Total: number;
  ItemCount: number;
}

export interface TopTrack {
  TrackId: number;
  Name: string;
  AlbumTitle: string;
  ArtistName: string;
  TotalSold: number;
  Revenue: number;
}

export interface RevenueData {
  period: string;
  revenue: number;
  invoiceCount: number;
}

// Tutorial/Quest System
export interface Quest {
  id: string;
  type: 'tdm' | 'flyway';
  title: string;
  description: string;
  tasks: QuestTask[];
  completedTasks: string[];
  isCompleted: boolean;
  progress: number; // 0-100
}

export interface QuestTask {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  order: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Table browsing generic types
export interface TableData {
  columns: string[];
  rows: any[][];
  totalCount: number;
}

export interface TableQuery {
  table: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form validation types
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

// Connection test result
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  connectionTime?: number;
  serverVersion?: string;
  database?: string;
}

// Environment theme
export interface EnvironmentTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export type EnvironmentType = 'production' | 'nonproduction' | 'development';