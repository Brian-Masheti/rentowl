import fs from 'fs';
import path from 'path';

const dir = path.join(__dirname, '../../uploads/chat');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
