# Rollback Procedures

If you need to uninstall Oracle Backend for Firebase from a schema, you can run the automated rollback command:

```bash
npm run rollback
```

> **WARNING:** This is a destructive operation. It will drop the project schema (and all tables/data within it) using `CASCADE`.

## What the rollback script does:

1. Connects as the DBA user.
2. Runs `OBAAS_ADMIN.OBAAS_ENABLE_SCHEMA(..., p_enabled => FALSE)` to disable the schema in Oracle Backend for Firebase.
3. Revokes `CREATE SESSION`, `RESOURCE`, and `DBFS_ROLE` from the schema.
4. Connects as SYS and drops the schema using `DROP USER <schema> CASCADE`.

*Note: The rollback script does not drop the tablespace or revert TDE/Extended Strings settings, as those are database-wide configurations that may be used by other schemas.*
