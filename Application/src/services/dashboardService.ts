interface DashboardStats {
  customerCount: number;
  totalInvoices: number;
  totalRevenue: number;
  albumCount?: number;
}

interface TopTrack {
  trackId: number;
  name: string;
  artistName: string;
  timesPlayed: number;
}

interface RecentCustomer {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
}

export class DashboardService {
  private static baseUrl = '/api/dashboard';

  static async getCustomerCount(connectionName?: string): Promise<{ count: number }> {
    const url = connectionName 
      ? `${this.baseUrl}/customers?conn=${encodeURIComponent(connectionName)}`
      : `${this.baseUrl}/customers`;
    
    console.log('Fetching customer count from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Customer count API error:', response.status, errorText);
      throw new Error(`Failed to fetch customer count: ${response.status} ${errorText}`);
    }
    return response.json();
  }

  static async getTotalInvoices(connectionName?: string, timePeriod?: string): Promise<{ count: number; period?: string }> {
    const params = new URLSearchParams();
    if (connectionName) params.append('conn', connectionName);
    if (timePeriod) params.append('period', timePeriod);
    
    const url = `${this.baseUrl}/total-invoices?${params.toString()}`;
    
    console.log('Fetching total invoices from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Total invoices API error:', response.status, errorText);
      throw new Error(`Failed to fetch total invoices: ${response.status} ${errorText}`);
    }
    return response.json();
  }

  static async getRevenue(connectionName?: string, timePeriod?: string): Promise<{ total: number }> {
    const params = new URLSearchParams();
    if (connectionName) params.append('conn', connectionName);
    if (timePeriod) params.append('period', timePeriod);
    
    const url = `${this.baseUrl}/revenue?${params.toString()}`;
    
    console.log('Fetching revenue from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Revenue API error:', response.status, errorText);
      throw new Error(`Failed to fetch revenue: ${response.status} ${errorText}`);
    }
    return response.json();
  }

  static async getTopTracks(connectionName?: string): Promise<TopTrack[]> {
    const url = connectionName 
      ? `${this.baseUrl}/top-tracks?conn=${encodeURIComponent(connectionName)}`
      : `${this.baseUrl}/top-tracks`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch top tracks');
    }
    return response.json();
  }

  static async getRecentCustomers(connectionName?: string): Promise<RecentCustomer[]> {
    const url = connectionName 
      ? `${this.baseUrl}/recent-customers?conn=${encodeURIComponent(connectionName)}`
      : `${this.baseUrl}/recent-customers`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch recent customers');
    }
    return response.json();
  }

  static async getDashboardStats(connectionName?: string, timePeriod?: string): Promise<DashboardStats> {
    try {
      const [customerCount, invoiceData, revenue] = await Promise.all([
        this.getCustomerCount(connectionName),
        this.getTotalInvoices(connectionName, timePeriod),
        this.getRevenue(connectionName, timePeriod)
      ]);

      return {
        customerCount: customerCount.count || 0,
        totalInvoices: invoiceData.count || 0,
        totalRevenue: revenue.total || 0
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }
}