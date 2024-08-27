# sage-clone

This app helps you find co-workers using vector-search. After you found each other you can chat!

Powered by:

- React
- FastAPI
- Postgres
- InstantDb

Deployed to [fly.io](https://fly.io)

## how-to

Here I note down how to do some stuff

### set up a supabase embedding pipeline

Supabase have great support for embeddings and a lot of case-studies to learn from. Let's set it up for sage-clone.

We want to:

1. embed bio _sections_. not whole profile because we want to piggyback off the semantics offered by splitting a bio into sections
2. query against bio sections

#### set up supabase project

Let's set up supabase.

```bash
supabase init
supabase start # start the local workspace (might take a minute)
supabase link --project-ref $YOUR_PROJECT_REF
supabase functions new embed && supabase functions new query
```

Check the emebedings work by replacing the `embed/index.ts` with

```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const session = new Supabase.ai.Session("gte-small");

Deno.serve(async (req) => {
  // Extract input string from JSON body
  const { input } = await req.json();

  // Generate the embedding from the user input
  const embedding = await session.run(input, {
    mean_pool: true,
    normalize: true,
  });

  // Return the embedding
  return new Response(
    JSON.stringify({ embedding }),
    { headers: { "Content-Type": "application/json" } },
  );
});
```

Run `supabase functions serve` and curl the endpoint!

#### configure supabase postgres to store embeddings

Create the initial migration with

```bash
supabase migrations new init
```

Let's break down the migration. Read the comments for the explanation of each step.

```sql
-- Step 1: Enable the pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create the main bios table
-- This table stores the core bio information and links to the user
CREATE TABLE public.bios (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create the bio_sections table
-- This table stores individual sections of a bio, allowing for structured content
CREATE TABLE public.bio_sections (
    id BIGSERIAL PRIMARY KEY,
    bio_id BIGINT NOT NULL REFERENCES public.bios(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),  -- Stores the vector embedding of the content
    token_count INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create indexes for performance optimization
-- Index on user_id for quick lookups
CREATE INDEX idx_bios_user_id ON public.bios(user_id);
-- Index on bio_id for fast joins
CREATE INDEX idx_bio_sections_bio_id ON public.bio_sections(bio_id);
-- Index on embedding for efficient similarity searches
CREATE INDEX idx_bio_sections_embedding ON public.bio_sections USING ivfflat (embedding vector_cosine_ops);

-- Step 5: Create function for matching similar bio sections
-- This function uses vector similarity to find matching bio sections
CREATE OR REPLACE FUNCTION public.match_similar_bio_sections(
    query_embedding VECTOR(1536),
    similarity_threshold FLOAT,
    max_results INT
)
RETURNS TABLE (
    bio_id BIGINT,
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
        b.id AS bio_id,
        b.user_id,
        bs.section_type,
        bs.content,
        1 - (bs.embedding <=> query_embedding) AS similarity
    FROM
        public.bio_sections bs
    JOIN
        public.bios b ON b.id = bs.bio_id
    WHERE
        1 - (bs.embedding <=> query_embedding) > similarity_threshold
    ORDER BY
        bs.embedding <=> query_embedding
    LIMIT max_results;
END;
$$;

-- Step 6: Create function to upsert a bio section
-- This function handles both inserting new and updating existing bio sections
CREATE OR REPLACE FUNCTION public.upsert_bio_section(
    p_user_id UUID,
    p_section_type TEXT,
    p_content TEXT,
    p_embedding VECTOR(1536)
)
RETURNS TABLE (
    bio_id BIGINT,
    section_id BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_bio_id BIGINT;
    v_section_id BIGINT;
BEGIN
    -- Insert or get the bio id
    INSERT INTO public.bios (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_bio_id;

    -- Upsert the bio section
    INSERT INTO public.bio_sections (bio_id, section_type, content, embedding, token_count)
    VALUES (v_bio_id, p_section_type, p_content, p_embedding, array_length(p_embedding, 1))
    ON CONFLICT (bio_id, section_type) DO UPDATE
    SET content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        token_count = EXCLUDED.token_count,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_section_id;

    RETURN QUERY SELECT v_bio_id, v_section_id;
END;
$$;

-- Step 7: Grant necessary privileges
-- These grants ensure that the postgres and service_role users can interact with the tables and functions
GRANT ALL ON TABLE public.bios TO postgres, service_role;
GRANT ALL ON TABLE public.bio_sections TO postgres, service_role;
GRANT ALL ON SEQUENCE public.bios_id_seq TO postgres, service_role;
GRANT ALL ON SEQUENCE public.bio_sections_id_seq TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.match_similar_bio_sections TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.upsert_bio_section TO postgres, service_role;
```

Bravely push the migration straight to prod!

__NB__: Don't forget to make the `bios` schema visible in API in Supabase project settings in the __browser__.

#### setting up the functions

The functions are quite simple. The shell is identical:

```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// set up supabase, Supabase runtime sets the Env vars.
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
  db: {
    schema: "bios", // point at schema we're working with
  },
});

// Supabase comes bundled with an embedding model already.
const session = new Supabase.ai.Session("gte-small");

Deno.serve(async (req) => {
  try {
    // YOUR FUNCTION GOOES HERE
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});
```

The function body of `functions/add_embedding/index.ts` and `functions/query_embedding/index.ts` are again very simple.

First, embed the bio section and upset.

```ts
    const { userId, sectionType, content } = await req.json();

    // Generate the embedding from the user input
    const embedding = await session.run(content, {
      mean_pool: true,
      normalize: true,
    });

    // uspert the content into the bios_sections table
    const { data, error } = await supabase
      .from("bio_sections")
      .upsert(
        {
          user_id: userId,
          section_type: sectionType,
          content,
          embedding,
        },
        {
          onConflict: ["user_id"],
        },
      );

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

```

Query the sections:

```ts
    const { query } = await req.json();

    if (!query) {
      throw new Error("Missing query parameter");
    }

    // Generate the embedding from the user input
    const embedding = await session.run(query, {
      mean_pool: true,
      normalize: true,
    });

    const { data: bioSections } = await supabase.rpc(
      "match_similar_bio_sections",
      {
        query_embedding: embedding, // Pass the embedding you want to compare
        similarity_threshold: 0.3, // Choose an appropriate threshold for your data
        max_results: 10, // Choose the number of matches
      },
    );

    return new Response(JSON.stringify(bioSections), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
```

After running `supabase functions deploy` our embedding service is live. We can access it over HTTP with a Supabase API Key.
