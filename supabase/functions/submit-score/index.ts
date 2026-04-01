import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const MAX_SCORE = 100000;
const MAX_LEVEL = 10;
const MAX_NAME_LENGTH = 30;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { player_name, score, level_reached } = body;

    // Validate player_name
    if (
      typeof player_name !== "string" ||
      player_name.trim().length === 0 ||
      player_name.trim().length > MAX_NAME_LENGTH
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid player name. Must be 1-30 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate score
    if (typeof score !== "number" || !Number.isInteger(score) || score <= 0 || score > MAX_SCORE) {
      return new Response(
        JSON.stringify({ error: `Invalid score. Must be 1-${MAX_SCORE}.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate level_reached
    if (
      typeof level_reached !== "number" ||
      !Number.isInteger(level_reached) ||
      level_reached < 1 ||
      level_reached > MAX_LEVEL
    ) {
      return new Response(
        JSON.stringify({ error: `Invalid level. Must be 1-${MAX_LEVEL}.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize player name - strip HTML tags
    const sanitizedName = player_name.trim().replace(/<[^>]*>/g, "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("leaderboard").insert({
      player_name: sanitizedName,
      score,
      level_reached,
    });

    if (error) {
      console.error("Insert error:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to submit score." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
