import 'dotenv/config';
import { PalWebhook } from './webhook';
import { join } from 'path';

const path = join(__dirname, '..', 'hook.txt');

const palWebhook = new PalWebhook(path);
palWebhook.start();
