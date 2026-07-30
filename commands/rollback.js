const { config, validateConfig } = require('../lib/config');
const logger = require('../lib/logger');
const db = require('../lib/connection');
const chalk = require('chalk');
const readline = require('readline');

async function rollback() {
  validateConfig();
  logger.section('Installation Rollback');

  logger.warn(chalk.red.bold('WARNING: This will DROP the project schema and all its data!'));
  logger.warn(`Target Schema: ${config.schema.name}`);
  
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });

  const answer = await new Promise(resolve => {
      rl.question(chalk.yellow('\nAre you sure you want to proceed? Type "YES" to confirm: '), resolve);
  });
  rl.close();

  if (answer !== 'YES') {
      logger.info('Rollback aborted by user.');
      return;
  }

  let sysConn, dbaConn;
  try {
    sysConn = await db.connectAsSys();
    dbaConn = await db.connectAsDba();
    
    // 1. Disable OBAAS Schema
    logger.step('Disabling OBAAS Schema');
    try {
        await db.executeScript(dbaConn, 'sql/rollback/01-disable-schema.sql', {
            '1': config.schema.name,
            '2': config.schema.urlPattern
        });
        logger.pass('Schema OBAAS registration disabled.');
    } catch(e) {
        logger.warn(`Failed to disable OBAAS schema (it may already be disabled).`);
    }

    // 2. Revoke Privileges
    logger.step('Revoking Privileges');
    try {
        await db.executeScript(sysConn, 'sql/rollback/02-revoke-privileges.sql', {
            '1': config.schema.name
        });
        logger.pass('Privileges revoked.');
    } catch(e) {
        logger.warn('Could not revoke all privileges.');
    }

    // 3. Drop Schema
    logger.step('Dropping Schema');
    try {
        await db.executeScript(sysConn, 'sql/rollback/03-drop-schema.sql', {
            '1': config.schema.name
        });
        logger.pass(`Schema ${config.schema.name} dropped CASCADE.`);
    } catch(e) {
        logger.fail(`Failed to drop schema: ${e.message}`);
        throw e;
    }

    logger.section('Rollback Complete');
    logger.pass('The Oracle Backend for Firebase project schema has been completely removed.');

  } catch (err) {
    logger.error(err);
    logger.fail('Rollback encountered errors.');
    process.exitCode = 1;
  } finally {
    if (sysConn) { try { await sysConn.close(); } catch(e) {} }
    if (dbaConn) { try { await dbaConn.close(); } catch(e) {} }
  }
}

module.exports = rollback;
