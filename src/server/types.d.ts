declare module 'pg' {
  export class Pool {
    constructor(config?: {
      user?: string;
      password?: string;
      host?: string;
      port?: number;
      database?: string;
      ssl?: boolean | {
        rejectUnauthorized: boolean;
      };
      connectionString?: string;
    });
    
    query(queryText: string, values?: any[]): Promise<{
      rows: any[];
      rowCount: number;
      command: string;
      oid: number;
      fields: any[];
    }>;

    end(): Promise<void>;
  }
} 