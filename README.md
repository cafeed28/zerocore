# ZeroCore
Geometry Dash server emulator on NodeJS and MongoDB

# Настройка и запуск 
1. Для начала необходимо настроить MongoDB, хорошая статья: https://www.digitalocean.com/community/tutorials/how-to-secure-mongodb-on-ubuntu-20-04-ru

2. Создать коллекцию командой `db.createCollection('zerocore')`

3. Создать пользователя командой `db.createUser({ user: 'zerocore', pwd: 'password', roles: [{ role: 'readWrite', db: 'zerocore' }] })`

4. Переименновать `config.default.ts` в `config.ts` и настроить его (там всё понятно и прокомментированно)

5. Настроить `dailyRewardsConfig.ts`, если нужно (там всё понятно и прокомментированно). Советую оставить по умолчанию

6. Установить все пакеты командой `npm install`

7. Создать файл `index.d.ts` в папке `node_modules/fancy-console/` с содержанием:
```ts
export const cmd: Console;
export const clear: string;
export namespace styles {
    const bold: string;
    const italic: string;
    const underline: string;
    const strike: string;
     const inverse: string;
}
export namespace colors {
    const black: string;
    const red: string;
    const yellow: string;
    const green: string;
    const blue: string;
    const purple: string;
    const cyan: string;
    const white: string;
}
export function colorize(message: any, color: any): void;
export function parse(string: any, args?: any): string;
export function format(message: any, args?: any): any;
export function crit(message: any, args?: any): void;
export function error(message: any, args?: any): void;
export function warn(message: any, args?: any): void;
export function info(message: any, args?: any): void;
export function success(message: any, args?: any): void;
export function log(message: any, args?: any): void;
```

8. Собрать командой `npm run build`

9. Запустить командой `npm run start`
