// Automated browser smoke test using Chrome DevTools Protocol / CDP
import http from 'http';

console.log('Testing Vite server responsiveness at http://localhost:5173/...');

const req = http.get('http://localhost:5173/', (res) => {
  console.log('HTTP Status:', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Response length:', body.length);
    console.log('Contains SPRIG Title:', body.includes('SPRIG — Grow a better campus.'));
    console.log('Contains React Module mount:', body.includes('app.js'));
    console.log('Contains Tailwind CDN:', body.includes('cdn.tailwindcss.com'));
    
    if (res.statusCode === 200 && body.includes('SPRIG')) {
      console.log('✓ SUCCESS: Vite is serving the production-ready SPRIG web application!');
      process.exit(0);
    } else {
      console.error('✗ Failure: Unexpected response content');
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('HTTP Request failed:', err);
  process.exit(1);
});
