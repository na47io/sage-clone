-- Step 1: Create a new schema for bios
CREATE SCHEMA IF NOT EXISTS bios;
grant usage on schema bios to postgres, service_role;

-- Step 2: Enable the pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 4: Create the bio_sections table in the new schema
CREATE TABLE bios.bio_sections (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    section_type TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(384),
    token_count INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
alter table bios.bio_sections enable row level security;

-- Step 6: Create function for matching similar bio sections
CREATE OR REPLACE FUNCTION bios.match_similar_bio_sections(
    query_embedding VECTOR(384),
    similarity_threshold FLOAT,
    max_results INT
)
RETURNS TABLE (
    user_id UUID,
    section_type TEXT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        bs.user_id,
        bs.section_type,
        bs.content,
        1 - (bs.embedding <=> query_embedding) AS similarity
    FROM
        bios.bio_sections bs
    WHERE
        1 - (bs.embedding <=> query_embedding) > similarity_threshold
    ORDER BY
        bs.embedding <=> query_embedding
    LIMIT max_results;
END;
$$;

-- Step 8: Revoke all privileges from public
ALTER DEFAULT PRIVILEGES IN SCHEMA bios
GRANT ALL ON TABLES TO postgres, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE 
ON ALL TABLES IN SCHEMA bios 
TO postgres, service_role;

GRANT USAGE, SELECT 
ON ALL SEQUENCES IN SCHEMA bios 
TO postgres, service_role;