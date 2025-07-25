import mongoose from 'mongoose';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import Property from '../models/Property';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const THUMBS_DIR = path.join(UPLOADS_DIR, 'thumbs');

if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });

const makeThumb = async (origPath: string) => {
  const ext = path.extname(origPath);
  const base = path.basename(origPath, ext);
  const thumbPath = path.join(THUMBS_DIR, `${base}_thumb${ext}`);
  if (!fs.existsSync(thumbPath)) {
    await sharp(origPath)
      .resize(300, 300, { fit: 'inside' })
      .toFile(thumbPath);
    console.log('Created thumbnail:', thumbPath);
  }
  return `uploads/thumbs/${base}_thumb${ext}`;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || '', {});
  const properties = await Property.find();
  for (const property of properties) {
    let updated = false;
    // Profile pic
    if ((property as any).profilePic && !(property as any).profilePicThumb) {
      const origPath = path.join(UPLOADS_DIR, path.basename((property as any).profilePic));
      if (fs.existsSync(origPath)) {
        const thumbPath = await makeThumb(origPath);
        (property as any).profilePicThumb = thumbPath;
        updated = true;
      }
    }
    // Gallery
    if ((property as any).gallery && (property as any).gallery.length > 0) {
      const galleryThumbs: string[] = [];
      for (const imgPath of (property as any).gallery) {
        const origPath = path.join(UPLOADS_DIR, path.basename(imgPath));
        if (fs.existsSync(origPath)) {
          const thumbPath = await makeThumb(origPath);
          galleryThumbs.push(thumbPath);
        }
      }
      if (galleryThumbs.length > 0) {
        (property as any).galleryThumbs = galleryThumbs;
        updated = true;
      }
    }
    if (updated) {
      await property.save({ validateBeforeSave: false });
      console.log(`Updated property: ${property.name}`);
    }
  }
  await mongoose.disconnect();
  console.log('Thumbnail generation complete.');
};

run().catch(err => {
  console.error('Error generating thumbnails:', err);
  process.exit(1);
});
