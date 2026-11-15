const http = require('http');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Find all src and href
const regex = /(?:src|href)=["']([^"']+)["']/g;
const urls = new Set();
let match;
while ((match = regex.exec(html)) !== null) {
  const u = match[1];
  if (!u.startsWith('http') && !u.startsWith('#') && !u.startsWith('data:') && !u.startsWith('mailto:')) {
    urls.add(u);
  }
}

console.log('Validating ' + urls.size + ' local assets referenced in index.html:');

let pending = urls.size;
let failed = 0;

urls.forEach(u => {
  const cleanPath = u.replace(/^\.\//, '').split('?')[0];
  const reqUrl = 'http://localhost:8088/' + cleanPath;
  http.get(reqUrl, res => {
    if (res.statusCode !== 200) {
      console.error('❌ FAIL (' + res.statusCode + '): ' + u);
      failed++;
    } else {
      console.log('✅ OK (200): ' + u + ' [' + res.headers['content-type'] + ']');
    }
    pending--;
    if (pending === 0) {
      console.log('----------------------------------------');
      console.log('Resumen de verificación: ' + (failed === 0 ? 'TODOS LOS RECURSOS EXISTEN Y CARGAN AL 100%' : 'Fallos: ' + failed));
      process.exit(failed > 0 ? 1 : 0);
    }
  }).on('error', err => {
    console.error('❌ ERROR de red:', u, err.message);
    failed++;
    pending--;
    if (pending === 0) process.exit(1);
  });
});
