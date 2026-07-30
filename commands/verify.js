const { config, validateConfig } = require('../lib/config');
const logger = require('../lib/logger');
const db = require('../lib/connection');
const ords = require('../lib/ords');
const chalk = require('chalk');

async function verify() {
  validateConfig();
  logger.section('Installation Verification');

  let sysConn;
  let allPassed = true;

  try {
    sysConn = await db.connectAsSys();
    
    // 1. DB Version
    logger.step('Verifying Database Version & Compatibility');
    const result = await db.execute(sysConn, `SELECT value FROM v$parameter WHERE name = 'compatible'`);
    if (result.rows && result.rows.length > 0 && result.rows[0].VALUE >= '23.9.0') {
       logger.pass(`COMPATIBLE = ${result.rows[0].VALUE}`);
    } else {
       logger.fail('Database version/compatibility is incorrect');
       allPassed = false;
    }

    // 2. Strings
    logger.step('Verifying Extended Strings');
    const maxStringResult = await db.execute(sysConn, `SELECT value FROM v$parameter WHERE name = 'max_string_size'`);
    if (maxStringResult.rows[0].VALUE.toUpperCase() === 'EXTENDED') {
       logger.pass('MAX_STRING_SIZE = EXTENDED');
    } else {
       logger.fail('MAX_STRING_SIZE is not EXTENDED');
       allPassed = false;
    }

    // 3. TDE
    logger.step('Verifying TDE Wallet');
    try {
        const tdeResult = await db.execute(sysConn, `SELECT STATUS FROM V$ENCRYPTION_WALLET WHERE ROWNUM = 1`);
        if (tdeResult.rows[0].STATUS.toUpperCase() === 'OPEN') {
           logger.pass('TDE Wallet is OPEN');
        } else {
           logger.fail(`TDE Wallet is ${tdeResult.rows[0].STATUS}`);
           allPassed = false;
        }
    } catch (e) {
        logger.fail('TDE Wallet is not configured');
        allPassed = false;
    }

    // 4. Schema
    logger.step('Verifying Project Schema');
    const schemaResult = await db.execute(sysConn, `SELECT COUNT(*) AS c FROM dba_users WHERE username = :1`, [config.schema.name]);
    if (schemaResult.rows[0].C > 0) {
       logger.pass(`Schema ${config.schema.name} exists`);
    } else {
       logger.fail(`Schema ${config.schema.name} does not exist`);
       allPassed = false;
    }

    // 5. BAAS_ROLE
    logger.step('Verifying Schema Roles');
    const roleResult = await db.execute(sysConn, `SELECT COUNT(*) AS c FROM dba_role_privs WHERE grantee = :1 AND granted_role = 'BAAS_ROLE'`, [config.schema.name]);
    if (roleResult.rows[0].C > 0) {
       logger.pass(`${config.schema.name} has BAAS_ROLE`);
    } else {
       logger.fail(`${config.schema.name} is missing BAAS_ROLE`);
       allPassed = false;
    }

    // 6. ORDS Enablement
    logger.step('Verifying ORDS Schema Enablement');
    const ordsResult = await db.execute(sysConn, `SELECT COUNT(*) AS c FROM user_ords_schemas WHERE parsing_schema = :1 AND status = 'ENABLED'`, [config.schema.name]);
    if (ordsResult.rows[0].C > 0) {
       logger.pass(`Schema is REST-enabled in ORDS`);
    } else {
       logger.fail(`Schema is NOT REST-enabled in ORDS`);
       allPassed = false;
    }

    // 7. Console Reachability
    logger.step('Verifying Console Accessibility');
    const consoleReachable = await ords.checkConsoleReachability();
    if (consoleReachable) {
       logger.pass(`Console is accessible at /_/${config.schema.urlPattern}/_baas-console/`);
    } else {
       logger.warn(`Could not verify console reachability (HTTP check failed). It may still be available.`);
    }

  } catch (err) {
    logger.error(err);
    logger.fail('Verification encountered an unexpected error.');
    allPassed = false;
  } finally {
    if (sysConn) { try { await sysConn.close(); } catch(e) {} }
  }

  logger.section('Verification Summary');
  if (allPassed) {
      logger.pass(chalk.green.bold('All checks passed. Oracle Backend for Firebase is correctly installed and configured.'));
  } else {
      logger.fail(chalk.red.bold('Verification failed. One or more components are not configured correctly.'));
      process.exit(1);
  }
}

module.exports = verify;
