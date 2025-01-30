declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WEBHOOK_URL: string;
      AVATAR_URL: string;
      CRON_EXPRESSION: string;
      CRON_TIMEZONE: string;
    }
  }
}

export {};
