export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const flight = body.flight?.toUpperCase();  // ex: "AF822"
    const date   = body.date;                   // ex: "2025-12-22"

    if (!flight || !date) {
      return new Response(JSON.stringify({ error: 'Missing flight or date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const searchBy = 'flightNumber'; // voir doc AeroDataBox
    const path = `/flights/${encodeURIComponent(searchBy)}/${encodeURIComponent(
      flight
    )}/${date}?withAircraftImage=false&withLocation=false&dateLocalRole=Both`;

    const url = `https://aerodatabox.p.rapidapi.com${path}`;

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '3279e3054fmshd47986c09113a18p18fea8jsn093497e1e558',          // clé en variable d'env Vercel
        'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(
        JSON.stringify({ error: 'Upstream error', status: resp.status, body: text }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await resp.json();
    const item = data.flights?.[0] || data[0]; // selon la forme exacte de la réponse

    if (!item) {
      return new Response(JSON.stringify({ error: 'No flight found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dep = item.departure?.airport;
    const arr = item.arrival?.airport;

    const depSch = item.departure?.scheduledTimeLocal || item.departure?.scheduledTimeUtc;
    const depEst = item.departure?.estimatedTimeLocal || item.departure?.estimatedTimeUtc;
    const arrSch = item.arrival?.scheduledTimeLocal || item.arrival?.scheduledTimeUtc;
    const arrEst = item.arrival?.estimatedTimeLocal || item.arrival?.estimatedTimeUtc;

    return new Response(
      JSON.stringify({
        originIcao: dep?.icao || null,
        destIcao: arr?.icao || null,
        aircraftType: item.aircraft?.model || '',
        registration: item.aircraft?.registration || '',
        times: {
          depScheduled: depSch,
          depEstimated: depEst,
          arrScheduled: arrSch,
          arrEstimated: arrEst,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
