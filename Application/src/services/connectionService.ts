import { DatabaseConnection, ConnectionTestResult } from '../types';

export class ConnectionService {
  private static baseUrl = '/api';

  // Helper to flatten connection config for API compatibility
  private static flattenConnectionConfig(config: DatabaseConnection) {
    const conn = (config.connection || {}) as any;
    return {
      client: config.client,
      host: conn.server || conn.host || 'localhost',
      server: conn.server || conn.host || 'localhost',
      database: conn.database,
      user: conn.user,
      password: conn.password,
      port: conn.port,
      options: conn.options || {}
    };
  }

  static async getConnections(): Promise<{ connections: Record<string, DatabaseConnection>; default: string }> {
    const response = await fetch(`${this.baseUrl}/connections`);
    if (!response.ok) {
      throw new Error('Failed to fetch connections');
    }
    return response.json();
  }

  static async testConnection(config: DatabaseConnection): Promise<ConnectionTestResult> {
    const flattenedConfig = this.flattenConnectionConfig(config);
    
    const response = await fetch(`${this.baseUrl}/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flattenedConfig),
    });

    if (!response.ok) {
      throw new Error('Failed to test connection');
    }

    return response.json();
  }

  static async testConnectionByName(connectionName: string): Promise<ConnectionTestResult> {
    const response = await fetch(`${this.baseUrl}/test-connection-by-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ connectionName }),
    });

    // Always try to parse the response JSON first
    let result;
    try {
      result = await response.json();
    } catch (e) {
      // If JSON parsing fails, create a generic error result
      result = {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    // If response is not ok but we got a result, it might contain error details
    if (!response.ok && result.success !== false) {
      throw new Error(`Failed to test connection: ${response.status} ${result.message || result.error || response.statusText}`);
    }

    return result;
  }

  static async updateConnection(name: string, config: DatabaseConnection): Promise<{ success: boolean; message?: string }> {
    // Flatten the connection config for backend compatibility
    const flattenedConfig = this.flattenConnectionConfig(config);
    
    console.log('Updating connection:', name, 'with config:', flattenedConfig);
    
    const response = await fetch(`${this.baseUrl}/update-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, config: flattenedConfig }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update connection: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  static async getTables(): Promise<{ tables: string[] }> {
    const response = await fetch(`${this.baseUrl}/tables`);
    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }
    return response.json();
  }
}