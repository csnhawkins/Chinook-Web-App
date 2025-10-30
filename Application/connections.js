// Dedicated DB connections config
const connections = {
  production_mssql: {
    client: "mssql",
    displayName: "Production (SQL Server)",
    connection: {
      user: "Redgate",
      password: "Redg@te1",
      server: "localhost",
      database: "Chinook_FullRestore",
      options: {
        encrypt: true,
        trustServerCertificate: true,
        instanceName: ""
      }
    }
  },
  treated_mssql: {
    client: "mssql",
    displayName: "Treated (SQL Server)",
    connection: {
      user: "Redgate",
      password: "Redg@te1",
      server: "localhost",
      database: "Chinook_Treated",
      options: {
        encrypt: true,
        trustServerCertificate: true,
        instanceName: ""
      }
    }
  },
  production_pg: {
    client: "pg",
    displayName: "Production (PostgreSQL)",
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'Redg@te1',
      database: 'chinook_fullrestore',
      port: 5432
    }
  },
  treated_pg: {
    client: "pg",
    displayName: "Treated (PostgreSQL)",
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'Redg@te1',
      database: 'chinook_treated',
      port: 5432
    }
  }
  ,
  production_mysql: {
    client: "mysql2",
    displayName: "Production (MySQL)",
    connection: {
      host: "localhost",
      user: "root",
      password: "Redg@te1",
      database: "chinook-fullrestore",
      port: 3306
    }
  },
  treated_mysql: {
    client: "mysql2",
    displayName: "Treated (MySQL)",
    connection: {
      host: "localhost",
      user: "root",
      password: "Redg@te1",
      database: "chinook-treated",
      port: 3306
    }
  },
  production_oracle: {
    client: "oracledb",
    displayName: "Production (Oracle)",
    connection: {
      user: "chinook",
      password: "chinook",
      connectString: "localhost/PDBPROD",
    }
  },
  treated_oracle: {
    client: "oracledb",
    displayName: "Treated (Oracle)",
    connection: {
      user: "chinook",
      password: "chinook",
      connectString: "localhost/DEV1",
    }
  },
  // Add more environments as needed
};
export const defaultConnection = "production_mssql";
export default connections;
