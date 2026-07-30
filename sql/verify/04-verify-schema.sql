-- 04-verify-schema.sql
-- &1 = Schema Name
SET SERVEROUTPUT ON
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM dba_users WHERE username = '&1';
    IF v_count = 1 THEN
        DBMS_OUTPUT.PUT_LINE('SCHEMA_EXISTS=TRUE');
    ELSE
        DBMS_OUTPUT.PUT_LINE('SCHEMA_EXISTS=FALSE');
    END IF;
END;
/
