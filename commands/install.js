const { config, validateConfig } = require('../lib/config');
const logger = require('../lib/logger');
const db = require('../lib/connection');
const runPreflight = require('./preflight');
const chalk = require('chalk');

async function install() {
  validateConfig();
  
  logger.startSpinner('Running preflight checks...');
  const passed = await runPreflight();
  if (!passed) {
      logger.fail('Cannot proceed with installation due to preflight failures.');
      process.exit(1);
  }
  
  logger.section('Installation Started');

  let sysConn, dbaConn;
  try {
    sysConn = await db.connectAsSys();
    dbaConn = await db.connectAsDba();
    
    // 1. Prepare Database (Extended Strings)
    logger.step('Checking Database String Size');
    const maxStringResult = await db.execute(sysConn, `SELECT value FROM v$parameter WHERE name = 'max_string_size'`);
    if (maxStringResult.rows[0].VALUE.toUpperCase() !== 'EXTENDED') {
        logger.warn('Database MAX_STRING_SIZE is STANDARD. Attempting to upgrade to EXTENDED (requires PDB restart).');
        try {
            await db.executeScript(sysConn, 'sql/database/03-enable-extended-strings.sql', {
                '1': config.db.service
            });
            logger.pass('Successfully upgraded MAX_STRING_SIZE to EXTENDED.');
        } catch (e) {
            logger.fail(`Failed to upgrade string size. This usually requires running locally as oracle OS user: ${e.message}`);
            logger.info(`Run this manually on the DB server as SYSDBA:\nALTER PLUGGABLE DATABASE ${config.db.service} CLOSE;\nALTER PLUGGABLE DATABASE ${config.db.service} OPEN UPGRADE;\nALTER SESSION SET CONTAINER=${config.db.service};\nALTER SYSTEM SET max_string_size = extended;\n@?/rdbms/admin/utl32k.sql\nALTER PLUGGABLE DATABASE ${config.db.service} CLOSE;\nALTER PLUGGABLE DATABASE ${config.db.service} OPEN;`);
            throw e;
        }
    } else {
        logger.pass('Database MAX_STRING_SIZE is already EXTENDED.');
    }
    
    // 2. TDE configuration checks
    logger.step('Checking TDE Configuration');
    let tdeConfigured = false;
    try {
        const tdeResult = await db.execute(sysConn, `SELECT STATUS FROM V$ENCRYPTION_WALLET WHERE ROWNUM = 1`);
        if (tdeResult.rows && tdeResult.rows.length > 0 && tdeResult.rows[0].STATUS.toUpperCase() === 'OPEN') {
            tdeConfigured = true;
            logger.pass('TDE Wallet is already OPEN.');
        }
    } catch(e) {}
    
    if (!tdeConfigured) {
        if (config.tde.keystorePassword) {
            logger.warn('TDE Wallet is not OPEN. Attempting basic configuration...');
            try {
               await db.executeScript(sysConn, 'sql/database/05-configure-tde.sql', {
                   '1': config.tde.keystorePassword
               });
               logger.pass('TDE configured successfully.');
            } catch (e) {
               logger.fail(`Failed to configure TDE programmatically: ${e.message}`);
               logger.info(`You may need to set wallet_root in the DB profile and restart before creating the keystore.`);
            }
        } else {
            logger.warn('TDE is not fully OPEN. Provide TDE_KEYSTORE_PASSWORD in .env to attempt auto-config, or fix manually.');
        }
    }
    
    // 3. ORDS Fusabase Install (Interactive Guidance)
    logger.step('ORDS Fusabase Configuration');
    logger.info(chalk.yellow(`IMPORTANT: ORDS configuration is interactive and must be run on the ORDS server.`));
    logger.info(`Please log into your ORDS server and run the following command (using ORDS 26.1+):`);
    logger.info(chalk.bold(`\n  ords --config ${config.ords.configDir} fusabase install\n`));
    logger.info(`When prompted, use the following values:`);
    logger.info(`- Host: ${config.db.host}`);
    logger.info(`- Port: ${config.db.port}`);
    logger.info(`- Service Name: ${config.db.service}`);
    logger.info(`- Enable Feature fusabase: Yes`);
    logger.info(`- Admin User: ${config.admin.user}`);
    logger.info(`\nAfter you have completed the command and ORDS reports success, press ENTER to continue...`);
    
    // Wait for user confirmation
    await new Promise(resolve => {
        process.stdin.once('data', () => {
            resolve();
        });
    });

    // 4. Schema Creation
    logger.step(`Creating Project Schema: ${config.schema.name}`);
    await db.executeScript(sysConn, 'sql/schema/01-create-schema.sql', {
        '1': config.schema.tablespace,
        '2': config.schema.tablespaceSize,
        '3': config.schema.name,
        '4': config.schema.password
    });
    logger.pass(`Schema ${config.schema.name} created/updated.`);
    
    // 5. Grant Privileges
    logger.step(`Granting Privileges to ${config.schema.name}`);
    await db.executeScript(sysConn, 'sql/schema/02-grant-privileges.sql', {
        '1': config.schema.name
    });
    if (config.schema.enableDbfs) {
        await db.executeScript(sysConn, 'sql/schema/03-grant-dbfs-role.sql', {
            '1': config.schema.name
        });
    }
    logger.pass('Privileges granted.');
    
    // 6. Enable Schema via OBAAS_ADMIN
    logger.step(`Enabling Schema for Oracle Backend for Firebase`);
    try {
        await db.executeScript(dbaConn, 'sql/schema/04-enable-schema.sql', {
            '1': config.schema.name,
            '2': config.schema.urlPattern
        });
        logger.pass(`Schema enabled via OBAAS_ADMIN.`);
    } catch (e) {
        logger.fail(`Failed to enable schema: ${e.message}`);
        logger.info(`Ensure ${config.dba.user} has the DBA role and is NOT SYS/SYSTEM.`);
        throw e;
    }
    
    logger.section('Installation Complete!');
    logger.info(`You can now access the Console at:`);
    logger.info(chalk.bold(`${config.ords.host}:${config.ords.port}${config.ords.basePath}/_/${config.schema.urlPattern}/_baas-console/`));
    logger.info(`\nTo verify the installation, run:`);
    logger.info(chalk.bold(`  npm run verify`));
    logger.info(`\nTo configure your CLI, run:`);
    logger.info(chalk.bold(`  npm run status`));

  } catch (err) {
    logger.error(err);
    logger.fail('Installation failed.');
  } finally {
    if (sysConn) { try { await sysConn.close(); } catch (e) {} }
    if (dbaConn) { try { await dbaConn.close(); } catch (e) {} }
  }
}

module.exports = install;
