# 국회 입법예고 알리미

[pal-crawl](https://github.com/vientorepublic/pal-crawl) 기반의 국회 입법예고 디스코드 웹훅 알리미

## How to use

- 저장소 클론

```
git clone https://github.com/vientorepublic/pal-crawl.git
```

- 의존성 패키지 설치

```
npm install
```

- `.env` 파일을 만들고 아래 내용 입력

```
WEBHOOK_URL=
AVATAR_URL=
CRON_EXPRESSION=
CRON_TIMEZONE=
```

환경변수 `WEBHOOK_URL` 값은 필수입니다.

`CRON_EXPRESSION` 기본값: `*/10 * * * *`

`CRON_TIMEZONE` 기본값: `Asia/Seoul`

- 빌드

```
npm run build
```

- 시작

```
npm run start
```

또는

```
node dist/index.js
```

## Methods

### start: () => void

테이블 캐시를 초기화하고 새로운 크론잡을 실행합니다.

```javascript
import 'dotenv/config';
import { PalWebhook } from './webhook';

const url = process.env.WEBHOOK_URL;

const palWebhook = new PalWebhook(url);
palWebhook.start();
```

### stop: () => void

실행 중인 크론잡을 종료합니다.

```javascript
import 'dotenv/config';
import { PalWebhook } from './webhook';

const url = process.env.WEBHOOK_URL;

const palWebhook = new PalWebhook(url);
palWebhook.start();

// 예시: 5초(5000ms)후 크론잡 종료
setTimeout(() => {
  palWebhook.stop();
}, 5000);
```

## License

MIT
