import sharp from 'sharp'; import fs from 'fs';
const src='src/portrait-original.jpg', out='dist/assets/img/';
const base=()=>sharp(src).extract({left:12,top:2,width:1006,height:1648});
for (const w of [1006,640]) { await base().resize(w).webp({quality:82}).toFile(`${out}bhoza-portrait-${w}.webp`); }
await base().jpeg({quality:84,mozjpeg:true}).toFile(`${out}bhoza-portrait-1006.jpg`);
// detail: chair + crossed legs
const det=()=>sharp(src).extract({left:12,top:1010,width:1006,height:640});
await det().webp({quality:82}).toFile(`${out}bhoza-detail-1006.webp`); await det().jpeg({quality:84,mozjpeg:true}).toFile(`${out}bhoza-detail-1006.jpg`);
// face crop for about / og
const face=()=>sharp(src).extract({left:330,top:20,width:690,height:860});
await face().webp({quality:84}).toFile(`${out}bhoza-face-690.webp`); await face().jpeg({quality:84,mozjpeg:true}).toFile(`${out}bhoza-face-690.jpg`);
const cp=(a,b)=>fs.copyFileSync(a,b);
cp('node_modules/gsap/dist/gsap.min.js','dist/assets/js/gsap.min.js');
cp('node_modules/gsap/dist/ScrollTrigger.min.js','dist/assets/js/ScrollTrigger.min.js');
cp('node_modules/gsap/dist/SplitText.min.js','dist/assets/js/SplitText.min.js');
cp('node_modules/lenis/dist/lenis.min.js','dist/assets/js/lenis.min.js');
cp('node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2','dist/assets/fonts/bricolage.woff2');
cp('node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2','dist/assets/fonts/dm-mono-400.woff2');
console.log(fs.readdirSync(out).map(f=>f+' '+fs.statSync(out+f).size).join('\n'));
