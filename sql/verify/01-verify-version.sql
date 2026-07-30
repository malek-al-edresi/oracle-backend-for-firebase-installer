-- 01-verify-version.sql
SET SERVEROUTPUT ON
DECLARE
    v_compatible VARCHAR2(255);
BEGIN
    SELECT value INTO v_compatible FROM v$parameter WHERE name = 'compatible';
    DBMS_OUTPUT.PUT_LINE('COMPATIBLE=' || v_compatible);
END;
/
