const DIFY_API_BASE = 'https://api.dify.ai/v1';
const DIFY_API_KEY = 'app-EAkgOfSWofb7Z4TRQQQsZJNT';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { path, method, query, user, inputs, response_mode, conversation_id, files } = body;

    const targetUrl = `${DIFY_API_BASE}${path || '/chat-messages'}`;
    const reqMethod = method || 'POST';

    const headers = {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const payload = {};
    if (query) payload.query = query;
    if (inputs) payload.inputs = inputs;
    if (user) payload.user = user;
    if (response_mode) payload.response_mode = response_mode;
    if (conversation_id) payload.conversation_id = conversation_id;
    if (files) payload.files = files;

    const resp = await fetch(targetUrl, {
      method: reqMethod,
      headers,
      body: JSON.stringify(payload),
    });

    const contentType = resp.headers.get('content-type') || '';

    if (contentType.includes('text/event-stream')) {
      // Stream SSE responses
      return new Response(resp.body, {
        status: resp.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
