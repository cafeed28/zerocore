# ZeroCore
Geometry Dash server emulator on NodeJS and MongoDB

# Roadmap
 - 🔴 - работа не начата
- 🟡 - работа в процессе
 - 🟢 - работа завершена
 
## Прогресс - 76%
## Пунктов - 17


 ### Аккаунты и пользователи
 - регистрация и вход - 🟢
 - открытие профиля - 🟢
 - посты на странице - 🟢
 - добавление, удаление из друзей и чс - 🟢
 - почта - 🟢
 - сейвы - 🟢
 - лайки - 🟢
 - топ игроков - 🔴

 ### Уровни
 - аплоад, скачивание и удаление уровней - 🟢
 - рейт уровней - 🟡
 - комменты уровней - 🟢
 - команды в комментах - 🟢
 - лайки - 🟢

 ### Дополнительно
 - маппаки и гаунтлеты - 🔴
 - дейли и викли - 🟡
 - дейли ревардс - 🔴
 - вебхук для дискорда - 🟢

 # Настройка и запуск 
 1. Создать коллекцию командой `db.createCollection('zerocore')`

 2. Создать пользователя командой `db.createUser({ user: 'zerocore', pwd: 'password', roles: [{ role: 'readWrite', db: 'zerocore' }] })`

 3. Переименновать `config.default.ts` в `config.ts` и настроить его (там всё понятно и прокомментированно)

 4. Установить все пакеты командой `npm install`

 5. Запустить командой `npm run start`