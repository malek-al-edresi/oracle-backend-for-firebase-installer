-- 04-enable-schema.sql
-- &1 = Schema Name
-- &2 = Schema URL Pattern

-- NOTE: This must be run by a user with the DBA role, but NOT SYS or SYSTEM.
BEGIN
  OBAAS_ADMIN.OBAAS_ENABLE_SCHEMA(
    p_schema => '&1',
    p_url_mapping_type => 'BASE_PATH',
    p_url_mapping_pattern => '&2',
    p_auto_rest_auth => FALSE
  );
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Schema &1 enabled for Oracle Backend for Firebase.');
END;
/
