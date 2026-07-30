-- 03-grant-dbfs-role.sql
-- &1 = Schema Name

BEGIN
    EXECUTE IMMEDIATE 'GRANT DBFS_ROLE TO &1';
    DBMS_OUTPUT.PUT_LINE('Granted DBFS_ROLE to &1.');
END;
/
