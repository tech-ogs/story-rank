DROP FUNCTION IF EXISTS xlog(text[]);
CREATE FUNCTION xlog(VARIADIC params text[]) RETURNS void AS
$$
DECLARE
    stmt RECORD;
    str VARCHAR := '';
BEGIN
    FOR stmt IN SELECT unnest(params::VARCHAR[]) as text LOOP
        str := str || ' ' || stmt.text;
    END LOOP;
    RAISE LOG '%', str;
END;
$$ LANGUAGE plpgsql;

