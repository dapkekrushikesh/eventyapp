(async () => {
  const base = 'http://localhost:5000/api';
  const ts = Date.now();
  const email = `resettest+${ts}@example.com`;

  // register user
  const regRes = await fetch(base + '/auth/register', { method: 'POST', headers: { 'Content-Type':'application/json'}, body: JSON.stringify({ name:'Reset Tester', email, password:'Password123!'}) }).catch(e=>({error:e}));
  if (regRes.error) return console.error('Register failed', regRes.error);
  const reg = await regRes.json();
  console.log('Registered, token:', reg.token && reg.token.slice(0,20)+'...');

  // request forgot-password
  // We will not actually receive the email; instead we call the controller endpoint and then query the user to get the token from DB.
  const forgotRes = await fetch(base + '/auth/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email })});
  console.log('Forgot password status', forgotRes.status);

  // small delay
  await new Promise(r=>setTimeout(r,500));

  // fetch user to get token
  const userFetch = await fetch(base.replace('/api','') + '/__debug_user?email=' + encodeURIComponent(email)).catch(()=>null);
  if (!userFetch) return console.log('Could not read debug user (debug endpoint missing) - please check email or DB directly to get token');
  const userData = await userFetch.json();
  console.log('User debug:', userData);

})();
