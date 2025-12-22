export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const callsign = body.flight?.toUpperCase(); // ex: "AF1342"

    if (!callsign) {
      return new Response(JSON.stringify({ error: 'Missing flight' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = `https://api.adsbdb.com/v0/callsign/${callsign}`;
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

    const data = await resp.json();
    const route = data?.response?.flightroute;

    if (!route) {
      return new Response(JSON.stringify({ error: 'No route found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const origin = route.origin;
    const dest = route.destination;

    return new Response(JSON.stringify({
      originIcao: origin?.icao_code,
      originIata: origin?.iata_code,
      destIcao: dest?.icao_code,
      destIata: dest?.iata_code,
      airline: route.airline?.name,
      callsign: route.callsign,
    }), {
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
