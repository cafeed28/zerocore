# ZeroCore
Geometry Dash server emulator on NodeJS and MongoDB

# Setting up and Startup
1. First, setup MongoDB: https://www.digitalocean.com/community/tutorials/how-to-secure-mongodb-on-ubuntu-20-04-ru

2. Create a collection `db.createCollection('zerocore')`

3. Create a user `db.createUser({ user: 'zerocore', pwd: 'password', roles: [{ role: 'readWrite', db: 'zerocore' }] })`

4. Rename `config.default.ts` to `config.ts` and configure it

5. Configure `dailyRewardsConfig.ts`, if need, but better leave default

6. Install all packages `npm install`

7. Create file `index.d.ts` in `node_modules/fancy-console/` with a content:
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

8. Build `npm run build`

9. Run `npm run start`
