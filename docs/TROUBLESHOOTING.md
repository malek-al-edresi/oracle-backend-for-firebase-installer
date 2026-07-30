# Troubleshooting

If the installer encounters issues, try running `npm run status` to see a dashboard of the current environment health.

## Common Issues

### 1. Database compatibility warnings
If `COMPATIBLE` is lower than `23.9.0`, you must update it manually in `CDB$ROOT` and restart the database:
```sql
ALTER SYSTEM SET COMPATIBLE='23.9.0' SCOPE=SPFILE;
```
Restart the database.

### 2. MAX_STRING_SIZE is still STANDARD
The installer attempts to fix this, but if it fails, you may need to run the upgrade script manually on the database server as the `oracle` OS user:
```sql
ALTER PLUGGABLE DATABASE <YOUR-PDB> CLOSE;
ALTER PLUGGABLE DATABASE <YOUR-PDB> OPEN UPGRADE;
ALTER SESSION SET CONTAINER=<YOUR-PDB>;
ALTER SYSTEM SET max_string_size = extended;
@?/rdbms/admin/utl32k.sql
ALTER PLUGGABLE DATABASE <YOUR-PDB> CLOSE;
ALTER PLUGGABLE DATABASE <YOUR-PDB> OPEN;
```

### 3. Wallet or TDE errors
Verify `wallet_root` and `tde_configuration` in your database. Reopen the keystore, and confirm `V$ENCRYPTION_WALLET` shows `OPEN`. The installer can only attempt to configure the keystore if `wallet_root` is already set.

### 4. ORDS does not expose Oracle Backend for Firebase
Rerun `ords --config /opt/ords-config fusabase install` on your ORDS server and confirm that `[1] Enable Feature fusabase` is set to `Yes`.

### 5. ORA-06598 during OBAAS_ADMIN.OBAAS_ENABLE_SCHEMA
If schema enablement fails with an "insufficient INHERIT PRIVILEGES" error, it means you ran the installer with `DBA_USER=SYS`. **Do not invoke this procedure as SYS or SYSTEM.** Create a dedicated DBA user or use an existing non-SYS DBA user.

### 6. CLI authentication fails
Verify that you copied the correct OAuth Client ID and Client secret from Database Actions, and confirm that the OAuth client has the **SQL Developer role** assigned.
