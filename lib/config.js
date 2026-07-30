const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error(chalk.red('\n[Error] .env file not found.'));
  console.log(chalk.yellow('Please copy .env.example to .env and configure your environment.\n'));
  process.exit(1);
}

dotenv.config({ path: envPath });

const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1521', 10),
    service: process.env.DB_SERVICE || 'FREEPDB1',
    protocol: process.env.DB_PROTOCOL || 'tcp'
  },
  admin: {
    user: process.env.ADMIN_USER || 'SYS',
    password: process.env.ADMIN_PASSWORD,
    role: process.env.ADMIN_ROLE || 'SYSDBA'
  },
  dba: {
    user: process.env.DBA_USER,
    password: process.env.DBA_PASSWORD
  },
  schema: {
    name: (process.env.SCHEMA_NAME || 'FUSABASE_USER').toUpperCase(),
    password: process.env.SCHEMA_PASSWORD,
    tablespace: (process.env.SCHEMA_TABLESPACE || 'FUSABASE_TBS').toUpperCase(),
    tablespaceSize: process.env.SCHEMA_TABLESPACE_SIZE || '50M',
    urlPattern: (process.env.SCHEMA_URL_PATTERN || 'fusabase_user').toLowerCase(),
    enableDbfs: process.env.ENABLE_DBFS === 'true'
  },
  ords: {
    host: process.env.ORDS_HOST || 'http://localhost',
    port: parseInt(process.env.ORDS_PORT || '8080', 10),
    basePath: process.env.ORDS_BASE_PATH || '/ords',
    configDir: process.env.ORDS_CONFIG_DIR || '/opt/ords-config'
  },
  tde: {
    walletDir: process.env.TDE_WALLET_DIR,
    keystorePassword: process.env.TDE_KEYSTORE_PASSWORD
  },
  oauth: {
    clientName: process.env.OAUTH_CLIENT_NAME || 'fusabase-cli',
    description: process.env.OAUTH_CLIENT_DESCRIPTION || 'OAuth client for the fusabase CLI',
    supportEmail: process.env.OAUTH_SUPPORT_EMAIL
  }
};

function validateConfig() {
  const missing = [];
  if (!config.admin.password) missing.push('ADMIN_PASSWORD');
  if (!config.schema.password) missing.push('SCHEMA_PASSWORD');
  if (!config.dba.user) missing.push('DBA_USER');
  if (!config.dba.password) missing.push('DBA_PASSWORD');

  if (missing.length > 0) {
    console.error(chalk.red(`\n[Error] Missing required environment variables:`));
    missing.forEach(v => console.error(chalk.red(`  - ${v}`)));
    console.log(chalk.yellow('\nPlease update your .env file.\n'));
    process.exit(1);
  }

  // Validate DBA is not SYS/SYSTEM
  const dbaUpper = config.dba.user.toUpperCase();
  if (dbaUpper === 'SYS' || dbaUpper === 'SYSTEM') {
    console.error(chalk.red(`\n[Error] DBA_USER must NOT be SYS or SYSTEM.`));
    console.log(chalk.yellow('The OBAAS_ENABLE_SCHEMA procedure requires a non-SYS DBA user.'));
    console.log(chalk.yellow('Please update DBA_USER in your .env file.\n'));
    process.exit(1);
  }
}

module.exports = {
  config,
  validateConfig
};
