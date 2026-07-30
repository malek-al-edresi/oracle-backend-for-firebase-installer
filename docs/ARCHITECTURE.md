# Technical Architecture

This repository uses a modular Node.js architecture to orchestrate Oracle Database scripts.

## Core Components

- **bin/obf-installer.js**: The CLI entry point. Uses Commander.js for routing.
- **lib/config.js**: Loads and validates environment variables from `.env`.
- **lib/connection.js**: Manages Oracle database connections using the official `oracledb` node module in Thin mode. Parses and executes external `.sql` files.
- **lib/logger.js**: Provides colored, structured console output.
- **sql/**: Contains all the raw SQL scripts executed by the installer. Divided into `database/`, `schema/`, `verify/`, and `rollback/`.
- **commands/**: Contains the business logic for each CLI command (`install.js`, `preflight.js`, etc.).

## SQL Execution Strategy

Instead of embedding PL/SQL blocks inside JavaScript, this installer reads standard `.sql` files from disk, performs variable substitution (e.g., replacing `&1` with the schema name), splits the file into distinct statements, and executes them over the JDBC thin connection. This ensures the SQL files can also be run manually in SQLcl or SQL*Plus if needed.
