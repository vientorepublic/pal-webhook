import { PalCrawl, type ITableData } from 'pal-crawl/dist/pal';
import { MessageBuilder, Webhook } from 'discord-webhook-node';
import NodeCache from 'node-cache';
import { CronJob } from 'cron';
import { Log } from './log';

const avatar = process.env.AVATAR_URL;
const cronExpression = process.env.CRON_EXPRESSION || '*/10 * * * *';
const cronTimezone = process.env.CRON_TIMEZONE || 'Asia/Seoul';

export class PalWebhook {
  public url: string;
  private cache: NodeCache;
  private webhook: Webhook;
  private logger: Log;
  constructor(url: string) {
    this.url = url;
    this.logger = new Log();
    this.cache = new NodeCache({
      stdTTL: 0,
      checkperiod: 0,
    });
    // init table cache
    this.getPalTable()
      .then((e) => {
        this.cache.set('palTable', e);
        this.logger.success('Table cache initalized!');
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  private initHook(): void {
    this.webhook = new Webhook(this.url);
    if (typeof avatar === 'string') {
      this.webhook.setAvatar(avatar);
    }
    this.webhook.setUsername('국회 입법예고 알리미');
  }

  private async getPalTable(): Promise<ITableData[]> {
    const palCrawl = new PalCrawl();
    const table = await palCrawl.get();
    return table;
  }

  private compareTable(arr1: ITableData[], arr2: ITableData[]): number[] {
    const addedIndices: number[] = [];
    arr2.forEach((item2, index2) => {
      const found = arr1.some((item1) => item1.num === item2.num);
      if (!found) {
        addedIndices.push(index2);
      }
    });
    return addedIndices;
  }

  public setCronjob(): void {
    const cron = new CronJob(
      cronExpression,
      async () => {
        try {
          const table = await this.getPalTable();
          const cache = this.cache.get<ITableData[]>('palTable');
          const compare = this.compareTable(table, cache);
          if (compare.length !== 0) {
            this.logger.info(`New data found: ${compare.length}`);
            compare.map((i) => {
              const embed = new MessageBuilder()
                .setTitle('국회 입법예고 알림')
                .setDescription(
                  '새로운 입법예고가 감지되었습니다. 아래 정보를 확인하세요.',
                )
                .addField('법률안명', table[i].subject)
                .addField('제안자 구분', table[i].proposerCategory)
                .addField('소관위원회', table[i].committee)
                .addField('자세히 보기', table[i].link)
                .setColor(3144152)
                .setTimestamp();
              this.initHook();
              this.webhook.send(embed);
            });
          }
          this.cache.set('palTable', table);
        } catch (err) {
          this.logger.error(err);
        }
      },
      null,
      null,
      cronTimezone,
    );
    cron.start();
  }
}
