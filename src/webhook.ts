import { PalCrawl, type ITableData } from 'pal-crawl/dist/pal';
import { MessageBuilder, Webhook } from 'discord-webhook-node';
import NodeCache from 'node-cache';
import { CronJob } from 'cron';
import { Log } from './log';
import * as fs from 'fs';

const avatar = process.env.AVATAR_URL;
const cronExpression = process.env.CRON_EXPRESSION || '*/10 * * * *';
const cronTimezone = process.env.CRON_TIMEZONE || 'Asia/Seoul';

export class PalWebhook {
  private cache: NodeCache;
  private cronjob: CronJob | null = null;
  private webhook: Webhook | null = null;
  private logger: Log;

  constructor(public path: string) {
    this.logger = new Log();
    this.cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
  }

  private async readFileArray(filePath: string): Promise<string[]> {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return data.split('\n').filter((line) => line.trim() !== '');
  }

  private async initCache(): Promise<void> {
    const data = await this.getPalTable();
    this.cache.set('palTable', data);
    this.logger.success('Table cache initialized!');
  }

  private initWebhook(url: string): void {
    this.webhook = new Webhook(url);
    this.webhook.setUsername('국회 입법예고 알리미');
    if (avatar) {
      this.webhook.setAvatar(avatar);
    }
  }

  private async getPalTable(): Promise<ITableData[]> {
    const palCrawl = new PalCrawl();
    return palCrawl.get();
  }

  private findNewEntries(
    oldTable: ITableData[],
    newTable: ITableData[],
  ): number[] {
    const oldSubjects = oldTable.map((item) => item.subject);
    const newSubjects = newTable.map((item) => item.subject);

    // old와 new의 subject 집합이 완전히 같고, 순서만 바뀐 경우는 변경 없음으로 간주
    const oldSet = new Set(oldSubjects);
    const newSet = new Set(newSubjects);
    if (
      oldSet.size === newSet.size &&
      [...oldSet].every((subject) => newSet.has(subject))
    ) {
      return [];
    }

    // newTable에만 존재하는 subject의 인덱스 반환
    return newTable
      .map((item, index) => (!oldSet.has(item.subject) ? index : -1))
      .filter((index) => index !== -1);
  }

  private async sendNotifications(
    newIndices: number[],
    table: ITableData[],
    hooks: string[],
  ): Promise<void> {
    for (const index of newIndices) {
      const entry = table[index];
      const embed = new MessageBuilder()
        .setTitle('국회 입법예고 알림')
        .setDescription(
          '새로운 입법예고가 감지되었습니다. 아래 정보를 확인하세요.',
        )
        .addField('법률안명', entry.subject)
        .addField('제안자 구분', entry.proposerCategory)
        .addField('소관위원회', entry.committee)
        .addField('자세히 보기', entry.link)
        .setColor(3144152)
        .setTimestamp();

      for (const url of hooks) {
        this.initWebhook(url);
        if (this.webhook) {
          await this.webhook.send(embed);
        }
      }
    }
  }

  public async start(): Promise<void> {
    await this.initCache();

    this.cronjob = new CronJob(
      cronExpression,
      async () => {
        try {
          const newTable = await this.getPalTable();
          const oldTable = this.cache.get<ITableData[]>('palTable') || [];
          const newIndices = this.findNewEntries(oldTable, newTable);

          if (newIndices.length > 0) {
            this.logger.info(`New data found: ${newIndices.length}`);
            const hooks = await this.readFileArray(this.path);
            await this.sendNotifications(newIndices, newTable, hooks);
          }

          this.cache.set('palTable', newTable);
        } catch (error) {
          this.logger.error(error);
        }
      },
      null,
      false,
      cronTimezone,
    );

    this.cronjob.start();
  }

  public stop(): void {
    if (this.cronjob) {
      this.cronjob.stop();
    }
  }
}
