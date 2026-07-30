-- 01-create-schema.sql
-- &1 = Tablespace Name
-- &2 = Tablespace Size (e.g. 50M)
-- &3 = Schema Name
-- &4 = Schema Password

DECLARE
    v_count NUMBER;
BEGIN
    -- Check if tablespace exists
    SELECT COUNT(*) INTO v_count FROM dba_tablespaces WHERE tablespace_name = '&1';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'CREATE TABLESPACE &1 DATAFILE ''&1._01.dbf'' SIZE &2 AUTOEXTEND ON EXTENT MANAGEMENT LOCAL SEGMENT SPACE MANAGEMENT AUTO';
        DBMS_OUTPUT.PUT_LINE('Tablespace &1 created.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Tablespace &1 already exists.');
    END IF;

    -- Check if user exists
    SELECT COUNT(*) INTO v_count FROM dba_users WHERE username = '&3';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'CREATE USER &3 IDENTIFIED BY "&4" DEFAULT TABLESPACE &1 QUOTA UNLIMITED ON &1';
        DBMS_OUTPUT.PUT_LINE('User &3 created.');
    ELSE
        -- Update password and default tablespace
        EXECUTE IMMEDIATE 'ALTER USER &3 IDENTIFIED BY "&4" DEFAULT TABLESPACE &1 QUOTA UNLIMITED ON &1';
        DBMS_OUTPUT.PUT_LINE('User &3 updated.');
    END IF;
END;
/
