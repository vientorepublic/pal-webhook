import 'dotenv/config';
import { PalWebhook } from './webhook';

const url = process.env.WEBHOOK_URL;

const palWebhook = new PalWebhook(url);
palWebhook.setCronjob();
