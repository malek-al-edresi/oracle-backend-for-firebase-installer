-- 01-disable-schema.sql
-- &1 = Schema Name
-- &2 = Schema URL Pattern

-- Must be run by DBA
BEGIN
    OBAAS_ADMIN.OBAAS_ENABLE_SCHEMA(
        p_schema => '&1',
        p_url_mapping_type => 'BASE_PATH',
        p_url_mapping_pattern => '&2',
        p_auto_rest_auth => FALSE,
        p_enabled => FALSE
    );
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Schema &1 disabled from Oracle Backend for Firebase.');
END;
/
