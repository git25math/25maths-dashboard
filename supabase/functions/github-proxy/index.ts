import { corsHeaders } from '../_shared/cors.ts';

const OWNER = 'git25math';
const REPO = '25maths-dashboard';
const WORKFLOW_FILE = 'self-evolve.yml';
const GH_API = 'https://api.github.com';

function ghHeaders(pat: string) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${pat}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const pat = Deno.env.get('GITHUB_PAT');
    if (!pat) {
      return new Response(
        JSON.stringify({ error: 'GITHUB_PAT not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { action, ...params } = await req.json();

    let ghRes: Response;

    switch (action) {
      case 'triggerWorkflow': {
        const { instruction, provider, apiKeySlot } = params;
        ghRes = await fetch(
          `${GH_API}/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
          {
            method: 'POST',
            headers: ghHeaders(pat),
            body: JSON.stringify({
              ref: 'main',
              inputs: { instruction, provider, api_key_slot: apiKeySlot ?? 'auto' },
            }),
          },
        );
        // GitHub returns 204 on success
        if (ghRes.status === 204) {
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;
      }

      case 'listRuns': {
        const perPage = params.perPage ?? 15;
        ghRes = await fetch(
          `${GH_API}/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=${perPage}`,
          { headers: ghHeaders(pat) },
        );
        break;
      }

      case 'getRun': {
        const { runId } = params;
        ghRes = await fetch(
          `${GH_API}/repos/${OWNER}/${REPO}/actions/runs/${runId}`,
          { headers: ghHeaders(pat) },
        );
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
    }

    const body = await ghRes.text();
    return new Response(body, {
      status: ghRes.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
