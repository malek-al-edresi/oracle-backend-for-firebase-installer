-- 03-enable-extended-strings.sql
-- Note: This requires connecting to the PDB directly and shutting it down.
-- This script must be run by a SYSDBA.
-- It's highly environment specific, so the installer will run these steps carefully.
ALTER PLUGGABLE DATABASE &1 CLOSE;
ALTER PLUGGABLE DATABASE &1 OPEN UPGRADE;
ALTER SESSION SET CONTAINER=&1;
ALTER SYSTEM SET max_string_size = extended;
@?/rdbms/admin/utl32k.sql
ALTER PLUGGABLE DATABASE &1 CLOSE;
ALTER PLUGGABLE DATABASE &1 OPEN;
