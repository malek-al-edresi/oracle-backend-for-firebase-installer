const { config, validateConfig } = require('../lib/config');
const logger = require('../lib/logger');
const db = require('../lib/connection');
const ords = require('../lib/ords');
const { commandExists, versionGreaterThanOrEqual } = require('../lib/utils');

async function runPreflight() {
  validateConfig();
  logger.section('Preflight Checks');

  let allPassed = true;

  // 1. Check Node.js Version
  logger.step('Checking Node.js environment');
  const nodeVersion = process.version.replace('v', '');
  if (versionGreaterThanOrEqual(nodeVersion, '18.0.0')) {
    logger.pass(`Node.js version ${nodeVersion} is compatible (>= 18.0.0)`);
  } else {
    logger.fail(`Node.js version ${nodeVersion} is unsupported. Please upgrade to 18.0.0 or higher.`);
    allPassed = false;
  }

  // 2. Check npm
  if (await commandExists('npm')) {
    logger.pass('npm is installed');
  } else {
    logger.warn('npm is not installed. Some CLI configuration steps may require it.');
  }

  // 3. Database Connectivity (SYS)
  logger.step('Testing Database Connectivity (SYS)');
  let sysConn;
  try {
    sysConn = await db.connectAsSys();
    logger.pass('Successfully connected to database as SYS');
    
    // 4 & 5. Check DB Version & COMPATIBLE
    const result = await db.execute(sysConn, `SELECT value FROM v$parameter WHERE name = 'compatible'`);
    if (result.rows && result.rows.length > 0) {
        const compatible = result.rows[0].VALUE;
        if (versionGreaterThanOrEqual(compatible, '23.9.0')) {
            logger.pass(`Database COMPATIBLE parameter is ${compatible} (>= 23.9.0)`);
        } else {
            logger.fail(`Database COMPATIBLE parameter is ${compatible}. Must be >= 23.9.0.`);
            allPassed = false;
        }
    } else {
        logger.fail('Could not read COMPATIBLE parameter');
        allPassed = false;
    }

    // 6. Check MAX_STRING_SIZE
    const maxStringResult = await db.execute(sysConn, `SELECT value FROM v$parameter WHERE name = 'max_string_size'`);
    if (maxStringResult.rows && maxStringResult.rows.length > 0) {
        const maxString = maxStringResult.rows[0].VALUE;
        if (maxString.toUpperCase() === 'EXTENDED') {
            logger.pass('Database MAX_STRING_SIZE is EXTENDED');
        } else {
            logger.warn('Database MAX_STRING_SIZE is STANDARD. The installer can attempt to upgrade it.');
        }
    }

    // 7. Check TDE Wallet
    try {
        const tdeResult = await db.execute(sysConn, `SELECT STATUS FROM V$ENCRYPTION_WALLET WHERE ROWNUM = 1`);
        if (tdeResult.rows && tdeResult.rows.length > 0) {
            const tdeStatus = tdeResult.rows[0].STATUS;
            if (tdeStatus.toUpperCase() === 'OPEN') {
                logger.pass('TDE Wallet is OPEN');
            } else {
                logger.warn(`TDE Wallet is ${tdeStatus}. Manual configuration may be required.`);
            }
        } else {
             logger.warn('Could not read TDE Wallet status. It may not be configured.');
        }
    } catch (e) {
         logger.warn('Failed to query TDE wallet status.');
    }

  } catch (err) {
    logger.fail(`Failed to connect to database as SYS: ${err.message}`);
    allPassed = false;
  } finally {
    if (sysConn) {
      try { await sysConn.close(); } catch (e) { console.error(e); }
    }
  }
  
  // 8. DBA Connectivity
  logger.step('Testing Database Connectivity (DBA)');
  let dbaConn;
  try {
      dbaConn = await db.connectAsDba();
      logger.pass(`Successfully connected to database as DBA user (${config.dba.user})`);
  } catch(err) {
      logger.fail(`Failed to connect to database as DBA (${config.dba.user}): ${err.message}`);
      allPassed = false;
  } finally {
      if (dbaConn) {
         try { await dbaConn.close(); } catch (e) { console.error(e); }
      }
  }

  // 9. ORDS Reachability
  logger.step('Testing ORDS Reachability');
  const ordsReachable = await ords.ping();
  if (ordsReachable) {
    logger.pass(`ORDS is reachable at ${config.ords.host}:${config.ords.port}${config.ords.basePath}`);
  } else {
    logger.fail(`ORDS is not reachable at ${config.ords.host}:${config.ords.port}${config.ords.basePath}`);
    allPassed = false;
  }

  logger.section('Preflight Summary');
  if (allPassed) {
    logger.pass('All preflight checks passed. You are ready to install.');
    return true;
  } else {
    logger.fail('Some preflight checks failed. Please resolve the issues above before installing.');
    process.exitCode = 1;
    return false;
  }
}

module.exports = runPreflight;
