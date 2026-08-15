async function main() {
  const res = await fetch('https://stitch.googleapis.com/v1/projects/6002827136067044043/screens/aa2948d9dd3f48faa41213db2fd7922e', {
    headers: {
      'x-goog-api-key': process.env.STITCH_API_KEY || ''
    }
  });
  const data = await res.text();
  console.log(res.status);
  console.log(data);
}
main();
