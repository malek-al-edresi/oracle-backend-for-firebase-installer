const { config, validateConfig } = require('../lib/config');
const logger = require('../lib/logger');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

async function configureCli() {
  validateConfig();
  logger.section('fusabase CLI Configuration Helper');

  const configFile = path.resolve(process.cwd(), 'fusabase.config.js');
  
  if (!fs.existsSync(configFile)) {
      logger.step('Generating fusabase.config.js');
      const content = `module.exports = {
  host: '${config.ords.host}:${config.ords.port}${config.ords.basePath}/${config.schema.urlPattern}/'
}`;
      fs.writeFileSync(configFile, content);
      logger.pass(`Created fusabase.config.js in current directory.`);
  } else {
      logger.info('fusabase.config.js already exists.');
  }

  logger.step('OAuth Client Instructions');
  console.log(`To use the fusabase CLI, you need an OAuth client with the SQL Developer role.`);
  console.log(`\n1. Open Database Actions for the ${config.schema.name} schema.`);
  console.log(`2. Go to REST -> Security -> OAuth Clients.`);
  console.log(`3. Click "Create OAuth Client" and use:`);
  console.log(chalk.cyan(`   - Grant type: CLIENT_CRED`));
  console.log(chalk.cyan(`   - Name: ${config.oauth.clientName}`));
  console.log(chalk.cyan(`   - Description: ${config.oauth.description}`));
  console.log(`4. On the Roles tab, check the box for "SQL Developer".`);
  console.log(`5. Save, and copy the Client ID and Client Secret.`);
  console.log(`\nOnce you have the credentials, sign in by running:`);
  console.log(chalk.bold.green(`\n  npm i -g fusabase-cli`));
  console.log(chalk.bold.green(`  fusabase init\n`));
}

module.exports = configureCli;
