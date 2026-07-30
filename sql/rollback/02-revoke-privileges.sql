-- 02-revoke-privileges.sql
-- &1 = Schema Name

BEGIN
    -- Revoke session and resource
    BEGIN
        EXECUTE IMMEDIATE 'REVOKE CREATE SESSION FROM &1';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        EXECUTE IMMEDIATE 'REVOKE RESOURCE FROM &1';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Revoke DBFS role if granted
    BEGIN
        EXECUTE IMMEDIATE 'REVOKE DBFS_ROLE FROM &1';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    DBMS_OUTPUT.PUT_LINE('Revoked privileges from &1.');
END;
/
