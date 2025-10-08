const fetch = require('node-fetch');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

(async () => {
  try {
    const payload = 'event:1|title:Test Event|tickets:2|email:client@example.com|ts:' + Date.now();
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(payload);
    console.log('QR URL:', qrUrl);
    const res = await fetch(qrUrl);
    if (!res.ok) throw new Error('QR fetch failed ' + res.status);
    const imgBuffer = await res.buffer();

    // create canvas and draw
    const canvas = createCanvas(800, 420);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,800,420);
    const img = await loadImage(imgBuffer);
    ctx.drawImage(img, 520, 100, 260, 260);
    const dataUrl = canvas.toDataURL();

    // POST to server
    const postRes = await fetch('http://localhost:3000/api/send-ticket', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email: 'client@example.com', subject: 'E2E Test Ticket', text: 'Hello from e2e', ticketDataUrl: dataUrl, qrUrl })
    });
    const body = await postRes.text();
    console.log('POST status', postRes.status, body);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
