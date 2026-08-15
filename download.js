const fs = require('fs');

async function download(url, filename) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(filename, Buffer.from(buffer));
}

async function main() {
  const raw = fs.readFileSync('routes.json', 'utf8').replace(/^\uFEFF/, '');
  const routes = JSON.parse(raw);
  
  for (const { screenId, route } of routes) {
    console.log('Fetching screen ' + screenId + '...');
    const res = await fetch('https://stitch.googleapis.com/v1/projects/6002827136067044043/screens/' + screenId, {
      headers: {
        'x-goog-api-key': process.env.STITCH_API_KEY || ''
      }
    });
    
    if (res.status !== 200) {
      console.log('Failed to fetch ' + screenId + ': ' + res.status);
      continue;
    }
    
    const data = await res.json();
    const title = (data.title || screenId).replace(/[<>:"/\\|?*]+/g, '_');
    
    if (data.htmlCode && data.htmlCode.downloadUrl) {
      console.log('Downloading HTML for ' + title);
      await download(data.htmlCode.downloadUrl, title + '.html');
    }
    if (data.screenshot && data.screenshot.downloadUrl) {
      console.log('Downloading screenshot for ' + title);
      await download(data.screenshot.downloadUrl, title + '.png');
    }
    if (data.image && data.image.downloadUrl) {
      console.log('Downloading image for ' + title);
      await download(data.image.downloadUrl, title + '.jpeg');
    }
  }
  console.log('Done.');
}
main().catch(console.error);
