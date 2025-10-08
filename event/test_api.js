(async () => {
  const base = 'http://localhost:5000/api';
  const ts = Date.now();
  const email = `apitest+${ts}@example.com`;

  async function call(path, opts = {}) {
    const res = await fetch(base + path, opts).catch(e => ({ error: e }));
    if (res && res.error) {
      console.error('Network error', res.error);
      process.exit(1);
    }
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data };
  }

  console.log('Registering', email);
  const regBody = { name: 'API Tester', email, password: 'Password123!' };
  const reg = await call('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regBody) });
  console.log('Register status', reg.status);
  console.log('Register response', reg.data);
  if (reg.status !== 200) process.exit(1);

  const token = reg.data.token;
  if (!token) {
    console.error('No token returned; aborting');
    process.exit(1);
  }
  console.log('Token obtained (truncated):', token.slice(0, 20) + '...');

  const hdr = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const eventBody = { title: 'Test Event from script', description: 'Created during automated API test', date: '2025-12-01T18:00:00.000Z', location: 'Online', ticketsAvailable: 10 };

  console.log('Creating event...');
  const create = await call('/events', { method: 'POST', headers: hdr, body: JSON.stringify(eventBody) });
  console.log('Create event status', create.status);
  console.log('Create event response', create.data);
  if (create.status !== 200) process.exit(1);

  console.log('Fetching events...');
  const events = await call('/events');
  console.log('Get events status', events.status);
  if (events.status === 200 && Array.isArray(events.data)) {
    console.log('Events count:', events.data.length);
    console.log('First 5 events (title, id):');
    events.data.slice(0,5).forEach(e => console.log('-', e.title, e._id));
  } else {
    console.log('Events response', events.data);
  }

  console.log('Smoke test completed.');
})();
