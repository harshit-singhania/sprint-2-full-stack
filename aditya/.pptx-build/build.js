const pptxgen = require('pptxgenjs');
const path = require('path');
const html2pptx = require(path.join(process.env.SKILL_DIR, 'scripts', 'html2pptx.js'));

(async () => {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Team RentalSphere';
  pptx.title = 'RentalSphere — Vehicle Rental Management System';

  for (let i = 1; i <= 6; i++) {
    await html2pptx(path.join(__dirname, `slide${i}.html`), pptx);
    console.log(`slide${i} ok`);
  }

  const out = path.join(__dirname, '..', 'RentalSphere-Showcase.pptx');
  await pptx.writeFile({ fileName: out });
  console.log('WROTE ' + out);
})().catch(e => { console.error(e); process.exit(1); });
