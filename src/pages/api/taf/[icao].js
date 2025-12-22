export const prerender = false;

export async function GET({ params }) {
  const { icao } = params;

  try {
    const url = `https://aviationweather.gov/api/data/taf?ids=${icao}&format=json`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'dsp-checklist-app/0.1 (contact: you@example.com)',
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: 'Upstream error', status: resp.status, body: text }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json(); // tableau de TAFs

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
