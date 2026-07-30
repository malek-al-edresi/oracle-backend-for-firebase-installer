const { config, validateConfig } = require('../lib/config');
const logger = require('../lib/logger');
const db = require('../lib/connection');
const install = require('./install');
const chalk = require('chalk');

async function repair() {
  validateConfig();
  logger.section('Installation Repair');

  logger.info('Repairing Oracle Backend for Firebase installation...');
  logger.info('This will re-run the installation steps, skipping what is already configured.');
  
  // The install command is built to be idempotent (it checks before creating).
  // Thus, running install again acts as a repair tool.
  try {
      await install();
      logger.pass(chalk.green('Repair process completed.'));
  } catch(e) {
      logger.fail('Repair process failed.');
      process.exit(1);
  }
}

module.exports = repair;
