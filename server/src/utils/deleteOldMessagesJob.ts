import cron from 'node-cron';
import Message from '../models/Message';
import fs from 'fs';
import path from 'path';

// Delete messages and attachments older than 30 days
dateCleanup();
cron.schedule('0 3 * * *', dateCleanup); // Run daily at 3am

async function dateCleanup() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oldMessages = await Message.find({ createdAt: { $lt: cutoff } });
  for (const msg of oldMessages) {
    if (msg.attachment) {
      const filePath = path.join(__dirname, '../../', msg.attachment);
      fs.unlink(filePath, (err) => {}); // Delete file if exists
    }
    await msg.deleteOne();
  }
  if (oldMessages.length > 0) {
    console.log(`Deleted ${oldMessages.length} old chat messages and attachments.`);
  }
}
