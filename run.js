const { spawnSync } = require('child_process');
const fs = require('fs');

const raw = fs.readFileSync('routes.json', 'utf8').replace(/^\uFEFF/, '');
const routes = JSON.stringify(JSON.parse(raw));

const res = spawnSync('npx', ['-y', '@_davideast/stitch-mcp@latest', 'site', '--project', '6002827136067044043', '--routes', routes, '--output', './stitch_site'], {
  env: { ...process.env },
  stdio: 'inherit',
  shell: true
});
process.exit(res.status);
