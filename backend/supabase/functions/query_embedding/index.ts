// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
  db: {
    schema: "bios",
  },
});

const session = new Supabase.ai.Session("gte-small");

Deno.serve(async (req) => {
  try {
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
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/query_embedding' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
