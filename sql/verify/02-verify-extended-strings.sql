-- 02-verify-extended-strings.sql
SET SERVEROUTPUT ON
DECLARE
    v_max_string_size VARCHAR2(255);
BEGIN
    SELECT value INTO v_max_string_size FROM v$parameter WHERE name = 'max_string_size';
    DBMS_OUTPUT.PUT_LINE('MAX_STRING_SIZE=' || v_max_string_size);
END;
/
