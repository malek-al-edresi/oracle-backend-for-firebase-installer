const { config, validateConfig } = require('../lib/config');
const logger = require('../lib/logger');
const db = require('../lib/connection');
const ords = require('../lib/ords');

async function status() {
  validateConfig();
  logger.section('Health Check & Diagnostics');

  const report = {};

  try {
      const sysConn = await db.connectAsSys();
      report.database = 'CONNECTED';
      
      const v = await db.execute(sysConn, `SELECT value FROM v$parameter WHERE name = 'compatible'`);
      report.compatible = v.rows[0].VALUE;
      
      const s = await db.execute(sysConn, `SELECT value FROM v$parameter WHERE name = 'max_string_size'`);
      report.max_string_size = s.rows[0].VALUE;

      const schema = await db.execute(sysConn, `SELECT COUNT(*) AS c FROM dba_users WHERE username = :1`, [config.schema.name]);
      report.schema_exists = schema.rows[0].C > 0;
      
      await sysConn.close();
  } catch(e) {
      report.database = 'FAILED';
  }

  report.ords_reachable = await ords.ping();
  report.console_url = `${config.ords.host}:${config.ords.port}${config.ords.basePath}/_/${config.schema.urlPattern}/_baas-console/`;

  console.log(JSON.stringify(report, null, 2));
}

module.exports = status;
