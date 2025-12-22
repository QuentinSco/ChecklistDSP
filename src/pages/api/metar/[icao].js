export const prerender = false;

export async function GET({ params }) {
  const { icao } = params;

  try {
    const url = `https://aviationweather.gov/api/data/metar?ids=${icao}&format=json`;
    console.log('Calling METAR URL:', url);

    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'dsp-checklist-app/0.1 (contact: you@example.com)',
      },
    });

    const text = await resp.text();

    if (!resp.ok) {
      return new Response(
        JSON.stringify({
          error: 'Upstream error',
          status: resp.status,
          body: text,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = JSON.parse(text);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('METAR endpoint error:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
