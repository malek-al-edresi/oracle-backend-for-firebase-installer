-- 05-verify-baas-role.sql
-- &1 = Schema Name
SET SERVEROUTPUT ON
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM dba_role_privs WHERE grantee = '&1' AND granted_role = 'BAAS_ROLE';
    IF v_count > 0 THEN
        DBMS_OUTPUT.PUT_LINE('BAAS_ROLE_GRANTED=TRUE');
    ELSE
        DBMS_OUTPUT.PUT_LINE('BAAS_ROLE_GRANTED=FALSE');
    END IF;
END;
/
