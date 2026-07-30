# Configuration Reference

The installer uses a single `.env` file for all configuration.

## Database Connection

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `localhost` | The hostname of your Oracle Database. |
| `DB_PORT` | `1521` | The listener port. |
| `DB_SERVICE` | `FREEPDB1` | The Pluggable Database (PDB) service name. |
| `DB_PROTOCOL` | `tcp` | Connection protocol. |

## Administrative Credentials

| Variable | Default | Description |
| :--- | :--- | :--- |
| `ADMIN_USER` | `SYS` | User with SYSDBA privileges (used for checking versions and granting initial access). |
| `ADMIN_PASSWORD` | | Password for `ADMIN_USER`. |
| `ADMIN_ROLE` | `SYSDBA` | Role for `ADMIN_USER`. |

## DBA User

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DBA_USER` | | User with the DBA role. Must **NOT** be `SYS` or `SYSTEM`. Used to execute `OBAAS_ADMIN.OBAAS_ENABLE_SCHEMA()`. |
| `DBA_PASSWORD` | | Password for `DBA_USER`. |

## Project Schema

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SCHEMA_NAME` | `FUSABASE_USER` | The name of the schema that will own the Firebase project. |
| `SCHEMA_PASSWORD` | | Password for the new schema. |
| `SCHEMA_TABLESPACE` | `FUSABASE_TBS` | The tablespace to create for the schema. |
| `SCHEMA_URL_PATTERN`| `fusabase_user` | The base path pattern exposed in the ORDS URL. |
| `ENABLE_DBFS` | `false` | Set to `true` if your project will use DBFS-backed storage. |

## ORDS Configuration

| Variable | Default | Description |
| :--- | :--- | :--- |
| `ORDS_HOST` | `http://localhost` | The base URL of your ORDS installation. |
| `ORDS_PORT` | `8080` | The port ORDS is listening on. |
| `ORDS_BASE_PATH` | `/ords` | The ORDS base path. |
| `ORDS_CONFIG_DIR` | `/opt/ords-config` | The path to the ORDS configuration directory on the ORDS server. |
