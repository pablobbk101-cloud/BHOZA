// Link-preview image: the serif B + gold bar (same mark as the tab icon) centred on charcoal, 1200x630.
import sharp from 'sharp';
const icon = await sharp('src/icons/icon-512.png').resize(520).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#252622' } })
  .composite([{ input: icon, gravity: 'center' }]).jpeg({ quality: 90, mozjpeg: true }).toFile('images/og.jpg');
