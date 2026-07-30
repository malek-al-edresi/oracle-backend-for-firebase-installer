#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');

const preflightCmd = require('../commands/preflight');
const installCmd = require('../commands/install');
const verifyCmd = require('../commands/verify');
const repairCmd = require('../commands/repair');
const rollbackCmd = require('../commands/rollback');
const statusCmd = require('../commands/status');
const configureCliCmd = require('../commands/configure-cli');

const program = new Command();

program
  .name('obf-installer')
  .description('Automated installer and toolkit for Oracle Backend for Firebase 26.1')
  .version(packageJson.version);

program
  .command('preflight')
  .description('Run prerequisite validation checks')
  .action(preflightCmd);

program
  .command('install')
  .description('Install and configure Oracle Backend for Firebase')
  .action(installCmd);

program
  .command('verify')
  .description('Verify installation state')
  .action(verifyCmd);

program
  .command('repair')
  .description('Attempt to automatically repair installation issues')
  .action(repairCmd);

program
  .command('rollback')
  .description('Completely roll back the installation (Destructive)')
  .action(rollbackCmd);

program
  .command('status')
  .description('Display health check and diagnostics')
  .action(statusCmd);
  
program
  .command('configure-cli')
  .description('Help configure the fusabase CLI')
  .action(configureCliCmd);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
