const oracledb = require('oracledb');
const fs = require('fs').promises;
const path = require('path');
const { config } = require('./config');
const logger = require('./logger');
const { substituteVariables } = require('./utils');

// Initialize Oracle DB Thin mode (no client required)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];

class ConnectionManager {
  
  // Creates connection string
  _getConnectionString() {
    return `${config.db.host}:${config.db.port}/${config.db.service}`;
  }

  // Connect as SYSDBA
  async connectAsSys() {
    return await oracledb.getConnection({
      user: config.admin.user,
      password: config.admin.password,
      connectString: this._getConnectionString(),
      privilege: config.admin.role === 'SYSDBA' ? oracledb.SYSDBA : undefined
    });
  }

  // Connect as DBA
  async connectAsDba() {
    return await oracledb.getConnection({
      user: config.dba.user,
      password: config.dba.password,
      connectString: this._getConnectionString(),
      privilege: config.dba.role === 'SYSDBA' ? oracledb.SYSDBA : undefined
    });
  }

  // Connect as Project Schema
  async connectAsSchema() {
    return await oracledb.getConnection({
      user: config.schema.name,
      password: config.schema.password,
      connectString: this._getConnectionString()
    });
  }

  // Execute a query
  async execute(conn, sql, binds = []) {
    return await conn.execute(sql, binds);
  }
  
  // Split script into individual statements
  _splitSqlScript(sql) {
      // Very basic split by / or ; - a real parser would be better, 
      // but for simple installer scripts this often suffices if formatted carefully.
      // We will assume our SQL scripts are designed to be executed line-by-line or 
      // block-by-block. For PL/SQL blocks ending in / we need special handling.
      
      const statements = [];
      let currentStatement = [];
      let inPlSql = false;
      
      const lines = sql.split('\n');
      for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trimRight();
          const trimmedLine = line.trim();
          
          if (trimmedLine.startsWith('--') || trimmedLine === '') {
              continue; // Skip comments and empty lines
          }
          
          if (trimmedLine.toUpperCase().startsWith('DECLARE') || 
              trimmedLine.toUpperCase().startsWith('BEGIN') ||
              trimmedLine.toUpperCase().startsWith('CREATE OR REPLACE PACKAGE') ||
              trimmedLine.toUpperCase().startsWith('CREATE OR REPLACE PROCEDURE') ||
              trimmedLine.toUpperCase().startsWith('CREATE OR REPLACE FUNCTION')) {
              inPlSql = true;
          }
          
          if (inPlSql) {
              if (trimmedLine === '/') {
                  statements.push(currentStatement.join('\n'));
                  currentStatement = [];
                  inPlSql = false;
              } else {
                  currentStatement.push(line);
              }
          } else {
              // Standard SQL statement
              if (trimmedLine.endsWith(';')) {
                  // Remove trailing semicolon for oracledb
                  currentStatement.push(line.substring(0, line.length - 1));
                  statements.push(currentStatement.join('\n'));
                  currentStatement = [];
              } else if (trimmedLine === '/') {
                 // ignore isolated slashes in standard sql context
              } else {
                  currentStatement.push(line);
              }
          }
      }
      
      if (currentStatement.length > 0 && currentStatement.join('\n').trim() !== '') {
          statements.push(currentStatement.join('\n'));
      }
      
      return statements;
  }

  // Execute a complete SQL file script
  async executeScript(conn, filePath, variables = {}) {
    try {
      const absolutePath = path.resolve(process.cwd(), filePath);
      let sqlContent = await fs.readFile(absolutePath, 'utf8');
      
      // Substitute &1, &2, etc.
      sqlContent = substituteVariables(sqlContent, variables);
      
      const statements = this._splitSqlScript(sqlContent);
      
      for (const statement of statements) {
          try {
             await conn.execute(statement);
          } catch(err) {
              // If error is "table or view does not exist" during DROP, ignore it
              if (statement.toUpperCase().startsWith('DROP') && err.message.includes('ORA-00942')) {
                  continue;
              }
              // If error is "user does not exist" during DROP
              if (statement.toUpperCase().startsWith('DROP USER') && err.message.includes('ORA-01918')) {
                  continue;
              }
              
              logger.fail(`Failed to execute statement:\n${statement.substring(0, 100)}...`);
              throw err;
          }
      }
      return true;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

}

module.exports = new ConnectionManager();
