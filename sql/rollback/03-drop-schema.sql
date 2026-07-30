-- 03-drop-schema.sql
-- &1 = Schema Name

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM dba_users WHERE username = '&1';
    IF v_count = 1 THEN
        -- Drop the user and all objects
        EXECUTE IMMEDIATE 'DROP USER &1 CASCADE';
        DBMS_OUTPUT.PUT_LINE('User &1 dropped.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('User &1 does not exist.');
    END IF;
END;
/
