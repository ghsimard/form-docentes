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

declare module 'xlsx' {
  export const readFile: (filename: string) => any;
  export const utils: {
    sheet_to_json: <T>(worksheet: any, options?: {
      raw?: boolean;
      dateNF?: string;
      defval?: any;
      header?: string[] | number;
    }) => T[];
  };
  export default {
    readFile,
    utils
  };
} 