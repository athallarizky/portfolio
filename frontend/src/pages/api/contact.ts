import type { APIRoute } from 'astro';

const API = 'http://localhost:3000/api';

export const POST: APIRoute = async ({ request }) => {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, message } = body;
  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: name, email, message' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const res = await fetch(`${API}/contact-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Backend rejected the submission' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify({ ok: true, id: data.doc?.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Unable to reach the backend' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
