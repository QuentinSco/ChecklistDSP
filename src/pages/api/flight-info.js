export async function POST({ request }) {
  try {
  const body = await request.json();
  const flight = body.flight?.toUpperCase(); // ex: "AF1342"
  const date = body.date; // ex: "2025-12-22"
  
  
  if (!flight || !date) {
  return new Response(JSON.stringify({ error: 'Missing flight or date' }), {
  status: 400,
  headers: { 'Content-Type': 'application/json' },
  });
  }
  
  
  // Conformément à RapidAPI:
  // GET https://aerodatabox.p.rapidapi.com/flights/number/AF1342/2025-12-22?...
  const path = `/flights/number/${encodeURIComponent(flight)}/${date}` +
  `?withAircraftImage=false&withLocation=false&dateLocalRole=Both`;
  
  
  const url = `https://aerodatabox.p.rapidapi.com${path}`;
  console.log('AeroDataBox URL:', url);
  
  
  const resp = await fetch(url, {
  method: 'GET',
  headers: {
  'x-rapidapi-key': '3279e3054fmshd47986c09113a18p18fea8jsn093497e1e558',
  'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
  },
  });
  
  
  const text = await resp.text();

  if (!resp.ok) {
    console.error('AeroDataBox error', resp.status, text);
    return new Response(
      JSON.stringify({ error: 'Upstream error', status: resp.status, body: text }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const data = JSON.parse(text);
  console.log('AeroDataBox raw data:', data);
  
  const item = data[0];
  
  if (!item) {
    return new Response(JSON.stringify({ error: 'No flight found', raw: data }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  
  const dep = item.departure?.airport;
  const arr = item.arrival?.airport;
  
  const depSch = item.departure?.scheduledTime?.local || item.departure?.scheduledTime?.utc;
  const depEst = item.departure?.revisedTime?.local || item.departure?.revisedTime?.utc;
  const arrSch = item.arrival?.scheduledTime?.local || item.arrival?.scheduledTime?.utc;
  const arrEst =
    item.arrival?.revisedTime?.local  || item.arrival?.revisedTime?.utc ||
    item.arrival?.predictedTime?.local || item.arrival?.predictedTime?.utc;
  
  return new Response(
    JSON.stringify({
      originIcao: dep?.icao || null,
      destIcao:   arr?.icao || null,
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
  console.error('flight-info error', e);
  return new Response(JSON.stringify({ error: e.message }), {
  status: 500,
  headers: { 'Content-Type': 'application/json' },
  });
  }
  }