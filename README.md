# Заметки

SPA для заметок и списков задач на Nuxt 4.

## Запуск

```bash
git clone https://github.com/evanlipp/i.gubarev_for_nebus.git
cd i.gubarev_for_nebus
docker compose up -d
```

Приложение будет доступно по адресу [http://localhost:3001](http://localhost:3001).

Первый запуск может занять около 30 секунд: Docker устанавливает зависимости.

При запуске без фонового режима (`docker compose up`) дождитесь сообщения Nuxt с
адресом приложения. Не нажимайте `Ctrl+C`: эта комбинация останавливает контейнер.

Остановить контейнер:

```bash
docker compose down
```

## Запуск без Docker

Для разработки:

```bash
npm ci
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3001](http://localhost:3001).

Для production-сборки и её локального запуска:

```bash
npm run build
node .output/server/index.mjs
```

Production-версия по умолчанию будет доступна по адресу [http://localhost:3000](http://localhost:3000).

## Тесты

Установите зависимости и выполните unit-тесты:

```bash
npm ci
npm test
```

Для запуска в режиме наблюдения:

```bash
npm run test:watch
```
