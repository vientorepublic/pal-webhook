# 국회 입법예고 알리미

[pal-crawl](https://github.com/vientorepublic/pal-crawl) 기반의 국회 입법예고 디스코드 웹훅 알리미

## How to use

- Clone this repository

```
git clone https://github.com/vientorepublic/pal-crawl.git
```

- Install dependencies

```
npm install
```

- Create `.env` file

```
WEBHOOK_URL=
AVATAR_URL=
CRON_EXPRESSION=
CRON_TIMEZONE=
```

환경변수 `WEBHOOK_URL` 값은 필수입니다.

`CRON_EXPRESSION` 기본값: `*/10 * * * *`

`CRON_TIMEZONE` 기본값: `Asia/Seoul`

- Build

```
npm run build
```

- Start

```
npm run start
```

or

```
node dist/index.js
```

## License

MIT
