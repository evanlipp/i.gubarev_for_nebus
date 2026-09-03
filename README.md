# Заметки

SPA для заметок и списков задач на Nuxt 4.

## Запуск

```bash
git clone https://github.com/evanlipp/i.gubarev_for_nebus.git
cd i.gubarev_for_nebus
docker compose up -d --build
```

Приложение будет доступно по адресу [http://localhost:3001](http://localhost:3001).

Остановить контейнер:

```bash
docker compose down
```

Поддерживается и команда из ТЗ: `docker-compose up`.

Если после изменения зависимостей контейнер сообщает, что модуль не найден, удалите
кэшированный Docker-том зависимостей и запустите проект заново:

```bash
docker compose down -v
docker compose up --build
```

Исходный код при этом не удаляется.
