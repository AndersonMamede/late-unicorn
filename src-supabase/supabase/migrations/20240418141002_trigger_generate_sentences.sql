-- Before execution. Clear triggers and functions.
DROP FUNCTION IF EXISTS public.generate_sentences CASCADE;
DROP TRIGGER IF EXISTS trigger_generate_sentences ON project CASCADE;
DROP FUNCTION IF EXISTS public.set_edge_function_url_secret CASCADE;

--- Temporary function for setting URL secret
CREATE OR REPLACE FUNCTION public.set_edge_function_url_secret(
    secret_name text,
    secret_value text
) RETURNS text AS $$
DECLARE
    secret_id uuid;
    existing_secret RECORD;
BEGIN
    SELECT id, name, description INTO existing_secret
    FROM vault.decrypted_secrets
    WHERE name = secret_name;

    IF FOUND THEN
        secret_id := existing_secret.id;
        PERFORM vault.update_secret(
            secret_id,
            secret_value,
            secret_name,
            existing_secret.description
        );
    ELSE
        PERFORM vault.create_secret(
            secret_value,
            secret_name,
            'This is the API URL of the edge function'
        );
    END IF;

    -- Drop set_edge_function_url_secret
    DROP FUNCTION IF EXISTS public.set_edge_function_url_secret(text, text);

    RETURN 'Your secrets have been created and this function will no longer be available.';

END;
$$ LANGUAGE plpgsql;


-- The function makes a request to the edge function to create sentences.
CREATE OR REPLACE FUNCTION public.generate_sentences()
RETURNS TRIGGER AS $$
DECLARE
    api_url varchar;
BEGIN
    -- Check if PROJECT_SPECULATIONS_API_URL exists
    SELECT 
        decrypted_secret INTO api_url
    FROM 
        vault.decrypted_secrets
    WHERE 
        name = 'PROJECT_SPECULATIONS_API_URL';
    
    -- Make request to edge function
    PERFORM net.http_post(
        api_url,
        format('{ "projectId": "%s"}', NEW.project_id)::JSONB
    ) AS request_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER trigger_generate_sentences
AFTER INSERT OR UPDATE OF published ON project
FOR EACH ROW
WHEN (NEW.published = TRUE)
EXECUTE FUNCTION public.generate_sentences();