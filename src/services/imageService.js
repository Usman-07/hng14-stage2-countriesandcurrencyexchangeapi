const fs = require('fs');
const path = require('path');
const { createCanvas, registerFont } = require('canvas');

async function generateSummaryImage({ total, top5, timestamp }) {
  const width = 1000;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.font = 'bold 36px Sans';
  ctx.fillStyle = '#111';
  ctx.fillText('Countries Summary', 40, 60);

  ctx.font = '20px Sans';
  ctx.fillText(`Total countries: ${total}`, 40, 110);
  ctx.fillText(`Last refreshed: ${new Date(timestamp).toISOString()}`, 40, 140);

  ctx.font = '22px Sans';
  ctx.fillText('Top 5 countries by estimated GDP', 40, 190);

  ctx.font = '18px Sans';
  top5.forEach((c, i) => {
    const text = `${i + 1}. ${c.name} — ${Number(c.estimated_gdp).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    ctx.fillText(text, 60, 230 + i * 36);
  });

  const dir = path.resolve(process.cwd(), 'cache');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, 'summary.png');
  const out = fs.createWriteStream(outPath);
  const stream = canvas.createPNGStream();
  await new Promise((resolve, reject) => {
    stream.pipe(out);
    out.on('finish', resolve);
    out.on('error', reject);
  });
  return outPath;
}

module.exports = { generateSummaryImage };
