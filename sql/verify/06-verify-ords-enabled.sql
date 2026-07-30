-- 06-verify-ords-enabled.sql
-- &1 = Schema Name
SET SERVEROUTPUT ON
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_ords_schemas WHERE parsing_schema = '&1' AND status = 'ENABLED';
    IF v_count > 0 THEN
        DBMS_OUTPUT.PUT_LINE('ORDS_ENABLED=TRUE');
    ELSE
        DBMS_OUTPUT.PUT_LINE('ORDS_ENABLED=FALSE');
    END IF;
END;
/
